# tools/rendered/ — Canonical Reference Renders

Visible AESDR-fingerprinted artifacts for surfaces specified in the 40-deliverable partner kit. These are the *canonical reference renders* — designers, developers, and partner-kit producers should match these. They are not production code (D24/D26 will eventually live in `app/` proper); they are the visible canon for what the surfaces should look like.

Built against `app/globals.css` token values + canon §6 visual system + per-deliverable visual treatment notes.

## What's in this directory

| File | Source spec | Purpose | Status |
|---|---|---|---|
| `01-aesdr-wordmark.svg` | canon §6.6 | AESDR canonical wordmark, partner-agnostic | Reference |
| `02-lockup-horizontal.svg` | D40 §1 file `10a` + canon §6.6 | AESDR × Partner horizontal lockup, partner placeholder | Reference (per-pilot render needed) |
| `03-lockup-stacked.svg` | D40 §1 file `10b` + canon §6.6 | AESDR × Partner stacked lockup, partner placeholder | Reference (per-pilot render needed) |
| `04-d09-workshop-deck.html` | D09 | 19-slide click-to-advance HTML deck | Reference |
| `05-d24-replay-page.html` | D24 | Replay page including expired-token render | Reference |
| `06-d26-partner-promo-page.html` | D26 | Per-partner co-branded registration page | Reference |
| `07-d10-calendar-invite-cover.svg` | D10 + canon §7.7 | 1280×720 calendar invite cover | Reference |
| `08-d38-launch-hero.html` | D38 Target 2 | Post-pilot launch homepage hero block | Reference |

## How to view them

- **HTML files:** open in any modern browser. Fonts load from Google Fonts.
- **SVG files:** open in a browser, or place in any markdown / HTML document. For raster export to PNG, render through a browser (right-click → save as image, or use a headless browser).

## What these files are NOT

- **Not production code.** Do not deploy `06-d26-partner-promo-page.html` to `aesdr.com/[partner_slug]/workshop`. The production version lives in `app/`, with proper Next.js routing, real Supabase form handling, real Stripe webhook integration, real UTM passing.
- **Not partner-specific.** The lockup SVGs use `[PARTNER MARK]` placeholder; per-partner renders are generated in the kit handoff workflow per D40 §1.
- **Not pixel-locked.** Type rendering varies across systems and font-loading; the spec is the discipline, the render is the reference.
- **Not host-specific.** D09 deck uses `[HOST_FIRST_NAME]` placeholders; production render replaces these once host casting completes.

## Canonical-reference discipline

Per canon §6.9 visual QA:

1. If the production rendering doesn't match this reference, the production rendering is wrong (most often).
2. If this reference would fail the canon §6.9.1 five-question check, the reference is wrong (less often, but possible — fix here, ripple to production).
3. If a designer or developer wants to deviate, that's a canon-revision conversation per D35, not a one-off exception.

## What's still missing (operationally pending)

These cannot be rendered from text alone — they require external production:

- Per-partner lockup PNG/SVG renders (need partner mark data)
- D09 deck as `.key` / `.pptx` (need a design tool export workflow)
- D10 calendar invite cover as 1280×720 PNG (browser screenshot of the SVG works)
- D30 lesson preview clip — actual video file (needs host casting + recording)
- Host headshot — N/A per canon §12.1 (no founder photo); host headshot policy decided post-casting
- Partner-promo page production code — Next.js route in `app/[partner_slug]/workshop/`

## When this directory updates

- When canon §6 visual tokens change (palette, fonts, lockup syntax).
- When a deliverable's visual-treatment block is materially edited.
- When a new visual surface gets added to the kit (post-canon-revision).
- When a five-question-check failure is identified in production and the reference render needs the correction first.

The directory does NOT update for per-partner renders. Per-partner renders live in `docs/partner/pilots/[partner-slug]/` and inherit from these references.
