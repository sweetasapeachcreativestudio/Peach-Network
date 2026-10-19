import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

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

async function run() {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("peach_expire_offers");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, expired: data ?? 0 });
}

export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  return run();
}

export async function POST(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  return run();
}
