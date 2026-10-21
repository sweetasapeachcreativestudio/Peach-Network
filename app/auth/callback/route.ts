import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next');
  const roleParam = searchParams.get('role');

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data?.user) {
      const user = data.user;

      // 1. Determine target role from URL parameter, next path, or database
      let userRole: 'business' | 'creative' = 'business';
      if (roleParam === 'creative' || (next && (next.includes('hub') || next.includes('creative')))) {
        userRole = 'creative';
      }

      // 2. Check existing profile in Supabase
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
        console.error('Profile sync error:', err);
      }

      // 3. Ensure business or creative supporting record exists
      try {
        if (userRole === 'business') {
          const { data: existingBiz } = await supabase
            .from('businesses')
            .select('id')
            .eq('owner_user_id', user.id)
            .maybeSingle();

          if (!existingBiz) {
            const bizName = user.user_metadata?.business_name || (user.user_metadata?.full_name ? `${user.user_metadata.full_name}'s Business` : 'My Business');
            const { data: createdBiz } = await supabase
              .from('businesses')
              .insert({
                owner_user_id: user.id,
                name: bizName,
                industry: 'Commercial & Creative',
              })
              .select('id')
              .single();

            if (createdBiz) {
              await supabase.from('coin_wallets').insert({
                business_id: createdBiz.id,
                available_coins: 0,
                held_coins: 0,
              });
            }
          }
        } else {
          const { data: existingCr } = await supabase
            .from('creatives')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle();

          if (!existingCr) {
            await supabase.from('creatives').insert({
              user_id: user.id,
              application_status: 'approved',
              peach_level: 'fresh',
              primary_specialty: 'Graphic Design & Branding',
              city: 'Birmingham',
              state: 'AL',
            });
          }
        }
      } catch (err) {
        console.error('Record creation error:', err);
      }

      // 4. 🎯 ROUTE TO THE REAL PAGES (Never send to broken /business):
      let destination = next;
      if (!destination || destination === '/' || destination === '/business') {
        destination = userRole === 'creative' ? '/hub' : '/dashboard/business';
      }

      const response = NextResponse.redirect(`${origin}${destination}`);

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
  }

  // Fallback redirect if error or missing code
  return NextResponse.redirect(`${origin}/signin?error=auth_failed`);
}
