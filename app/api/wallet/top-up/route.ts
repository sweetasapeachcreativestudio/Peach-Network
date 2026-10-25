import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

    const { coins = 1 } = await req.json();
    const amount = Math.max(1, Math.min(50, Number(coins) || 1));

    const admin = createAdminClient();
    const { data: business } = await admin
      .from("businesses")
      .select("id")
      .eq("owner_user_id", user.id)
      .single();

    if (!business) return NextResponse.json({ error: "Business account required." }, { status: 403 });

    let { data: wallet } = await admin
      .from("coin_wallets")
      .select("available_coins,held_coins")
      .eq("business_id", business.id)
      .maybeSingle();

    if (!wallet) {
      const { data: createdWallet } = await admin
        .from("coin_wallets")
        .insert({
          business_id: business.id,
          available_coins: amount,
          held_coins: 0,
        })
        .select("available_coins,held_coins")
        .single();
      wallet = createdWallet;
    } else {
      const newBalance = (wallet.available_coins || 0) + amount;
      const { data: updatedWallet } = await admin
        .from("coin_wallets")
        .update({
          available_coins: newBalance,
          updated_at: new Date().toISOString(),
        })
        .eq("business_id", business.id)
        .select("available_coins,held_coins")
        .single();
      wallet = updatedWallet;
    }

    await admin.from("coin_ledger").insert({
      business_id: business.id,
      ledger_type: "credit",
      coin_delta: amount,
      note: `Peach Wallet Top-up: +${amount} Peach Coins ($${amount * 50} USD value)`,
    });

    return NextResponse.json({
      ok: true,
      coinsAdded: amount,
      usdCharged: amount * 50,
      newBalance: wallet?.available_coins ?? amount,
    });
  } catch (err: any) {
    console.error("Top-up error:", err);
    return NextResponse.json({ error: err.message || "Failed to top up coins." }, { status: 500 });
  }
}
