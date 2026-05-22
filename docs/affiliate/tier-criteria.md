# Affiliate sophistication-tier criteria

> **Ratified:** 2026-05-22 by Antaeus Coe.
> **Owner:** Antaeus Coe.
> **Lives at:** `docs/affiliate/tier-criteria.md`.
> **Used by:** Admin selecting a sophistication tier in
> `/admin/affiliates/new` (form field) or `/admin/affiliates/[slug]`
> (override). Drives the brand-conformance gate in `lib/affiliate-entity.ts`
> via `gateRequirementFor(tier)`.

---

## Why the tier exists

The brand-conformance gate exists so we don't let an affiliate ship copy
that misrepresents AESDR or trips FTC disclosure rules. New affiliates
default through a three-piece review queue (`developing` tier). Some
affiliates have enough track record + voice familiarity that the
three-piece on-ramp is unnecessary friction — they get cleared faster
through the `proven` tier (single approved piece, then gate exits).

This file defines who qualifies for `proven` so the call stays consistent
across whoever's doing the classification.

---

## Tier definitions

### `developing` — default

Anyone who doesn't meet every condition under `proven` lands here. No
exceptions for "vibes" or "they seem fine" — the friction of three
reviewed pieces is the brand insurance the program runs on, and the
asymmetric cost of getting it wrong (a bad piece in market) far outweighs
the small delay of three reviews.

### `proven` — fast-track

A new affiliate is `proven` only if **all three** conditions hold:

1. **Audience size:** at least 5,000 engaged followers / subscribers /
   members on their primary channel (newsletter, podcast, YouTube,
   LinkedIn, Twitter/X, Discord, course platform, etc.). "Engaged" means
   the channel they're actually going to promote through, not a dead
   account they happen to own.

2. **Promotion track record:** documented evidence of promoting at least
   one other product to that audience within the last 6 months. Affiliate
   relationship, sponsored content, paid ad placement, course launch —
   anything that proves they've done the operational work of asking
   their audience to buy / sign up before.

3. **Voice familiarity:** **either** Antaeus has consumed their primary
   channel's output for 30+ days **or** a current AESDR alumni
   (completed ≥ 8 of 12 courses, with permission-to-publish testimonial
   on file) vouches for them by name.

All three are required. Failing one means `developing` by default.

---

## How the call gets made

1. Open the application or referral in `/admin/affiliates/new`.
2. Walk the three conditions above against what you know about them. If
   any is uncertain, ask before assigning `proven`. "Probably qualifies"
   = `developing`.
3. Document the basis in the `notes` field on the affiliate row (e.g.
   "proven — newsletter @ 12k, ran NoLearningCurve affiliate Q1 2026,
   Marshall Ealy vouch") so the call stays auditable.

A `developing` affiliate can be promoted to `proven` later by an admin —
that's a separate decision and not part of this file. See `lib/affiliate-entity.ts`
for the schema field; promotion is a manual UI action on the affiliate detail page.

---

## Carve-outs

- **Internal hires / contractors promoted to affiliate** are exempt from
  the three conditions and get classified by the founder directly. Their
  tier follows from working relationship, not from these criteria.

- **Re-activating a sunset affiliate** (status was `sunset`, founder
  brings them back) preserves their prior tier. The criteria here apply
  to first-time classification only.

---

## Why these particular thresholds

- **5,000 followers** isn't a magic number — it's a floor. Below it, the
  promotion volume per piece is small enough that one bad piece probably
  doesn't matter much to AESDR's brand surface. Three-piece review is
  cheap insurance at that scale. Above it, the affiliate's audience is
  large enough that we want their first AESDR piece to be in their voice
  fast, with our brand boundaries in place but not bottlenecked through
  the gate.

- **Promotion track record** filters for operational capability, not
  just audience size. A 50k-subscriber newsletter that's never run an
  affiliate or sponsored placement is still `developing` — they haven't
  done the work, and the first three pieces are how they learn it.

- **Voice familiarity** is the founder-taste line. Quantitative criteria
  alone can't catch register clash, content drift, or audience mismatch.
  Either Antaeus knows the work, or an alum he trusts does.

---

## Revisit cadence

These thresholds get reviewed after the first 10 affiliates are
classified. If too many people are landing in `developing` who clearly
shouldn't, or vice versa, soften / tighten and re-ratify in this file.
Until then, the criteria are the criteria.
