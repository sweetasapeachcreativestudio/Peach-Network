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

  const body = await request.json().catch(() => ({}));
  const action = String(body.action || "");

  const admin = createAdminClient();
  const { data: creative, error: crErr } = await admin
    .from("creatives")
    .select("id, availability_text, mentorship_notes, available_for_projects")
    .eq("user_id", user.id)
    .maybeSingle();

  if (crErr || !creative) {
    return NextResponse.json({ error: "Creative profile not found." }, { status: 404 });
  }

  if (action === "activate_5h_commitment") {
    const existing = String(creative.availability_text || "").trim();
    const marker = "5-Hour Client Response Commitment Active";
    const updated = /(5-hour|5 hour|commitment active)/i.test(existing)
      ? existing
      : existing
      ? `${existing} · ${marker}`
      : marker;

    const { error } = await admin
      .from("creatives")
      .update({
        availability_text: updated,
        available_for_projects: true,
      })
      .eq("id", creative.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ ok: true, action });
  }

  if (action === "verify_deliverable_standards") {
    const existingNotes = String(creative.mentorship_notes || "").trim();
    const marker = "Deliverable Standards Verified (Peach Academy)";
    const updatedNotes = /(deliverable standards verified|standards verified)/i.test(existingNotes)
      ? existingNotes
      : existingNotes
      ? `${existingNotes} · ${marker}`
      : marker;

    const { error } = await admin
      .from("creatives")
      .update({
        mentorship_notes: updatedNotes,
      })
      .eq("id", creative.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ ok: true, action });
  }

  return NextResponse.json({ error: "Unsupported readiness action." }, { status: 400 });
}
