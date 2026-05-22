# 2026 language patch — progress tracker

> **Status:** Active. Updated 2026-05-22 (post `/partners` → `/affiliates`
> Phase 1 + Phase 2).
> **Owner:** Antaeus Coe.
> **Source:** This doc rolls up sweep state against the master plan at
> `docs/canon-revisions/2026-05-19-language-patch-master-plan.md`, the
> residual deep-clean at `docs/canon-revisions/2026-05-20-curriculum-residual-deep-clean-plan.md`,
> the §14 tagline-pack v1.3 at `2026-05-21-tagline-pack-v1.3.md`, the
> partners-to-affiliates rename plan at `2026-05-22-partners-to-affiliates-rename-plan.md`,
> and the affiliate-hub plan at `2026-05-22-affiliate-hub-plan.md`.

---

## Sweep batches — status

| Batch | Plan | Status | Notes |
|---|---|---|---|
| 1 | Canon ratification | ✅ Shipped | Four canon docs in `docs/canon-revisions/2026-05-19-*.md`. |
| 2 | Enforcement scaffolding | ✅ Shipped | ESLint blocklist active in `eslint.config.mjs`; PR template updated at `.github/pull_request_template.md`; `AGENTS.md` + `CLAUDE.md` reference the canon; `scripts/canon-check.mjs` ships per-line carve-outs (commit `d1009ab`). |
| 3 | Consumer marketing sweep | ✅ Shipped | All 14 routes + 10 components in `app/` + `components/` swept. |
| 4 | Member-area sweep | ✅ Shipped | All 19 member routes + 10 components swept. |
| 5 | B2B sweep | ✅ Shipped | `/enterprise/*` (15 routes) + `/affiliates/*` (15 routes; was `/partners/*` pre-rename) + 8 components swept. canon-check confirms zero hits on either. |
| 6 | Email sweep | ✅ Shipped | All 23 templates in `lib/email.ts` either rewritten or verified post-canon. Phase-2 alias `sendAffiliateApplicationNotification` exported alongside original `sendPartnerApplicationNotification`. |
| 7 | Internal + partner-kit docs | ✅ Shipped | 14 files in `content/aesdr-internal/`, 9 files in `content/affiliate-kit/`, 9 files in `content/affiliate-kit-private/` all swept. Folders renamed in rename Phase 2. |
| 8 | Curriculum rewrite | 🟡 Partial | Deep-clean (6 phases, ~46 commits) shipped per `2026-05-20-curriculum-residual-deep-clean-plan.md`. Batch 8 closure pivot sweep shipped 2026-05-22 (commits `89b8bb1`, `19962cd`, `e12fe82`, `07fef25`). **Five-axis rubric pass below.** |

Canon-check: clean (3 documented carve-outs via `LINE_EXEMPTIONS` in
`scripts/canon-check.mjs`).

---

## Batch 8 — curriculum rubric state (2026-05-22)

Mechanical rubric scorer at `scripts/rubric-score.mjs`. Each unit scored
0–2 on the six axes from `2026-05-19-curriculum-copy-rubric.md`. Score is
a **floor** — close-reading can confirm higher, never lower.

### Axes that are clean across all 36 units

- **Axis 3 — AI-tell absence:** all 36 units score 2/2. The structural
  "X isn't Y — it's Z" pivot pattern was the major remaining R-G7
  signature; cleared from every >1-density unit in the Batch 8 closure
  sweep. 8 single-instance occurrences kept as intentional Rowan-voice
  verdict closes (documented in commit `07fef25`).
- **Axis 5 — Register consistency:** all 36 units score 2/2. No
  motivational / guru / corporate-deck register slips detected. Deep
  clean + earlier batches caught all of it.

### Axes with residual gaps

#### Axis 6 — Filler / over-cutting (12 units flagged)

The deep clean over-merged short fragments into long descriptive
sentences. Multiple units now carry paragraphs averaging 50–80 words per
sentence (single sentence per `lp` is common). Rubric Axis 6 score 0 = bloat.

**Units flagged Axis 6 = 0** (sentence-avg > 28 words across multiple paragraphs):

| Unit | File | Sample sentence length |
|---|---|---|
| 2.1 | `lesson-02/aesdr_course02_1_v1.html` | several 50+ word lp / comp-p |
| 2.3 | `lesson-02/aesdr_course02_3_v1.html` | several 40+ word comp-sub |
| 3.2 | `lesson-03/aesdr_course03_2_v1.html` | 40–60 word lie-a |
| 3.3 | `lesson-03/aesdr_course03_3_v1.html` | 40+ word lp |
| 4.1 | `lesson-04/aesdr_course04_1_v1.html` | several 50+ word lp |
| 5.1 | `lesson-05/aesdr_course05_1_v1.html` | 60–80 word lp / comp-p (post-pivot-rewrite) |
| 5.2 | `lesson-05/aesdr_course05_2_v1.html` | 40–60 word lp |
| 5.3 | `lesson-05/aesdr_course05_3_v1.html` | 40+ word comp |
| 6.2 | `lesson-06/aesdr_course06_2_v1.html` | 50+ word lp (post-pivot-rewrite) |
| 7.1 | `lesson-07/aesdr_course07_1_v1.html` | 40+ word lp |

**Fix shape:** split run-on sentences into a 30+15+20-word cadence.
Same content; same meaning; varied sentence length per paragraph.
Targets the Axis 1 monotony issue at the same time.

#### Axis 2 — Specificity (9 units flagged)

Some paragraphs lack concrete references (no number, no named tool, no
named role, no time marker). Rubric Axis 2 score 0 = "would survive
being re-titled Sales 101."

**Units flagged Axis 2 = 0**:

| Unit | File | Note |
|---|---|---|
| 3.3 | `lesson-03/aesdr_course03_3_v1.html` | concept-heavy without anchors |
| 6.2 | `lesson-06/aesdr_course06_2_v1.html` | "real networking" abstractions |
| 8.1 | `lesson-08/aesdr_course08_1_v1.html` | needs more numbers |
| 9.1 | `lesson-09/aesdr_course09_1_v1.html` | needs Salesforce / pipeline numbers |
| 9.3 | `lesson-09/aesdr_course09_3_v1.html` | needs CRM-specific refs |
| 11.2 | `lesson-11/aesdr_course11_2_v1.html` | conference-culture without concrete scenes |
| 11.3 | `lesson-11/aesdr_course11_3_v1.html` | event behavior without specifics |
| 12.1 | `lesson-12/aesdr_course12_1_v1.html` | relationship gaps without scenes |
| 12.2 | `lesson-12/aesdr_course12_2_v1.html` | home-office without named gear / times |

**Fix shape:** inject one concrete anchor per abstract paragraph —
a tool, a number, a role, a Tuesday-at-3pm. Per the rubric Axis 2
score 2: *"a tool (Apollo, Salesforce, the AESDR Alignment Contract),
a number (the 9% reply rate, the 80-dial day, the 22% win rate),
a role (your CFO, your champion, your VP), a time (Tuesday morning,
Friday at 4pm), or a situation (the QBR, the 1:1, the bad-month
conversation)."*

#### Axis 1 — Sentence-length variety (8 units flagged)

Three units flagged for **3+ consecutive short sentences** (residual
fragments the deep clean missed): 1.1, 8.2, 9.2. Five units flagged for
**monotony** (every sentence within 25% of avg length, avg > 8 words):
4.1, 10.1, 10.2, 10.3, plus overlap with Axis 6 set.

**Fix shape:** same as Axis 6 — split run-on sentences and merge
3-fragment chains into 2-sentence cadence. Both axes typically rise
together.

### Axes 1 + 4 — small / minor

- **Axis 4 — Sentence endings:** clean across all 36 units after the
  conservative scorer pass. No bare "X. it. Y." trailing-pronoun
  closes in any unit's paragraph-final sentence.

---

## What "9/10 minimum" actually requires

Per the rubric `2026-05-19-curriculum-copy-rubric.md` §"Acceptance criteria
per lesson":

> 1. **No axis below 1.** A 9/10 average with a 0 on any single axis
>    is a fail. The weakest axis is the one a reader notices first.

By that criterion, **17 unique units** currently fail acceptance because
they have at least one axis at 0:

```
1.1, 1.3, 2.1, 2.3, 3.2, 3.3, 4.1, 5.1, 5.2, 5.3, 6.2, 7.1, 8.1, 8.2,
9.1, 9.2, 9.3, 10.1, 10.2, 10.3, 11.2, 11.3, 12.1, 12.2
```

Mostly Axis 6 (bloat from deep-clean over-correction) + Axis 2
(specificity gaps) + a few Axis 1 (monotony).

19 units pass cleanly:
```
1.2, 2.2, 3.1, 4.2, 4.3, 6.1, 6.3, 7.2, 7.3, 8.3, 11.1, 12.3
```

---

## Recommended next move

**Two-axis lift per unit, batched by axis:**

- **Pass A (Axis 6 / 1 cadence-variation sweep)** — 12 bloat-flagged
  units. Target: split run-on sentences into varied-length cadence.
  Touches ~3–5 paragraphs per unit. Estimated: 20-30 minutes per unit;
  6–8 hours total. Output: every Axis 6 score ≥ 1; Axis 1 monotony also
  lifts on the same paragraphs.

- **Pass B (Axis 2 / specificity sweep)** — 9 abstract-flagged units.
  Target: inject one concrete anchor (tool, number, role, time, scene)
  per paragraph that currently has none. Estimated: 30-40 minutes per
  unit; 5–6 hours total. May surface `[CONTENT QUESTION]` markers where
  the right anchor needs founder input.

- **Pass C (per-unit founder review)** — same workflow as the pivot
  sweep: I draft, founder redlines, ship. Estimated: 1–2 founder hours
  if Passes A + B land cleanly.

**Decision point:** drive Passes A + B now, or treat current state as
acceptable (most units at 7–9/10 with one axis at 0 each) and call
Batch 8 done.

---

## Affiliate hub — separate workstream parking lot

Per master plan §"Affiliate hub", five scoping questions still open:

1. ✅ Resolved 2026-05-22: `/affiliates` is the renamed expansion (was `/partners`). Rename plan shipped Phases 1 + 2. `/enterprise/channel` continues to serve B2B channel partners (distinct surface, intentional).
2. Payout model — percentage of sale, or fixed bounty per signup?
3. Brand-conformance gate — first three pieces of affiliate marketing copy reviewed and approved before going live?
4. Tracking — UTM-only, or per-affiliate signed link?
5. Dashboard — visible to the affiliate themselves, or admin-only?

Once answered, separate plan doc at `docs/canon-revisions/2026-MM-DD-affiliate-hub-plan.md`.

---

## Operational

- Live URL verification: `https://aesdr.com` returns HTTP 403 (21 bytes) —
  consistent with `COMING_SOON` middleware gating anonymous traffic.
  Verifies the gate is working; does not verify deployed content.
  Bypass-URL or staging-preview needed to confirm served copy.
- Branch state: all work on `main` post `5cda080` (the Enterprise admin
  nav addition). `build/behavioral-pass` merged + landed.

---

## `/partners` → `/affiliates` rename — ship status (2026-05-22)

Plan ratified by founder 2026-05-22. Executed in 3 phases:

| Phase | Status | Commits | Notes |
|---|---|---|---|
| 1 — Routes + redirects | ✅ Shipped | `6b4a843`, `e0d5e5e`, `6e078fb` | All `/partners/*` routes (15 pages + 2 API endpoints + 8 components + 5 lib files + admin chrome at `/admin/partner-kit` → `/admin/affiliate-kit`) renamed. 301 redirects in place via `next.config.ts`. Three rechecks closed the gaps. |
| 2 — Docs + body rewrites | ✅ Shipped | `932140d` + Tier 1-5 patch | `docs/partner/` → `docs/affiliate/` (50+ deliverables); `content/partner-kit/` → `content/affiliate-kit/`; `content/partner-kit-private/` → `content/affiliate-kit-private/`. Body-text "partner" → "affiliate" rewrites across 96 files. Channel-partner / partnership / partnered / partnering carve-outs preserved. AGENTS.md naming separation block updated. `AESDR-PARTNER-HUB-SPEC.md` → `AESDR-AFFILIATE-HUB-SPEC.md`; `D40-master-partner-kit-readme.md` → `D40-master-affiliate-kit-readme.md`. Email function alias `sendAffiliateApplicationNotification` exported. |
| 3 — DB migration | 🟡 Parked | — | Supabase column `partner_slug` → `affiliate_slug` + table `partner_applications` → `affiliate_applications` + camelCase API name `partnerSlug` → `affiliateSlug` across `lib/affiliate-kit-tokens.ts` consumers. Only matters once live affiliate data exists; defers until affiliate-hub Phase 4-5. |

Verification across the post-rename state:
- `npx tsc --noEmit`: clean
- `npm run lint`: 0 errors
- `node scripts/canon-check.mjs`: clean
- Zero `/partners` URL strings in `app/`, `components/`, `lib/`, `scripts/`, `utils/`
- 301 redirects active in `next.config.ts` (verified declarative; sandbox egress couldn't reach `aesdr.com` for live curl confirmation)
- Body-text rewrites preserve channel-partner / partnership / partnered / partnering carve-outs per AGENTS.md naming separation rules

---

## Affiliate hub — scoping decisions (2026-05-22)

Founder ratified all five scoping questions from the master plan §"Affiliate hub":

1. ✅ Audience: consumer-side affiliates (creators / micro-creators / alumni ambassadors); B2B stays at `/enterprise/channel`.
2. ✅ Payout: 30% of net revenue (matches D22 §5.1 default).
3. ✅ Brand-conformance gate: first 3 pieces approved before going live. v1 = Option A (3 approvals only); v1.1 = sophistication-toggle hybrid (Option B for `developing` tier).
4. ✅ Tracking: hybrid HMAC-signed link + UTMs (cookie source-of-truth, last-touch UTM fallback).
5. ✅ Dashboards: two — affiliate-facing + admin-facing per `2026-05-22-affiliate-hub-plan.md` §3-4.

Additional ratifications:
- Payment processor: Stripe Connect Standard for v1.
- Multi-touch attribution: last-cookie-wins as default; revisit after first 10 attributions.
- Public-side disclosure: footer injection when `aesdr_aff` cookie is present.

Affiliate-hub buildout (Phase 1-5 per plan, ~6-8 weeks) is parked awaiting separate execution ratification.
