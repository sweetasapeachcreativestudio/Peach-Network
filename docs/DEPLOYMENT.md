# Deployment

## Recommended first deployment
Vercel + Supabase + Stripe.

### Vercel
- Import the repository.
- Add every production environment variable.
- Set NEXT_PUBLIC_APP_URL to the production HTTPS origin.
- Deploy.
- Confirm `/manifest.webmanifest` loads.
- Confirm the site can be installed from a supported mobile browser.

### Supabase
Run SQL files in order:
1. schema.sql
2. auth_and_rls.sql
3. milestone3_money.sql
4. milestone4_projects.sql
5. milestone5_matching.sql
6. milestone6_workspace.sql
7. milestone7_protection_payouts.sql
8. milestone8_schema_stabilization.sql

Check all RLS policies in the production project.

### Stripe
Use test mode first.
Configure webhook endpoint:
`https://YOUR-DOMAIN/api/stripe/webhook`

Subscribe to the events used by the app:
- checkout.session.completed
- invoice.paid
- customer.subscription.deleted

### Cron
`vercel.json` includes hourly operational jobs.
Set PEACH_CRON_SECRET in the deployment environment.

### Email
The app includes an optional transactional email adapter.
When RESEND_API_KEY and PEACH_EMAIL_FROM are configured, operational Peach notifications also attempt email delivery.
If they are absent, the app still creates in-app notifications.

### PWA
Temporary branded icons are included for development.
Replace them with approved final Peach Network icon artwork before public launch.
