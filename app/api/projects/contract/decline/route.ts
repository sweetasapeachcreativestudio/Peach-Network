import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, isRealSupabaseEnv } from "@/lib/supabase/admin";
import { createPeachNotification } from "@/lib/notifications";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    }

    const { projectId, reason } = await request.json();
    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required." }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: project } = await admin
      .from("projects")
      .select("id,title,business_id,assigned_creative_id,coin_amount,status")
      .eq("id", projectId)
      .maybeSingle();

    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    const { data: business } = await admin
      .from("businesses")
      .select("id,owner_user_id,name")
      .eq("id", project.business_id)
      .maybeSingle();

    let isAssignedCreative = false;
    if (project.assigned_creative_id) {
      const { data: creativeRow } = await admin
        .from("creatives")
        .select("user_id")
        .eq("id", project.assigned_creative_id)
        .maybeSingle();
      isAssignedCreative = creativeRow?.user_id === user.id;
    }

    if (!isRealSupabaseEnv() && user.id === "usr_creative_demo" && business?.owner_user_id !== user.id) {
      isAssignedCreative = true;
    }

    if (!isAssignedCreative) {
      return NextResponse.json(
        { error: "Only the assigned creative can decline this contract." },
        { status: 403 }
      );
    }

    if (!["draft", "offer_sent", "matching"].includes(project.status)) {
      return NextResponse.json(
        { error: "An already-active or completed contract cannot be declined here." },
        { status: 409 }
      );
    }

    const coinsToRefund = Math.max(0, Number(project.coin_amount) || 0);
    const declineReason = String(reason || "").trim() || "Creative declined the project invitation.";
    const nowIso = new Date().toISOString();

    if (project.assigned_creative_id) {
      await admin
        .from("project_offers")
        .update({ status: "declined" })
        .eq("project_id", projectId)
        .eq("creative_id", project.assigned_creative_id);
    }

    if (coinsToRefund > 0) {
      const { data: wallet } = await admin
        .from("coin_wallets")
        .select("available_coins,held_coins")
        .eq("business_id", project.business_id)
        .maybeSingle();

      if (wallet) {
        const held = Number(wallet.held_coins || 0);
        const releaseAmount = Math.min(held, coinsToRefund);
        await admin
          .from("coin_wallets")
          .update({
            available_coins: Number(wallet.available_coins || 0) + coinsToRefund,
            held_coins: Math.max(0, held - releaseAmount),
            updated_at: nowIso,
          })
          .eq("business_id", project.business_id);

        await admin.from("coin_ledger").insert({
          business_id: project.business_id,
          project_id: projectId,
          ledger_type: "refunded",
          coin_delta: coinsToRefund,
          note: `Escrow refund (${coinsToRefund} Coins) after creative declined "${project.title}"`,
        });
      }
    }

    await admin
      .from("projects")
      .update({
        status: "matching",
        assigned_creative_id: null,
      })
      .eq("id", projectId);

    await admin.from("project_messages").insert({
      project_id: projectId,
      sender_user_id: user.id,
      message: `↩️ **Contract Declined**: The creative declined this project (${declineReason}). Your ${coinsToRefund} Peach Coins have been automatically refunded to your wallet so you can choose another creative.`,
    });

    await admin.from("audit_log").insert({
      actor_user_id: user.id,
      action: "contract_declined_by_creative",
      entity_type: "project",
      entity_id: projectId,
      metadata: {
        reason: declineReason,
        refunded_coins: coinsToRefund,
        declined_at: nowIso,
      },
    });

    if (business?.owner_user_id) {
      try {
        await createPeachNotification({
          userId: business.owner_user_id,
          type: "contract_declined",
          title: `Creative Declined — Coins Refunded`,
          body: `The creative declined "${project.title}". Your ${coinsToRefund} Peach Coins have been returned to your wallet so you can pick another creative.`,
          projectId,
        });
      } catch {}
    }

    return NextResponse.json({
      ok: true,
      status: "matching",
      refundedCoins: coinsToRefund,
    });
  } catch (err: any) {
    console.error("Contract decline error:", err);
    return NextResponse.json({ error: err.message || "Failed to decline contract." }, { status: 500 });
  }
}
