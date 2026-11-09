import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const { projectId } = await request.json();

  if (!projectId) {
    return NextResponse.json({ error: "Project ID is required." }, { status: 400 });
  }

  const admin = createAdminClient();

  // Fetch project & verify business ownership
  const { data: project } = await admin
    .from("projects")
    .select("id,title,business_id,revision_rounds,current_revision_round,assigned_creative_id")
    .eq("id", projectId)
    .single();

  if (!project) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  const { data: business } = await admin
    .from("businesses")
    .select("id,owner_user_id,name")
    .eq("id", project.business_id)
    .single();

  if (!business || business.owner_user_id !== user.id) {
    return NextResponse.json({ error: "Business owner authorization required." }, { status: 403 });
  }

  // Check wallet balance: 1 Peach Coin = 1 Revision
  const { data: wallet } = await admin
    .from("coin_wallets")
    .select("available_coins,held_coins")
    .eq("business_id", business.id)
    .single();

  const available = wallet?.available_coins ?? 0;

  if (available < 1) {
    return NextResponse.json(
      { error: "Insufficient Peach Coins. You need 1 Peach Coin ($50 USD) to add an extra revision." },
      { status: 400 }
    );
  }

  // Deduct 1 Coin from available wallet & add to held escrow
  const { error: walletError } = await admin
    .from("coin_wallets")
    .update({
      available_coins: available - 1,
      held_coins: (wallet?.held_coins ?? 0) + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("business_id", business.id);

  if (walletError) {
    return NextResponse.json({ error: "Could not update wallet." }, { status: 500 });
  }

  // Log coin ledger
  await admin.from("coin_ledger").insert({
    business_id: business.id,
    project_id: project.id,
    ledger_type: "held",
    coin_delta: -1,
    note: "1 Peach Coin committed for 1 additional revision round.",
  });

  // Increment revision rounds on the project
  const updatedRounds = (project.revision_rounds ?? 3) + 1;

  const { error: projectError } = await admin
    .from("projects")
    .update({
      revision_rounds: updatedRounds,
    })
    .eq("id", project.id);

  if (projectError) {
    return NextResponse.json({ error: "Could not increment revision rounds." }, { status: 500 });
  }

  // Notify in message board
  await admin.from("project_messages").insert({
    project_id: project.id,
    sender_user_id: user.id,
    message: `Added 1 extra revision round (1 Peach Coin / $50 USD). Total revision rounds: ${updatedRounds}.`,
  });

  return NextResponse.json({
    ok: true,
    revisionRounds: updatedRounds,
    availableCoins: available - 1,
  });
}
