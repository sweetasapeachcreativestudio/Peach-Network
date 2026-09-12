# Peach Network Test Plan

Before live launch, automate the scenarios in `docs/LAUNCH_READINESS.md`.

The current repository intentionally treats payment, wallet and dispute logic as high-risk code. Production CI should block deployment if:
- type checking fails
- wallet transaction tests fail
- Stripe webhook idempotency tests fail
- authorization tests fail
- payout idempotency tests fail
