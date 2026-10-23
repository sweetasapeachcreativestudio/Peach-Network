"use client";

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const url =
    rawUrl && (rawUrl.startsWith("http://") || rawUrl.startsWith("https://"))
      ? rawUrl
      : "https://placeholder-project.supabase.co";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";
  return createBrowserClient(url, key);
}
