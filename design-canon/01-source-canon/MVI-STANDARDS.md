# AESDR Minimum Viable Integrity (MVI) Standards

This document defines the non-negotiable standards for every moment in every course, both roles. Every screen, gate, and interaction must meet these before it ships.

---

## 1. CORE PRINCIPLE

**Nothing passes without proof of real engagement with another human being.**

Typing words into a box is not engagement. Checking a checkbox is not engagement. The system must force the learner to:
1. Do the work (write something specific, not generic)
2. Act on it (talk to someone, share it, apply it)
3. Attest to the action (with language that makes lying feel heavy)

The attestation language carries the weight. It must be visible, bold, and use the iris shimmer on the accountability phrases so the learner feels the gravity of clicking "I did this."

---

## 2. FONT STANDARDS

### Current (WRONG)
- Body text: `Cormorant Garamond` (too ornate, hard to read at length)
- Titles: `Abril Fatface` (display only)
- UI/Labels: `Barlow Condensed`
- Code/Counters: `DM Mono`

### Required
| Element | Font | Weight | Size |
|---|---|---|---|
| **Body text** (prompts, task descriptions, gate text, timeline text, lesson paragraphs) | `Inter` | 400 | 15-17px |
| **Bold body** (emphasis, key phrases) | `Inter` | 600 | same as body |
| **Titles** (screen headers, .lh-title) | `Abril Fatface` | normal | keep clamp() |
| **UI labels** (section tags, .sec-eye, gate labels, counters) | `DM Mono` | 400-700 | 9-11px |
| **Buttons** (.gate-submit, nav buttons) | `Inter` | 700 | 11px |
| **Textareas** (user input) | `Inter` | 400 | 15px |
| **Gate prompt text** (.gate-prompt) | `Inter` | 400 | 17px, line-height 1.55 |
| **Conscience/accountability text** | `Inter` | 700 | 16px |
| **Black box quotes** | keep serif italic | - | - |
| **Black box subtext** (grey text beneath quotes) | `Inter` | 400 | 14px |
| **Homework task text** (.hw-gate-task) | `Inter` | 400 | 15px |
| **Timeline task text** (.tl-text, .tl-tasks li) | `Inter` | 400 | 14px |

### CSS Variable Change
```css
--serif: 'Inter', -apple-system, sans-serif;  /* replaces Cormorant Garamond */
```
Keep `--display` as Abril Fatface for titles only.
Add Inter to Google Fonts link.

---

## 3. CONSCIENCE TEXT STANDARDS

The conscience message ("You can treat this like just another course...") must be:

- **Font**: Inter, 16px, font-weight 700 (bold), NOT italic
- **Color**: Full iris shimmer gradient (background-clip: text)
- **Placement**: Inside every homework gate box AND in the sidebar
- **Visibility**: Cannot be subtle. Must be the most visually prominent text on the gate after the title.
- **No max-width constraints** that shrink it into a tiny column

### Sidebar Version
Same text, same shimmer, but can be slightly smaller (14px). Must be bold, not italic.

---

## 4. GATE TYPES AND WHEN TO USE THEM

### 4a. Narrative Gate (reading/reflection screens)
**When**: After every content screen where the learner reads material.
**Structure**:
1. Prompt referencing specific lesson content (not generic)
2. Textarea with 120+ char minimum
3. Character counter
4. **POST-SUBMISSION ATTESTATION CHECKBOX** (new requirement):
   - Greyed out until character minimum is met
   - Text: "I shared this with someone on the team because I know it's important to make my voice and my thoughts familiar around this place."
   - The phrase "because I know it's important to make my voice and my thoughts familiar around this place" renders in iris shimmer
   - Both the text AND the checkbox must be completed to pass the gate

### 4b. Homework Gate (accountability/action screens)
**When**: On homework and action screens.
**Structure**:
1. Conscience text (bold, iris shimmer, 16px Inter)
2. Per-item tasks with textarea inputs
3. Each item has its own minChars (80-120) and submit button
4. All items must be completed to pass

### 4c. Timeline/Day Item Gates (NEW — replacing passive task lists)
**When**: Every expandable day in a timeline (e.g., "Day 1 — Own Your Orientation").
**Structure**:
Each task within a day MUST have:
1. Task description text (rewritten to be specific and actionable)
2. A textarea input (minChars 60-80) where the learner proves they did it
3. An attestation checkbox below the textarea:
   - Text format: "I [action verb] this with [person] because [iris-shimmer accountability phrase]"
   - Example: "I talked to my AE about this because I don't just write shit down that I don't care about"
   - The accountability phrase after "because" renders in iris shimmer
   - Checkbox is greyed out until textarea meets minChars
4. Both textarea AND checkbox must be completed per task
5. ALL tasks in a day must be completed before the day counts as "revealed"

### 4d. Exercise Gates (interactive screens — quiz, cold call sim, schedule builder)
**When**: Screens with interactive exercises.
**Structure**: Keep existing mechanics (correct answers, drag-drop, etc.) but ensure:
- Cannot click through without completing the exercise
- Post-exercise reflection gate where applicable

---

## 5. GATE EDIT/UNLOCK STANDARD

### Current (WRONG)
Gates lock permanently after submission. `_completedHTML()` replaces the input with a read-only preview. User cannot revise.

### Required
Gates must be **editable after submission**. The completed state should:
1. Show the submitted text with a "Submitted" indicator
2. Include an "Edit Response" button/link
3. Clicking edit re-opens the textarea with the previous text pre-filled
4. User can re-submit (updates the response, keeps the gate passed)
5. The gate stays "completed" for navigation purposes even while editing

This applies to ALL gate types across ALL lessons, ALL courses, BOTH roles.

---

## 6. TIMELINE TASK WORDING STANDARDS

### Current (WRONG)
- Tasks are vague strings like "Shadow an AE demo or recorded call — note the 5 questions prospects ask most"
- No per-task gating
- Numbers are often unrealistic ("5 questions prospects ask" — prospects rarely ask 5)

### Required
- Every number claim must be realistic. If "5" is too many, use "at least one" or "the most important"
- Every task must be phrased as a specific action the learner will do TODAY, not someday
- Every task must end with a human interaction requirement ("...and tell your AE about it", "...share this with your team")
- Task wording must be different for AE vs SDR roles (not just slightly reworded — different actions)

### Example Rewrite
**BEFORE**: "Shadow an AE demo or recorded call — note the 5 questions prospects ask most"
**AFTER**: "Shadow a live AE demo or recorded call. Note at least one question the prospect asks that interests you, then tell your AE about it."

---

## 7. ATTESTATION CHECKBOX STANDARDS

Attestation checkboxes are the enforcement mechanism. They appear:
1. After every narrative gate textarea (once minChars is met)
2. After every timeline task textarea (once minChars is met)
3. After every homework item textarea (once minChars is met)

### Format
```
[ ] I [past-tense action verb] this with [specific person type]
    because [iris-shimmer accountability phrase]
```

### Iris Shimmer Phrases (rotate across gates, never repeat on same screen)
- "because I don't just write shit down that I don't care about"
- "because what I do when no one is watching makes all the difference"
- "because I know my growth depends on making my thoughts known"
- "because I refuse to be the person who clicks through and learns nothing"
- "because accountability isn't a buzzword — it's how I operate"
- "because I know it's important to make my voice and my thoughts familiar around this place"

### Visual Treatment
- Checkbox label: Inter, 14px, weight 400, color var(--black)
- Accountability phrase (after "because"): Inter, 14px, weight 600, iris shimmer gradient text
- Checkbox disabled state: opacity 0.3, cursor not-allowed
- Checkbox enabled state: full opacity, cursor pointer

---

## 8. UI CLEANUP

### Remove: 1/2/3/Mark Complete Navigation
The top-right unit navigation (1, 2, 3 buttons and MARK COMPLETE) in the parent app frame must be removed. It serves no purpose and clutters the interface. Lesson progression is controlled by the Continue button and gate system.

**Note**: This lives in the Next.js parent application, not the lesson HTML files.

---

## 9. SCREEN-BY-SCREEN AUDIT CHECKLIST

For every screen in every lesson, verify:

- [ ] Body text uses Inter, not Cormorant Garamond
- [ ] Gate prompt references specific lesson content (no generic "reflect on what you learned")
- [ ] Narrative gates have 120+ minChars
- [ ] Narrative gates have post-submission attestation checkbox
- [ ] Homework items have 80-120 minChars each
- [ ] Timeline day tasks have per-task gates (textarea + attestation checkbox)
- [ ] Task wording uses realistic numbers
- [ ] Task wording includes human interaction requirement
- [ ] Conscience text is bold Inter 16px with iris shimmer (not italic serif)
- [ ] Gates are editable after submission (not locked)
- [ ] Continue button is disabled until ALL requirements met
- [ ] No screen allows click-through without meaningful engagement
- [ ] AE and SDR versions have genuinely different content, not just reworded

---

## 10. FILE-LEVEL CHANGES REQUIRED

### Per lesson HTML file (all 36):
1. Update Google Fonts link to include Inter
2. Change `--serif` CSS variable to Inter
3. Update `.gate-conscience-text` CSS (bold, 16px, not italic)
4. Update `_completedHTML()` in AESDR IIFE to support edit mode
5. Add `_attestCheckbox()` helper to AESDR IIFE
6. Update `_narrativeHTML()` to include attestation checkbox
7. Update `_homeworkHTML()` to include per-item attestation checkbox
8. Rewrite DAYS arrays to include per-task gate configs
9. Update `buildTimeline()` to render per-task gates
10. Update `canContinue()` to check attestation checkbox state
11. Update `render()` to handle new gate mechanics

### Parent Next.js app:
1. Remove 1/2/3/Mark Complete top-right navigation
2. Verify iframe doesn't add its own constraints

---

*This document is the source of truth. Every change must be measured against it.*
