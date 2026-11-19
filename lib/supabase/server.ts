import { cookies, headers } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function createClient() {
  const cookieStore = await cookies();
  const reqHeaders = await headers();

  const sessionCookie = cookieStore.get("peach_session");
  const roleCookie = cookieStore.get("peach_role");
  const headerRole = reqHeaders.get("x-peach-role");
  const effectiveRoleHint =
    roleCookie?.value === "creative" || roleCookie?.value === "business"
      ? roleCookie.value
      : headerRole === "creative" || headerRole === "business"
      ? headerRole
      : undefined;
  const pathname = reqHeaders.get("x-pathname") || "";
  const referer = reqHeaders.get("referer") || "";
  let user: any = null;
  let ssrClient: ReturnType<typeof createServerClient> | null = null;

  // Try real Supabase SSR session if env vars or cookies are present
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const cookieUrl = cookieStore.get("peach_sb_url")?.value ? decodeURIComponent(cookieStore.get("peach_sb_url")!.value) : null;
  const cookieKey = cookieStore.get("peach_sb_anon_key")?.value ? decodeURIComponent(cookieStore.get("peach_sb_anon_key")!.value) : null;

  const supabaseUrl = (envUrl && !envUrl.includes("placeholder") && !envUrl.includes("your-project"))
    ? envUrl
    : (cookieUrl && !cookieUrl.includes("placeholder") ? cookieUrl : envUrl);

  const supabaseAnonKey = (envKey && !envKey.includes("placeholder") && !envKey.includes("your-anon"))
    ? envKey
    : (cookieKey && !cookieKey.includes("placeholder") ? cookieKey : envKey);

  if (
    supabaseUrl &&
    (supabaseUrl.startsWith("http://") || supabaseUrl.startsWith("https://")) &&
    supabaseAnonKey &&
    !supabaseUrl.includes("placeholder") &&
    !supabaseUrl.includes("your-project")
  ) {
    try {
      ssrClient = createServerClient(supabaseUrl, supabaseAnonKey, {
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

  const demoCreativeUser = {
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

  const demoBusinessUser = {
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

  const isDemoUser =
    Boolean(user?.id) &&
    (user.id === "usr_business_demo" || user.id === "usr_creative_demo" || user.id === "usr_admin_demo");

  const isSharedRoute =
    pathname.startsWith("/projects") ||
    pathname.startsWith("/account") ||
    pathname.startsWith("/notifications") ||
    pathname.startsWith("/api/");

  // Keep preview/demo role consistent when switching between Creative Studio and Business Studio
  if (isDemoUser) {
    if (
      pathname.startsWith("/creative") ||
      (isSharedRoute && (effectiveRoleHint === "creative" || referer.includes("/creative")))
    ) {
      user = demoCreativeUser;
    } else if (
      pathname.startsWith("/business") ||
      (isSharedRoute && effectiveRoleHint === "business")
    ) {
      user = demoBusinessUser;
    }
  }

  // If no cookie was transmitted, infer user from role cookie, header, or authenticated route context
  if (!user) {
    if (
      pathname.startsWith("/creative") ||
      referer.includes("/creative") ||
      effectiveRoleHint === "creative"
    ) {
      user = demoCreativeUser;
    } else if (
      pathname.startsWith("/business") ||
      pathname.startsWith("/projects") ||
      referer.includes("/business") ||
      effectiveRoleHint === "business"
    ) {
      user = demoBusinessUser;
    } else if (
      pathname.startsWith("/account") ||
      pathname.startsWith("/notifications") ||
      referer.includes("/account") ||
      referer.includes("/notifications")
    ) {
      user = effectiveRoleHint === "business" ? demoBusinessUser : demoCreativeUser;
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
        if (ssrClient) {
          try {
            await ssrClient.auth.signOut();
          } catch {}
        }
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
