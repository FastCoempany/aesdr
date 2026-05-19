# Language-patch master plan

> **Status:** Active. The itemised checklist of every surface that
> gets swept against the canon, every lesson that gets rewritten to
> the rubric, every component that carries buyer-facing copy.
> **Sequencing:** Built on top of `build/behavioral-pass` (which is
> not merged to main and is treated as part of this overhaul).
> **Owner:** Antaeus Coe.
> **Last revised:** 2026-05-19.

The canon (`2026-05-19-language-patch-supplement.md`) defines the
rules. This plan names every surface those rules apply to and the
order they get swept. Every row is a real deliverable; nothing
hand-waved.

---

## Sequencing — eight batches

| Batch | What | Surfaces | Estimated effort | Founder review hours |
|---|---|---|---|---|
| 1 | Canon ratification | 4 new docs | 0.5d | 2h |
| 2 | Enforcement scaffolding | ESLint rule + PR checklist + CLAUDE.md | 1d | 0.5h |
| 3 | Consumer marketing sweep | 14 routes + 7 components | 4d | 3h |
| 4 | Member-area sweep | 9 routes + 5 components | 2d | 2h |
| 5 | B2B sweep | 13 /teams routes + 8 partner routes + 8 partner components | 4d | 2h |
| 6 | Email sweep | 23 templates | 3d | 2h |
| 7 | Internal + partner-kit docs | 32 markdown files | 3d | 2h |
| 8 | Curriculum rewrite | 36 lesson HTML + 5 tool HTML | 4–6 weeks | 15h |

Total estimated effort: ~7–9 weeks calendar, ~28h of founder review.
Batches 3–7 run in calendar parallel; batch 8 is the long pole and
runs alongside everything else.

Each batch ships as one PR (or one tight set of PRs for batches 8).
PR descriptions cite the specific rules driving each change.

---

## Batch 1 · Canon ratification

Four new docs created today (2026-05-19):

| File | Status | What |
|---|---|---|
| `docs/canon-revisions/2026-05-19-language-patch-supplement.md` | **Drafted** | R-G1 through R-G7 with examples |
| `docs/canon-revisions/2026-05-19-curriculum-copy-rubric.md` | **Drafted** | Six-axis scoring; 6/9/10 bar |
| `docs/canon-revisions/2026-05-19-plan-to-canon-process.md` | **Drafted** | Capture → promote → sweep → enforce → review |
| `docs/canon-revisions/2026-05-19-language-patch-master-plan.md` | **This doc** | Itemised sweep checklist |

**Gates.** Founder reads, redlines, approves. Until that happens, no
sweep work starts. Approving this batch means the rules are real and
the sequence below is the order of operations.

---

## Batch 2 · Enforcement scaffolding

| Deliverable | File | Status | Notes |
|---|---|---|---|
| ESLint blocklist rule for R-G4 manufactured-concept terms in JSX strings | `.eslintrc.js` (extend) + custom rule file | Pending | Mechanical R-G4 enforcement |
| PR checklist update | `.github/pull_request_template.md` | Pending | R-G1 → R-G7 checks |
| `AGENTS.md` update | `AGENTS.md` (extend) | Pending | Reference new canon docs for next AI session |
| `CLAUDE.md` update | `CLAUDE.md` (extend) | Pending | Same |
| Inbox folder bootstrap | `docs/canon-revisions/_inbox/.gitkeep` | Pending | Capture step lives here |
| Reviews folder bootstrap | `docs/canon-revisions/_reviews/.gitkeep` | Pending | Quarterly review output lives here |

**Gates.** Founder approves the ESLint blocklist contents (which
terms get hard-banned, which stay soft-banned in canon only).

---

## Batch 3 · Consumer-marketing surface sweep

### Routes

| Route | File | Risk areas | Founder review |
|---|---|---|---|
| `/` (landing) | `app/page.tsx` | FAQ entries, sneakpeek section, final CTA copy, comparison section (newly added), "What this is NOT" cards (newly added), footer | Required |
| `/about` | `app/about/page.tsx` | Founder bio prose, philosophy section, who-it's-for / who-it's-not-for | Required |
| `/preview` | `app/preview/page.tsx` | Gated takeaway copy, archetype descriptions, prompt body, sub-headlines | Required |
| `/free/manager-archetype-map` | `app/free/manager-archetype-map/page.tsx` | Archetype snapshots, "reads as competence/threat" bullets, weekly-move copy, ink-surface email-capture pitch | Required |
| `/syllabus` | `app/syllabus/page.tsx` | Lesson teasers, annotations, advanced-buyer callout (newly added), CTA section | Required |
| `/coming-soon` | `app/coming-soon/page.tsx` | Bypass-code prompt, mascot caption | Quick check |
| `/contact` | `app/contact/page.tsx` | Form labels, submit confirmation, contact options copy | Quick check |
| `/terms` | `app/terms/page.tsx` | Legal — sweep carefully, don't break enforceability | Required |
| `/privacy` | `app/privacy/page.tsx` | Same as terms | Required |
| `/refund-policy` | `app/refund-policy/page.tsx` | Same | Required |
| `/mobile` | `app/mobile/page.tsx` | Mobile gate copy | Quick check |
| `/login` | `app/login/page.tsx` + layout | Auth labels, "forgot password" prompts | Quick check |
| `/signup` | `app/signup/page.tsx` + layout | Same | Quick check |
| `/success` | `app/success/page.tsx` | Post-purchase thank-you, next-steps | Required |
| `/purchase/cancel` | `app/purchase/cancel/page.tsx` | Cancellation message + recovery prompt | Quick check |

### Components

| Component | File | Risk areas |
|---|---|---|
| `LandingSequence` | `components/LandingSequence.tsx` + `landing-sequence/copy.ts` | Hero headline, confession sequence, terminal block, zoom cards |
| `DeckStack` | `components/DeckStack.tsx` | Lesson questions (12 strings), peel-hint, end-of-deck card |
| `PricingTiers` | `components/PricingTiers.tsx` | Three tier taglines, feature bullets, badges, trust row (newly added) |
| `Testimonials` | `components/Testimonials.tsx` | Section eyebrow (rewritten today), seed quotes (need replacement long-term, not via sweep) |
| `ValidationMarquee` | `components/ValidationMarquee.tsx` + `.module.css` | Company logos + framing copy |
| `MobileGate` | `components/MobileGate.tsx` | Mobile-not-supported message |
| `AesdrBrand` | `components/AesdrBrand.tsx` | (logo only — minor) |
| `GhostButton` | `components/GhostButton.tsx` | Bypass-code UI prompts |
| `EditorialMasthead` | `components/EditorialMasthead.tsx` | If used on marketing — verify usage |
| `RoleSwitcher` | `components/RoleSwitcher.tsx` | Account-side, but copy seeps to marketing |

**Acceptance per route/component.** All R-G1–R-G7 checks pass.
Diff < 80% line churn (otherwise it's a rewrite, not a sweep).

---

## Batch 4 · Member-area surface sweep

### Routes

| Route | File | Risk areas | Founder review |
|---|---|---|---|
| `/dashboard` | `app/dashboard/page.tsx` | TEASERS object (12 cryptic lines), resume CTA, completion celebration, lesson-list teaser copy | Required |
| `/account` | `app/account/page.tsx` | Section labels, support link, pause buttons (newly added). Note: still uses retired dark palette — flag for separate visual-debt sweep. | Quick check |
| `/account/onboarding` | `app/account/onboarding/page.tsx` + `OnboardingForm.tsx` | Implementation-intention prose, three rules, weekly-nudge opt-in label | Required |
| `/account/review` | `app/account/review/page.tsx` + `TestimonialForm.tsx` | Form prompts, dynamic rating-1-3 vs 4-5 messaging, submitted state | Required |
| `/account/implementation-guide` | `app/account/implementation-guide/page.tsx` | Twelve weekly briefs + moves, three rules, fall-behind copy | Required |
| `/account/change-password` | `app/account/change-password/page.tsx` | Form labels, success copy | Quick check |
| `/account/reset-password` | `app/account/reset-password/page.tsx` | Same | Quick check |
| `/account/set-password` | `app/account/set-password/page.tsx` | Same | Quick check |
| `/account/select-role` | `app/account/select-role/page.tsx` | Role-pick prompts (currently on retired dark palette — flag) | Required |
| `/alumni` | `app/alumni/page.tsx` | AESDR-trained headline, tools list, share section | Required |
| `/welcome` | `app/welcome/page.tsx` + `welcome.module.css` | Content warning, hero copy | Required |
| `/course/[lessonId]` | `app/course/[lessonId]/page.tsx` | Save-and-exit, stuck mailto, lesson topbar | Quick check |
| `/course/[lessonId]/complete` | `app/course/[lessonId]/complete/page.tsx` | Completion message | Required |
| `/team` | `app/team/page.tsx` | Team admin landing | Required |
| `/team/accept` | `app/team/accept/page.tsx` | Invitation acceptance copy | Required |
| `/reveal` | `app/reveal/page.tsx` | Artefact choice prompts | Required |
| `/tools` | `app/tools/page.tsx` | Tools index | Quick check |
| `/artifacts/playbill` | `app/artifacts/playbill/page.tsx` | Generated artefact page | Required |
| `/artifacts/redline` | `app/artifacts/redline/page.tsx` | Same | Required |

### Components

| Component | File | Risk areas |
|---|---|---|
| `ArtifactTile` | `components/ArtifactTile.tsx` | Tile labels |
| `UnlockArtifactTile` | `components/UnlockArtifactTile.tsx` | Lock-state copy |
| `ChangePasswordForm` | `components/ChangePasswordForm.tsx` | Form prose |
| `CheckoutButton` | `components/CheckoutButton.tsx` | Button labels by tier |
| `MarkCompleteButton` | `components/MarkCompleteButton.tsx` | "Mark complete" + post-mark state |
| `SaveExitButton` | `components/SaveExitButton.tsx` | Button label only |
| `SignOutButton` | `components/SignOutButton.tsx` | Label only |
| `TeaseGate` | `components/TeaseGate.tsx` | Gate prompts |
| `PasswordOverlay` | `components/PasswordOverlay.tsx` | Auth overlay prose |
| `ProgressSaver` | `components/ProgressSaver.tsx` | Save indicators |

---

## Batch 5 · B2B (/teams + /partners) sweep

### `/teams/*` routes

| Route | File | Risk areas | Founder review |
|---|---|---|---|
| `/teams` | `app/teams/page.tsx` | Hero, value props, proof-of-concept section | Required |
| `/teams/curriculum` | `app/teams/curriculum/page.tsx` | Per-lesson summaries for the B2B audience | Required |
| `/teams/diagnostic` | `app/teams/diagnostic/page.tsx` | Diagnostic instrument intro, 6 vs 7-dim role split prose | Required |
| `/teams/implementation` | `app/teams/implementation/page.tsx` | 8-week plan for managers running the team rollout | Required |
| `/teams/integrations` | `app/teams/integrations/page.tsx` | 10 integration entries (R-G4 risk on "build trigger" phrases) | Required |
| `/teams/procurement` | `app/teams/procurement/page.tsx` | 17 spec sections — careful sweep, dense and legal-adjacent | Required |
| `/teams/champion-kit` | `app/teams/champion-kit/page.tsx` | Forwardable email, thirty-second pitch, six objections | Required |
| `/teams/pricing` | `app/teams/pricing/page.tsx` | Three tier descriptions for B2B audience | Required |
| `/teams/partners` | `app/teams/partners/page.tsx` | Channel-partner intake | Required |
| `/teams/contact` | `app/teams/contact/page.tsx` | Contact form | Quick check |
| `/teams/downloads` | `app/teams/downloads/page.tsx` | Downloads index | Quick check |
| `/teams/downloads/certificate` | `app/teams/downloads/certificate/page.tsx` + `CertificateGenerator.tsx` | Form labels, certificate body copy, share button | Required |
| `/teams/downloads/diagnostic-instrument` | `app/teams/downloads/diagnostic-instrument/page.tsx` | Diagnostic standalone page | Required |
| `/teams/downloads/partner-one-pager` | `app/teams/downloads/partner-one-pager/page.tsx` | Partner one-pager | Required |
| `/teams/layout.tsx` | `app/teams/layout.tsx` | Navigation labels, footer (newly extended) | Quick check |

### `/teams/_components/` shared components

| Component | File | Risk areas |
|---|---|---|
| `TeamsFooter` | `app/teams/_components/TeamsFooter.tsx` | Footer link labels, "powered by" tagline |
| `SubLogo` | `app/teams/_components/SubLogo.tsx` | Sub-logo aria-label, "T" variant |
| `SpecSection` | `app/teams/_components/SpecSection.tsx` | Wrapper — no copy of its own |
| `InlineCTA` | `app/teams/_components/InlineCTA.tsx` | CTA wrapper — verify default labels |
| Any others in `app/teams/_components/` | (audit during sweep) | TBD |

### `/partners/*` routes

| Route | File | Founder review |
|---|---|---|
| `/partners` | `app/partners/page.tsx` | Required |
| `/partners/apply` | `app/partners/apply/page.tsx` | Required |
| `/partners/curriculum` | `app/partners/curriculum/page.tsx` | Required |
| `/partners/economics` | `app/partners/economics/page.tsx` | Required |
| `/partners/faq` | `app/partners/faq/page.tsx` | Required |
| `/partners/how-we-work` | `app/partners/how-we-work/page.tsx` | Required |
| `/partners/kit-private/[slug]` | `app/partners/kit-private/[slug]/page.tsx` | Required (per-slug) |
| `/partners/kit-private` | `app/partners/kit-private/page.tsx` | Required |
| `/partners/kit/[slug]` | `app/partners/kit/[slug]/page.tsx` | Required (per-slug) |
| `/partners/kit` | `app/partners/kit/page.tsx` | Required |
| `/partners/payments` | `app/partners/payments/page.tsx` | Required |
| `/partners/play` | `app/partners/play/page.tsx` | Required |
| `/partners/program` | `app/partners/program/page.tsx` | Required |
| `/partners/timeline` | `app/partners/timeline/page.tsx` | Required |
| `/partners/who-we-dont-work-with` | `app/partners/who-we-dont-work-with/page.tsx` | Required |

### `/partners/_components/`

| Component | Risk areas |
|---|---|
| `ApplicationForm` | Form prose, validation messages |
| `CatalogTeaserGrid` | Per-lesson teasers (overlaps with B2B curriculum) |
| `EconomicsCalculator` | Tool labels, calculated copy |
| `FAQAccordion` | FAQ entries (per-slug) |
| `HubChrome` | Hub wrapper labels |
| `HubElements` | Hub microcopy |
| `KitIndexList` | Kit doc index labels |
| `PlayGame` | Game prompts and outcomes |

---

## Batch 6 · Email sweep (all 23 templates in `lib/email.ts`)

| Template | Function | Status | Notes |
|---|---|---|---|
| Welcome | `sendWelcomeEmail` | Pre-canon | Full sweep |
| Receipt | `sendReceiptEmail` | Pre-canon | Full sweep |
| Day-0 +12hr | `sendDay0PlusTwelveHours` | Post-canon (today) | Light pass |
| Day-0 +36hr | `sendDay0PlusThirtySixHours` | Post-canon (today) | Light pass |
| Day 3 drip | `sendDay3Email` | Pre-canon | Full sweep |
| Day 7 drip | `sendDay7Email` | Pre-canon | Full sweep |
| Abandon 1hr | `sendAbandon1hr` | Pre-canon | Full sweep |
| Abandon 24hr | `sendAbandon24hr` | Pre-canon | Full sweep |
| Drop-off 5d | `sendDropoff5d` | Rewritten today | Verify pass |
| Drop-off 10d | `sendDropoff10d` | Rewritten today | Verify pass |
| Drop-off 21d | `sendDropoff21d` | Rewritten today | Verify pass |
| Review request | `sendReviewRequest` | Rewritten today | Verify pass |
| Review nudge | `sendReviewNudge` | Rewritten today | Verify pass |
| Team invite | `sendTeamInviteEmail` | Pre-canon | Full sweep |
| Lesson complete | `sendLessonCompleteEmail` | Pre-canon | Full sweep |
| Reveal unlocked | `sendRevealUnlockedEmail` | Pre-canon | Full sweep |
| Manager Archetype Map | `sendManagerArchetypeMap` | Post-canon (today) | Light pass |
| Lesson-completed nudge | `sendLessonCompletedNudge` | Post-canon (today) | Light pass |
| Weekly framing | `sendWeeklyFraming` | Post-canon (today) | Light pass |
| Win-back | `sendWinBack` | Post-canon (today) | Light pass |
| Alumni 6/12m | `sendAlumniReengagement` | Post-canon (today) | Light pass |
| Partner application | `sendPartnerApplicationNotification` | Internal — skip from canon sweep |  |
| Teams inquiry | `sendTeamsInquiryNotification` | Internal — skip |  |

**Pre-canon = 9 templates** need full sweep. **Post-canon = 11
templates** need a light verify-pass. **Internal = 3 templates**
(go to founder, not customer — skip from this sweep).

---

## Batch 7 · Internal + partner-kit doc sweep

Internal docs feed copy to partner-facing surfaces. Manufactured
concepts leak from these docs into landing pages faster than
anywhere else.

### `content/aesdr-internal/` (12 files)

| File | Sweep depth |
|---|---|
| `00-canon-excerpt.md` | Verify vs. base canon (don't drift) |
| `09a-newsletter-launch.md` | Full sweep |
| `09b-newsletter-reminder.md` | Full sweep |
| `09c-podcast-intro-script.md` | Full sweep |
| `09d-social-pre-approved-posts.md` | **Critical** — partners copy these verbatim |
| `10d-lockup-usage-guide.md` | Light pass |
| `11-tracking-links.md` | Light pass (mostly URLs) |
| `13-operating-cadence.md` | Full sweep |
| `D19-disclosure-language-pack.md` | Legal — careful pass |
| `D20-claims-sheet.md` | **Critical** — every claim sentence |
| `D21-positioning-brief.md` | **Critical** — positioning source-of-truth |
| `D28-pricing-and-promo-sheet.md` | Full sweep |
| `D31-curriculum-map.md` | Full sweep |
| `README.md` | Light pass |

### `content/partner-kit/` (9 files)

| File | Sweep depth |
|---|---|
| `approved-claims.md` | **Critical** |
| `banned-vocabulary.md` | Merge with R-G4 blocklist; resolve overlap |
| `co-promoting-aesdr.md` | Full sweep |
| `curriculum-overview.md` | Full sweep |
| `disclosure-language-pack.md` | Legal — careful pass |
| `lockup-usage.md` | Light pass |
| `pilot-rhythm.md` | Full sweep |
| `positioning-brief.md` | **Critical** |
| `specimen-partnership-agreement.md` | Legal — careful pass |

### `content/partner-kit-private/` (9 files)

| File | Sweep depth |
|---|---|
| `approval-workflow.md` | Full sweep |
| `audience-objections.md` | Full sweep |
| `escalation-contacts.md` | Light pass |
| `lockup-files.md` | Light pass |
| `pre-workshop-checklist.md` | Full sweep |
| `promo-copy-pack.md` | **Critical** |
| `reporting-and-exports.md` | Light pass |
| `tracking-and-utms.md` | Light pass |
| `worked-commission-example.md` | Full sweep |

---

## Batch 8 · Curriculum rewrite (the long pole)

Per the rubric in `2026-05-19-curriculum-copy-rubric.md`. Every lesson
unit gets audited, scored, rewritten to ≥9/10, founder-reviewed,
shipped.

### Lesson 01 · Building Real Camaraderie
| Unit | File | Estimated score | Target | Effort |
|---|---|---|---|---|
| 1.1 | `lesson-01/aesdr_course01_v1.html` | 6/10 | 9/10 | ~3h |
| 1.2 | `lesson-01/aesdr_course01_2_v1.html` | 6/10 | 9/10 | ~3h |
| 1.3 | `lesson-01/aesdr_course01_3_v1.html` | 6/10 | 9/10 | ~3h |

### Lesson 02 · Breaking Down Silos
| Unit | File | Estimated | Target | Effort |
|---|---|---|---|---|
| 2.1 | `lesson-02/aesdr_course02_1_v1.html` | 6/10 | 9/10 | ~3h |
| 2.2 | `lesson-02/aesdr_course02_2_v1.html` | 6/10 | 9/10 | ~3h |
| 2.3 | `lesson-02/aesdr_course02_3_v1.html` | 6/10 | 9/10 | ~3h |

### Lesson 03 · Performance Pitfalls (SDR) / Surviving AE Management (AE)
| Unit | File | Estimated | Target | Effort |
|---|---|---|---|---|
| 3.1 | `lesson-03/aesdr_course03_1_v1.html` | 7/10 | 9/10 | ~2h |
| 3.2 | `lesson-03/aesdr_course03_2_v1.html` | 7/10 | 9/10 | ~2h |
| 3.3 | `lesson-03/aesdr_course03_3_v1.html` | 7/10 | 9/10 | ~2h |

### Lesson 04 · Navigating Manager Madness
| Unit | File | Estimated | Target | Effort |
|---|---|---|---|---|
| 4.1 | `lesson-04/aesdr_course04_1_v1.html` | 6/10 | 9/10 | ~3h |
| 4.2 | `lesson-04/aesdr_course04_2_v1.html` | 6/10 | 9/10 | ~3h |
| 4.3 | `lesson-04/aesdr_course04_3_v1.html` | 6/10 | 9/10 | ~3h |

### Lesson 05 · The AE/SDR Playbook
| Unit | File | Estimated | Target | Effort |
|---|---|---|---|---|
| 5.1 | `lesson-05/aesdr_course05_1_v1.html` | 5/10 | 9/10 | ~4h |
| 5.2 | `lesson-05/aesdr_course05_2_v1.html` | 5/10 | 9/10 | ~4h |
| 5.3 | `lesson-05/aesdr_course05_3_v1.html` | 5/10 | 9/10 | ~4h |

### Lesson 06 · Beyond the Sales Playbook
| Unit | File | Estimated | Target | Effort |
|---|---|---|---|---|
| 6.1 | `lesson-06/aesdr_course06_1_v1.html` | 6/10 | 9/10 | ~3h |
| 6.2 | `lesson-06/aesdr_course06_2_v1.html` | 6/10 | 9/10 | ~3h |
| 6.3 | `lesson-06/aesdr_course06_3_v1.html` | 6/10 | 9/10 | ~3h |

### Lesson 07 · Prospecting & Pipeline
| Unit | File | Estimated | Target | Effort |
|---|---|---|---|---|
| 7.1 | `lesson-07/aesdr_course07_1_v1.html` | 6/10 | 9/10 | ~3h |
| 7.2 | `lesson-07/aesdr_course07_2_v1.html` | 6/10 | 9/10 | ~3h |
| 7.3 | `lesson-07/aesdr_course07_3_v1.html` | 6/10 | 9/10 | ~3h |

### Lesson 08 · The 30% Rule
| Unit | File | Estimated | Target | Effort |
|---|---|---|---|---|
| 8.1 | `lesson-08/aesdr_course08_1_v1.html` | 7/10 | 9/10 | ~2h |
| 8.2 | `lesson-08/aesdr_course08_2_v1.html` | 7/10 | 9/10 | ~2h |
| 8.3 | `lesson-08/aesdr_course08_3_v1.html` | 7/10 | 9/10 | ~2h |

### Lesson 09 · CRM Survival Guide
| Unit | File | Estimated | Target | Effort |
|---|---|---|---|---|
| 9.1 | `lesson-09/aesdr_course09_1_v1.html` | 6/10 | 9/10 | ~3h |
| 9.2 | `lesson-09/aesdr_course09_2_v1.html` | 6/10 | 9/10 | ~3h |
| 9.3 | `lesson-09/aesdr_course09_3_v1.html` | 6/10 | 9/10 | ~3h |

### Lesson 10 · Compensation Realities
| Unit | File | Estimated | Target | Effort |
|---|---|---|---|---|
| 10.1 | `lesson-10/aesdr_course10_1_v1.html` | 7/10 | 9/10 | ~2h |
| 10.2 | `lesson-10/aesdr_course10_2_v1.html` | 7/10 | 9/10 | ~2h |
| 10.3 | `lesson-10/aesdr_course10_3_v1.html` | 7/10 | 9/10 | ~2h |

### Lesson 11 · Sober Selling
| Unit | File | Estimated | Target | Effort |
|---|---|---|---|---|
| 11.1 | `lesson-11/aesdr_course11_1_v1.html` | 8/10 | 9/10 | ~1h |
| 11.2 | `lesson-11/aesdr_course11_2_v1.html` | 8/10 | 9/10 | ~1h |
| 11.3 | `lesson-11/aesdr_course11_3_v1.html` | 8/10 | 9/10 | ~1h |

### Lesson 12 · Levelling Up SaaS Relationships
| Unit | File | Estimated | Target | Effort |
|---|---|---|---|---|
| 12.1 | `lesson-12/aesdr_course12_1_v1.html` | 7/10 | 9/10 | ~2h |
| 12.2 | `lesson-12/aesdr_course12_2_v1.html` | 7/10 | 9/10 | ~2h |
| 12.3 | `lesson-12/aesdr_course12_3_v1.html` | 7/10 | 9/10 | ~2h |

### Tool HTML (5 files)

| Tool | File | Sweep |
|---|---|---|
| AE/SDR Alignment Contract | `tools/standalone-html/3.3-aesdr-alignment-contract.html` | Full pass — UI labels + instructions |
| I Don't Know Framework | `tools/standalone-html/6.3-idk-framework.html` | Full pass |
| Time Reclaimed Calculator | `tools/standalone-html/9.2-time-reclaimed-calculator.html` | Full pass |
| ROI & Commission Defense Tracker | `tools/standalone-html/10.1-ROI-commission-defense-tracker.html` | Full pass |
| 72-Hour Strike Plan | `tools/standalone-html/12.3-72-hr-strike-plan.html` | Full pass |

### Curriculum sweep workflow

For each unit:

1. I open the HTML, read it end to end once
2. I score against the six axes (rubric doc)
3. I produce a rewrite as a diff, marked-up
4. I post the diff with: starting score, target axes lifted, any
   `[CONTENT QUESTION]` markers for paragraphs where the meaning
   itself needs founder input
5. Founder reads, redlines, approves, or sends back
6. Ship when approved
7. Move to next unit

Cadence target: 3 units/week sustainable; faster on the easier
lessons. Realistic ship window for all 36 units + 5 tools: 6 weeks.

---

## Affiliate hub (separate workstream — not part of this sweep)

Tracked here for completeness; built as a parallel feature workstream
once the canon ratifies. Open questions for founder before scoping:

1. Is `/affiliate` a separate audience from `/partners` (channel
   partners = companies), or a renamed expansion?
2. Payout model: percentage of sale or fixed bounty per signup?
3. Brand-conformance gate: first 3 pieces of affiliate marketing
   copy reviewed and approved before going live? (See risk
   register R.04.)
4. Tracking: UTM-only or per-affiliate signed link?
5. Dashboard: visible to the affiliate themselves, or admin-only?

Once these are answered I'll write a separate plan doc:
`2026-05-19-affiliate-hub-plan.md`.

---

## Cross-batch consistency tracking

A single tracking doc gets created on first sweep batch and updated
as each batch ships:

`docs/canon-revisions/_reviews/2026-language-patch-progress.md`

Contains:
- Sweep batches shipped / pending
- Curriculum units shipped / in review / pending
- Open `[CONTENT QUESTION]` markers awaiting founder input
- Any new patterns found mid-sweep (flagged to inbox)

Updated at the end of every sweep PR.

---

## Risks during this overhaul

| Risk | Mitigation |
|---|---|
| Sweep PRs grow too large to review | One PR per batch; batch 8 broken into per-lesson PRs |
| Founder review backlog stalls curriculum | Front-load Lessons 5, 1, 2, 4 (highest-leverage rewrites); send in batches of 3 units |
| Sweep introduces meaning changes accidentally | PR description must call out any sentence whose *meaning* changed (not just style) — review flag |
| Canon drift mid-sweep (new rule promoted while sweep in progress) | New rules during sweep get logged but only applied in the *next* sweep, not retroactively |
| `build/behavioral-pass` diverges from main during sweep | Either merge first (Path A) — currently deferred — or rebase weekly. **Decision pending founder.** |

---

## Founder decision points before batch 3 starts

1. **Approve the four canon docs as written?** Redline if not.
2. **Approve the eight-batch sequence?** Re-order if not.
3. **Ratify the R-G4 manufactured-concept blocklist?** Add/remove
   terms; this is the list that will be regex-enforced in batch 2.
4. **Decide on `build/behavioral-pass` merge timing.** Two options:
   - **A.** Merge to main after batch 2 (enforcement scaffolding); do
     batch 3+ on main.
   - **B.** Keep on `build/behavioral-pass` through the whole sweep;
     merge all-at-once when the entire overhaul ships.
5. **Approve curriculum rewrite authority model.** I draft → you
   redline per unit; OR you outline → I draft → you redline per unit.
6. **Affiliate hub scope answers** (5 questions in section above).

Once these six are answered, batch 2 starts and the sweep gets real.
