# Leponeus — PNG drop-in folder

This folder holds the **iridescent render-quality PNGs** of the 8 mascot expressions. They are the "v1.1 illustrator pass" forecast in `brand/canon/mascot/README.md`, generated from AI image tools (ChatGPT image / Sora image / Midjourney) rather than hand-drawn.

## Why this folder exists

The flat SVGs in the parent folder (`leponeus-01-doctrine.svg`, etc.) are correct for small uses — badges, lockups, inline marks at ≤100px. At larger sizes they read as wireframes next to the hero render. This folder holds the same 8 expressions at hero-render fidelity, dropped in as PNG.

## How the swap works

`brand/synthesis.jsx` has a flag near the top of the mascot section:

```js
const USE_PNG_MASCOT = true;      // master toggle
const PNG_THRESHOLD  = 120;       // pixels — below this, always SVG
```

For any `<MascotLeponeus size={s} expression={k} />`:
- If `USE_PNG_MASCOT && s >= PNG_THRESHOLD` and a PNG exists at `./png/leponeus-{k}.png`, render the PNG.
- Otherwise render the flat SVG.

This means badges (size 70), small lockups (size 64), and the spot illustrations stay strict-canon-flat. The hero (size 300), the expression sheet (size 140), and any future onboarding hero use the iridescent PNG.

## Expected files

Drop these in this folder when generated:

```
leponeus-doctrine.png
leponeus-diagnosis.png
leponeus-sprint.png
leponeus-fall.png
leponeus-recovery.png
leponeus-rest.png
leponeus-verdict.png
leponeus-owner.png
```

Specs:
- 1024×1024 PNG, sRGB
- Soft gray-blue cloudwash background (NOT transparent — the cloud atmosphere is part of the style)
- One creature, centered, ~70% of frame

## How to generate them

See `prompts.md` in this folder. It contains the master style block + 8 per-pose prompts tuned for ChatGPT image / Sora image / DALL·E with the existing `aesdrmascot.png` as a style reference.

Budget: ~$0–20 (one month of ChatGPT Plus or one Midjourney basic plan), 1 evening of curation.

## Canon status

These PNGs are a **render layer** on top of the canonical SVGs. The SVGs remain the source of truth for geometry, brand strictness, and small-scale use. If a PNG and SVG disagree on pose, the SVG is right and the PNG should be regenerated.

When the full set is in place, bump `canon` to `v1.1` in `manifest.json` and update the changelog in the parent `README.md`.
