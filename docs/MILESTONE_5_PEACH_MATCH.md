# Milestone 5 — Peach Match

## Added
- Ranked creative matching engine
- Specialty matching
- Minimum Peach Level eligibility
- Reliability weighting
- Creative capacity weighting
- Remote/in-person location logic
- Admin match workbench
- Private offer creation
- Exact cash payout on the offer
- 72-hour expiration
- Creative Accept / Counter / Decline
- Admin counteroffer response route
- Automatic withdrawal of other live offers after acceptance
- Offer-expiration cleanup function and protected cron endpoint

## Match score
The score is a ranking aid, not an automatic hiring decision.

Current factors:
- primary specialty
- secondary specialty
- Peach Level
- reliability score
- current workload/capacity
- remote availability
- city/state for in-person work

Peach HQ still decides who receives an offer.

## Fiverr difference
There is no public job board where dozens of creatives bid.

The flow is:
Project → Peach ranks qualified creatives → Peach chooses a match → one private offer → creative accepts/counters/declines.

## Counteroffers
A creative can request a different payout and explain why.
Peach can:
- accept the counter
- reject it
- send another payout proposal

The business is not exposed to the creative payout negotiation.

## Offer expiration
Offers expire after 72 hours.

For deployment, schedule a server/cron request to:
POST `/api/system/expire-offers`
with header:
`x-peach-cron-secret: <PEACH_CRON_SECRET>`

## Next milestone
Project workspace:
- progress stages
- required check-ins
- screenshots/files
- project chat
- deadline warnings
- Waiting on Client
- proof + revisions + final submission
