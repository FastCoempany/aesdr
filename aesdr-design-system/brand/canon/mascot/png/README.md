# Leponeus — PNG (transparent cutouts)

This folder holds the **iridescent transparent-background PNGs** of the 8 mascot expressions. These are the single source of truth for the mascot at every render size — hero, expression sheet, badges, lockups, inline. They drop onto any surface (cream, crimson, dark) without fighting the surrounding design.

## Folder layout

```
png/
├── README.md                      ← this file
├── prompts.md                     ← AI generation prompts
├── leponeus-doctrine.png          ← TRANSPARENT cutout (used by synthesis.jsx)
├── leponeus-diagnosis.png
├── leponeus-sprint.png
├── leponeus-fall.png
├── leponeus-recovery.png
├── leponeus-rest.png
├── leponeus-verdict.png
├── leponeus-owner.png
└── source/                        ← original AI generations with cloud backdrop
    └── leponeus-{key}.png
```

The 8 files at the top level are what `brand/synthesis.jsx` loads. The `source/` folder preserves the original cloud-backdrop generations in case you need to re-cut, re-prompt, or use the atmospheric versions in marketing.

## How rendering works

`brand/synthesis.jsx` exposes one component:

```jsx
<MascotLeponeus size={300} expression="doctrine" />          // PNG
<MascotLeponeus size={70}  expression="recovery" />          // PNG
<MascotLeponeus size={300} expression="doctrine" forceSvg /> // flat 1-color SVG
```

By default, every render uses the transparent PNG. Pass `forceSvg` only for:
- Single-color reproduction (App Mark on dark BG, print plates, swag, embossing)
- Favicon ≤32px where the iridescent detail just becomes a smudge
- Anywhere the brand explicitly needs ink-only enforcement

If a PNG fails to load, the component automatically falls back to the flat SVG so the system never breaks.

## How to add or replace a pose

1. Generate a new PNG using the prompts in `prompts.md`. Save it to `png/source/leponeus-{key}.png`.
2. Run the cutout pipeline from the repo root:

   ```bash
   python3 -m pip install rembg onnxruntime  # one-time
   python3 brand/canon/mascot/png/cutout.py
   ```

   This reads everything in `source/`, removes the background using the `isnet-general-use` model with alpha matting, and writes the cutouts to the parent `png/` folder. Existing cutouts are overwritten.

3. Eyeball the result on a non-cream surface (composite over a checkerboard or a crimson swatch). Edge halos or stray cloud fragments mean re-running with different alpha-matting thresholds, or going back to the source and regenerating.

## Specs

- 1024×1024 PNG, sRGB, 32-bit (RGBA)
- Transparent background — alpha 0 outside the creature silhouette
- Source files (in `source/`) are 1024×1024 with cloud backdrop, 24-bit RGB

## Canon status

The transparent PNGs are the canonical mascot asset. The flat SVGs in `brand/canon/mascot/leponeus-*.svg` remain the canonical *geometry* for single-color reproduction (favicons, print plates, swag) but no longer drive the design system at normal scale.

If a PNG and SVG disagree on pose, the PNG is right (it's what people will actually see).
