# AESDR — Design Canon (snapshot)

**Snapshot date:** 2026-04-29
**Snapshot commit base:** `affiliate-seeding @ 4788316`
**Files in folder:** 153

This folder is a **copy** of every document, component, page, mockup, and asset that informs how AESDR thinks about, executes on, and decides about its **design, voice, identity, and brand** — across the whole repo, not just the affiliate ecosystem.

These are copies. Originals are still in their canonical locations and remain the source of truth — when canon changes, the originals update first and this folder gets re-snapped. Treat this folder as a reference library you can browse without hunting across the repo.

---

## How to use this folder

| If you want to… | Start here |
|---|---|
| Understand the binding brand rules (palette, fonts, what's retired) | `01-source-canon/AGENTS.md` |
| Understand the partner / affiliate brand canon | `01-source-canon/AFFILIATE_BRAND_CANON.md` |
| See what's currently in flight on the landing page conversion test | `01-source-canon/SESSION_STATE.md` |
| Read the strategic positioning and pricing posture | `01-source-canon/PRICING_ENGINE_SPEC.md`, `02-research-strategy/aesdr_7_for_70.md` |
| See the canonical token values (colors, fonts, gradients) | `03-css-tokens/globals.css` |
| See the canonical editorial layout in production CSS | `03-css-tokens/LandingSequence.module.css` |
| See the canonical editorial layout in HTML | `06-variants/variant-a-editorial-split.html` |
| Browse the design exploration history | `07-mockups/` |
| Read AESDR's voice in production marketing / content | `08-production-content/` |
| Read AESDR's voice for partner ecosystem | `09-affiliate-deliverables/` |
| See the standalone interactive tools we ship | `10-tools-standalone/` |

---

## Folder map

### `01-source-canon/`
The binding canon. If a deliverable contradicts something in here, the deliverable is wrong.

| File | What it is |
|---|---|
| `AGENTS.md` | **Binding.** Active palette, retired palette, font tokens, ground-truth references. Project-wide rule: every visual decision answers to this file. |
| `AFFILIATE_BRAND_CANON.md` | **Binding (v1.1).** The partner / affiliate ecosystem brand canon. Voice, visual, tone, delivery, structure, behavioral psych, compliance, founder-backstage doctrine, custom-icon system, visual QA discipline. Inherits from `AGENTS.md`. |
| `SESSION_STATE.md` | **Binding.** Locked design decisions and locked copy for the in-flight role-fork landing-page conversion test. |
| `CLAUDE.md` | Project instructions wrapper that points to `AGENTS.md`. |
| `MVI-STANDARDS.md` | Course-gate standards (where Inter font is permitted, etc.). |
| `ENGINEERING_VOCABULARY_FRONTEND_QUALITY.md` | Engineering vocabulary and frontend quality bar. |
| `PRICING_ENGINE_SPEC.md` | Pricing posture and rationale. |
| `AESDR_LAUNCH_TESTING_PLAN.md` | Launch testing plan. |
| `README--repo-root.md` | The repo's top-level README. |

### `02-research-strategy/`
The research and strategy that fed the canon.

| File | What it is |
|---|---|
| `affiliate-seeding-deep-research-report.md` | The research report that anchors the affiliate ecosystem (workshop-first, founding vineyard, partner archetypes, gates). |
| `aesdr_7_for_70.md` | Strategy doc — pricing tiers, audience tiers. |
| `aesdr_prioritization_spec.md` | Strategy doc — prioritization. |
| `refund-workflow.md` | Operational + voice canon for refund handling. The 14-day no-questions-asked policy is brand-canonical, sourced here. |

### `03-css-tokens/`
The production CSS that holds the actual token values + the canonical layout patterns. **Token values here are the source of truth.**

| File | What it holds |
|---|---|
| `globals.css` | All `--cream`, `--ink`, `--crimson`, `--muted`, `--light`, `--iris` and font tokens. Plus the retired palette tokens (still here for legacy course HTML compat — do not reference in new code). |
| `LandingSequence.module.css` | Editorial palette in production. The canonical reference for hero split, terminal block on cream, deck stack, zoom cards, CTA overlay. |
| `DeckStack.module.css` | The wheel-driven card-peel deck UI. |
| `page.module.css` | Landing page module. |
| `syllabus.module.css` | Syllabus page styling. |
| `welcome.module.css` | Post-purchase welcome flow. |
| `_gates.css` | Course-gate styling (used inside lesson HTML). |

### `04-components/`
React components whose existence implies a brand decision.

| File | What it represents |
|---|---|
| `AesdrBrand.tsx` | The brand wordmark component. |
| `LandingSequence.tsx` | The full editorial-split → confession → terminal → zoom → CTA sequence. |
| `DeckStack.tsx` | The 12-card peel UI. |
| `MobileGate.tsx` | The mobile-only gate (recent visual work). |
| `Testimonials.tsx` | Horizontal-scroll testimonial gallery (cream, serif italics). |
| `GhostButton.tsx` | The hidden bypass button (insider-culture artifact). |
| `PasswordOverlay.tsx` | Coming-soon password overlay. |
| `TeaseGate.tsx` | The blur-on-load classified-content gate. |
| `UnlockArtifactTile.tsx` | The per-lesson tool unlock UI. |
| `RoleSwitcher.tsx` | AE/SDR role-fork switcher (locked copy lives in `SESSION_STATE.md`). |

### `05-app-pages/`
User-facing pages whose copy is in production. File names flatten the original path with `--` (e.g., `app/welcome/page.tsx` → `welcome--page.tsx`).

Includes: landing, welcome, coming-soon, mobile, refund-policy, syllabus, about, contact, privacy, terms, tools, plus the artifacts (Playbill, Redline) and reveal pages.

### `06-variants/`
The three canonical landing-page layout variants.

| File | What it is |
|---|---|
| `variant-a-editorial-split.html` | **Canonical editorial layout.** The reference for everything brand-side. |
| `variant-b-broadsheet.html` | Broadsheet variant (alternate explored). |
| `variant-c-dark-editorial.html` | Dark editorial variant (note: the dark palette is retired per `AGENTS.md`; this file is reference-only and not to be revived as production). |

### `07-mockups/`
Every design mockup ever produced for AESDR. The full design exploration history. Includes:

- 27 numbered hero / surface mockups (`01-locked-vault.html` → `27-deck-stack.html`).
- Artifact mockups (`artifact-v2-*`, `artifact-variant-*`).
- Reveal-page mockups (`reveal-*`).
- Tool mockups (`tool-1` through `tool-5`).
- Identity-fork mockups (`fork-a/b/c`, `fork-index`).
- `tools/` and `syllabus/` subdirectories with finer-grained variants.

**These mockups inform the brand's *exploration history* but use the retired dark palette** (`#020617`, `#0F172A`, `#10B981`, `#EF4444`, `#38BDF8`, `#F59E0B`, `#8B5CF6`) — codified as forbidden in `AGENTS.md` and `AFFILIATE_BRAND_CANON.md` §6.5. The *motifs* (dossier, classified, terminal, two-voices, deck-stack, warning-box) are real and canonical, but the **palette-rendering** of those motifs in this folder is not. Do not point design generators at these files as visual canon. Active-palette renderings of the same motifs live in the production references (`variants/variant-a-editorial-split.html`, `components/LandingSequence.module.css`) and in `design-canon-seed/04-rendered-surfaces/pattern-*.png`.

### `08-production-content/`
Marketing and content copy currently in production. The actual brand voice in the wild.

| File | What it is |
|---|---|
| `A01-lead-magnet-quiz.md` | Lead magnet quiz copy. |
| `A01-lead-magnet-survival-guide.md` | The Survival Guide lead magnet. |
| `A02-cart-abandonment-emails.md` | Cart-abandonment email sequence. |
| `A03-welcome-email-sequence.md` | Post-purchase welcome sequence. |
| `A04-newsletter-placement-copy.md` | Newsletter placement copy. |
| `A05-reddit-ad-copy.md` | Reddit ad copy (anti-LinkedIn stance lives here). |
| `A06-youtube-preroll-scripts.md` | YouTube pre-roll ad scripts. |
| `A07-dropoff-prevention-emails.md` | Re-engagement email sequence. |
| `A08-review-request-sequence.md` | Post-purchase review-request flow. |
| `A09-testimonials.md` | Canonical testimonials (real names, real roles). |

### `09-affiliate-deliverables/`
The 21-and-counting partner ecosystem deliverables produced from `AFFILIATE_BRAND_CANON.md`. Downstream of canon, but useful as voice reference for future deliverables.

D01–D08 (outreach + workshop page cluster), D10–D16 (workshop email + SMS sequence), D19–D21 (compliance + positioning), D32–D34 (kill-or-keep, postmortem, close-out). See the canon file for the full deliverable list.

### `10-tools-standalone/`
The 5 actual takeaway tools that ship inside the AESDR program. They are downloadable HTML, in production-final form. They inform what "AESDR-feeling" interactive artifacts look like.

| File | What it is |
|---|---|
| `3.3-aesdr-alignment-contract.html` | The AE/SDR Alignment Contract (Course 3). |
| `6.3-idk-framework.html` | The IDK Framework (Course 6). |
| `9.2-time-reclaimed-calculator.html` | Time Reclaimed Calculator (Course 9). |
| `10.1-ROI-commission-defense-tracker.html` | ROI / Commission Defense Tracker (Course 10). |
| `12.3-72-hr-strike-plan.html` | 72-Hour Strike Plan (Course 12). |

---

## What's deliberately **not** in this folder

- `app/account/`, `app/admin/`, `app/dashboard/`, `app/login/`, `app/signup/`, `app/team/`, `app/error.tsx`, `app/global-error.tsx`, `app/not-found.tsx`, `app/course/`, `app/purchase/`, `app/success/` — these are functional pages, not voice-bearing brand surfaces. (Some of them have light brand voice but they are operational, not canonical.)
- `package.json`, `package-lock.json`, `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `playwright.config.ts`, `instrumentation*.ts`, etc. — build / dependency / infra config.
- `.env.local.example`, `.gitignore`, `.cursorrules` — config not voice.
- `node_modules/`, `.next/`, `.git/`, `.vercel/` — build artifacts.
- `docs/planning/*` (except `refund-workflow.md`) — operational planning, not brand canon. Includes backup-strategy, course-content-audit, env-variable-audit, launch-day-monitoring, launch-proxy-removal, migration-strategy, team-onboarding-process.
- `docs/rollback-plan.md`, `docs/rollout-plan.md` — operational, not brand.

If any of those should be in here, say so and I'll add them.

---

## Cadence

This folder is a **snapshot, not a live mirror.** When canon changes, the originals update first. To re-snap this folder against the latest, re-run the build.

Snapshots are intended to be re-taken at meaningful canon milestones — e.g., when `AFFILIATE_BRAND_CANON.md` bumps a major version, or when a new variant lands in `variants/`, or on partner-pilot postmortems that change something canonical.

---

*— Snapshot taken on 2026-04-29 against `affiliate-seeding @ 4788316`.*
