# Leponeus — AESDR Canonical Mascot

> **Version** v1.0 · **Canon owner** Antaeus · **Repo** [github.com/FastCoempany/aesdr](https://github.com/FastCoempany/aesdr)

A tortoise body with strapped hare-ears. The two voices of AESDR fused into one figure: shell as pipeline, ears as ambition, strap as the doctrine that holds them together.

---

## What's in this folder

```
brand/canon/mascot/
├── leponeus-01-doctrine.svg     ← canonical pose (use this by default)
├── leponeus-02-diagnosis.svg
├── leponeus-03-sprint.svg
├── leponeus-04-fall.svg
├── leponeus-05-recovery.svg
├── leponeus-06-rest.svg
├── leponeus-07-verdict.svg
├── leponeus-08-owner.svg
├── leponeus.sprite.svg          ← all 8 in one <use>-able file
├── manifest.json                ← machine-readable canon
└── README.md                    ← this file
```

All SVGs share viewBox `0 0 300 240`, 1.6px non-scaling stroke, palette `#1A1A1A · #F1ECE3 · #8B1A1A · #FAF7F2`.

---

## How to use

### Web (preferred — sprite)

```html
<svg width="120" height="96" aria-label="Leponeus">
  <use href="/canon/mascot/leponeus.sprite.svg#leponeus-doctrine"/>
</svg>
```

The sprite ships all 8 expressions in one file. Reference by id: `leponeus-doctrine`, `leponeus-diagnosis`, `leponeus-sprint`, `leponeus-fall`, `leponeus-recovery`, `leponeus-rest`, `leponeus-verdict`, `leponeus-owner`.

### Web (standalone)

```html
<img src="/canon/mascot/leponeus-01-doctrine.svg" alt="Leponeus" width="120">
```

### Print

Use the standalone `.svg` files. Embed in InDesign as linked SVG, or convert to PDF with paths preserved (`vector-effect="non-scaling-stroke"` is set so the stroke survives any scale).

### App / Social

Render the standalone SVG to PNG at @1× (128px), @2× (256px), @3× (384–1024px) on transparent background, sRGB. Use the `doctrine` pose unless context demands otherwise.

---

## Expression map

| # | Key | Name | Use |
|---|---|---|---|
| 01 | `doctrine` | The Doctrine | Default. Wordmark lockup, certificates, brand voice. |
| 02 | `diagnosis` | The Diagnosis | Lesson 01. Honest-look-in-the-mirror moments. |
| 03 | `sprint` | The Sprint | Bursts of velocity. Onboarding and momentum moments. |
| 04 | `fall` | The Fall | The dip. Burnout. Lesson 05. |
| 05 | `recovery` | The Recovery | Sprout from shell. Lesson 09. Bounce-back moments. |
| 06 | `rest` | The Rest | Eyes closed. Sundays only. Permission to stop. |
| 07 | `verdict` | The Verdict | Crimson tip on ear. Pricing, closing, Rowan moments. |
| 08 | `owner` | The Owner | A-mark on shell. Lesson 12. Final state. |

---

## The rules (don't break these)

1. **Eight expressions only.** A ninth requires a PR to this folder + an entry in the canon doc, signed off by Antaeus.
2. **No anthropomorphizing.** No waving. No thumbs up. No smiling. No speech bubbles.
3. **Single-hand only.** If/when a real illustrator redraws this, one human draws all 8 — never split across a studio.
4. **Scarcity.** Max one Leponeus per editorial spread. One per badge. One per onboarding screen.
5. **Palette is locked.** `#1A1A1A` ink, `#F1ECE3` shell, `#8B1A1A` strap, `#FAF7F2` cream. No additions, no tints, no shadows.
6. **Stroke is locked.** 1.6px round-cap round-join, `vector-effect: non-scaling-stroke`. Never variable-weight.
7. **No skewing, no warping, no perspective.** Leponeus is a single front-elevation figure. Always.
8. **Strap is the only crimson** in the canonical pose. Crimson elsewhere on the figure (cracked shell, ear-tip, sprout) is reserved for the expressions that already use it.

---

## Versioning

- **MAJOR** (`v2.0`) — breaks compatibility (e.g., new canonical pose). Triggers a re-export of every downstream asset.
- **MINOR** (`v1.1`) — additive (a 9th expression, a refined ear curve). Backward-compatible.
- **PATCH** (`v1.0.1`) — fixes (path simplification, alignment nudges). No visible change at intended sizes.

The canon is frozen at `v1.0` as of this commit. Every downstream export tags `canon-v1.0` until bumped.

---

## Where this came from

The mascot was designed alongside the AESDR Brand Visual System — see `brand/AESDR Brand Visual System.html` for the full diagnosis, the three competing directions (Marble Discipline, Neon Operator, Tortoise-Hare Doctrine), the synthesis decision, and the surrounding system (icons, badges, spots, UI marks, taxonomy, exports).

Leponeus is the spine. Everything else hangs from him.

---

## Roadmap (not yet committed)

- **v1.1** — refined illustrator pass. Single hand. Adds woodblock imperfection without changing geometry.
- **v1.2** — Lottie animation set: blink (doctrine), ear-twitch (sprint), shell-crack (fall), sprout (recovery).
- **v1.3** — print plates: 1-color, 2-color, 4-color separations for swag.

Open an issue in the repo when you want to bump.
