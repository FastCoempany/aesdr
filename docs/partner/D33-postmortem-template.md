# D33 — Pilot Postmortem Template

**Deliverable:** Structured retrospective filled out per pilot. Captures *what we learned* independent of the EXTEND/REVISE/KILL decision in D32. Feeds the canon, the deck revision queue, the FAQ, and the next pilot's setup.
**Audience:** Internal — founder, ops, future-AESDR. Not shared with the partner.
**Voice ratio:** 70 Rowan / 30 Michael. Honest is the only tone that works.
**Format:** Markdown source; one file per pilot at `docs/partner/pilots/[partner-slug]/postmortem--v1.md`.
**Canon refs:** `AFFILIATE_BRAND_CANON.md` §1.4 (merciless mirror), §1.6 (honesty), §13.

---

## Use

Filled out within 7 days of the pilot's end, after the kill-or-keep memo (D32) and the partner-facing close-out (D34) are done. Postmortem comes *after* those two on purpose: the decision shouldn't be contaminated by retrospective second-guessing, and the partner shouldn't be in the room while we critique ourselves.

The postmortem is also the input to the rolling objection log and the canon revision queue. If a postmortem identifies a canon contradiction, the canon updates first; the deliverables follow.

---

## Template (canonical structure — fill the brackets)

> *(Mono eyebrow)*
> `AESDR · PILOT POSTMORTEM · [Partner slug] · [Pilot ID]`

> *(Display italic, ~36pt)*
> *Postmortem: [Partner name]*
> *Pilot dates: [YYYY-MM-DD] → [YYYY-MM-DD]*
> *Decision (from D32): [EXTEND / REVISE / KILL]*

---

### 1. Topline (one paragraph)

Three to five sentences. What happened, in plain English. No hedging.

> [text]

### 2. The numbers vs the plan

Lift from the D32 numbers section, plus annotate **why** each number landed where it did — not just *what* the number was.

| Metric | Plan | Actual | Why it landed there |
|---|---|---|---|
| Registrations | [n] | [n] | [text] |
| Live attendance | [n] | [n] | [text] |
| Attendee-to-purchase % | 5%+ | [n%] | [text] |
| Refunds | 0 | [n] | [text] |
| Net revenue | [$] | [$] | [text] |
| Founder hours | [n] | [n] | [text] |

### 3. What worked (be specific)

For each, name the artifact (the slide, the email, the line, the moment) — not the category.

- **In the registration page:** [text]
- **In the workshop:** [text]
- **In the deck:** [text]
- **In the offer:** [text]
- **In the follow-up sequence:** [text]
- **In the partner relationship:** [text]

### 4. What broke (be specific)

Same rule — name the artifact, not the category. If the answer is "the offer slide," say *which slide*, *which line*, *what the audience did when they hit it*.

- **First friction surface (the place attention dropped):** [text]
- **Highest-cost mistake (the thing that cost us the most conversion):** [text]
- **Compliance / disclosure issues, if any:** [text]
- **Brand-canon contradictions, if any:** [text]
- **Founder-time blowouts:** [text]

### 5. Objections heard (rolling log input)

Every real objection the audience raised — in chat, in Q&A, in email replies, in checkout-abandon DMs. Verbatim wherever possible.

| Objection (verbatim) | Source (chat / Q&A / email / call) | Frequency | Our current answer | Is the answer good? |
|---|---|---|---|---|
| [text] | [source] | [n] | [text or "none yet"] | [Y / N — explain] |
| [text] | [source] | [n] | [text or "none yet"] | [Y / N — explain] |
| [text] | [source] | [n] | [text or "none yet"] | [Y / N — explain] |

This table is the most important table in the doc. It's the founder-sales learning loop the report depends on. If we don't fill it honestly, we're optimizing a funnel we've never heard a buyer object to.

Migrate any new objections into:
- D23 (FAQ + objection sheet) — for buyer-facing surfaces.
- D5 (partner-objection reply bank) — for partner-side counter-asks.
- The deck (`Q&A preparation` slide) — for the host.

### 6. ICP fit assessment

Independent of revenue. The partner could have produced a money pilot with the wrong audience, or a low-money pilot with exactly-right audience. Both matter — and they tell us different things.

- **Tenure of attendees:** [first 1–2 years / mixed / mostly senior]
- **Role of attendees:** [SDR-heavy / AE-heavy / mixed / managers]
- **Company stage of attendees:** [pre-seed / seed–B / scale / mixed]
- **Geography:** [text]
- **Quality of Q&A questions:** [strong / mixed / weak — explain]
- **Verdict:** [tight ICP / acceptable ICP / off-ICP]

### 7. Brand audit

How did AESDR show up across the pilot's surfaces? One line each — be ruthless.

- **Did the registration page hold the canon?** [Y / N — note]
- **Did the deck hold the canon?** [Y / N — note]
- **Did the host hold both voices?** [Y / N — note]
- **Did the partner's promo hold the canon?** [Y / N — note]
- **Did the follow-up emails hold the canon?** [Y / N — note]
- **Were there any anti-canon moves we let slip?** [text]

### 8. Lessons we keep (canon revision queue)

For each, name the canon section affected and propose the change. These feed straight into the next canon revision.

| Canon section | Proposed change | Severity |
|---|---|---|
| §[n] | [text] | [low / med / high] |

### 9. Lessons for the next pilot

Same rule — specific, not abstract.

- **What we'll do differently in pilot setup:** [text]
- **What we'll do differently in the deck:** [text]
- **What we'll do differently in the offer:** [text]
- **What we'll do differently in the follow-up:** [text]
- **What we'll do differently in the partner relationship:** [text]
- **What we won't change (because it worked):** [text]

### 10. The single sentence

If a future-us has time to read one line of this postmortem and nothing else, what should it say?

> [text]

This sentence goes into the rolling pilot index at `docs/partner/pilots/_INDEX.md` (pending build).

---

### 11. Sign-off

| Role | Name | Date |
|---|---|---|
| Founder | [Name] | [YYYY-MM-DD] |
| Ops (if applicable) | [Name] | [YYYY-MM-DD] |

---

## Notes

- The §5 objection table is the most load-bearing piece of the postmortem. If a postmortem ships with §5 empty or vague, the postmortem hasn't actually been done.
- §10 ("the single sentence") is a forcing function. It's hard to write because it forces the founder to commit to one lesson. That's the point.
- **The brand audit (§7) is non-optional.** The whole reason we wrote the canon is to enforce it. A postmortem that lets canon contradictions slide is the start of brand drift.
- The postmortem is internal *only*. Do not share it with the partner — the partner gets D34 (the close-out note) and an honest summary in conversation, not the raw postmortem. Postmortems contain critiques of our own deck and our own offer that don't belong in a partner-facing surface.

## Open

- Pilot index file `docs/partner/pilots/_INDEX.md` doesn't exist yet — produce when first pilot ships, not before.
- Should there be a separate "founder-only" addendum for things too candid to share with ops? Default: no — if we can't say it in the postmortem, we shouldn't be acting on it. One source of truth per pilot.
- Whether the postmortem includes a section on partner economics (their commission, their cost-of-attention, their satisfaction). Default: yes, fold into §3 ("In the partner relationship") and §4 ("Founder-time blowouts"). No separate section unless data shows we need it.
