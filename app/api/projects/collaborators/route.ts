import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, isRealSupabaseEnv } from "@/lib/supabase/admin";
import { isSignedContractStatus } from "@/lib/brand-vault";
import {
  getProjectCollaboratorsAndPod,
  isApprovedProjectCollaborator,
} from "@/lib/collaborators";
import { createPeachNotification } from "@/lib/notifications";

function deriveHub(city?: string | null) {
  const c = String(city || "").toLowerCase();
  if (c.includes("atlanta")) return "Atlanta Hub";
  if (c.includes("huntsville")) return "Huntsville Hub";
  if (c.includes("montgomery")) return "Montgomery Hub";
  return "Birmingham Hub";
}

function specialtyMatchScore(specialty: string, creative: any): number {
  const s = specialty.toLowerCase();
  const haystack = [
    creative.primary_specialty || "",
    ...(Array.isArray(creative.secondary_specialties) ? creative.secondary_specialties : []),
    creative.bio || "",
  ]
    .join(" ")
    .toLowerCase();

  if (s.includes("photo") && /(photo|portrait|culinary|tabletop|camera)/.test(haystack)) return 3;
  if (s.includes("web") && /(web|landing|shopify|webflow|ui\/ux|site)/.test(haystack)) return 3;
  if (s.includes("brand") && /(brand|logo|identity|typography)/.test(haystack)) return 3;
  if (s.includes("social") && /(social|carousel|reel|motion)/.test(haystack)) return 3;
  if (s.includes("graphic") && /(graphic|flyer|poster|menu|packaging|print)/.test(haystack)) return 3;
  return 1;
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required." }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: project } = await admin
      .from("projects")
      .select("id,business_id,assigned_creative_id,status")
      .eq("id", projectId)
      .maybeSingle();

    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    const [{ data: profile }, { data: business }, { data: assignedCreative }] = await Promise.all([
      admin.from("profiles").select("role").eq("id", user.id).maybeSingle(),
      admin.from("businesses").select("owner_user_id").eq("id", project.business_id).maybeSingle(),
      project.assigned_creative_id
        ? admin.from("creatives").select("user_id").eq("id", project.assigned_creative_id).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

    const isAdmin = profile?.role === "admin";
    const isBusiness = business?.owner_user_id === user.id;
    const isLeadCreative =
      assignedCreative?.user_id === user.id ||
      (!isRealSupabaseEnv() && user.id === "usr_creative_demo" && !isBusiness);
    const isCollab = await isApprovedProjectCollaborator(admin, projectId, user.id);

    if (!isAdmin && !isBusiness && !isLeadCreative && !isCollab) {
      return NextResponse.json({ error: "Project access denied." }, { status: 403 });
    }

    const { collaborators, podInfo } = await getProjectCollaboratorsAndPod(admin, projectId);

    // Load approved creatives from Supabase for optional selection
    const [{ data: creativeRows }, { data: profileRows }] = await Promise.all([
      admin
        .from("creatives")
        .select("id,user_id,primary_specialty,secondary_specialties,peach_level,city,profile_image_url,bio,reliability_score")
        .eq("application_status", "approved"),
      admin.from("profiles").select("id,full_name,avatar_url"),
    ]);

    const profMap = new Map((profileRows ?? []).map((p: any) => [p.id, p]));
    const activeCollabIds = new Set(
      collaborators
        .filter((c) => c.status === "active" || c.status === "approved_awaiting_signature")
        .map((c) => c.creative_id)
        .filter(Boolean)
    );

    const approvedCreatives = (creativeRows ?? [])
      .filter((c: any) => c.id !== project.assigned_creative_id && !activeCollabIds.has(c.id))
      .map((c: any) => {
        const prof: any = profMap.get(c.user_id);
        return {
          id: c.id,
          user_id: c.user_id,
          name: prof?.full_name || "Peach Creative",
          avatar_url: c.profile_image_url || prof?.avatar_url || null,
          primary_specialty: c.primary_specialty || "Commercial Design",
          secondary_specialties: Array.isArray(c.secondary_specialties) ? c.secondary_specialties : [],
          peach_level: c.peach_level || "Peach Pro",
          hub: deriveHub(c.city),
          reliability_score: Number(c.reliability_score) || 96,
        };
      });

    return NextResponse.json({
      collaborators,
      podInfo,
      approvedCreatives,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load collaborators." }, { status: 500 });
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
    const {
      action,
      projectId,
      collaboratorRequestId,
      specialty,
      suggestedCreativeId,
      coins,
      note,
      reason,
    } = body;

    if (!projectId || !action) {
      return NextResponse.json({ error: "Project ID and action are required." }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: project } = await admin
      .from("projects")
      .select("id,title,business_id,assigned_creative_id,coin_amount,status,due_at")
      .eq("id", projectId)
      .maybeSingle();

    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    const [{ data: business }, { data: profile }, { data: assignedCreative }] = await Promise.all([
      admin.from("businesses").select("id,owner_user_id,name").eq("id", project.business_id).maybeSingle(),
      admin.from("profiles").select("id,full_name,role").eq("id", user.id).maybeSingle(),
      project.assigned_creative_id
        ? admin.from("creatives").select("id,user_id,city").eq("id", project.assigned_creative_id).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

    const isAdmin = profile?.role === "admin";
    const isBusiness = business?.owner_user_id === user.id;
    const isLeadCreative =
      assignedCreative?.user_id === user.id ||
      (!isRealSupabaseEnv() && user.id === "usr_creative_demo" && !isBusiness);

    // -------------------------------------------------------------------------
    // ACTION: REQUEST COLLABORATOR (Lead Creative submits Collaborator Card)
    // -------------------------------------------------------------------------
    if (action === "request") {
      if (!isLeadCreative && !isAdmin) {
        return NextResponse.json(
          { error: "Only the lead creative on this project can invite another Peach creative." },
          { status: 403 }
        );
      }

      if (!isSignedContractStatus(project.status) && !isAdmin) {
        return NextResponse.json(
          { error: "Both parties must sign the initial Design Contract before inviting a collaborator." },
          { status: 409 }
        );
      }

      const cleanSpecialty = String(specialty || "").trim();
      if (!cleanSpecialty) {
        return NextResponse.json({ error: "Please select the needed specialty." }, { status: 400 });
      }

      const parsedCoins = Math.max(1, Math.min(50, Math.round(Number(coins) || 2)));
      const cleanNote = String(note || "").trim().slice(0, 2000) || `Collaborator needed for ${cleanSpecialty}.`;
      const reqId = `collab_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const nowIso = new Date().toISOString();

      let suggestedMeta: {
        id: string;
        name: string;
        avatar: string | null;
        hub: string;
        user_id: string | null;
      } | null = null;

      if (suggestedCreativeId) {
        const { data: scRow } = await admin
          .from("creatives")
          .select("id,user_id,city,profile_image_url")
          .eq("id", suggestedCreativeId)
          .maybeSingle();

        if (scRow) {
          const { data: scProf } = await admin
            .from("profiles")
            .select("full_name,avatar_url")
            .eq("id", scRow.user_id)
            .maybeSingle();
          suggestedMeta = {
            id: scRow.id,
            name: scProf?.full_name || "Peach Specialist",
            avatar: scRow.profile_image_url || scProf?.avatar_url || null,
            hub: deriveHub(scRow.city),
            user_id: scRow.user_id || null,
          };
        }
      }

      await admin.from("audit_log").insert({
        actor_user_id: user.id,
        action: "collaborator_requested",
        entity_type: "project",
        entity_id: projectId,
        metadata: {
          collaborator_request_id: reqId,
          specialty: cleanSpecialty,
          coins: parsedCoins,
          usd_amount: parsedCoins * 50,
          note: cleanNote,
          creative_id: suggestedMeta?.id || null,
          creative_name: suggestedMeta?.name || null,
          creative_avatar: suggestedMeta?.avatar || null,
          creative_hub: suggestedMeta?.hub || null,
          creative_user_id: suggestedMeta?.user_id || null,
          requested_by: user.id,
          requested_by_name: profile?.full_name || "Lead Creative",
          requested_at: nowIso,
        },
      });

      await admin.from("project_messages").insert({
        project_id: projectId,
        sender_user_id: user.id,
        message: `🤝 **Collaborator Invite Request**: ${profile?.full_name || "Your lead creative"} recommended bringing in a **${cleanSpecialty}** specialist${
          suggestedMeta ? ` (${suggestedMeta.name})` : ""
        } for **${parsedCoins} Peach Coin${parsedCoins === 1 ? "" : "s"}** ($${parsedCoins * 50} USD).\n\n*Collaboration Scope:* ${cleanNote}\n\n*Awaiting ${business?.name || "business owner"} approval.*`,
      });

      if (business?.owner_user_id) {
        try {
          await createPeachNotification({
            userId: business.owner_user_id,
            type: "collaborator_requested",
            title: `Collaborator Invite: ${cleanSpecialty} (${parsedCoins} Coins)`,
            body: `${profile?.full_name || "Your lead creative"} requested to bring a ${cleanSpecialty} creative onto "${project.title}" for ${parsedCoins} Coins ($${parsedCoins * 50}). Review and approve inside your Project Portal.`,
            projectId,
          });
        } catch {}
      }

      return NextResponse.json({
        ok: true,
        collaboratorRequestId: reqId,
      });
    }

    // -------------------------------------------------------------------------
    // ACTION: APPROVE & PAY COINS (Business Owner funds escrow & dispatches invite)
    // -------------------------------------------------------------------------
    if (action === "approve") {
      if (!isBusiness && !isAdmin) {
        return NextResponse.json(
          { error: "Only the business owner can approve and pay for a project collaborator." },
          { status: 403 }
        );
      }

      if (!collaboratorRequestId) {
        return NextResponse.json({ error: "Collaborator request ID is required." }, { status: 400 });
      }

      const { collaborators } = await getProjectCollaboratorsAndPod(admin, projectId);
      const targetReq = collaborators.find((c) => c.id === collaboratorRequestId);
      if (!targetReq) {
        return NextResponse.json({ error: "Collaborator request not found." }, { status: 404 });
      }

      if (targetReq.status !== "pending") {
        return NextResponse.json({ error: "This collaborator request has already been processed." }, { status: 409 });
      }

      const costCoins = targetReq.coins;
      const { data: wallet } = await admin
        .from("coin_wallets")
        .select("available_coins,held_coins")
        .eq("business_id", project.business_id)
        .maybeSingle();

      const available = wallet?.available_coins ?? 0;
      if (available < costCoins) {
        return NextResponse.json(
          {
            error: `Insufficient Peach Coins. You have ${available} Coin${available === 1 ? "" : "s"} available, but this collaborator requires ${costCoins} Coins ($${costCoins * 50} USD).`,
            needsTopUp: true,
            requiredCoins: costCoins,
            availableCoins: available,
            shortBy: costCoins - available,
          },
          { status: 400 }
        );
      }

      const nowIso = new Date().toISOString();

      // Deduct coins from available -> held escrow
      await admin
        .from("coin_wallets")
        .update({
          available_coins: available - costCoins,
          held_coins: (wallet?.held_coins ?? 0) + costCoins,
          updated_at: nowIso,
        })
        .eq("business_id", project.business_id);

      await admin.from("coin_ledger").insert({
        business_id: project.business_id,
        project_id: projectId,
        ledger_type: "held",
        coin_delta: -costCoins,
        note: `Escrow hold for approved collaborator (${targetReq.specialty}): ${costCoins} Coins`,
      });

      const updatedProjectCoins = (project.coin_amount || 0) + costCoins;
      await admin
        .from("projects")
        .update({ coin_amount: updatedProjectCoins })
        .eq("id", projectId);

      // Resolve the second creative from Supabase approved creatives
      let resolvedCreative: {
        id: string;
        user_id: string | null;
        name: string;
        avatar: string | null;
        hub: string;
      } | null = null;

      if (targetReq.creative_id) {
        resolvedCreative = {
          id: targetReq.creative_id,
          user_id: targetReq.creative_user_id || null,
          name: targetReq.creative_name || "Peach Specialist",
          avatar: targetReq.creative_avatar || null,
          hub: targetReq.creative_hub || "Birmingham Hub",
        };
      } else {
        const [{ data: candidateCreatives }, { data: candidateProfiles }] = await Promise.all([
          admin
            .from("creatives")
            .select("id,user_id,primary_specialty,secondary_specialties,city,profile_image_url,bio,reliability_score")
            .eq("application_status", "approved"),
          admin.from("profiles").select("id,full_name,avatar_url"),
        ]);

        const profMap = new Map((candidateProfiles ?? []).map((p: any) => [p.id, p]));
        const eligible = (candidateCreatives ?? [])
          .filter((c: any) => c.id !== project.assigned_creative_id)
          .sort(
            (a: any, b: any) =>
              specialtyMatchScore(targetReq.specialty, b) - specialtyMatchScore(targetReq.specialty, a)
          );

        const picked = eligible[0];
        if (picked) {
          const prof: any = profMap.get(picked.user_id);
          resolvedCreative = {
            id: picked.id,
            user_id: picked.user_id || null,
            name: prof?.full_name || "Peach Specialist",
            avatar: picked.profile_image_url || prof?.avatar_url || null,
            hub: deriveHub(picked.city),
          };
        }
      }

      if (resolvedCreative?.id) {
        try {
          await admin.from("project_offers").insert({
            project_id: projectId,
            creative_id: resolvedCreative.id,
            status: "sent",
            payout_cents: Math.round(costCoins * 5000 * 0.75),
            expires_at: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
          });
        } catch {}
      }

      await admin.from("audit_log").insert({
        actor_user_id: user.id,
        action: "collaborator_approved",
        entity_type: "project",
        entity_id: projectId,
        metadata: {
          collaborator_request_id: targetReq.id,
          specialty: targetReq.specialty,
          coins: costCoins,
          creative_id: resolvedCreative?.id || null,
          creative_name: resolvedCreative?.name || "Matched Peach Specialist",
          creative_avatar: resolvedCreative?.avatar || null,
          creative_hub: resolvedCreative?.hub || "Birmingham Hub",
          creative_user_id: resolvedCreative?.user_id || null,
          resolved_at: nowIso,
        },
      });

      await admin.from("project_messages").insert({
        project_id: projectId,
        sender_user_id: user.id,
        message: `**Collaborator Approved**: ${business?.name || "Business Owner"} approved **${costCoins} Peach Coin${costCoins === 1 ? "" : "s"}** ($${costCoins * 50} USD) under Peach Project Protection for **${
          resolvedCreative?.name || "a vetted Peach creative"
        }** (${targetReq.specialty}). Invitation & brief sent — awaiting their signature to unlock Project Room & Brand Vault access.`,
      });

      if (resolvedCreative?.user_id) {
        try {
          await createPeachNotification({
            userId: resolvedCreative.user_id,
            type: "collaborator_invited",
            title: `Collaborator Invite: ${project.title}`,
            body: `You've been invited as a ${targetReq.specialty} collaborator on "${project.title}" (${costCoins} Coins / $${Math.round(costCoins * 50 * 0.75)} payout). Open the Project Portal to review the brief and sign to join!`,
            projectId,
          });
        } catch {}
      }

      if (assignedCreative?.user_id) {
        try {
          await createPeachNotification({
            userId: assignedCreative.user_id,
            type: "collaborator_approved",
            title: `Collaborator Approved: ${targetReq.specialty}`,
            body: `${business?.name || "Your client"} approved and funded ${costCoins} Coins for ${resolvedCreative?.name || "your collaborator"} on "${project.title}".`,
            projectId,
          });
        } catch {}
      }

      return NextResponse.json({
        ok: true,
        availableCoins: available - costCoins,
        newTotalProjectCoins: updatedProjectCoins,
        invitedCreativeName: resolvedCreative?.name || "Peach Specialist",
      });
    }

    // -------------------------------------------------------------------------
    // ACTION: DECLINE REQUEST (Business Owner)
    // -------------------------------------------------------------------------
    if (action === "decline") {
      if (!isBusiness && !isAdmin) {
        return NextResponse.json(
          { error: "Only the business owner can decline collaborator requests." },
          { status: 403 }
        );
      }

      if (!collaboratorRequestId) {
        return NextResponse.json({ error: "Collaborator request ID is required." }, { status: 400 });
      }

      const declineReason = String(reason || "").trim() || "Scope adjustment not needed at this time.";
      const nowIso = new Date().toISOString();

      await admin.from("audit_log").insert({
        actor_user_id: user.id,
        action: "collaborator_declined",
        entity_type: "project",
        entity_id: projectId,
        metadata: {
          collaborator_request_id: collaboratorRequestId,
          decline_reason: declineReason,
          resolved_at: nowIso,
        },
      });

      await admin.from("project_messages").insert({
        project_id: projectId,
        sender_user_id: user.id,
        message: `❌ **Collaborator Invite Declined**: ${business?.name || "Business Owner"} declined the collaborator request. Note: ${declineReason}`,
      });

      if (assignedCreative?.user_id) {
        try {
          await createPeachNotification({
            userId: assignedCreative.user_id,
            type: "collaborator_declined",
            title: `Collaborator Request Declined: ${project.title}`,
            body: `${business?.name || "The client"} declined the collaborator request (${declineReason}).`,
            projectId,
          });
        } catch {}
      }

      return NextResponse.json({ ok: true });
    }

    // -------------------------------------------------------------------------
    // ACTION: ACCEPT CONTRACT (Second Creative signs & joins Project + Brand Vault)
    // -------------------------------------------------------------------------
    if (action === "accept_contract") {
      if (!collaboratorRequestId) {
        return NextResponse.json({ error: "Collaborator request ID is required." }, { status: 400 });
      }

      const { collaborators } = await getProjectCollaboratorsAndPod(admin, projectId);
      const targetReq = collaborators.find((c) => c.id === collaboratorRequestId);
      if (!targetReq) {
        return NextResponse.json({ error: "Collaborator invitation not found." }, { status: 404 });
      }

      const isInvitedCreative =
        targetReq.creative_user_id === user.id ||
        (!isRealSupabaseEnv() && user.id === "usr_creative_demo" && !isBusiness);

      if (!isInvitedCreative && !isAdmin) {
        return NextResponse.json(
          { error: "Only the invited collaborating creative can sign this collaborator agreement." },
          { status: 403 }
        );
      }

      if (targetReq.status === "active") {
        return NextResponse.json({ ok: true, status: "active" });
      }

      if (targetReq.status !== "approved_awaiting_signature") {
        return NextResponse.json(
          { error: "This collaborator invitation is not awaiting signature." },
          { status: 409 }
        );
      }

      const nowIso = new Date().toISOString();

      await admin.from("audit_log").insert({
        actor_user_id: user.id,
        action: "collaborator_contract_signed",
        entity_type: "project",
        entity_id: projectId,
        metadata: {
          collaborator_request_id: targetReq.id,
          creative_id: targetReq.creative_id,
          creative_name: targetReq.creative_name,
          signed_at: nowIso,
        },
      });

      if (targetReq.creative_id) {
        try {
          await admin
            .from("project_offers")
            .update({ status: "accepted" })
            .eq("project_id", projectId)
            .eq("creative_id", targetReq.creative_id);
        } catch {}
      }

      await admin.from("project_messages").insert({
        project_id: projectId,
        sender_user_id: user.id,
        message: `🎉 **Collaborator Joined Project**: **${targetReq.creative_name || profile?.full_name || "Collaborating Creative"}** (${targetReq.specialty}) signed the collaboration agreement and now has access to the Project Portal and Brand Vault until project completion.`,
      });

      const notifyIds = [business?.owner_user_id, assignedCreative?.user_id].filter(Boolean) as string[];
      for (const uid of notifyIds) {
        try {
          await createPeachNotification({
            userId: uid,
            type: "collaborator_joined",
            title: `${targetReq.creative_name || "Collaborator"} Joined ${project.title}`,
            body: `${targetReq.creative_name || "Your collaborating creative"} signed their ${targetReq.specialty} agreement and is now live in the Project Portal.`,
            projectId,
          });
        } catch {}
      }

      return NextResponse.json({ ok: true, status: "active" });
    }

    // -------------------------------------------------------------------------
    // ACTION: DECLINE CONTRACT (Invited Creative declines -> refunds escrow coins)
    // -------------------------------------------------------------------------
    if (action === "decline_contract") {
      if (!collaboratorRequestId) {
        return NextResponse.json({ error: "Collaborator request ID is required." }, { status: 400 });
      }

      const { collaborators } = await getProjectCollaboratorsAndPod(admin, projectId);
      const targetReq = collaborators.find((c) => c.id === collaboratorRequestId);
      if (!targetReq || targetReq.status !== "approved_awaiting_signature") {
        return NextResponse.json(
          { error: "No pending collaborator invitation found to decline." },
          { status: 404 }
        );
      }

      const isInvitedCreative =
        targetReq.creative_user_id === user.id ||
        (!isRealSupabaseEnv() && user.id === "usr_creative_demo" && !isBusiness);

      if (!isInvitedCreative && !isAdmin) {
        return NextResponse.json(
          { error: "Only the invited collaborating creative can decline this invitation." },
          { status: 403 }
        );
      }

      const nowIso = new Date().toISOString();
      const refundCoins = targetReq.coins;

      const { data: wallet } = await admin
        .from("coin_wallets")
        .select("available_coins,held_coins")
        .eq("business_id", project.business_id)
        .maybeSingle();

      if (wallet) {
        await admin
          .from("coin_wallets")
          .update({
            available_coins: (wallet.available_coins ?? 0) + refundCoins,
            held_coins: Math.max(0, (wallet.held_coins ?? 0) - refundCoins),
            updated_at: nowIso,
          })
          .eq("business_id", project.business_id);

        await admin.from("coin_ledger").insert({
          business_id: project.business_id,
          project_id: projectId,
          ledger_type: "refunded",
          coin_delta: refundCoins,
          note: `Refunded ${refundCoins} Coins: invited ${targetReq.specialty} collaborator declined`,
        });
      }

      await admin
        .from("projects")
        .update({ coin_amount: Math.max(1, (project.coin_amount || refundCoins) - refundCoins) })
        .eq("id", projectId);

      const declineReason = String(reason || "").trim() || "Creative unavailable for this timeline.";

      await admin.from("audit_log").insert({
        actor_user_id: user.id,
        action: "collaborator_contract_declined",
        entity_type: "project",
        entity_id: projectId,
        metadata: {
          collaborator_request_id: targetReq.id,
          decline_reason: declineReason,
          declined_at: nowIso,
          refunded_coins: refundCoins,
        },
      });

      await admin.from("project_messages").insert({
        project_id: projectId,
        sender_user_id: user.id,
        message: `↩️ **Collaborator Invitation Declined**: ${targetReq.creative_name || "Invited creative"} declined (${declineReason}). **${refundCoins} Peach Coin${refundCoins === 1 ? "" : "s"}** have been automatically refunded to ${business?.name || "your"} wallet.`,
      });

      return NextResponse.json({ ok: true, refundedCoins: refundCoins });
    }

    return NextResponse.json({ error: "Invalid collaborator action." }, { status: 400 });
  } catch (err: any) {
    console.error("Project collaborators API error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process collaborator action." },
      { status: 500 }
    );
  }
}
