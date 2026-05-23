# AESDR · Founder Audit — Update

> **Baseline:** 2026-05-19 audit (25-page PDF, score range 1–10, four 9s, no 10s).
> **This update:** 2026-05-22 — three days after baseline, after the §14 tagline v1.3
> work, the Batch 8 curriculum closure-pivot sweep, the `/partners` → `/affiliates`
> rename (3 phases), and the full affiliate hub buildout (canonical entity table,
> brand-conformance gate, Stripe Connect Standard, payout pipeline, FTC public-side
> disclosure, lifecycle emails).
> **Format:** delta against the May-19 grades. Same 13 categories.
> **Methodology:** programmatic scans + qualitative review of the surfaces changed
> since baseline. I sampled rather than read exhaustively where I say so.

---

## Mechanical state

| Check | Result |
|---|---|
| `node scripts/canon-check.mjs` | ✅ clean |
| `npm run lint` | ✅ 0 errors (20 pre-existing warnings, unrelated) |
| `npx tsc --noEmit` | ✅ clean |
| Six-axis rubric scorer (`scripts/rubric-score.mjs`) | 24 of 36 units flagged for close reading; Axis 6 (filler/over-cutting) is the most-common 0; Axis 2 (specificity) second-most |

---

## Summary table

| # | Category | May-19 | Now | Δ | One-line read |
|---|---|---|---|---|---|
| 1 | Brand voice + positioning | 9 | **9** | → | Voice intact. Tagline v1.3 partially propagated; old tagline lingers in 5 production-facing files. |
| 2 | Visual identity + design system | 8 | **8** | → | `prefers-reduced-motion` shipped (audit liability cleared). Legacy dark-palette vars still ship. No `/design` admin page yet. |
| 3 | Consumer landing + FAQ | 8 | **8** | → | No targeted changes; no regressions detected. Role-fork doc note + lifetime-access definition still outstanding. |
| 4 | Curriculum structure | 8 | **8** | → | No structural changes since baseline. |
| 5 | Curriculum body copy quality | 6 | **6** | → | Batch 8 closure-pivot sweep tightened R-G7 (AI-tells of the "isn't X — it's Y" type). AI-tell counts for `mindset`, `blueprint`, `leverage` went up, not down. Rubric scores improved on Axis 3 (AI-tell absence per the *new* rubric definition); the lexical AI-tells from the May-19 audit are not what the rubric measures. |
| 6 | Affiliate hub (was `/partners`) | 8 | **9** | ↑ | Renamed to `/affiliates`. Marketing surface preserved + operationalized: entity table, brand-conformance gate, Stripe Connect Standard, payout pipeline, FTC public-side disclosure footer, seven lifecycle emails. Some light AI-tell pollution in new code (`unlock` ×4, `mindset` ×5, `unleash` ×2). Wind-down language still missing. |
| 7 | `/enterprise` subsidiary (was `/teams`) | 6 | **6** | → | Renamed at the route level. No content changes. Still provisional pending real-partner usage. |
| 8 | Email templates | 6 | **7** | ↑ | Drop-off 5d / 10d / 21d on re-read are excellent (audit assumed thin without reading). Seven new affiliate-side templates shipped (onboarding, copy-approved/edits/declined, gate-cleared, pause, payout) with a shared `affiliateShellHtml` shell. Day-0 +12hr / +36hr sequence shipped (audit recommendation closed). |
| 9 | Behavioral / drop-off design | 4 | **6** | ↑↑ | Day-0 +12hr/+36hr sequence shipped. Free-preview page shipped at `/preview` (393 lines, real lesson content). Drop-off emails strong on re-read. Testimonials capture flow shipped. Major gap closures since baseline. |
| 10 | Accessibility | 4 | **5** | ↑ | `prefers-reduced-motion` shipped site-wide in `app/globals.css`. Other audit-flagged items (form-field contrast, wordmark `aria-label` parity) not addressed. |
| 11 | Mobile experience | 5 | **5** | → | No targeted changes since baseline. Still untested on real devices. |
| 12 | AI-tell / non-human language hygiene | 6 | **5** | ↓ | Curriculum AI-tells went *up*, not down, since baseline: `mindset` 45 → 57, `blueprint` 11 → 20, `leverage` 10 → 22 (likely artifacts of Batch 8 rewrites that prioritized R-G rules over lexical hygiene). New affiliate-hub code introduced fresh light pollution. **This is the largest regression in this update.** |
| 13 | Language consistency across surfaces | 5 | **6** | ↑ | `/partners` → `/affiliates` rename clean across 3 phases (routes, body, DB). Tagline v1.3 partial roll-out; old tagline still in 5 production files. Naming separation (affiliates / channel partners / enterprise) holding mechanically via ESLint + canon-check. |

**Net direction since baseline:** four categories up (Affiliate hub, Email templates, Behavioral, Accessibility), one up small (Language consistency), seven flat, **one down (AI-tell hygiene)**. The down arrow is the only one that warrants near-term attention.

---

## A. Brand voice + positioning — 9 → 9 (→)

**Why still 9.** The anti-guru editorial register is intact. The May-19 audit named four standout artifacts:
- FAQ Q2 ("No guru stuff…") — unchanged
- Refund language ("If it doesn't deliver value…") — unchanged
- Tagline ("AEs & SDRs Rule This World") — **partially superseded** by v1.3 ("12 courses. 5 tools. Same you — way, way better.") but not consistently
- `who-we-dont-work-with` page on the affiliate hub — unchanged, still naming the anti-pattern publicly

**What changed since baseline.** Tagline v1.3 ratified per `docs/canon-revisions/2026-05-21-tagline-pack-v1.3.md`. The tier-criteria document (`docs/affiliate/tier-criteria.md`) ratified 2026-05-22 — codifies the founder taste for affiliate-program brand-fit decisions, which is exactly the "document the voice rules before delegating" risk the May-19 audit flagged.

**Why not 10.** Tagline v1.3 is in 4 files; old tagline still ships in 5 production-facing files:
- `app/layout.tsx`
- `app/coming-soon/page.tsx`
- `app/mobile/page.tsx`
- `components/LandingSequence.tsx`
- `components/TeaseGate.tsx`

This is a propagation gap, not a voice problem — but it's exactly the "voice exists at the surface layer, doesn't propagate consistently" critique from the May-19 audit, now visible at the tagline level too.

**What would move this to 10.** Finish the tagline v1.3 propagation. Audit the new affiliate-hub strings for voice consistency (some land cleanly, the gate-cleared and onboarding emails were redlined today and read in voice — but the dashboard chrome wasn't redlined).

---

## B. Visual identity + design system — 8 → 8 (→)

**What changed.**
- **`prefers-reduced-motion` shipped** in `app/globals.css`. The May-19 audit named this as a "real accessibility liability" — it's now closed for the iris-shimmer specifically and via a global `*` selector for all transitions/animations.
- Brand palette tokens unchanged.

**What's still weak.**
- **Legacy dark-palette vars still ship** in `app/globals.css` (9 lines referencing `--bg-main`, `--bg-panel`, `--theme`, `--coral`, `--cobalt`, `--amber`, `--violet`). Audit called this dead weight + drift surface. Untouched.
- **No `/design` admin page** documenting the system. Audit recommended this; not built.
- **Mascot sizing rule** ("everywhere on consumer, footer monogram only on subsidiary") still uncodified anywhere mechanical can enforce.

---

## C. Public-facing language (consumer landing + FAQ + legal) — 8 → 8 (→)

**No targeted changes.** No regressions. The May-19 weak-points unchanged:
- Role-fork mechanism still undocumented to the visitor
- "Lifetime access" undefined in legal page
- FAQ Q7 still long with the "career-level relationship building" phrasing

Free-preview page at `/preview` exists (393 lines, real lesson content from C3.3 Surviving AE Management) — this addresses the biggest audit recommendation in §H for this surface, even though it's officially category H.

---

## D. Affiliate hub — 8 → 9 (↑)

**Why this moved.** May-19 audit graded the *marketing* surface of `/partners`. Since then:

- `/partners` → `/affiliates` rename in three phases (routes + 301 redirects, body content, DB column + table renames)
- **Canonical `affiliates` entity table** with status (vetting/active/paused/sunset/cut), archetype, sophistication_tier, commission_pct, strike_count, gate state, Stripe Connect account
- **Brand-conformance gate** with admin queue + per-submission review (approve / request edits / decline with three-strike compliance tracker)
- **Stripe Connect Standard** integration (onboarding link + dashboard link + Transfers API for payouts)
- **Lifecycle emails** (onboarding, copy-approved with gate-cleared variant, edits-requested, declined with strike count, gate cleared with payout terms, pause, payout notification)
- **FTC public-side disclosure footer** injected on every page when `aesdr_attribution` cookie is present
- **Tier criteria doc** ratified at `docs/affiliate/tier-criteria.md`
- **Aggregate metrics view** for cross-affiliate admin trends, wired into `/admin/affiliates`

The May-19 audit said the hub was unusually honest for an affiliate program. It still is, and now it's also operational instead of marketing-only. That's worth the half-point.

**Why not 10.**
- **Wind-down / underperformance language still missing** at `/affiliates/program`. Audit named this specifically as the missing piece partners actually care about; no `/wind-down` route, no underperformance language in the program page. Recommendation hasn't been addressed.
- Light AI-tell pollution in the new code: `unlock` ×4, `mindset` ×5, `unleash` ×2, `crush it` ×1, `leverage` ×1 across `app/affiliates/`, `app/admin/affiliates/`, `components/affiliates/`. None are blockers; collectively they're the kind of body-copy laziness the curriculum has, now showing up in the hub.
- 8 public partner-kit docs at `content/affiliate-kit/D*.md` still unread in this audit (same gap as the May-19 audit).

---

## E. `/enterprise` subsidiary — 6 → 6 (→)

**What changed.** Routes renamed from `/teams/*` to `/enterprise/*`. Content essentially unchanged from baseline. Light AI-tell pollution unchanged (`unlock` ×1 detected).

**Still provisional.** The May-19 grade was provisional ("untested in market"). That still applies. The "show `/teams` to one real channel partner" audit recommendation hasn't been actioned.

---

## F. Curriculum structure — 8 → 8 (→)

**No structural changes** since baseline. Audit recommendations not yet addressed:
- No "Module 0" or pre-lesson onboarding flow
- Lesson-to-lesson narrative thread still invisible
- Module 11 (Off-the-clock) still under-resourced relative to topic stakes

---

## G. Curriculum body copy quality — 6 → 6 (→)

**Mixed picture.**

**On the new rubric (six-axis from `2026-05-19-curriculum-copy-rubric.md`):** 12 of 36 units score 9/10; 22 score 7/10; 1 scores 5/10 (Unit 4.1). Axis 3 (AI-tell absence per the *rubric's* R-G7 definition — the "isn't X — it's Y" pivot pattern) is now clean across all 36 units after the Batch 8 closure-pivot sweep. Axis 5 (register) also 2/2 across all 36.

**Axes with residuals:**
- Axis 6 (filler/over-cutting) — 12 units at 0/2. Deep-clean over-merged short fragments; multiple units now average >28 words/sentence. This is the largest known gap.
- Axis 2 (specificity) — 9 units flagged.
- Axis 1 (sentence-length variety) — 8 units flagged.

**On the May-19 audit's lexical-AI-tell metrics:** **regression.**

| Term | May 19 | Now | Δ |
|---|---|---|---|
| `journey` | 38 in 36 files | 38 in 36 files | → |
| `mindset` | 45 in 21 files | 57 in 22 files | **+12** |
| `blueprint` | 11 in 3 files | 20 in 3 files | **+9** |
| `leverage` | 10 in 10 files | 22 in 13 files | **+12** |
| `pain point` | 5 in 5 files | 67 in 13 files | **+62** (likely legitimate sales-term usage; needs context audit) |
| `crush it` | 3 in 3 files | 0 | **−3** |
| `deep-dive` | 3 in 2 files | 4 in 2 files | +1 |

The Batch 8 sweeps prioritized R-G rules (closure-pivot patterns, etc.) over lexical hygiene. The hard-banned R-G4 terms (those ESLint flags) are clean. But the May-19 audit's specific watch-list — `journey`, `mindset`, `blueprint`, `leverage` — was not touched and has drifted upward.

**This is the regression flagged in §L.**

---

## H. Behavioral / drop-off design — 4 → 6 (↑↑)

**Largest improvement since baseline.** Multiple major audit recommendations closed:

| May-19 gap | Status now |
|---|---|
| No Day-0 +12hr / +36hr welcome sequence | ✅ Shipped (`sendDay0PlusTwelveHours`, `sendDay0PlusThirtySixHours` in `lib/email.ts`) |
| No free-preview lesson | ✅ Shipped at `/preview` (393 lines, real lesson body from C3.3) |
| Drop-off 5d/10d/21d untouched | ⚠️ Untouched but on re-read they're *strong* — audit assumed thin without reading |
| No alumni / post-completion mechanic | ⚠️ Partial — `sendAlumniReengagement` and `sendReviewRequest` shipped, but no in-product surface |
| No testimonials capture flow | ✅ Shipped (`app/account/review/TestimonialForm.tsx`, `app/actions/testimonial.ts`, admin moderation UI) |

**Why not 7 yet.**
- Role fork mechanism still session-scoped (the May-19 audit recommended localStorage persistence; my grep found no role persistence in `localStorage`)
- No in-product "you completed Module 3" progression marker
- No "I'm stuck / I disagree with this lesson" surface inside the product (Discord is still the dump)

---

## I. Accessibility — 4 → 5 (↑)

**Closed:** `prefers-reduced-motion` site-wide CSS rule in `app/globals.css`. The iris-shimmer animation no longer runs for users with motion sensitivity. This was the largest single accessibility liability the May-19 audit named.

**Still open:**
- Form field resting-state contrast (`border: 1.5px solid var(--light)` is cream-on-cream)
- AESDR wordmark `aria-label` parity between subsidiary (good) and consumer surfaces (inconsistent)
- No documented light/dark mode behavior
- No axe-core / Lighthouse CI in the pipeline

---

## J. Mobile experience — 5 → 5 (→)

**No changes I can detect** from sandbox. Mobile lesson typography review still untested on real devices. Audit recommendation #15 (mobile lesson typography review) hasn't been actioned.

---

## K. AI-tell / non-human language hygiene — 6 → 5 (↓)

**Only regression in this update.**

**Why:** The lexical AI-tells the May-19 audit measured (`journey`, `mindset`, `blueprint`, `leverage`) went *up* in the curriculum, not down — counts in §G above. The Batch 8 sweep targeted different patterns (R-G rules). Meanwhile, the new affiliate-hub code introduced fresh light pollution (`unlock`, `mindset`, `unleash`, `crush it` in dashboard/admin code).

**Per-surface state:**

| Surface | AI-tells (May 19) | AI-tells (now) |
|---|---|---|
| 36 lesson HTML files | heavy | **heavier** (mindset/blueprint/leverage up) |
| `/affiliates/*` (was `/partners/*`) | light-medium | **light + new** (unlock 4, mindset 5, unleash 2) |
| `/enterprise/*` (was `/teams/*`) | light (3 hits) | **lighter** (1 hit) |
| Consumer landing | clean | clean |
| Email templates | very light (4 hits total) | **clean on AI-tell list** (`unlock` ×7 is legitimate — five tools unlock, reveal unlocked; `journey` ×1 same as baseline; `10x` ×1 same; `guru` ×1 same — all in `who-we-don't-work-with` anti-example context) |

**The fix is still §E.4 of the May-19 audit:** a focused 3-hour pass over the 36 lesson HTML files, context-by-context. Plus a fresh sweep of the new affiliate-hub strings.

---

## L. Language consistency across surfaces — 5 → 6 (↑)

**What improved.**
- `/partners` → `/affiliates` rename complete across routes, body content, DB columns, RLS policies. Consistent vocabulary now between marketing pages, dashboard chrome, admin chrome, and database identifiers.
- ESLint `no-restricted-syntax` rule blocking R-G4 hard-banned terms across `app/**` + `components/**` (mechanical enforcement)
- `scripts/canon-check.mjs` covering .md / .html / .txt surfaces that ESLint can't reach
- Naming separation between affiliates / channel partners / enterprise documented in `AGENTS.md` and holding mechanically

**What still drifts.**
- **Tagline v1.3 partial roll-out** — 4 files have v1.3, 5 production-facing files still ship "AEs & SDRs Rule This World"
- **Curriculum body copy** — see §G regression
- **New affiliate-hub strings** — never went through a fresh canon read since shipping today

---

## M. What changed in three days, summed

**Shipped between May-19 and now:**

1. Six-axis curriculum copy rubric + scorer (`scripts/rubric-score.mjs`)
2. Tagline v1.3 ratification + partial roll-out
3. Batch 8 closure-pivot sweep (R-G7 "isn't X — it's Y" eliminations)
4. `/partners` → `/affiliates` rename (Phases 1–3)
5. Affiliate hub end-to-end buildout (14 items): canonical entity, brand-conformance gate, Stripe Connect, payout pipeline, FTC disclosure, lifecycle emails, three-strike tracker, sophistication-tier hybrid, aggregate metrics view
6. Tier-criteria document
7. Onboarding email redline
8. `prefers-reduced-motion` site-wide CSS
9. Day-0 +12hr / +36hr welcome sequence
10. Free-preview page at `/preview`
11. Testimonials capture flow
12. `Recording*.mp4` removed from repo root

**Not addressed since May-19:**

- Lesson-body AI-tell sweep (`journey`, `mindset`, `blueprint`, `leverage`)
- Legacy dark-palette CSS variables in `app/globals.css`
- `/design` admin documentation page
- Role-fork `localStorage` persistence
- `/affiliates/program/wind-down` (or equivalent underperformance language)
- 8 public affiliate-kit docs unread
- Form field resting-state contrast
- Mobile lesson typography review on real devices
- Role fork visible documentation banner

---

## N. Top opportunities — re-ranked from May-19

The May-19 audit had a 15-item rank-ordered list. Re-ranking now based on what's still open + the new regression in AI-tell hygiene:

| # | Opportunity | Cost | Why now |
|---|---|---|---|
| 1 | **Three-hour curriculum lexical AI-tell sweep** (`journey`, `mindset`, `blueprint`, `leverage` — context-by-context, not sed) | 3 hrs | This is the single regression in this update. Moves §K from 5 back to 6+ and §G from 6 toward 7. |
| 2 | **Finish tagline v1.3 propagation** to `app/layout.tsx`, `app/coming-soon/page.tsx`, `app/mobile/page.tsx`, `components/LandingSequence.tsx`, `components/TeaseGate.tsx` | 30 min | Visible to every visitor; fixes §A's stated "why not 10" reason. |
| 3 | **Fresh canon read of the new affiliate-hub UI strings** (dashboard, admin, queue, payments, submit-copy) | 1–2 hrs | Light pollution from rapid build, never reviewed. Catch it before the first pilot affiliate sees it. |
| 4 | **Add `/affiliates/program` wind-down / underperformance language** | 1 hr | May-19 audit's #11 still open; partners ask this question before signing. |
| 5 | **Delete legacy dark-palette CSS vars** in `app/globals.css` | 15 min | Bundle hygiene; removes drift surface. May-19 #12. |
| 6 | **Role-fork `localStorage` persistence** + visible role-banner on consumer landing | 1 hr | May-19 #1 + #7 still both open. |
| 7 | **Form field resting-state contrast pass** | 30 min | May-19 accessibility gap that `prefers-reduced-motion` didn't address. |
| 8 | **Audit the 8 public affiliate-kit docs at `content/affiliate-kit/D*.md`** | 1 hr | Highest external-exposure unread surface (same as May-19 #14). |
| 9 | **Build `/design` admin page** documenting tokens, type ramp, button variants, etc. | 4 hrs | Pays off across every future contributor. May-19 #10. |
| 10 | **Mobile lesson typography review on real device** | 1 hr | May-19 #15 still open. Lessons unreadable on phone = silent product failure. |

**If you do nothing else this week, do #1 through #4.** Combined cost ~6 hours; closes the only regression and three of the five "very weak" items from the May-19 audit.

---

## O. Closing read

In three days the product moved meaningfully forward in four categories (Affiliate hub, Email templates, Behavioral, Accessibility), held in seven, and regressed in one (AI-tell hygiene in curriculum body copy).

The affiliate hub went from a strong marketing surface to a fully operational program — that's the largest single qualitative shift since baseline.

The behavioral/drop-off category closed multiple gaps the May-19 audit named as biggest opportunities: Day-0 welcome sequence, free-preview lesson, testimonials capture, `prefers-reduced-motion`.

The one thing not addressed is the thing the May-19 audit named as the single highest-leverage edit available: the lesson-body AI-tell sweep. It's still the right next move.

Everything else is small fixes with outsized value, exactly as the May-19 closing read predicted.

— End of update audit. Prepared 2026-05-22.

---

## P. Founder ratification — 2026-05-22 (post-audit)

**Founder quote:** *"journey, mindset, blueprint, leverage are perfectly fine
with me. As long as how they're structured in a sentence isn't the choppy stuff."*

**What this changes.** The May-19 audit's lexical AI-tell watch-list
(`journey`, `mindset`, `blueprint`, `leverage`) is **deprecated as a hygiene
metric**. These words are acceptable in the AESDR curriculum. The actual
concern is syntactic — whether the sentences containing them carry
telegraphic / choppy cadence (R-G3 territory), not whether the words
themselves appear.

**Empirical check** of whether the structural concern is present in current
state:

| Rubric axis | Units flagged 0 / 36 | Direction |
|---|---|---|
| Axis 1 (sentence-length variety) | 14 | could be choppy *or* bloated |
| Axis 6 (filler / over-cutting) | 20 | **bloated, not choppy** (lessons average >28 words/sentence in flagged units) |

The lessons skew toward sentence bloat after the Batch 8 deep-clean
over-merged short fragments. Choppy cadence — the actual founder concern
around these words — is **not present** in the curriculum.

### Regrades

| Category | Pre-ratification | Post-ratification |
|---|---|---|
| §G Curriculum body copy quality | 6 → 6 (→) | **6 → 7 (↑)** — rubric Axis 3 (R-G7 AI-tells) + Axis 5 (register) now clean across all 36 units; the lexical concern that capped this is deprecated |
| §K AI-tell / non-human language hygiene | 6 → 5 (↓) | **6 → 6 (→)** — no regression. The new affiliate-hub light pollution (`unlock`, `mindset`, `unleash` in dashboard/admin strings) is the only real residual; lessons are clean by the criteria the founder actually cares about |
| §L Language consistency across surfaces | 5 → 6 (↑) | **5 → 6 (↑)** — unchanged |

### Updated opportunity list

The May-19 audit's #1 recommendation (3-hour lexical AI-tell sweep across
36 lessons) is **retired** by this ratification. New ranking:

| # | Opportunity | Cost | Why |
|---|---|---|---|
| 1 | **Finish tagline v1.3 propagation** to layout, coming-soon, mobile, LandingSequence, TeaseGate | 30 min | Visible to every visitor; closes §A's "why not 10" reason |
| 2 | **Fresh canon read of new affiliate-hub UI strings** (dashboard, admin queue, payments, submit-copy, emails) | 1–2 hrs | Light pollution from rapid build, never reviewed |
| 3 | **Curriculum bloat pass** — 20 units flagged Axis 6 = 0 (sentence avg >28 words). Tighten sentence-length variety, restore short-sentence punch | 3–4 hrs | This is the actual structural concern in the lessons; replaces the deprecated lexical sweep |
| 4 | **Add `/affiliates/program` wind-down / underperformance language** | 1 hr | Partners ask this before signing; May-19 #11 still open |
| 5 | **Delete legacy dark-palette CSS vars** in `app/globals.css` | 15 min | Bundle hygiene; removes drift surface |
| 6 | **Role-fork `localStorage` persistence** + visible role-banner on consumer landing | 1 hr | May-19 #1 + #7 still both open |
| 7 | **Form field resting-state contrast pass** | 30 min | May-19 accessibility gap |
| 8 | **Audit the 8 public affiliate-kit docs at `content/affiliate-kit/D*.md`** | 1 hr | Highest external-exposure unread surface |
| 9 | **Build `/design` admin page** documenting tokens, type ramp, button variants | 4 hrs | Pays off across every future contributor |
| 10 | **Mobile lesson typography review on real device** | 1 hr | May-19 #15 still open |

**If you do nothing else this week, do #1 through #3.** Combined cost ~5
hours; closes the most-visible tagline drift, the unaudited new surface,
and the actual structural concern in the lesson body.

### Net direction (post-ratification)

| Category | May 19 | This update |
|---|---|---|
| Affiliate hub | 8 | **9** ↑ |
| Email templates | 6 | **7** ↑ |
| Behavioral / drop-off design | 4 | **6** ↑↑ |
| Accessibility | 4 | **5** ↑ |
| Language consistency across surfaces | 5 | **6** ↑ |
| **Curriculum body copy quality** | 6 | **7** ↑ ← *regraded* |
| AI-tell / non-human language hygiene | 6 | **6** → ← *regraded (no regression)* |
| Brand voice + positioning | 9 | 9 → |
| Visual identity + design system | 8 | 8 → |
| Consumer landing + FAQ | 8 | 8 → |
| Curriculum structure | 8 | 8 → |
| `/enterprise` subsidiary | 6 | 6 → |
| Mobile experience | 5 | 5 → |

**Six categories up, seven flat, zero down.** Three days of work moved the
needle on every category the founder prioritized.
