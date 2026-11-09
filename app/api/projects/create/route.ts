import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { SERVICE_GUIDE, recommendCoins, requiresManualScope } from "@/lib/project-pricing";

export async function POST(request:Request){
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) return NextResponse.json({error:"Sign in required."},{status:401});

  const body = await request.json();
  const rawKey = String(body.serviceKey || "");
  const serviceKey = (rawKey in SERVICE_GUIDE ? rawKey : "social_graphic") as keyof typeof SERVICE_GUIDE;
  const guideItem = SERVICE_GUIDE[serviceKey] || { label: "Custom Commercial Design", min: 2, max: 4 };

  const admin = createAdminClient();
  const { data: business } = await admin.from("businesses").select("id").eq("owner_user_id", user.id).maybeSingle();
  if (!business) return NextResponse.json({ error: "Business account required." }, { status: 403 });

  const guidedCoins = recommendCoins(serviceKey, body.complexity === "expanded" ? "expanded" : "standard");
  const aiCoins = Number(body.aiCoins || body.coins);
  const coins = Number.isFinite(aiCoins) && aiCoins > 0 ? Math.max(1, Math.round(aiCoins)) : guidedCoins;

  const { data: project, error } = await admin
    .from("projects")
    .insert({
      business_id: business.id,
      title: body.title || guideItem.label,
      category: body.category || "Design",
      description: body.description || "",
      status: "matching",
      coin_amount: coins,
      due_at: body.dueAt || null,
      revision_rounds: body.revisionRounds ?? 3,
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // If a creative was selected in Peach Match AI, create the 24-hour offer immediately
  let offerId = null;
  if (body.selectedCreativeId) {
    const payout = Math.round(Number(coins) * 5000 * 0.75);
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const { data: offer } = await admin
      .from("project_offers")
      .insert({
        project_id: project.id,
        creative_id: body.selectedCreativeId,
        status: "sent",
        payout_cents: payout,
        expires_at: expires,
      })
      .select("id")
      .single();

    if (offer) {
      offerId = offer.id;
    }

    // Record shortlist row
    await admin.from("project_match_shortlists").insert({
      project_id: project.id,
      creative_id: body.selectedCreativeId,
      match_score: Number(body.matchScore) || 98,
      match_reason: body.matchReason || "Selected by client via Peach Match AI.",
      batch_number: 1,
      status: "requested",
    });
  }

  await admin.from("audit_log").insert({
    actor_user_id: user.id,
    action: "project_created",
    entity_type: "project",
    entity_id: project.id,
    metadata: { coins, service_key: serviceKey, selected_creative: body.selectedCreativeId || null },
  });

  return NextResponse.json({ project, offerId, recommendation: guideItem });
}

