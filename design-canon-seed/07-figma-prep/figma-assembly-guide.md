# AESDR — Figma Library Assembly Guide

**Goal:** Stand up a Figma library that mirrors the brand canon, save it as a `.fig` file, drop it into Claude Design's "Upload a .fig file" slot.

**Time:** ~25 minutes of clicking the long way; **~10 minutes** if you take the `html.to.design` shortcut described in step 7-shortcut. After this, re-snaps are 5 minutes either way.

> **About Code Connect.** If you also want to wire this Figma library to the live React components in `components/` so Dev Mode shows real production code, see `code-connect-runbook.md`. The mapping files (`components/*.figma.ts`) and `figma.config.json` are already pre-authored in this repo — once the Figma library exists, Code Connect setup is ~5 min: paste each component's Figma URL into the existing `FIGMA_NODE_URL_TBD` placeholders, then `figma connect publish`.

**What you produce:** A single `.fig` file containing color styles, text styles, components for the seed iconography, and reference frames for the canonical layout patterns.

---

## Inputs (from this kit)

| File | Purpose |
|---|---|
| `design-canon-seed/07-figma-prep/figma-tokens.json` | All canon colors, fonts (incl. 13 composite typography tokens), sizes, letter-spacing, line-heights, opacity, spacing, radius, border-width as Tokens Studio JSON. Two-click import into Figma. |
| `tools/design-seed/figma-assets/icon-*.svg` | Five seed icons: warning circle, terminal dots (R/Y/G), classified stamp, corner bracket (top-left), cursor. |
| `tools/design-seed/figma-assets/asset-*.svg` | Three brand assets: wordmark on cream, iris gradient swatch, ghost numeral. |
| `design-canon-seed/01-brand-canon.pdf` | The 8-page brand book — use as visual reference while building the layout pattern frames. |
| `design-canon-seed/04-rendered-surfaces/*.png` | Six canonical surface PNGs — use as ghost backgrounds when laying out the pattern frames. |

---

## Step-by-step

### 0. Prerequisite

You need a **Figma account** (any tier — Free works) and the free **Tokens Studio for Figma** plugin. Install it from `Plugins → Browse plugins in Community → Tokens Studio for Figma → Save`.

### 1. Create a new Figma file

- Figma → Drafts → New design file.
- Rename to `AESDR — Brand Canon (v1.1)`.

### 2. Set up the page structure

Create these pages (left sidebar, right-click "Pages" panel):

```
✱ Cover
✱ 01 — Tokens
✱ 02 — Typography
✱ 03 — Iconography
✱ 04 — Layout Patterns
✱ 05 — Don't Use (retired palette)
✱ ⚙ Components (library page)
```

The `⚙ Components` page holds the actual component definitions; the other pages display them in context.

### 3. Import the tokens (two clicks)

- Open the file. `Plugins → Tokens Studio for Figma → Tokens Studio for Figma`.
- In Tokens Studio: `Settings → Tools → Load from File`.
- Select `design-canon-seed/07-figma-prep/figma-tokens.json` from this repo.
- Tokens Studio will load: 5 color tokens (cream, ink, crimson, muted, light) + iris gradient stops + terminal dot indicators + 5 font families + weights + sizes + line-heights + letter-spacing + 13 composite typography tokens + spacing + radius + border-widths + opacities + rotation values.
- Confirm the `AESDR` token set is checked (left rail of the plugin's Tokens panel). If it isn't, nothing will be exported.
- At the bottom-right of the plugin: open the `Styles & Variables ▾` dropdown → click **`Export styles & variables to Figma`**. This is what populates Figma's native Color Styles, Text Styles, and Variables panels. *(In v2.11.5 the blue `Apply to document` button next to the dropdown only applies tokens within the plugin — it doesn't push to Figma's native panels. The export action is the dropdown item, not the button.)*
- Verify in Figma's right-sidebar: **Styles** should now show `color/*`, `iris/gradientStop1–6`, `terminalDot/*`, and a Text Styles section with `wordmarkXL`, `displayHero`, `displayH2`, `displayH3`, `serifLarge`, `serifBody`, `condDisplay`, `condTitle`, `condButton`, `monoEyebrow`, `monoFootnote`, `monoTerminal`, `handMichael`. **Variables** should show the AESDR collection with non-color tokens (spacing, radius, border-width, opacity, rotation, plus raw font ingredients).
- **Free-tier note:** Tokens Studio Free does not create gradient color styles, so `gradient/iris` will not appear in Styles. Step 4 below is the manual workaround. Free-tier also requires the named fonts (Playfair Display, Source Serif 4, Barlow Condensed, Space Mono, Caveat) to be available to your Figma desktop app — text styles silently fail to create when a font is missing.

### 4. Manually create the iris gradient color style

Tokens Studio (free) doesn't directly create gradient color styles. Do this once by hand:

- Create a rectangle, any size.
- Open Fill panel → click the solid-color square → switch to Linear gradient.
- Set the angle to 90° (left → right).
- Add stops at the 7 canonical positions (delete the default 2 first):
  - 0%   → `#FF006E`
  - 17%  → `#FF6B00`
  - 34%  → `#F59E0B`
  - 51%  → `#10B981`
  - 68%  → `#38BDF8`
  - 85%  → `#8B5CF6`
  - 100% → `#FF006E`
- Click the four-dot icon next to "Fill" → Create style → name it `gradient/iris`.
- Done. Apply this style anywhere iris is permitted (per canon §6.4).

### 5. Drag the SVG assets in as components

For each file in `tools/design-seed/figma-assets/`:

- Drag the SVG file directly onto the Figma canvas (on the `⚙ Components` page).
- Select the imported group → right-click → `Create component` (or ⌥⌘K / Alt+Ctrl+K).
- Name it per this table:

| SVG file | Component name |
|---|---|
| `icon-warning-circle.svg` | `icon/warning-circle` |
| `icon-terminal-dots.svg` | `icon/terminal-dots` |
| `icon-classified-stamp.svg` | `icon/classified-stamp` |
| `icon-corner-bracket-tl.svg` | `icon/corner-bracket-tl` |
| `icon-cursor.svg` | `icon/cursor` |
| `asset-wordmark.svg` | `brand/wordmark` |
| `asset-iris-gradient.svg` | `brand/iris-gradient-swatch` |
| `asset-ghost-numeral.svg` | `brand/ghost-numeral-01` |

For corner brackets, duplicate `icon/corner-bracket-tl` three times and rotate `90°`, `180°`, `270°` to make `corner-bracket-tr`, `corner-bracket-br`, `corner-bracket-bl`.

### 6. Author the `wordmark` as live text (recommended)

The `asset-wordmark.svg` is a type reference, but Figma renders Playfair Display 900 italic better as a live text node:

- Create a text node on the `⚙ Components` page.
- Type `AESDR.` (period included).
- Set font: Playfair Display, Italic 900.
- Apply text style at the size you need (use the imported text style from Tokens Studio).
- For the iris-text variant: select the text → Fill → click the dot → switch to Linear gradient → use the same 7 stops as step 4.
- Right-click → Create component. Name it `brand/wordmark` (replace the SVG version from step 5).

### 7-shortcut. **Fast path** — batch-import the 5 patterns via `html.to.design` (saves ~15 min)

If you install the free **html.to.design** Figma plugin, you can skip step 7's manual frame-building entirely:

1. `Plugins → Browse plugins in Community → html.to.design → Save`.
2. Open the plugin on the `04 — Layout Patterns` page.
3. For each of the 5 surface HTMLs in `tools/design-seed/`:
   - `surface-warning-box.html` → produces the editorial-split-hero frame
   - `surface-two-voices.html` → produces the two-voices frame
   - `surface-terminal-block.html` → produces the terminal-block frame
   - `surface-classified-card.html` → produces the classified-card frame
   - `surface-deck-peel.html` → produces the deck-peel frame
4. Choose `Import from URL` (file path) or `Paste HTML` and feed the file contents in. The plugin renders the HTML to a Figma frame — fonts, colors, gradients, layout intact (all sourced from the same active-palette tokens we already authored).
5. Rename each imported frame to its canonical name: `pattern/editorial-split-hero`, `pattern/two-voices`, `pattern/terminal-block-on-cream`, `pattern/classified-card`, `pattern/deck-peel-card`.
6. Skip step 7 below entirely. Continue at step 8.

This works because the surface HTMLs were authored against the same canon tokens the rest of the Figma file uses — so the plugin's import already speaks the brand's language. The only manual cleanup typically needed is converting raster image-fills back to live shapes for the iris gradient (Figma's gradient editor is faster than HTML's).

### 7. Build the canonical layout pattern frames *(slow path — skip if you used 7-shortcut)*

On the `04 — Layout Patterns` page, create one frame per pattern. Use the corresponding PNG from `design-canon-seed/04-rendered-surfaces/` as a ghost reference (drop it in, set opacity to 30%, build over the top, then delete the reference).

| Frame name | Reference PNG | Components to use |
|---|---|---|
| `pattern/editorial-split-hero` | `pattern-editorial-split-hero.png` | `brand/wordmark`, `brand/ghost-numeral-01`, `icon/warning-circle`, `icon/corner-bracket-*` |
| `pattern/two-voices` | `pattern-two-voices.png` | `brand/iris-gradient-swatch` (as 2px ambient line) |
| `pattern/terminal-block-on-cream` | `pattern-terminal-block.png` | `icon/terminal-dots`, `icon/cursor` |
| `pattern/classified-card` | `pattern-classified-card.png` | `icon/classified-stamp` |
| `pattern/deck-peel-card` | `pattern-deck-peel.png` | `brand/iris-gradient-swatch` (as iris numeral fill on the "01") |

Each frame: cream background, 1440×900 unless the pattern needs more height. Use the imported color and text styles throughout — never hardcode hex.

### 8. Populate the `Cover` page

Single full-bleed cream frame. AESDR wordmark centered (use the `brand/wordmark` component). Tagline below in `--mono` 11pt: `THE OPERATING MANUAL · NOT THE MOTIVATION ENGINE`. Iris ambient line at the foot.

### 9. Populate the `05 — Don't Use` page

This page is the most counterintuitive — but it's load-bearing. It tells anyone (human or Claude Design) what's *not* allowed.

- Section 1 — Retired palette. Six swatches at the retired hex codes (`#020617`, `#0F172A`, `#1E293B`, `#10B981 --theme`, `#EF4444 --coral`, `#38BDF8 --cobalt`, `#F59E0B --amber`, `#8B5CF6 --violet`) each marked with a strikethrough and the label `RETIRED — DO NOT REVIVE`.
- Section 2 — Banned vocabulary. The list from `AFFILIATE_BRAND_CANON.md` §4.1 in mono.
- Section 3 — Forbidden fonts. JetBrains Mono / Inter / Roboto / Open Sans / Lora — listed with strikethrough.
- Section 4 — Banned icon libraries. Heroicons / Feather / FontAwesome / Lucide / Material / Bootstrap / Phosphor / Tabler — listed with strikethrough.

A human or system reading this Figma file will see these and know not to generate with them.

### 10. Publish as a team library *(optional, for ongoing use)*

If your Figma plan supports libraries (Professional / Organization / Enterprise):

- Right side panel → Assets → Library button.
- Toggle on the components and styles you want shared.
- Publish.

Skip if you're on Figma Free — the file works as a `.fig` upload regardless.

### 11. *(Optional, recommended)* Wire Code Connect

If you want Figma's Dev Mode to surface the real React components from `components/`, the mapping work is already pre-authored — see `code-connect-runbook.md`. Five minutes: fill in the 5 `FIGMA_NODE_URL_TBD` placeholders in the `*.figma.ts` files with the URLs from your new Figma components, then `figma connect publish`.

Skippable if you only need the Figma library for Claude Design — Code Connect is for the codebase ↔ Figma production bridge, not for Claude Design ingestion.

### 12. Save as `.fig` and feed Claude Design

- File menu → `Save local copy…`.
- Save as `aesdr-brand-canon-v1.1.fig` somewhere accessible.
- Open Claude Design's onboarding screen.
- "Upload a .fig file" slot → browse → select the file.
- Claude Design parses it locally in the browser (per the form: "Parsed locally in your browser — never uploaded").
- Claude Design now has the full design system as a Figma source.

### 13. Re-snap when canon changes

When `AGENTS.md` or `AFFILIATE_BRAND_CANON.md` updates:

1. Update `design-canon-seed/07-figma-prep/figma-tokens.json` to match.
2. In Figma, open the `AESDR — Brand Canon` file → Tokens Studio → Tools → Load from File → re-import the JSON → bottom-right `Styles & Variables ▾` → `Export styles & variables to Figma`. The styles and variables update in place.
3. If new icons or assets were added, re-export from `tools/design-seed/figma-assets/` and re-import as components.
4. File → `Save local copy…` again. Re-upload to Claude Design.
5. Bump the file name version (`v1.1` → `v1.2`).

---

## What this gives you

- **All canonical colors** as Figma color styles, named with the same `cream / ink / crimson / muted / light / iris/*` taxonomy as the codebase.
- **All canonical typography** as text styles, named the same way.
- **The seed iconography** as Figma components, ready to instance into any new design.
- **Five canonical layout patterns** as reference frames.
- **A `Don't Use` page** that documents retired tokens, banned vocabulary, and forbidden imports — protective against drift.
- **A single `.fig` file** that Claude Design parses to extract the design system.

## What this does not give you

- A Figma file produced from this CLI. The proprietary `.fig` format requires Figma to author. This guide is the bridge.
- Animation timing for the iris shimmer (4s linear infinite). Figma doesn't have CSS-equivalent animation in static export. Add it via Figma Motion plugin or Smart Animate frames if needed for prototypes.
- Component variants for the layout patterns. The first pass authors them as static frames. Add variants later if Claude Design needs alternate states.

---

*— Assembly guide v1, 2026-04-29. Source materials in `tools/design-seed/`.*
