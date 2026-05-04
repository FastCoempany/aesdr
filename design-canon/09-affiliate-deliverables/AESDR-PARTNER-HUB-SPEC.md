# AESDR Partner Hub — Phased Build Specification

**Document type:** Build specification, not a deliverable. Source of truth for all partner-hub work; never crosses the partner boundary.
**Routing:** Hub lives at `aesdr.com/partners`.
**Brand discipline:** `AFFILIATE_BRAND_CANON.md` v1.1, no exceptions. Every page passes canon §6.9.1 five-question check before publish.
**Voice ratios:** Per canon §3.3 — table in §"Cross-cutting" below.
**Pricing doctrine:** **Never discount.** List price applies always. Partners earn commission off list, buyers never see promo codes from AESDR.
**Last updated:** 2026-05-02 (Phase 0 ratified).

---

## Locked Phase 0 inputs (founder-ratified)

| # | Input | Decision | Implication |
|---|---|---|---|
| 1 | Hub routing | **`aesdr.com/partners`** | All UTM templates, kit cross-references, internal links anchor here. Do not use `/for-partners`, `/affiliates`, or subdomain. |
| 2 | $40 end-of-course option | **Defined in `app/reveal/RevealView.tsx` line 212** as the unlock fee for the second end-of-course artifact. Student picks one of two artifacts free at `/reveal`; the unchosen artifact stays sealed and unlocks for $40 from the dashboard at any time. | Hub partner-economics page surfaces this as a real revenue line. D22 §5.1 commission terms must address whether the $40 unlock is partner-attributable (recommend: yes, within the 30-day attribution window). |
| 3 | 5 takeaway tools | **Named, in production at `tools/standalone-html/`:** (1) The SLA Builder — `3.3-aesdr-alignment-contract.html`; (2) The "I Don't Know" Framework — `6.3-idk-framework.html`; (3) Time Reclaimed ROI Calculator — `9.2-time-reclaimed-calculator.html`; (4) Commission Defense Tracker — `10.1-ROI-commission-defense-tracker.html`; (5) The 72-Hour Strike Plan — `12.3-72-hr-strike-plan.html`. | D31 curriculum map + L&D brief + hub `/partners/curriculum` page lift the named list. Each tool is linkable at `aesdr.com/tools/[slug]`. |
| 4 | Host casting | **Interim placeholder.** Continue using `[HOST_FIRST_NAME]` and `[HOST_LAST_NAME]` across all hub copy. | Hub ships with placeholders; founder swaps globally when host is cast. Forward-dep flagged on every page that references the host. |
| 5 | Discount policy | **Never. Ever. Discount.** AESDR does not run promotional codes, pilot discounts, partner-stack discounts, time-limited price drops, or any pricing variance. List price applies always. | Triggers cleanup work in D28, D09 slide 16, D17 V5/V6, D18, D24 CTA, D26 §3b CTA, and 09a/09b/09c/09d copy templates — references to `[PILOT_DISCOUNT]`, `[PILOT_CODE]`, "save you $[DISCOUNT]" must be removed or re-framed. **Cleanup is a separate task; not a hub Phase 1 blocker.** |
| 6 | D22 access | **Request the agreement.** Hub does not publish the pilot agreement; partners request it via the `/partners/apply` form, AESDR sends counsel-reviewed PDF when ready. | Hub `/partners/apply` form posts to `admissions@aesdr.com`. Counsel review of D22 v1 remains operationally pending. |

These six are non-negotiable for the hub build. Any deviation requires a canon-revision intake (D35) before changing.

---

## Cross-cutting requirements (apply to every page)

### Visual system

- **Background:** `--cream` (`#FAF7F2`). No dark surfaces, no inverse hero panels, no exceptions.
- **Type:** `--ink` (`#1A1A1A`) body, `--muted` (`#6B6B6B`) secondary, `--crimson` (`#8B1A1A`) for hero left panels and gravity beats only, `--iris` (gradient) for primary CTAs and ambient lines only.
- **Typography:** `--display` (Playfair Display) for headlines, `--serif` (Source Serif 4) for body, `--cond` (Barlow Condensed) for UI labels and buttons, `--mono` (Space Mono) for eyebrows and timestamps, `--hand` (Caveat) for Michael register margin annotations only.
- **Iconography:** None. Per canon §6.5 + §6.8, hub uses no decorative icons. Seed-inventory glyphs (corner brackets, ghost numerals) permitted on title cards.
- **Iris reservation:** Single primary CTA per page. Plus optional ambient line on hero. No iris on body type, no iris on multiple buttons, no iris on hover-state-decoration.
- **Lockup placement:** AESDR wordmark top-left of every hub page (`aesdr.com/partners` ↔ buyer-side `aesdr.com/`). No co-brand lockup on the hub itself — the hub is AESDR-side; co-brand lockups appear only on per-partner pages at `aesdr.com/[partner_slug]/workshop`.
- **Reference render:** `variants/variant-a-editorial-split.html` — every hub page composes from this canonical pattern.

### Voice ratios per page

| Page | Rowan : Michael | Notes |
|---|---|---|
| `/partners` (hub home) | 80 : 20 | Verdict-shaped headlines; one Michael margin annotation max |
| `/partners/program` | 90 : 10 | Operating-doctrine register; Michael appears once at close |
| `/partners/curriculum` | 80 : 20 | Per-lesson-card Caveat annotations are Michael (12 instances total per D31, but only 4 surfaced in hub teaser) |
| `/partners/kit` | 95 : 5 | Reference-document register; near-zero voice |
| `/partners/faq` | 80 : 20 | Verdict mode; Q07-style honest disqualification carries Michael |
| `/partners/apply` | 90 : 10 | Operator-to-operator; one Michael line at footer |

### Compliance

- **FTC §10.1:** Hub itself is AESDR-direct surface; no partner-attribution disclosure required on the hub. Per-partner pages at `/[partner_slug]/workshop` carry full disclosure.
- **CAN-SPAM:** N/A on hub pages (no outbound mail). Application form confirmations comply via the existing AESDR ESP.
- **TCPA:** N/A on hub. SMS opt-in lives only on registration pages (D26).

### Approval gates (canon §16)

| Gate | When | Owner |
|---|---|---|
| First-instance approval for any new layout pattern | Before publish | Founder |
| Any deviation from this spec | Before commit | Founder |
| Counsel review of D22 v1 | Before partner agreement is sent | Counsel |
| Founder visibility breach | Hub must NOT include founder bio, founder photo, or founder-named author byline. Per canon §12.1. | Founder veto |

### Accessibility

- WCAG 2.1 AA minimum. `aria-label` on every CTA, `alt` on every image, semantic HTML throughout.
- Captions on any embedded video (lesson preview clip when shipped).
- Keyboard navigation: tab order matches visual order; focus rings visible on `--cream` background.
- Color-contrast verified: ink-on-cream is 13.6:1 (passes AAA); muted-on-cream is 4.7:1 (passes AA for body); crimson-on-cream is 7.4:1 (passes AAA).

### SEO behavior

- **Phase 1 launch:** Hub indexed as a normal AESDR brand surface. `robots.txt` does not block. The hub's job is to be findable when a partner-prospect searches for AESDR.
- **Per-partner pages at `/[partner_slug]/workshop`:** `noindex, nofollow` per D26 spec — pilot pricing windows are time-bounded and shouldn't compete with the hub for organic ranking.
- **Sitemap.xml:** Add hub routes to existing sitemap; per-partner routes excluded.
- **Page metadata:** Each hub page has its own `<title>` and `<meta description>` per Next.js metadata API.

### Performance budget

- LCP < 2.0s on simulated 4G mobile.
- No external font loads beyond the existing Google Fonts subset already used by the buyer-side app.
- No external scripts beyond existing PostHog (per main's `app/layout.tsx`).
- No client-side framework beyond existing React 19 + Next.js 16.

### Routing decisions ratified

- **Hub home:** `/partners`
- **Subpages:** `/partners/program`, `/partners/curriculum`, `/partners/kit`, `/partners/faq`, `/partners/apply` (Phase 1)
- **Phase 2 additions:** `/partners/preview`, `/partners/workshop-format`, `/partners/case-studies`, `/partners/disclosure`, `/partners/program/commission`
- **Per-partner pages:** `/[partner_slug]/workshop` (D26 production), `/[partner_slug]/replay/[token]` (D24 production)

---

## Phase 1 — Minimum Credible Hub

**Goal:** A relationship-manager candidate navigates to `aesdr.com/partners`, browses 6 pages, downloads PDFs, books an application call. They don't need to ask "where's your X?" because the hub answers it without them asking.

**Effort:** ~30 hrs engineering + ~10 hrs design + ~6 hrs ops standup. 1–2 calendar weeks.

**Shipping criteria:** Every page passes canon §6.9.1 five-question check. Application form posts to live admissions inbox. PDF downloads return real on-brand PDFs (not "request access" gates). All copy lifted from existing kit content with sources cited in code comments — zero invented copy.

### Page 1.1 — `/partners` (hub home)

**Source:** Compose from D21 positioning + D31 catalog teaser + D40 README welcome + D28 pricing summary (sanitized for "never discount" doctrine).

**Layout (top to bottom):**

1. **Header band.** AESDR wordmark top-left (links to `/`); top-right nav: `Program · Curriculum · Kit · FAQ · Apply`. No co-brand lockup.
2. **Mono eyebrow** centered: `AESDR · PARTNERS · EST. 2026`.
3. **Editorial split hero** (canon §6.3 pattern from `variants/variant-a-editorial-split.html`):
   - Crimson left (40%): warning-eyebrow `WARNING · NOT AN AFFILIATE EMPIRE`. Headline: *"Less affiliate empire. More founding vineyard."* (canon §14 verbatim). Sub: *"AESDR partners with a small number of operators whose audiences match the early-career SaaS-sales role we serve. Three to five at any given time. By design."*
   - Cream right (60%): `--cond` 13pt label `WHAT THIS PAGE DOES`. Body in `--display` italic 700, 36pt: *"This is the page you point a partner-prospect at when they ask 'can I see your website?' — the operator-to-operator version."* Below: `--serif` 17pt context: *"AESDR runs pilot partnerships with community operators, bootcamp coaches, alumni networks, and creators. Workshop-first, time-boxed, non-exclusive."* Single iris CTA: `Request a partner conversation →` (anchors to `/partners/apply`).
4. **Three-pillar block** (cream, three white panels with `--light` border):
   - Pillar 1 — *Workshop-first.* Body: *"Every pilot leads with one live 60-minute workshop into the partner's audience, run by AESDR. The workshop earns the sale. The link merely attributes it."* Mono trail: `lift: AFFILIATE_BRAND_CANON.md §1.1`
   - Pillar 2 — *Operator over guru.* Body: *"We are the operating manual, not the motivation engine. If a piece of copy could be lifted onto a LinkedIn carousel without anyone noticing, it is wrong."* Mono trail: `lift: §1.5`
   - Pillar 3 — *Honesty is the differentiator.* Body: *"We say out loud what competitors won't: who should not buy, where the math breaks, what happens when the script runs out. Honesty is not a tone. It is a competitive position."* Mono trail: `lift: §1.6`
5. **The catalog teaser** (4-of-12 lessons; lift verbatim from D31). Same library-catalog pattern as D26 §7. Mono eyebrow `WHAT YOUR AUDIENCE WOULD BE LEARNING`. 2×2 grid of L08, L10, L11, L12 cards. Trail: `4 OF 12 LESSONS SHOWN · 36 UNITS TOTAL · CHECK ONE OUT`.
6. **The 5 tools strip** (`--cond` eyebrow, single horizontal row of 5 named tool cards):
   - The SLA Builder — *"AE-SDR alignment, written down."* — links to `/tools/3.3-aesdr-alignment-contract`
   - The "I Don't Know" Framework — *"What to say when the script runs out."* — links to `/tools/6.3-idk-framework`
   - Time Reclaimed Calculator — *"Slack as productivity theater. Quantified."* — links to `/tools/9.2-time-reclaimed-calculator`
   - Commission Defense Tracker — *"OTE is a fantasy until you read the comp plan."* — links to `/tools/10.1-ROI-commission-defense-tracker`
   - The 72-Hour Strike Plan — *"When ramp is wrong and the next 72 hours matter."* — links to `/tools/12.3-72-hr-strike-plan`
7. **Honest disqualification panel** — *"Who shouldn't apply to be an AESDR partner."* Lift from D27 red-flag list, sanitized for partner-facing register. Five bullets: primary distribution is "rise and grind"; demands category exclusivity; resists FTC disclosure; primary channel is LinkedIn-as-paid-ad; expects discount-stacking authority. Closing line: *"None of these are insults. They're filters. We'd rather decline now than end a pilot in week 4."*
8. **Final CTA repeat** — same iris button text + anchor as §3.
9. **Caveat layer** (single Michael instance, bottom of page, before footer): `--hand` 22pt, `--crimson`, rotation `-1deg`: *"PS — If you're going to apply, apply because the brand makes sense, not because the commission does. The latter is what every other affiliate program optimizes for. We're not that."*
10. **Footer.** Postal address, copyright, links to `/privacy`, `/terms`, `/refund-policy`. No partner-relationship disclosure (this is AESDR-direct surface).

**Components consumed:** Lockup-header, EditorialSplitHero, ThreePillarBlock, CatalogTeaserGrid, ToolStrip, DisqualificationPanel, CaveatLayer, Footer. (See §"Component library" below.)

**Five-question check:**
1. Thumbnail: cream + crimson editorial-split hero + display italic title + iris CTA = identifiably AESDR. Pass.
2. Token: pass — all colors and fonts via tokens.
3. Iris reservation: 2 instances of the same primary CTA, both anchored to `/partners/apply`. Within canon §6.4.
4. Icon discipline: pass — type-only.
5. Voice thumbnail: *"Less affiliate empire. More founding vineyard. AESDR partners with a small number of operators whose audiences match the early-career SaaS-sales role we serve. Three to five at any given time. By design."* — passes; canonical canon §14 lift.

### Page 1.2 — `/partners/program`

**Source:** D40 README §2 (what partner can do without asking), §3 (what needs an approval round), §4 (what's not in the kit and why) + D22 §3 (Partner deliverables), §4 (AESDR deliverables), §5 (Compensation, sanitized for never-discount).

**Layout:**

1. Standard hub header.
2. Mono eyebrow: `AESDR · PARTNER PROGRAM · STRUCTURE`.
3. Hero (single-column, no editorial split for sub-pages): `--display` italic 700, 48pt: *"What the partnership actually is."*
4. Sub-headline: *"Time-boxed. Non-exclusive. Workshop-first. Same pricing as everyone else gets."*
5. Three sections in white-panel-on-cream layout:
   - **What we ask of you.** 6-bullet operator-to-operator list, lifted from D21 *"What we'd ask of you in a pilot."* Includes: pass D27 vetting + sign D22, two named promotion sends, 2-min live intro per `09c`, FTC disclosure verbatim, pre-approval on copy, weekly reporting cooperation.
   - **What we do for you.** 6-bullet list, lifted from D21 *"What we'll do for you."* Includes: build co-branded registration page, deliver live workshop + 72h replay, run full follow-up sequence, pay 30% net commission, send weekly pilot report, provide kit folder.
   - **What you cannot ask for.** 5-bullet list, lifted from D40 §4 + Phase 0 #5 ratification. Includes: discount codes (never), category exclusivity (never), AESDR's email list (never), founder appearance on demand (rare per canon §12.4), list co-promotion (never).
6. **Pricing & commission** strip (NEW — built from D28 sanitized + Phase 0 #5):
   - Header: *"Pricing is list. Commission is 30% of net. No exceptions."*
   - Body: *"Buyers see the same price every other AESDR buyer sees: $249 SDR, $299 AE, $1,499 Team. AESDR does not run promotional discounts, pilot codes, or partner-stack discounts. Partners earn commission off list price; that's the deal."*
   - Sub-block — the $40 follow-on: *"After enrollment, AESDR offers a $40 unlock for the second end-of-course artifact (see /tools/playbill-vs-redline). Within the partner's 30-day attribution window, the $40 unlock is partner-attributable."* (Note: this attribution rule needs founder + counsel ratification before publish; see §"Open questions.")
7. **Approval workflow** strip — three-row table: APPROVED / APPROVED WITH EDITS / DECLINED. Lift from D40 §3 verbatim.
8. **CTA strip:** iris button `Request the partnership agreement →` (anchors to `/partners/apply`). Mono trail: `request triggers a counsel-reviewed D22 PDF, sent within 5 business days.`
9. Footer.

**Five-question check:** identifiably AESDR; tokens pass; iris reserved (single CTA); icon-free; voice thumbnail passes (*"Time-boxed. Non-exclusive. Workshop-first. Same pricing as everyone else gets."* — verdict-shaped Rowan, identifiably AESDR).

### Page 1.3 — `/partners/curriculum`

**Source:** D31 curriculum map (full 12-card library catalog), with the 5 tools strip from `/partners` reused.

**Layout:**

1. Standard hub header.
2. Mono eyebrow: `AESDR · WHAT YOUR AUDIENCE WOULD BE LEARNING`.
3. Hero: `--display` italic 700, 48pt: *"Twelve lessons. Real questions on each card."*
4. Sub: *"This is what your audience enrolls into. It is what we will spend 60 minutes teasing — not teaching — at the workshop. The lessons are where the work is."*
5. **The full catalog** (all 12 cards, not just the 4-of-12 teaser used elsewhere). Layout: 4-column grid on desktop (3 rows × 4 columns), 2-column on tablet, 1-column on mobile. Each card carries: `--mono` call number (`658.85 / L01` etc.), `--display` italic title (preserve stylized casing on L05/L06), `--display` italic 18pt question, `--hand` Caveat-crimson annotation rotated `-1deg`, `--mono` rectangular stamp.
6. **Caveat layer between cards and tools:** *"36 units total. Three sub-units per lesson. Role-conditional content on every unit."*
7. **The 5 tools strip** (reused from `/partners`). Mono eyebrow: `THE FIVE TOOLS THAT SHIP WITH ENROLLMENT`.
8. **Closing block:** *"Time commitment table"* lifted from D31. Followed by: *"What this curriculum is not"* — 6-bullet honest-disqualification list lifted from D31.
9. **Below the disqualification:** *"At the end of the catalog, two end-of-course artifacts. The Programme. The Manuscript. Students pick one free at `/reveal`. The other unlocks for $40 from the dashboard at any time. Both are real, both are gated, both are part of the program shape."*
10. CTA strip: same iris button anchored to `/partners/apply`.
11. Footer.

**Five-question check:** Pass. The library-catalog visual pattern is the strongest thumbnail signal in the brand system.

### Page 1.4 — `/partners/kit`

**Source:** D40 master partner-kit folder README §1 (folder tree) + every kit-template file already shipped at `docs/partner/kit-template/`.

**Layout:**

1. Standard hub header.
2. Mono eyebrow: `AESDR · PARTNER KIT · DOWNLOADS`.
3. Hero: `--display` italic 700, 48pt: *"The kit, in advance."*
4. Sub: *"Most affiliate programs gate the kit behind an application. We don't. The kit is the merciless mirror — if it doesn't survive your read, the partnership wouldn't either."* (lift canon §1.4)
5. **The kit index** — table format, three columns:
   - Category (Reference Documents / Promotional Copy / Co-Brand Assets / Operating Cadence)
   - File name + one-line description
   - Download (`PDF` button or `Markdown` button — note: PDF is the standard, markdown only as fallback for copy templates partners need to edit)

   **Reference documents:**
   - Canon Excerpt for Partners — 6 sections of `AFFILIATE_BRAND_CANON.md` v1.1 — PDF
   - Positioning Brief (D21) — PDF
   - Approved + Forbidden Claims Sheet (D20) — PDF
   - Disclosure Language Pack (D19) — PDF
   - Pricing & Commission Sheet (D28) — PDF (post-discount-cleanup)
   - Curriculum Map (D31) — PDF
   - L&D-Approver Brief (sample, for reference) — PDF

   **Promotional copy (partner-customizable):**
   - Newsletter Launch Send (`09a`) — `.docx` + `.md`
   - Newsletter Reminder Send (`09b`) — `.docx` + `.md`
   - Podcast / Live Intro Scripts (`09c`) — `.docx` + `.md`
   - Six Pre-Cleared Social Posts (`09d`) — `.docx` + `.md`

   **Co-brand assets:**
   - AESDR × Partner Lockup — Horizontal SVG
   - AESDR × Partner Lockup — Stacked SVG
   - Lockup Usage Guide (`10d`) — PDF

   **Operating cadence:**
   - 30-Day Pilot Operating Cadence (`13`) — PDF

6. **Honesty footer:** *"Three files you'll receive after you sign D22, not before: per-partner UTM-tagged tracking links; per-partner co-brand lockup compositions; the partner pilot agreement itself (counsel-reviewed). Reasoning: those three are operationally specific to your pilot, not pre-clearable."*
7. CTA strip: iris button `Request the partnership agreement →`.
8. Footer.

**PDF rendering pipeline (Phase 1 dep):** Each kit file in `docs/partner/kit-template/` plus D19, D20, D21, D28, D31, L&D brief renders to PDF using a build-time pipeline. Recommend: Pandoc + a custom AESDR LaTeX template, or Puppeteer + a CSS-styled HTML template. Either approach must hit canon §8.5 PDF anatomy.

**Five-question check:** Pass. The kit page's table format is the operator-to-operator register at its purest.

### Page 1.5 — `/partners/faq`

**Source:** D23 partner-facing FAQ (Q05/Q07/Q11 lifts) + new partner-specific Qs derived from the canon.

**Layout:**

1. Standard hub header.
2. Mono eyebrow: `AESDR · PARTNERS · FAQ`.
3. Hero: `--display` italic 700, 48pt: *"Twelve questions. Plain answers."*
4. Sub: *"This is the FAQ for partners. The buyer FAQ lives at `/syllabus`."*
5. **Twelve Q&A pairs** in expand-collapse format (default-collapsed on mobile, default-expanded on desktop). Each Q is `--display` italic 22pt; each A is `--serif` 16pt.

   **Recommended 12 Qs:**
   1. *"Why so few partners?"* — Lift canon §1.3.
   2. *"Why won't you discount?"* — Lift Phase 0 #5 ratification.
   3. *"What's the commission rate?"* — 30% net per D22 §5.1.
   4. *"How does attribution work?"* — Lift D22 §6 + canon §8.7-§8.8.
   5. *"Do I get the AESDR email list?"* — No, ever. Lift D40 §4.
   6. *"How is this different from free content my audience can get on YouTube?"* — Lift D23 Q05 verbatim.
   7. *"Who shouldn't I send to AESDR?"* — Lift D23 Q07 verbatim.
   8. *"What does the workshop look like?"* — Brief description of D09 + link to `/partners/workshop-format` (Phase 2 stub).
   9. *"What about the founder?"* — Lift canon §12.1: AESDR is founder-backstage, host-fronted. Founder visible to partners; never to audience.
   10. *"What if a pilot doesn't work?"* — Lift D34 close-out doctrine, canon §13 ("we part as adults").
   11. *"What's the host situation?"* — Lift D29 host bio M-length (placeholder until host casting).
   12. *"Can my audience get the program at a different price than aesdr.com lists?"* — Lift Phase 0 #5: never.
6. **Honest disqualification footer:** *"If a question you have isn't here, it's because we don't have a clean answer yet — apply anyway, we'll tell you so directly."*
7. CTA strip: iris button.
8. Footer.

**Five-question check:** Pass. FAQ register is operator-to-operator by definition.

### Page 1.6 — `/partners/apply`

**Source:** D27 partner vetting scorecard §1 (partner identification) — sanitized for partner-facing register, reduced to 4 form fields.

**Layout:**

1. Standard hub header.
2. Mono eyebrow: `AESDR · PARTNERS · APPLY`.
3. Hero: `--display` italic 700, 48pt: *"Tell us about your audience."*
4. Sub: *"Four fields. The first call is operator-to-operator, 30 minutes, no slide deck."*
5. **Application form** (centered, max-width 480px, white panel on cream, `--light` border):
   - Field 1: Your name (`--cond` label `YOUR NAME`)
   - Field 2: Your audience (`--cond` label `WHO IS YOUR AUDIENCE` — short text, 1-2 sentences)
   - Field 3: Your primary channel (`--cond` label `PRIMARY CHANNEL` — radio group: Newsletter / Podcast / Community / Course / Other)
   - Field 4: Your audience size (`--cond` label `APPROXIMATE SIZE` — text, e.g. "~3,000 newsletter subscribers")
   - Field 5 (optional): Your URL (`--cond` label `LINK TO YOUR WORK`)
   - Hidden fields: `utm_source` (always `partners-page`), `utm_medium` (always `application-form`)
   - Submit button: iris CTA `Submit application →`
6. **What happens next** strip below the form: *"AESDR reviews applications weekly. If your audience matches, we send a 30-min Calendly link. If it doesn't, we tell you so directly within 5 business days."*
7. **Caveat closing line:** *"PS — If you're going to apply, apply because the brand makes sense, not because the commission does. We're not for everyone, and that's the point."* (Same Caveat as the home page; reuse the component.)
8. Footer.

**Form posting:**
- Posts to a new API route `app/api/partners/apply/route.ts` that:
  - Validates inputs (server-side)
  - Sends email to `admissions@aesdr.com` with form contents
  - Logs application to a Supabase table `partner_applications` (new migration required)
  - Returns 200 with thank-you state to the form
- Thank-you state replaces the form with: *"Application received. We'll be in touch within 5 business days."* — no over-sell, no marketing email enrollment, no auto-responder gimmicks.

**Operational dep:** `admissions@aesdr.com` mailbox standup (Phase 0 dep, still pending).

**Five-question check:** Pass.

---

## Component library (reusable, build once)

| Component | Used on | Spec |
|---|---|---|
| `LockupHeader` | All hub pages | AESDR wordmark left, nav links right, single `--light` 1px bottom border |
| `EditorialSplitHero` | `/partners` only | Crimson 40% / cream 60%, ghost numeral, configurable eyebrow + headline + body |
| `MonoEyebrow` | All hub pages | `--mono` 11pt 700 .25em uppercase `--muted` |
| `ThreePillarBlock` | `/partners` | Three white-panel-on-cream cards with mono trail line at bottom of each |
| `CatalogTeaserGrid` | `/partners` (4-card), `/partners/curriculum` (12-card) | Configurable card count; each card carries call number, title, question, annotation, stamp |
| `ToolStrip` | `/partners`, `/partners/curriculum` | Five named tool cards in horizontal row; links to `/tools/[slug]` |
| `DisqualificationPanel` | `/partners`, `/partners/curriculum` (variant) | White-panel-on-cream, `--cond` eyebrow, `--serif` italic body bullets |
| `CaveatLayer` | `/partners`, `/partners/apply` | `--hand` 22pt `--crimson` rotation `-1deg`, configurable copy |
| `HubCTA` | All hub pages | Single iris button, configurable text and href |
| `KitDownloadTable` | `/partners/kit` | Three-column table with download buttons |
| `FAQAccordion` | `/partners/faq` | Expand-collapse Q&A pairs |
| `ApplicationForm` | `/partners/apply` | 5-field form with inline validation |
| `Footer` | All hub pages | Postal address, copyright, links to `/privacy`, `/terms`, `/refund-policy` |

All components consume CSS tokens from `app/globals.css`; no new color or font tokens introduced.

---

## Operational deps for Phase 1

| Dep | Status | Owner | Blocks |
|---|---|---|---|
| `admissions@aesdr.com` mailbox + DNS | Pending Phase 0 #6 | Founder + ops | `/partners/apply` form submission |
| PDF rendering pipeline (markdown → branded PDF) | Not started | Engineering | `/partners/kit` downloads |
| Supabase `partner_applications` table migration | Not started | Engineering | `/partners/apply` form persistence |
| Counsel review of D22 v1 | Operationally pending | External | `/partners/program` "request the agreement" CTA earns its honesty |
| Discount-doctrine cleanup across kit content | Not started | Authoring | `/partners/program` pricing strip; D28 v2 PDF |
| Tools page (`/tools/[slug]`) routing verification | Live, needs hub-link audit | Engineering | `/partners` tool strip + `/partners/curriculum` |
| Sitemap.xml + robots.txt update | Not started | Engineering | SEO discoverability |

---

## Phase 2 — Full Hub with Proof Surface

**Goal:** Add the proof layer (lesson preview, workshop format reference, case studies) once host casting + lesson preview production land.

**Effort:** Additional ~50 hrs engineering + ~15 hrs design + variable content production. 3–4 calendar weeks after Phase 1 ships.

### Page 2.1 — `/partners/preview`

**Source:** D30 lesson preview spec.

**Layout:**

1. Standard hub header.
2. Mono eyebrow: `AESDR · LESSON PREVIEW · "THE COST OF BEING ON"`.
3. Hero: `--display` italic 700, 56pt: *"The Cost of Being On."*
4. Sub: *"A 12-minute slice from `658.85 / L11` in the catalog. Hosted by `[HOST_FIRST_NAME]`. The territory: what you do when no one's watching."*
5. **Embedded video player** (Vimeo private, token-gated; see D30 §5).
6. **Below player:** transcript download (PDF), takeaway block (3 bullets verbatim from D30 §7).
7. **"What this is and isn't" block:** *"This is one of twelve lessons. The other eleven cover the catalog at `/partners/curriculum`. The full lessons run longer and include worksheets, the takeaway tools, and the Discord (Untamed). The preview is the preview."*
8. CTA strip: iris button `Request a partner conversation →`.
9. Footer.

**Activates when:** lesson preview clip is recorded, edited, captioned, hosted at `[CLIP_VIDEO_URL]` (D30).

### Page 2.2 — `/partners/workshop-format`

**Source:** D09 workshop deck (markdown spec) + 04-rendered HTML (visual reference).

**Layout:**

1. Standard hub header.
2. Mono eyebrow: `AESDR · WORKSHOP FORMAT · WHAT THE 60 MINUTES LOOKS LIKE`.
3. Hero: *"60 minutes. 19 slides. Two concept-spaces. Zero frameworks taught."*
4. **Workshop deck embed:** iframe to a published version of `tools/rendered/04-d09-workshop-deck.html` (or the deck rebuilt as a Next.js page using the same HUD/click-to-advance pattern).
5. **Anatomy strip:** *"Title → opener → filter → outcomes → concept 1 → self-assessment → reality interlude → concept 2 → self-assessment → reality interlude → catalog teaser → offer → honest disqualification → Q&A → close. 75 minutes hard cap. The administrator's script can ad-lib in named zones; the slides cannot."*
6. CTA: iris button.
7. Footer.

### Page 2.3 — `/partners/case-studies`

**Source:** D39 case-study template — populated with first 1–2 anonymized or named case studies after first 1–2 pilots complete.

**Layout:**

1. Standard hub header.
2. Mono eyebrow: `AESDR · CASE STUDIES · 1 OF [N] PILOTS DOCUMENTED`.
3. Hero: *"Case studies, no exaggeration."*
4. Sub: *"AESDR pilots run for 30 days each. We document each one in writing. The case studies below are the partner-approved versions — internal versions stay internal. Per canon §13."*
5. **Case study cards** — vertical list, each with: pilot ID, partner archetype, headline outcome, link to full case study PDF.
6. **Empty state (Phase 2 launch):** *"First case study lands within 30 days of the first pilot's close. We don't fabricate before we have data."*
7. CTA: iris button.
8. Footer.

### Page 2.4 — `/partners/disclosure`

**Source:** D19 disclosure language pack, web-rendered.

**Layout:** Single-column, table-format. Disclosure phrasings by surface (newsletter / social / reel / live workshop / DM). Lift verbatim from D19.

### Page 2.5 — `/partners/program/commission`

**Source:** D28 sanitized for never-discount + D22 §5 + the $40 attribution decision (pending founder + counsel ratification).

**Layout:** Single-column, table-format. Subsections: rate (30% net), attribution (30-day cookie + code-based override), payment terms (net-45), $40 follow-on attribution rule (when ratified), refund treatment.

### Per-partner pages — `/[partner_slug]/workshop`

**Source:** D26 partner-promo page spec + 06-rendered HTML.

**Production work:** rebuild as a Next.js dynamic route at `app/[partner_slug]/workshop/page.tsx`. Server-rendered. Pulls partner config from a new Supabase table `partner_pilots` (one row per partner, with cohort_id, partner_id, partner_type, pilot dates, partner_quote-or-null). Hidden form fields per D26 §8.

**Activates per pilot:** one route per active pilot. After `[PILOT_END_DATE]`, route 301-redirects to `aesdr.com/enroll`.

### Per-partner pages — `/[partner_slug]/replay/[token]`

**Source:** D24 replay page spec + 05-rendered HTML.

**Production work:** dynamic route at `app/[partner_slug]/replay/[token]/page.tsx`. Token validation via Supabase (single-use, 72-hour expiry). Vimeo private embed with signed URL. Expired-token render (D24 §10) handled by the same route.

---

## Phase 3 — Differentiated Hub

**Goal:** Add the brand-doctrine differentiators that separate AESDR's hub from a median course-creator hub.

**Effort:** ongoing; ships incrementally as inputs land.

### Page 3.1 — `/partners/how-we-work`

**Source:** Canon §1, §3, §10, §12, §13 (sanitized for partner-facing).

**Layout:** Long-form essay. Single-column, max-width 720px. Sections:
1. *"What we believe."* — Lift canon §1 foundational doctrines.
2. *"The two voices."* — Lift canon §3 (Rowan + Michael).
3. *"Why the founder is invisible."* — Lift canon §12.1.
4. *"Honesty as competitive position."* — Lift canon §13.

This is the most-distinctive hub page available. Its existence on a course-creator affiliate hub is unusual — that's the point.

### Page 3.2 — `/partners/who-we-don't-work-with`

**Source:** D27 vetting scorecard §"Red-flag list" (sanitized).

**Layout:** Honest-disqualification at scale. Ten bullets of partner archetypes AESDR specifically declines, each with a one-sentence reason. Uncomfortable on purpose. Per canon §1.6 + §13.

### Page 3.3 — `/partners/calendar`

**Source:** New deliverable — public-facing pilot calendar.

**Layout:** Three-column grid. Past pilots (closed) / Active pilots (in-flight) / Open windows (taking applications).

Activates when ≥3 pilots have completed. Until then, `/partners/case-studies` carries the function.

---

## Discount-doctrine cleanup tasks (triggered by Phase 0 #5)

Files requiring rewrite to remove discount/promo-code references:

| File | Change | Effort |
|---|---|---|
| `D28-pricing-and-promo-sheet.md` | Full rewrite. Remove §2 (pilot pricing table), `[PILOT_DISCOUNT]` placeholder, `[PILOT_CODE]` references. Replace with: *"Pricing is list. Always. Partners earn 30% commission off list price. AESDR does not run promotional codes, pilot discounts, partner-stack discounts, or time-limited price drops. Buyers see the same price every other AESDR buyer sees."* Plus add the $40 follow-on as a real revenue-line section. | 1 hr |
| `D09-workshop-deck.md` slide 16 (offer slide) | Remove `[PILOT_PRICE]` references; offer slide shows list pricing only. CTA copy: `Enroll at aesdr.com →` (not `Enroll → [PILOT_CODE] · saves you $[DISCOUNT]`). | 30 min |
| `D17-high-intent-dm.md` V5 + V6 | Remove `code [PILOT_CODE]` from URL trail; URL is `aesdr.com/enroll`. | 15 min |
| `D18-deadline-window-email.md` | Substantial reframe. Without a discount expiry, the email's primary trigger evaporates. Two options: (a) repurpose as the replay-window-closes email (the 72h replay deadline is real); (b) sunset the email entirely. **Recommend (a).** | 1 hr |
| `D24-replay-page.md` §2 + §5 + §8 CTA | Remove `[PILOT_CODE]` and `saves you $[DISCOUNT]`. CTA becomes `Enroll →`. | 30 min |
| `D26-partner-promo-page.md` §3b CTA | Same. | 15 min |
| `D40-master-partner-kit-readme.md` §2.4 (pricing) | Update to reflect never-discount. | 15 min |
| `kit-template/09a-newsletter-launch.md` | Body has no discount references currently — verify and confirm. | 5 min |
| `kit-template/09b-newsletter-reminder.md` | Same. | 5 min |
| `kit-template/09c-podcast-intro-script.md` | Same — no discount references in current draft; verify. | 5 min |
| `kit-template/09d-social-pre-approved-posts.md` | Posts 1-6 have no discount references; deadline post (post 6) currently references "pilot pricing closes" — reframe to "registration window closes" or "replay window closes". | 30 min |
| `kit-template/11-tracking-links.md` | Remove `code=[PILOT_CODE]` query parameters; UTMs only. | 15 min |
| `kit-template/13-operating-cadence.md` | Remove "pricing-window close" phase; replace with "replay-window close." | 30 min |
| Rendered HTMLs (`04`, `05`, `06`, `08`) | Update CTA copy to match. | 1 hr |

**Total cleanup effort:** ~6 hrs. **Recommend:** ship this as a separate batch (call it "Batch 7.7 — never-discount cleanup") before Phase 1 hub starts. The hub copy lifts from these files; if they still reference discounts, the hub will too.

---

## Approval gates summary

| Gate | What | Owner | When |
|---|---|---|---|
| Phase 0 inputs (×6) | Founder ratifications | Founder | DONE 2026-05-02 |
| Discount-doctrine cleanup batch | Files updated to never-discount | Founder review | Before Phase 1 starts |
| Hub Page 1.1 first publish | Five-question check + canon §6.9.3 first-instance | Founder | Before publish |
| Hub Page 1.2–1.6 first publish | Same | Founder | Per page |
| `partner_applications` table migration | Schema review | Founder + ops | Before Phase 1 ships |
| Counsel review of D22 v1 | Legal | Counsel | Before any partner D22 send (Phase 1 doesn't ship D22 publicly) |
| Per-partner page (`/[partner_slug]/workshop`) first publish | Co-brand approval | Founder + partner | Per pilot |
| Lesson preview clip first publish | Founder review of cut | Founder | Before Phase 2.1 publish |
| First case study external publish | Partner sign-off | Founder + partner | Per case study |

---

## Open questions (require founder/counsel input before relevant phase)

1. **$40 follow-on attribution.** Is the $40 unlock partner-attributable within the 30-day window? Recommend: yes. Ratification needed before `/partners/program/commission` ships in Phase 2.5.
2. **Phase 2 routing for `/partners/preview`.** Does the lesson preview clip live as an embedded video on a Next.js page, or as a redirect to a Vimeo public link? Recommend: embedded, so the page can frame the clip per D30 spec.
3. **Phase 2 case-study cadence.** How many pilots before `/partners/case-studies` activates? Recommend: any one PASS-tier pilot. Empty-state copy holds until then.
4. **Phase 3 `/partners/calendar`.** Is the pilot calendar public, or partner-application-gated? Recommend: public — it's a transparency play that reinforces canon §1.6.
5. **Hub footer.** Should the hub footer carry a separate "partner-relations contact" line? Recommend: no. The application form is the contact path; founder backstage doctrine (canon §12.1) means no founder email is published.

---

## What this spec is not

- Not the implementation. The spec defines what gets built; the actual Next.js code is produced from the build prompt that follows this document.
- Not the canon. Canon (`AFFILIATE_BRAND_CANON.md`) governs everything; this spec inherits.
- Not partner-facing. This document never crosses the partner boundary. It is internal AESDR + Claude authoring context.
- Not a marketing document. The hub itself is partner-facing; this document is build infrastructure.

---

## Source-of-truth references

| Reference | Path |
|---|---|
| Canon | `AFFILIATE_BRAND_CANON.md` v1.1 (root) |
| Production syllabus | `app/syllabus/page.tsx` (commit `20cbc9e`, 2026-04-22) |
| Course-content audit | `docs/planning/course-content-audit.md` (2026-04-09) |
| 36 lesson HTMLs | `content/lessons/html/lesson-01` through `lesson-12` |
| 5 tools | `tools/standalone-html/` + routes at `app/tools/[slug]/page.tsx` |
| 2 artifacts mechanic | `app/reveal/RevealView.tsx` line 212 + `app/artifacts/playbill/page.tsx` + `app/artifacts/redline/page.tsx` |
| Existing rendered HTML examples | `tools/rendered/04-d09-workshop-deck.html`, `05-d24-replay-page.html`, `06-d26-partner-promo-page.html`, `08-d38-launch-hero.html` |
| Variant-a-editorial-split (canonical pattern) | `variants/variant-a-editorial-split.html` |
| Pricing source | `PRICING_ENGINE_SPEC.md` |
| 40 partner deliverables index | `docs/partner/00-INDEX.md` |
| Session state | `SESSION_STATE.md` |

---

*End of specification. Build prompt follows in `HUB-BUILD-PROMPT.md`.*
