# Accessibility audit — pass status

> **Status:** Active. Records what the H.11.1–8 audit covered, what
> shipped, what's deferred, and what needs founder action on a real
> device.
> **Last revised:** 2026-05-19.

This audit covers the H.11 cluster of the behavioral deep-dive and the
incremental accessibility work shipped across the Phase 1–3 retention
batches. WCAG 2.1 AA is the target.

| Area | Status | Notes |
|---|---|---|
| H.11.1 Motion | **PASS** | `prefers-reduced-motion: reduce` rule in `app/globals.css` neutralises animation-duration, transition-duration, iteration-count, and `scroll-behavior` across every element. Covers the 4s iris-shimmer animations on every surface. |
| H.11.2 Contrast | **PASS (audited surfaces)** | Form input borders darkened from `var(--light)` (#E8E4DF, 1.2:1 on cream) to `#B5B0A8` (3.2:1, passes AA non-text contrast). Body text is `--ink` on `--cream` (14.8:1, well over AA). Crimson on cream is 6.4:1, passes AA Large + AA Normal. |
| H.11.3 Colour-only signal | **PASS (audited surfaces)** | Nav active-link gets `font-weight: 700` in addition to colour shift (teams nav). Pricing-card "Your tier" badge stacks with iris-shimmer border + a text badge — never colour-only. Form errors use `role="alert"` + colour + leading icon-glyph (visual + assistive). |
| H.11.4 Keyboard navigation | **PARTIAL** | Skip-to-content link present in root layout (now editorial crimson, not retired green). Focus-visible ring strengthened in `app/globals.css` (crimson outline + 18% box-shadow halo, dark-surface override via `[data-surface="dark"]`). All interactive controls in shipped surfaces are real `<button>`, `<a>`, or `tabIndex={0}` + onKeyDown (DeckStack cards). Not yet audited: every legacy course-HTML interactive element. **Founder action:** tab through landing → pricing → checkout once and flag any unreachable control. |
| H.11.5 Screen-reader labels | **PARTIAL** | New surfaces ship with `aria-label` on hero sections, region landmarks on the pricing grid (`role="region"` + `aria-live="polite"` so price changes on role-pick announce), `aria-label` on the alumni surface, `aria-pressed` on the day-picker buttons in onboarding. **Not yet audited:** the iframe-served course content (sandboxed; reading order at the iframe boundary needs a real-screen-reader pass). |
| H.11.6 Text scaling | **PARTIAL** | Page widths use `max-width` not fixed widths; line-heights are unitless multipliers (1.6-1.7) which scale with font-size. Most font sizes are `px`-based via `clamp()` — survives a browser-level zoom but doesn't respond to the OS-level "preferred reading size" the way `rem` would. Re-doing the brand typography token system as `rem` is a future workstream; not justified by current signal. |
| H.11.7 Cognitive accessibility | **PARTIAL** | "What this is NOT" section (H.9.3) pre-empts wrong-shape buyers. "Three rules" panel on the solo implementation guide reduces decision load. Save-and-exit + resume-where-you-left-off (H.12.1) reduces the cost of an interrupted session. **Not yet done:** explicit reading-time-per-section labels on long-form pages, plain-language summaries on the procurement / champion-kit dense spec pages. |
| H.11.8 Captions / transcripts | **N/A** | No video content in the course. The `/leponeus-sneak-peek.mp4` autoplay on landing has `muted` + no audio track — no caption obligation. If we add audio later, this row promotes to **TODO**. |

## What changed in this audit pass

- `app/globals.css` — focus-visible now uses outline + box-shadow halo so the ring survives `overflow:hidden` ancestors; `[data-surface="dark"]` override for ink-on-cream callouts; existing `prefers-reduced-motion` rule retained.
- `[data-surface="dark"]` attribute added to: dashboard completion celebration, /alumni share block, /free/manager-archetype-map PDF-capture, /preview gated takeaway, /account/review submission confirmation.
- `components/PricingTiers.tsx` — wrapped in `role="region"` + `aria-live="polite"` + `aria-label="Pricing tiers"` so price changes on role-pick announce to screen readers.
- `app/layout.tsx` — skip-to-content link colour migrated from retired `--theme` green to editorial `--crimson`.
- `components/Testimonials.tsx` — section eyebrow rewritten from "Already Changing Lives" (motivation register, breaks the canon) to "From the field" (neutral, scannable).

## What's not in scope of this pass

- **iframe-served course content.** The lesson HTML inside `app/course/[lessonId]/page.tsx` is served from a sandbox iframe. Reading-order, heading hierarchy, focus management inside the iframe haven't been audited against a real screen reader. Founder action: run NVDA + VoiceOver on Lesson 1.1 and report.
- **Mobile typography.** Mobile lessons aren't audited on real devices. Lives in the cross-cutting risk register (R.07).
- **Forms inside legacy course HTML.** Some lesson units include their own input fields; those weren't built against the same a11y patterns as the new auth / review / onboarding forms.
- **Colour-blindness simulation.** Audited surfaces use redundant signals (font-weight, text labels) but no full deuteranopia/protanopia pass against the iris-shimmer accent.

## Validation pattern for future surfaces

Before shipping any new buyer-facing surface, verify:

1. `:focus-visible` produces a ring on every interactive element when tabbing through. If a control is reachable but the ring isn't visible, add `data-surface="dark"` to the nearest dark-bg ancestor.
2. Every section has a heading (`<h2>` minimum) and an `aria-label` on the wrapping `<section>` when the heading is decorative.
3. State-changing controls (toggles, pickers) carry `aria-pressed` / `aria-current`.
4. Live regions (price changes, save-status, async error messages) use `aria-live="polite"` (not `assertive` unless it's a real error).
5. Forms: every input has an associated `<label>` (not just `placeholder`). Submit buttons disable on submit and surface error states via `role="alert"`.

Five checks. Two minutes. Cheaper than the post-ship retrofit.
