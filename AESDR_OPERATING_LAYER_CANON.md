# AESDR / Operating Layer — Canon + Build Spec

**Status:** Active build. Target completion: week 1 of June 2026. Stays gated behind `COMING_SOON` until full launch.

**Owner:** Antaeus Coe. **Build window:** ~2–3 weeks from 2026-05-18. **Deadline:** "built beautifully" matters more than fast.

---

## 0. Purpose

`/teams` is the B2B / channel-partner face of AESDR. It exists to give sales-org buyers (managers, enablement, RevOps, L&D, fractional services, LMS platforms) a surface they can engage with on their terms — without diluting or replacing the consumer-direct survival voice that aesdr.com is built on.

This document is **canon** for the subsidiary brand and **spec** for the build. It captures positioning, voice, visual identity, route structure, per-page content briefs, asset inventory, partner targeting, pricing, integration roadmap, technical architecture, and build sequencing. Update it as decisions evolve; don't relitigate them in PRs.

---

## 1. Positioning + voice

### 1.1 The angle

> **AESDR / Operating Layer is the missing behavioral foundation for early-career sales orgs.**

Built on the same 12 lessons that 1st- and 2nd-year SDRs and AEs buy directly on aesdr.com, packaged for sales orgs that need their junior reps to mature faster. The wedge: **young SDRs and AEs break in predictable ways. We turn the breakpoints into a structured training path.**

This framing is borrowed from the Paycor / Listo capability-extension partnership pattern (see decisions log §13). We're not a sales-training course in the B2B SaaS sense — we're the behavioral foundation that platforms in sales enablement, LMS, sales hiring, and fractional RevOps don't have and don't want to build.

### 1.2 What this is NOT

- **Not a rebrand of aesdr.com.** The consumer brand changes nothing. Same landing page, same FAQ, same pricing cards, same survival voice. The subsidiary is an "auxiliary detached building," not a renovation.
- **Not a generic "behavioral OS" pivot of the whole company.** The behavioral-OS framing lives only in `/teams/*`. Consumer surfaces stay in the survival voice ("for the rep grinding through 80 dials and a 9% reply rate").
- **Not a procurement/RFP-friendly enterprise product** in v1. Custom enterprise is a "contact us" surface; we are not building SOC 2 reports, security questionnaires, or RBAC layers yet. Those come if and when a 50-seat-plus deal lands.
- **Not a marketing-funnel optimization play.** No PostHog, no SDR-style chatbot, no exit-intent popups, no email capture for a lead magnet. The subsidiary surfaces match the editorial restraint of the parent.

### 1.3 How it relates to the consumer brand

The subsidiary openly acknowledges the parent. The relationship is truthful:

> *"AESDR / Operating Layer is built on aesdr.com — the rep-direct course that 1st- and 2nd-year SDRs and AEs actually use. The same 12 lessons, packaged for sales orgs."*

This line appears in the subsidiary footer and (in shortened form) on the landing hero. The consumer brand is referenced as the proof point: this isn't a B2B course someone invented to sell to procurement; it's the same product reps already pay for on their own.

Bridge from main site to subsidiary: one small `for sales orgs →` link in the main site footer. **No cross-linking from main landing hero, FAQ, pricing, or anywhere else.** The subsidiary is discovered via:

- B2B-specific outbound (Bilal or Antaeus sending links to enablement/LMS buyers)
- Channel partner referrals
- Eventually: SEO on long-tail queries like "sales onboarding platform," "SDR ramp acceleration program," "behavioral training for first-year AEs"

### 1.4 Voice register

Two registers depending on surface:

| Surface | Register |
|---|---|
| `/teams` landing | Manager-confident editorial. Playfair headlines. Survival framing acknowledged but framed as *the reason this works for orgs* ("reps treat it as a survival guide, which is why they finish it") |
| `/teams/partners` | Channel-partnership ops voice. Less prose, more table. Pitch-mode. |
| `/teams/pricing` | Direct, transactional. Numbers and what they include. |
| `/teams/contact` | Calm, low-friction. Form + 24-business-hour reply promise. |
| `/teams/curriculum`, `/teams/diagnostic`, `/teams/implementation`, `/teams/integrations` | Spec-document register. Manager-facing technical clarity. |

Across all surfaces, the subsidiary voice is **calm, structural, and operator-grade**. It never says "crush it," "10x," "unleash," or "transform your sales org." If a sentence could appear in a Highspot deck without modification, rewrite it.

---

## 2. Sub-brand mark

### 2.1 Name

**Primary:** `AESDR / Operating Layer`

Read as "AESDR's operating layer." The slash separator signals subsidiary relationship without using corporate suffixes like "Inc," "Enterprise," or "Pro."

**Short form (in URL, in headers when space-constrained):** `AESDR / OL`

**Never use:**
- "AESDR Teams" (descriptive but generic)
- "AESDR Pro" / "AESDR Plus" (too SaaS-y)
- "AESDR Enterprise" (implies feature gating we don't have)
- "AESDR for Business" (limp)

### 2.2 Wordmark treatment

The wordmark on subsidiary pages uses the iris-shimmer gradient (same `var(--iris)` + 4s shimmer keyframe used on consumer brand wordmark and role chips), but with the `/ Operating Layer` suffix in `var(--mono)` (Barlow Condensed) at a smaller size and `var(--muted)` color.

Spec:
```
[AESDR]      <-- Playfair Display, 900 italic, iris-shimmer fill
[ / Operating Layer]   <-- Barlow Condensed, 700, .15em letter-spacing,
                            uppercase, var(--muted), 40% of AESDR's font-size
```

The `/` separator is a true forward slash, not an em-dash or pipe. It's part of the brand mark — never replace with another character.

### 2.3 Tagline

**Primary:** *"The missing behavioral foundation for early-career sales orgs."*

**One-liner alts (use contextually):**
- "Built on aesdr.com. Packaged for teams."
- "The same 12 lessons your best reps already pay for — rolled out across your org."
- "Operator-grade training for the first 18 months of an SDR or AE career."

Never use any tagline containing the words: "potential," "unleash," "transform," "ignite," "supercharge," "next-level."

### 2.4 Sub-logo treatment

Three forms of the sub-brand mark, each scoped to a specific surface scale. All three are type-based (no icon glyphs) to stay consistent with the parent brand's editorial-typographic identity.

#### Full mark
**Use:** landing hero, footer "Powered by" line, marketing PDFs, partner one-pager header, certificate header.

```
AESDR  / Operating Layer
^^^^^   ^^^^^^^^^^^^^^^^
Playfair  Barlow Condensed
900 italic 700, uppercase,
iris-shimmer  .15em letter-spacing,
fill          var(--muted)

Vertical alignment: baselines aligned.
Suffix size: 40% of AESDR font-size.
Slash: real "/" character — never em-dash, never pipe, never bullet.
Gap before "/": 0.4em. Gap after "/": 0.3em.
```

CSS spec for `<SubLogoFull>` at 32px base:

```css
font-size: 32px;
.aesdr {
  font-family: var(--display);
  font-size: 32px;
  font-weight: 900;
  font-style: italic;
  background: var(--iris);
  background-size: 300% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shimmer 4s linear infinite;
  letter-spacing: -0.02em;
}
.suffix {
  font-family: var(--cond);
  font-size: 13px; /* ~40% of 32 */
  font-weight: 700;
  letter-spacing: .15em;
  text-transform: uppercase;
  color: var(--muted);
  margin-left: 0.4em;
}
.slash {
  /* inside .suffix, but rendered as its own span for slight kerning control */
  margin-right: 0.3em;
  color: var(--muted);
  font-weight: 400;
}
```

#### Compact mark
**Use:** nav bar, breadcrumbs, table headers, dense layouts.

Same construction as full mark, but the suffix collapses to `OL`:

```
AESDR  / OL
```

Same fonts, same colors, same gap rules. Renders cleanly at 18–24px AESDR size.

#### Tiny mark / monogram
**Use:** favicons, certificate corners, watermarks on PDFs, any surface ≤16px tall or where a wordmark won't fit.

```
A·OL
```

- All Barlow Condensed 700, uppercase, .15em letter-spacing
- "A" in iris-shimmer fill
- "·" (middle dot, not period) in var(--muted)
- "OL" in var(--muted)
- Renders at 10–14px font-size

The middle dot signals subsidiary relationship in a glanceable way at favicon scale.

#### Forbidden treatments

- Never stack the suffix below AESDR. The wordmark is always single-line.
- Never put the suffix in iris-shimmer. Iris is reserved for "AESDR" itself; suffix stays muted.
- Never substitute `/` with another character (em-dash, pipe, colon, bullet, parenthesis).
- Never abbreviate "AESDR" — even in the tiny mark, AESDR survives as the full wordmark or as the "A" monogram, never as anything else.
- Never apply box backgrounds, borders, or container shapes to any form of the mark. The sub-logo is type, not a badge.

#### Component implementation

Three React components under `app/teams/_components/SubLogo.tsx`:

```tsx
<SubLogoFull />     // default 32px AESDR size
<SubLogoFull size={48} />  // hero scale, opt-in
<SubLogoCompact />  // default 20px
<SubLogoTiny />     // default 12px
```

Each component is a pure server component (no client interaction). Iris-shimmer animation runs via existing `@keyframes shimmer` already in `app/globals.css` — no new keyframes needed.

---

## 3. Visual identity

### 3.1 Palette

Built from the same `app/globals.css` token set as the consumer brand. The differentiator is which token gets PROMOTED to primary on subsidiary surfaces.

| Role | Consumer brand | Subsidiary `/teams` |
|---|---|---|
| Background | `--cream` (`#FAF7F2`) | Same |
| Body text | `--ink` (`#1A1A1A`) | Same |
| Primary accent | `--crimson` (`#8B1A1A`) | **`--iris` (gradient) — promoted** |
| Secondary accent | `--iris` (rationed: wordmark, role chips only) | `--crimson` (rationed: section dividers, hover states) |
| Muted text | `--muted` (`#6B6B6B`) | Same |
| Borders / low-emphasis surfaces | `--light` (`#E8E4DF`) | Same |

The single most important visual decision: **iris-shimmer is the primary accent on `/teams/*`.** This is the instant family-recognition signal — same gradient as the consumer wordmark, but used aggressively instead of rationed. Buttons, key CTAs, KPI numbers, divider lines, hover states, focus rings.

### 3.2 Type system

Same token set as consumer brand. No new fonts.

| Token | Stack | Use on subsidiary |
|---|---|---|
| `--display` | `'Playfair Display', Georgia, serif` | Headlines (h1, h2). Heavier weights (900 + italic for hero only; 700 italic for section headers). |
| `--serif` | `'Source Serif 4', Georgia, serif` | Body text, page intros, long-form spec docs. |
| `--cond` | `'Barlow Condensed', sans-serif` | All UI labels, buttons, table headers, KPI captions, breadcrumbs. |
| `--mono` | `'Space Mono', monospace` | Subsidiary wordmark suffix, code-like spec excerpts (e.g., integration endpoint examples), data labels. |
| `--hand` | `'Caveat', cursive` | **Do not use on `/teams/*`.** Caveat is consumer-brand DNA (Michael's voice / margin annotations). Subsidiary is structural; handwriting reads wrong here. |

### 3.3 Layout DNA

The consumer brand is **editorial scroll** — narrative pull-quotes, full-bleed mascot, Caveat margin notes, FAQ classified-dossier aesthetic.

The subsidiary is **operator deck** — structured, dense, comparison-table-heavy. Reference visual model: the Bilal case studies vault (`/tmp/bilal-proposal/frame_*.jpg` style, but in AESDR palette) — big KPI callouts ($2M+ / 57+ / $300K+ pattern), card grids, Goal/Approach/Ecosystem-Built block layouts.

Core layout patterns:

- **Hero with stat triplet.** Three big numbers in iris-shimmer, each with a small mono caption. Modeled on the case-study results pattern.
- **Buyer-mode card grid.** Four cards, equal weight, each describing one buyer mode (direct seats / white-label / marketplace / fractional). Iris-shimmer borders on hover.
- **Comparison table.** "Build it yourself / Existing LMS course / AESDR Operating Layer" — structured side-by-side, not narrative.
- **Channel-partner blocks.** One per partner category, each with: "the gap they have," "how AESDR plugs in," "integration mechanism," "revenue model" as a 4-column micro-table.
- **Spec block.** For curriculum, diagnostic, integrations pages — Notion-doc aesthetic, numbered sections, monospace data labels.

### 3.4 Component DNA

Reusable components to build (in `app/teams/_components/`):

| Component | What it does |
|---|---|
| `<TeamsLayout>` | Subsidiary nav + footer wrapper. Sets `--accent-primary: var(--iris)` scope. Renders subsidiary wordmark, navigation, footer with "Powered by aesdr.com" line. |
| `<KPIStat>` | Big iris-shimmer number + mono caption. Three-up on hero. |
| `<BuyerModeCard>` | Card with icon, title, one-line description, "Talk to us" CTA. Four-card grid. |
| `<PartnerCategoryBlock>` | Channel-partner pitch block. Title + 4-column micro-table. |
| `<ComparisonTable>` | Sticky-header comparison grid. Use sparingly. |
| `<SpecSection>` | Numbered spec section for curriculum / diagnostic / integrations pages. |
| `<InlineCTA>` | "Book a 30-min walkthrough" pill button. Iris-shimmer fill. |
| `<TeamsFooter>` | Subsidiary footer. Includes "Powered by aesdr.com" line + back link + contact. |

Reuse from consumer brand:
- `--iris` keyframe + gradient (no changes)
- Existing CSS variables (palette, type tokens)
- The "Untamed" stamp pattern (could repurpose for "Beta" or "Preview" tags if needed)

### 3.5 Mascot treatment

Leponeus is consumer-brand DNA. On `/teams/*`:

- **Do not lead with the mascot.** No hero-sized mascot, no full-bleed appearance.
- **Permitted use:** small monogram (≤40px) in the subsidiary footer, as part of the "Powered by aesdr.com" line. Like a "made by" badge.
- **Never:** mascot inside KPI cards, mascot adjacent to pricing, mascot in the partner-channel pitch.

B2B audiences see mascots and unconsciously categorize the product as consumer / playful / not-for-enterprise. We won't fight that. The mascot stays beloved on aesdr.com and almost invisible on `/teams/*`.

---

## 4. Route structure

### 4.1 Page tree

```
app/teams/
  layout.tsx                  Subsidiary layout (nav, footer, accent scope)
  page.tsx                    /teams — landing
  teams.module.css            Subsidiary-scoped styles
  _components/
    TeamsNav.tsx
    TeamsFooter.tsx
    KPIStat.tsx
    BuyerModeCard.tsx
    PartnerCategoryBlock.tsx
    ComparisonTable.tsx
    SpecSection.tsx
    InlineCTA.tsx
  partners/
    page.tsx                  /teams/partners — channel pitch
  pricing/
    page.tsx                  /teams/pricing
  contact/
    page.tsx                  /teams/contact
    ContactForm.tsx           Client component for form interaction
  curriculum/
    page.tsx                  /teams/curriculum
  diagnostic/
    page.tsx                  /teams/diagnostic
  implementation/
    page.tsx                  /teams/implementation — manager guide
  integrations/
    page.tsx                  /teams/integrations

app/api/teams-inquiry/
  route.ts                    POST handler for /teams/contact form
                              Emails hello@aesdr.com with [/teams inquiry] prefix
```

### 4.2 Per-page intent

| Route | One-line intent |
|---|---|
| `/teams` | Convince a sales manager / enablement leader / RevOps that AESDR is the behavioral foundation their first-year reps are missing. CTA: book a walkthrough. |
| `/teams/partners` | Convince an LMS / enablement / hiring / fractional-services partner that integrating AESDR fills a real gap in their offering. CTA: partnership inquiry. |
| `/teams/pricing` | Show team seats (10-pack), describe custom enterprise, describe white-label/reseller paths. CTA: book a walkthrough OR contact for custom. |
| `/teams/contact` | Capture a qualified B2B inquiry. Email routes to `hello@aesdr.com` with subject prefix `[/teams inquiry]`. |
| `/teams/curriculum` | Detailed map of the 12 lessons with learning outcomes per lesson. Buyer-facing curriculum reference. |
| `/teams/diagnostic` | Describe the rep before/after diagnostic instrument. Manager-facing measurement framework. |
| `/teams/implementation` | The manager implementation guide. Rollout sequence, weekly cadence, what to expect from reps. |
| `/teams/integrations` | SSO / SCORM / xAPI / LTI roadmap and current state. Honest about what's built vs. on roadmap. |

---

## 5. Per-page content briefs

### 5.1 `/teams` — landing

**Hero**
- Pre-eyebrow: `AESDR / OPERATING LAYER` (mono, muted)
- Headline: *"The missing behavioral foundation for early-career sales orgs."*
- Subhead (1 sentence): "The same 12 lessons that 1st- and 2nd-year SDRs and AEs buy on aesdr.com — packaged for sales orgs that need their junior reps to mature faster."
- Stat triplet (three big iris-shimmer KPIs, sourced from cited research — see §15):
  - **9.1 months** — average SDR ramp time to full quota attainment (Bridge Group)
  - **39%** — first-year SDR turnover rate in SaaS (Bridge Group / TOPO)
  - **$115K** — average cost to recruit, ramp, and lose one SDR before productivity (Bridge Group + LinkedIn Talent)
- Primary CTA: `Book a 30-min walkthrough` (iris-shimmer fill button) → `/teams/contact?source=hero`

**The wedge (one section)**
- Headline: *"Junior SDRs and AEs break in predictable ways."*
- Body (3 short paragraphs):
  1. Most sales orgs hire reps and expect their manager + a Highspot library to make them productive. It works for some. Most stall, churn, or quit.
  2. The reasons aren't a mystery. Toxic management, ego dynamics between SDRs and AEs, CRM friction, async-life dysfunction, no playbook for the first 100 cold dials — these are the same six or seven breakpoints, repeated across orgs.
  3. AESDR is 12 lessons, each addressing one of those breakpoints, with a takeaway tool the rep keeps. The behavioral foundation that should already exist but doesn't.

**What it is (card row)**
- Three feature cards:
  - **12 lessons** — survival-grade, field-tested, ~25 min each
  - **5 takeaway tools** — manager archetype map, AE/SDR alignment contract, 72-hour strike plan, CRM survival guide, async cadence template
  - **Discord community** — "Untamed" — real AEs and SDRs working through it together

**Four buyer modes (card grid)**
Four cards in a 2×2 grid:

1. **Direct team seats** — buy 10 seats for your org. Reps see the consumer experience; you get the manager dashboard and progress visibility. **$1,499 one-time, lifetime access.** *(Clears up the misread Bilal had.)*
2. **Custom enterprise** — 50+ seats. Per-seat pricing, manager onboarding, custom rollout sequence. **Contact us.**
3. **White-label / co-branded** — for partners packaging AESDR inside their offering. We deliver the lessons; you wrap them in your brand. **Contact us.**
4. **Marketplace integration** — for LMS, enablement, and hiring platforms. SSO, eventual SCORM/xAPI, revenue-share. **Contact us.**

**Powered by line (footer-ish, just above subsidiary footer)**
> "AESDR / Operating Layer is built on aesdr.com — the rep-direct course that 1st- and 2nd-year SDRs and AEs actually use. The same 12 lessons, packaged for sales orgs."

### 5.2 `/teams/partners` — channel pitch

**Hero**
- Headline: *"Your customers hire young salespeople. AESDR is the behavioral foundation those salespeople are missing."*
- Subhead: "If you sell to sales orgs, sales hiring, enablement, or HR, AESDR plugs into a real gap in your customers' day-to-day. Here's how partnerships work."

**Five partner-category blocks** (one block per category, structured identically):

Each block is a `<PartnerCategoryBlock>` with:
- Category name as h2
- One-paragraph framing of what these platforms own and what they don't
- 4-column micro-table: **Gap they have** / **How AESDR plugs in** / **Integration mechanism** / **Revenue model**
- 3–5 named example targets (e.g., "Docebo, 360Learning, Absorb, LearnUpon")

Categories in order:

1. **LMS / LXP platforms** — Docebo, 360Learning, Absorb, LearnUpon, TalentLMS, Moodle Workplace.
2. **Sales enablement platforms** — Highspot, Mindtickle, Spekit, Allego, Showpad, Seismic.
3. **Sales hiring & assessment platforms** — Sales Assembly, Bravado, Aspireship, Uvaro, Victory Lap.
4. **Fractional RevOps & outsourced SDR firms** — (the sneaky-best early wedge per the GPT analysis). Examples: Memory, Operatus, RevOps.io, CIENCE, MarketStar, Belkins.
5. **HR tech marketplaces** — Paycor, Rippling, Gusto, Justworks, ADP Marketplace, BambooHR. Tagged as **longer-term** — listed last with note "we'll get here after a few platform integrations prove the model."

**Closing block**
- Headline: *"Want to talk?"*
- One paragraph: "Best fits send a 2–3 sentence inquiry describing what your platform does and what your customers struggle with. We respond within 24 business hours."
- Primary CTA: `Partnership inquiry` → `/teams/contact?source=partners`

### 5.3 `/teams/pricing`

**Hero**
- Headline: *"Pricing for sales orgs."*
- Subhead: "Three paths. All start with a 30-min walkthrough so we can scope correctly."

**Three pricing cards** (modeled on consumer pricing card layout but with subsidiary visual identity — iris-shimmer accents, ink-fill featured tier for Custom):

1. **Team — $1,499** (one-time, lifetime, up to 10 seats, any mix of SDR/AE tracks)
   - Same as the consumer Team tier — explicit that it's the SAME PRODUCT
   - What's included: 10 seats, manager dashboard, progress tracking, priority support (direct Slack), invoice + receipt formatted for L&D
   - CTA: `Buy now` → existing checkout (Stripe Team SKU)

2. **Custom Enterprise — Contact us** (featured / center tier)
   - For 50+ seats, custom rollout, onboarding support
   - What's included: everything in Team + per-seat pricing, manager onboarding session, custom rollout sequence, dedicated Slack channel
   - CTA: `Talk to us` → `/teams/contact?source=pricing-custom`

3. **White-label / Reseller — Contact us**
   - For partners packaging AESDR inside their offering
   - What's included: lesson delivery rights, co-branded materials, revenue-share or wholesale pricing
   - CTA: `Talk to us` → `/teams/contact?source=pricing-wl`

**Below the cards: comparison table**
- Sticky-header table comparing: Direct Team / Custom Enterprise / White-label across ~10 attributes (seats, pricing model, onboarding, branding, SCORM, dedicated support, contract terms, etc.)

**FAQ block (under table)** — short Q&A list:
- "Is the Team tier the same product as the consumer course?" → Yes. Same 12 lessons, same Discord, same takeaway tools.
- "Can we get a recurring subscription?" → Not currently. We're one-time + lifetime by design. Per-seat custom pricing is available for larger orgs.
- "Do we get a discount for buying multiple Teams?" → No discount stacking on the Team tier. Custom enterprise tier is the path past 10 seats.
- "Refund policy?" → 14-day no-questions-asked, same as consumer.
- "Can we white-label without revenue share?" → Possible at a higher wholesale-seat rate. Discussed during walkthrough.

### 5.4 `/teams/contact`

**Hero**
- Headline: *"Tell us what you're trying to solve."*
- Subhead: "We respond within 24 business hours. Most conversations start with a 30-min walkthrough on Zoom."

**Form** (single column, calm spacing, no asterisks on required fields — use placeholder text and validate on submit):
- Name *
- Work email *
- Company *
- Your role (dropdown):
  - Sales leader (VP Sales, Head of Sales, Sales Director)
  - Sales enablement / training
  - RevOps / Sales Ops
  - L&D / People Ops
  - HR / Talent
  - Fractional / agency
  - Channel partner (LMS, enablement, hiring platform, marketplace)
  - Other
- Team size (dropdown):
  - 1–9 reps
  - 10–24 reps
  - 25–49 reps
  - 50–99 reps
  - 100+ reps
- What brought you here? (textarea, optional, 500 char) — placeholder: "Tell us briefly what you're trying to solve. A sentence or two is enough."
- Source (hidden field — populated from `?source=` query param to track which page sent them: hero / partners / pricing-custom / pricing-wl / etc.)

**Submit button:** `Send inquiry` (iris-shimmer fill)

**Success state:** replace form with calm confirmation: *"Got it. We'll respond within 24 business hours from `hello@aesdr.com`. If urgent, reply to that email and flag it."*

**Backend:** POST to `/api/teams-inquiry`. Server action validates, rate-limits (5/hr per IP), sanitizes, sends formatted email via `lib/email.ts` to `hello@aesdr.com` with subject `[/teams inquiry] {role} from {company}`. Body includes all form fields + source + timestamp + IP.

### 5.5 `/teams/curriculum`

**Hero**
- Headline: *"The 12 lessons, mapped."*
- Subhead: "What your reps will work through. Outcomes per lesson, sequencing, expected time."

**Curriculum map** (12 sections, one per lesson):

Each lesson section includes:
- Course number + title (pulled from existing `content/lessons/html/lesson-N/aesdr_course*_v1.html` `<title>` tags)
- Learning outcomes (3–5 bullets per lesson — to be written; see §6.1 build list)
- Estimated time
- Takeaway tool (if any) named explicitly
- "Why managers care" — one-line statement of org-level value

Course list (from earlier file inventory):
1. Course 1.1 — Creating Structure
2. Course 1.2 — Building Real Camaraderie
3. Course 1.3 — Mastering Coaching
4. Course 2.1 — Breaking Down Silos
5. Course 2.2 — The Ultimate Home Office Setup
6. Course 2.3 — Unpacking AE Ego and Building Healthy Dynamics
7. Course 3.1 — SDR Performance Pitfalls
8. Course 3.2 — The Survival Guide for AEs and SDRs
9. Course 3.3 — Surviving AE Management
10. Course 4.2 — Simplifying Company Culture
11. Course 4.3 — Mastering the Async Life
12. Course 5.1 — The SDR Playbook
*(Plus 6.2, 7.3, 9.1 — verify final lesson list against `content/lessons/html/` before publishing.)*

**Below the map:** "Want the full lesson previews?" → CTA to book walkthrough where a 5-min preview of any lesson can be shown.

### 5.6 `/teams/diagnostic`

**Hero**
- Headline: *"How to know it's working."*
- Subhead: "A before/after diagnostic for measuring rep behavior change. Built for managers who need to justify the investment."

**Sections:**

1. **What the diagnostic measures.** 6–8 dimensions of early-career rep behavior:
   - Outbound activity volume
   - Outbound personalization quality
   - Discovery question depth
   - Manager 1:1 engagement
   - Peer dynamic (AE/SDR alignment, ego friction)
   - CRM hygiene
   - Forecast accuracy (AEs only)
   - Async communication discipline
2. **How it's administered.** Pre-program: 30-min self-report + manager rating. Post-program (end of week 6): same instrument. Delta is the result.
3. **Sample diagnostic items.** 5–8 example questions per dimension — formatted as monospace spec excerpts to feel like a real instrument, not marketing.
4. **What changes typically look like.** Honest framing — "We've seen orgs report 30–60% lifts on outbound activity, 15–25% lifts on disco depth. Some dimensions move fast; some take longer than 6 weeks. We don't promise specific numbers."
5. **How to access.** Currently administered manually as part of Custom Enterprise rollout. Roadmap: self-service instrument with auto-scoring. Build later — see §6.

### 5.7 `/teams/implementation`

**Hero**
- Headline: *"How to roll AESDR out across your team."*
- Subhead: "The manager implementation guide. Read this before you decide whether to buy."

**Sections:**

1. **Before kickoff** — what the manager needs to do (announce, set expectations, schedule weekly 1:1 5-min check-ins, identify the rep who needs the most support and the one likely to evangelize).
2. **Week 1–2** — reps complete lessons 1–3 (the structure-building foundation). Manager reads alongside.
3. **Week 3–4** — lessons 4–6 (AE/SDR dynamics, async life). First peer-discussion session.
4. **Week 5–6** — lessons 7–9 (performance pitfalls, survival guide). Manager runs a "what's stuck" review.
5. **Week 7–8** — lessons 10–12 (culture, playbook). Diagnostic re-administered. Wrap-up team session.
6. **What to expect from reps.** Honest range — "some reps will tear through this; some will resist. The resistors are usually the ones who needed it most. Don't force pace."
7. **What to do with the takeaway tools.** Five tools, when each gets used, how to integrate into existing team rituals.
8. **Common mistakes.**
   - Treating it like compliance training (kills engagement)
   - Skipping the manager's parallel reading (creates a knowledge gap)
   - Pushing reps to finish in 4 weeks (defeats the spaced-rep design)
   - Running peer discussions before lesson 5 (group hasn't built trust yet)

### 5.8 `/teams/integrations`

**Hero**
- Headline: *"Integrations + roadmap."*
- Subhead: "What's live now and what's on the way."

**Sections (honest about state):**

1. **Live now**
   - Email-based onboarding — partners send a CSV of seats; we email reps individually with sign-in links.
   - Manager dashboard access — manager email gets `team_admin` flag in Supabase; sees `/admin/teams` view.
2. **Coming next** (roadmap, no committed dates yet)
   - SSO via SAML 2.0 — for orgs requiring single sign-on (planned)
   - SCORM 1.2 / SCORM 2004 export — for LMS partners (planned)
   - xAPI (Tin Can) statements — for modern LMS / LXP analytics (planned)
   - LTI 1.3 — for university and bootcamp LMS systems (planned)
3. **Custom integrations** — if your platform requires a different mechanism, we'll scope it during the partnership conversation. Examples we've considered:
   - Webhook to push lesson-completion events into partner CRM
   - REST API for partners to provision seats programmatically
   - White-label embed (iframe) of lessons inside partner platforms

This page is honest. We don't claim SSO is "available now" when it isn't. We list it as roadmap and commit to building when a partner needs it. The honesty is itself a credential — most marketplaces puff up the integration list.

---

## 6. Asset inventory

### 6.1 Build in initial sprint (before week 1 of June)

| Asset | Format | Where | Notes |
|---|---|---|---|
| **Subsidiary visual identity** | CSS module + component library | `app/teams/teams.module.css` + `app/teams/_components/` | Foundation for everything |
| **Landing page** | `/teams` route | `app/teams/page.tsx` | All sections per §5.1 |
| **Partners page** | `/teams/partners` route | `app/teams/partners/page.tsx` | Five category blocks per §5.2 |
| **Pricing page** | `/teams/pricing` route | `app/teams/pricing/page.tsx` | Three cards + comparison table + FAQ per §5.3 |
| **Contact page** | `/teams/contact` route | `app/teams/contact/page.tsx` + `ContactForm.tsx` client | Form per §5.4 |
| **Inquiry server action** | `submitTeamsInquiry()` | `app/teams/contact/actions.ts` + `lib/email.ts` | Validates, rate-limits, emails hello@aesdr.com |
| **Curriculum map** | `/teams/curriculum` route | `app/teams/curriculum/page.tsx` | 12 modules / 36 sub-lessons, learning outcomes written |
| **Diagnostic spec page** | `/teams/diagnostic` route | `app/teams/diagnostic/page.tsx` | 8 dimensions, sample items per §5.6 |
| **Implementation guide** | `/teams/implementation` route | `app/teams/implementation/page.tsx` | Manager guide per §5.7. **Print-friendly via teams.module.css print styles — also serves as the downloadable PDF when print-to-PDF'd from the browser.** |
| **Integrations page** | `/teams/integrations` route | `app/teams/integrations/page.tsx` | Honest state + roadmap per §5.8 |
| **Footer link** from main site to `/teams` | Single line addition to consumer landing footer | `app/page.tsx` | Small, low-emphasis |
| **AdminChip integration** | Add `/teams/*` quick-links below a divider | `components/AdminChip.tsx` | See §10.4 |
| **Downloads index** | `/teams/downloads` route | `app/teams/downloads/page.tsx` | Lists all four downloadable artifacts with print-to-PDF instructions |
| **Completion certificate** | `/teams/downloads/certificate` route | `app/teams/downloads/certificate/page.tsx` + client | Interactive generator: rep name + module count + date inputs → printable certificate preview |
| **Partner one-pager** | `/teams/downloads/partner-one-pager` route | `app/teams/downloads/partner-one-pager/page.tsx` | Single-page printable sales sheet (positioning, partner categories, contact) |
| **Rep diagnostic instrument** | `/teams/downloads/rep-diagnostic` route | `app/teams/downloads/rep-diagnostic/page.tsx` | Printable self-administering instrument — all 32 items across 8 dimensions, with response scales |

**Note on PDF format (decision 2026-05-18):** all "downloadable PDFs" are
implemented as **print-friendly web pages** under `/teams/downloads/*` with
explicit `@media print` styles. Users print-to-PDF in their browser to get a
final PDF file. This produces materially better output than auto-generated
binary PDFs (which require design tooling we don't have set up), keeps the
artifacts version-controlled in source, and means assets stay automatically
in sync with the canonical content elsewhere on the site. If the user pulls
out a PDF reader, the file looks beautiful; if they read the artifact on the
web instead, it also looks beautiful — same source.

### 6.2 Reference assets from existing repo

Already exists and gets referenced (not rebuilt):
- Logo wordmark — promoted from `app/page.tsx` brand styling
- Mascot — `public/mascot/leponeus-doctrine.png` (used small in footer only)
- Color tokens — `app/globals.css`
- Type tokens — `app/globals.css`
- Iris keyframe — `app/globals.css`
- Lesson titles — `content/lessons/html/lesson-*/aesdr_course*_v1.html` (extract via build script if needed)

---

## 7. Channel partner targeting

Detailed pitch angles for each category, used both for the `/teams/partners` page content and for outbound conversations.

### 7.1 LMS / LXP platforms

**Examples:** Docebo, 360Learning, Absorb, LearnUpon, TalentLMS, Moodle Workplace, Cornerstone OnDemand.

**Their gap:** They sell the platform to deliver learning. Their customers (HR / L&D) need actual content. Their marketplace strategy depends on third-party content providers.

**How AESDR plugs in:**
- Listed as a "Sales / Early-Career Development" category content partner
- Customers can add AESDR to their LMS catalog
- Reps consume lessons inside the LMS UX

**Integration mechanism:** SCORM 1.2 / SCORM 2004 / xAPI export (on roadmap). Initial integration via SSO + email-based provisioning.

**Revenue model:**
- Referral: LMS sends us qualified leads, 20% of first-year revenue
- Reseller: LMS prices AESDR at their list, we wholesale at 60%
- White-label: LMS embeds AESDR as their own branded curriculum, fixed per-seat wholesale rate (TBD)

### 7.2 Sales enablement platforms

**Examples:** Highspot, Mindtickle, Spekit, Allego, Showpad, Seismic.

**Their gap:** Their platforms are built for content + coaching + analytics, but they don't produce the actual training content for first-year reps. Their customers want "rep onboarding" turnkey, but the platforms only sell the delivery vehicle.

**How AESDR plugs in:**
- Pre-onboarding behavioral foundation (weeks 1–8) before reps touch the enablement platform
- Co-marketing: "AESDR for the human + behavioral; [Platform] for the playbooks + content delivery"
- Bundled into enterprise enablement deals

**Integration mechanism:** SSO + completion-event webhook (roadmap). Lighter integrations possible immediately (just link out from enablement platform's onboarding flow).

**Revenue model:**
- Referral: 15% of first-year revenue
- Bundled deal: per-seat wholesale, platform marks up as part of their enterprise package

### 7.3 Sales hiring / assessment platforms

**Examples:** Sales Assembly, Bravado, Aspireship, Uvaro, Victory Lap, RepVue.

**Their gap:** They place reps. Once placed, the reps either succeed or churn fast. Platform reputation depends on placed-rep success. They have no post-placement training arm.

**How AESDR plugs in:**
- Post-placement ramp acceleration — included as part of placement package
- "Hired reps get AESDR access" — value-add for the hiring org, retention boost for the platform
- Could be a hiring-platform-funded benefit

**Integration mechanism:** Bulk seat provisioning via API or CSV (immediate). Co-branded onboarding email.

**Revenue model:**
- Wholesale per-seat: $99/seat lifetime (vs. $249 consumer) — platform absorbs cost or passes to hiring org

### 7.4 Fractional RevOps & outsourced SDR firms

**Examples:** Memory, Operatus, RevOps.io, CIENCE, MarketStar, Belkins, SalesRoads.

**This is the sneaky-best early wedge.** These firms have junior SDRs working across multiple client engagements. They eat the cost of poor SDR performance. They need a consistent training spine.

**Their gap:** Most fractional firms train SDRs on tools (Outreach, Salesloft, Apollo) but not on the behavioral foundation. Their SDRs are tactical-fluent and behavior-fragile.

**How AESDR plugs in:**
- Internal development spine for the firm's SDR bench
- AESDR completion as a "tier" — junior SDRs go through AESDR before they're assigned to high-value client work
- Public credentialing: "Our SDRs are AESDR-trained"

**Integration mechanism:** Bulk seat purchase by the firm. Internal onboarding tracking via manager dashboard.

**Revenue model:**
- Bulk discount on seats: per-seat pricing at scale (50+ SDRs across the firm)
- Reciprocity: AESDR-trained SDRs become an inbound channel for these firms when AESDR has Custom Enterprise clients who want fractional SDR support

### 7.5 HR tech marketplaces

**Examples:** Paycor, Rippling, Gusto, Justworks, ADP Marketplace, BambooHR, Workday.

**Flagged as longer-term.** These marketplaces have hundreds of apps. Listing without proof is noise.

**Their gap:** Same as Paycor/Listo dynamic — marketplace owns the HR system of record, AESDR fills a category gap (early-career sales rep development) that the marketplace itself doesn't want to build.

**How AESDR plugs in:** Marketplace listing under "Learning & Development" or "Sales Training" categories.

**Integration mechanism:** SSO + employee directory sync (roadmap).

**Revenue model:** Referral (15–20% of first-year). Marketplace takes their standard cut.

**When to pursue:** After 5–10 Custom Enterprise deals close and we have completion-rate + retention-lift case studies. Marketplaces want proof. We don't have proof yet.

---

## 8. Pricing structure

### 8.1 Team seats — $1,499 one-time

- 10 seats, any mix of SDR / AE tracks
- Lifetime access for each seat
- Manager dashboard included
- Priority Slack support
- Invoice + receipt formatted for L&D reimbursement
- 14-day refund

**Same as the existing consumer Team tier.** Important: this is also addressing the misread Bilal had — the Team tier IS one-time, lifetime, ten seats. Not recurring, not corporate subscription.

### 8.2 Custom enterprise

Triggered when team size > 10 or buyer requests custom onboarding.

- Per-seat pricing (TBD on standard rate; expect $99–$149/seat lifetime for 50+ seats)
- Manager onboarding session (live)
- Custom rollout sequence (we adapt the Implementation Guide to the org's calendar)
- Dedicated Slack channel
- Optional add-ons: live coaching pods, custom diagnostic administration, executive presentation

Pricing finalized during walkthrough. No published rate card v1.

### 8.3 White-label / co-branded

For partners packaging AESDR inside their own offering.

- Delivery rights to the 12 lessons + 5 takeaway tools
- Co-branded materials (their logo + AESDR mark with mutual approval)
- Per-seat wholesale rate (higher than direct-buy per-seat rate because of branding rights)
- Revenue-share or wholesale models both available

### 8.4 Reseller / referral

- 20% of first-year revenue for qualified leads that close
- Tracked via FirstPromoter (if affiliate program from Bilal's engagement ships first) or via referral-source tagging in inquiry form
- No exclusivity, no minimums

---

## 9. Integration roadmap

Honest list. Public on `/teams/integrations`. Updated as items move from roadmap to live.

| Integration | State | Build trigger |
|---|---|---|
| **Email-based seat provisioning** | Live | (No trigger — already exists) |
| **Manager dashboard** | Live (via `/admin/teams`) | Already exists |
| **SSO (SAML 2.0)** | Roadmap | First Custom Enterprise client requiring it |
| **SCORM 1.2 export** | Roadmap | First LMS partnership signed |
| **SCORM 2004 export** | Roadmap | First LMS partnership signed (likely same trigger as SCORM 1.2) |
| **xAPI (Tin Can) statements** | Roadmap | First LXP partnership |
| **LTI 1.3** | Roadmap | First university or bootcamp partnership |
| **REST API for seat provisioning** | Roadmap | First reseller wanting programmatic provisioning |
| **Completion webhook** | Roadmap | First enablement-platform partnership |
| **Iframe / embed of lessons** | Roadmap | First white-label deal |

We don't build any of these in the initial sprint. They live on `/teams/integrations` as honest roadmap. Building begins when an actual partner conversation generates the pull.

---

## 10. Implementation notes

### 10.1 Technical architecture

- **Framework:** Next.js 16, App Router (matches existing app)
- **Routing:** Native App Router. `app/teams/` with nested `layout.tsx` that scopes the subsidiary visual identity.
- **Styling:** CSS Modules (matches existing pattern). One `teams.module.css` for shared subsidiary styles + per-component module files if components grow.
- **State / interactivity:** Mostly server components. Client components only for the contact form, KPI counter animations (if added), and any future interactive elements.
- **Form handling:** Server action pattern (proven from the `/coming-soon` bypass refactor in PR #47). Avoids cookie / navigation race conditions.
- **Email sending:** Reuse `lib/email.ts` infrastructure. New helper `sendTeamsInquiry()` that wraps the existing send infrastructure.
- **Rate limiting:** Reuse `lib/rate-limit.ts`. Apply to `/api/teams-inquiry` at 5/hr per IP.
- **Analytics:** None on `/teams/*` initially. Matches consumer brand restraint. Add if a real ops need emerges.

### 10.2 File organization

```
app/teams/
  layout.tsx
  page.tsx
  teams.module.css
  _components/             [Subsidiary-only components]
    TeamsNav.tsx
    TeamsFooter.tsx
    KPIStat.tsx
    BuyerModeCard.tsx
    PartnerCategoryBlock.tsx
    ComparisonTable.tsx
    SpecSection.tsx
    InlineCTA.tsx
    PoweredByLine.tsx
  partners/page.tsx
  pricing/page.tsx
  contact/
    page.tsx
    ContactForm.tsx
  curriculum/page.tsx
  diagnostic/page.tsx
  implementation/page.tsx
  integrations/page.tsx

app/api/teams-inquiry/route.ts

public/teams/
  aesdr-manager-implementation-guide.pdf
  aesdr-completion-certificate-template.pdf
  aesdr-partner-one-pager.pdf
  aesdr-rep-diagnostic.pdf
```

### 10.3 Gating

`/teams/*` stays behind the `COMING_SOON` gate. No changes needed to `proxy.ts` — the existing logic redirects all non-admin, non-bypass-cookie traffic to `/coming-soon`, and `/teams/*` falls under that.

Admins (`antaeus.coe@gmail.com`, `mrcoe7@gmail.com`) and anyone holding the `aesdr_cs_bypass` cookie access `/teams/*` normally. This is the desired behavior for the pre-launch period — work in private, share preview links via the bypass URL pattern when needed.

### 10.4 AdminChip integration

`components/AdminChip.tsx`'s `QUICK_LINKS` constant gets the `/teams/*` routes added **beneath a visual divider line**, so the admin dropdown reads as two sections: existing AESDR navigation, then a separated cluster of subsidiary routes.

Spec for the divider:

```ts
const QUICK_LINKS: ({ label: string; href: string; note?: string } | { divider: true })[] = [
  // ... existing entries ...
  { label: "Home", href: "/" },
  { divider: true },
  { label: "/teams · Landing", href: "/teams", note: "Operating Layer subsidiary" },
  { label: "/teams · Partners", href: "/teams/partners" },
  { label: "/teams · Pricing", href: "/teams/pricing" },
  { label: "/teams · Contact", href: "/teams/contact" },
  { label: "/teams · Curriculum", href: "/teams/curriculum" },
  { label: "/teams · Diagnostic", href: "/teams/diagnostic" },
  { label: "/teams · Implementation", href: "/teams/implementation" },
  { label: "/teams · Integrations", href: "/teams/integrations" },
];
```

The render logic checks for `'divider' in entry` and renders a 1px iris-gradient line with subtle margin. Visual: thin horizontal rule, iris-shimmer fill, 70% opacity.

### 10.5 Email routing

`/api/teams-inquiry` posts emit one email to `hello@aesdr.com`. Subject format:

```
[/teams inquiry] {role} from {company} ({team-size})
```

Example: `[/teams inquiry] Sales enablement from Acme Corp (25–49 reps)`

Body format (HTML, plain-text fallback):

```
A new /teams inquiry came in.

Name:       {name}
Email:      {email}
Company:    {company}
Role:       {role}
Team size:  {team_size}
Source:     {source}
Submitted:  {timestamp ISO 8601}
IP:         {ip}

What brought them here:
---
{message or "(none provided)"}
---

Reply to: {email}
```

Reply-To header set to inquirer's email, so `hello@aesdr.com` replies thread naturally to them.

### 10.6 Coming-soon footer link from main site

In `app/page.tsx` (consumer landing), add ONE small footer link:

```jsx
<a href="/teams" style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)" }}>
  for sales orgs →
</a>
```

Placement: in the existing footer link cluster, alongside Terms / Privacy / Refunds / About / Contact. Same visual weight, no special highlighting.

---

## 11. Build sequence

Five PRs over ~2–3 weeks. Order matters; earlier PRs unblock later ones.

### PR 1 — Foundation (~3–4 days)

**Scope:**
- `app/teams/layout.tsx` (subsidiary nav, footer, accent scope)
- `app/teams/teams.module.css` (shared subsidiary styles)
- `app/teams/_components/` (all eight reusable components)
- `app/teams/page.tsx` (landing — full content per §5.1)

**Why first:** Establishes the design system. Validates the visual identity decisions before they propagate.

### PR 2 — Core surfaces (~3–4 days)

**Scope:**
- `app/teams/partners/page.tsx`
- `app/teams/pricing/page.tsx`
- `app/teams/contact/page.tsx` + `ContactForm.tsx`
- `app/api/teams-inquiry/route.ts`
- New `sendTeamsInquiry()` helper in `lib/email.ts`

**Why second:** The four most action-oriented pages. After this PR, `/teams` is a working B2B surface that can capture inquiries.

### PR 3 — Spec pages (~5–7 days)

**Scope:**
- `app/teams/curriculum/page.tsx` (with all 12 learning-outcome blocks written)
- `app/teams/diagnostic/page.tsx` (with 6–8 dimensions specified)
- `app/teams/implementation/page.tsx` (full manager guide content)
- `app/teams/integrations/page.tsx`

**Why third:** Content-heavy. Requires drawing real outcomes from existing lesson HTML and writing manager-facing copy. This is the longest PR.

### PR 4 — Downloadable assets (~3–4 days)

**Scope:**
- `public/teams/aesdr-manager-implementation-guide.pdf`
- `public/teams/aesdr-completion-certificate-template.pdf`
- `public/teams/aesdr-partner-one-pager.pdf`
- `public/teams/aesdr-rep-diagnostic.pdf`
- Wire download links from relevant pages

**Why fourth:** Web pages need to exist first; PDFs are derivative artifacts. Built as the web pages stabilize.

### PR 5 — Integration + polish (~1–2 days)

**Scope:**
- `components/AdminChip.tsx` — add divider + `/teams/*` quick links (§10.4)
- `app/page.tsx` — add "for sales orgs →" footer link (§10.6)
- Visual fidelity pass across all `/teams/*` pages
- Lint cleanup, link checks, form-submission end-to-end test

**Why last:** Polish + integration. Confirms the subsidiary feels coherent before the build is called done.

**Total estimate:** 15–20 working days. Comfortable inside the "week 1 of June" deadline (2026-06-01) with buffer.

---

## 12. Out of scope

Explicitly NOT building in this sprint. Listed to prevent scope creep.

- SOC 2 / security questionnaire / GDPR-DPA templates *(triggers: first enterprise security review request)*
- Per-seat usage analytics dashboard for managers *(triggers: first Custom Enterprise client asking)*
- In-product purchase flow for Custom Enterprise *(stays as "contact us" — no PLG enterprise self-serve)*
- Affiliate tracking on `/teams/*` *(separate concern — affiliate program is Bilal's engagement, not this build)*
- Multi-language support
- Mobile-app-specific surfaces
- Live chat / Intercom-style widget
- A/B testing on landing-page copy
- PostHog / Mixpanel / any analytics SDK
- Recurring subscription billing on Custom Enterprise *(stay one-time + lifetime model)*
- Replacing or substantively modifying any consumer-brand page (`app/page.tsx`, `/partners/*`, `/syllabus`, pricing cards, FAQ, About, Contact)
- Migrating any consumer copy to the "behavioral OS" framing

---

## 13. Decisions log

Decisions made and ratified by Antaeus. Don't relitigate in PRs without explicit reopen.

| # | Date | Decision | Rationale |
|---|---|---|---|
| 1 | 2026-05-18 | Build a B2B subsidiary instead of repositioning the consumer brand | Consumer brand's polarizing survival voice is its moat. Behavioral-OS framing is too generic to defend at the consumer level. Two-tier brand architecture preserves both. |
| 2 | 2026-05-18 | Use `/teams` (plural) as the route | `/team` (singular) already exists as a member team-dashboard route. `/teams` is free and reads naturally as "for sales teams." |
| 3 | 2026-05-18 | Sub-brand name: `AESDR / Operating Layer` | Matches the value-prop angle (behavioral operating system); slash separator signals subsidiary; "Operating Layer" is more distinctive than "Teams" or "Enterprise." |
| 4 | 2026-05-18 | Stays gated behind `COMING_SOON` for v1 | Pre-launch period. Subsidiary work is private; share via bypass URLs for B2B sales conversations. Public launch coordinated with consumer brand. |
| 5 | 2026-05-18 | Iris-shimmer promoted to primary accent on subsidiary | Family-recognition signal: same gradient as consumer wordmark, used aggressively instead of rationed. |
| 6 | 2026-05-18 | Mascot demoted to footer monogram on subsidiary | B2B audiences read mascots as consumer / playful. Mascot stays beloved on aesdr.com; near-invisible on `/teams/*`. |
| 7 | 2026-05-18 | Build ALL "build later" roadmap assets in this sprint | Avoids "we'll build it when a partner asks" awkwardness. Have full kit ready to send. |
| 8 | 2026-05-18 | Single small "for sales orgs →" footer link from main site to `/teams` | Per Antaeus: "auxiliary detached building." Minimal bridge; subsidiary is found via outbound, not consumer-funnel cross-promo. |
| 9 | 2026-05-18 | Add `/teams/*` routes to AdminChip dropdown BENEATH a divider line | Per Antaeus: keep admin nav clean; separated cluster for subsidiary. |
| 10 | 2026-05-18 | Hero stat triplet on landing uses real cited research numbers, not placeholders | "Built beautifully" + B2B credibility. See §15 for sources to verify before PR 1 ships. |
| 11 | 2026-05-18 | Powered-by-aesdr.com line in subsidiary footer is KEPT (not hidden) | Truthful positioning — subsidiary is the B2B face of the same product, not a different company. The honesty is itself a credential. |
| 12 | 2026-05-18 | Subsidiary nav INCLUDES a "← back to aesdr.com" link | Consistency with the "auxiliary detached building" framing — the building has a door back to the main one. |
| 13 | 2026-05-18 | Sub-logo treatment formalized — three forms (full / compact / tiny) with type-only construction | Editorial brand DNA. No icon glyph because the parent is type-based; adding an icon for the subsidiary would feel forced and break family resemblance. |
| 14 | 2026-05-18 | Downloadable PDFs implemented as print-friendly web pages under `/teams/downloads/*`, not as pre-generated binary PDF files | Beautiful PDF output requires design tooling not set up in this sandbox. Print-friendly web pages produce equivalent output via browser print-to-PDF, keep artifacts version-controlled, stay automatically in sync with site content, and read well both as PDF and on web. |

---

## 14. Open questions / TBDs

Surfaces that need answers as the build progresses. Captured here to prevent silent scope decisions.

| # | Question | Owner | Resolve before |
|---|---|---|---|
| 1 | Final per-seat rate for Custom Enterprise (50+ seats) | Antaeus | Before PR 2 ships `/teams/pricing` |
| 2 | White-label / co-branded wholesale rate | Antaeus | Same as #1 — informs `/teams/pricing` |
| 3 | Whether to use Calendly or another booking tool for "Book a walkthrough" CTAs | Antaeus | Before PR 2 ships (form submission lands them somewhere) |
| 4 | Whether to fully write all 12 lessons' learning outcomes vs. summarize from existing HTML | Claude | During PR 3 — depends on lesson content depth |
| 5 | Whether to mention specific named partner targets on `/teams/partners` page (e.g., "Docebo, Highspot, Sales Assembly") or stay category-only | Antaeus | Before PR 2 ships |
| ~~6~~ | ~~Whether subsidiary nav includes a "back to aesdr.com" link or stays self-contained~~ | ~~Antaeus~~ | ~~Resolved 2026-05-18 → §13.12: includes back link.~~ |
| 7 | Whether to add a Vercel preview password specifically for `/teams/*` so B2B prospects can preview without the consumer-brand bypass code | Antaeus | Optional — defer until first share-with-prospect happens |
| 8 | Whether the Manager Implementation Guide PDF should be public or gated (request via form) | Antaeus | Before PR 4 ships PDFs |
| 9 | Curriculum page: full lesson list reconciliation — `content/lessons/html/` shows lessons numbered 6.2, 7.3, 9.1 alongside 1.x–5.x — is the curriculum 12 lessons total or more? | Claude | Before PR 3 ships `/teams/curriculum` |
| 10 | Whether to register a separate domain for the subsidiary (e.g., `aesdr-os.com` or `teams.aesdr.com`) post-launch | Antaeus | Post-launch decision; not blocking |

---

## 15. Cited research — to verify before PR 1 ships

The landing hero stat triplet needs real sources. Below is the current intent; each must be verified with a primary or reputable secondary source before publication.

| Stat | Current intent | Source to verify | Notes |
|---|---|---|---|
| **9.1 months average SDR ramp time to full quota** | Cite Bridge Group's annual State of Sales Development report | bridgegroupinc.com — latest annual report | Bridge Group publishes free annual; figure varies year-to-year (8–11 mo range typical). Cite the year. |
| **39% first-year SDR turnover in SaaS** | Cite Bridge Group OR TOPO (now Gartner) | Bridge Group annual, or Gartner-TOPO Sales Development reports | Cross-check; pick the better-sourced of the two. |
| **$115K cost to recruit, ramp, and lose one SDR** | Composite figure from LinkedIn Talent + Bridge Group | LinkedIn Talent reports on cost-of-hire + Bridge Group fully-loaded SDR cost | Show the math in a tooltip or footnote: recruiting cost + ramp salary + opportunity cost. Don't cite a single number without sourcing. |

If verification can't produce confident numbers, alternative is to use industry-quoted ranges (e.g., "8–11 months typical ramp") with the source named in-line. **Do not ship invented numbers.**

---

## 16. Maintenance

This document is canon. Update it when:
- A decision in §13 changes (note the date, the original decision, and the reason for change)
- An open question in §14 gets resolved (move resolution into §13)
- The route structure (§4), per-page content briefs (§5), or asset inventory (§6) shifts
- A new partner category emerges that doesn't fit §7's five buckets
- The build sequence (§11) gets resequenced

When updating, increment a `Last revised` line at the top.

**Last revised:** 2026-05-18 (initial draft)
