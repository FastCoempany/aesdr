# D39 — Case-Study Template

**Deliverable:** Template for AESDR's canonical case-study format. Used post-pilot to codify what worked, what didn't, and what the partnership taught AESDR — in a register that's externally shareable (with permission) and internally durable (the case study survives the partner). One template; multiple instances per partner; the most useful artifact AESDR produces for future-partner conversations.
**Audience:** Two intended audiences, same source document with different render permissions:
- **Internal** — AESDR-controlled artifact filed at `docs/partner/pilots/[PARTNER_SLUG]/case-study--v1.md`. Used during D27 vetting calls with prospective new partners ("here's how a similar archetype's pilot ran") and during ambassador-conversion conversations.
- **External (with explicit partner approval)** — a partner-cleared version may be shipped publicly: AESDR's `/case-studies` page (when warranted), partner-promo collateral, conference / podcast contexts. **Partner sign-off on the external version is required per canon §16; the external version is a redacted/condensed render of the internal source.**
**Voice ratio:** 80 Rowan / 20 Michael per canon §3.3 (verdict mode). The internal version runs slightly more 90/10 (closer to D33 register); the external version runs 80/20 (closer to D26 register). Same template generates both.
**Format:** Markdown source. Renders to (1) internal markdown reference filed in pilot folder, (2) external PDF case-study one-pager (when partner-approved), (3) external HTML page on `aesdr.com/case-studies/[PARTNER_SLUG]` (when warranted by post-launch traffic).
**Use timing:** Filled out within 14 days of pilot end — after D32 (kill-or-keep), D34 (close-out), and D33 (postmortem). Per canon §1.6 + §16, the case study is a separate artifact from D33; D33 is internal critique with anti-canon callouts, D39 is the codified what-worked register.
**Canon refs:** `AFFILIATE_BRAND_CANON.md` §1.4 (borrowed trust), §1.5 (operator over guru), §1.6 (honesty discipline), §3.3 (voice ratios), §10.2 (approved claims — case-study claims must be approved), §10.3 (forbidden claims), §13 (honesty discipline), §16 (approval gates).

> **Placeholder convention:** `[PARTNER_NAME]`, `[PARTNER_SLUG]`, `[PILOT_ID]`, `[PILOT_DATES]`, `[PARTNER_ARCHETYPE]`, `[FOUNDER_FIRST_NAME]`, plus pilot-specific numeric placeholders. Internal version retains full names; external version uses `[PARTNER_NAME]` only when partner approves naming, otherwise paraphrases archetype.

---

## Why a case study is different from a postmortem

D33 (postmortem) is internal critique. It includes "what broke," "anti-canon moves we let slip," and "lessons that survive the partner." It's not safe to share externally — it contains analysis the partner shouldn't read.

D39 (case study) is codification. It captures *what the pilot taught AESDR* in a register that's safe to share with a future-partner-prospect or — with the partner's signoff — to publish externally.

| Postmortem (D33) | Case study (D39) |
|---|---|
| Internal-only | Internal source + partner-approvable external |
| Includes failure analysis | Includes only what landed (or what didn't, framed honestly) |
| References AESDR-side mistakes specifically | Names AESDR-side learnings without scapegoating |
| Filed within 7 days post-pilot | Filed within 14 days post-pilot, after D33 informs it |
| Never shared with partner | Partner-cleared version may be shared with permission |
| Depth-first | Distillation-first |

A case study without a postmortem is marketing. A postmortem without a case study is private knowledge that doesn't compound. Both ship.

---

## Template

> *(Mono eyebrow, top of file)*
> `AESDR · CASE STUDY · [PILOT_ID] · v1`

> *(Display italic, ~32pt)*
> *Case study: [PARTNER_NAME] × AESDR pilot*

> *(Body context line, --serif 14pt italic)*
> *[PILOT_DATES] · Partner archetype: [PARTNER_ARCHETYPE] · Filed [YYYY-MM-DD]*

---

### 1. The pilot at a glance (3-sentence summary)

> *(--serif italic 16pt, --ink — single paragraph)*

Three sentences. Plain English. What the pilot was, what landed, what AESDR keeps.

> Pilot summary: [text]

**Internal version** is more direct. **External version** is structurally identical but reads as operator-to-operator partner-recommendation register.

**Worked example (internal):**
> *AESDR ran a 30-day pilot with the Apex BDR Club community in May 2026. The pilot delivered 47 enrollments at 78% attendance, with refund rate at 2%; the audience-fit signal was tight (verbatim Q&A questions tracked the early-career SDR ICP within 1-2 years tenure). AESDR keeps the pricing-window cadence and the workshop-deck `Pipeline Integrity` framework as it ran; revisits the Lesson 04 preview clip's title slide for v2.*

**Worked example (external):**
> *In May 2026, AESDR partnered with the Apex BDR Club for a 30-day pilot — one live workshop, a 72-hour replay, and a partner-attributed enrollment window. The pilot reached 47 enrollments with 78% attendance and a 2% refund rate. AESDR is keeping the model — workshop-first, partner-co-branded, time-boxed, non-exclusive.*

---

### 2. Partner archetype + ICP fit

> *(--serif 16pt body)*

| Field | Value |
|---|---|
| Partner archetype | `[community / coach / creator / alumni / hybrid]` |
| Audience size (verifiable) | [n] |
| Audience platform | [text] |
| ICP fit verdict (from D33 §6) | `[tight / acceptable / off]` |
| Why this archetype fits AESDR | [3-4 sentences — operating logic, not marketing] |

The "why this archetype fits AESDR" beat is the codification. It's the answer AESDR gives a future-partner-prospect from the same archetype: *"Here's why pilots in your bucket land where they land — in the operating logic, not in vibes."*

---

### 3. What we did

> *(--serif 16pt body, 5-7 bullets)*

The structural sequence of the pilot, partner-side and AESDR-side, with named-deliverable references for traceability.

- **Pre-pilot:** Partner passed D27 vetting at [score]. Pilot terms signed (D22). Kit handed off ([N_DAYS] before promotion window).
- **Promotion week 1:** Partner sent `09a-newsletter-launch.md` template-derived launch on [date]. AESDR built D26 partner-promo page. UTM trail from `11-tracking-links.md` confirmed live.
- **Promotion week 2:** Partner sent reminder `09b`. AESDR began D17 high-intent DM outreach to T1/T2 triggered prospects.
- **Workshop day:** Partner delivered 2-min intro per `09c`. AESDR host delivered D09 deck. [N] live attendees; [N] chat questions logged.
- **Replay window:** D14 sent to no-shows. D15 + D16 sent to attendees-who-clicked-but-didn't-checkout. D17 outreach against T3/T4 triggers.
- **Pricing-window close:** D18 deadline-window email sent. Pilot-pricing closed at [timestamp].
- **Pilot close:** D32 kill-or-keep memo: [decision]. D34 partner-facing close-out sent. D33 postmortem filed.

This sequence is the same across pilots; the case study captures *which beats landed harder than expected and which underperformed expectations.*

---

### 4. Numbers (lifted from D32 §1, pilot-window-final)

> *(Table; --cond headers, --serif body)*

| Metric | Plan / baseline | Actual | Note |
|---|---|---|---|
| Page views | — | [n] | |
| Registrations | [n] | [n] | |
| Visit-to-register % | 20-35% | [n%] | |
| Live attendance | [n] | [n] | |
| Register-to-live % | ≥35% | [n%] | |
| Replay watches | — | [n] | |
| Offer-page views | — | [n] | |
| Checkout starts | — | [n] | |
| Purchases | [n] | [n] | |
| Attendee-to-purchase % | ≥5% | [n%] | |
| Refunds | 0 | [n] | (Refund rate: [n%]) |
| Net revenue | — | [$X] | After refunds + fees. |
| Commission accrued (Partner) | — | [$Y] | |
| Founder hours | — | [n] | |
| Effective hourly rate | — | [$/hr] | Net rev / founder hours. |

**Internal version** carries every row. **External version** strips Founder hours + Effective hourly rate (those are AESDR-internal economics; partner doesn't see them in published case studies).

**Per canon §10.2 approved claims:** Numbers above are observational data from the pilot, not promises about future pilots. **Per canon §10.3:** No income claims about the partner's audience members; no per-rep revenue projections.

---

### 5. What worked (3-5 named beats)

> *(--display italic 700, 22pt for each header; --serif 16pt body)*

For each, **name the artifact** — not the category. If the answer is "the offer slide," say which slide, which line, what the audience did when they hit it.

> **— [Beat 1, e.g., "The 'three things free content cannot do' frame in D15."]** [3-5 sentences naming what specifically worked, with evidence — e.g., reply rate to the email, conversion lift on the offer page after attendees received it.]
>
> **— [Beat 2]** [text]
>
> **— [Beat 3]** [text]

Each beat is canonical for the archetype. AESDR can lift "this is what landed in [archetype] pilots" into the next D27 conversation with a similar partner-archetype prospect.

---

### 6. What was harder than expected (the honest version)

> *(--serif 16pt body, 2-4 bullets)*

Per canon §13, the case study names what was harder. **Not** failure analysis (that's D33). What's appropriate here: the bumps that were real but recoverable, in the operator-to-operator register.

> - **Specific challenge:** [text — what was harder than the pre-pilot estimate suggested]
> - **What AESDR adjusted:** [text — what changed in real-time during the pilot]
> - **What carries forward:** [text — the operating change that's now canon for future pilots]

The discipline: **no scapegoating.** Per canon §1.6, the partner is an operator; if the partner-side execution was hard, frame it as operating-fit signal that AESDR needs to surface earlier in vetting (D27 update), not as partner failure.

---

### 7. What we'd do differently next time

> *(--serif 16pt body, 2-4 bullets)*

Operating changes only. Not "we wish the partner had more reach" — that's not actionable. *"We'd start the L&D-brief sends 48 hours earlier"* is actionable.

> - [text]
> - [text]
> - [text]

**Internal version** includes every change. **External version** strips changes that imply AESDR-side mistakes specifically (those go in D33). Keeps changes that read as ongoing operating discipline.

---

### 8. Quotes (with permission)

> *(--display italic 28pt for partner quote; --cond eyebrow attribution)*

If the partner explicitly approves a quote (per canon §16 + D27 conversation), it lands here. **No quote without written approval.** **No approximate quotes.** Verbatim only.

> *"[PARTNER_QUOTE_VERBATIM]"*
>
> `— [PARTNER_QUOTE_ATTRIBUTION] · [PARTNER_NAME]`

Per canon §10.3, partner quotes that imply income / outcomes / promises are forbidden — even if the partner offers them. AESDR may decline a quote the partner enthusiastically offers if it crosses canon §10.3.

If no quote is approved, **omit this section entirely** — no "no quote available" placeholder. Per canon §13, an absent quote reads as honest; a placeholder reads as missing.

---

### 9. AESDR-internal learnings (internal version only)

> *(--serif 16pt body, 3-5 bullets — INTERNAL VERSION ONLY)*

This section appears only in the internal version of the case study. It is **stripped** from any external version.

- **Canon revision flagged:** [reference to D35 intake if any]
- **Deliverable updates:** [list any D-files that need editing as a result of this pilot — typically minor, sometimes substantive]
- **D27 scorecard delta vs reality:** [where the v0 scorecard pre-pilot expectation was wrong; calibration input for future scorecards]
- **Canon-phrase rotation:** [any new candidate canonical phrase emerged in the pilot — for canon §14 update]
- **Compliance / legal observations:** [anything counsel should review]

This is the codification layer. Reading 5 case studies' §9 sections back-to-back is what should drive canon-revision PRs (D35).

---

### 10. Status of partner relationship after pilot

> *(--serif 16pt body, 2 sentences)*

Single line, two outcomes:

> **Status:** `[Pilot only / Extended (running pilot 2) / Ambassador (per D36) / Sunset (per D34 KILL or D36 sunset)]`
>
> **Rationale:** [1 sentence — what status, why, what's next]

Internal version captures full status. External version (when shipped) typically only includes "Pilot only" or "Ambassador" — extension and sunset are private status.

---

### 11. Sign-off

| Role | Name | Date |
|---|---|---|
| Founder | `[FOUNDER_FIRST_NAME]` | `[YYYY-MM-DD]` |
| Partner principal (external version only) | `[PARTNER_PRINCIPAL_NAME]` | `[YYYY-MM-DD]` |

Internal version: founder signs alone.

External version: partner principal sign-off is **required**. The partner-side approval covers (a) the quote in §8 if any, (b) any mention of partner-internal data, and (c) the case study's overall framing. Per canon §16, no external publication without dual sign-off.

Filed to: `docs/partner/pilots/[PARTNER_SLUG]/case-study--v1.md` (internal source) + `case-study--external--v1.md` (partner-approved external render, if any).

---

## Render-target permissions matrix

| Section | Internal | External (partner-approved) |
|---|---|---|
| 1. Pilot at a glance | Yes (direct register) | Yes (partner-recommendation register) |
| 2. Partner archetype + ICP fit | Yes (full) | Yes (without internal scoring rubric) |
| 3. What we did | Yes | Yes (named-deliverable references generalized) |
| 4. Numbers | Yes (full) | Yes (Founder hours + EHR stripped) |
| 5. What worked | Yes | Yes |
| 6. What was harder | Yes | Yes (with partner approval — can be sensitive) |
| 7. What we'd do differently | Yes (full) | Partial (changes that imply AESDR mistakes only stripped) |
| 8. Quotes | Yes (with approval) | Yes (with approval) |
| 9. AESDR-internal learnings | Yes | **STRIPPED** entirely |
| 10. Partner status | Yes | Partial (extension + sunset stripped) |
| 11. Sign-off | Founder only | Founder + Partner |

---

## Visual treatment notes

**Layout pattern:** Internal version is markdown reference doc. External PDF version follows canon §8.5 PDF anatomy. External HTML version (when warranted) follows canon §6.3 white-panel-on-cream pattern with editorial split hero on `aesdr.com/case-studies/[PARTNER_SLUG]`.

**Palette:**
- Background: `--cream`.
- Type: `--ink` body, `--muted` for table headers and mono eyebrow.
- Section headers: `--cond` 11pt 700, .15em, uppercase, `--ink`.
- Document title: `--display` italic 700, 32pt.
- "What worked" beats (§5 anchors): `--display` italic 700, 22pt, `--ink`.
- Numbers in §4 (when emphasized in external HTML render): `--display` italic 700, 18pt, `--ink`. Not crimson — case-study numbers are information, not alarm.
- Partner quote (§8): `--display` italic 700, 28pt, `--ink`.
- Partner attribution: `--cond` 11pt, .15em, uppercase, `--muted`.
- Hairline rules between sections: `--light` 1px.

**Type tokens:** Per palette above. No Caveat — case studies are codification register, not voice surfaces. Michael register stays in audience-facing surfaces (canon §3.4).

**Iconography:** None. Type-only.

**Iris usage:** None on internal version. On external HTML render — single iris CTA at the bottom: `Talk to AESDR about a pilot →` linking to a contact form. Per canon §6.4 single-CTA-per-surface.

**Deliberate departures from canon:** None.

**Five-question check (canon §6.9.1):**
1. **Thumbnail at 200×200:** Cream + display italic title + mono eyebrow + clean tables + partner quote = identifiably AESDR (codification register). Pass.
2. **Token check:** Pass.
3. **Iris reservation:** Pass — zero (internal); single CTA (external HTML).
4. **Icon discipline:** Pass — type-only.
5. **Voice thumbnail:** *"AESDR ran a 30-day pilot with the Apex BDR Club community in May 2026. The pilot delivered 47 enrollments at 78% attendance, with refund rate at 2%; the audience-fit signal was tight."* — passes; verdict-shaped Rowan, identifiably AESDR. The "audience-fit signal was tight" framing is the canonical operator-to-operator register.

---

## Compliance check (canon §10)

- **FTC §10.1:** External version, when published, names AESDR's commercial relationship with the partner (the pilot's commercial structure is in the case study itself, so disclosure is implicit; explicit footer added if hosted on a public AESDR page). **Pass conditional on render.**
- **Approved claims (§10.2):** Numbers in §4 are pilot-specific observational data. The "what worked" beats in §5 are observational. **Pass.**
- **Forbidden claims (§10.3):** No "if you partner with AESDR your audience will earn $X" / "AESDR pilots produce N% conversion guaranteed" framing. The case study reports what happened in *this* pilot, not what will happen in others. **Pass.**

---

## Forward dependencies

This template depends on:
- **D32 kill-or-keep memo** — §4 numbers lift from D32. **Met.**
- **D33 postmortem** — informs §6 and §7; the case study is filed *after* D33 so D33's analysis can be distilled. **Met.**
- **D34 partner-facing close-out** — partner-side relationship status (§10) reflects D34 outcome. **Met.**
- **D27 partner vetting scorecard** — §2 archetype data + §9 scorecard-vs-reality delta. **Met.**
- **D36 ambassador-conversion playbook** — §10 status references ambassador conversion as a possible outcome. **Met.**
- **D37 reporting dashboard** — §4 numbers source. **Spec shipped; implementation pending.**

This template is a forward dependency for:
- **D38 launch announcement** — case-study data substantiates the launch claims. The launch announcement does not lift case studies verbatim, but it claims they exist; case studies must be filed before D38 ships.
- **`aesdr.com/case-studies` archive** (when warranted) — externally-published case studies live there.
- **Future D27 vetting calls** — case studies of similar archetype pilots are pulled into the conversation as operating-context.

---

## Open

- **External publication threshold.** Default: **partner-approved version only**, never auto-published. Internal source filed regardless. Ratio expected: ~1-in-3 pilots produces an external case study; the rest stay internal codification.
- **Whether to publish redacted external versions** that anonymize the partner. Default: **no**. An anonymized external case study reads as fabricated; the value is in named partner specificity. If the partner declines naming, the case study stays internal — that's a reasonable outcome.
- **Whether to ship a "trends across N pilots" meta-case-study**. Default: **not in v1.** Cohort-level trends live in D37 dashboard's View 3 (internal). A public-facing trends document would either reveal cross-partner data (canon §12 confidentiality) or be vague enough to be marketing fluff. Reconsider only after 10+ pilots.
- **External case study lifespan.** Default: external case studies are evergreen on `aesdr.com/case-studies/[PARTNER_SLUG]`, with a date prominent in the eyebrow. After 2 years, the case study is reviewed for currency and either refreshed or archived (with a redirect to a successor case study).
- **Partner ability to redact** specific data points from the external version. Default: **yes, on request, within reason.** Partner may redact quote, redact specific numbers, redact archetype detail. AESDR may decline to publish if the redactions remove enough that the case study becomes vague. Per canon §13.
- **Whether to cross-link case studies in subsequent partner kits** (D40). Default: **yes, for similar-archetype pilots.** A new partner from the community-operator archetype gets the prior community-operator case study (or a similar one) referenced in their kit's `00-canon-excerpt.md` or in the §1 welcome of D40. Specific case-by-case based on the new partner's vetting conversation.
