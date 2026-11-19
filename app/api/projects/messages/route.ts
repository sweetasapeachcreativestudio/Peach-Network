import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, isRealSupabaseEnv } from "@/lib/supabase/admin";
import { isSignedContractStatus } from "@/lib/brand-vault";
import { isApprovedProjectCollaborator } from "@/lib/collaborators";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const { projectId, body, message } = await request.json();
  const text = String(body ?? message ?? "").trim();
  if (!projectId || !text) {
    return NextResponse.json({ error: "Message cannot be empty." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: project } = await admin
    .from("projects")
    .select("id,business_id,assigned_creative_id,status")
    .eq("id", projectId)
    .maybeSingle();
  if (!project) return NextResponse.json({ error: "Project not found." }, { status: 404 });

  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const isAdmin = profile?.role === "admin";
  let allowed = isAdmin;
  let isBusinessOwner = false;

  if (!allowed) {
    const { data: business } = await admin
      .from("businesses")
      .select("owner_user_id")
      .eq("id", project.business_id)
      .maybeSingle();
    isBusinessOwner = business?.owner_user_id === user.id;
    allowed = isBusinessOwner;
  }

  if (!allowed && project.assigned_creative_id) {
    const { data: creative } = await admin
      .from("creatives")
      .select("user_id")
      .eq("id", project.assigned_creative_id)
      .maybeSingle();
    allowed = creative?.user_id === user.id;
    if (!allowed && !isRealSupabaseEnv() && user.id === "usr_creative_demo" && !isBusinessOwner) {
      allowed = true;
    }
  }

  if (!allowed) {
    allowed = await isApprovedProjectCollaborator(admin, projectId, user.id);
  }

  if (!allowed) {
    return NextResponse.json({ error: "You are not part of this project." }, { status: 403 });
  }

  if (!isSignedContractStatus(project.status) && project.status !== "completed" && !isAdmin) {
    return NextResponse.json(
      { error: "Live project chat unlocks once both parties have signed the Design Contract." },
      { status: 409 }
    );
  }

  const { error } = await admin
    .from("project_messages")
    .insert({ project_id: projectId, sender_user_id: user.id, message: text });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
