# 11 — Tracking Links

> **What this is:** The canonical UTM-tagged URLs for your pilot. AESDR generates these per pilot from the canon §8.7 UTM schema. **Use these links exclusively** — modified or shortened links break attribution and may be treated as a D22 §3.4 violation.
>
> **Per canon §8.8:** Attribution runs from first qualifying click through 30 days. Refunds reduce the commission base proportionally. If a partner-specific code (`[PILOT_CODE]`) is applied at checkout, the partner is the attributed source regardless of last-click.
>
> **Updates:** This file is regenerated if any pilot-window dates change or if AESDR rotates promo codes. The canonical version always lives in your kit folder; older versions are deprecated.

---

## Pilot identifiers

| Field | Value |
|---|---|
| Partner slug | `[PARTNER_SLUG]` |
| Partner type | `[community / coach / creator / alumni / hybrid]` |
| Pilot ID | `[PILOT_ID]` (e.g., `c_2026-05-apex`) |
| Cohort ID | `[COHORT_ID]` (often same as Pilot ID) |
| Internal partner ID | `[PARTNER_ID]` (e.g., `p_001`) |
| Promo code | `[PILOT_CODE]` |
| Promo code expiry | `[CODE_EXPIRY_DATE_TIME_TZ]` |

---

## Surface-by-surface tracking URLs

Each surface gets its own URL with a unique `utm_content` value. This lets AESDR (and you, in D25 weekly reports) tell which of your sends drove which traffic.

### Awareness sends (top of funnel)

| Surface | URL |
|---|---|
| Newsletter — launch send (`09a`) | `https://aesdr.com/[PARTNER_SLUG]/workshop?utm_source=[PARTNER_SLUG]&utm_medium=partner&utm_campaign=[PILOT_ID]&utm_content=newsletter-launch&partner_id=[PARTNER_ID]&partner_type=[PARTNER_TYPE]&cohort_id=[COHORT_ID]` |
| Newsletter — reminder send (`09b`) | same as launch, with `utm_content=newsletter-reminder` |
| Podcast / audio promo (`09c` script) | same, with `utm_content=podcast-intro` |
| Social — Post 1 (operating gap) | same, with `utm_content=social-pre-1-operating-gap` |
| Social — Post 2 (honest disqualification) | same, with `utm_content=social-pre-2-disqualification` |
| Social — Post 3 (brand intro) | same, with `utm_content=social-pre-3-brand-intro` |

### Workshop-day surfaces

| Surface | URL |
|---|---|
| Live workshop chat link | same, with `utm_content=live-chat-link` |
| Social — Post 4 (workshop day) | same, with `utm_content=social-day-of` |
| Social — Post 5 (replay window) | same, with `utm_content=social-replay-window` |

### Replay-window + deadline

| Surface | URL |
|---|---|
| Replay link in member channel | `https://aesdr.com/[PARTNER_SLUG]/replay/[TOKEN]?utm_source=[PARTNER_SLUG]&utm_medium=partner&utm_campaign=[PILOT_ID]&utm_content=replay-direct&partner_id=[PARTNER_ID]&partner_type=[PARTNER_TYPE]&cohort_id=[COHORT_ID]` |
| Social — Post 6 (deadline) | same as awareness, with `utm_content=social-deadline-window` |

### Direct enrollment URLs (when promoting the program independently of the workshop)

| Surface | URL |
|---|---|
| Direct enrollment | `https://aesdr.com/enroll?utm_source=[PARTNER_SLUG]&utm_medium=partner&utm_campaign=[PILOT_ID]&utm_content=direct-enroll&partner_id=[PARTNER_ID]&partner_type=[PARTNER_TYPE]&cohort_id=[COHORT_ID]&code=[PILOT_CODE]` |

---

## Discipline (per canon §8.7)

- **Use the URLs verbatim.** Do not edit query parameters, do not strip UTM tags to "clean them up," do not move parameters around.
- **No third-party shorteners** that mask the AESDR domain. Branded short URLs from AESDR are the exception (pending; if/when AESDR ships `aesdr.link/[slug]`, those are pre-cleared substitutes).
- **No QR-code redirects** that route through your own domain. Per canon §8.7, the canonical URL must be the destination.
- **No appending your own UTM tags** (e.g., `utm_audience=segment-a`). If you want to A/B by segment, AESDR generates a second `utm_content` value for you on request.
- **One UTM per surface.** Do not reuse `newsletter-launch` for both your launch send and your podcast intro — the data point becomes useless.

## What attribution does *not* depend on

- **Last-click.** Per canon §8.8, the partner-code application overrides last-click. If a buyer arrives via your link, drifts away, comes back via Google, and applies `[PILOT_CODE]` at checkout, you're still the attributed partner.
- **Browser cookies alone.** Server-side attribution captures the partner relationship at first qualifying click; cookies are belt-and-suspenders, not the system of record.
- **Whether the buyer remembers your link.** If they don't apply the code, last-click attribution applies within the 30-day window. If they apply the code, you're attributed regardless of source.

---

## What to do if a link breaks

- **Copy the broken URL exactly** from your send/post.
- **Email `[OPS_EMAIL]`** with the URL and the surface where it broke.
- AESDR responds within 4 business hours with a fix or a verified-working confirmation.
- **Do not** rebuild the URL yourself. Do not try `aesdr.com/[partner_slug]/workshop` without UTM tags as a fallback — the URL works, but attribution doesn't fire, and the buyer enrolls without commission credit.

## What to do if attribution looks wrong in your weekly report

- Check the **§3 funnel metrics** in your D25 weekly report — page views vs registrations gap is normal (most page views are not registrations).
- Email `[OPS_EMAIL]` with the specific metric you're flagging and the time window.
- AESDR's UTM trail is auditable per canon §1.6 (transparency); we'll show you the per-event log on request.

---

## Per-pilot regeneration

This file is regenerated when:
- The pilot window dates change.
- The promo code rotates (most pilots use one code through the window; if the code rotates, the URLs update).
- A new surface gets added to your promotion plan (e.g., adding a podcast guest spot mid-pilot — request via `[OPS_EMAIL]`, AESDR generates the URL, this file updates).

The previous version of this file is archived at `docs/partner/pilots/[PARTNER_SLUG]/tracking-links--v[N].md`. The current version is the authoritative one.

---

*Source: canon §8.7 (UTM canon) + canon §8.8 (attribution windows). Per pilot, generated by AESDR ops; not partner-editable.*
