# D7 — Workshop Registration Page

**Deliverable:** Full copy + structural spec for the partner-specific workshop registration page. One per partner pilot. Hosted on `aesdr.com/[partner-slug]/workshop` (or equivalent), with hidden attribution fields.
**Audience:** Partner-borrowed audience landing for the first time. ~60 seconds to convince.
**Voice ratio:** 70 Rowan / 30 Michael. Pain-led headline (D8). Honest qualification block. Single iris CTA.
**Format:** Markdown source. Renders to a Next.js page (template); content blocks are partner-agnostic except where bracketed.
**Canon refs:** `AFFILIATE_BRAND_CANON.md` §3.3, §6.3, §6.5, §6.8, §6.9, §8.1, §8.3, §10.1.

---

## Page structure (top to bottom)

```
┌────────────────────────────────────────────────────────┐
│ MONO EYEBROW                                           │
│ [Editorial split hero — crimson left / cream right]    │
│ ┌────────────────────┬─────────────────────────────┐   │
│ │ Crimson left:      │ Cream right:                │   │
│ │ Warning box,       │ Pain-led headline (D8),     │   │
│ │ ghost numeral,     │ subtitle, primary iris CTA  │   │
│ │ partner co-mark    │ + outline secondary,        │   │
│ │                    │ corner brackets, ambient    │   │
│ │                    │ iris line                   │   │
│ └────────────────────┴─────────────────────────────┘   │
│                                                        │
│ THREE OUTCOMES (Rowan, mono-numbered)                  │
│ WHO THIS IS FOR / WHO THIS IS NOT FOR (two columns)    │
│ HOST STUB (instructor bio block)                       │
│ REGISTRATION FORM (2 fields)                           │
│ FAQ-LITE (4 Qs)                                        │
│ FOOTER (postal, disclosure, partner co-mark, year)     │
└────────────────────────────────────────────────────────┘
```

---

## Block 1 — Mono eyebrow (top of page)

> `AESDR · WORKSHOP · [PARTNER-SLUG]`

Type: `--mono` 10pt, `.25em` letter-spacing, uppercase, color `--muted`. Position: top-left. Pairs with partner co-mark top-right when co-branded.

---

## Block 2 — Editorial split hero

### Crimson left panel

**Eyebrow** (mono, white at .7 opacity):
> `AESDR · 12 LESSONS · WORKSHOP-FIRST`

**Warning box** (1px white border at .2 opacity):
> ⚠ **CONTENT WARNING**
> *This workshop names what's actually going wrong in your first year — your **pipeline**, your **manager 1:1s**, your **commission math**, your **Sunday nights**, and the **expectations nobody walked you through**.*

**Ghost numeral:** `01` in `--display` 900wt at 300px, opacity .06, bottom-right of crimson panel.

**Partner co-mark** (when co-branded, per canon §6.6): `AESDR × [partner]` lockup, top-center of crimson panel.

### Cream right panel

**Mono label:**
> `THE LIVE WORKSHOP · 60 MINUTES · ONE OFFER · NO RECORDING SOLD`

**Headline** (D8 title — placeholder; founder picks):
> *What good actually looks like in startup* ***SaaS***.

The single accent word (`SaaS` or whichever the title's accent word becomes) takes the iris text-clip treatment per `.heroAccent`. One accent word, never more.

**Subtitle** (`--serif` 18pt, line-height 1.7, `--muted`):
> *A live 60-minute workshop for first-1-to-2-year SDRs and AEs in startup SaaS. No motivation. No mindset slide. The five pressures every early-career rep gets, and the operating standard nobody handed you on day one.*

**Primary CTA** (iris button):
> `Save my seat →`

**Secondary CTA** (outline button):
> `View what we cover`

**Corner brackets** in all four corners of the cream panel at `rgba(0,0,0,0.06)`, 1px. **Ambient iris line** at the foot of the cream panel, 1px, opacity .15, 4s shimmer animation.

---

## Block 3 — Three outcomes

Mono eyebrow above the block:
> `WHAT YOU'LL LEAVE WITH`

Three numbered outcomes, mono labels (`--mono` 10pt, `.25em` letter-spacing, `--crimson`), Rowan-voice short paragraphs in `--cond` 18pt 700wt for the title and `--serif` 16pt for the descriptor.

> **01 / The performance OS.**
> *Activity, judgment, and manager communication, in the order they actually matter — not the order LinkedIn presents them.*
>
> **02 / The conversation before the conversation.**
> *What a coachable rep sounds like in their 1:1, and how to be one before your manager has to make the call without you in the room.*
>
> **03 / The math behind the month.**
> *Why your commission check is a verdict on the last 30 days, and how to read it before payroll does.*

---

## Block 4 — Who this is for / who this is not for

Two columns under a single mono eyebrow:
> `BEFORE YOU REGISTER`

### Left column — Who this is for

> **For first-1-to-2-year SDRs and AEs in startup SaaS.**
> - Reps in their first or second seat, learning what good looks like in real time.
> - Career-switchers in their first SaaS sales role.
> - SDRs aiming for the AE track, looking for the playbook before the title.
> - Managers buying for ramp acceleration on junior hires.

### Right column — Who this is not for

> **If any of these are you, the workshop probably isn't.**
> - You want motivation. We don't sell motivation; the internet has a surplus.
> - You want a LinkedIn-friendly badge or a certification. We don't issue either.
> - You've been in sales 10+ years and aren't open to a re-look at fundamentals. The first half of the workshop will bore you.
> - You want a sales course built around scripts, templates, or AI prompts. AESDR is structure, not scripts.

---

## Block 5 — Host stub

Mono eyebrow:
> `THE SESSION IS HOSTED BY`

Block:
> *(`--display` italic 700, ~28pt)* *[Host first name + last name].*
> *(`--serif` 16pt, `--muted`)* *[One-sentence intro — current role, years carrying or managing in startup SaaS, the one specific thing they're known for in this audience.]*
> *(`--mono` 10pt, `.25em`, `--muted`)* `AESDR · LEAD INSTRUCTOR`

If the partner is a co-host, the partner stub sits to the right of the host stub in the same format, with `[Partner name] · [Community/Program] · CO-HOST` as the mono line.

**Founder is not on this page** — per canon §12.1, the founder is invisible to audience by default.

---

## Block 6 — Registration form

Two fields. No others. Form rendered with `--light` border, cream background, `--cond` field labels.

| Field | Label | Type | Required |
|---|---|---|---|
| `email` | `Email` | email | Yes |
| `role` | `Your role` | select: `SDR`, `AE`, `Manager`, `Other` | Yes |

Hidden fields per canon §8.7: `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `partner_id`, `partner_type`, `cohort_id`.

Optional separate consent checkbox for SMS reminder (only present when partner pilot uses SMS):

> ☐ *Text me a reminder 3 hours before the workshop. Standard rates apply. Reply STOP to opt out. Sender: AESDR.*

This must be a **separate, unchecked-by-default** checkbox. Per canon §10.5, seller-specific consent — `Sender: AESDR` is required language.

**Submit button** (iris):
> `Save my seat →`

Below the button, in `--mono` 9pt, `--muted`:
> `By registering, you agree to receive workshop-related email from AESDR. Unsubscribe in any message.`

---

## Block 7 — FAQ-lite (4 questions)

Same redaction-card pattern as `.faq-item` in `variant-a-editorial-split.html`: blurred body, `[CLASSIFIED — HOVER TO PEEK]` mono overlay, "Classified" stamp at the foot rotated `-2deg`.

> **Q01 / Is the workshop free?**
> *Yes. The session is free; the program AESDR offers at the close is paid. You're under no obligation to enroll.*
>
> **Q02 / Will it be recorded?**
> *Yes — every registrant gets replay access for 48–72 hours. After that the replay closes. We do not sell the recording, and we do not run it as evergreen content.*
>
> **Q03 / Time commitment?**
> *60 minutes live, plus optional 10 minutes of Q&A. The replay is the same length.*
>
> **Q04 / What's the offer at the close?**
> *AESDR — a 12-lesson sales survival course. $249 SDR / $299 AE / $1,499 Team. Lifetime access. 14-day no-questions-asked refund. We tell you exactly what it is and what it isn't.*

---

## Block 8 — Footer

Per canon §10.1 (FTC) and §10.4 (CAN-SPAM):

```
─────────────────────────────────────────────────────────
AESDR — [postal address]
Workshop hosted by AESDR in partnership with [partner].
[Partner] receives a commission on enrollments through this page.
AESDR sets the curriculum, content, and pricing; [partner] vouches for fit.

© AESDR 2026 · Terms · Privacy · Refunds · About · Contact
─────────────────────────────────────────────────────────
```

Type: `--mono` 10pt, `.1em` letter-spacing, uppercase for nav links; `--serif` 13pt for the disclosure paragraph.

---

## Visual treatment notes

**Layout pattern:** Editorial split hero (canon §6.3, `.hero` from `variant-a-editorial-split.html`) → constrained-width content sections on cream → footer. 50/50 split on hero, 1fr stacked layout below.

**Palette:**
- Hero left: `--crimson` background, white type at varying opacities (.5 → .8 → 1).
- Hero right: `--cream` background, `--ink` headline, `--muted` body.
- Content sections: `--cream` background, `--ink` body, `--muted` secondary, `--crimson` accent (mono numerals on outcomes block; "Classified" stamps on FAQ).
- Borders / dividers: `--light`.
- **Iris:** allowed only on (a) the single accent word in the headline, (b) the primary CTA `Save my seat →`, (c) the ambient iris line at hero foot, (d) the deck-numeral-style number on outcomes (if rendered as numerals rather than mono labels).

**Type tokens:**
- Eyebrows: `--mono` 10pt, `.25em` letter-spacing, uppercase.
- Hero headline: `--display` italic 900wt, `clamp(36px, 5vw, 64px)`.
- Hero subtitle: `--serif` 18pt, line-height 1.7, `--muted`.
- Outcome titles: `--cond` 18pt 700wt, uppercase, `.03em` tracking.
- Outcome bodies: `--serif` 16pt, line-height 1.6.
- FAQ blur: `--serif` 15pt, line-height 1.7, `filter: blur(5px)`.
- Footer disclosure: `--serif` 13pt; nav links `--mono` 10pt.

**Iconography:** Seed only.
- Warning circle (`!` inside) on the warning box — 16×16, 1px white border at .4 opacity, mono `!` inside.
- Ghost numeral `01` behind crimson panel at opacity .06.
- Corner brackets (4×) on cream panel at opacity .06.
- Classified stamp on each FAQ at `-2deg`.
- Terminal-dot pattern not used on this page.

**Iris usage:** Per canon §6.4 — one accent word in headline, the primary CTA, the ambient line. Three iris instances total. No iris on outcomes block backgrounds, no iris on FAQ borders, no iris on footer.

**Deliberate departures from canon:** None.

**Five-question check (canon §6.9.1):**
1. **Thumbnail at 200×200:** Yes — crimson/cream split + display italic + iris accent word reads as AESDR even with the wordmark off.
2. **Token check:** All colors and fonts reference canon tokens.
3. **Iris reservation:** Three iris instances, all permitted.
4. **Icon discipline:** Only seed glyphs (warning circle, ghost numeral, corner brackets, classified stamp). No imported icons.
5. **Voice thumbnail:** First 20 words pass as identifiably AESDR — "What good actually looks like in startup SaaS / A live 60-minute workshop for first-1-to-2-year SDRs and AEs in startup SaaS."

---

## Open

- Title is placeholder pending founder pick from D8. Once picked, lock in `aesdr--template--workshop-registration--v1.html` and propagate to D6, D14, reminder emails (D10–D11), the deck, and replay page.
- Host name + bio sentence pending host casting (canon §17 open question 4).
- Calendar tooling — registration confirmation includes a calendar attachment per canon §7.4 + §7.7. Tooling pending.
- Partner co-mark image asset and exact placement vary per partner; lockup rules per canon §6.6 hold across all of them.
- Whether the page renders as a Next.js route (preferred — lets us reuse `LandingSequence.module.css` patterns) vs static HTML (faster but loses production tokens). Default: Next.js route.
- The mono eyebrow `WORKSHOP-FIRST · NO RECORDING SOLD` is a candidate canonical phrasing — if it survives one pilot, lift into D6 and the deck.
