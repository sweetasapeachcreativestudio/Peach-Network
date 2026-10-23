"use client";

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const cookieUrl =
    typeof document !== "undefined"
      ? document.cookie
          .split("; ")
          .find((row) => row.startsWith("peach_sb_url="))
          ?.split("=")[1]
      : null;
  const decodedCookieUrl = cookieUrl ? decodeURIComponent(cookieUrl) : null;

  const rawUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    (typeof window !== "undefined"
      ? localStorage.getItem("peach_supabase_url") || localStorage.getItem("peach_sb_url")
      : null) ||
    decodedCookieUrl;

  const url =
    rawUrl && (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) && !rawUrl.includes("placeholder")
      ? rawUrl
      : "https://placeholder-project.supabase.co";

  const cookieKey =
    typeof document !== "undefined"
      ? document.cookie
          .split("; ")
          .find((row) => row.startsWith("peach_sb_anon_key="))
          ?.split("=")[1]
      : null;
  const decodedCookieKey = cookieKey ? decodeURIComponent(cookieKey) : null;

  const rawKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    (typeof window !== "undefined"
      ? localStorage.getItem("peach_supabase_anon_key") || localStorage.getItem("peach_sb_anon_key")
      : null) ||
    decodedCookieKey;

  const key = rawKey && !rawKey.includes("placeholder") ? rawKey : "placeholder-anon-key";

  return createBrowserClient(url, key);
}

export { createClient as createSupabaseBrowserClient };

