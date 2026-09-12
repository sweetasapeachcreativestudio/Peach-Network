import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "creative" && profile?.role !== "admin") {
    return NextResponse.json({ error: "Creative account required." }, { status: 403 });
  }

  const admin = createAdminClient();
  const { data: creative } = await admin
    .from("creatives")
    .select("id,stripe_connect_account_id,application_status")
    .eq("user_id", user.id)
    .single();

  if (!creative) {
    return NextResponse.json({ error: "Creative profile not found." }, { status: 404 });
  }

  if (creative.application_status !== "approved") {
    return NextResponse.json({ error: "Peach approval is required before payout setup." }, { status: 403 });
  }

  let accountId = creative.stripe_connect_account_id;

  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "express",
      country: "US",
      email: user.email,
      capabilities: {
        transfers: { requested: true }
      },
      business_type: "individual",
      metadata: {
        peach_creative_id: creative.id,
        peach_user_id: user.id
      }
    });

    accountId = account.id;

    await admin
      .from("creatives")
      .update({ stripe_connect_account_id: accountId })
      .eq("id", creative.id);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${appUrl}/creative/payouts?connect=refresh`,
    return_url: `${appUrl}/creative/payouts?connect=complete`,
    type: "account_onboarding"
  });

  return NextResponse.json({ url: link.url });
}
