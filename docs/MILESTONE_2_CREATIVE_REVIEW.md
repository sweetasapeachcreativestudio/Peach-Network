# Milestone 2 — Real Creative Review

## What this adds
- Admin creative application queue
- Detailed application review page
- Admin-only Peach Level assignment
- Approve / Needs More Work / Reject actions
- Trusted server route using the Supabase service role
- Audit log entry for every decision
- Creative status page
- Creative route role guard

## Flow
Creative:
1. Creates account
2. Submits application
3. Application status = `submitted`
4. Checks `/creative/status`
5. Peach admin reviews the application
6. If approved, Peach assigns a level
7. Creative opens dashboard with their approved Peach Level

Admin:
1. Open `/admin/creatives`
2. Select applicant
3. Review specialty, location, experience, tools, portfolio
4. Choose Peach Seed / Sapling / Tree / Blossom / Root
5. Add private notes
6. Approve, request more work, or reject
7. Decision is written to `audit_log`

## Security
The browser does not directly update Peach Level.

The API route:
- verifies the signed-in user
- verifies `profiles.role = admin`
- uses the service-role key only on the server
- writes an audit record

Never expose `SUPABASE_SERVICE_ROLE_KEY` to browser code.

## Next milestone
Stripe:
- business memberships
- Peach Packs
- webhook-driven Peach Coin issuance
- creative Stripe Connect onboarding
- tax layer
