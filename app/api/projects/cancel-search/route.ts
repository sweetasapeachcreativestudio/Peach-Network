import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

    const { projectId } = await req.json();
    if (!projectId) return NextResponse.json({ error: "Project ID required." }, { status: 400 });

    const admin = createAdminClient();

    const { data: project } = await admin
      .from("projects")
      .select("id,business_id,status,coin_amount")
      .eq("id", projectId)
      .single();

    if (!project) return NextResponse.json({ error: "Project not found." }, { status: 404 });

    const { data: business } = await admin
      .from("businesses")
      .select("id,owner_user_id")
      .eq("id", project.business_id)
      .single();

    if (business?.owner_user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    // Projects can only be cancelled during matching/offer stage before work begins
    if (!["matching", "offer_sent", "draft"].includes(project.status)) {
      return NextResponse.json(
        { error: "This project has already started. To stop an active project, submit an official dispute." },
        { status: 400 }
      );
    }

    // If coins were committed in escrow, return them to available_coins
    if (project.coin_amount > 0) {
      const { data: wallet } = await admin
        .from("coin_wallets")
        .select("available_coins,held_coins")
        .eq("business_id", business.id)
        .single();

      if (wallet && wallet.held_coins >= project.coin_amount) {
        await admin
          .from("coin_wallets")
          .update({
            held_coins: wallet.held_coins - project.coin_amount,
            available_coins: wallet.available_coins + project.coin_amount,
            updated_at: new Date().toISOString(),
          })
          .eq("business_id", business.id);

        await admin.from("coin_ledger").insert({
          business_id: business.id,
          project_id: project.id,
          ledger_type: "released",
          coin_delta: project.coin_amount,
          note: "Client cancelled creative search before match kickoff",
        });
      }
    }

    // Update project status to cancelled
    await admin
      .from("projects")
      .update({
        status: "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", project.id);

    // Cancel any pending offers
    await admin
      .from("project_offers")
      .update({ status: "cancelled" })
      .eq("project_id", project.id)
      .eq("status", "pending");

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Cancel search error:", err);
    return NextResponse.json({ error: err.message || "Failed to cancel search." }, { status: 500 });
  }
}
