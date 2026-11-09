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

    const { projectId, action } = await request.json(); // action: "accept" | "decline"
    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required." }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: project } = await admin
      .from("projects")
      .select("id,business_id,assigned_creative_id,coin_amount,title")
      .eq("id", projectId)
      .single();

    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    if (action === "accept") {
      // Update offer status
      await admin
        .from("project_offers")
        .update({ status: "accepted", accepted_at: new Date().toISOString() })
        .eq("project_id", projectId);

      // Transition project to in_progress
      await admin
        .from("projects")
        .update({ status: "in_progress" })
        .eq("id", projectId);

      // Post confirmation message
      await admin.from("project_messages").insert({
        project_id: projectId,
        sender_user_id: user.id,
        message: "Creative accepted the brief! Workspace is now active. Send any logos, videos, branding files, or notes to get started.",
      });

      return NextResponse.json({ ok: true, status: "in_progress" });
    } else if (action === "decline") {
      // Creative declined or client chose to redispatch
      await admin
        .from("project_offers")
        .update({ status: "declined" })
        .eq("project_id", projectId);

      await admin
        .from("projects")
        .update({ status: "matching", assigned_creative_id: null })
        .eq("id", projectId);

      await admin.from("project_messages").insert({
        project_id: projectId,
        sender_user_id: user.id,
        message: "Creative was unavailable. Returned to matching pool to select another creative from the Hub.",
      });

      return NextResponse.json({ ok: true, status: "matching" });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (err: any) {
    console.error("simulate-acceptance error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update project status." },
      { status: 500 }
    );
  }
}
