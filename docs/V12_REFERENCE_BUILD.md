# Peach Network V12 — Approved Reference Build

This build intentionally follows the approved UI reference in `docs/APPROVED_UI_REFERENCE.jpeg`.

## Visual rules
- Warm cream / peach / forest-green palette.
- Real human photography is the primary emotional layer; Peach graphics are secondary.
- Clean cards, large readable headings, generous spacing, simple bottom navigation.
- Peach personality appears in small moments, not as constant decoration.
- Business utility screens remain compact and easy to scan.

## Rebuilt experiences
- Splash: three peach bars physically travel into the A before NETWORK reveals.
- Landing: human hero, clear business/creative CTAs, Peach Match AI, human specialty cards.
- Sign-in: human image on the brand panel.
- Business home: greeting, quick actions, wallet/project stats, Peach Match AI, Network Pulse.
- Business profile: visual profile preview, example image until the member uploads one, business needs and contact context, with full editor below.
- Projects: rich project cards with progress, status, person/image, coin and deadline context.
- Messages: human inbox, Peach Match row, Peach Assistant guidance and friendly empty state.
- Wallet: compact balance, memberships / packs, coin examples, Ask Peach estimate and ledger.
- Notifications: safe feed with filters and calm empty-state preview.
- Ask Peach: dedicated project-planning assistant surface with deterministic beta estimates and handoff to project creation.
- Network: dedicated events + news page.
- Creative dashboard: human profile, private matches, projects, payouts and Network access.

## AI boundary
`/api/projects/ai-match` remains the core matching route and can use the configured OpenAI key for AI reranking. Ask Peach's coin-planning surface is currently a deterministic beta estimator; it does not silently send messages or make commitments for a user.

## Launch boundary
Stripe must remain in TEST/Sandbox while the accounting and payout launch blockers are still open. This visual build does not claim production money readiness.
