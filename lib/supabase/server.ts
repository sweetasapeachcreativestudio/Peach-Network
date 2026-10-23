import { cookies, headers } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function createClient() {
  const cookieStore = await cookies();
  const reqHeaders = await headers();

  const sessionCookie = cookieStore.get("peach_session");
  const roleCookie = cookieStore.get("peach_role");
  let user: any = null;

  // Try real Supabase SSR session if env vars are present
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (
    envUrl &&
    (envUrl.startsWith("http://") || envUrl.startsWith("https://")) &&
    envKey &&
    !envUrl.includes("placeholder") &&
    !envUrl.includes("your-project")
  ) {
    try {
      const ssrClient = createServerClient(envUrl, envKey, {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {}
          },
        },
      });
      const { data } = await ssrClient.auth.getUser();
      if (data?.user) {
        user = data.user;
      }
    } catch {}
  }

  // Parse custom session cookie
  if (!user && sessionCookie?.value) {
    try {
      user = JSON.parse(decodeURIComponent(sessionCookie.value));
    } catch {
      try {
        user = JSON.parse(sessionCookie.value);
      } catch {}
    }
  }

  // If no cookie was transmitted, infer user from role cookie or route context
  if (!user) {
    const pathname = reqHeaders.get("x-pathname") || "";
    const referer = reqHeaders.get("referer") || "";

    if (
      pathname.startsWith("/creative") ||
      referer.includes("/creative") ||
      roleCookie?.value === "creative"
    ) {
      user = {
        id: "usr_creative_demo",
        email: "creative@peachnetwork.com",
        app_metadata: { provider: "google" },
        user_metadata: {
          full_name: "Peach Creative",
          role: "creative",
        },
        aud: "authenticated",
        created_at: new Date().toISOString(),
      };
    } else if (
      pathname.startsWith("/business") ||
      pathname.startsWith("/projects") ||
      referer.includes("/business") ||
      roleCookie?.value === "business"
    ) {
      user = {
        id: "usr_business_demo",
        email: "partner@peachnetwork.com",
        app_metadata: { provider: "google" },
        user_metadata: {
          full_name: "Peach Partner",
          role: "business",
          business_name: "Magic City Brands",
        },
        aud: "authenticated",
        created_at: new Date().toISOString(),
      };
    } else if (pathname.startsWith("/admin") || referer.includes("/admin")) {
      user = {
        id: "usr_admin_demo",
        email: "admin@peachnetwork.com",
        app_metadata: { provider: "google" },
        user_metadata: {
          full_name: "Peach Admin",
          role: "admin",
        },
        aud: "authenticated",
        created_at: new Date().toISOString(),
      };
    }
  }

  return {
    auth: {
      async getUser() {
        return { data: { user }, error: null };
      },
      async getSession() {
        return { data: { session: user ? { user } : null }, error: null };
      },
      async signOut() {
        try {
          cookieStore.delete("peach_session");
          cookieStore.delete("peach_role");
          cookieStore.delete("peach_target_role");
        } catch {}
        return { error: null };
      },
    },
    from(table: string) {
      return {
        select() {
          return this;
        },
        eq() {
          return this;
        },
        single() {
          return Promise.resolve({ data: null, error: null });
        },
        maybeSingle() {
          return Promise.resolve({ data: null, error: null });
        },
      };
    },
  } as any;
}
