# Friday Report & CSV Exports

How the Friday report works, what it covers, and how to pull a CSV if
you want to run your own analysis or merge AESDR data into a wider
partner dashboard.

## The Friday report

Every Friday during your pilot — and through the close of the 30-day
attribution window — you receive a one-page email report covering:

- **Clicks on your link**, day-by-day, by UTM source / medium / campaign / content
- **Registrations**, day-by-day, grouped by your launch vs. reminder sends
- **Live workshop attendance count** (the day after the workshop)
- **72-hour replay attendance count** (the day after replay window closes)
- **Enrollments to date** (gross), plan mix shown
- **Refund status** — any refunds within the 14-day window are flagged
- **Projected commission**, with the math shown line-by-line:
  gross → minus refunds → minus Stripe fees → net → 30% = your commission

The report is the same data we're looking at on our side. No surprises
at the close.

## Sample report (anonymized)

```
AESDR PILOT REPORT — Week 3 of 4
Partner: bdr-club
Period: 2026-XX-XX to 2026-XX-XX

CLICKS BY SOURCE
  email/launch        ............ 184
  email/reminder      ............  46
  social/launch       ............  82
  podcast/launch      ............  12
  TOTAL ........................... 324

REGISTRATIONS BY DAY
  Day 1 (launch)      ............  41
  Day 2               ............  11
  Day 3               ............   4
  Day 8 (reminder)    ............  18
  Day 9               ............   5
  Day 10 (workshop)   ............   3
  TOTAL ...........................  82

WORKSHOP ATTENDANCE
  Live              ............... 37 (45%)
  Replay (72h)      ............... 14 (17%)
  Total touched     ............... 51 (62%)

ENROLLMENTS TO DATE
  SDR plan @ $249   ...............  7  → $1,743
  AE plan @ $299    ...............  3  → $897
  Team plan @ $1,499 ..............  0  → $0
  Gross revenue                    → $2,640

PROJECTED COMMISSION
  Gross revenue                    $2,640
  Less refunds (1 within 14d)      −$249
  Less Stripe fees                 −$76
  Net revenue                      $2,315
  Your 30%                         $694.50
  Cohort 1 sign-on (one-time)      $500
  PROJECTED TOTAL                  $1,194.50

PAYMENT TIMELINE
  Attribution window closes:       2026-XX-XX
  Refund window closes:            2026-XX-XX
  Payment wired (net-45):          2026-XX-XX
```

## CSV exports

Two CSVs are available on demand. Email the founder and we'll generate
a fresh export within 24 hours; we don't auto-send these because most
partners don't need them and we'd rather not flood your inbox.

### 1. `attribution.csv`

One row per qualifying click. Columns:

| Column | Description |
|---|---|
| `clicked_at` | ISO 8601 timestamp |
| `utm_source` | Always your slug |
| `utm_medium` | Channel (email / social / podcast / paid) |
| `utm_campaign` | Campaign name (launch / reminder / etc.) |
| `utm_content` | Specific placement |
| `referrer` | URL the click came from (where available) |
| `device_type` | desktop / mobile / tablet |
| `country` | 2-letter ISO country code (where geolocatable) |
| `registered` | `true` / `false` — did this click lead to a workshop registration |
| `registration_id` | If registered, the AESDR registration ID |

### 2. `conversions.csv`

One row per enrollment attributed to you. Columns:

| Column | Description |
|---|---|
| `enrolled_at` | ISO 8601 timestamp |
| `registration_id` | The AESDR-side ID, joinable to attribution.csv |
| `first_click_utm_*` | Your UTMs at first touch (4 columns) |
| `plan` | `sdr` / `ae` / `team` |
| `gross_price` | The list price they paid |
| `attribution_source` | `first_touch` (default) or `last_touch` if a multi-partner case |
| `refunded` | `true` / `false` |
| `refunded_at` | ISO timestamp if refunded |
| `commission_status` | `projected` / `confirmed` / `paid` |
| `commission_amount` | Your 30% on the net, or 0 if refunded |

## Joining the two

Both CSVs share `registration_id` (when present). Standard left join on
that column gives you the full click → register → enroll funnel for
your partner-attributed traffic.

In SQL:
```sql
SELECT a.utm_medium, a.utm_campaign, COUNT(DISTINCT a.registration_id) AS regs, COUNT(c.registration_id) AS enrollments, SUM(c.commission_amount) AS commission
FROM attribution a
LEFT JOIN conversions c USING (registration_id)
GROUP BY a.utm_medium, a.utm_campaign;
```

## Live partner dashboard

A read-only web dashboard with the same numbers is on the roadmap for
Cohort 2. For Cohort 1, the Friday report + on-demand CSV exports are
the system. We'd rather get the pilot loop tight before building a
dashboard than ship a dashboard that lies because we forgot to update it.

## Reporting issues

If a number on your Friday report doesn't match what you're seeing on
your end (Mailchimp opens, LinkedIn analytics, etc.), email the
founder. We'd rather investigate one mismatch than have you not trust
the numbers.
