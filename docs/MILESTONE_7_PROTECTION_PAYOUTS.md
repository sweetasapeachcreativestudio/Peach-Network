# Milestone 7 — Protection, Disputes & Payouts

The core Peach transaction loop is now connected end-to-end.

## Disputes
A business or assigned creative can open a dispute.
Peach HQ sees:
- both statements
- recorded progress check-ins
- evidence/file history
- committed Peach Coins

Peach can resolve with:
- full coin return
- partial coin return
- creative paid / no coin return
- split resolution
- continue project

Resolution is an admin action, not an AI decision.

## Stripe Connect payouts
Approved payout obligations can now be sent through Stripe Connect.

Before transfer:
- creative must have a connected Stripe account
- details must be submitted
- payouts must be enabled

Stripe transfer uses an idempotency key based on Peach payout ID so repeated button presses do not intentionally create duplicate transfers.

Raw bank account information remains with Stripe.

## Notifications / overdue operations
A notifications table and protected operations-watch endpoint were added.
It detects:
- due within 24 hours
- overdue
- no progress update in 48 hours

Run the endpoint on an hourly schedule in production.

## Profitability
A reusable 35% contribution-margin guardrail helper is included.
The next production-hardening pass should connect actual weighted coin revenue to every project so HQ can block or review low-margin payouts/scopes.

## Important production note
"Stripe transfer created" means Peach transferred funds to the creative's connected Stripe account. The creative's bank payout timing is controlled by the connected account's Stripe payout schedule.

## Next milestone
Product hardening + launch readiness:
- notification delivery by email
- signed file-download URLs
- richer audit screens
- project profitability using real membership/pack coin cost basis
- database tests for wallet concurrency
- webhook tests
- error monitoring
- deployment configuration
- installable PWA manifest/icons
- terms/privacy/Peach Coin policy screens
