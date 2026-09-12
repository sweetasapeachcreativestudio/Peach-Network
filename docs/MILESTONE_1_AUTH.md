# Milestone 1 — Accounts + Roles

This version adds the first real backend-connected flow.

## What is implemented
- Supabase browser/server clients
- Session-refresh middleware
- Business vs Creative signup
- Email/password signin
- Automatic profile creation
- Automatic Business + zero-balance Wallet creation
- Automatic Creative draft profile creation
- Creative application submission
- Account page + sign out
- First-pass Row Level Security policies

## Setup order
1. Create a Supabase project.
2. In SQL Editor run:
   - `supabase/schema.sql`
   - `supabase/auth_and_rls.sql`
3. Add Supabase URL + anon key to `.env.local`.
4. In Authentication settings, configure your site URL.
5. Run `npm install`
6. Run `npm run dev`
7. Open `/auth`

## Admin setup
Do NOT allow public signup to create an admin.

After Stephanie's account exists, promote that user manually in Supabase:

```sql
update profiles
set role = 'admin'
where email = 'YOUR_ADMIN_EMAIL';
```

Production can later use a safer admin-management workflow.

## Security note
The first-pass RLS intentionally does NOT let browsers:
- issue or spend Peach Coins
- change Peach Levels
- approve creative payouts
- resolve disputes
- write tax records

Those require trusted server actions/database functions in later milestones.
