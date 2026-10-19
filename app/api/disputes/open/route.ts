import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const { projectId, statement, requestedResolution } = await request.json();

  if (!statement?.trim()) {
    return NextResponse.json({ error: "Please explain what happened." }, { status: 400 });
  }

  const { data: project } = await supabase
    .from("projects")
    .select("id,business_id,assigned_creative_id,status")
    .eq("id", projectId)
    .single();

  if (!project) {
    return NextResponse.json({ error: "Project access denied." }, { status: 403 });
  }

  const admin = createAdminClient();

  const { data: business } = await admin
    .from("businesses")
    .select("owner_user_id")
    .eq("id", project.business_id)
    .single();

  const { data: creative } = project.assigned_creative_id
    ? await admin
        .from("creatives")
        .select("user_id")
        .eq("id", project.assigned_creative_id)
        .single()
    : { data: null };

  const isBusiness = business?.owner_user_id === user.id;
  const isCreative = creative?.user_id === user.id;

  if (!isBusiness && !isCreative) {
    return NextResponse.json(
      { error: "Only project participants can open a dispute." },
      { status: 403 }
    );
  }

  const payload: Record<string, unknown> = {
    project_id: projectId,
    opened_by: user.id,
    reason: statement.trim(),
    status: "open",
    requested_resolution: requestedResolution ?? "review"
  };

  if (isBusiness) payload.client_statement = statement.trim();
  if (isCreative) payload.creative_statement = statement.trim();

  const { data: dispute, error } = await admin
    .from("disputes")
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await admin
    .from("projects")
    .update({ status: "dispute_review" })
    .eq("id", projectId);

  await admin.from("audit_log").insert({
    actor_user_id: user.id,
    action: "dispute_opened",
    entity_type: "project",
    entity_id: projectId,
    metadata: {
      dispute_id: dispute.id,
      opened_by: isBusiness ? "business" : "creative"
    }
  });

  return NextResponse.json({ ok: true, disputeId: dispute.id });
}
