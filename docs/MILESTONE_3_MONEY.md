# Milestone 3 — Real Money Foundation

## Added
- Stripe Checkout for all 3 memberships
- Stripe Checkout for all 3 Peach Packs
- Stripe customer creation for businesses
- Stripe webhook verification
- Webhook idempotency table
- Webhook-driven Peach Coin issuance
- Membership rollover caps
- Pay-as-you-go wallet cap
- Business Peach Wallet page
- Coin activity ledger
- Tax amount tracking separate from revenue
- Stripe Connect Express onboarding for approved creatives
- Creative payout setup + payout-history screen

## Current prices
Memberships:
- Essentials: $499 / 5 coins / cap 7
- Growth: $1,099 / 10 coins / cap 14
- Partner: $2,199 / 20 coins / cap 28

One-time:
- 3 coins: $425
- 5 coins: $675
- 10 coins: $1,250

## Required environment variables
Add to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Keep FALSE until Peach confirms taxability/configuration.
ENABLE_STRIPE_TAX=false
```

## SQL
Run:
1. `supabase/schema.sql`
2. `supabase/auth_and_rls.sql`
3. `supabase/milestone3_money.sql`

## Stripe webhook events to subscribe to
- `checkout.session.completed`
- `invoice.paid`
- `customer.subscription.deleted`

## Important tax rule
This code does NOT assume every Alabama Peach transaction is taxable.

`ENABLE_STRIPE_TAX` remains configurable. Tax collected by Stripe is stored separately from Peach revenue.

Before production launch:
- confirm Peach Network transaction taxability with a qualified Alabama tax professional
- configure Stripe Tax/product tax codes appropriately
- test Alabama/local jurisdiction handling
- confirm filing/remittance workflow

## Important accounting rule
Unused Peach Coins can create future fulfillment cost.
The wallet and ledger therefore track:
- available coins
- held coins
- issued/purchased credits
- tax collected
- cash value tied to the transaction

## Security
The browser never issues Peach Coins.
Only verified Stripe webhook events call the trusted Supabase functions that modify wallet balances.

## Next milestone
Project money controls:
- create project
- calculate/recommend coins
- hold coins when an offer is accepted
- release coins on eligible cancellation
- spend coins on approval
- generate creative payout obligation
