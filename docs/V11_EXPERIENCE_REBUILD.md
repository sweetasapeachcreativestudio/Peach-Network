# Peach Network V11 — Experience Rebuild

This version rebuilds the customer-facing Peach Network experience around the original product vision and the first live user test.

## Visible experience changes
- Uses the supplied Peach Network logo as the primary brand asset.
- Adds a first-load animated Peach splash with three-bar motion.
- Removes customer-facing "MVP Foundation" language and random emoji navigation.
- Adds a public landing page with prominent Sign In, clear Business / Creative paths, human illustrations, and a three-panel "How Peach Works" story.
- Adds "Powered by Sweet As A Peach Creative Agency" on public/auth surfaces.
- Uses the full PEACH NETWORK identity publicly and compact PEACH wordmark inside the app.
- Increases body type contrast/size and adds larger obvious controls for accessibility.

## Business experience
- Business dashboard now requires a real signed-in business account instead of showing fake demo data.
- Real wallet/project data is loaded server-side after session verification.
- Adds mobile app navigation: Home, Projects, Messages, Wallet, Profile.
- Adds visible Profile/Account/Log Out controls.
- Adds guided Start a Project flow with visual categories, service choices, live Peach Coin estimate, deadline/revision inputs, and actual project creation.
- Successful project creation now redirects into the new project workspace.
- Adds project progress visualization across Matched → Accepted → Creating → Proof → Revisions → Approved → Complete.
- Adds project list and project-message hub.

## Creative experience
- Creative dashboard is distinct from the business dashboard.
- Surfaces Peach level, specialty, reliability standing, private matches, active projects, and pending payout.
- Adds dedicated Matches, Projects, Messages and Profile navigation.
- Rebuilds the creative application submission through a trusted server route.
- Match cards show payout, scope, deadline and revisions before Accept / Counter / Decline.

## Project workspace
- Adds prominent project progress system.
- Adds project chat using the original V1 project_messages schema.
- Adds creative check-ins that update status and progress history without requiring later workspace migrations.
- Adds matching-state experience while Peach is finding a creative.
- Adds progress history, timeline, scope summary and proof/evidence summary.

## Auth fixes
- Signup now sets a dedicated Peach Network email callback URL.
- Added /auth/callback to exchange Supabase confirmation codes and return users to the correct onboarding path.
- Sign in is visible from the public header and repeated in the hero.

## Compatibility strategy
V11 core customer pages intentionally use the original schema that is already applied in Supabase wherever practical. This avoids requiring milestone 6/8 tables just to test the redesigned experience.

## Still NOT cleared for live money
- Stripe must remain in Test/Sandbox mode.
- Creative offer coin hold currently includes a server-side V11 compatibility fallback. It is not atomic and must be replaced with the deployment-gate database RPC before live launch.
- Final payout/settlement semantics and full dispute accounting still need launch hardening.
- File/proof binary storage UI is not fully activated yet; check-in evidence/history is visible, while full storage remains part of the next database/storage patch.
- Some older admin/cron routes still depend on later milestone schema and are not the focus of this experience build.

## Build validation
The code was syntax-checked with TypeScript parsing, but local dependency installation timed out in the container. Vercel should be used as the full Next.js build checker, as with the prior deployment.
