# Milestone 6 — Project Workspace

## Added
- Shared business/creative project workspace
- Live project progress percentage
- Creative check-ins:
  - Concept / Research 30%
  - Designing 55%
  - Proof Ready 80%
  - Final Delivery 100%
- Progress history
- Private project chat
- Private project file storage
- Evidence/proof/final-delivery uploads
- Waiting on Client protection
- Client response resumes project and extends the deadline by the waiting period
- Revision-round limits
- Final client approval
- Deadline countdown
- Server-side deadline watch foundation
- 48-hour stale-progress detection
- Project timeline/system events

## Important accountability rules
A creative's check-in is stored as project evidence.

If a creative needs something from the client, they can mark the project Waiting on Client. The client-delay period is added back to the deadline when the client responds.

Clients cannot request unlimited included revisions. The project agreement's revision-round count is enforced.

Client final approval changes the project to `approved`; Peach HQ still performs the payout/completion step from Milestone 4.

## File security
Project files live in a private Supabase Storage bucket.
Access is limited to project participants and Peach admins.

## Deadline watch
Schedule:
POST `/api/system/deadline-watch`
with:
`x-peach-cron-secret: <PEACH_CRON_SECRET>`

Recommended production cadence: hourly.

## Next milestone
Milestone 7 should finish the operational loop:
- admin dispute/evidence review
- full/partial coin resolutions
- payout execution through Stripe Connect
- payout readiness enforcement
- overdue escalation
- notifications/email foundation
- profitability guardrail before payout
