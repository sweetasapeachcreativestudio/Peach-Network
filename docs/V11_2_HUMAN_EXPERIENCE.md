# Peach Network V11.2 — Human Experience

This build is a visual/product correction focused on making Peach Network feel like a real community instead of a generic software dashboard.

## What changed
- Replaced homepage CSS portrait cartoons with photorealistic creative-community imagery.
- Rebuilt the splash animation: the three Peach bars assemble first, NETWORK appears, then the real Peach Network logo resolves before the app opens.
- Added a lightweight Peach mascot system for quirky brand personality without using random emoji icons.
- Made Peach Match AI highly visible on the public homepage and business dashboard.
- Peach Match still runs from a real project and returns a curated top-three shortlist. If `OPENAI_API_KEY` exists, the existing live AI reranking path is used; otherwise the deterministic smart matcher remains the fallback.
- Added human portrait treatment to demo match results.
- Added Peach Pulse / Network News cards for current product launches and network openings.
- Rebuilt business and creative Messages into an inbox-style experience using project people, last messages, status and direct project-chat links.
- Rebuilt Wallet hero and activity treatment with people, clearer coin storytelling and more brand personality.
- Added mobile-responsive rules for the new human/photo layouts.

## Important boundaries
- Network Pulse is currently a code-managed feed in `lib/network-feed.ts`; it can be moved to Supabase/CMS later.
- Photorealistic beta imagery in `public/people/` is generated concept imagery, not claims about specific Peach Network members.
- Stripe remains TEST only.
- This does not change the previously documented production money hardening gaps.
- Full `npm install` timed out in the build environment, so a complete Next build was not run here. A TypeScript parse-only check reported no TS1xxx syntax errors in the source.
