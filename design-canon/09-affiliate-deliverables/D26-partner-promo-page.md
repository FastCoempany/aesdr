# D26 — Partner-Promo Landing Page

**Deliverable:** Per-partner co-branded landing page where Partner sends their audience during the promotion window. The "click here to register for the workshop" surface — the destination of every UTM-tagged link in `11-tracking-links.md` (D40 kit). Partner has no other AESDR-promoting page; this is it. One pilot, one page, one URL.
**Audience:** The partner's audience — cold to AESDR, warm to the partner. Most arrive having read 1–2 sentences from the partner ("AESDR is doing a workshop for early-career SaaS reps, link below"). The page does the rest of the work.
**Voice ratio:** 70 Rowan / 30 Michael per canon §3.3 (workshop registration page row, and §8.3 partner-promo page anatomy). Hero + outcomes in Rowan; the "who this is not for" block + the partner-quote slot lean Michael; partner-relationship disclosure in plain compliance register.
**Format:** HTML page rendered server-side at `aesdr.com/[PARTNER_SLUG]/workshop` (or equivalent). Crawlable for the partner-attribution window only — `noindex, nofollow` after `[PILOT_END_DATE]` per canon §1.1 (workshop-first, not evergreen).
**Canon refs:** `AFFILIATE_BRAND_CANON.md` §1.1 (workshop-first), §1.4 (borrowed trust), §3.3 (voice ratios), §6.3 (canonical layout patterns — editorial split hero), §6.4 (iris reservation), §6.6 (co-brand zone), §7.4 (attendee experience: 2-field reg form), §8.1 (registration page anatomy — full version), §8.3 (page anatomy — partner-promo page), §8.7 (UTM canon — hidden form fields), §10.1 (FTC), §10.5 (TCPA — separate SMS opt-in), §13 (honesty discipline).

> **Placeholder convention:** `[PARTNER_SLUG]`, `[PARTNER_NAME]`, `[PARTNER_AUDIENCE_DESCRIPTOR]` (e.g., "Apex BDR Club members," "Sales Bootcamp alumni"), `[PARTNER_QUOTE]`, `[PARTNER_QUOTE_ATTRIBUTION]`, `[WORKSHOP_TITLE]`, `[WORKSHOP_DATE]`, `[WORKSHOP_TIME_TZ]`, `[REPLAY_END_DATE_TIME_TZ]`, `[CODE_EXPIRY_DATE_TIME_TZ]`, `[PILOT_CODE]`, `[HOST_FIRST_NAME]`, `[HOST_LAST_NAME]` — filled per pilot. Partner-quote slot is optional and skipped if D27 didn't surface a usable quote.

---

## What's different about D26 vs D07

D07 (workshop registration page, batch 3) is AESDR's *canonical* registration page — what you build for a non-co-branded direct-traffic flow. D26 is the partner-co-branded variant that reuses D07's page hierarchy with three additions:

1. **Partner co-brand lockup** in the header band (canon §6.6).
2. **Partner-audience descriptor** in the hero serif body — *not* in the headline (per canon §8.3, headline stays AESDR-canonical).
3. **Partner-relationship disclosure** as its own block above the footer, lifting D23 Q11 verbatim (per canon §10.1 FTC material-connection rules).
4. **Optional partner-quote slot** in `--display` italic 36px, attributed to the partner operator.
5. **Hidden form fields** capturing `partner_id`, `partner_type`, `cohort_id` plus standard UTMs per canon §8.7.

Everything else lifts from D07 with verbatim content. **Pattern stability matters here.** When AESDR runs three pilots in parallel, three D26 pages live simultaneously — and they should be visibly the same page with three different lockups, not three differently-designed pages.

---

## Anatomy (top to bottom)

### 1. Header band

- **Layout:** Centered, 80px tall, `--cream` background.
- **Content:** AESDR × `[PARTNER_NAME]` co-brand lockup per canon §6.6 (`10a-lockup-horizontal.svg` from D40 kit). 32px height. No nav links, no "explore aesdr.com" rail — the page is the page.

### 2. Mono eyebrow

- **Layout:** Below the header, centered.
- **Content:** `--mono` 11pt 700, .15em, uppercase, `--muted`:
  > `AESDR · WORKSHOP · [PARTNER_SLUG]`

### 3. Editorial split hero (canon §6.3, §8.1)

The page's first visual beat. Lifts the editorial split layout from `variants/variant-a-editorial-split.html`.

#### 3a. Crimson left panel (40% width on desktop, full-width above on mobile)

- **Layout:** `--crimson` background, white type, ghost numeral `01` opacity .06 white in bottom-left corner.
- **Content:**
  - Eyebrow line, `--cond` 11pt 700, .15em, uppercase, white at .8 opacity:
    > `WARNING · NOT MOTIVATIONAL CONTENT`
  - Body, `--display` italic 700, 32pt, white:
    > *Most of what you've been told about how to do this job was written by someone who hasn't carried a bag in a decade.*
  - Below body, `--serif` italic 16pt, white at .85 opacity:
    > *AESDR is the operating manual we wished we'd been given. This workshop is the 60-minute version.*

#### 3b. Cream right panel (60% width on desktop, full-width below on mobile)

- **Layout:** `--cream` background, ink type.
- **Content:**
  - Workshop title, `--display` italic 700, 56pt, `--ink`:
    > *[WORKSHOP_TITLE]*
  - Partner-audience descriptor (the only place the partner audience is named, per canon §8.3), `--serif` italic 18pt, `--ink`:
    > *Built for early-career SaaS SDRs and AEs. This pilot session is open to [PARTNER_AUDIENCE_DESCRIPTOR].*
  - Date/time line, `--mono` 13pt, `--muted`:
    > `[WORKSHOP_DATE] · [WORKSHOP_TIME_TZ] · 60 min live + 72h replay`
  - Hosted-by line, `--cond` 13pt 700, .15em, uppercase, `--ink`:
    > `HOSTED BY [HOST_FIRST_NAME] [HOST_LAST_NAME]`
  - Primary iris CTA (canon §6.4 — single iris CTA on the page):
    > `Register for the workshop →`
  - Below CTA, `--mono` 9pt, `--muted`:
    > `free to register · 2-field form · no spam`
  - Outline secondary link (`--cond` 13pt, ink, underline-on-hover):
    > `or read about the program first →` (anchors to §5 below)

### 4. Three outcomes block (canon §8.1)

- **Layout:** Centered column, max-width 720px, padded 96px top, on `--cream`. White-panel-on-cream pattern with `--light` 1px border.
- **Header:** `--cond` 12pt 700, .15em, uppercase, `--muted`:
  > `WHAT YOU'LL LEAVE WITH`
- **Three numbered outcomes**, mono numbering on left margin, `--display` italic 24pt for the outcome line, `--serif` 16pt for the explanation:

> *(`01`)* ***A definition of "good" you can use Monday morning — not a feeling, an operating standard.***
> *Most reps in their first two years have never had this written down for them. We write it down.*
>
> *(`02`)* ***The three judgment moves that separate the rep who survives ramp from the rep who doesn't.***
> *We will name them, walk them, and give you a worksheet to apply them to your last five calls.*
>
> *(`03`)* ***One specific change you'll make in your next five calls.***
> *Not a mindset. A move. The workshop earns its 60 minutes here.*

### 5. Who-this-is-for / Who-this-is-not-for (canon §8.1, mandatory not-for column)

- **Layout:** Two-column on `--cream`, max-width 1080px, padded 96px top. White panels on cream with `--light` 1px borders, 32px internal padding each.
- **Left column header:** `--cond` 12pt 700, uppercase, `--ink`:
  > `WHO THIS IS FOR`
- **Left body, `--serif` 17pt:**
  > - First- or second-year SDRs who haven't been told what good actually looks like.
  > - SDRs aiming for the AE track who suspect "promotion in 12" was a placeholder.
  > - First-time AEs in startup SaaS who know activity but not judgment.
  > - Career-switchers in their first SaaS sales role.
  > - Managers who want their juniors to ramp on something other than vibes.
- **Right column header:** `--cond` 12pt 700, uppercase, `--muted`:
  > `WHO THIS IS NOT FOR`
- **Right body, `--serif` 17pt:**
  > - Sales veterans 8+ years in. The first five lessons of the program will bore you.
  > - Anyone looking for motivational content. The internet has a surplus.
  > - Anyone who wants a LinkedIn-friendly badge. We don't issue those.
  > - Anyone whose primary distribution is "rise and grind" energy. We're not the room.

Lifted verbatim from D09 slide 04. Pattern stability per canon §6.9.

### 6. Partner-quote slot (optional)

If D27 vetting surfaced a usable quote, it lands here. **Skip the entire block if no quote.** Do not invent quotes; do not pad with "5-star testimonials."

- **Layout:** Centered, max-width 760px, padded 96px top. Cream background.
- **Quote (canon §8.3):** `--display` italic 700, 36pt, `--ink`. Hung quotation marks (typographic, not asset).
  > *"[PARTNER_QUOTE]"*
- **Attribution, `--cond` 12pt 700, .15em, uppercase, `--muted`:**
  > `— [PARTNER_QUOTE_ATTRIBUTION] · [PARTNER_NAME]`

The quote must pass canon §10.2 approved-claims discipline. Per canon §16, partner quotes are pre-approved during D27.

### 7. Curriculum overview (4-of-12 library-catalog teaser, lift from D31)

- **Layout:** Centered column, max-width 1080px, padded 96px top. White panel on cream with `--light` 1px border, 48px internal padding.
- **Eyebrow:** `--mono` 11pt 700, .25em letter-spacing, uppercase, `--muted`:
  > `CARD CATALOG · SHELF 12 · DRAWER A · EST. 2026`
- **Header:** `--display` italic 700, 32pt, `--ink`:
  > *Twelve lessons. Real questions on each card.*
- **Body:** Four lesson cards in a 2×2 grid (not all 12). Each card carries: `--mono` 13pt call number; `--display` italic 700, 22pt title; `--display` italic 18pt question; `--hand` 22pt `--crimson` annotation rotated `-1deg`; `--mono` 11pt rectangular stamp with 1px `--ink` border. Lift these four lesson cards verbatim from D31 (per workshop-as-teaser doctrine, the partner page mirrors the workshop-deck slide 14 selection):

  - `658.85 / L08` — *The 30% Rule* — *"What's your actual close rate? Not the one you told your VP."* — *— do the math honestly.* `Mon 08`
  - `658.85 / L10` — *Breaking Down the Commission Myth* — *"Can you survive three bad months in a row? Mentally? Financially?"* — *— 3 months runway min.* `Wed 10`
  - `658.85 / L11` — *Sober Selling* — *"What if the problem is bigger than your process — what if it's what you're doing when no one's watching?"* — *— 21+. not metaphor.* `Thu 11`
  - `658.85 / L12` — *Leveling Up SaaS Relationships* — *"Who would vouch for you if you changed companies tomorrow?"* — *— name 5.* `Fri 12`

- **Below the 2×2 grid, centered, `--mono` 13pt, `--muted`:**
  > `4 OF 12 LESSONS SHOWN · 36 UNITS TOTAL · CHECK ONE OUT`
- **Below the catalog block, `--serif` italic 16pt, `--ink`:**
  > *The workshop is a free 60-minute teaser. The full catalog opens at enrollment.*

### 8. Registration form (canon §7.4 — 2 fields max + separate SMS consent)

- **Layout:** Centered, max-width 480px, padded 96px top, on `--cream`. White panel on cream with `--light` 1px border, 48px internal padding.
- **Header:** `--display` italic 700, 32pt, `--ink`:
  > *Register.*
- **Field 1:**
  - Label, `--cond` 11pt 700, uppercase, `--muted`: `EMAIL`
  - Input, `--serif` 16pt, `--cream`-on-`--ink`-bordered.
- **Field 2:**
  - Label, `--cond` 11pt 700, uppercase, `--muted`: `ROLE`
  - Radio group: SDR / AE / Manager / Other.
- **Separate SMS opt-in (canon §10.5 + §7.6):**
  - Below the form fields, separated by 32px and a `--light` 1px hairline.
  - Checkbox, default unchecked.
  - Label, `--serif` 14pt, `--ink`:
    > *Send me a 3-hour reminder via SMS on workshop day. Optional. AESDR-only; never shared. Reply STOP to opt out.*
  - Phone number field appears only if checkbox is checked.
- **Hidden fields (canon §8.7):** `partner_id`, `partner_type`, `cohort_id`, plus standard UTMs (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`). All passed through from URL. Partner cannot see them; they exist for attribution.
- **Submit button:** Iris CTA — *but only the iris button in §3 is the page's primary; this submit is the primary's pair.* Per canon §6.4, the form's submit button is the page's primary CTA in execution form, and the §3 hero CTA is its anchor.
  > `Register for the workshop →`
- **Below submit, `--serif` 13pt italic, `--muted`:**
  > *We'll email you a confirmation within 60 seconds. Calendar invite included. 14-day refund policy applies to the program itself, not the workshop (which is free).*

### 9. FAQ-lite (canon §8.1 — 4 questions max)

- **Layout:** Centered column, max-width 720px, padded 96px top. White panel on cream with `--light` 1px border.
- **Four questions** lifted verbatim from D23: Q01 refund, Q02 time commitment, Q03 format, Q04 replay.
- Each Q is `--display` italic 22pt; each A is `--serif` 16pt with `--display` italic 700 18pt for bold-anchor terms within answers (e.g., the three "what's included" pillars in Q03).

### 10. Partner-relationship disclosure (canon §10.1, lift from D23 Q11)

This is the surface §8.3 calls out specifically. **Required.** Cannot be moved to footer fine print.

- **Layout:** Centered column, max-width 720px, padded 96px top, on `--cream`. White panel on cream with `--light` 1px border, 32px internal padding.
- **Header:** `--cond` 12pt 700, .15em, uppercase, `--muted`:
  > `HOW THIS PARTNERSHIP WORKS`
- **Body, `--serif` 16pt, `--ink`** (lifted from D23 Q11):

> *AESDR runs pilot partnerships with a small number of community operators, bootcamp coaches, and creators whose audiences match the early-career SaaS-sales role we serve. You arrived through one of those partners' links, which means two things are true:*
>
> *— [PARTNER_NAME] receives a commission on enrollments through their link, per FTC disclosure rules. The commission does not change the price you pay or the program you receive.*
>
> *— The workshop you'll attend is the same workshop every other pilot audience attends. Same deck, same offer, same pricing for this pilot. The partner doesn't customize the content — they bring the audience; we bring the program.*
>
> *We disclose this because honest disclosure is the brand. If a partner promotes AESDR without disclosing the commission, we ask them to add the disclosure, and if they refuse, we end the pilot.*

### 11. Footer

- **Layout:** Full-width, `--cream` background, `--light` 1px top rule. Padded 48px top, 64px bottom.
- **Content (canon §8.4 footer pattern + §10.1 + §10.4):**

```
─────────────────────────────────────────────────────
AESDR · [postal address]
This page hosts the workshop registration for [WORKSHOP_TITLE] on [WORKSHOP_DATE].
Workshop hosted by AESDR in partnership with [PARTNER_NAME]. [PARTNER_NAME]
receives a commission on enrollments through this page. Pilot pricing
expires [CODE_EXPIRY_DATE_TIME_TZ].

Privacy · Refunds · Terms · Disclosures
© AESDR 2026
─────────────────────────────────────────────────────
```

Type: `--mono` 10pt for nav links and timestamp; `--serif` 13pt, `--muted` for the disclosure paragraph.

---

## Visual treatment notes

**Layout pattern:** Canon §8.3 partner-promo page anatomy + §8.1 registration page anatomy + §6.3 editorial-split hero (from `variants/variant-a-editorial-split.html`). The page is a co-branded extension of the canonical registration page — the discipline is *visible identity, invisible variation*. Three D26 pages running in parallel for three pilots should be recognizable as the same page with three different lockups.

**Palette:**
- Background: `--cream` throughout, except the §3a hero left panel which is `--crimson`.
- Type: `--ink` body, `--muted` for footer + mono labels, white for §3a hero left.
- Hero workshop title (§3b): `--display` italic 700, 56pt, `--ink`.
- Section headers (mono eyebrows on white-panel sections): `--cond` 12pt 700, .15em, uppercase, `--muted`.
- Iris button: per canon §6.4 — single primary CTA, anchored in §3b hero, executed in §8 form submit. Two button instances of the same CTA.
- Caveat layer (§7 cluster framing lines): `--hand` 22pt, `--crimson`. Three instances (one per cluster).
- Hairline rules: `--light` 1px between major sections.

**Type tokens:**
- Wordmark in lockup: `--display` italic 900, 28pt.
- Workshop title: `--display` italic 700, 56pt.
- Section/outcome headlines: `--display` italic 700, 24–36pt depending on hierarchy.
- Body: `--serif` 16–18pt.
- Mono labels (eyebrow, dates, footer disclosure links): `--mono` 9–13pt, `--muted` or `--ink`.
- Cond labels (section eyebrows, button text, form field labels): `--cond` 11–14pt, `.15em`, uppercase.
- CTA button: `--cond` 14pt 700, .15em, uppercase, white on iris.
- Caveat layer: `--hand` 22pt, `--crimson`.
- Partner-quote slot: `--display` italic 700, 36pt, `--ink`.

**Iconography:** None new. Per canon §6.5 + §6.8, no decorative icons. The lockup carries the only graphical mark; ghost numerals on the hero left panel and the outcome-block numbering are seed-inventory glyphs (canon §6.8). No play icons, no "scroll down" arrows, no checkmark icons in the form, no emoji.

**Iris usage:** Two CTA instances of the *same* primary CTA — anchored in hero §3b, executed in form §8. Both are the same button, the same destination, the same copy. Per canon §6.4, this is a single primary CTA repeated for scroll convenience, not two CTAs. No ambient iris on the page.

**Deliberate departures from canon:** None. The page lifts §8.3 partner-promo anatomy point-for-point; the partner-quote slot (§6 above) is optional per canon §8.3 ("optional pull-quote") and skipped when no quote is available.

**Five-question check (canon §6.9.1):**
1. **Thumbnail at 200×200:** Cream + crimson hero left + lockup + ghost numeral + display italic title + iris CTA = identifiably AESDR. Pass.
2. **Token check:** Pass — all colors and fonts via tokens.
3. **Iris reservation:** Pass — single CTA repeated.
4. **Icon discipline:** Pass — type-only.
5. **Voice thumbnail:** *"Most of what you've been told about how to do this job was written by someone who hasn't carried a bag in a decade. AESDR is the operating manual we wished we'd been given."* — passes; canonical Rowan opener (canon §3.1), identifiably AESDR.

---

## Compliance check (canon §10)

- **FTC material-connection disclosure (§10.1):** §10 partner-relationship disclosure block carries the verbatim canonical disclosure (lifted from D23 Q11). **Pass.**
- **CAN-SPAM (§10.4):** N/A on the page itself — registrant emails go through AESDR's transactional ESP after registration.
- **TCPA / SMS (§10.5):** §8 form has SMS opt-in as a separate checkbox, default unchecked, with explicit consent language. Phone field appears only when consented. **Pass.**
- **Approved claims (§10.2):** No outcome promises, no income claims. The closest claim is §4 outcome 02 ("the rep who survives ramp"), which is observational. **Pass.**
- **Forbidden claims (§10.3):** No "guaranteed promotion," no "earn $X." Partner quote (§6) is pre-approved during D27. **Pass.**

---

## Forward dependencies

This page depends on:
- **D07 workshop registration page** — D26 lifts D07's anatomy with co-brand additions. **Met.**
- **D09 workshop deck** — §5 who-this-is-for lifts from D09 slide 04. **Met.**
- **D23 partner-facing FAQ** — §9 + §10 lift Q01–Q04, Q11. **Met.**
- **D27 partner vetting scorecard** — partner-quote slot (§6) is pre-approved during D27. **Met.**
- **D28 pricing & promo sheet** — `[PILOT_CODE]` and pricing references inherit. **Met.**
- **D31 curriculum map** — §7 4-of-12 library-catalog teaser lifts D31's catalog cards (specifically L08, L10, L11, L12). **Met.**
- **D40 master partner-kit folder README** — D26 is referenced as "co-branded surface AESDR ships." **Met.**
- **Co-brand lockup assets** — operationally pending per partner.
- **Stripe + analytics + UTM-passing infrastructure** — operationally pending.

This page is a forward dependency for:
- **D14 no-show replay email + D15 free-vs-structured email + D18 deadline-window email** — all reference enrollment URLs that resolve here. **Met.**
- **D17 high-intent DM** — V3 + V4 + V5 + V6 reference checkout starts that originate on this page. **Met.**
- **D33 postmortem** — page-level conversion is a primary signal.
- **D38 (proposed) launch announcement** — references this page pattern as the canonical pilot landing surface.

---

## Open

- **Per-partner customization budget.** Default: lockup + audience descriptor + optional quote = the only differences. Partners may *not* edit the headline, the outcomes, the for/not-for blocks, the FAQ, or the disclosure. Partners may *propose* a quote during D27; AESDR pre-approves or declines per canon §16.
- **Editorial split mobile fallback.** Default: crimson left panel stacks above cream right panel on screens <768px. Workshop title remains 44pt minimum on mobile. Partner-audience descriptor and date line stay in cream right.
- **Whether to surface the workshop deck preview** (a 30-second teaser embed) above the form. Default: **no for v1.** The form is the page's lower-funnel anchor; an extra video above it dilutes the conversion path. Reconsider if pilot data shows the page converts well at the visit-to-register rate but poorly at register-to-attend.
- **Whether the partner-quote slot can hold multiple quotes** (e.g., 3 short quotes from 3 partner audience members). Default: **no for v1.** Multi-quote implies social-proof-stacking, which contradicts canon §13 (no fake "value stack"). Per canon §6.9, one earned quote outperforms three padded ones at thumbnail-test time.
- **Page-expiry behavior after `[PILOT_END_DATE]`.** Default: page redirects to `aesdr.com/enroll` (general program enrollment at list price). Partner-attribution links continue to resolve and pass attribution for the 30-day window per D22 §6.1, but the page itself stops accepting workshop registrations (the workshop already ran).
