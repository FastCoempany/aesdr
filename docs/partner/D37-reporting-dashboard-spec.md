# D37 — Reporting Dashboard Spec

**Deliverable:** Build specification for AESDR's internal reporting dashboard. The single surface where the founder + ops review pilot performance, partner-attribution, and the funnel from "page view" to "net commission paid." One dashboard, reviewable in under 15 minutes, runs every business day.
**Audience:** AESDR-internal — founder, ops. The dashboard is the source-of-truth for the metrics surfaced (in aggregate, partner-safe) on D25 weekly reports.
**Voice ratio:** 90 Rowan / 10 Michael per canon §3.3 (internal docs row). Plain spec register.
**Format:** Markdown source. Reference document; partial implementation evolves with the underlying tooling. Per canon §6.5 + §8.5 if rendered to PDF.
**Implementation cadence:** v1 implementation is hand-stitched (Notion + Stripe + ESP + GA4 exports). v2 (post-batch-8) considers a proper dashboard tool. The spec is the discipline; the tooling is operational.
**Canon refs:** `AFFILIATE_BRAND_CANON.md` §1.6 (honesty discipline — applies to internal reporting too), §8.7 (UTM canon), §8.8 (attribution windows), §13 (honesty in numbers), §16 (approval gates — pricing changes affect dashboards).

> **Placeholder convention:** No partner placeholders. Internal spec.

---

## Three views, one dashboard

The dashboard answers three questions:

| View | Question | Refresh cadence | Audience |
|---|---|---|---|
| **Daily snapshot** | What happened yesterday? Anything broken? | Daily, automated by 9am ET | Founder + ops |
| **Pilot-in-flight** | Where does each active pilot stand right now? | Real-time during workshop weeks; daily otherwise | Founder + ops |
| **Quarterly cohort** | Which partner archetypes are converting; which are worth a second pilot? | Weekly, manual review | Founder |

A dashboard that surfaces all three on one page is the goal. A dashboard that surfaces one at a time forces context-switching that the canon §1.5 operating-manual register pushes back on.

---

## View 1 — Daily snapshot

The "is anything on fire?" view. Founder reviews this in 60-90 seconds with morning coffee.

### Metrics

| Metric | Source | Threshold for attention |
|---|---|---|
| Yesterday's revenue (gross) | Stripe | Not "low" alone — only when paired with a pilot-window metric below |
| Yesterday's refunds (count + dollars) | Stripe | Refund count > 0 — investigate per refund |
| Yesterday's enrollments | Stripe + AESDR app | If during pilot window: against forecast for that day |
| Yesterday's checkout-abandons (count + by-source) | Stripe webhook | Surface for D17 V3 trigger qualification |
| Yesterday's L&D-brief requests | Admissions inbox | Count + per-prospect customization status |
| Yesterday's D17 outreach + replies | D17 log | Per-pilot reply-rate |
| Yesterday's Admissions inbound (DMs + emails) | Admissions inbox | Count + reply-time SLA (4 business hours) |
| Yesterday's site uptime | Vercel / monitoring | Anything < 99.9% triggers a same-day investigation |
| Yesterday's Stripe webhook event success rate | Stripe webhook log | Anything < 100% — investigate |
| Yesterday's UTM-attribution coverage | Analytics | Conversions with no UTM / partner_id = data-loss flag |

### Honest-numbers discipline (per canon §13)

- **No green-arrow / red-arrow icons.** Numbers carry their own weight; visual icons distort attention before the operator parses the value.
- **No "% change vs yesterday" without context.** Yesterday-vs-day-before is noisy; surface week-over-week or pilot-window-over-pilot-window comparisons instead.
- **No metric omission.** If a metric drops, it stays on the dashboard. We do not hide bad days.
- **No artificial smoothing.** Raw daily values, not rolling-7-day averages, on this view. Smoothed views live on View 3.

### Layout

Dense single page. `--cream` background. Section headers in `--cond` 12pt 700, .15em, uppercase, `--ink`. Numeric callouts in `--display` italic 700, 28pt. Mono trail labels in `--mono` 11pt, `--muted`.

---

## View 2 — Pilot-in-flight

For each currently-running pilot. One panel per pilot. Multiple panels render side-by-side if multiple pilots run in parallel (rare per canon §1.3 — a handful of partners, not a marketplace).

### Per-pilot panel structure

**Header:**
- Pilot ID + Partner name + Pilot dates (start → end)
- Days remaining in pricing window
- Days remaining in attribution window
- Decision pending (D32 status)

**Funnel waterfall** (vertical, top-to-bottom):

```
Page views (registration page)         →  N
Registrations                          →  N    (X% conversion)
Live attendance                        →  N    (X% of registrations)
Replay watches                         →  N    (X% of no-shows)
Replay-watch-completion ≥75%           →  N    (X% of replay watchers)
Offer-page views                       →  N    (X% of attendees + replay watchers)
Checkout starts                        →  N    (X% of offer-page views)
Purchases                              →  N    (X% of checkout starts)
Refunds (so far)                       →  N    (X% of purchases)
Net revenue                            →  $X
Commission accrued (Partner)           →  $Y
```

**Per-stage anomaly flags:**
- Visit-to-register conversion < 20% — calibration conversation flag
- Register-to-live conversion < 35% — reminder-cadence flag
- Attendee-to-purchase < 5% with n > 20 — offer-friction flag
- Refund rate > 5% — quality flag (escalate)

**D17 outreach summary:**
- T1-T6 trigger counts (sent / replied / converted)
- Per-variant conversion rate

**Partner-side metrics (from D25 partner-share):**
- Send 1: open rate, click rate, replies-of-quality
- Send 2: same
- Cross-check vs registrations attributed to the partner-slug

**Forecast vs actual** (visible during pilot, not just at end):
- Each metric's actual against the pre-pilot estimate, with delta in `--mono`. No green/red — just signed delta.

### Drill-down

Each row is clickable to a per-stage detail view: per-event timestamps, per-prospect timeline, per-source UTM breakdown. Per canon §1.6, all data is auditable.

---

## View 3 — Quarterly cohort

The strategic view. Reviewed weekly by the founder, monthly with ops, quarterly for canon-revision input.

### Charts (smoothed, longer time horizons)

| Chart | Aggregation | Use |
|---|---|---|
| Revenue by partner archetype over time | Quarterly buckets | Identifies which archetype (community / coach / creator / alumni / hybrid) is producing returns |
| Effective hourly rate by pilot | Per-pilot bar | Per canon §1.3 — founder time is the bottleneck; this chart tells us where it pays off |
| Conversion-rate distribution across pilots | Box-plot | Shows whether AESDR's pilots converge on a conversion rate (good — predictable) or stay scattered (bad — pilot-by-pilot luck) |
| Refund rate over time | Time series | Per canon §1.6 — refund rate is a quality signal; trending up = quality drop |
| ICP-fit assessment trend | Categorical (tight/acceptable/off — from D33 §6) | Are we getting better at vetting partners? |
| Canon-revision queue depth | Count | How many pending revisions; trending up = canon under-resourcing |
| Ambassador conversion rate | Of EXTEND pilots, what % converted to ambassadorship? | Per canon §1.3 — ambassador is the graduated-pilot relationship; this is the lifecycle metric |
| Founder-time distribution | Per-week pie chart | Validation: founder time on partner conversations / workshops / Admissions / canon-revision / other |

### Honest-numbers discipline carries

Per canon §13 — same discipline as View 1. No green arrows. No "trending up / trending down" labels — let the operator read the number. Full data, not curated.

---

## Data sources

### Primary sources (real-time / near-real-time)

| Source | What it provides | Refresh |
|---|---|---|
| Stripe webhook | begin_checkout, purchase, refund events | Real-time |
| Vercel analytics | Page views, source attribution (when UTM passes through) | ~1 min |
| AESDR app DB | Registrations, enrollment status, role | Real-time |
| ESP (TBD: Resend / Postmark / Loops) | Email send / open / click / reply | ~1 min |
| Vimeo (or replay infra) | Replay-watch progress events | ~5 min |

### Secondary sources (manual / hand-stitched)

| Source | What it provides | Refresh |
|---|---|---|
| D17 log file | Per-pilot DM outreach + reply log | Manual; ops updates daily during pilot weeks |
| Admissions inbox | High-intent inbound | Manual; ops triages |
| Partner-share (D25) | Open rate, click rate, replies | Manual; weekly per D25 |
| L&D brief send log | Per-prospect L&D-brief sends + outcomes | Manual; ops updates per send |
| D27 scorecards | Pre-pilot baseline | Manual; updated on partner status change |
| D32 / D33 outputs | Decision + postmortem signals | Manual; per pilot |

### Schema convention (canon §8.7)

Every event flowing into the dashboard carries the canonical UTM/attribution schema:

- `utm_source` = `[partner_slug]`
- `utm_medium` = `partner`
- `utm_campaign` = `[pilot_id]`
- `utm_content` = `[asset-type]`
- `utm_term` = `[role]` if known
- `partner_id` = stable internal ID
- `partner_type` = community / coach / creator / alumni / hybrid
- `cohort_id` = per-pilot ID

Events without the schema get a "data-loss" flag in the dashboard. Per canon §1.6, we surface our own data quality, not just the data.

---

## v1 implementation (hand-stitched, ship-this-month-able)

| Layer | Tool | Cost |
|---|---|---|
| Daily snapshot | Notion page, manually-updated cells with Stripe + ESP exports | ~2 ops hours / week |
| Pilot-in-flight | Notion subpage per pilot, with embedded Looker Studio chart pulling from a single Google Sheet of Stripe + GA4 exports | ~3 ops hours per pilot |
| Quarterly cohort | Notion / Google Sheets cohort sheet, manually updated end-of-month | ~3 hours / month founder-review time |

The hand-stitched version is intentional — per canon §1.3, building a heavyweight dashboard before there are 3+ active pilots is over-engineering. v1 ships at the cost of operator time, which is the right scale for a small partner program.

## v2 implementation (when justified)

Conditions to consider v2:
- 3+ pilots running in parallel
- 5+ pilots completed (enough cohort data for View 3 to be useful smoothed)
- Founder review time on the dashboard exceeds 5 hours / week (a sign the v1 manual layer is bottlenecking)

v2 candidates:
- **Mode** or **Hex** with Stripe / GA4 / Vimeo connectors. Cleaner refresh, real charts.
- A **simple internal Next.js dashboard** at `dashboard.aesdr.com` (server-side calls to Stripe + AESDR DB + manual-input layer for partner-share metrics). Owned by AESDR; auditable; no third-party dependency.
- **Looker Studio** (free, GA4-native) for View 3 cohort charts; v1 Notion stays for Views 1 + 2.

Decision deferred until at least one of the three triggering conditions is true.

---

## What this dashboard is NOT

- **A partner-facing surface.** Partners see aggregated metrics in D25 weekly reports, not raw operator data.
- **A vanity-metrics surface.** No "engagement metrics," no "social-share-of-voice," no metrics that don't tie to enrollment or canon health.
- **A real-time alerting system.** Real-time alerts (workshop-day Stripe failures, Admissions inbox SLA misses) live in pager-style ops tooling, not the dashboard.
- **A BI tool ambition.** AESDR is not building a data team. The dashboard is operational; if it grows past operational, it's a sign we're solving the wrong problem.
- **Public.** The dashboard is internal. Partner aggregates flow to D25; market aggregates flow to D38 launch announcements. The dashboard itself is auditable but not published.

---

## Visual treatment notes

**Layout pattern:** Dense data-dashboard layout. Cream background. Three views accessible by tabbed navigation or anchor scroll. Per-view sections separated by `--light` 1px hairlines. Numeric callouts dominate the visual hierarchy.

**Palette:**
- Background: `--cream`.
- Type: `--ink` body, `--muted` for trail labels and chart axes.
- Section headers: `--cond` 12pt 700, .15em, uppercase, `--ink`.
- Numeric callouts (the metric values): `--display` italic 700, 28pt, `--ink`.
- Anomaly flags (when a metric trips a threshold): `--display` italic 700, 14pt, `--crimson`. Single-instance use earns the crimson — most metrics are ink.
- Chart axis labels: `--mono` 10pt, `--muted`.
- Tables (cohort view, drill-downs): `--cond` 12pt headers, `--serif` 14pt body.
- Hairline rules: `--light` 1px.

**Type tokens:** Per palette above. No Caveat — operating dashboard is not a voice surface.

**Iconography:** None. Per canon §13, no green/red arrows, no trend icons, no engagement emojis. Charts use `--light` gridlines and `--ink` data lines. Anomaly flags are typographic (the crimson bold weight), not iconographic.

**Iris usage:** None. Dashboard is internal-ops surface; iris reserved for primary CTAs (canon §6.4). The dashboard has no CTAs — it has views.

**Deliberate departures from canon:** None. The crimson anomaly-flag is canonical alarm-color usage (canon §6.1 lists crimson as the primary brand accent; gravity earns it).

**Five-question check (canon §6.9.1):**
1. **Thumbnail at 200×200:** Cream + display italic numeric callouts + mono trail labels + clean charts = identifiably AESDR (operator-doctrine register). Pass.
2. **Token check:** Pass.
3. **Iris reservation:** Pass — zero.
4. **Icon discipline:** Pass — type-only.
5. **Voice thumbnail:** *"A dashboard that surfaces all three on one page is the goal. A dashboard that surfaces one at a time forces context-switching that the canon §1.5 operating-manual register pushes back on."* — passes; verdict-shaped Rowan, identifiably AESDR.

---

## Forward dependencies

This spec depends on:
- **Stripe + ESP + Vimeo + Vercel + AESDR app DB** instrumentation. **Operationally pending; substantial.**
- **Canon §8.7 UTM canon** for schema. **Met.**
- **D17 log + D25 weekly reports + D27 scorecards + D32 + D33** as data inputs. **All shipped.**
- **L&D brief send log** (operationally pending — file structure exists per L&D brief operational notes; production sends pending).

This spec is a forward dependency for:
- **D38 (this batch) launch announcement** — uses cohort metrics (View 3) as the post-pilot truth source.
- **D39 (this batch) case-study template** — uses pilot-in-flight (View 2) data as the case-study primary source.
- **D33 §2 numbers vs plan** — postmortem lifts from this dashboard.

---

## Open

- **v1 deadline.** Default: Notion-stitched v1 by the start of the first real pilot. Founder + ops co-build over a half-day. Dashboard quality scales with first-pilot's data, which is the right time for it to graduate.
- **Founder-time-distribution chart on View 3.** Requires founder to log time-by-category. Default: **manual logging in Notion, weekly summary**. Founder may resist; the chart is dispensable for v1 if so. Reconsider if founder hours blow out unexpectedly.
- **Whether to expose any portion of View 3 to the partner.** Default: **no.** Cohort data identifies other partners by archetype, even if not by name. Per canon §12 confidentiality and the §10.4 D22-inheritance non-exclusivity language, cross-partner data stays internal.
- **Whether to build a "self-serve view" for ambassadors** in their tier (per D36). Default: **no for v1.** Ambassadors get D25-style aggregated views, not dashboard access. Reconsider only if a specific ambassador's cadence justifies it.
- **Alerting beyond the daily snapshot threshold.** Default: workshop-day pager-style alerts (Stripe webhook failure, replay-page error, Admissions inbox SLA miss). Off-workshop-day, dashboard review is the alert mechanism — no automated paging.
- **Data retention.** Default: indefinite within AESDR-controlled stores; per-event GDPR / CCPA deletion as legally required. Anonymized aggregates (View 3) survive deletions per the §10 D22-inheritance data treatment.
