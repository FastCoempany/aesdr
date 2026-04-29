# AESDR — Design Seed Kit (for Claude Design onboarding)

**Version:** 1
**Snapshot:** 2026-04-29 against `affiliate-seeding @ 4788316`
**Brand canon version:** v1.1

This is the **targeted seed kit for Claude Design**. It contains exactly the inputs Claude Design's onboarding wants — PDFs, rendered PNGs, individual brand assets, and a pointer doc — sized to fit the tool's input format without dragging the rest of the repo through context.

The full repo (`FastCoempany/aesdr`) remains the source of truth. This kit is the distillation that helps Claude Design extract a faithful design system in one onboarding pass.

---

## Recommended onboarding sequence

> *Steps in order — Claude Design's preview wants codebase + design files, in that order.*

1. **Link the GitHub repo.** `FastCoempany/aesdr` (branch `affiliate-seeding`, or `main` once merged). Claude Design's preview is documented to ingest codebases directly — `app/globals.css` carries every token, `components/LandingSequence.module.css` carries the canonical layout patterns, `variants/variant-a-editorial-split.html` is the canonical reference layout. The repo is the design system.

2. **Upload the three PDFs from this kit:**
   - `01-brand-canon.pdf` — 8 pages distilling palette, typography, iris reservation, the two voices, voice rules, layout patterns, iconography, visual QA.
   - `02-typography-specimen.pdf` — 1 page showing all five fonts at real sizes with sample text.
   - `03-color-palette.pdf` — 1 page showing all six tokens with hex / RGB / use cases plus the iris gradient stops.

3. **Upload the rendered PNGs in `04-rendered-surfaces/`.** Six surface renders — the canonical hero from production plus five isolated single-pattern demonstrations — all in the **active editorial palette** (cream + ink + crimson + iris). The retired dark-palette mockups in `public/mockups/01-27` are deliberately *not* in this kit; their palette is forbidden by `AGENTS.md`.

4. **Upload the individual brand assets in `06-individual-assets/`.** The wordmark on cream and the iris gradient swatch as standalone images.

5. **Pin `05-canonical-references.md`.** It tells Claude Design which repo paths to treat as binding (Tier 1–3) versus reference (Tier 4–7).

---

## What's in this folder

```
design-canon-seed/
├── README.md                              ← you are here
├── 01-brand-canon.pdf                     8 pages · ~288K
├── 02-typography-specimen.pdf             1 page  · ~82K
├── 03-color-palette.pdf                   1 page  · ~67K
├── 04-rendered-surfaces/
│   ├── variant-a-editorial-split.png      canonical hero from production · ~223K
│   ├── pattern-editorial-split-hero.png   isolated split + warning box · ~236K
│   ├── pattern-two-voices.png             the two-voices motif · ~470K
│   ├── pattern-terminal-block.png         terminal block on cream · ~193K
│   ├── pattern-classified-card.png        classified dossier card pattern · ~201K
│   └── pattern-deck-peel.png              12-card deck-stack peel · ~110K
├── 05-canonical-references.md             pointer to live repo paths
└── 06-individual-assets/
    ├── wordmark-on-cream.png              the AESDR. wordmark · ~89K
    └── iris-gradient-swatch.png           iris gradient with stops · ~506K
```

Total: 12 files. Designed to onboard a single Claude Design instance without hunting across the repo.

---

## What Claude Design should extract from this kit

| Signal | Where it lives |
|---|---|
| Color tokens (hex + RGB + use case) | `03-color-palette.pdf` (definitive) · `01-brand-canon.pdf` p.2 (in context) · `06-individual-assets/iris-gradient-swatch.png` (visual) · `app/globals.css` (binding source) |
| Typography stack (5 fonts) | `02-typography-specimen.pdf` (definitive) · `01-brand-canon.pdf` p.3 (in context) · `app/globals.css` (binding source) |
| Iris reservation rules (where iris is allowed and where it is forbidden) | `01-brand-canon.pdf` p.4 (definitive) · `04-rendered-surfaces/variant-a-editorial-split.png` (canonical example) |
| The two voices (Rowan + Michael) | `01-brand-canon.pdf` p.5 · `04-rendered-surfaces/pattern-two-voices.png` |
| Banned vocabulary + signature moves | `01-brand-canon.pdf` p.6 |
| Layout patterns (editorial split, terminal block, classified card, deck-stack peel, warning box, editorial body) | `01-brand-canon.pdf` p.7 (catalog) · `04-rendered-surfaces/*.png` (real examples) · `variants/variant-a-editorial-split.html` in repo (binding) |
| Custom iconography seed inventory + register rules + banned commercial sets | `01-brand-canon.pdf` p.8 |
| Visual QA five-question check | `01-brand-canon.pdf` p.8 |
| Wordmark canonical rendering | `06-individual-assets/wordmark-on-cream.png` |
| Iris gradient stops (verbatim) | `06-individual-assets/iris-gradient-swatch.png` · `03-color-palette.pdf` |

---

## How this was built (so it can be re-run)

The PDFs and PNGs are generated programmatically from source HTML files in `tools/design-seed/`. To re-snap the kit (after canon changes):

```bash
node tools/design-seed/render.mjs
```

The script uses Playwright + Chromium to:
- Render `tools/design-seed/source-pdf-canon.html` → `01-brand-canon.pdf`
- Render `tools/design-seed/source-pdf-typography.html` → `02-typography-specimen.pdf`
- Render `tools/design-seed/source-pdf-palette.html` → `03-color-palette.pdf`
- Screenshot `variants/variant-a-editorial-split.html` (canonical from production) + five isolated single-pattern surfaces from `tools/design-seed/surface-*.html` (all active palette) → `04-rendered-surfaces/*.png` at 2× device pixel ratio
- Render two asset HTMLs → `06-individual-assets/*.png` at 2× device pixel ratio

When canon changes:
1. Update the source HTML in `tools/design-seed/`.
2. Re-run `node tools/design-seed/render.mjs`.
3. Diff the regenerated outputs and commit.
4. Re-upload the kit to Claude Design.

---

## What's deliberately *not* in this kit

- The full canon docs (`AGENTS.md`, `AFFILIATE_BRAND_CANON.md`, `SESSION_STATE.md`). These live in the repo and are referenced from `05-canonical-references.md`. Including them here would dilute attention with prose where Claude Design wants visual signal.
- The 21 partner deliverables (D01–D34). Same reason — they're downstream of canon and risk getting treated as source. Referenced from the pointer doc instead.
- The mockups in `public/mockups/01-27` and the equivalents in `design-canon/07-mockups/`. They are **pre-editorial-palette** artifacts using `#020617`, `#0F172A`, `#1E293B`, `#10B981`, `#EF4444`, `#38BDF8`, `#F59E0B`, `#8B5CF6` — colors **retired and forbidden** in `AGENTS.md` and `AFFILIATE_BRAND_CANON.md` §6.5. Including them as visual signal would teach Claude Design the wrong palette. The five single-pattern surfaces in `04-rendered-surfaces/pattern-*.png` (authored from scratch against the active palette in `tools/design-seed/surface-*.html`) replace them. The mockup library remains in `public/mockups/` for historical exploration reference only — **do not point Claude Design at it**.

If Claude Design's onboarding stalls on something this kit doesn't carry, point it back at the live repo via `05-canonical-references.md`.

---

## Refresh cadence

Re-snap when:
- `AGENTS.md` palette or font tokens change.
- `AFFILIATE_BRAND_CANON.md` bumps a major version.
- A new layout pattern lands in `variants/` or `components/*.module.css`.
- A retired pattern needs to be added to the "do not revive" list.

This kit is **canon v1.1**. Bump the kit version in this README and in the canon's versioning row when re-snapping.

---

*— Seed kit v1, snapshot 2026-04-29.*
