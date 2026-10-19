import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const body = await request.json();
  const { offerId, action, counterPayoutCents, counterReason } = body;

  if (!["accept","decline","counter"].includes(action)) {
    return NextResponse.json({ error: "Invalid response." }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: creative } = await admin
    .from("creatives")
    .select("id,application_status")
    .eq("user_id", user.id)
    .single();

  if (!creative || creative.application_status !== "approved") {
    return NextResponse.json({ error: "Approved creative account required." }, { status: 403 });
  }

  const { data: offer } = await admin
    .from("project_offers")
    .select(`
      id,project_id,creative_id,status,payout_cents,expires_at,
      projects(id,business_id,coin_amount,status)
    `)
    .eq("id", offerId)
    .eq("creative_id", creative.id)
    .single();

  if (!offer || !["sent","countered"].includes(offer.status)) {
    return NextResponse.json({ error: "Offer is no longer available." }, { status: 400 });
  }

  if (new Date(offer.expires_at) <= new Date()) {
    await admin.from("project_offers").update({ status: "expired" }).eq("id", offer.id);
    return NextResponse.json({ error: "This offer expired." }, { status: 400 });
  }

  const project: any = offer.projects;

  if (action === "decline") {
    await admin.from("project_offers").update({ status: "declined" }).eq("id", offer.id);
    await admin.from("projects").update({ status: "matching" }).eq("id", project.id);

    await admin.from("audit_log").insert({
      actor_user_id: user.id,
      action: "project_offer_declined",
      entity_type: "project",
      entity_id: project.id,
      metadata: { offer_id: offer.id }
    });

    return NextResponse.json({ ok: true, status: "declined" });
  }

  if (action === "counter") {
    if (!Number.isInteger(counterPayoutCents) || counterPayoutCents <= 0) {
      return NextResponse.json({ error: "Enter a valid counter payout." }, { status: 400 });
    }

    await admin.from("project_offers")
      .update({
        status: "countered",
        counter_payout_cents: counterPayoutCents,
        counter_reason: counterReason ?? ""
      })
      .eq("id", offer.id);

    await admin.from("audit_log").insert({
      actor_user_id: user.id,
      action: "project_offer_countered",
      entity_type: "project",
      entity_id: project.id,
      metadata: {
        offer_id: offer.id,
        original_payout_cents: offer.payout_cents,
        counter_payout_cents: counterPayoutCents
      }
    });

    return NextResponse.json({ ok: true, status: "countered" });
  }

  // V11 test-mode fallback: hold coins without requiring the later money RPC migration.
  // This is intentionally marked as a deployment-gate item before live payments because
  // the production version should move this into one atomic database function.
  const { data: wallet } = await admin.from("coin_wallets")
    .select("available_coins,held_coins")
    .eq("business_id", project.business_id)
    .single();

  if (!wallet || wallet.available_coins < project.coin_amount) {
    return NextResponse.json({ error: "The business does not have enough available Peach Coins yet." }, { status: 400 });
  }

  const { error: walletError } = await admin.from("coin_wallets").update({
    available_coins: wallet.available_coins - project.coin_amount,
    held_coins: wallet.held_coins + project.coin_amount,
    updated_at: new Date().toISOString()
  }).eq("business_id", project.business_id);

  if (walletError) return NextResponse.json({ error: walletError.message }, { status: 400 });

  await admin.from("coin_ledger").insert({
    business_id: project.business_id,
    project_id: project.id,
    ledger_type: "held",
    coin_delta: -project.coin_amount,
    note: "Coins held when creative accepted Peach Match."
  });

  await admin.from("project_offers")
    .update({ status: "accepted", accepted_at: new Date().toISOString() })
    .eq("id", offer.id);

  await admin.from("projects")
    .update({ status: "accepted", assigned_creative_id: creative.id })
    .eq("id", project.id);

  await admin.from("project_offers")
    .update({ status: "withdrawn" })
    .eq("project_id", project.id)
    .neq("id", offer.id)
    .in("status", ["sent","countered"]);

  await admin.from("audit_log").insert({
    actor_user_id: user.id,
    action: "project_offer_accepted",
    entity_type: "project",
    entity_id: project.id,
    metadata: {
      offer_id: offer.id,
      coins_held: project.coin_amount,
      payout_cents: offer.payout_cents
    }
  });

  return NextResponse.json({ ok: true, status: "accepted", projectId: project.id });
}
