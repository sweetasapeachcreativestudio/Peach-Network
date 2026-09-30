import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const validLevels = new Set(["seed","sapling","tree","blossom","root"]);
const validActions = new Set(["approve","needs_more_work","reject"]);

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  // Read the role with the trusted server client. Browser/SSR RLS should not
  // be able to make a signed-in admin look like a non-admin here.
  const admin = createAdminClient();
  const { data: profile } = await admin.from("profiles").select("role").eq("id", user.id).single();

  if (profile?.role?.toLowerCase() !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const body = await request.json();
  const { creativeId, applicationId, action, level, notes } = body;

  if (!creativeId || !validActions.has(action)) {
    return NextResponse.json({ error: "Invalid review request." }, { status: 400 });
  }

  if (action === "approve" && !validLevels.has(level)) {
    return NextResponse.json({ error: "Choose a valid Peach Level." }, { status: 400 });
  }

  const newStatus =
    action === "approve"
      ? "approved"
      : action === "needs_more_work"
      ? "needs_more_work"
      : "rejected";

  const creativeUpdate: Record<string, unknown> = {
    application_status: newStatus
  };

  if (action === "approve") {
    creativeUpdate.peach_level = level;
  }

  const { error: creativeError } = await admin
    .from("creatives")
    .update(creativeUpdate)
    .eq("id", creativeId);

  if (creativeError) {
    return NextResponse.json({ error: creativeError.message }, { status: 500 });
  }

  if (applicationId) {
    const { error: appError } = await admin
      .from("creative_applications")
      .update({
        admin_notes: notes ?? "",
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id
      })
      .eq("id", applicationId);

    if (appError) {
      return NextResponse.json({ error: appError.message }, { status: 500 });
    }
  }

  await admin.from("audit_log").insert({
    actor_user_id: user.id,
    action: `creative_application_${action}`,
    entity_type: "creative",
    entity_id: creativeId,
    metadata: {
      assigned_level: action === "approve" ? level : null,
      application_id: applicationId ?? null
    }
  });

  return NextResponse.json({ ok: true, status: newStatus });
}
