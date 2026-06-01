# Cron schedule — anchored to Chicago (US Central)

**Effective:** 2026-06-01
**Source of truth for the UTC values:** `vercel.json`
**Why this doc exists:** `vercel.json` is strict JSON and cannot hold comments, and Vercel cron schedules are UTC-only (no timezone field). This table is the human-readable Chicago expression of every cron so the schedule reads in the timezone the business runs on.

## The anchor

Every cron is anchored to **Central Standard Time (CST, UTC−6)** at a clean local hour. Because the stored value is a fixed UTC number, each cron fires **one hour later in Chicago during Daylight time** (CDT, UTC−5, mid-March to early-November). That drift is expected and harmless for these jobs — none is time-critical to the minute.

## The suite

| Cron | UTC (`vercel.json`) | Chicago (CST anchor) | Chicago in summer (CDT) | What it does |
|---|---|---|---|---|
| `/api/cron/affiliate` | `0 8 * * *` | **2:00 AM** | 3:00 AM | Promotes affiliate attributions `pending → cleared` once the 30-day refund window passes. |
| `/api/cron/abandonment` | `0 13 * * *` | **7:00 AM** | 8:00 AM | Abandoned-checkout follow-up. |
| `/api/cron/drip` | `0 14 * * *` | **8:00 AM** | 9:00 AM | Lifecycle drip email. |
| `/api/cron/dropoff` | `0 15 * * *` | **9:00 AM** | 10:00 AM | Course drop-off re-engagement. |
| `/api/cron/review` | `0 16 * * *` | **10:00 AM** | 11:00 AM | Review / feedback request. |

All five land on clean CST hours and run in series across the 2 AM – 10 AM Central window, staggered an hour apart so no two fire together.

## If you want exact Chicago time year-round

The fixed-UTC drift means each job shifts an hour when the clocks change in March and November. If a job ever needs to hit an exact Chicago hour regardless of season, the only way with Vercel cron is to edit its UTC value by one hour twice a year. Not worth automating for these maintenance jobs — documented here so the drift is never a surprise.

## How to change one

1. Pick the Chicago hour you want.
2. Convert to UTC at the CST anchor: **UTC = Central + 6**. (e.g. 2 AM Central → `0 8`; 7 AM Central → `0 13`.)
3. Edit the `schedule` in `vercel.json`.
4. Update the row above.
5. Deploy — Vercel picks up the new schedule on the next deploy.
