import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { MEMBERSHIP_PLANS, PEACH_PACKS, ONE_TIME_WALLET_CAP } from "@/lib/peach-catalog";

async function claimEvent(admin: ReturnType<typeof createAdminClient>, eventId: string, type: string) {
  const { data: existing } = await admin
    .from("stripe_webhook_events")
    .select("id,status")
    .eq("stripe_event_id", eventId)
    .maybeSingle();

  if (existing?.status === "processed") return "already_processed";

  if (existing) {
    await admin.from("stripe_webhook_events")
      .update({ status: "processing", last_error: null, updated_at: new Date().toISOString() })
      .eq("id", existing.id);
    return "reclaimed";
  }

  const { error } = await admin.from("stripe_webhook_events").insert({
    stripe_event_id: eventId,
    event_type: type,
    status: "processing"
  });

  if (error) {
    const { data: raced } = await admin
      .from("stripe_webhook_events")
      .select("status")
      .eq("stripe_event_id", eventId)
      .maybeSingle();

    if (raced?.status === "processed") return "already_processed";
    throw error;
  }

  return "claimed";
}

async function finishEvent(admin: ReturnType<typeof createAdminClient>, eventId: string) {
  await admin.from("stripe_webhook_events")
    .update({
      status: "processed",
      processed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_error: null
    })
    .eq("stripe_event_id", eventId);
}

async function failEvent(admin: ReturnType<typeof createAdminClient>, eventId: string, error: unknown) {
  const message = error instanceof Error ? error.message : "Unknown webhook failure";
  await admin.from("stripe_webhook_events")
    .update({
      status: "failed",
      last_error: message.slice(0, 1000),
      updated_at: new Date().toISOString()
    })
    .eq("stripe_event_id", eventId);
}

export async function POST(request: Request) {
  const signature = (await headers()).get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !secret) {
    return NextResponse.json({ error: "Stripe webhook is not configured." }, { status: 400 });
  }

  const raw = await request.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(raw, signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid Stripe signature." }, { status: 400 });
  }

  const admin = createAdminClient();

  try {
    const claim = await claimEvent(admin, event.id, event.type);
    if (claim === "already_processed") {
      return NextResponse.json({ received: true, duplicate: true });
    }

    if (event.type === "checkout.session.completed") {
      const session: any = event.data.object;

      if (session.metadata?.peach_kind === "pack") {
        const key = session.metadata?.peach_key as keyof typeof PEACH_PACKS;
        const pack = PEACH_PACKS[key];
        const businessId = session.metadata?.business_id;

        if (!pack || !businessId) throw new Error("Missing Peach Pack metadata.");

        const sourceId = session.payment_intent
          ? `payment_intent:${session.payment_intent}`
          : `checkout_session:${session.id}`;

        const { data: prior } = await admin
          .from("coin_ledger")
          .select("id")
          .eq("stripe_source_id", sourceId)
          .maybeSingle();

        if (!prior) {
          const { error: rpcError } = await admin.rpc("peach_add_pack_coins", {
            p_business_id: businessId,
            p_coins: pack.coins,
            p_wallet_cap: ONE_TIME_WALLET_CAP
          });
          if (rpcError) throw rpcError;

          // Mark the newest purchased entry with the immutable Stripe source.
          const { data: newest } = await admin
            .from("coin_ledger")
            .select("id")
            .eq("business_id", businessId)
            .eq("ledger_type", "purchased")
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          if (newest) {
            await admin.from("coin_ledger")
              .update({
                stripe_source_id: sourceId,
                stripe_payment_intent_id: session.payment_intent ?? null
              })
              .eq("id", newest.id);
          }
        }
      }
    }

    if (event.type === "invoice.paid") {
      const invoice: any = event.data.object;
      const subscriptionId =
        typeof invoice.subscription === "string"
          ? invoice.subscription
          : invoice.subscription?.id;

      if (subscriptionId) {
        const subscription: any = await stripe.subscriptions.retrieve(subscriptionId);
        const key = subscription.metadata?.peach_key as keyof typeof MEMBERSHIP_PLANS;
        const plan = MEMBERSHIP_PLANS[key];
        const businessId = subscription.metadata?.business_id;

        if (plan && businessId) {
          const sourceId = `invoice:${invoice.id}`;

          const { data: prior } = await admin
            .from("coin_ledger")
            .select("id")
            .eq("stripe_source_id", sourceId)
            .maybeSingle();

          if (!prior) {
            const { error: rpcError } = await admin.rpc("peach_apply_membership_refill", {
              p_business_id: businessId,
              p_plan_name: key,
              p_price_cents: plan.priceCents,
              p_monthly_coins: plan.monthlyCoins,
              p_coin_cap: plan.coinCap,
              p_stripe_subscription_id: subscriptionId,
              p_current_period_end: subscription.current_period_end
                ? new Date(subscription.current_period_end * 1000).toISOString()
                : null
            });

            if (rpcError) throw rpcError;

            const { data: newest } = await admin
              .from("coin_ledger")
              .select("id")
              .eq("business_id", businessId)
              .eq("ledger_type", "issued")
              .order("created_at", { ascending: false })
              .limit(1)
              .single();

            if (newest) {
              await admin.from("coin_ledger")
                .update({ stripe_source_id: sourceId })
                .eq("id", newest.id);
            }
          }
        }
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription: any = event.data.object;
      await admin.from("memberships")
        .update({ status: "cancelled" })
        .eq("stripe_subscription_id", subscription.id);
    }

    await finishEvent(admin, event.id);
    return NextResponse.json({ received: true });
  } catch (error) {
    await failEvent(admin, event.id, error);
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
