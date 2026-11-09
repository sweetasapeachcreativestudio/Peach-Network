import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    }

    const admin = createAdminClient();
    const { data: business } = await admin
      .from("businesses")
      .select("id,name")
      .eq("owner_user_id", user.id)
      .maybeSingle();

    if (!business) {
      return NextResponse.json(
        { error: "Business account required to commission a project." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const coins = Math.max(1, Number(body.coins) || 2);
    const deliverablesList = Array.isArray(body.deliverables)
      ? body.deliverables.map((d: string) => `• ${d}`).join("\n")
      : "";

    const fullDescription = `### 1. Project Objective & Scope
${body.title || "Custom Commercial Design Deliverable"}
Category: ${body.category || "Design"} · Standard Turnaround: ${body.estimatedTurnaround || "3–5 business days"}

### 2. Exact Deliverables
${deliverablesList || "Production-ready source files and web/print exports."}

### 3. Pricing & Escrow
${coins} Peach Coins ($${coins * 50} USD) held in protected escrow. All projects include 3 revision rounds. Additional revision rounds can be purchased for 1 Peach Coin each.`;

    // 1. Create project with offer_sent status
    const { data: project, error: projErr } = await admin
      .from("projects")
      .insert({
        business_id: business.id,
        title: body.title || "Custom Commercial Project",
        category: body.category || "Design",
        description: fullDescription,
        status: "offer_sent",
        coin_amount: coins,
        revision_rounds: 3,
        current_revision_round: 0,
        assigned_creative_id: body.selectedCreativeId || null,
        due_at: body.dueAt || new Date(Date.now() + 5 * 86400000).toISOString(),
      })
      .select("*")
      .single();

    if (projErr || !project) {
      console.error("Project creation error:", projErr);
      return NextResponse.json(
        { error: projErr?.message || "Could not initialize project." },
        { status: 500 }
      );
    }

    // 2. Put coins in escrow if available
    const { data: wallet } = await admin
      .from("coin_wallets")
      .select("available_coins,held_coins")
      .eq("business_id", business.id)
      .maybeSingle();

    if (wallet && wallet.available_coins >= coins) {
      await admin
        .from("coin_wallets")
        .update({
          available_coins: wallet.available_coins - coins,
          held_coins: (wallet.held_coins || 0) + coins,
        })
        .eq("business_id", business.id);

      await admin.from("coin_transactions").insert({
        business_id: business.id,
        project_id: project.id,
        amount: -coins,
        transaction_type: "escrow_hold",
        description: `Held ${coins} Peach Coins in escrow for project "${project.title}"`,
      });
    }

    // 3. Create project offer for chosen creative (24-hour clock)
    if (body.selectedCreativeId) {
      const payoutCents = Math.round(coins * 5000 * 0.75); // 75% creative payout
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      await admin.from("project_offers").insert({
        project_id: project.id,
        creative_id: body.selectedCreativeId,
        status: "sent",
        payout_cents: payoutCents,
        expires_at: expiresAt,
      });

      // Record in shortlist
      await admin.from("project_match_shortlists").insert({
        project_id: project.id,
        creative_id: body.selectedCreativeId,
        match_score: Number(body.matchScore) || 98,
        match_reason: body.matchReason || "Selected via Peach Match AI",
        batch_number: 1,
        status: "requested",
      });
    }

    // 4. Initial welcome message on project board
    await admin.from("project_messages").insert({
      project_id: project.id,
      sender_user_id: user.id,
      message: `Peach Match AI initialized this project. ${coins} Peach Coins ($${coins * 50} USD) are committed to escrow with 3 included revision rounds. Awaiting creative acceptance kickoff.`,
    });

    await admin.from("audit_log").insert({
      actor_user_id: user.id,
      action: "project_created_via_peach_match_ai",
      entity_type: "project",
      entity_id: project.id,
      metadata: {
        coins,
        selected_creative: body.selectedCreativeId,
        title: project.title,
      },
    });

    return NextResponse.json({
      ok: true,
      project: {
        id: project.id,
        title: project.title,
        status: project.status,
      },
    });
  } catch (err: any) {
    console.error("ai-create-match error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process project match." },
      { status: 500 }
    );
  }
}
