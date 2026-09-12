# Schema Stabilization Before Deployment

During launch review, several mismatches were found between the original database schema and later MVP milestones.

This milestone fixes them before a real Supabase deployment.

## Fixed
- Added missing `scope_review` and `dispute_review` project statuses.
- Reconciled `project_messages.message` with the newer `body` field.
- Added `is_system_event` to project messages.
- Ensured progress, revision, matching and location columns exist.
- Ensured `project_files` and `project_revision_requests` exist.
- Fixed dispute creation to populate the original required `opened_by` and `reason` columns.
- Added payout failure/processing fields.
- Added notification schema and RLS.
- Added durable Stripe-source IDs to the Coin ledger.
- Made failed Stripe webhook events retryable.
- Added source-level Coin idempotency so a retried webhook does not intentionally issue the same Coins twice.
- Added a checkout guard so a pay-as-you-go customer cannot pay for a Pack that would exceed the 10-Coin balance cap.
- Removed the hard-coded Stripe API version.
- Changed payout failure behavior so a temporary Stripe error does not permanently strand a payout in `failed`.

## Important
The Stripe Coin-source marking still depends on identifying the newest ledger row produced by the wallet RPC.

Before a larger public launch, the cleanest version is to extend the wallet RPCs themselves to accept and write a Stripe source ID atomically in the same database transaction.

For a small controlled beta, this version is materially safer than the prior build, but payment reconciliation should still be watched from Peach HQ.

## Migration order
Run:
1. schema.sql
2. auth_and_rls.sql
3. milestone3_money.sql
4. milestone4_projects.sql
5. milestone5_matching.sql
6. milestone6_workspace.sql
7. milestone7_protection_payouts.sql
8. milestone8_schema_stabilization.sql
