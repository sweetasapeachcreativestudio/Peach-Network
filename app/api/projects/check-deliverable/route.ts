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

  const { projectId, deliverableIndex, deliverableText, approved, feedback } = await request.json();

  if (!projectId || deliverableText === undefined) {
    return NextResponse.json({ error: "Missing deliverable parameters." }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: project } = await admin
    .from("projects")
    .select("id,business_id,assigned_creative_id")
    .eq("id", projectId)
    .single();

  if (!project) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  const { data: business } = await admin
    .from("businesses")
    .select("id,owner_user_id")
    .eq("id", project.business_id)
    .single();

  if (!business || business.owner_user_id !== user.id) {
    return NextResponse.json({ error: "Business owner authorization required." }, { status: 403 });
  }

  // Record approval or revision feedback in project updates & messages
  if (approved) {
    await admin.from("project_messages").insert({
      project_id: projectId,
      sender_user_id: user.id,
      message: `Checked off deliverable: "${deliverableText}" - Approved! Creative can proceed to next piece.`,
    });
  } else if (feedback && feedback.trim()) {
    await admin.from("project_messages").insert({
      project_id: projectId,
      sender_user_id: user.id,
      message: `Feedback on deliverable "${deliverableText}": ${feedback.trim()}`,
    });
  }

  return NextResponse.json({
    ok: true,
    deliverableIndex,
    approved,
  });
}
