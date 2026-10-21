import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  (typeof window !== 'undefined' ? localStorage.getItem('peach_supabase_url') : null) ||
  'https://placeholder-project.supabase.co';

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  (typeof window !== 'undefined' ? localStorage.getItem('peach_supabase_anon_key') : null) ||
  'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
