import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {}

  const response = NextResponse.redirect(new URL("/", request.url), { status: 303 });
  response.cookies.delete("peach_session");
  response.cookies.delete("peach_role");
  return response;
}

export async function GET(request: Request) {
  return POST(request);
}
