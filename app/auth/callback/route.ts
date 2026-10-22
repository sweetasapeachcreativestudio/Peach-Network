import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next');
  const roleParam = searchParams.get('role');

  // Determine intended destination
  let destination = next;
  if (!destination || destination === '/' || destination === '/business') {
    destination = roleParam === 'creative' ? '/hub' : '/dashboard/business';
  }

  // 1. If server received a PKCE code, attempt server-side session exchange
  if (code) {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error && data?.user) {
        const user = data.user;
        let userRole: 'business' | 'creative' = roleParam === 'creative' ? 'creative' : 'business';

        // Check profile
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();

          if (profile?.role === 'creative' || profile?.role === 'business') {
            userRole = profile.role;
          } else {
            await supabase.from('profiles').upsert({
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
              role: userRole,
            });
          }
        } catch (err) {
          console.error('Profile fetch error:', err);
        }

        // Final destination based on actual role
        const finalDest = userRole === 'creative' ? '/hub' : '/dashboard/business';
        const response = NextResponse.redirect(`${origin}${finalDest}`);

        response.cookies.set('peach_role', userRole, {
          path: '/',
          maxAge: 604800,
          sameSite: 'lax',
          secure: true,
        });

        response.cookies.set('peach_session', encodeURIComponent(JSON.stringify(user)), {
          path: '/',
          maxAge: 604800,
          sameSite: 'lax',
          secure: true,
        });

        return response;
      }
    } catch (err) {
      console.warn('Server code exchange notice:', err);
    }
  }

  // 2. Client-side Bridge:
  // Catches hash fragments (#access_token=...) and routes straight to your dashboard
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Connecting to Peach Network...</title>
  <script>
    (function() {
      try {
        var hash = window.location.hash || '';
        var search = window.location.search || '';
        var savedRole = localStorage.getItem('peach_auth_role');
        var targetRole = '${roleParam || ''}' || savedRole || 'business';

        if (hash.indexOf('role%22%3A%22creative') !== -1 || hash.indexOf('role":"creative') !== -1) {
          targetRole = 'creative';
        } else if (hash.indexOf('role%22%3A%22business') !== -1 || hash.indexOf('role":"business') !== -1) {
          targetRole = 'business';
        }

        localStorage.removeItem('peach_auth_role');

        var dest = targetRole === 'creative' ? '/hub' : '/dashboard/business';
        window.location.replace(dest);
      } catch (e) {
        window.location.replace('${destination}');
      }
    })();
  </script>
</head>
<body style="background-color:#FAF8F5;font-family:system-ui,-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;color:#0B2D22;">
  <div style="text-align:center;">
    <div style="font-size:36px;margin-bottom:12px;">🍑</div>
    <div style="font-size:18px;font-weight:bold;margin-bottom:6px;">Welcome to Peach Network</div>
    <div style="font-size:13px;color:#64748B;">Routing you to your dashboard...</div>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html' },
  });
}
