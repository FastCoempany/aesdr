---
name: aesdr-design-system
description: AESDR — "The Operating Manual." Cream + ink + crimson + reserved iris-shimmer accent. Editorial, anti-LinkedIn, character-led (Rowan + Michael), zero motivational vocabulary. Use for any AESDR funnel, deck, partner workshop, email, or affiliate surface.
---

# AESDR Design System

The brand's positioning is **operator over guru**. Every visual or copy decision must defer to that.

## Before you write a single line

1. **Read `README.md` in full.** Especially CONTENT FUNDAMENTALS — visual mistakes are recoverable; voice mistakes are brand-fatal.
2. **Decide who speaks.** Every surface is one of:
   - **Rowan** (verdict voice — Playfair Black Italic or Barlow Condensed UPPERCASE; ink on cream or white on crimson)
   - **Michael** (2am confession — Caveat 22–24 px, crimson on cream, **only place Caveat appears**)
   - **Operator chrome** (taxonomic — Space Mono 9–11 px, 0.30em tracking)
3. **Pick a layout pattern** from the 5 canonical surfaces in README before opening a blank canvas.

## Setup

Import `colors_and_type.css` once. It defines all design tokens (CSS custom properties) and loads the 5 brand fonts via Google Fonts. Never reach for a hex value not defined there.

```html
<link rel="stylesheet" href="colors_and_type.css">
```

## Hard rules — non-negotiable

- **Default surface is `--cream` (#FAF7F2).** Always. Never gradients, never textures, never grain.
- **The only accent color is `--crimson` (#8B1A1A).** No teal, no navy, no orange.
- **Iris gradient is RESERVED** — only for: AE/SDR role pills, primary CTAs, AESDR wordmark underline, terminal payoff lines, divider rules at section seams. Never a default surface, never a paragraph fill.
- **No emoji.** None. Specifically banned: 🚀 💪 🔥 and any other hype glyph. Unicode `·` is the only allowed repeating ornament.
- **No third-party icon libraries.** 8 canonical SVGs in `assets/icons/`, period. Never Heroicons, Feather, Lucide, FontAwesome, Phosphor, Material, Bootstrap, Tabler.
- **No third-party fonts beyond the 5.** Playfair Display, Source Serif 4, Barlow Condensed, Space Mono, Caveat. Don't introduce Inter, Roboto, JetBrains Mono, Lora, etc.
- **Sharp corners.** Default `border-radius: 0`. The only exceptions: 2px artboard hairline, 4px deck-stack card, 9px warning-circle (it's a circle), pill on role tokens.
- **One drop shadow.** `0 4px 32px rgba(0,0,0,.04)` on terminal/classified blocks only. No glow, no inner shadows, no multiple shadows.
- **Caveat font appears in exactly one place:** Michael's voice, crimson on cream. Nowhere else.
- **Retired palette is forbidden** in new work: `#020617`, `#0F172A`, `#1E293B`, `--theme #10B981`, `--coral #EF4444`, `--cobalt #38BDF8`, `--amber #F59E0B`, `--violet #8B5CF6`. They live only in legacy course HTML.

## Banned vocabulary — zero tolerance

Never use, even as placeholder copy:

> "crush it" · "game-changer" · "unlock potential" · "mindset" · "rise and grind" · "grindset" · "hustle culture" · "thought leader" · "lead with value" · "trusted advisor" · "synergy" · "leverage" *(as verb)* · "amazing" · "incredible" · "empower" · "rockstar" · "ninja"

If satire genuinely needs them, route through Michael's voice and quote them ironically — never use them straight.

## Voice cheat sheet

| Need | Voice | Recipe |
|---|---|---|
| Headline that lands a verdict | Rowan | `font: italic 900 var(--display-h1-size)/1.05 var(--display)` — ink on cream, or `--cream` on `--crimson` |
| Section title in operator register | Rowan caps | Barlow Condensed 800–900 UPPERCASE, 0.04em track |
| Pull quote on a deck card or in a margin | Michael | Caveat 22–26 px, `color: var(--crimson)`, `transform: rotate(-0.5deg)` |
| Eyebrow / file label / classified meta | Operator chrome | Space Mono 9–11 px, 0.30em track, UPPERCASE, `color: var(--muted)` |
| Body paragraph | Source Serif 4 | 17 / 1.65, `color: var(--ink)`; muted version for asides |
| Terminal line | Operator chrome | Space Mono 15 / 1.85, with crimson cursor block (`width:9px;height:16px;background:var(--crimson)`) |

## The 5 canonical layouts

Build on these. Combine them. Do not replace them.

1. **Editorial-split hero** — 2-column 50/50, crimson left + cream right, ghost numerals in each column at `opacity: 0.06`.
2. **Two voices** — side-by-side Rowan / Michael columns separated by an iris-rule with `— THE TWO BECOME ONE —` cap.
3. **Terminal block on cream** — `--paper` card, 1px hairline, 3 traffic-light dots, file label, mono lines with crimson cursor.
4. **Classified card** — dossier with rotated `Classified` stamp; answer text uses `filter: blur(6px)` until hovered.
5. **Deck-peel card** — stacked 3D paper cards with `4px` rounding, `rotateY(-155deg)` peel animation around left edge.

## When the user asks for…

- **A landing page / funnel surface** → use the editorial-split hero, follow with terminal + two-voices + deck-peel + pricing + classified-FAQ + dark footer. See `ui_kits/marketing/index.html` for a working reference.
- **A workshop deck for partners** → cream background, Playfair italic titles, Barlow Condensed eyebrows, ghost-numeral per slide. Use `deck_stage.js` starter component.
- **An email** → operator-chrome subject, Rowan headline, Source Serif 4 body, single ink/crimson CTA. No iris in email (it doesn't shimmer in clients).
- **A new icon** → first ask: do we actually need it? If yes, draw it flat in the same 1px-stroke or solid-fill register as the existing 8 in `--ink`, `--crimson`, or `--muted`. Run past brand owner.
- **A "fun" version / a more playful tone** → push back. The brand's edge IS sober humor. "Fun" without sober is LinkedIn. The exceptions are lessons 05/06 (`tHe SaLeS pLaYbOoK`) and Michael's specificity.
- **A marketing claim about results** → don't. Use field-tested honesty instead: "12 lessons. 5 tools. Lifetime access. 14-day refund." If you can't make a claim sober, don't make it.

## Animation budget

Restraint over delight. The only animations that exist:

- **Iris shimmer** — `8s linear infinite` on iris-filled elements. Hover speeds it to 4s.
- **Ghost pulse** — 4s ease-in-out, opacity 0.06 → 0.10 (dashboard bypass affordance only).
- **Type-on** — confessions ~38 ms/char; terminal ~18 ms/char; always with blinking crimson cursor.
- **Deck peel** — 600–800 ms eased rotateY around left edge.
- **Card-zoom on scroll** — long-form section only, scroll-driven.

No bounces. No spring overshoots. No fade-up-on-enter. Things appear full-strength.

## Self-check before shipping

1. **Thumbnail test.** Squint at the design at 1/8 size. Do you see cream + ink + a crimson element + (optionally) one iris line? If it could be any other SaaS landing page, restart.
2. **Voice test.** Could any sentence be lifted onto a LinkedIn carousel and pass unnoticed? If yes, **it's wrong** — rewrite in Rowan or Michael.
3. **Specificity test.** Are dollar amounts, week-counts, and named lies in the copy? Or is it abstract ("tough seasons")? Replace abstract with specific.
4. **Honesty test.** Does the surface name who shouldn't buy? Where the math breaks? What happens when the script runs out? If not, add it.
5. **Banned-word test.** Grep the copy for the banned list. Zero hits.

## Files in this system

- `README.md` — full doctrine (read this first)
- `colors_and_type.css` — tokens + fonts + semantic recipes
- `assets/asset-wordmark.svg` — primary lockup
- `assets/asset-ghost-numeral.svg` — `01` ghost numeral
- `assets/asset-iris-gradient.svg` — reference swatch (don't embed in product)
- `assets/icons/` — the 8 canonical SVGs
- `ui_kits/marketing/index.html` — full landing-page reference build
- `preview/*.html` — design-system cards (review pane)
