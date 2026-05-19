# Curriculum copy rubric

> **Status:** Active. Scoring standard for every lesson body copy in
> `content/lessons/html/` and every tool HTML in `tools/standalone-html/`.
> **Owner:** Antaeus Coe.
> **Last revised:** 2026-05-19 (v2 — rewritten after every example in
> v1 used the language the canon is supposed to ban).

The user direction: curriculum body copy needs to move from 6 to 9
minimum on a ten-point scale. This doc defines what 6 means, what 9
means, what 10 means, and how to score every unit in the curriculum
against the same six axes so two readers come to the same score.

---

## Six-axis scoring

Each axis is scored 0, 1, or 2. Total out of 12. Mapped to /10 with
the table at the bottom of this section.

### Axis 1 — Sentence-length variety

Does the paragraph mix sentence lengths, or stack three short ones in
a row?

| Score | Meaning |
|---|---|
| 0 | Three or more consecutive sentences under eight words in any paragraph. Or every sentence over 25 words. Reader fatigues. |
| 1 | Mostly fine; one or two stumble points per page. |
| 2 | Sentence-length variation reads as intentional, not telegraphic. A second-year SDR could read the page aloud at a bar without stumbling. |

### Axis 2 — Specificity

Are paragraphs anchored to real people, real times, real numbers, and
named tools — or are they anchored to abstract single-word nouns?

| Score | Meaning |
|---|---|
| 0 | The lesson would survive being re-titled "Sales 101." Paragraphs lean on words like *the move*, *the verdict*, *the play*, *the wedge* without naming what those refer to. |
| 1 | Some specifics named; a few key paragraphs still lean on the gummy nouns from R-G4. |
| 2 | Every paragraph names at least one concrete reference: a tool (Apollo, Salesforce, the AESDR Alignment Contract), a number (the 9% reply rate, the 80-dial day, the 22% win rate), a role (your CFO, your champion, your VP), a time (Tuesday morning, Friday at 4pm), or a situation (the QBR, the 1:1, the bad-month conversation). |

### Axis 3 — AI-tell absence

Does the prose carry the structural signatures of auto-generated marketing copy?

| Score | Meaning |
|---|---|
| 0 | Three-part lists ("Faster. Smarter. Better.") present. "It's not about X. It's about Y." paragraph openers present. Paragraphs end on one-line thesis restatements. Em-dash count exceeds two per paragraph. |
| 1 | A few residual AI-tell phrases ("at its core," "ultimately") survive but no structural cadences. |
| 2 | Nothing on the R-G7 phrase blocklist. No three-beat cadences. No "imagine X" openers. Reads as one human wrote it. |

### Axis 4 — How sentences end

Does the last word of each sentence anchor to a concrete noun, or
trail into a pronoun the reader has to back-reference?

| Score | Meaning |
|---|---|
| 0 | Multiple sentences in the lesson end on *it*, *this*, *the rest*, *etc.*, *and so on*, *across the board*. |
| 1 | One or two sentence-end violations per page. |
| 2 | Every sentence ends on a concrete noun, a named verb, or a specific clause. The reader doesn't have to scroll up. |

### Axis 5 — Register consistency

Does the lesson stay in operator voice from open to close, or does
it drift into deck-writer or motivation-engine register?

| Score | Meaning |
|---|---|
| 0 | Register shifts more than once across the lesson. Or the whole lesson is in the wrong register (motivational, corporate, academic). |
| 1 | Operator voice holds with one or two slips into formal or marketing prose. |
| 2 | Operator voice from open to close. A founder-voice aside (parenthetical, occasional first-person) is allowed and welcome. |

### Axis 6 — Paid sentences

Does every sentence pay its way, or are paragraphs padded with
filler (or over-pruned into telegraph)?

| Score | Meaning |
|---|---|
| 0 | The lesson is either bloated (every sentence over 25 words, several paragraphs that could be cut without loss) or over-pruned (every sentence under 10 words, no breathing room). |
| 1 | Decent length variation, but at least one paragraph that should have been cut or one that should have been expanded. |
| 2 | Every sentence earns its place. Cut anything more and meaning drops. Add anything more and pace drops. |

---

## Score mapping

| Axis total /12 | Mapped to /10 | Quality label | Action |
|---|---|---|---|
| 0–4 | 0–3 | Unshippable | Rewrite from scratch |
| 5–7 | 4–6 | Current floor | Targeted rewrite, axis by axis |
| 8–9 | 7–8 | Solid | Polish on the lowest axes |
| 10–11 | 9 | Ship-ready | One final pass, then ship |
| 12 | 10 | Canonical | Use as reference for the rest |

**Target.** Every lesson scores at least 9/10. No axis at 0.
**Stretch.** Three lessons reach 10/10. Those become reference units
the others get compared against.

---

## Acceptance criteria per lesson

A unit rewrite is ready for founder review when:

1. **No axis below 1.** A 9/10 average with a 0 on any single axis
   is a fail. The weakest axis is the one a reader notices first.
2. **Two-axis lift minimum from starting score.** Otherwise the
   rewrite hasn't done meaningful work.
3. **Zero R-G4 manufactured-concept terms** anywhere in the unit.
4. **Read-aloud pass.** Open the unit, pick three non-consecutive
   pages, read them aloud. More than one stumble across those three
   pages sends the unit back.
5. **Diff annotation.** The PR description names which axes were
   lifted, where in the unit each lift happened, and any sentence
   whose meaning (not just style) changed during the rewrite. Style
   rewrites pass automatically; meaning changes need founder review.

---

## What stays the same in a rewrite

The rubric governs prose, not pedagogy. The order of ideas, the named
tools, the questions asked, the exercises offered — all unchanged
unless the founder asks for a pedagogical change. A copy rewrite is a
voice patch, not a curriculum rebuild.

Occasionally a paragraph's *meaning* is gummy, not just its prose. In
those cases, mark the paragraph in the PR with `[CONTENT QUESTION]`
and ship the rest of the unit. Founder answers the content question
in review; the next rewrite cycle resolves it.

---

## Per-lesson starting scores (estimated, pre-audit)

These scores are pre-audit estimates from earlier passes across the
curriculum. The real audit happens during the sweep. The numbers are
here to prioritise effort, not to argue about during review.

| Lesson | Title | Pre-audit /10 | Axes likely below 1 |
|---|---|---|---|
| 01 | Building Real Camaraderie | 6 | Specificity, Paid sentences |
| 02 | Breaking Down Silos | 6 | Specificity, AI-tell absence |
| 03 | Performance Pitfalls (SDR) / Surviving AE Management (AE) | 7 | Sentence endings |
| 04 | Navigating Manager Madness | 6 | Specificity, Sentence-length variety |
| 05 | The AE/SDR Playbook | 5 | All axes except Register |
| 06 | Beyond the Sales Playbook | 6 | Specificity, Paid sentences |
| 07 | Prospecting & Pipeline | 6 | Specificity, Sentence-length variety |
| 08 | The 30% Rule | 7 | AI-tell absence, Sentence endings |
| 09 | CRM Survival Guide | 6 | Specificity, Register |
| 10 | Compensation Realities | 7 | AI-tell absence, Sentence endings |
| 11 | Sober Selling | 8 | Sentence endings |
| 12 | Levelling Up SaaS Relationships | 7 | Specificity |

Highest-leverage rewrites: Lessons 5, 1, 2, 4, 6, 7, 9. Those are
where a 6 → 9 lift is most visible.

Estimated effort per unit by starting score:
- 7 → 9: ~2 hours of focused rewrite per unit (~6 hours per lesson)
- 6 → 9: ~3 hours per unit (~9 hours per lesson)
- 5 → 9: ~4 hours per unit (~12 hours per lesson)

Total across 36 units: ~95 hours of rewrite work before founder review
iteration. Realistic ship window: 4–6 weeks if founder review keeps
pace with three units per week.
