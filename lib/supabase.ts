import { createClient } from "@supabase/supabase-js";

const rawUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  (typeof window !== "undefined" ? localStorage.getItem("peach_supabase_url") : null);

const supabaseUrl =
  rawUrl && (rawUrl.startsWith("http://") || rawUrl.startsWith("https://"))
    ? rawUrl
    : "https://placeholder-project.supabase.co";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  (typeof window !== "undefined" ? localStorage.getItem("peach_supabase_anon_key") : null) ||
  "placeholder-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
