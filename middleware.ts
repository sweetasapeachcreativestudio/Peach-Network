import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  let response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const cookieUrl = request.cookies.get("peach_sb_url")?.value ? decodeURIComponent(request.cookies.get("peach_sb_url")!.value) : null;
  const cookieKey = request.cookies.get("peach_sb_anon_key")?.value ? decodeURIComponent(request.cookies.get("peach_sb_anon_key")!.value) : null;

  const supabaseUrl = (envUrl && !envUrl.includes("placeholder") && !envUrl.includes("your-project"))
    ? envUrl
    : (cookieUrl && !cookieUrl.includes("placeholder") ? cookieUrl : envUrl);

  const supabaseAnonKey = (envKey && !envKey.includes("placeholder") && !envKey.includes("your-anon"))
    ? envKey
    : (cookieKey && !cookieKey.includes("placeholder") ? cookieKey : envKey);

  if (
    supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes("placeholder")
  ) {
    try {
      const supabase = createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },
            setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
              cookiesToSet.forEach(({ name, value }) =>
                request.cookies.set(name, value)
              );
              response = NextResponse.next({
                request: {
                  headers: requestHeaders,
                },
              });
              cookiesToSet.forEach(({ name, value, options }) =>
                response.cookies.set(name, value, options)
              );
            }
          }
        }
      );
      await supabase.auth.getUser();
    } catch {}
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"
  ]
};
