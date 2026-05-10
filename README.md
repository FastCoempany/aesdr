# AESDR Design System

> **The Operating Manual. Not the motivation engine.**

A self-paced, character-led course for first-1-to-2-year SDRs and AEs at startup SaaS companies. 12 lessons. 5 takeaway tools. Lifetime access. **Anti-LinkedIn by design.**

This system is the canonical source of truth for every AESDR surface: the main funnel (landing → role-fork → checkout), partner workshop decks, email sequences, the **Untamed** Discord, and affiliate/partner-facing collateral.

---

## What is AESDR?

A 12-lesson program that costs **$249 (SDR)** / **$299 (AE)** / **$1,499 (Team, up to 10 seats)**, with a 14-day no-questions refund. The voice is character-driven, never founder-led, never motivational:

- **Rowan** — the verdict voice. Surgical, declarative, high-status. *"Your commission check is not income. It is a verdict on how you lived the last 30 days."*
- **Michael** — the 2am voice. Confessional, deadpan, specific. *"My manager said I have 'so much potential.' That was six months ago. I still have the same amount of potential. Like, exactly the same amount. It's just sitting there. Being potential."*

**Positioning** — operator over guru. Honesty is the differentiator: name who shouldn't buy, where the math breaks, what happens when the script runs out. If a piece of copy could be lifted onto a LinkedIn carousel without anyone noticing, **it is wrong.**

---

## Sources used to build this system

The system was reconstructed from three pieces of input. Store these references in case you have access:

- **Figma file** — `aesdr-brand-canon-v1.1.fig`, mounted as a virtual filesystem. 7 pages: `/Cover`, `/Tokens`, `/Typography`, `/Iconography`, `/Layout-Patterns` (5 canonical surfaces), `/Don-t-Use-retired-palette` (load-bearing), `/Components-library-page` (12 frames).
- **Codebase** — Next.js application at local mount `components/`. Notable files lifted from: `LandingSequence.tsx`, `DeckStack.tsx`, `Testimonials.tsx`, `RoleSwitcher.tsx`, `CheckoutButton.tsx`, `GhostButton.tsx`, `AesdrBrand.tsx`. **Note:** the codebase's `aesdr-tokens/globals.css` ships with the *retired* dark-navy palette — it is intentionally kept around so legacy lesson HTML still renders. Do not use it for new work.
- **Uploaded canon assets** — wordmark, iris-gradient swatch, classified stamp, corner bracket, cursor, terminal dots, warning circle, ghost-numeral.
- **Repo** — `FastCoempany/aesdr` (browse on demand; nothing is pre-imported here).

---

## Index — what's in this folder

```
/
├─ README.md                  ← you are here
├─ SKILL.md                   ← Agent Skill manifest (download to reuse)
├─ colors_and_type.css        ← all CSS variables, fonts, semantic recipes
│
├─ assets/
│  ├─ asset-wordmark.svg      ← AESDR. with iris underline + tagline
│  ├─ asset-ghost-numeral.svg ← 01 ghost numeral (full-bleed background motif)
│  ├─ asset-iris-gradient.svg ← reference swatch + stops, do not embed in product
│  └─ icons/                  ← the 8 canonical SVG icons (see ICONOGRAPHY)
│
├─ ui_kits/
│  └─ marketing/              ← the funnel: hero, pricing, FAQ, deck-peel, terminal,
│                               two-voices, role-fork, footer
│     ├─ index.html           ← interactive click-thru of the landing page
│     └─ *.jsx                ← per-surface components
│
└─ preview/                   ← design-system cards rendered into the project
                                review pane (don't edit by hand)
```

---

## CONTENT FUNDAMENTALS

### Voice — never blended, always character-led

There are **two voices** and one taxonomic chrome layer. Authorship matters more than topic; pick the speaker first, write second.

| Voice | When | Type recipe | Color |
|---|---|---|---|
| **Rowan** (verdict) | Headlines, section titles, CTAs, anything declarative | Playfair Display Black Italic, OR Barlow Condensed 800–900 uppercase | Ink on cream, or white on crimson |
| **Michael** (2am confession) | Pull quotes on deck cards, margin annotations, *only one Caveat moment per surface* | Caveat 22–24 px | Crimson on cream — the **only** place Caveat appears anywhere |
| **Operator chrome** | Eyebrows, file labels, terminal lines, classified stamps | Space Mono 9–11 px, 0.30em tracking, UPPERCASE | `--muted` or `--crimson` |

**Rowan example (production):**
> *Stop Surviving. Start Owning It.*
> This isn't corporate-y but it will advance your career. 12 interactive, field-tested sessions for AEs and SDRs who're serious about controlling chaos, managing toxic leadership, protecting your commission — and your future.

**Michael example (production):**
> *Last month I made $8,200. This month I made $2,100. I bought a $300 jacket during the $8,200 month. I'm now wearing the $300 jacket while eating ramen I bought with a coupon. Fashion.*

### Tone

- **Sober, fun, practical.** No guru, no hype, no hustle.
- **Specific over abstract.** "Three bad months in a row" not "tough seasons." "$8,200 → $2,100" not "feast or famine."
- **Honesty as differentiator.** Name who shouldn't buy. Tell the reader where the math breaks.
- **Lowercase whisper for asides.** Italic Source Serif 4 in `--muted`, often as a one-liner under a louder block: *"Keep scrolling. It has to get worse before it gets better."*

### Casing

- **UPPERCASE** for eyebrows, button labels, file paths, taxonomic chrome (`AESDR · 12 LESSONS · A BETTER YOU`). Always tracked at 0.30em.
- **Title Case** for deck/lesson titles in Barlow Condensed.
- **Sentence case** for body and Rowan's italic verdicts.
- **Two playful exceptions** in the curriculum: lessons 05 and 06 are titled `tHe SaLeS pLaYbOoK` and `bEyOnD tHe SaLeS pLaYbOoK` — alternating-cap is a deliberate joke about LinkedIn-coded sales content. Honor it; do not "fix" it.

### Pronoun + person

- **Second-person "you"** for the reader. Constant, unflinching. *You set your alarm for 6am on Sunday to "lock in" this week. It's Saturday again. You didn't lock in at all.*
- **First-person "I"** only inside Michael's voice — never anywhere else.
- **Never "we" as a hype collective.** "We" appears only in operator-mode statements: *"We train both."* / *"If it doesn't deliver value, we don't want your money."*

### Emoji

**No emoji on any AESDR-marked surface.** Specifically banned: 🚀 💪 🔥 and any other hype glyph. Unicode dots `·` are the only repeating glyph used as ornament — they sit between operator-chrome tokens (`AESDR · 12 LESSONS · A BETTER YOU`).

### Banned vocabulary (zero tolerance)

> "crush it" · "game-changer" · "unlock potential" · "mindset" · "rise and grind" · "grindset" · "hustle culture" · "thought leader" · "lead with value" · "trusted advisor" · "synergy" · "leverage" *(as verb)* · "amazing" · "incredible" · "empower" · "rockstar" · "ninja"

Never reach for these even as placeholder copy. If something *needs* to satirize them, route it through Michael's voice and quote them ironically — never use them straight.

---

## VISUAL FOUNDATIONS

### Color

The active palette is small on purpose. **Cream + ink + crimson + iris-shimmer = the AESDR thumbprint.** If an asset isn't recognizable as AESDR at thumbnail size, it's wrong.

| Token | Hex | Role |
|---|---|---|
| `--cream`   | `#FAF7F2` | Default page background. Always. |
| `--ink`     | `#1A1A1A` | Default body text |
| `--crimson` | `#8B1A1A` | The only accent. CTAs, hero left panel, emphasis, Michael's voice |
| `--muted`   | `#6B6B6B` | Secondary text, eyebrows, captions |
| `--light`   | `#E8E4DF` | Card hairlines, dividers |
| `--paper`   | `#FFFFFF` | Card surfaces (rare; cream first) |
| `--iris`    | gradient  | RESERVED shimmer accent only |

**Iris gradient** — `#FF006E → #FF6B00 → #F59E0B → #10B981 → #38BDF8 → #8B5CF6 → #FF006E`. Reserved for: AE/SDR role tokens, primary CTA fills, the AESDR wordmark underline, terminal payoff lines, divider rules at section seams. **Never a default surface.** Never a background fill for body content.

**Retired (do NOT use):** `#020617`, `#0F172A`, `#1E293B` (dark surfaces); `#10B981` `--theme`, `#EF4444` `--coral`, `#38BDF8` `--cobalt`, `#F59E0B` `--amber`, `#8B5CF6` `--violet` (legacy accents). They live in `aesdr-tokens/globals.css` for legacy course HTML only.

### Type

5 fonts, fixed roles, no substitutions:

- **Playfair Display** — display, headlines, big number drops. Black Italic is the verdict register.
- **Source Serif 4** — body voice, paragraphs. Italic for soft asides.
- **Barlow Condensed** — UI labels, eyebrows, buttons, deck card titles. 700–900 weights only.
- **Space Mono** — operator chrome: terminal blocks, classified labels, file paths, eyebrow stamps.
- **Caveat** — Michael's voice / margin annotations **only**. Single-purpose. Crimson on cream, no other use.

**Never introduce:** Inter, Roboto, JetBrains Mono, Open Sans, Lora, or any third-party font.

### Spacing & rhythm

- Section gutter: **64 px** desktop, **24 px** mobile.
- Editorial-split hero is two **720 × 900** panels (50/50). No off-balance compositions.
- Deck-peel cards are **600 × 380** with `4px` rounding — the *only* surface in the system that rounds.
- 100px outer artboard padding on the canonical pattern frames (the cream "page" floats on white in Figma; in production the cream goes edge-to-edge).

### Backgrounds

- Default surface: flat `--cream`. No gradients. No textures. No grain. No noise.
- Hero left panel: flat `--crimson`. Same — no gradient, no overlay.
- Iris is a **line**, not a fill, with one exception: primary CTA buttons (`.btn-iris`) take the gradient as their background. Always shimmering, never static.
- Ghost numerals (`01` at `opacity: 0.06–0.07`, Playfair Italic 320–340 px) sit *behind* hero copy on either crimson or cream. They're the only "decorative imagery" the brand uses.

### Hover states

- **Buttons** — 1px translateY(-1px) lift; iris CTA accelerates its shimmer (animation-duration 8s → 4s).
- **Outline buttons** — fill flips to `--ink` background with `--cream` text. No color shift, no opacity dip.
- **Classified cards** — hover de-blurs the answer text; the `[CLASSIFIED — HOVER TO PEEK]` overlay fades to 0.
- **Deck-peel cards** — 3D `rotateY` flip around the left edge to reveal the next card. Click/tap/→ to peel.
- **Links** — underline appears (was hidden); color stays `--ink` or `--crimson` — no opacity changes.

### Press states

- **Buttons** — `translateY(0)` (drops the hover lift). No scale-down. No color change.

### Borders & hairlines

- 1px solid `rgb(232, 228, 223)` (`--line-card`) for cards on cream.
- 1px solid `rgba(255, 255, 255, 0.25)` for boxes inside the crimson panel (warning box, etc.).
- 1px solid `rgba(139, 26, 26, 0.20)` for the rotated "Classified" stamp.
- Iris-line dividers: 2px tall, full-width or 60px short rule, `opacity: 0.5–1.0`.

### Shadows & elevation

The brand is editorial — almost no elevation. The **only** drop shadow allowed:

```css
/* Terminal block, classified card */
box-shadow: 0 4px 32px rgba(0, 0, 0, 0.04);
```

Cards otherwise float on a 2.4% black tint over cream (`--tint-card: rgba(0, 0, 0, 0.024)`) with a single 1px hairline. No multiple shadows. No glow. No inner shadows.

### Radii

Sharp corners are doctrine. The full set:
- `0` — everything by default
- `2px` — outer artboard hairline (a technical-drawing tic, used in the canonical Figma pattern frames)
- `4px` — deck-stack card *only* (paper card affordance — the `rounded-corner-rule` exception)
- `9px` — warning-circle icon (it's literally a circle)
- `9999px` — role pill (AE / SDR)

### Animation

Restraint over delight. Only these animations exist:

- **Iris shimmer** — `8s linear infinite` on iris-filled CTAs, wordmark underlines, divider rules. Never on text body, never on imagery.
- **Ghost pulse** — bypass-code "ghost" dot at `4s ease-in-out infinite`, opacity 0.06 → 0.10. Currently used only on the dashboard bypass affordance.
- **Type-on** — confession scenes type at `~38 ms/char`, terminal lines at `~18 ms/char`. Always with a blinking crimson cursor block.
- **Deck peel** — `rotateY(-155deg)` flip around the left edge with a slight `rotateZ(-4deg)` tilt; `translateX(-8%)`; eased 600–800 ms.
- **Card-zoom on scroll** — long-form section uses scale `1 → 2.5 → 1 → 0.4` with `0 → 1 → 0` opacity, driven by `scrollY`.

**No bounces. No spring overshoots. No fade-up-on-enter for cards. No entrance animations on sections.** Things appear as the page loads, full-strength.

### Transparency, blur, glass

- Blur is used **once**, on classified cards: the answer text takes `filter: blur(6px)` until hovered, then resolves cleanly (no transition trick). No frosted-glass surfaces. No backdrop-filter UI chrome.
- Body text never reduces opacity below 0.85 — readability over moodiness.

### Imagery

There is no photography in this brand. There are no illustrations. The *only* visual elements that ship to product:
1. The wordmark (`AESDR.` with iris underline)
2. Ghost numerals behind hero copy
3. The 8 canonical icons (see ICONOGRAPHY)
4. The iris gradient itself, as a 2px line or CTA fill

If a comp needs an image, the answer is: it doesn't.

### Layout fingerprint

The **editorial-split hero** (crimson left panel + cream right panel, 50/50) is *the* canonical hero pattern. Every other surface is built on:
1. **Editorial split hero** — the role-fork landing pattern
2. **Two voices** — side-by-side Rowan / Michael columns separated by an iris divider with `THE TWO BECOME ONE` cap
3. **Terminal block on cream** — fake-terminal card with crimson cursor; never on dark
4. **Classified card** — dossier-style FAQ with rotated `Classified` stamp and hover-to-peek redaction
5. **Deck-peel card** — stacked 3D paper cards, peel-to-reveal lessons

Treat these five as the design vocabulary, not optional examples.

---

## ICONOGRAPHY

**8 seed SVGs only.** Located in `assets/icons/`:

| File | Use |
|---|---|
| `icon-cursor.svg` | Crimson cursor block in terminal lines |
| `icon-terminal-dots.svg` | Three faux-traffic-lights at the top of terminal cards (red/amber/green at 0.5 opacity) |
| `icon-warning-circle.svg` | Outlined `!` glyph for content warnings; pairs with `Content Warning` Space Mono label |
| `icon-warning-circle-upload.svg` | Variant uploaded by canon (functionally same; kept for parity) |
| `icon-corner-bracket-tl.svg` | 1×1 corner-bracket hairline on artboards (top-left). Mirror in CSS for the other 3 corners. |
| `icon-classified-stamp.svg` | The "Classified" stamp graphic that rotates on FAQ cards |

Plus two brand assets in `assets/`:
- `asset-wordmark.svg` — full AESDR. lockup with iris underline and `THE OPERATING MANUAL` cap
- `asset-ghost-numeral.svg` — `01` ghost numeral, the only acceptable "decorative" element

**Never pull from** Heroicons, Feather, FontAwesome, Lucide, Material, Bootstrap, Phosphor, or Tabler. **Never substitute** an emoji for an icon. The system is intentionally graphic-poor — icons are taxonomic chrome, not decoration.

If a new icon is genuinely needed, it must be drawn in the same flat 1px-stroke or solid-fill register as the existing 8, in `--ink`, `--crimson`, or `--muted`. Run it past the brand owner; this is not a place for casual additions.

---

## How to use this system

1. **Read this file in full.** Especially CONTENT FUNDAMENTALS — visual mistakes are recoverable; voice mistakes are brand-fatal.
2. **Import `colors_and_type.css`** as the only CSS variables source. Never reach for a hex value not defined there.
3. **Pick a layout pattern** from the 5 canonical surfaces before opening a blank canvas. Combine them; don't replace them.
4. **Write the copy in character first.** Decide whether the surface is Rowan-led, Michael-led, or operator-chrome — then write.
5. **Sanity check at thumbnail size.** Cream + ink + a crimson element + (optionally) an iris line. If the thumbnail looks like any other SaaS landing page, restart.

---

## Caveats & flags

- **Fonts are loaded via Google Fonts CDN** in `colors_and_type.css`. If you have a license for self-hosted .woff2 versions of Playfair / Source Serif 4 / Barlow Condensed / Space Mono / Caveat, drop them in `fonts/` and swap the `@import` for `@font-face` declarations. **No font is currently substituted with a different family** — Google Fonts ships the exact five.
- **The codebase's `globals.css` is intentionally on the retired palette.** Don't refactor it without a full migration plan; legacy lesson HTML reads from those tokens.
- **The wordmark and ghost-numeral are reconstructed** from the Figma pseudocode (Playfair 180/320 black on cream). If higher-fidelity custom-drawn wordmarks exist, swap them in.
