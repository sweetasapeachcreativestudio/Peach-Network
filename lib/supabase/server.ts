import { cookies, headers } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  const reqHeaders = await headers();

  const sessionCookie = cookieStore.get("peach_session");
  const roleCookie = cookieStore.get("peach_role");
  let user: any = null;

  if (sessionCookie?.value) {
    try {
      user = JSON.parse(decodeURIComponent(sessionCookie.value));
    } catch {
      try {
        user = JSON.parse(sessionCookie.value);
      } catch {}
    }
  }

  // If no cookie was transmitted, infer authentication from route context or role cookie
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
