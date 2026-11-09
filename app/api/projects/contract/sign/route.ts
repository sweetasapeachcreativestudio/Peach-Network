import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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
      .select("id,title,category,coin_amount,status,description,assigned_creative_id")
      .eq("id", projectId)
      .single();

    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    // Check project contract audit/signatures or message history
    const { data: logs } = await admin
      .from("audit_log")
      .select("action,metadata,created_at")
      .eq("entity_id", projectId)
      .in("action", ["contract_signed_client", "contract_signed_creative"]);

    let clientSignature: any = null;
    let creativeSignature: any = null;

    for (const log of logs ?? []) {
      if (log.action === "contract_signed_client") {
        clientSignature = {
          name: log.metadata?.signer_name || "Business Owner",
          signedAt: log.metadata?.signed_at || log.created_at,
          role: "Client",
        };
      }
      if (log.action === "contract_signed_creative") {
        creativeSignature = {
          name: log.metadata?.signer_name || "Designer",
          signedAt: log.metadata?.signed_at || log.created_at,
          role: "Creative Designer",
        };
      }
    }

    const bothSigned = Boolean(clientSignature && creativeSignature);

    return NextResponse.json({
      projectId,
      bothSigned,
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    }

    const body = await request.json();
    const { projectId, signerName, signerRole, signatureData } = body;
    // signerRole: "business" | "creative"

    if (!projectId || !signerRole) {
      return NextResponse.json({ error: "Project ID and signer role are required." }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: project } = await admin
      .from("projects")
      .select("id,title,category,coin_amount,status,business_id,assigned_creative_id")
      .eq("id", projectId)
      .single();

    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    const { data: profile } = await admin
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle();

    const verifiedName = signerName?.trim() || profile?.full_name || (signerRole === "business" ? "Business Owner" : "Peach Creative");
    const nowIso = new Date().toISOString();

    // Log this signature into audit log
    const auditAction = signerRole === "business" ? "contract_signed_client" : "contract_signed_creative";

    await admin.from("audit_log").insert({
      actor_user_id: user.id,
      action: auditAction,
      entity_type: "project",
      entity_id: projectId,
      metadata: {
        signer_name: verifiedName,
        signer_role: signerRole,
        signed_at: nowIso,
        signature_data: signatureData || "Digital Verification via Peach Secure Auth",
      },
    });

    // Post signing announcement to message thread
    await admin.from("project_messages").insert({
      project_id: projectId,
      sender_user_id: user.id,
      message: `✍️ **Digital Signature Recorded**: ${verifiedName} (${signerRole === "business" ? "Client" : "Designer"}) has digitally signed and approved the Creative Brief & Contract at ${new Date().toLocaleTimeString()} CT.`,
    });

    // Check if the other party has also signed
    const otherAction = signerRole === "business" ? "contract_signed_creative" : "contract_signed_client";
    const { data: otherLogs } = await admin
      .from("audit_log")
      .select("action,metadata,created_at")
      .eq("entity_id", projectId)
      .eq("action", otherAction);

    const hasOtherSigned = (otherLogs ?? []).length > 0;
    const bothSigned = hasOtherSigned;

    if (bothSigned) {
      // Transition project to in_progress
      await admin.from("projects").update({
        status: "in_progress",
      }).eq("id", projectId);

      // Update offer
      await admin.from("project_offers").update({
        status: "accepted",
        accepted_at: nowIso,
      }).eq("project_id", projectId);

      // Cute celebration message posted to board
      const celebrationMsg = "🎉 You're Officially Paired! Contract Signed & Milestones Activated! Let the creative magic begin! 🍑";

      await admin.from("project_messages").insert({
        project_id: projectId,
        sender_user_id: user.id,
        message: celebrationMsg,
      });

      await admin.from("audit_log").insert({
        actor_user_id: user.id,
        action: "project_milestones_activated_dual_signatures",
        entity_type: "project",
        entity_id: projectId,
        metadata: {
          celebration: true,
          status: "in_progress",
        },
      });
    }

    return NextResponse.json({
      ok: true,
      bothSigned,
      signerRole,
      signedName: verifiedName,
      signedAt: nowIso,
      status: bothSigned ? "in_progress" : project.status,
    });
  } catch (err: any) {
    console.error("Contract sign error:", err);
    return NextResponse.json({ error: err.message || "Failed to sign contract." }, { status: 500 });
  }
}
