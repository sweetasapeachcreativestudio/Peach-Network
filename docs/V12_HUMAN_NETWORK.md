# Peach Network V12 — Human Network Experience

V12 intentionally replaces the patch-style V11 homepage with a cleaner product structure.

Included in this package:
- Rebuilt animated splash: A stems appear first, then three peach bars physically travel into the A, then NETWORK appears.
- Rebuilt public homepage with one dominant human photo, stronger whitespace, readable hierarchy and obvious Sign In.
- Peach Match AI is front-and-center with a plain-language project prompt that carries the brief into the project builder.
- Existing project-level `/api/projects/ai-match` route remains the actual shortlist engine. When `OPENAI_API_KEY` exists it can use AI reranking; otherwise the deterministic matcher remains available.
- Public `/network` page for events, learning, network news and community updates.
- Network link added to the signed-in app header without overcrowding the bottom navigation.
- Network news feed expanded with event and Academy items.
- Quirky Peach sayings are used as small supporting moments rather than the main visual language.
- Human photography remains central; the Peach mascot is secondary.
- Existing V11.2 business dashboard, redesigned inbox, wallet, profiles, project workspace and matching routes are preserved.
- Project builder accepts an initial plain-language brief from Peach Match.

Known beta boundaries remain unchanged: Stripe test mode only; money/dispute hardening is not production-complete.
