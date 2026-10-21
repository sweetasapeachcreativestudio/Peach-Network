import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/dashboard/business';

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const response = NextResponse.redirect(`${origin}${next}`);
      if (data?.user) {
        const role = next.includes('hub') || next.includes('creative') ? 'creative' : 'business';
        response.cookies.set('peach_role', role, {
          path: '/',
          maxAge: 604800,
          sameSite: 'none',
          secure: true,
        });
        response.cookies.set('peach_session', encodeURIComponent(JSON.stringify(data.user)), {
          path: '/',
          maxAge: 604800,
          sameSite: 'none',
          secure: true,
        });
      }
      return response;
    }
  }

  // Fallback redirect if error or missing code
  return NextResponse.redirect(`${origin}/signin?error=auth_failed`);
}
