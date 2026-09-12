import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";
import { MEMBERSHIP_PLANS, PEACH_PACKS, ONE_TIME_WALLET_CAP } from "@/lib/peach-catalog";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const body = await request.json();
  const { kind, key } = body;

  if (!["membership", "pack"].includes(kind)) {
    return NextResponse.json({ error: "Invalid checkout type." }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: business } = await admin
    .from("businesses")
    .select("id,name,stripe_customer_id")
    .eq("owner_user_id", user.id)
    .single();

  if (!business) {
    return NextResponse.json({ error: "Business account required." }, { status: 403 });
  }

  let customerId = business.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: business.name,
      metadata: { peach_business_id: business.id }
    });

    customerId = customer.id;

    await admin.from("businesses")
      .update({ stripe_customer_id: customerId })
      .eq("id", business.id);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;

  if (kind === "pack") {
    const pack = PEACH_PACKS[key as keyof typeof PEACH_PACKS];
    if (!pack) return NextResponse.json({ error: "Unknown Peach Pack." }, { status: 400 });

    // Never charge a pay-as-you-go client for Coins the wallet cannot receive.
    const { data: activeMembership } = await admin
      .from("memberships")
      .select("id")
      .eq("business_id", business.id)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();

    if (!activeMembership) {
      const { data: wallet } = await admin
        .from("coin_wallets")
        .select("available_coins")
        .eq("business_id", business.id)
        .single();

      const available = wallet?.available_coins ?? 0;

      if (available + pack.coins > ONE_TIME_WALLET_CAP) {
        return NextResponse.json({
          error: `This pack would put your pay-as-you-go balance above ${ONE_TIME_WALLET_CAP} Peach Coins. Use some Coins first or choose a smaller pack.`
        }, { status: 400 });
      }
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: customerId,
      success_url: `${appUrl}/business/wallet?checkout=success`,
      cancel_url: `${appUrl}/business/wallet?checkout=cancelled`,
      automatic_tax: { enabled: process.env.ENABLE_STRIPE_TAX === "true" },
      metadata: {
        peach_kind: "pack",
        peach_key: key,
        business_id: business.id
      },
      line_items: [{
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: pack.priceCents,
          product_data: {
            name: `Peach Pack · ${pack.coins} Coins`
          }
        }
      }]
    });

    return NextResponse.json({ url: session.url });
  }

  const plan = MEMBERSHIP_PLANS[key as keyof typeof MEMBERSHIP_PLANS];
  if (!plan) {
    return NextResponse.json({ error: "Unknown membership plan." }, { status: 400 });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    success_url: `${appUrl}/business/wallet?checkout=success`,
    cancel_url: `${appUrl}/business/wallet?checkout=cancelled`,
    automatic_tax: { enabled: process.env.ENABLE_STRIPE_TAX === "true" },
    metadata: {
      peach_kind: "membership",
      peach_key: key,
      business_id: business.id
    },
    subscription_data: {
      metadata: {
        peach_kind: "membership",
        peach_key: key,
        business_id: business.id
      }
    },
    line_items: [{
      quantity: 1,
      price_data: {
        currency: "usd",
        unit_amount: plan.priceCents,
        recurring: { interval: "month" },
        product_data: {
          name: `Peach Network · ${key[0].toUpperCase()}${key.slice(1)}`
        }
      }
    }]
  });

  return NextResponse.json({ url: session.url });
}
