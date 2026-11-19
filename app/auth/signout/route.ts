import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

function resolvePublicOrigin(request: Request): string {
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();

  if (forwardedHost && !forwardedHost.startsWith("0.0.0.0")) {
    const isLocal = forwardedHost.startsWith("localhost") || forwardedHost.startsWith("127.0.0.1");
    const proto = forwardedProto || (isLocal ? "http" : "https");
    return `${proto}://${forwardedHost}`;
  }

  const originHeader = request.headers.get("origin");
  if (originHeader && !originHeader.includes("0.0.0.0")) {
    try {
      return new URL(originHeader).origin;
    } catch {}
  }

  const hostHeader = request.headers.get("host")?.split(",")[0]?.trim();
  if (hostHeader && !hostHeader.startsWith("0.0.0.0")) {
    const isLocal = hostHeader.startsWith("localhost") || hostHeader.startsWith("127.0.0.1");
    const proto = forwardedProto || (isLocal ? "http" : "https");
    return `${proto}://${hostHeader}`;
  }

  try {
    const url = new URL(request.url);
    if (url.hostname === "0.0.0.0") {
      url.hostname = "localhost";
    }
    return url.origin;
  } catch {
    return "http://localhost:3000";
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {}

  const publicOrigin = resolvePublicOrigin(request);
  const isHttps = publicOrigin.startsWith("https://");
  const response = NextResponse.redirect(new URL("/", publicOrigin), { status: 303 });

  const clearNames = new Set<string>(["peach_session", "peach_role", "peach_target_role"]);
  try {
    const cookieStore = await cookies();
    for (const c of cookieStore.getAll()) {
      if (c.name.startsWith("sb-") || c.name.startsWith("peach_")) {
        clearNames.add(c.name);
      }
    }
  } catch {}

  for (const name of clearNames) {
    response.cookies.set(name, "", {
      path: "/",
      maxAge: 0,
      expires: new Date(0),
      sameSite: isHttps ? "none" : "lax",
      secure: isHttps,
    });
  }

  return response;
}

export async function GET(request: Request) {
  return POST(request);
}
