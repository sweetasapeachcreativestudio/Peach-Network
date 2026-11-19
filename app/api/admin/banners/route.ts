import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };

  const admin = createAdminClient();
  const { data: profile } = await admin.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role?.toLowerCase() !== "admin") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { admin };
}

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const { admin } = auth;

  const [{ data: banners }, { data: events }] = await Promise.all([
    admin.from("admin_banners").select("*").order("sort_order", { ascending: true }),
    admin.from("business_events").select("*").order("created_at", { ascending: false }),
  ]);

  return NextResponse.json({
    banners: banners ?? [],
    events: events ?? [],
  });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const { admin } = auth;

  const body = await req.json();
  const kind = body.kind === "event" ? "event" : "banner";

  if (kind === "banner") {
    const title = String(body.title || "").trim();
    const desktopImageUrl = String(body.desktopImageUrl || "").trim();
    const mobileImageUrl = String(body.mobileImageUrl || "").trim() || desktopImageUrl;
    if (!title || !desktopImageUrl) {
      return NextResponse.json(
        { error: "Title and Desktop Banner Image (1600×460) are required." },
        { status: 400 }
      );
    }

    const { data, error } = await admin
      .from("admin_banners")
      .insert({
        title,
        subtitle: body.subtitle ? String(body.subtitle).trim() : null,
        desktop_image_url: desktopImageUrl,
        mobile_image_url: mobileImageUrl,
        cta_label: body.ctaLabel ? String(body.ctaLabel).trim() : "Learn More",
        cta_href: body.ctaHref ? String(body.ctaHref).trim() : "/business/peach-business",
        is_active: body.isActive !== false,
        sort_order: Number(body.sortOrder || 0),
        ends_at: body.endsAt ? new Date(body.endsAt).toISOString() : null,
      })
      .select("*")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ banner: data });
  }

  const title = String(body.title || "").trim();
  const description = String(body.description || "").trim();
  if (!title || !description) {
    return NextResponse.json({ error: "Title and description are required." }, { status: 400 });
  }

  const { data, error } = await admin
    .from("business_events")
    .insert({
      badge: body.badge ? String(body.badge).trim() : "Upcoming Event",
      title,
      subtitle: body.subtitle ? String(body.subtitle).trim() : null,
      description,
      location: body.location ? String(body.location).trim() : null,
      event_date: body.eventDate ? new Date(body.eventDate).toISOString() : null,
      ends_at: body.endsAt ? new Date(body.endsAt).toISOString() : null,
      cta_label: body.ctaLabel ? String(body.ctaLabel).trim() : "View Details",
      cta_href: body.ctaHref ? String(body.ctaHref).trim() : "/business/peach-business",
      is_active: body.isActive !== false,
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ event: data });
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const { admin } = auth;

  const body = await req.json();
  const table = body.kind === "event" ? "business_events" : "admin_banners";
  const id = String(body.id || "");
  if (!id) return NextResponse.json({ error: "Missing record id" }, { status: 400 });

  const { data, error } = await admin
    .from(table)
    .update({ is_active: Boolean(body.isActive) })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ record: data });
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const { admin } = auth;

  const body = await req.json();
  const table = body.kind === "event" ? "business_events" : "admin_banners";
  const id = String(body.id || "");
  if (!id) return NextResponse.json({ error: "Missing record id" }, { status: 400 });

  const { error } = await admin.from(table).delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
