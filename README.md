# Peach Network MVP

This is the first real code foundation for Peach Network.

## Stack
- Next.js 15 / React
- TypeScript
- Supabase (Auth, Postgres, Storage, Realtime)
- Stripe + Stripe Connect
- Vercel

## Core money loop
1. Business pays Peach Network.
2. Peach issues service credits ("Peach Coins").
3. Business submits a project.
4. Coins are held when an offer is accepted.
5. Creative completes work and submits evidence.
6. Client approves or a dispute is reviewed.
7. Coins become spent.
8. Creative payout becomes payable.
9. Peach retains the remaining revenue.

## Core product roles
- `business`
- `creative`
- `admin`

## Peach Levels
- `seed`
- `sapling`
- `tree`
- `blossom`
- `root`

Creatives do not self-assign levels. Peach admins assign them after review.

## Important
Tax is tracked separately from Peach revenue. Do not hard-code one Alabama rate for every transaction. Production taxability should be configured by transaction/product type and jurisdiction.

## Run locally
1. Install Node.js 20+
2. Copy `.env.example` to `.env.local`
3. Add Supabase + Stripe keys
4. Run:
   ```bash
   npm install
   npm run dev
   ```

## Database
Run `supabase/schema.sql` in the Supabase SQL editor.

## Status
This is a build foundation, not a deployed production app yet.

## Milestone 1 update
This v2 starter includes Supabase auth, roles, profile bootstrapping, a creative application flow, and first-pass RLS.

## Milestone 2 update
This v3 starter adds the real admin creative-review queue, secure Peach Level assignment, audit logging, and creative approval gating.

## Milestone 3 update
This v4 starter adds Stripe Checkout, webhook-driven Peach Coin issuance, membership rollover caps, Stripe Connect onboarding, tax tracking, and a live wallet UI foundation.

## Milestone 4 update
Project creation, coin recommendations, trusted holds, cancellation protection, completion-to-payout obligations, and payout readiness status are now included.

## Milestone 5 update
Peach Match now ranks approved creatives, supports private offers, counteroffers, 72-hour expiration, and capacity/location/reliability-aware matching.

## Milestone 6 update
The shared Project Workspace now includes check-ins, progress evidence, chat, private files, deadline protection, revisions, and client final approval.

## Milestone 7 update
Dispute review, full/partial coin resolutions, Stripe Connect payout execution, notifications, and overdue operations are now included.

## Milestone 8 update
Launch-hardening foundation added: installable PWA shell, security headers, server-side admin guard, signed project-file downloads, optional transactional email delivery, legal/policy draft screens, cron deployment config, and launch/deployment checklists.

**Important:** this is still a pre-production MVP. Do not switch Stripe to live money until the launch checklist, legal review, Alabama tax review, and full test-mode transaction flow are complete.

## Milestone 9 update — Stabilization before deployment
A database/code compatibility pass found and fixed several launch blockers in the accumulated MVP migrations, including project-status enum mismatches, message-column differences, dispute required fields, pack-cap charging risk, Stripe webhook retry behavior, and payout retry behavior.

Run `supabase/milestone8_schema_stabilization.sql` after the earlier migrations before test deployment.

## V11.2 Human Experience
See `docs/V11_2_HUMAN_EXPERIENCE.md` for the human-centered visual redesign, Peach Match AI surfacing, Peach Pulse, Wallet refresh, Messages refresh and revised brand animation.
