import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createPeachNotification } from "@/lib/notifications";

function authorized(request: Request) {
  const headerSecret = request.headers.get("x-peach-cron-secret");
  const auth = request.headers.get("authorization");
  return Boolean(
    process.env.PEACH_CRON_SECRET &&
    (
      headerSecret === process.env.PEACH_CRON_SECRET ||
      auth === `Bearer ${process.env.PEACH_CRON_SECRET}`
    )
  );
}

async function runWatch() {
  const admin = createAdminClient();
  const now = new Date();
  const stale = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString();
  const soon = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

  const { data: projects } = await admin.from("projects")
    .select("id,title,due_at,last_progress_at,business_id,assigned_creative_id,status")
    .in("status", ["accepted","in_progress","proof_uploaded","revisions"])
    .or(`due_at.lte.${soon},last_progress_at.lte.${stale}`);

  let created = 0;

  for (const p of projects ?? []) {
    const recipients: string[] = [];

    const { data: business } = await admin
      .from("businesses")
      .select("owner_user_id")
      .eq("id", p.business_id)
      .single();

    if (business?.owner_user_id) recipients.push(business.owner_user_id);

    if (p.assigned_creative_id) {
      const { data: creative } = await admin
        .from("creatives")
        .select("user_id")
        .eq("id", p.assigned_creative_id)
        .single();

      if (creative?.user_id) recipients.push(creative.user_id);
    }

    const overdue = Boolean(p.due_at && new Date(p.due_at) < now);
    const staleUpdate = !p.last_progress_at || p.last_progress_at <= stale;

    const type = overdue ? "project_overdue" : staleUpdate ? "checkin_missing" : "deadline_soon";
    const body = overdue
      ? "This project is overdue. Open the workspace to choose the next step."
      : staleUpdate
      ? "No creative progress check-in has been recorded in 48 hours."
      : "This project is due within 24 hours.";

    for (const userId of recipients) {
      // Avoid sending the exact same operational notice repeatedly within 12 hours.
      const cutoff = new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString();
      const { data: existing } = await admin
        .from("notifications")
        .select("id")
        .eq("user_id", userId)
        .eq("project_id", p.id)
        .eq("notification_type", type)
        .gte("created_at", cutoff)
        .limit(1);

      if (existing?.length) continue;

      await createPeachNotification({
        userId,
        type,
        title: p.title,
        body,
        projectId: p.id,
        email: true
      });
      created++;
    }
  }

  return NextResponse.json({ ok: true, notificationsCreated: created });
}

export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  return runWatch();
}

export async function POST(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  return runWatch();
}
