import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const body = await request.json();
  const admin = createAdminClient();
  const { data: profile } = await admin.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "creative") return NextResponse.json({ error: "Creative account required." }, { status: 403 });

  const { data: creative, error: creativeError } = await admin.from("creatives")
    .update({
      primary_specialty: body.specialty?.trim() || null,
      city: body.city?.trim() || null,
      state: body.state?.trim() || null,
      application_status: "submitted",
    })
    .eq("user_id", user.id)
    .select("id")
    .single();

  if (creativeError || !creative) return NextResponse.json({ error: creativeError?.message ?? "Creative profile not found." }, { status: 400 });

  const { error: appError } = await admin.from("creative_applications").insert({
    creative_id: creative.id,
    experience: body.experience?.trim() || null,
    tools: body.tools?.trim() || null,
    portfolio_url: body.portfolioUrl?.trim() || null,
    submitted_at: new Date().toISOString(),
  });
  if (appError) return NextResponse.json({ error: appError.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
