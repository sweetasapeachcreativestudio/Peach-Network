import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    }

    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("phone,role")
      .eq("id", user.id)
      .maybeSingle();

    // Check notification_preferences table or audit log
    let prefs: any = null;
    try {
      const { data } = await admin
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      prefs = data;
    } catch {
      // fallback
    }

    if (!prefs) {
      const { data: logs } = await admin
        .from("audit_log")
        .select("metadata")
        .eq("actor_user_id", user.id)
        .eq("action", "notification_preferences_updated")
        .order("created_at", { ascending: false })
        .limit(1);

      if (logs && logs.length > 0) {
        prefs = logs[0].metadata;
      }
    }

    const defaults = {
      phone: profile?.phone || "",
      sms_enabled: Boolean(profile?.phone),
      sms_schedule: "instant",
      push_enabled: false,
      email_enabled: true,
      notify_messages: true,
      notify_proofs: true,
      notify_offers: true,
      notify_addons: true,
    };

    return NextResponse.json({
      preferences: {
        ...defaults,
        ...(prefs || {}),
        sms_schedule: prefs?.sms_schedule || "instant",
        phone: profile?.phone || prefs?.phone || "",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load preferences." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    }

    const body = await request.json();
    const {
      phone,
      sms_enabled = true,
      sms_schedule = "instant",
      push_enabled = false,
      push_subscription = null,
      email_enabled = true,
      notify_messages = true,
      notify_proofs = true,
      notify_offers = true,
      notify_addons = true,
    } = body;

    const cleanPhone = String(phone || "").trim();
    const allowedSchedules = ["instant", "business_hours", "urgent_only"];
    const cleanSchedule = allowedSchedules.includes(String(sms_schedule))
      ? String(sms_schedule)
      : "instant";
    const admin = createAdminClient();

    // 1. Update profiles.phone
    await admin
      .from("profiles")
      .update({
        phone: cleanPhone || null,
      })
      .eq("id", user.id);

    // 2. Also update businesses.phone if user owns a business
    await admin
      .from("businesses")
      .update({
        phone: cleanPhone || null,
      })
      .eq("owner_user_id", user.id);

    // 3. Upsert into notification_preferences table
    const prefPayload = {
      user_id: user.id,
      phone: cleanPhone,
      sms_enabled: Boolean(sms_enabled),
      sms_schedule: cleanSchedule,
      push_enabled: Boolean(push_enabled),
      push_subscription: push_subscription,
      email_enabled: Boolean(email_enabled),
      notify_messages: Boolean(notify_messages),
      notify_proofs: Boolean(notify_proofs),
      notify_offers: Boolean(notify_offers),
      notify_addons: Boolean(notify_addons),
      updated_at: new Date().toISOString(),
    };

    try {
      await admin.from("notification_preferences").upsert(prefPayload);
    } catch {
      // Table may not exist yet, fallback to audit_log
    }

    // 4. Save to audit_log
    await admin.from("audit_log").insert({
      actor_user_id: user.id,
      action: "notification_preferences_updated",
      entity_type: "user",
      entity_id: user.id,
      metadata: prefPayload,
    });

    return NextResponse.json({
      ok: true,
      preferences: prefPayload,
    });
  } catch (err: any) {
    console.error("Preferences save error:", err);
    return NextResponse.json({ error: err.message || "Failed to save preferences." }, { status: 500 });
  }
}
