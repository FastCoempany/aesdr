# 05 — Canonical References (Repo Paths to Ingest Directly)

This file tells Claude Design which paths inside the live `FastCoempany/aesdr` repo to read **as the source of truth**. The PDFs and PNGs in this seed kit are distillations and renders. The repo files below are the authoritative tokens, layouts, and components — when something disagrees, the repo wins.

> **Recommended onboarding order**
>
> 1. Link the **GitHub repo** (`FastCoempany/aesdr`) so Claude Design can ingest the live code.
> 2. Upload the three PDFs in this seed kit (`01-brand-canon.pdf`, `02-typography-specimen.pdf`, `03-color-palette.pdf`).
> 3. Upload the rendered PNGs in `04-rendered-surfaces/` for visual style extraction.
> 4. Upload the individual assets in `06-individual-assets/` (wordmark, iris swatch).
> 5. Confirm the system extracted the editorial palette (cream / ink / crimson / muted / light / iris) and the five fonts (Playfair Display, Source Serif 4, Barlow Condensed, Space Mono, Caveat). If anything is wrong, point it back at this file.

---

## Tier 1 — Binding tokens (the design system lives here in code)

| Path | What's there | Why it's binding |
|---|---|---|
| `app/globals.css` | All canonical CSS custom properties: `--cream`, `--ink`, `--crimson`, `--muted`, `--light`, `--iris`, plus the five font tokens (`--display`, `--serif`, `--cond`, `--mono`, `--hand`). | The token values in this file are the **single source of truth** for color and font in AESDR. Any extraction by Claude Design should agree with these. |
| `components/LandingSequence.module.css` | The editorial palette in production CSS. Patterns: `.hero` editorial split, `.terminal` block on cream, `.zcard` zoom cards, `.ctaOverlay` crimson offer panel, `.scrollProgress` iris ambient line. | This is the canonical reference for every layout pattern in AESDR. |
| `components/DeckStack.module.css` | The wheel-driven deck-stack peel pattern (12 cards, iris numeral, Caveat description in crimson). | Canonical for the deck-stack layout. |

## Tier 2 — Canonical reference layouts (treat as design exemplars)

| Path | What it is |
|---|---|
| `variants/variant-a-editorial-split.html` | **The canonical editorial layout.** Full landing-page reference: hero editorial split, terminal block, zoom cards, deck-stack, pricing, FAQ classified cards, footer. If Claude Design is asked to design a new AESDR surface, this file is the truth-set. |
| `variants/variant-b-broadsheet.html` | Alternate broadsheet variant (reference only — not currently in production). |
| `variants/variant-c-dark-editorial.html` | **DO NOT REVIVE.** The dark-editorial variant. Retired per `AGENTS.md`. Included only so the system understands what's *not* allowed. |

## Tier 3 — Voice / brand canon documents (read-only canonical)

| Path | What it is |
|---|---|
| `AGENTS.md` | The binding palette and font directive. Defines retired vs active palette explicitly. |
| `AFFILIATE_BRAND_CANON.md` | The full v1.1 brand canon for the partner / affiliate ecosystem. Voice ratios, the two voices (Rowan + Michael), banned vocabulary, signature moves, custom-iconography doctrine, visual-QA discipline. |
| `SESSION_STATE.md` | Locked design decisions and locked copy for the in-flight role-fork landing-page conversion test. |
| `MVI-STANDARDS.md` | Course-gate standards (Inter font has one course-gate scope exception named here — nowhere else). |

## Tier 4 — Voice in production (style-of-voice reference, not canon)

| Path | What it is |
|---|---|
| `docs/content/A01-lead-magnet-survival-guide.md` through `A09-testimonials.md` | The actual marketing voice in production. Ten files covering lead magnet, welcome / cart-abandonment / re-engagement / review-request emails, newsletter copy, Reddit ads, YouTube pre-rolls, testimonials. |
| `docs/partner/D01–D34` | The partner-ecosystem deliverables. Useful as voice reference but **downstream** of canon — do not treat as source. |

## Tier 5 — Components (brand decisions encoded in code)

| Path | What it is |
|---|---|
| `components/AesdrBrand.tsx` | The brand wordmark component. |
| `components/LandingSequence.tsx` | The full editorial-split → confession → terminal → zoom → CTA sequence. |
| `components/DeckStack.tsx` | The 12-card wheel-driven peel UI. |
| `components/MobileGate.tsx` | The mobile-gate landing artifact. |
| `components/Testimonials.tsx` | Horizontal-scroll testimonial gallery. |
| `components/GhostButton.tsx` | The hidden bypass button (insider-culture artifact). |

## Tier 6 — Standalone tools (artifact-style reference)

| Path | What it is |
|---|---|
| `tools/standalone-html/3.3-aesdr-alignment-contract.html` | The AE/SDR Alignment Contract tool. |
| `tools/standalone-html/6.3-idk-framework.html` | The IDK Framework tool. |
| `tools/standalone-html/9.2-time-reclaimed-calculator.html` | Time Reclaimed Calculator. |
| `tools/standalone-html/10.1-ROI-commission-defense-tracker.html` | ROI / Commission Defense Tracker. |
| `tools/standalone-html/12.3-72-hr-strike-plan.html` | 72-Hour Strike Plan. |

These are the actual takeaway tools that ship inside AESDR — they're a strong reference for how AESDR-feeling interactive artifacts are built (cream backgrounds, ink type, mono labels, crimson highlights, iris accents).

---

## Tier 7 — Mockups (DO NOT INGEST FOR VISUAL EXTRACTION)

| Path | Status |
|---|---|
| `public/mockups/01-locked-vault.html` through `27-deck-stack.html` | **Retired-palette artifacts.** Use `#020617`, `#10B981`, `#F59E0B`, `#8B5CF6` etc. — the full forbidden set. |
| `public/mockups/artifact-*.html` | Same — pre-editorial-palette era. |
| `public/mockups/reveal-*.html` | Same. |
| `public/mockups/tool-*.html`, `public/mockups/tools/*.html` | Same. |
| `public/mockups/syllabus/variant-A,B,C.html` | Same. |
| `public/mockups/fork-*.html` | Same. |

**These files are exploration history, not canon. They use the retired dark palette codified as forbidden in `AGENTS.md` and `AFFILIATE_BRAND_CANON.md` §6.5.** If Claude Design ingests them and extracts a "design system" from them, the resulting system will use the wrong colors and contradict the binding canon.

The motifs explored in these files (dossier / classified / terminal / two-voices / deck-stack / warning-box) are real and canonical, but the palette they're rendered in is not. The active-palette renderings of the same motifs live in:

- `04-rendered-surfaces/pattern-editorial-split-hero.png`
- `04-rendered-surfaces/pattern-two-voices.png`
- `04-rendered-surfaces/pattern-terminal-block.png`
- `04-rendered-surfaces/pattern-classified-card.png`
- `04-rendered-surfaces/pattern-deck-peel.png`

Use those. Do **not** point Claude Design at `public/mockups/`.

---

## What Claude Design should *not* read for design extraction

- `app/account/`, `app/admin/`, `app/dashboard/`, `app/login/`, `app/signup/`, `app/team/` — operational pages, not voice-bearing.
- `app/error.tsx`, `app/global-error.tsx`, `app/not-found.tsx` — error pages, neutral by design.
- Build / config files: `package.json`, `tsconfig.json`, `next.config.ts`, `playwright.config.ts`, `eslint.config.mjs`, `instrumentation*.ts`, etc.
- `node_modules/`, `.next/`, `.git/`, `.vercel/`.
- Most `docs/planning/*` (operational planning, not brand).
- `docs/rollback-plan.md`, `docs/rollout-plan.md` (operational).

---

## A short note on the `design-canon/` snapshot folder

There's also a `design-canon/` folder at the repo root containing a 153-file snapshot of every brand-bearing document. It's intended for human browsing, not for direct Claude Design ingestion (too many files, too much surface area for attention). If Claude Design needs a single anchor, this seed kit (`design-canon-seed/`) is the targeted version.

— *Seed kit v1, snapshot 2026-04-29 against `affiliate-seeding @ 4788316` (canon v1.1).*
