# Crons disabled for cost control (2026-06-22)

> **Update 2026-07-06 (founder decision):** sentinel, scribe, courier, and
> dossier-enrich are **removed entirely** — cron routes deleted, tower levers
> gone. Their work is manual-only from each candidate's room: **Run brief**
> (dossier), **Scribe draft** (first-touch), **Send now** (the only sender).
> Inbound replies are worked directly in the operator's inbox. The restore
> array below reflects the surviving crons only.

Per the founder's instruction ("nothing should be running that's costing me
money"), **all Vercel cron schedules were removed** from `vercel.json` when the
audit branch was merged to `main`. The cron *routes* still exist and can be
triggered manually (they carry their own `verifyCronAuth`); they are just no
longer scheduled, so nothing fires — and nothing spends — automatically.

## What this stops
- **Consumer lifecycle emails** (drip / abandonment / dropoff / review /
  retention) — Resend sends.
- **Partner-agent pipeline** (followup / contact-finder / usher / almanac —
  sentinel, scribe, courier, and dossier-enrich were deleted 2026-07-06, see
  the update note above) — Anthropic tokens + BetterContact (per-result
  billing). NOTE: these were *already* lever-gated OFF by default
  (`agent_switches.enabled` defaults false), so they no-op'd anyway; removing the
  schedule makes it certain.
- **Affiliate commission clearing** (`affiliate`) — no spend, but also paused.

## What still costs money only on a real event (gated by `COMING_SOON`)
- A real Stripe purchase → welcome + receipt email (transactional).
- A buyer completing all 12 lessons → one Anthropic artifact-generation call.
- The landing page's 78 MB autoplay video → bandwidth, **but only if the page is
  served** (keep `COMING_SOON=true` and the public site — and the video — stay
  dormant). Re-encoding that video (P0-16) is still the real fix before launch.

## To re-enable at launch
Restore this `crons` array into `vercel.json` and redeploy:

```json
{
  "crons": [
    { "path": "/api/cron/drip",           "schedule": "0 14 * * *" },
    { "path": "/api/cron/abandonment",    "schedule": "0 13 * * *" },
    { "path": "/api/cron/dropoff",        "schedule": "0 15 * * *" },
    { "path": "/api/cron/review",         "schedule": "0 16 * * *" },
    { "path": "/api/cron/retention",      "schedule": "0 17 * * *" },
    { "path": "/api/cron/affiliate",      "schedule": "0 8 * * *" },
    { "path": "/api/cron/followup",       "schedule": "17 * * * *" },
    { "path": "/api/cron/contact-finder", "schedule": "*/5 * * * *" },
    { "path": "/api/cron/usher",          "schedule": "*/30 * * * *" },
    { "path": "/api/cron/almanac",        "schedule": "0 11 * * *" }
  ]
}
```

(Also keep the partner-agent levers off until you actually want outreach
running — those spend the most.)
