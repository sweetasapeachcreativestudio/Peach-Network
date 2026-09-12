import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (me?.role !== "admin") {
    return NextResponse.json({ error: "Admin required." }, { status: 403 });
  }

  const { payoutId } = await request.json();
  const admin = createAdminClient();

  const { data: payout } = await admin
    .from("creative_payouts")
    .select("id,project_id,creative_id,amount_cents,status,stripe_transfer_id")
    .eq("id", payoutId)
    .single();

  if (!payout || payout.status !== "approved") {
    return NextResponse.json({ error: "Payout is not ready." }, { status: 400 });
  }

  if (payout.stripe_transfer_id) {
    return NextResponse.json({ ok: true, alreadyProcessed: true });
  }

  const { data: creative } = await admin
    .from("creatives")
    .select("stripe_connect_account_id")
    .eq("id", payout.creative_id)
    .single();

  if (!creative?.stripe_connect_account_id) {
    return NextResponse.json({ error: "Creative has not completed payout setup." }, { status: 400 });
  }

  const account = await stripe.accounts.retrieve(creative.stripe_connect_account_id);

  if (!account.payouts_enabled || !account.details_submitted) {
    return NextResponse.json(
      { error: "Creative payout account still needs information." },
      { status: 400 }
    );
  }

  try {
    const transfer = await stripe.transfers.create({
      amount: payout.amount_cents,
      currency: "usd",
      destination: creative.stripe_connect_account_id,
      metadata: {
        peach_payout_id: payout.id,
        project_id: payout.project_id
      }
    }, {
      idempotencyKey: `peach-payout-${payout.id}`
    });

    await admin.from("creative_payouts")
      .update({
        status: "paid",
        stripe_transfer_id: transfer.id,
        processed_at: new Date().toISOString(),
        paid_at: new Date().toISOString(),
        failure_reason: null
      })
      .eq("id", payout.id);

    await admin.from("audit_log").insert({
      actor_user_id: user.id,
      action: "creative_payout_sent",
      entity_type: "payout",
      entity_id: payout.id,
      metadata: {
        stripe_transfer_id: transfer.id,
        amount_cents: payout.amount_cents
      }
    });

    return NextResponse.json({ ok: true, transferId: transfer.id });
  } catch (error: any) {
    // Keep status approved so an admin can retry after correcting the issue.
    await admin.from("creative_payouts")
      .update({
        failure_reason: error?.message ?? "Stripe transfer failed"
      })
      .eq("id", payout.id);

    return NextResponse.json(
      { error: error?.message ?? "Stripe transfer failed." },
      { status: 400 }
    );
  }
}
