# Peach Network — Launch Readiness

This milestone hardens the MVP; it does not mean the app should accept live customer money today.

## Before a private beta
1. Create the production Supabase project.
2. Run every SQL migration in order.
3. Configure Auth redirect URLs.
4. Create the production Stripe account/configuration.
5. Add the Stripe webhook endpoint and webhook secret.
6. Complete Stripe Connect platform configuration.
7. Confirm Peach's business bank payout account in Stripe.
8. Keep Stripe Tax disabled until transaction taxability is confirmed.
9. Configure production email delivery and verified sender domain.
10. Replace temporary PWA icons with the approved Peach Network logo files.
11. Have counsel review Terms, Privacy and Peach Coin Policy.
12. Have an Alabama tax professional confirm tax treatment and filing workflow.
13. Create at least one real admin account and remove test/admin emails.
14. Test the complete transaction in Stripe test mode before using live keys.

## Required production secrets
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- NEXT_PUBLIC_APP_URL
- PEACH_CRON_SECRET
- RESEND_API_KEY (only if Resend email delivery is enabled)
- PEACH_EMAIL_FROM

Never expose service-role or Stripe secret keys to browser bundles.

## Security checks
- Admin routes have server-side role protection.
- Sensitive wallet mutation functions execute only through the service role.
- Stripe webhooks verify signatures and are idempotent.
- Project files are private.
- Downloads use temporary signed URLs.
- Banking data remains with Stripe Connect.
- PWA service worker does not cache API responses.

## Required test scenarios
Business:
- signup
- buy each membership in test mode
- buy each Peach Pack
- verify Coin rollover/cap
- create project
- insufficient Coin attempt
- project cancellation before work
- dispute after work begins

Creative:
- apply
- remain blocked before approval
- admin assigns Peach Level
- receive private offer
- decline
- counter
- accept
- complete Stripe Connect test onboarding
- submit progress evidence
- mark Waiting on Client
- submit final work

Admin:
- rank creatives
- send offer
- review counter
- review dispute evidence
- full return
- partial return
- approve payout
- attempt payout when Stripe setup is incomplete
- send test payout

Failures:
- repeated Stripe webhook
- repeated payout button click
- expired offer
- two creatives attempting the same project
- upload too large
- unauthorized file download
- missing progress update
- overdue project
- tax disabled/enabled test configurations

## Suggested beta
Start with a small invite-only group of businesses and creatives. Use Stripe test mode first, then a tightly controlled live pilot after legal/tax/payment checks are complete.

## Schema smoke test
Before connecting Stripe test payments, run every migration in order on a fresh Supabase project and confirm:
- a business can create a project
- a creative can receive and accept an offer
- project messages use the `body` column
- a dispute can be opened without a NOT NULL error
- `dispute_review` is accepted as a project status
- webhook retry rows can move from failed back to processing
