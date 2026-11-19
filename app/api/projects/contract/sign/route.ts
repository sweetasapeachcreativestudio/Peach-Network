import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, isRealSupabaseEnv } from "@/lib/supabase/admin";
import { createPeachNotification } from "@/lib/notifications";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required." }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: project } = await admin
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .maybeSingle();

    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    const { data: logs } = await admin
      .from("audit_log")
      .select("action,metadata,created_at")
      .eq("entity_id", projectId)
      .in("action", ["contract_signed_client", "contract_signed_creative"]);

    let clientSignature: any = project.business_signature_name
      ? {
          name: project.business_signature_name,
          signedAt: project.business_signed_at || project.created_at,
          role: "Client",
        }
      : null;

    let creativeSignature: any = project.creative_signature_name
      ? {
          name: project.creative_signature_name,
          signedAt: project.creative_signed_at || project.created_at,
          role: "Creative Designer",
        }
      : null;

    for (const log of logs ?? []) {
      if (log.action === "contract_signed_client") {
        clientSignature = {
          name:
            log.metadata?.business_signature_name ||
            log.metadata?.signer_name ||
            clientSignature?.name ||
            "Business Owner",
          signedAt:
            log.metadata?.business_signed_at ||
            log.metadata?.signed_at ||
            log.created_at,
          role: "Client",
        };
      }
      if (log.action === "contract_signed_creative") {
        creativeSignature = {
          name:
            log.metadata?.creative_signature_name ||
            log.metadata?.signer_name ||
            creativeSignature?.name ||
            "Creative Partner",
          signedAt:
            log.metadata?.creative_signed_at ||
            log.metadata?.signed_at ||
            log.created_at,
          role: "Creative Designer",
        };
      }
    }

    const bothSigned = Boolean(clientSignature && creativeSignature);
    const signatureStatus = bothSigned
      ? "both_signed"
      : clientSignature
      ? "business_signed"
      : creativeSignature
      ? "creative_signed"
      : project.signature_status || "pending";

    return NextResponse.json({
      projectId,
      bothSigned,
      signatureStatus,
      business_signature_name: clientSignature?.name || null,
      business_signed_at: clientSignature?.signedAt || null,
      clientSignature,
      creativeSignature,
      status: project.status,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load contract status." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    }

    const body = await request.json();
    const { projectId, signerName, signerRole, termsAccepted, signatureData } = body as {
      projectId: string;
      signerName?: string;
      signerRole: "business" | "creative";
      termsAccepted?: boolean;
      signatureData?: string;
    };

    if (!projectId || !["business", "creative"].includes(signerRole)) {
      return NextResponse.json({ error: "Project ID and valid signerRole are required." }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: project } = await admin
      .from("projects")
      .select("id,title,category,coin_amount,status,business_id,assigned_creative_id")
      .eq("id", projectId)
      .maybeSingle();

    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    if (project.status === "draft" && signerRole === "creative") {
      return NextResponse.json(
        { error: "Please wait for the Business Owner to finalize the Creative Brief before signing." },
        { status: 409 }
      );
    }

    if (["completed", "cancelled"].includes(project.status)) {
      return NextResponse.json(
        { error: "This project contract is closed." },
        { status: 409 }
      );
    }

    // Strict role authorization check
    const [{ data: business }, { data: profile }] = await Promise.all([
      admin.from("businesses").select("owner_user_id,name").eq("id", project.business_id).maybeSingle(),
      admin.from("profiles").select("full_name,role").eq("id", user.id).maybeSingle(),
    ]);

    const isBusinessOwner = business?.owner_user_id === user.id || profile?.role === "admin";
    let isAssignedCreative = false;
    let creativeUserId: string | null = null;

    if (project.assigned_creative_id) {
      const { data: creativeRow } = await admin
        .from("creatives")
        .select("user_id")
        .eq("id", project.assigned_creative_id)
        .maybeSingle();
      creativeUserId = creativeRow?.user_id || null;
      isAssignedCreative = creativeRow?.user_id === user.id;
    }

    if (!isRealSupabaseEnv() && user.id === "usr_creative_demo" && !isBusinessOwner) {
      isAssignedCreative = true;
    }

    if (signerRole === "business" && !isBusinessOwner) {
      return NextResponse.json(
        { error: "Forbidden: Only the Business Owner can sign the Business Owner signature field." },
        { status: 403 }
      );
    }

    if (signerRole === "creative" && !isAssignedCreative) {
      return NextResponse.json(
        { error: "Forbidden: Only the assigned Creative can sign the Creative signature field." },
        { status: 403 }
      );
    }

    const auditAction = signerRole === "business" ? "contract_signed_client" : "contract_signed_creative";
    const otherAction = signerRole === "business" ? "contract_signed_creative" : "contract_signed_client";

    const { data: existingLogs } = await admin
      .from("audit_log")
      .select("action,metadata,created_at")
      .eq("entity_id", projectId)
      .in("action", ["contract_signed_client", "contract_signed_creative"]);

    const alreadySignedThisSide = (existingLogs ?? []).some((l: any) => l.action === auditAction);
    if (alreadySignedThisSide) {
      return NextResponse.json(
        { error: "Your signature has already been recorded on this contract." },
        { status: 409 }
      );
    }

    const verifiedName =
      signerName?.trim() ||
      profile?.full_name ||
      (signerRole === "business" ? business?.name || "Business Owner" : "Peach Creative");
    const nowIso = new Date().toISOString();

    const hasOtherSigned = (existingLogs ?? []).some((l: any) => l.action === otherAction);
    const bothSigned = hasOtherSigned;
    const newSignatureStatus = bothSigned
      ? "both_signed"
      : signerRole === "business"
      ? "business_signed"
      : "creative_signed";

    const wasDraft = project.status === "draft";
    const nextProjectStatus = bothSigned
      ? "in_progress"
      : wasDraft && signerRole === "business"
      ? "offer_sent"
      : project.status;

    // If business owner signs directly from draft, auto-lock brief & dispatch offer
    if (wasDraft && signerRole === "business") {
      await admin.from("audit_log").insert({
        actor_user_id: user.id,
        action: "project_brief_locked",
        entity_type: "project",
        entity_id: projectId,
        metadata: {
          brief_mode: "own",
          locked_at: nowIso,
          locked_via_contract_sign: true,
        },
      });

      if (project.assigned_creative_id) {
        const { data: existingOffers } = await admin
          .from("project_offers")
          .select("id,status")
          .eq("project_id", projectId)
          .eq("creative_id", project.assigned_creative_id);

        if (!existingOffers || existingOffers.length === 0) {
          await admin.from("project_offers").insert({
            project_id: projectId,
            creative_id: project.assigned_creative_id,
            status: "sent",
            payout_cents: Math.round(project.coin_amount * 5000 * 0.75),
            expires_at: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
          });
        }
      }
    }

    // Save explicit signature columns to projects table (fallback gracefully if migration pending on remote DB)
    const signatureColumnsUpdate: Record<string, any> =
      signerRole === "business"
        ? {
            business_signature_name: verifiedName,
            business_signed_at: nowIso,
            signature_status: newSignatureStatus,
          }
        : {
            creative_signature_name: verifiedName,
            creative_signed_at: nowIso,
            signature_status: newSignatureStatus,
          };

    if (nextProjectStatus !== project.status) {
      signatureColumnsUpdate.status = nextProjectStatus;
    }

    const { error: projUpdateErr } = await admin
      .from("projects")
      .update(signatureColumnsUpdate)
      .eq("id", projectId);

    if (projUpdateErr && nextProjectStatus !== project.status) {
      await admin
        .from("projects")
        .update({ status: nextProjectStatus })
        .eq("id", projectId);
    }

    await admin.from("audit_log").insert({
      actor_user_id: user.id,
      action: auditAction,
      entity_type: "project",
      entity_id: projectId,
      metadata: {
        signer_name: verifiedName,
        signer_role: signerRole,
        signed_at: nowIso,
        terms_accepted: termsAccepted !== false,
        signature_status: newSignatureStatus,
        ...(signerRole === "business"
          ? {
              business_signature_name: verifiedName,
              business_signed_at: nowIso,
            }
          : {
              creative_signature_name: verifiedName,
              creative_signed_at: nowIso,
            }),
        signature_data: signatureData || "Digital Verification via Peach Secure Auth",
      },
    });

    await admin.from("project_messages").insert({
      project_id: projectId,
      sender_user_id: user.id,
      message: `✍️ **Digital Signature Recorded**: ${verifiedName} (${signerRole === "business" ? "Business Owner" : "Creative Partner"}) signed the Design Contract.`,
    });

    if (bothSigned) {
      await admin
        .from("project_offers")
        .update({
          status: "accepted",
          accepted_at: nowIso,
        })
        .eq("project_id", projectId);

      await admin.from("project_messages").insert({
        project_id: projectId,
        sender_user_id: user.id,
        message:
          "🎉 Both parties have signed! Your Active Project Workspace (live chat, file uploads, staging links) and Brand Vault access are now unlocked. Let's create!",
      });

      await admin.from("audit_log").insert({
        actor_user_id: user.id,
        action: "project_milestones_activated_dual_signatures",
        entity_type: "project",
        entity_id: projectId,
        metadata: {
          celebration: true,
          status: "in_progress",
          brand_vault_unlocked: true,
        },
      });

      try {
        if (business?.owner_user_id) {
          await createPeachNotification({
            userId: business.owner_user_id,
            type: "contract_fully_signed",
            title: `Contract Signed! ${project.title} is Active`,
            body: `Your creative signed the Design Contract. Live chat, file uploads, and Brand Vault sharing are now open!`,
            projectId,
          });
        }
        if (creativeUserId) {
          await createPeachNotification({
            userId: creativeUserId,
            type: "contract_fully_signed",
            title: `Contract Active: ${project.title}`,
            body: `Both signatures are complete! Brand Vault assets and the active project workspace are now unlocked.`,
            projectId,
          });
        }
      } catch {}
    } else {
      try {
        const targetUserId = signerRole === "business" ? creativeUserId : business?.owner_user_id;
        if (targetUserId) {
          await createPeachNotification({
            userId: targetUserId,
            type: "contract_awaiting_your_signature",
            title: `Signature Needed: ${project.title}`,
            body:
              signerRole === "business"
                ? `${verifiedName} signed the Design Contract for "${project.title}". Review the Creative Brief and click Sign & Accept (or Decline) to continue.`
                : `${verifiedName} signed the Design Contract for "${project.title}". Add your Business Owner signature to unlock the workspace.`,
            projectId,
          });
        }
      } catch {}
    }

    return NextResponse.json({
      ok: true,
      bothSigned,
      signerRole,
      signedName: verifiedName,
      signedAt: nowIso,
      signature_status: newSignatureStatus,
      ...(signerRole === "business"
        ? {
            business_signature_name: verifiedName,
            business_signed_at: nowIso,
          }
        : {
            creative_signature_name: verifiedName,
            creative_signed_at: nowIso,
          }),
      status: nextProjectStatus,
    });
  } catch (err: any) {
    console.error("Contract sign error:", err);
    return NextResponse.json({ error: err.message || "Failed to sign contract." }, { status: 500 });
  }
}
