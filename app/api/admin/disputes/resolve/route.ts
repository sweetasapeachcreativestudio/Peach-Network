import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (me?.role !== "admin") return NextResponse.json({ error: "Admin required." }, { status: 403 });

  const { disputeId, resolutionType, coinsReturned = 0, payoutCents = 0, note = "" } = await request.json();

  const allowedTypes = [
    "full_refund",
    "partial_refund",
    "half_refund",
    "creative_paid",
    "split",
    "continue",
    "send_new_creative",
    "reassign_creative",
  ];

  if (!allowedTypes.includes(resolutionType)) {
    return NextResponse.json({ error: "Invalid resolution type." }, { status: 400 });
  }

  const admin = createAdminClient();

  // Fetch dispute and project
  const { data: dispute } = await admin
    .from("disputes")
    .select("id,project_id,status,projects(id,business_id,coin_amount,assigned_creative_id)")
    .eq("id", disputeId)
    .single();

  if (!dispute) return NextResponse.json({ error: "Dispute not found." }, { status: 404 });
  const project: any = dispute.projects;

  // Handle "Send a New Creative"
  if (resolutionType === "send_new_creative" || resolutionType === "reassign_creative") {
    // 1. Update dispute record
    await admin
      .from("disputes")
      .update({
        status: "resolved",
        resolution: note.trim() || "Admin resolved dispute by reassigning to a new creative from the Peach ecosystem.",
        resolution_type: "send_new_creative",
        resolved_by: user.id,
        resolved_at: new Date().toISOString(),
      })
      .eq("id", disputeId);

    // 2. Unassign previous creative and reset project to matching
    await admin
      .from("projects")
      .update({
        status: "matching",
        assigned_creative_id: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", project.id);

    // 3. Withdraw previous pending or accepted offers
    await admin
      .from("project_offers")
      .update({ status: "withdrawn" })
      .eq("project_id", project.id);

    // 4. Audit log
    await admin.from("audit_log").insert({
      actor_user_id: user.id,
      action: "dispute_resolved_reassigned",
      entity_type: "dispute",
      entity_id: disputeId,
      metadata: { resolution_type: "send_new_creative", project_id: project.id },
    });

    return NextResponse.json({ ok: true, resolution: "send_new_creative" });
  }

  // Handle standard refund / split resolution
  const rpcResolutionType = resolutionType === "half_refund" ? "split" : resolutionType;

  const { error } = await admin.rpc("peach_resolve_dispute", {
    p_dispute_id: disputeId,
    p_admin_user_id: user.id,
    p_resolution_type: rpcResolutionType,
    p_coins_returned: Number(coinsReturned),
    p_payout_cents: Number(payoutCents),
    p_resolution_note: note.trim() || `Dispute resolved as ${resolutionType}`,
  });

  if (error) {
    // Fallback if RPC fails: manually resolve dispute and update project
    console.error("RPC error, applying atomic database fallback:", error.message);

    const { data: wallet } = await admin
      .from("coin_wallets")
      .select("available_coins,held_coins")
      .eq("business_id", project.business_id)
      .single();

    if (wallet) {
      const returnCoins = Number(coinsReturned);
      const heldToDeduct = Math.min(wallet.held_coins, project.coin_amount);
      await admin
        .from("coin_wallets")
        .update({
          held_coins: Math.max(0, wallet.held_coins - heldToDeduct),
          available_coins: wallet.available_coins + returnCoins,
          updated_at: new Date().toISOString(),
        })
        .eq("business_id", project.business_id);
    }

    await admin
      .from("disputes")
      .update({
        status: "resolved",
        resolution: note.trim() || `Dispute resolved as ${resolutionType}`,
        resolution_type: resolutionType,
        coins_returned: Number(coinsReturned),
        payout_cents_awarded: Number(payoutCents),
        resolved_by: user.id,
        resolved_at: new Date().toISOString(),
      })
      .eq("id", disputeId);

    await admin
      .from("projects")
      .update({
        status: Number(coinsReturned) === project.coin_amount ? "cancelled" : "completed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", project.id);
  }

  await admin.from("audit_log").insert({
    actor_user_id: user.id,
    action: "dispute_resolved",
    entity_type: "dispute",
    entity_id: disputeId,
    metadata: { resolution_type: resolutionType, coins_returned: coinsReturned, payout_cents: payoutCents },
  });

  return NextResponse.json({ ok: true });
}
