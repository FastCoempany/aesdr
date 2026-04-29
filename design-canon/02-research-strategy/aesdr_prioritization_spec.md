
# AESDR Prioritization Spec

## Document purpose

This document defines the full prioritization system for AESDR, including the canonical data model, scoring scales, formulas, UI sections, decision workflows, student-routing logic, instructor review logic, and implementation guidance.

The point is not to bolt a neat matrix onto a course and call it rigor. The point is to make prioritization a first-class capability inside AESDR so the system can tell the truth about three different realities:

1. **Curriculum roadmap prioritization** for what AESDR should build next.
2. **Student execution prioritization** for what a student should work on next.
3. **Instructor and system intervention prioritization** for what should be reviewed, corrected, escalated, or held back.

AESDR should function as a **judgment engine**, not a content shelf.

---

## Core principle

Do **not** treat prioritization frameworks as competitors. Treat them as a **decision chain**.

The recommended operating sequence is:

1. **Kano** identifies the value type.
2. **Feasibility–Desirability–Viability** tests whether the item is strategically sound.
3. **RICE** ranks the surviving options quantitatively once enough evidence exists.
4. **Impact–Effort Matrix** makes the result legible and discussable.
5. **MoSCoW** commits the shortlist into actual launch scope, lesson path, or intervention priority.

Each method does a different job:

- **Kano** = what kind of value this is
- **FDV** = whether it makes strategic sense
- **RICE** = how it compares numerically
- **Impact–Effort** = what deserves immediate attention
- **MoSCoW** = what actually gets included now

Do not flatten all of that into one fake master number and pretend the system discovered truth.

---

## Product scope

The prioritization capability should live inside a dedicated workspace called **AESDR Prioritization Studio**.

It must support the following classes of objects:

- lessons
- drills
- diagnostics
- student weaknesses
- remediation paths
- assessments
- coach interventions
- platform features
- launch assets
- curriculum backlog items

It must support the following views:

1. **Weakness Matrix** — Impact vs Effort for student correction
2. **Intervention Ranking** — RICE or RICE-like score view
3. **Curriculum Fitness** — Feasibility, Desirability, Viability
4. **Value Type** — Kano classification
5. **Launch Scope** — Must / Should / Could / Won’t
6. **Judgment Log** — historical decisions and rationale

Same object set. Different lenses. One object model.

---

# 1) Canonical object model

## 1.1 Primary object: `priority_item`

Every prioritizable item in AESDR should map to a single canonical object.

### Required fields

| Field | Type | Required | Description |
|---|---|---:|---|
| `priority_item_id` | UUID | Yes | Primary key |
| `title` | string | Yes | Clear short name for the item |
| `item_type` | enum | Yes | `lesson`, `drill`, `diagnostic_gap`, `student_action`, `coach_intervention`, `assessment_item`, `curriculum_feature`, `launch_asset`, `remediation_path`, `submission_review`, `research` |
| `problem_statement` | text | Yes | What problem or deficiency exists now |
| `desired_outcome` | text | Yes | What success should look like after correction or build |
| `primary_user_role` | enum | Yes | `beginner_student`, `career_switcher`, `sdr_student`, `ae_student`, `advanced_student`, `coach`, `admin`, `system` |
| `surface` | enum | Yes | `diagnostic`, `lesson_player`, `worksheet`, `drill_arena`, `mock_call_lab`, `student_briefing`, `coach_console`, `review_queue`, `launch_admin`, `global` |
| `context` | enum | Yes | `curriculum`, `student_execution`, `intervention`, `launch`, `ad_hoc` |
| `status` | enum | Yes | `draft`, `scoring`, `review`, `approved`, `deferred`, `rejected`, `active`, `completed`, `archived` |
| `owner_user_id` | UUID | Yes | Current accountable owner |
| `created_at` | timestamp | Yes | Created timestamp |
| `updated_at` | timestamp | Yes | Last modified timestamp |

### Recommended fields

| Field | Type | Description |
|---|---|---|
| `summary` | text | 1–3 sentence explanation |
| `source_origin` | enum | `manual`, `diagnostic_result`, `quiz_result`, `submission_review`, `coach_note`, `behavior_signal`, `system_generated`, `curriculum_review`, `launch_review` |
| `source_reference_ids` | array<string> | IDs or links to supporting evidence |
| `linked_student_id` | UUID | student associated with this item, if applicable |
| `linked_module_id` | UUID | linked lesson or module |
| `linked_submission_id` | UUID | linked drill, mock call, or assessment submission |
| `target_metric` | string | metric expected to improve |
| `time_horizon` | enum | `today`, `this_week`, `this_module`, `this_launch`, `next_launch`, `long_term` |
| `urgency_level` | enum | `low`, `medium`, `high`, `critical` |
| `pathway_label` | string | e.g. `Discovery`, `Cold Outreach`, `Tonality`, `Objection Handling` |
| `notes` | text | free-form working notes |

### Canonical interpretation

The same object model should cover:

- a curriculum item you may build
- a weakness the student must correct
- a next action the student should take
- a coach intervention that needs review
- a launch or scope decision for the course itself

---

## 1.2 Evidence object: `priority_item_evidence`

Every major score should be anchored to evidence. No orphan scoring.

| Field | Type | Required | Description |
|---|---|---:|---|
| `evidence_id` | UUID | Yes | Primary key |
| `priority_item_id` | UUID | Yes | Linked item |
| `evidence_type` | enum | Yes | `diagnostic_answer`, `quiz_result`, `worksheet_review`, `mock_call_transcript`, `rubric_score`, `coach_note`, `peer_review`, `self_assessment`, `behavior_signal`, `completion_data`, `launch_feedback`, `founder_judgment` |
| `title` | string | Yes | Brief label |
| `body` | text | Yes | What the evidence says |
| `source_url` | string | No | Link or deep link to internal object |
| `confidence_level` | enum | Yes | `measured`, `estimated`, `speculative` |
| `submitted_by_user_id` | UUID | Yes | Who added it |
| `created_at` | timestamp | Yes | Timestamp |

### Rules

- Each item should require at least **1 evidence item** before entering `review`.
- Each item should require at least **2 evidence items** before `approved` if `item_type` is `curriculum_feature`, `drill`, `remediation_path`, or `coach_intervention`.
- Any score marked as `measured` must point to at least one assessment, rubric, or behavior-signal source.

### Interpretation by context

- **Curriculum context**: evidence may be pilot results, student drop-off, completion data, or founder judgment.
- **Student execution context**: evidence may be a diagnostic answer, failed rubric row, skipped module, or poor mock call transcript.
- **Intervention context**: evidence may be repeated low performance, weak self-assessment accuracy, or lack of improvement despite activity.

---

## 1.3 Score object: `priority_item_scores`

Scores should not live only as raw columns on the primary row. They must be stored historically.

| Field | Type | Required | Description |
|---|---|---:|---|
| `score_id` | UUID | Yes | Primary key |
| `priority_item_id` | UUID | Yes | Linked item |
| `score_context` | enum | Yes | `curriculum`, `student_execution`, `intervention`, `launch`, `ad_hoc` |
| `impact_score` | decimal(4,2) | No | 1.00–5.00 |
| `effort_score` | decimal(4,2) | No | 1.00–5.00 |
| `reach_score` | decimal(8,2) | No | raw or normalized based on context |
| `confidence_multiplier` | decimal(4,2) | No | 0.50–1.00 |
| `feasibility_score` | decimal(4,2) | No | 1.00–5.00 |
| `desirability_score` | decimal(4,2) | No | 1.00–5.00 |
| `viability_score` | decimal(4,2) | No | 1.00–5.00 |
| `rice_score` | decimal(12,4) | No | Computed |
| `fdv_total` | decimal(6,2) | No | Computed |
| `matrix_quadrant` | enum | No | `quick_win`, `big_bet`, `fill_in`, `money_pit`, `unclassified` |
| `kano_class` | enum | No | See Kano section |
| `moscow_class` | enum | No | See MoSCoW section |
| `scored_by_user_id` | UUID | Yes | Human or system actor |
| `scoring_notes` | text | No | Why the score was assigned |
| `created_at` | timestamp | Yes | Timestamp |

### Storage rule

- The latest active scores may be denormalized onto `priority_items` for fast rendering.
- Historical rows must always be preserved.

---

## 1.4 Decision object: `priority_item_decisions`

| Field | Type | Required | Description |
|---|---|---:|---|
| `decision_id` | UUID | Yes | Primary key |
| `priority_item_id` | UUID | Yes | Linked item |
| `decision_type` | enum | Yes | `approve`, `defer`, `reject`, `activate_now`, `research_more`, `split_scope`, `reclassify`, `archive`, `route_student`, `escalate_to_coach`, `suppress` |
| `decision_summary` | text | Yes | Decision statement |
| `decision_rationale` | text | Yes | Why this decision was made |
| `dissent_notes` | text | No | Disagreement or caution notes |
| `chosen_method` | enum | Yes | `impact_effort`, `rice`, `fdv`, `kano`, `moscow`, `combined` |
| `decided_by_user_id` | UUID | Yes | Who locked the decision |
| `locked_at` | timestamp | Yes | Timestamp |

### Rule

Any item moved to `approved`, `deferred`, `rejected`, `active`, `completed`, or routed into a remediation path must create a decision record.

---

# 2) Exact scoring scales

## 2.1 Impact score

Impact measures the expected value if the item succeeds.

Use a **1–5 scale**.

| Score | Label | Definition |
|---|---|---|
| 1 | Negligible | Barely noticeable effect on student capability, course quality, completion, or launch integrity |
| 2 | Low | Limited improvement; narrow value; mostly cosmetic |
| 3 | Moderate | Meaningful improvement to a real skill, learning path, or operating constraint |
| 4 | High | Strong lift to student performance, completion quality, course usefulness, or launch readiness |
| 5 | Transformational | Corrects a fatal weakness or materially changes student outcomes, course differentiation, or business viability |

### Curriculum guidance

- **1** = cosmetic polish or side content
- **3** = clear usefulness for a real learning path
- **5** = affects readiness, completion, conversion, retention, or core differentiation

### Student-execution guidance

- **1** = tiny improvement or non-bottleneck issue
- **3** = meaningful skill lift
- **5** = corrects a major blocker to becoming competent in-role

---

## 2.2 Effort score

Effort measures implementation difficulty, practice load, emotional resistance, and operational burden.

Use a **1–5 scale**.

| Score | Label | Definition |
|---|---|---|
| 1 | Tiny | Very small lift; low production or practice burden |
| 2 | Small | Clear task; modest creation or training effort |
| 3 | Medium | Multi-step work with material cognitive load |
| 4 | Large | Significant work, resistance, or review burden |
| 5 | Massive | High-complexity or high-friction item requiring substantial time, review, or orchestration |

### Curriculum mapping

| Score | Approximate effort band |
|---|---|
| 1 | < 1 day to build |
| 2 | 1–3 days |
| 3 | 1–2 weeks |
| 4 | 2–6 weeks |
| 5 | 6+ weeks or heavy cross-functional / media / review requirements |

### Student-action mapping

| Score | Approximate effort band |
|---|---|
| 1 | < 10 minutes |
| 2 | 10–30 minutes |
| 3 | 30–90 minutes |
| 4 | 90 minutes–1 day |
| 5 | multi-day, multi-submission, or emotionally difficult repetition |

### Special note

For student actions, effort is not only time. It also includes embarrassment, resistance, and real practice discomfort. A mock call is often more expensive than a worksheet even if the clock says otherwise.

---

## 2.3 Reach score

Reach is how many students, modules, capabilities, or workflows are likely to be affected in a defined time period.

### For curriculum items

Use absolute expected reach over a standard period such as a launch cohort or rolling 30-day use window.

Examples:
- number of students affected
- number of lessons affected
- number of failure patterns affected
- number of review surfaces affected

### For student-execution and intervention items

Use normalized reach bands.

| Score | Definition |
|---|---|
| 1 | affects one narrow weakness or one assignment |
| 2 | affects a few related behaviors |
| 3 | affects a meaningful skill cluster |
| 4 | affects many repeated student behaviors or multiple modules |
| 5 | affects broad readiness across the course or multiple high-stakes skill areas |

---

## 2.4 Confidence multiplier

Confidence must be explicit and mathematical.

| Label | Multiplier | Definition |
|---|---:|---|
| Very Low | 0.50 | Mostly instinct; little evidence |
| Low | 0.65 | Weak evidence or conflicting signals |
| Medium | 0.80 | Some evidence; incomplete validation |
| High | 0.90 | Good evidence; low uncertainty |
| Very High | 1.00 | Strong repeated evidence from real performance or usage |

### UI rule

Never show a high score without showing confidence. A loud conclusion with weak evidence is just dressed-up guessing.

---

## 2.5 Feasibility score

| Score | Definition |
|---|---|
| 1 | not realistically buildable or deliverable with current constraints |
| 2 | possible but operationally painful |
| 3 | feasible with tradeoffs |
| 4 | straightforward with current resources |
| 5 | highly feasible and low risk |

### AESDR interpretation

Feasibility should consider:
- content production burden
- review burden
- support burden
- platform complexity
- instructor time required
- ability to scale while maintaining quality

---

## 2.6 Desirability score

| Score | Definition |
|---|---|
| 1 | little evidence students want or need this |
| 2 | weak pull or narrow relevance |
| 3 | clear need for a meaningful segment |
| 4 | strong demand or strong relief of student pain |
| 5 | urgent, repeated, undeniable need |

### AESDR interpretation

Do not confuse “this feels pleasant” with “this is desirable.” The most desirable course element may be a hard diagnostic that students initially resist but desperately need.

---

## 2.7 Viability score

| Score | Definition |
|---|---|
| 1 | poor business case or strategic fit |
| 2 | unclear business upside |
| 3 | plausible business value |
| 4 | strong business rationale |
| 5 | exceptional strategic, conversion, retention, referral, or pricing value |

### AESDR viability factors

- improves completion
- improves outcomes
- improves credibility
- reduces support drag
- supports positioning
- increases conversion from free diagnostic to paid course
- justifies price
- makes the course more durable as a product

### FDV total

`fdv_total = feasibility_score + desirability_score + viability_score`

Maximum = 15.

### FDV gating recommendation

| FDV Total | Recommendation |
|---|---|
| 13–15 | strong candidate |
| 10–12 | viable but review carefully |
| 7–9 | questionable; needs tighter scope or better evidence |
| 3–6 | weak candidate; do not proceed without major change |

---

## 2.8 Kano classes

Support both **full Kano** and **operational Kano**.

### Full Kano enum

- `basic`
- `performance`
- `delighter`
- `indifferent`
- `reverse`
- `questionable`

### Operational UI grouping

- **Table Stakes** = `basic`
- **Performance Driver** = `performance`
- **Differentiator** = `delighter`
- **Ignore / Avoid** = `indifferent`, `reverse`, `questionable`

### AESDR examples

- **Basic**: clear lesson navigation, good audio, defined terms, obvious next step
- **Performance**: better drills, stronger feedback, sharper rubrics, better roleplay realism
- **Delighter**: mirror diagnostic, individualized next-action routing, brutally accurate weakness triage
- **Indifferent**: decorative fluff, vanity progress toys
- **Reverse**: too much theory, too many inspirational detours, bloated side content

---

## 2.9 MoSCoW classes

- `must_have`
- `should_have`
- `could_have`
- `wont_have_now`

### Operational definitions

| Class | Definition |
|---|---|
| Must Have | required for launch integrity, student usability, trust, or outcome quality |
| Should Have | important but course can launch or student can proceed without it |
| Could Have | useful but discretionary |
| Won’t Have Now | intentionally excluded from the current launch, sprint, or training path |

---

## 2.10 Matrix quadrant rules

Default quadrants should be derived from impact and effort using a 1–5 scale.

### Simple threshold

- **High impact** = `impact_score >= 3.5`
- **Low effort** = `effort_score <= 2.5`
- **High effort** = `effort_score >= 3.0`
- **Low impact** = `impact_score < 3.5`

### Quadrants

| Quadrant | Rule |
|---|---|
| `quick_win` | high impact + low effort |
| `big_bet` | high impact + high effort |
| `fill_in` | low impact + low effort |
| `money_pit` | low impact + high effort |

### AESDR interpretation

- **Quick win** = a fix or drill that meaningfully improves student performance without huge burden
- **Big bet** = a major skill overhaul or large build that is worth doing but requires discipline
- **Fill-in** = useful filler, not urgent
- **Money pit** = high-friction, low-return motion masquerading as serious work

---

# 3) Composite formulas

## 3.1 RICE formula

Use the standard formula:

`RICE = (Reach × Impact × Confidence) / Effort`

Where:
- `Reach` = raw count or normalized value
- `Impact` = 1–5
- `Confidence` = 0.50–1.00
- `Effort` = 1–5

### Curriculum mode example

- Reach = 120 students
- Impact = 4
- Confidence = 0.90
- Effort = 3
- RICE = 144

### Student-action mode example

- Reach = 3
- Impact = 5
- Confidence = 0.80
- Effort = 1
- RICE = 12

### Rule

Do not compare a curriculum RICE of 144 to a student-action RICE of 12 as if they belong to the same universe. Always show context.

---

## 3.2 Optional summary sort score

If a compact sort score is needed inside one context, use:

`Priority Summary Score = ((Impact × Confidence) + (FDV Total / 3)) / Effort`

Use this only for internal list sorting within one context. Do not present it as the system’s final judgment.

---

# 4) Context-specific operating models

## 4.1 Context A: Curriculum roadmap prioritization

### Goal

Decide what AESDR should build, revise, split, or cut next.

### Typical objects

- core diagnostic
- lesson modules
- drill environments
- review systems
- rubric packs
- mock call tooling
- submission UX
- launch assets
- support systems
- founder-facing content

### Recommended method order

1. Kano
2. FDV
3. RICE
4. Impact–Effort
5. MoSCoW

### Review questions

- Is this table stakes, a performance driver, or a differentiator?
- Do students truly need this?
- Is it actually deliverable well?
- Does it improve outcomes or just look sophisticated?
- Will it help launch integrity, completion, referrals, or conversion?
- Is the evidence real or just founder appetite?

### Output

- prioritized curriculum backlog
- approved launch list
- deferred list
- items to split or kill
- judgment log artifact

---

## 4.2 Context B: Student execution prioritization

### Goal

Decide what a student should do next.

### Typical objects

- next lesson
- next drill
- remediation worksheet
- mock call assignment
- vocabulary review
- objection handling exercise
- cold open repetition
- discovery repair drill

### Recommended method order

1. Impact–Effort
2. RICE-like action score
3. weekly commitment bucket

### UI behavior

- system detects candidate actions
- system estimates impact and effort
- system shows confidence level and supporting evidence
- top actions are surfaced visually in a **Student Briefing**
- student commits actions into `Today`, `This Week`, or `Later`
- result is logged

### Example

- `Do 15-minute cold-open tonality drill`
  - impact = 4
  - effort = 1
  - confidence = 0.85
  - quadrant = quick_win

- `Record full mock discovery call and review transcript`
  - impact = 5
  - effort = 4
  - confidence = 0.90
  - quadrant = big_bet

- `Redesign LinkedIn banner`
  - impact = 1
  - effort = 2
  - confidence = 0.95
  - quadrant = fill_in or money-pit adjacent distraction

---

## 4.3 Context C: Instructor and system intervention prioritization

### Goal

Decide what requires coach review, system override, escalation, or suppression.

### Typical objects

- student repeatedly failing same rubric row
- mismatch between self-assessment and actual performance
- repeated lesson replays without improvement
- skipping high-priority drills
- strong effort on low-value tasks
- stagnation after activity
- low confidence but high urgency weakness

### Recommended method order

1. Evidence review
2. FDV for structural interventions
3. RICE or RICE-like ranking for intervention queue
4. Impact–Effort for human review and triage

### Key rule

Confidence must be first-class. If the system is uncertain, it should lower rank, ask for more evidence, or mark the item as requiring coach confirmation.

No fake certainty.

---

# 5) UI specification

## 5.1 AESDR Prioritization Studio layout

### Primary navigation tabs

1. **Backlog**
2. **Weakness Matrix**
3. **Intervention Ranking**
4. **Curriculum Fitness**
5. **Value Type**
6. **Launch Scope**
7. **Judgment Log**

### Global filters

- context
- surface
- owner
- status
- item type
- pathway
- confidence level
- student
- module
- date range

### Global actions

- create item
- import items
- bulk score
- bulk classify
- save review snapshot
- export CSV
- export markdown summary
- open review mode

---

## 5.2 Backlog view

### Purpose

Master table of all course, student, and intervention items.

### Columns

- title
- type
- context
- pathway
- student (if applicable)
- owner
- status
- impact
- effort
- RICE
- FDV
- Kano
- MoSCoW
- quadrant
- confidence
- updated_at

### Row actions

- open detail drawer
- edit item
- add evidence
- score item
- classify Kano
- assign MoSCoW
- route to student path
- route to coach queue
- archive

### Bulk actions

- assign owner
- change status
- bulk classify
- bulk export
- bulk route to review queue

---

## 5.3 Weakness Matrix view

### Purpose

Visual prioritization by impact vs effort.

### Elements

- 2D scatterplot
- quadrant labels:
  - Quick Wins
  - Big Bets
  - Fill-Ins
  - Money Pits
- point size optional based on reach
- point color based on item type or status
- point stroke thickness based on confidence

### Interaction

- click point opens item drawer
- drag point allowed only in manual scoring mode
- hover shows mini-card with problem, recommendation, and evidence count
- filter by student, pathway, module, or coach

### Right-side panel

- selected item summary
- evidence list
- latest scores
- recommendation
- decision history
- next move

---

## 5.4 Intervention Ranking view

### Purpose

Rank comparable items numerically.

### Components

- sortable table
- formula breakdown inline
- confidence indicator pill
- context badge

### Required display fields

- reach
- impact
- confidence
- effort
- RICE score
- evidence count
- updated date

### Warning behavior

If `confidence_multiplier < 0.80`, show a caution marker.

---

## 5.5 Curriculum Fitness view

### Purpose

Strategic fitness review for course elements.

### Components

- triad scorecards
- total score
- rationale text block
- blockers panel

### Required fields

- feasibility
- desirability
- viability
- FDV total
- reasons
- linked evidence

---

## 5.6 Value Type view

### Purpose

Classify items by satisfaction logic.

### Layout

Grouped swimlanes:
- Table Stakes
- Performance Drivers
- Differentiators
- Ignore / Avoid

### Card content

- title
- class
- explanation
- evidence count
- last reviewed date

---

## 5.7 Launch Scope view

### Purpose

Turn prioritization into launch or sprint decisions.

### Layout

Four-column board:
- Must Have
- Should Have
- Could Have
- Won’t Have Now

### Rules

- drag-and-drop supported
- moving an item to `Must Have` requires rationale if effort >= 4
- moving an item to `Won’t Have Now` requires note if impact >= 4

---

## 5.8 Judgment Log view

### Purpose

Permanent memory for why judgments were made.

### Row fields

- item title
- decision type
- chosen method
- rationale
- dissent notes
- decided by
- date

### Importance

This prevents strategic amnesia and makes student-routing decisions legible later.

---

# 6) Student-facing surfaces

## 6.1 Student Briefing

### Purpose

Tell the student what matters next.

### Required sections

1. **Top priority now**
2. **Why this matters**
3. **Evidence behind the recommendation**
4. **Impact / Effort / Confidence**
5. **Recommended next action**
6. **Estimated time**
7. **Commit now / defer / ask for review**

### Sample logic

`If high-impact weakness exists with confidence >= 0.80 and effort <= 2.5, surface as immediate quick win.`

### Example output

- Priority: Discovery listening
- Why: three recent submissions show over-talking and poor pain excavation
- Impact: 5
- Effort: 2
- Confidence: 0.90
- Next Action: do `Pain Excavation Drill 01`
- Estimated Time: 18 minutes

---

## 6.2 Student Path board

### Purpose

Turn recommendations into a visible execution path.

### Buckets

- Today
- This Week
- Later
- Completed

### Rules

- system may recommend default placement
- student may override
- overrides must be logged
- repeated deferral of the same high-impact item should create an intervention signal

---

## 6.3 Student Signal Console

### Purpose

Rank signals by action value, not novelty.

### Candidate signals

- skipped high-priority lesson
- repeated lesson replay without improvement
- late submission
- failed rubric row repeated
- self-assessment mismatch
- strong effort on low-value tasks
- stagnation after heavy activity
- repeated avoidance of mock calls

### Required output

For each signal:
- signal summary
- severity
- likely root cause
- recommended action
- confidence
- whether coach review is needed

---

# 7) Detail drawer / item page

Every priority item needs a full detail surface.

## Sections

1. **Header**
   - title
   - type
   - context
   - status
   - owner
   - surface

2. **Problem & outcome**
   - problem statement
   - desired outcome
   - pathway
   - target metric

3. **Evidence**
   - evidence list
   - evidence quality tags
   - add evidence button

4. **Scoring**
   - impact
   - effort
   - reach
   - confidence
   - FDV
   - RICE

5. **Classification**
   - Kano
   - MoSCoW
   - quadrant

6. **Routing**
   - student path placement
   - coach queue placement
   - module or remediation path linkage

7. **Decision history**
   - previous decision cards

8. **Notes**
   - scoring notes
   - why now
   - why not now
   - dissent notes

9. **Actions**
   - approve
   - defer
   - reject
   - activate now
   - request more evidence
   - split into child items
   - escalate to coach
   - archive

---

# 8) Workflow logic

## 8.1 Create item flow

### Trigger

User clicks `Create item` or system generates an item from a signal, assessment result, or submission review.

### Steps

1. User chooses context and item type.
2. User enters title, problem statement, desired outcome, surface, role, and owner.
3. System creates item in `draft`.
4. User or system attaches initial evidence.
5. Item appears in Backlog.

### Validation

Do not allow blank problem statement or desired outcome.

---

## 8.2 Scoring flow

### Trigger

User clicks `Score item` or batch-scoring begins.

### Steps

1. User selects scoring context.
2. System presents the relevant scoring form.
3. User enters impact, effort, reach, confidence, and FDV values as appropriate.
4. System computes derived fields.
5. System assigns quadrant.
6. System saves score history row.
7. Item status moves from `draft` to `scoring` if appropriate.

### Rules

- `impact_score` and `effort_score` required for Matrix view.
- `reach_score`, `impact_score`, `confidence_multiplier`, `effort_score` required for RICE view.
- all of `feasibility_score`, `desirability_score`, `viability_score` required for FDV view.

---

## 8.3 Review flow

### Trigger

User enters review mode or coach/curriculum review begins.

### Steps

1. System filters items by context.
2. Reviewer inspects Matrix, RICE, FDV, and Kano in sequence.
3. Reviewer discusses evidence quality.
4. System flags low-confidence high-impact items.
5. Reviewer assigns or confirms MoSCoW class.
6. Reviewer saves summary notes.
7. Status moves to `review`.

### Critical flags

Items should be flagged when:
- impact >= 4 and confidence < 0.80
- FDV total <= 8 and MoSCoW = `must_have`
- Kano = `indifferent` but impact >= 4
- effort >= 4 and no operational evidence attached
- student item has been deferred 3+ times despite impact >= 4
- system-generated intervention has no measured evidence

---

## 8.4 Decision flow

### Trigger

User clicks `Approve`, `Defer`, `Reject`, `Activate now`, `Route student`, or `Escalate to coach`.

### Steps

1. System opens decision modal.
2. User selects decision type.
3. User enters summary and rationale.
4. Optional dissent or caution notes may be added.
5. System writes decision record.
6. System updates status.
7. If student-related, item is placed into path or queue.
8. If curriculum-related, item may be added to launch board or backlog sprint.

### Required rationale conditions

Require rationale when:
- rejecting an item with impact >= 4
- approving an item with FDV total <= 9
- assigning `must_have` to an item with effort >= 4
- routing a student into a hard remediation path
- escalating a student with confidence < 0.80
- shipping a feature with weak evidence

---

## 8.5 Split-scope flow

### Purpose

When an item is too broad, break it into child items.

### Logic

1. User clicks `Split into child items`.
2. Parent remains as umbrella item.
3. Child items inherit context, pathway, and surface.
4. Each child gets its own scoring and evidence.
5. Parent shows aggregate status.

### AESDR examples

A lesson called `Mastering Discovery` may be split into:
- opening control
- pain excavation
- listening discipline
- summarizing back
- next-step control

This makes the course more surgical and prevents obese lesson blobs.

---

## 8.6 Student recommendation flow

### Goal

Tell the student what to do next based on evidence.

### Inputs

- diagnostic profile
- pathway status
- quiz performance
- rubric scores
- submission history
- behavior signals
- completion patterns
- self-assessment data

### Steps

1. System generates candidate actions.
2. System estimates impact and effort.
3. System applies confidence from evidence quality.
4. System computes ranking.
5. Top actions are rendered in Student Briefing.
6. Student accepts, edits, or dismisses.
7. Accepted action becomes tracked work.
8. Dismissal or repeated deferral may create an intervention signal.

### Acceptance signals

- student opened action
- student completed linked asset
- student submitted drill
- student marked action complete
- performance improved after action
- coach validated improvement

---

## 8.7 Coach intervention flow

### Goal

Decide which student issues deserve human attention.

### Inputs

- repeated weakness patterns
- repeated avoidance
- poor self-assessment accuracy
- stagnation despite activity
- confidence mismatch
- failed submission chains

### Steps

1. System scores intervention candidates.
2. System ranks candidates in coach queue.
3. Coach opens highest-priority cases first.
4. Coach approves suggested intervention or overrides it.
5. Decision is logged.
6. Student path is updated accordingly.

### Example interventions

- force prerequisite drill before next module
- assign short corrective worksheet
- require mock call before progression
- prompt coach feedback
- suppress low-value optional content until bottleneck is fixed

---

# 9) Decision rules and automation rules

## 9.1 Auto-tagging rules

### Quick Win

Auto-tag as `quick_win` when:
- impact >= 4
- effort <= 2
- confidence >= 0.80

### Big Bet

Auto-tag as `big_bet` when:
- impact >= 4
- effort >= 3

### Money Pit

Auto-tag as `money_pit` when:
- impact <= 2.5
- effort >= 3

### Requires Evidence

Auto-flag when:
- no evidence exists
- confidence is `speculative`
- item is older than 14 days and still in `draft`
- student weakness is being routed with no measured signal

---

## 9.2 Student routing rules

### Route to immediate action when:
- impact >= 4
- confidence >= 0.80
- effort <= 2.5
- no prerequisite blocker exists

### Route to big-bet sequence when:
- impact >= 4
- effort >= 3
- confidence >= 0.80
- weakness affects multiple modules or readiness

### Route to coach review when:
- impact >= 4 and confidence < 0.80
- repeated deferrals >= 3
- repeated failure despite completion
- self-assessment differs from rubric by >= 2 points on average
- behavior suggests avoidance rather than ignorance

### Suppress or down-rank when:
- impact <= 2
- effort >= 3
- item is primarily cosmetic
- item is a distraction from a more urgent weakness

---

## 9.3 Launch approval gates

### Gate A: Course launch approval

Require:
- Kano class assigned
- FDV total present
- RICE present or explicitly skipped with note
- at least 2 evidence items for all `must_have` items
- owner assigned

### Gate B: Student-path recommendation release

Require:
- impact, effort, confidence assigned
- evidence linked
- rationale present
- prerequisite logic defined

### Gate C: Automated intervention release

Require:
- feasibility >= 3
- confidence >= 0.80
- human override path defined
- failure mode note defined
- judgment log creation enabled

---

# 10) Permissions and roles

## Suggested permissions

| Role | Create | Score | Classify | Route | Decide | Archive |
|---|---:|---:|---:|---:|---:|---:|
| Admin | Yes | Yes | Yes | Yes | Yes | Yes |
| Curriculum Owner | Yes | Yes | Yes | Yes | Yes | Yes |
| Coach | Yes | Yes | Yes | Yes | Yes | No |
| Contributor | Yes | Yes | Suggest only | Suggest only | No | No |
| Student | No | No | No | Accept / defer own items only | No | No |
| System | Yes | Suggest only | Suggest only | Suggest only | No | No |

### Rule

System-generated classifications, routes, or intervention suggestions must be human-overridable.

---

# 11) Analytics instrumentation

Prioritization itself should be instrumented.

## Required events

- `priority_item_created`
- `priority_item_updated`
- `priority_evidence_added`
- `priority_item_scored`
- `priority_item_kano_classified`
- `priority_item_moscow_assigned`
- `priority_item_reviewed`
- `priority_decision_logged`
- `priority_item_split`
- `weakness_matrix_opened`
- `intervention_ranking_opened`
- `student_briefing_opened`
- `student_recommendation_accepted`
- `student_recommendation_deferred`
- `student_recommendation_dismissed`
- `coach_intervention_approved`
- `coach_intervention_overridden`
- `launch_scope_updated`

## Event properties

- `priority_item_id`
- `item_type`
- `context`
- `surface`
- `linked_student_id`
- `pathway_label`
- `status_before`
- `status_after`
- `impact_score`
- `effort_score`
- `rice_score`
- `fdv_total`
- `confidence_multiplier`
- `kano_class`
- `moscow_class`

### Why this matters

You are not just prioritizing work. You are instrumenting whether the prioritization system itself creates better student outcomes and better product decisions.

---

# 12) MVP build recommendation

## MVP must include

1. canonical priority item model
2. evidence model
3. score model
4. Weakness Matrix view
5. Intervention Ranking table
6. Curriculum Fitness view
7. Launch Scope board
8. Judgment Log
9. item detail drawer
10. manual scoring workflow
11. Student Briefing
12. basic student routing logic

## V2 should include

1. Student Signal Console
2. coach intervention queue
3. dynamic thresholding for quadrants
4. compare score revisions over time
5. prerequisite-aware routing
6. collaborative review sessions
7. stronger self-assessment mismatch detection
8. richer export support

## V3 can include

1. agent-generated intervention memos
2. what-if simulation for path changes
3. confidence decay when evidence goes stale
4. predictive routing based on prior outcomes
5. custom prioritization templates by pathway
6. cohort-level prioritization analytics

---

# 13) Suggested database schema sketch

```sql
create table priority_items (
  priority_item_id uuid primary key,
  title text not null,
  item_type text not null,
  problem_statement text not null,
  desired_outcome text not null,
  summary text,
  primary_user_role text not null,
  surface text not null,
  context text not null,
  status text not null default 'draft',
  owner_user_id uuid not null,
  source_origin text,
  source_reference_ids jsonb default '[]'::jsonb,
  linked_student_id uuid,
  linked_module_id uuid,
  linked_submission_id uuid,
  target_metric text,
  time_horizon text,
  urgency_level text,
  pathway_label text,
  notes text,
  latest_impact_score numeric(4,2),
  latest_effort_score numeric(4,2),
  latest_reach_score numeric(8,2),
  latest_confidence_multiplier numeric(4,2),
  latest_feasibility_score numeric(4,2),
  latest_desirability_score numeric(4,2),
  latest_viability_score numeric(4,2),
  latest_rice_score numeric(12,4),
  latest_fdv_total numeric(6,2),
  latest_matrix_quadrant text,
  latest_kano_class text,
  latest_moscow_class text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table priority_item_evidence (
  evidence_id uuid primary key,
  priority_item_id uuid not null references priority_items(priority_item_id) on delete cascade,
  evidence_type text not null,
  title text not null,
  body text not null,
  source_url text,
  confidence_level text not null,
  submitted_by_user_id uuid not null,
  created_at timestamptz not null default now()
);

create table priority_item_scores (
  score_id uuid primary key,
  priority_item_id uuid not null references priority_items(priority_item_id) on delete cascade,
  score_context text not null,
  impact_score numeric(4,2),
  effort_score numeric(4,2),
  reach_score numeric(8,2),
  confidence_multiplier numeric(4,2),
  feasibility_score numeric(4,2),
  desirability_score numeric(4,2),
  viability_score numeric(4,2),
  rice_score numeric(12,4),
  fdv_total numeric(6,2),
  matrix_quadrant text,
  kano_class text,
  moscow_class text,
  scored_by_user_id uuid not null,
  scoring_notes text,
  created_at timestamptz not null default now()
);

create table priority_item_decisions (
  decision_id uuid primary key,
  priority_item_id uuid not null references priority_items(priority_item_id) on delete cascade,
  decision_type text not null,
  decision_summary text not null,
  decision_rationale text not null,
  dissent_notes text,
  chosen_method text not null,
  decided_by_user_id uuid not null,
  locked_at timestamptz not null default now()
);
```

---

# 14) UI copy recommendations

## Empty state copy

"Add a lesson, weakness, or intervention. Attach evidence. Score it honestly. Decide whether it deserves oxygen."

## Warning copy for low-confidence high-impact item

"This looks important, but the confidence is weak. Right now this is conviction wearing a fake badge. Add evidence or lower your certainty."

## Decision confirmation copy for Must Have with high effort

"You are labeling a large item as Must Have. If that is true, explain why launch or student progression should bend around it."

## Decision confirmation copy for rejecting high-impact item

"This item is scored as high impact. If you are rejecting it, capture the logic so future-you does not have to guess what present-you thought."

## Student deferral warning

"You have deferred a high-impact correction again. That may be caution, or it may be avoidance. Pick one honestly."

---

# 15) Product-specific recommendations for AESDR

## 15.1 Where prioritization should appear first

The first embedded use of this system should appear in:

1. **Student Briefing**
   - recommend the highest-leverage next action
2. **Weakness Matrix**
   - visualize the student’s actual bottlenecks
3. **Coach Console**
   - rank which students or issues deserve human review
4. **Curriculum review workspace**
   - prioritize what the course needs next
5. **Launch admin**
   - decide what makes the cut for release

## 15.2 What should not happen

Do not reduce the course to a content menu.

Do not hide evidence behind secondary clicks.

Do not let the system sound more certain than the data deserves.

Do not let `must_have` become a junk drawer for founder anxiety.

Do not let students substitute effort theater for skill correction.

## 15.3 Most important design stance

Evidence should sit close to the score.

Reasoning should sit close to the decision.

The student’s actual weakness should stay more visible than the course’s content inventory.

If those three things are true, the system will feel like judgment infrastructure instead of decorative course software.

---

# 16) Recommended implementation order

## Phase 1

- canonical priority item model
- evidence records
- score records
- Weakness Matrix
- item detail drawer
- manual scoring
- Judgment Log

## Phase 2

- Intervention Ranking table
- Curriculum Fitness view
- Launch Scope board
- Student Briefing
- filters and saved views
- export support

## Phase 3

- Student Path board
- Student Signal Console
- coach intervention queue
- auto-flagging logic
- collaborative review mode

## Phase 4

- system-generated student-action recommendations
- automated confidence scoring
- recommendation acceptance feedback loop
- predictive prioritization refinement

---

# 17) Final recommendation

For AESDR, build prioritization as a **multi-method system** with one canonical item model, evidence-first scoring, explicit confidence, human-overridable routing, and a dedicated Prioritization Studio.

Use:
- **Kano** to identify value type
- **FDV** to test strategic fitness
- **RICE** to rank comparable opportunities
- **Impact–Effort** to visualize what deserves attention now
- **MoSCoW** to convert judgment into launch scope, learning path scope, and intervention scope

The goal is not to make the course look sophisticated.

The goal is to make AESDR better at telling the truth about what matters, what is noise, and what the student must face next.
