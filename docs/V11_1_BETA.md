# Peach Network V11.1 Beta

This beta rebuild focuses on the user testing feedback from V11.

## Included
- Brand splash rebuilt so the three Peach bars slide into the A instead of crossing a finished logo.
- Wallet rewritten as a guided purchase experience: membership use cases, one-time Peach Packs, top-up explanation, wallet caps, project examples, and confidence messaging.
- Stripe checkout no longer hard-fails when `NEXT_PUBLIC_APP_URL` is absent; it falls back to the deployment origin.
- Business profiles: logo/photo, phone, website, industry, description, optional address, common creative needs, preferred contact.
- Creative profiles: photo, bio, specialties, tools, industries, portfolio, education, availability, remote work, service radius, mentor information, Peach level, certifications and featured work.
- Featured-work entries feed the matching pool for approved real creatives.
- Peach Match Beta ranks approved real creatives plus six clearly labeled demo creatives. Beginners receive a modest fairness boost when their actual portfolio/specialty fit is strong.
- Optional OpenAI Responses API reranking if `OPENAI_API_KEY` is configured; otherwise the deterministic smart-match fallback keeps the beta functional.
- Project workspace supports project assets, proofs, progress evidence, revision references and final-delivery files with secure downloads.
- Creative can request missing client items; project moves to Waiting on Client until requests are resolved.
- Business can request revisions from proof review and approve proofs/final delivery.
- Mobile fixes: date input overflow, long text wrapping, horizontally scrollable project tabs, extra page bottom space above fixed nav.
- Additional app motion added around matching and result cards.

## Database
The additive `v11_1_beta_experience` migration was applied to Supabase project `ubkjiovdunicyzakfcya` on 2026-09-12. It creates the profile fields, demo creatives, portfolio/certification tables, project file records, client item requests, revision requests and storage buckets needed by this beta.

## Important beta boundaries
- Stripe remains TEST/Sandbox only.
- The existing non-atomic coin-hold fallback is still not production/live-money safe.
- Live AI reranking requires a separate OpenAI API key. Without it, Peach Match uses the built-in smart matching algorithm and still returns a shortlist.
- Demo creatives are marked DEMO and must never receive real paid offers.
- Coin expiration timing has intentionally not been invented. The UI explains caps and future expiration reminders without enforcing a made-up expiration period. Finalize the business policy before implementing automatic expiration.
