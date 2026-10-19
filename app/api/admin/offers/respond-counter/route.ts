import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Admin required." }, { status: 403 });
  }

  const { offerId, action, payoutCents } = await request.json();
  if (!["accept_counter","decline_counter","counter_again"].includes(action)) {
    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: offer } = await admin
    .from("project_offers")
    .select("id,project_id,creative_id,status,payout_cents,counter_payout_cents")
    .eq("id", offerId)
    .single();

  if (!offer || offer.status !== "countered") {
    return NextResponse.json({ error: "Counteroffer is no longer open." }, { status: 400 });
  }

  if (action === "decline_counter") {
    await admin.from("project_offers").update({ status: "declined" }).eq("id", offer.id);
    await admin.from("projects").update({ status: "matching" }).eq("id", offer.project_id);
    return NextResponse.json({ ok: true, status: "declined" });
  }

  if (action === "accept_counter") {
    const acceptedPayout = offer.counter_payout_cents;
    if (!acceptedPayout) {
      return NextResponse.json({ error: "No counter payout found." }, { status: 400 });
    }

    await admin.from("project_offers")
      .update({
        payout_cents: acceptedPayout,
        counter_payout_cents: null,
        counter_reason: null,
        status: "sent",
        expires_at: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString()
      })
      .eq("id", offer.id);

    await admin.from("audit_log").insert({
      actor_user_id: user.id,
      action: "creative_counter_accepted",
      entity_type: "project",
      entity_id: offer.project_id,
      metadata: { offer_id: offer.id, payout_cents: acceptedPayout }
    });

    return NextResponse.json({ ok: true, status: "sent" });
  }

  if (!Number.isInteger(payoutCents) || payoutCents <= 0) {
    return NextResponse.json({ error: "Enter a valid payout." }, { status: 400 });
  }

  await admin.from("project_offers")
    .update({
      payout_cents: payoutCents,
      counter_payout_cents: null,
      counter_reason: null,
      status: "sent",
      expires_at: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString()
    })
    .eq("id", offer.id);

  return NextResponse.json({ ok: true, status: "sent" });
}
