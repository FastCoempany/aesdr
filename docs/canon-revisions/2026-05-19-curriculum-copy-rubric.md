# Curriculum copy rubric

> **Status:** Active. Scoring standard for every lesson body copy in
> `content/lessons/html/` and every tool HTML in `tools/standalone-html/`.
> **Owner:** Antaeus Coe.
> **Last revised:** 2026-05-19.

The user direction: "Curriculum body copy quality needs to go from 6
to 9 minimum." This doc defines what 6 means, what 9 means, what 10
means, and how to get from one to the other lesson by lesson.

---

## Six-axis scoring

Each axis scored 0, 1, or 2. Total /12. Mapped to /10 via:
`score_out_of_10 = round((axis_total / 12) * 10)`.

### Axis 1 · Rhythm
Tests whether the prose reads aloud cleanly without three-short-
declaratives-in-a-row, telegraphic AI cadence, or fatigue-inducing
sentence-length monotony.

- **0** = consistently telegraphic OR consistently nested-clause-long. Reader stumbles.
- **1** = mostly OK, one or two stumble points per page.
- **2** = pass on R-G3 + R-G5. Sentence-length variation feels intentional.

### Axis 2 · Specificity
Tests whether the lesson names concrete people, situations, numbers,
named tools instead of leaning on abstract gummy nouns.

- **0** = the lesson could be re-titled "Sales 101" and not feel out of place.
- **1** = some specifics named, but key paragraphs rely on R-G4 manufactured concepts.
- **2** = every paragraph carries at least one concrete reference — a named tool, a real number, a specific situation.

### Axis 3 · AI-tell absence
Tests R-G7 hygiene + any pattern that reads as auto-generated.

- **0** = three-part lists, "let me explain," "it's not about X," "imagine X" openers all present.
- **1** = a few residual phrases but no structural AI-tells.
- **2** = nothing on the R-G7 blocklist. Reads like one human wrote it.

### Axis 4 · Sentence-end strength
Tests R-G2 — no trailing vague pronouns, no "etc." or "and so on," no
qualifier-trailing endings.

- **0** = multiple sentences end on "it," "this," "the rest," "etc.," "across the board."
- **1** = one or two violations per page.
- **2** = every sentence ends on a concrete noun, verb, or clause the reader doesn't have to back-reference.

### Axis 5 · Register consistency
Tests whether the lesson sustains operator-at-a-bar voice from open to
close, without drifting into motivation-engine or deck-writer register.

- **0** = register shifts more than once in the lesson. Or the entire lesson is the wrong register.
- **1** = register holds with one or two slips into formal/marketing copy.
- **2** = consistent operator voice. Occasional founder-voice aside is fine.

### Axis 6 · Earned brevity
Tests whether the prose is short where short is sharper and long where
long is needed — not telegraphic-as-default and not bloated-as-default.

- **0** = the lesson is over-pruned (every sentence under 10 words) or over-stuffed (every sentence over 25).
- **1** = decent length variation but at least one paragraph that should have been cut, or one that should have been expanded.
- **2** = every sentence pays its way.

---

## Score mapping

| Axis total /12 | /10 | Quality label | Action |
|---|---|---|---|
| 0–4 | 0–3 | Unshippable | Rewrite from scratch |
| 5–7 | 4–6 | Current floor | Targeted rewrite, axis by axis |
| 8–9 | 7–8 | Solid | Targeted polish on lowest axes |
| 10–11 | 9 | Ship-ready | Light final pass, then ship |
| 12 | 10 | Canonical | Reference for the rest |

**Target.** Every lesson scores 9/10 (10–11 on the rubric) minimum.
**Stretch.** At least three lessons hit 10/10 to serve as reference
specimens.

---

## Acceptance criteria per lesson

A lesson rewrite is acceptable for founder review when:

1. **No axis below 1.** A 9/10 average with a 0 on any single axis is
   still a fail — the weakest axis is the one a reader notices.
2. **Two-axis lift minimum from starting score.** Otherwise the
   rewrite hasn't done meaningful work.
3. **No R-G4 manufactured-concept terms** anywhere in the lesson.
4. **Read-aloud pass.** A founder-side review pass means: read three
   non-consecutive pages aloud. Stumble more than once across those
   three pages = back to me.
5. **Diff shows specific moves.** PR description names which axes
   were lifted and where. "I improved Lesson 3" is not a diff; "I
   rewrote sections 2 and 4 to lift Specificity from 0 to 2 and
   Rhythm from 1 to 2" is.

---

## What stays the same

The rubric only governs *copy*, not pedagogy. The lesson structure,
the order of ideas, the named tools, the questions asked, the
exercises offered — all unchanged unless the founder explicitly asks
for a pedagogical change. The rewrite is a voice patch, not a
curriculum rewrite.

The substantive risk of a copy-only rewrite: occasionally a
paragraph's *meaning* is gummy, not just its prose. In that case the
rewrite needs founder-side input on what the paragraph is trying to
say. Mark those paragraphs in PR comments with `[CONTENT QUESTION]`
and ship the rest.

---

## Per-lesson starting scores (estimated, pre-audit)

These are my read of the lessons against the rubric, based on the
prior browsing during the audit + behavioral deep-dive work. The
real audit happens during the sweep phase; these are predictions to
prioritise effort.

| Lesson | Title | Starting score (est.) | Axes likely below 1 |
|---|---|---|---|
| 01 | Building Real Camaraderie | 6/10 | Specificity, Earned brevity |
| 02 | Breaking Down Silos | 6/10 | Specificity, AI-tell |
| 03 | Performance Pitfalls | 7/10 | Sentence-end strength |
| 04 | Navigating Manager Madness | 6/10 | Specificity, Rhythm |
| 05 | The Sales Playbook | 5/10 | All except Register |
| 06 | Beyond the Sales Playbook | 6/10 | Specificity, Earned brevity |
| 07 | Prospecting & Pipeline | 6/10 | Specificity, Rhythm |
| 08 | The 30% Rule | 7/10 | AI-tell, Sentence-end strength |
| 09 | CRM Survival Guide | 6/10 | Specificity, Register |
| 10 | Compensation Realities | 7/10 | AI-tell, Sentence-end strength |
| 11 | Sober Selling | 8/10 | Sentence-end strength |
| 12 | Levelling Up SaaS Relationships | 7/10 | Specificity |

Highest-leverage rewrites: Lessons 5, 1, 2, 4, 6, 7, 9. These are
the ones where the lift from 6→9 is most visible.

Per-lesson estimated effort:
- Score 7 → 9: ~2 hours of focused rewrite per unit (3 units per lesson = 6 hours)
- Score 6 → 9: ~3 hours per unit (~9 hours per lesson)
- Score 5 → 9: ~4 hours per unit (~12 hours per lesson)

Rough total: ~95 hours of rewrite work across 36 units, before
founder-side review iteration. Realistic ship window: 4–6 weeks if
the founder review keeps pace.
