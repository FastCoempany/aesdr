# D32 — Kill-or-Keep Decision Memo Template

**Deliverable:** One-page template the founder fills out post-pilot to decide whether to extend, revise, or end the partnership. Forces a written decision instead of a default-to-keep.
**Audience:** Internal — founder, ops. Not shared with the partner.
**Voice ratio:** 90 Rowan / 10 Michael. Verdict mode.
**Format:** Markdown source; renders to PDF one-pager per canon §6.5. Fillable in Notion/Sheets equivalent.
**Canon refs:** `AFFILIATE_BRAND_CANON.md` §1.3 (founding vineyard), §1.6 (honesty), §13 (honesty discipline), §16 (approval gates).

---

## Use

Filled out within 72 hours of the pilot's end (per `affiliate-seeding-deep-research-report.md` §Sample 30-day pilot timeline, days 23–27). Output: one of three decisions — **EXTEND**, **REVISE**, **KILL**. Once decided, drives the close-out conversation with the partner (D34, pending) and the postmortem (D33).

The point of the template is to make the decision *before* the relationship politics start. We write the memo, then we have the conversation, not the other way around.

---

## Template (canonical text — fill the brackets)

> *(Mono eyebrow)*
> `AESDR · KILL-OR-KEEP MEMO · [Partner slug] · [Pilot ID]`

> *(Display italic, ~36pt)*
> *Partner: [Partner name]*
> *Pilot: [Pilot ID, e.g., c_2026-05-apex]*
> *Decision: [EXTEND / REVISE / KILL]*

---

### 1. Numbers (filled from dashboard)

| Metric | Target | Actual | Δ |
|---|---|---|---|
| Registrations | [n] | [n] | [±] |
| Visit-to-register % | 20–35% | [n%] | [±] |
| Live attendance | [n] | [n] | [±] |
| Register-to-live % | 35%+ | [n%] | [±] |
| Replay watches | — | [n] | — |
| Offer clicks | — | [n] | — |
| Checkout starts | — | [n] | — |
| Purchases | — | [n] | — |
| Attendee-to-purchase % | 5%+ | [n%] | [±] |
| Refunds | 0 | [n] | [±] |
| Net revenue | — | [$] | — |
| Founder hours | [n] | [n] | [±] |
| CAC per partner | — | [$] | — |
| Effective hourly rate (net rev / founder hours) | — | [$/hr] | — |

### 2. Qualitative signal

Three sentences each. Specific. No "kind of" / "sort of."

- **What the partner did well:** [text]
- **What the partner did poorly:** [text]
- **What the audience showed us about ICP fit:** [text]
- **What the workshop delivery taught us about the deck or the offer:** [text]
- **What the follow-up sequence taught us about objection patterns:** [text]

### 3. Failure-mode check

Mark each that applies. Multiple applies → bias toward KILL.

- [ ] Partner missed promotion deliverables (skipped sends, posted late, omitted disclosures).
- [ ] Audience showed up but was off-ICP (tenure / role / industry mismatch).
- [ ] Audience didn't show up (registration thin, attendance thinner).
- [ ] Workshop ran clean but converted poorly (offer / pricing / framing problem, not partner problem).
- [ ] Compliance issue surfaced (claim violation, disclosure miss, consent question).
- [ ] Brand mismatch — partner promoted in a way that contradicted canon.
- [ ] Partner asked for terms that contradict the founding-vineyard model.
- [ ] Founder hours far exceeded plan; effective hourly rate is below the line.

### 4. Decision

Pick one. Fill the rationale.

#### EXTEND

Conditions for an EXTEND decision (any two are sufficient):

- Attendee-to-purchase ≥ 5% with a meaningful sample (n ≥ 25 attendees).
- Net revenue per founder hour exceeds the comparable hourly rate of running founder-direct outreach.
- Partner-quality signal: their audience produced higher-fit conversations than any baseline channel we have.
- Partner showed willingness to iterate on disclosure / promo cadence / workshop intro based on first-pilot learnings.

> Rationale (3–5 sentences): [text]
>
> Extension structure: [30-day extension / 60-day extension / cohort-specific extension]
> New terms (if any): [text]
> Required changes for v2: [text]

#### REVISE

Conditions for a REVISE decision:

- Numbers were close but missed; partner is willing to retest with adjustments.
- The partner-side execution was clean but the AESDR-side asset (deck, registration page, offer) needs work first.
- One specific compliance or brand issue — fixable, not structural.

> Rationale: [text]
>
> What changes before retest: [text]
> Who owns each change: [Founder / Ops / Partner]
> Retest date: [YYYY-MM-DD]

#### KILL

Conditions for a KILL decision (any one is sufficient):

- Repeated compliance issues during the pilot.
- Audience was structurally off-ICP and unlikely to change.
- Partner pushed for terms or vocabulary that contradict canon and won't relent.
- Effective hourly rate after one pilot is below what founder-direct outreach yields, with no plausible path to fix.
- Founder gut-check: this partner relationship is generating more friction than learning.

> Rationale: [text]
>
> Close-out tone: [neutral / warm / cold — defaults to neutral]
> Door open for future revisit? [Y / N — and if Y, conditions]
> Partner-facing message draft: [link to D34 — pending]

---

### 5. Lessons that survive the partner

Independent of EXTEND/REVISE/KILL — what does AESDR keep from this pilot regardless?

- **Deck change:** [text]
- **Registration-page change:** [text]
- **Email sequence change:** [text]
- **Offer change:** [text]
- **Operating change:** [text]

These get fed into the rolling objection log and into the next pilot's setup, regardless of whether this partner continues.

---

### 6. Sign-off

| Role | Name | Date |
|---|---|---|
| Founder | [Name] | [YYYY-MM-DD] |
| Ops (if applicable) | [Name] | [YYYY-MM-DD] |

Memo filed to: `docs/partner/pilots/[Partner-slug]/kill-or-keep--v1.pdf`

---

## Notes

- The template forces the founder to write the decision *before* the partner-facing conversation. This is on purpose. If a partner is great in the room but the numbers are clearly bad, the room will lie to you. The memo lies less.
- **The "effective hourly rate" line is load-bearing.** Founder time is a real cost. A partnership that converts but consumes 40 founder hours per closed sale is not a partnership; it's a part-time job.
- The "Lessons that survive the partner" section is the most important section in any KILL memo. We never lose a pilot without keeping something.
- **No emotion in the rationale.** Numbers and observed behavior. The partner-facing tone (warm/neutral/cold) gets to carry the relationship work; the memo carries the decision.

## Open

- Whether the memo template should be a Notion database row (fillable in-app) vs a markdown file per pilot. Default until decided: markdown file per pilot, in `docs/partner/pilots/[partner-slug]/`. Migrate to a structured tool if pilot count crosses 5.
- D34 (partner-facing close-out note, two versions — extend / kill) is referenced in §4 KILL — produce in next batch alongside D33.
- "Comparable hourly rate of founder-direct outreach" — needs a baseline number. Default until measured: $200/hr placeholder. Update once we have one direct-outreach pilot's data.
