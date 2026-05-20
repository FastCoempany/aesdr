# 2026-05-20 — Curriculum Residual Deep-Clean Plan

**Status:** Plan. Awaiting execution sign-off.
**Scope:** All 36 curriculum HTML files (`content/lessons/html/lesson-{01..12}/aesdr_course{01..12}_{1,2,3}_v1.html`).
**Calibration anchor:** Unit 3.2 wholesale rewrite (Batch 8f, commit `81db323`). "Pithy" telegraphic cadence is an AI-tell to eradicate, not a virtue to preserve.

---

## Why this plan exists

Batches 8e–8s covered cover taglines and completion-screen strings (`comp-big`, `comp-sub`, `comp-h`, `comp-p`) across all 36 units, plus Section 1 body + kp commandment-bodies in Lessons 1–4 deeply (and Lesson 2/3 second-pass). What got skipped in the Lessons 5–12 sweeps to keep velocity up:

1. Section 2 + Section 3 body strings (`lp`, `kp`, `lie-a`)
2. Interactive instruction strings (`silo-instr`, `seq-instr`, `cls-instr`, `blame-instr`, `sa-instr`, `fm-instr`, `plan-instr`, `tx-instr`, `mv-instr`, `sk-instr`, `vis-instr`, `ap-instr`, `rr-instr`, `recipe-instr`, etc.)
3. Per-unit homework gate prompts inside `init()` JS (`AESDR.gate(...)` configs)
4. Quiz question wording and answer options
5. Sidebar mottos (`sidebarMotto`)
6. Section headers (`lh-title`, `lh-sub`)
7. Interactive data array `why:` / `result:` explanatory strings
8. Tool table descriptive cells

These represent the long tail of choppy-cadence surfaces. The deep clean closes the gap so the whole curriculum reads at one consistent bar.

---

## Eradication target (the same calibration)

**Replace:**
- 2–3 word fragments at sentence ends ("Be that AE." / "Lead it." / "Act like it." / "That's it.")
- Telegraphic 2–4 sentence chains where each sentence is a stripped-down clause ("Know the rules. Hold the line. Survive and advance.")
- comp-big style noun-stacks ("Stay Hungry.<br>Stay Relevant.")
- Aphoristic one-liners that lack subject + consequence ("Context is control. Give it before they ask.")
- Question-stacks acting as kp bodies ("What's their style? Where does confidence break? Start there.")

**Replace with:**
- Full descriptive sentences with explicit subject + named consequence
- Merged clauses using em-dashes, semicolons, or "and / which means / because" connective tissue
- Concrete time-windows ("across the quarter", "by month six", "in next QBR")
- Named rooms ("in the team huddle", "on the demo call", "at the QBR review")

**Keep untouched (per existing carve-outs):**
- `lie-q` proverbs (Appendix E-P1 positive pattern)
- `SIDEBAR_TEXTS` array contents (founder's Lesson 1 motivational-attest carve-out — "absolute exception to any rules")
- Interactive data arrays as bullet content (`PITFALLS.fixes`, `SILO_CARDS.txt`, `BLAME_ITEMS.opts`, `BANT_LEADS.opts`, `FD_ITEMS.opts`, `SA_ITEMS.opts`, `HB_DAYS.blocks`, `ARCH_GRID`, `IMPACT_ITEMS`, `MV_ITEMS`, `SK_ITEMS`, etc.) — these are concrete tactical/scenario content where list-item cadence is genre-canon
- kp list-item *labels* (the colon-terminated heading): "Drop the Ego:" / "Diagnose Your Own Behavior:" / "Communicate Like Adults:" — only the body after the colon gets rewritten if it's choppy

**Edge cases the sweep must handle:**
- Banned-word stragglers caught mid-sweep (e.g., "Silent Killer" F.1 noun catch in Batch 8i). Run canon-check after each phase.
- Mechanical-replace artifacts from prior Batch 8a (e.g., "Your best AE/SDR isn't the loudest one" — the "AE/SDR" was a mangled `rep` → `AE/SDR` mechanical sweep). Fix in passing.
- Founder-redlined strings preserved (Unit 1.1 SDR lie-a line 1446 per redline #7) — do not retouch.
- Pedagogical "circle back" / "kills" uses where the lesson is teaching readers to avoid the phrase — keep.

---

## Phased execution

### Phase 1 — Section 2 + Section 3 body sweep (Lessons 5–12)
**Target:** Every `lp` (lesson paragraph), `kp` (key-point body, post-colon), and `lie-a` (lesson insight answer) string in Section 2 and Section 3 of Lessons 5–12.

**Files in scope (24):**
- `lesson-05/aesdr_course05_{1,2,3}_v1.html`
- `lesson-06/aesdr_course06_{1,2,3}_v1.html`
- `lesson-07/aesdr_course07_{1,2,3}_v1.html`
- `lesson-08/aesdr_course08_{1,2,3}_v1.html`
- `lesson-09/aesdr_course09_{1,2,3}_v1.html`
- `lesson-10/aesdr_course10_{1,2,3}_v1.html`
- `lesson-11/aesdr_course11_{1,2,3}_v1.html`
- `lesson-12/aesdr_course12_{1,2,3}_v1.html`

**Estimated rewrites per unit:** 4–8 strings (depending on how many sections have body content vs. interactive-only).

**Commit pattern:** One commit per Course (3 units), 8 commits total.

### Phase 2 — Interactive instruction strings (all 36 units)
**Target:** Every `*-instr` paragraph that introduces an interactive game (sorters, blame chains, sequencers, classifiers, simulators, scorers, planners, flippers, builders, mappers, etc.).

**Pattern to catch:** "Click X to select. Click Y to place. Get all N right to continue." — typical 3-sentence telegraphic intro.

**Pattern to write:** Single descriptive sentence with the mechanic + the criterion + the continue-condition merged.

**Estimated rewrites per unit:** 2–6 instruction strings.

**Commit pattern:** One commit per Course (3 units), 12 commits — but lighter touch than Phase 1.

### Phase 3 — Homework gate prompts + conscience text + item tasks
**Target:** Every `AESDR.gate(N, { type:'narrative', prompt: ... })` and `AESDR.gate(N, { type:'homework', conscience: ..., prompt: ..., items: [{ task: ..., placeholder: ... }] })` configuration inside `init()` across all 36 units.

**Observation:** Many of these are already descriptive (they were written by an earlier hand at higher fidelity). The sweep is a read-and-edit pass to catch the few that have choppy openers or trailing fragments — not a wholesale rewrite.

**Skip:** `placeholder:` strings (those are model-answer hints, intentionally voiced as a learner writing).

**Commit pattern:** One commit per Course.

### Phase 4 — Quiz questions + interactive `why:` / `result:` explanations
**Target:** Every `QUIZ` array's `q:` strings + every interactive-data `why:` / `result:` / `note:` / `fix:` explanatory text where it functions as teach-back prose.

**Pattern to catch:** "X is correct. Y matters. That's how Z works." 3-fragment teach-backs.

**Pattern to write:** Single descriptive teach-back sentence that names the principle + the consequence.

**Keep:** The `opts:` arrays themselves (those are answer options, intentionally short).

**Commit pattern:** One commit per Course.

### Phase 5 — Section headers + sidebar mottos
**Target:**
- `lh-title` strings across all sections (some are already title-length, some are choppy two-sentence pairs)
- `lh-sub` strings (these are usually counter-text like "0 / 6 correctly sorted" — leave alone unless prose)
- `sidebarMotto` per unit (the irisTxt-animated motivational tagline in the sidebar)

**Most of these are already fine.** This phase is a targeted catch for the few that aren't.

**Commit pattern:** Single commit covering all 36 units.

### Phase 6 — Final canon-check sweep + verification
**Target:** Run `node scripts/canon-check.mjs --soft` across the whole curriculum and resolve any remaining flags (excluding the two known exemptions: Unit 1.1 line 1656 attestation, Unit 9.2 pedagogical "circle back").

**Verification step:** Spot-check 4–6 random units end-to-end by reading them as a user would (cover → s1 → s9 complete) and confirming no obvious choppy patterns survived.

**Commit pattern:** Single commit (likely just canon-check passes; minor fixes if anything caught).

---

## Estimated effort

| Phase | Files touched | Edits / file | Total edits | Commits |
|-------|---------------|---------------|-------------|---------|
| 1 | 24 | 4–8 | ~120 | 8 |
| 2 | 36 | 2–6 | ~140 | 12 |
| 3 | 36 | 0–3 | ~50 | 12 |
| 4 | 36 | 0–4 | ~80 | 12 |
| 5 | 36 | 0–2 | ~30 | 1 |
| 6 | — | — | — | 1 |
| **Total** | **36 unique** | — | **~420** | **46** |

This is comparable to the existing Batch 8e–8s run (about 36 commits to date for the curriculum). The deep clean roughly doubles that.

---

## Open questions (to confirm before Phase 1 starts)

1. **kp list-item bodies in Lessons 5–12 Section 2/3** — the calibration sample for these is the Lesson 1–4 deep rewrites (e.g., Unit 3.2 kp I "Drop the Ego: You're not the hero of this story..."). Confirm the same bar applies, or whether kp bodies in later lessons should stay punchier given their genre (tactical instruction-list).

2. **Sidebar mottos** — most are 1–2 sentence descriptive strings already. Sweep them or treat as motivational-attest-adjacent (carve-out)?

3. **`why:` teach-backs inside interactive data** — these are short pedagogical explanations that pop up after a question is answered correctly. They have a teach-back register that arguably wants to be punchier than body prose. Confirm direction: rewrite descriptively, or leave as teach-back-register?

4. **Commit cadence** — 46 commits is reviewable but heavy. Acceptable, or batch into ~12 super-commits (one per Course covering all phases for that Course)?

---

## Out of scope for this plan

- Consumer surfaces (`app/`, `components/`) — separate sweep, deferred per current branch focus
- Email templates (`lib/email.ts`) — separate sweep
- Internal + partner-kit docs (`content/aesdr-internal/`, `content/partner-kit*/`) — separate sweep
- Canon docs themselves (`docs/canon-revisions/2026-05-19-*.md`) — separate final read-through
- Visual / interaction redesign of any kind — text-only sweep
