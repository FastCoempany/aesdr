# D6 — Workshop CTA & Offer Copy

**Deliverable:** Two surfaces — the **offer slide** (closing slide of the live workshop deck) and the **handoff CTA copy** that bridges the slide to the existing pricing section. Together they're the moment the workshop becomes a sale.
**Audience:** Workshop attendees (live and replay) who just spent 50 minutes with AESDR. Trust is at peak; the offer either earns it or burns it.
**Voice ratio:** 80 Rowan / 20 Michael. One Michael line earns its place at the close. The rest is verdict-mode.
**Format:** Markdown source for both. Slide renders to deck (Keynote/Figma); handoff copy lives at the foot of the offer page (existing pricing block in `variants/variant-a-editorial-split.html`) and at the start of the same-day attendee email (D13, pending).
**Canon refs:** `AFFILIATE_BRAND_CANON.md` §3.3, §7.1 (single CTA rule), §7.3 (locked offer-slide), §8.6 (deck offer-slide anatomy), §13 (honesty discipline).

---

## A. The offer slide

The single closing slide of the workshop deck. Locked verbatim per canon §7.3 — host does not improvise this slide.

### Slide content (canonical)

```
[CRIMSON BACKGROUND. WHITE TYPE.]

┌──────────────────────────────────────────────────────┐
│ MONO EYEBROW (top):                                  │
│ AESDR · 12-LESSON COURSE · ENROLLMENT WINDOW         │
│                                                      │
│ DISPLAY ITALIC, ~64PT, WHITE:                        │
│ Twelve lessons. Five tools. Lifetime access.         │
│ Fourteen-day refund.                                 │
│                                                      │
│ SERIF ITALIC, 22PT, WHITE AT .75 OPACITY:            │
│ "We do not teach you to sell.                        │
│  We teach you to be the person who sells."           │
│                                                      │
│ THREE-COLUMN PRICING BAND:                           │
│ ┌─────────┬─────────┬─────────────────────┐          │
│ │ SDR     │ AE      │ Team (up to 10)     │          │
│ │ $249    │ $299    │ $1,499              │          │
│ │ once    │ once    │ once                │          │
│ └─────────┴─────────┴─────────────────────┘          │
│                                                      │
│ IRIS BUTTON:                                         │
│ Enroll now →                                         │
│                                                      │
│ MONO LINE BELOW BUTTON:                              │
│ AESDR.COM/[PARTNER-SLUG]/ENROLL · CODE: [PILOT-CODE] │
│ ENROLLMENT WINDOW CLOSES [DATE] · 14-DAY REFUND      │
│                                                      │
│ MICHAEL LINE (CAVEAT, BOTTOM-LEFT, ROTATED -2°):     │
│ "If you wanted motivation, the internet has a        │
│  surplus. This is the other thing."                  │
└──────────────────────────────────────────────────────┘
```

### Locked spoken script (host delivers this verbatim at slide reveal)

> *"That's the workshop.*
>
> *If what you saw maps to where you actually are — first one to two years in startup SaaS, looking for the operating standard nobody handed you on day one — AESDR is the 12-lesson program that picks up where this hour ended.*
>
> *Twelve lessons. Five tools. Lifetime access. A Discord called Untamed. Fourteen-day no-questions-asked refund. $249 for an SDR seat, $299 for an AE seat, $1,499 for a team license up to ten.*
>
> *The link is on the slide. The code closes [date]. After that, you can still enroll — without the code.*
>
> *Two more things before Q&A.*
>
> *One — who shouldn't enroll. If you came here for motivation, this isn't that. If you came here for a LinkedIn-friendly badge, we don't issue one. If you've been in sales ten-plus years and aren't open to a re-look at fundamentals, the first five lessons will bore you. The fourteen-day refund is real, but I'd rather you not buy it than ask for one.*
>
> *Two — if you have any questions about whether this fits where you actually are, ask them in Q&A in the next ten minutes. We'd rather lose a sale than land the wrong one.*
>
> *I'll stay on for the questions."*

### Why this slide is locked

- The pricing, refund, and code language are compliance-bearing (canon §10.2). Host paraphrasing them risks a forbidden-claim drift.
- The "who shouldn't enroll" block is honesty discipline (canon §13). Cutting it for time is the most predictable host mistake; locking it prevents it.
- The "we'd rather lose a sale than land the wrong one" line is the contract (canon §9.3). It survives every pilot, by canon.

---

## B. The handoff CTA copy

After the workshop ends, the attendee link from the slide lands them at `aesdr.com/[partner-slug]/enroll` — which in current production is the pricing section of `variants/variant-a-editorial-split.html`. The handoff copy is what they read between the slide and the price card.

### Hero block on the offer page

Replaces (or sits above) the existing `Pricing · One price. Lifetime access.` block when accessed via partner workshop link.

**Mono eyebrow:**
> `AESDR · POST-WORKSHOP ENROLLMENT · [PARTNER-SLUG] · CLOSES [DATE]`

**Display italic 900, ink:**
> *You stayed for the workshop.*
> *Here's what AESDR is, in plain English,*
> *before you decide.*

**Serif body, 18pt, muted:**
> *Twelve lessons, taught as interactive HTML — not video lectures, not motivation. Five takeaway tools, including the AE/SDR Alignment Contract and the 72-hour Strike Plan. Lifetime access, including future curriculum updates. Discord (Untamed) included. $249 SDR / $299 AE / $1,499 Team up to 10. One-time. 14-day no-questions-asked refund.*

**Three-tier price band** — lifts the existing `.price-grid` from `variants/variant-a-editorial-split.html` verbatim, with one modification: a `pilot code · CLOSES [DATE]` mono line above the SDR card.

**Below the price grid, an honest disqualification block:**

> **Mono eyebrow:** `BEFORE YOU CLICK BUY`
>
> *(`--serif` italic, 16pt, `--muted`)*
> *If any of these are you, we'd rather you didn't enroll.*
>
> - You wanted a motivation program. AESDR is the operating manual; the motivation engine is somewhere else.
> - You wanted certification or a LinkedIn-friendly credential. We don't issue either.
> - You're more than two years in and aren't open to revisiting fundamentals. The first five lessons will feel basic.
> - You wanted scripts and templates more than you wanted structure. We're structure.
>
> *(`--serif` italic, 16pt, `--ink`)*
> *The 14-day refund is real — but we'd rather you don't buy it than ask for one. If you have any doubt, email* `hello@aesdr.com` *and ask. The reply will be honest.*

**Below disqualification, a closing line — Michael's voice gets the final word:**

> *(`--hand` Caveat, 28pt, `--crimson`, slight rotation `-1deg`)*
> *"If you wanted generic sales hype, the internet has a surplus. If you wanted operating judgment, this is the room."*

### Footer disclosure (per canon §10.1, §8.3)

Below the close, in `--mono` 11pt, `--muted`:

```
This page is the AESDR enrollment view linked from the [partner] workshop on [date].
[Partner] receives a commission on enrollments through this page. AESDR sets the curriculum,
content, pricing, and refund policy. [Partner] vouches for fit.

— AESDR · [postal] · © 2026
```

---

## Visual treatment notes

### A — Offer slide (in deck)

**Layout pattern:** Crimson full-bleed slide per canon §8.6 — the "Offer slide" pattern. White type. Single iris CTA. Deadline in mono.
**Palette:**
- Background: `--crimson` (full-bleed).
- Type: white at varying opacities (.7 → .9 → 1) for hierarchy.
- Pricing band: cream cards (`--cream`) with `--ink` type, sitting on the crimson background.
- CTA: iris button per canon §6.4 — the one iris instance on this slide.
- Michael line: `--hand` (Caveat) in white, slight rotation.
**Type tokens:** `--mono` eyebrow at 12pt; `--display` italic 900 at clamp(40, 5vw, 64); `--serif` italic at 22pt for the canon quote; `--cond` 700 at 14pt for button; `--mono` 10pt for code/date line.
**Iconography:** None new. Optional ghost numeral `12` (representing the 12 lessons) at opacity .04 in the bottom-right of the slide.
**Iris usage:** One — the `Enroll now →` button. Per canon §6.4.
**Deliberate departures from canon:** None. This slide is the canonical instance of canon §8.6.

### B — Handoff CTA copy (offer page)

**Layout pattern:** Stacked content blocks on `--cream`. Reuses existing `.section`, `.sec-label`, `.sec-h2`, `.divider`, and `.price-grid` from `variant-a-editorial-split.html`.
**Palette:**
- Background `--cream` throughout.
- `--ink` body, `--muted` secondary.
- `--crimson` for accent words and the Caveat closing line.
- `--light` borders on price cards.
- **Iris** allowed on: the `Buy For Me` / `Buy For Us` buttons (existing canon, single iris CTA per card), the divider rule (`.divider` 60×2 iris bar), and one accent word in the headline if the founder approves.
**Type tokens:** Same as registration page (D7).
**Iconography:** Seed inventory only — `.divider` iris bar (existing), price-card check marks (`✓` in `--theme` per existing canon — *flagged* — see open item below).
**Iris usage:** Per canon §6.4. Currently the existing pricing section uses iris on the buttons. Compliant.
**Deliberate departures from canon:** **One flag** — the existing `variant-a-editorial-split.html` price list uses `color: var(--theme)` (the retired green) for `✓` marks. Per canon §6.5 + §6.8, theme is retired. **Recommended fix:** swap the price-list `✓` color to `--muted` or `--ink`. This is a one-line CSS change that brings the existing price grid into v1.1 compliance. Open item; not blocking the deliverable.

**Five-question check (canon §6.9.1):**
1. **Thumbnail at 200×200:** Slide is identifiable as AESDR (crimson + iris CTA + display italic). Page handoff also passes.
2. **Token check:** Pass, except for the legacy `✓` color flagged above.
3. **Iris reservation:** Pass.
4. **Icon discipline:** All seed; flagged `✓` color.
5. **Voice thumbnail:** "You stayed for the workshop. Here's what AESDR is, in plain English, before you decide." — passes.

---

## Open

- Pricing-list checkmark color contradicts canon v1.1 (legacy theme green). One-line fix in `variants/variant-a-editorial-split.html` and any production-equivalent CSS; not blocking but should be patched on next pricing-block touch.
- Pilot code naming convention — recommend `[PARTNER-SLUG]-PILOT` (e.g., `APEX-PILOT`). Founder confirms before first send.
- Whether the offer page is a partner-routed copy of the existing pricing section, or a separate `aesdr.com/[partner-slug]/enroll` route. Default: separate route, lifts the same `.price-grid` block, adds the partner eyebrow + disqualification block + Caveat closer.
- Whether the host's spoken close stays locked verbatim or is allowed to be paraphrased after pilot 3. Default: locked through first 3 pilots, then revisit.
- D13 (same-day attendee follow-up email) referenced; not yet produced. Will reuse the Caveat closing line and the disqualification block.
