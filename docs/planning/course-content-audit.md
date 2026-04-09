# AESDR Course Content Audit — Full Report

**Date:** 2026-04-09
**Scope:** All 12 lessons, 36 units, ~360 screens
**Purpose:** Map all content, identify AE/SDR fork points, assess accountability gates, and plan the overhaul.

---

## 1. CONTENT MAP — WHAT EXISTS NOW

### Lesson Structure (Universal Pattern)

Every unit follows the same 10-screen template:

| Screen | Type | Fakeability |
|--------|------|-------------|
| 0 | Cover page (title, objectives, "Begin Lesson" button) | Trivial — 1 click |
| 1 | Narrative (key points + callout box) | Trivial — read & advance |
| 2 | Interactive 1 — Silo Sorter (6 items → 3 columns) | Medium — must sort all 6 correctly |
| 3 | Narrative (deeper content + "The Fix" callout) | Trivial — read & advance |
| 4 | Interactive 2 — Blame Chain Breaker (4 scenarios) | Medium — must answer all 4 |
| 5 | Interactive 3 — Sequencer (5 steps in correct order) | Medium — must order all 5 |
| 6 | Interactive 4 — Classifier (8 items → 3 buckets) | Medium — must classify all 8 |
| 7 | Quiz (4 multiple choice, 3/4 to pass) | Medium — must pass 75% |
| 8 | Homework (checklists, templates, reference tables) | Trivial — click checkboxes |
| 9 | Completion screen | N/A |

**Notable exceptions:**
- Lesson 3.1: Uses expandable pitfall cards, BANT qualifier game, feedback decoder, script adaptation scenarios instead of standard silo/blame/sequence/classify
- Lesson 3.3: Has 11 screens (extra screen for archetype flip cards + boundary script builder)
- Lesson 4.3: Uses card flips, calendar audit, meeting verdicts, async planner, skills explorer
- Lesson 5.1: Uses sequential unlock steps, subject line verdicts, activity placement, visibility toggle
- Lesson 6.2: Uses value statement builder, binary classifier, circle sorter, scenario apps

### Full Lesson-by-Unit Breakdown

| Lesson | Dashboard Title | Unit 1 | Unit 2 | Unit 3 |
|--------|----------------|--------|--------|--------|
| **1** | Creating Structure | Day 1 Structure & Onboarding | Building Camaraderie | Coaching Foundations |
| **2** | Aligning Departments | Breaking Down Silos | Home Office Setup | AE Ego & Team Dynamics |
| **3** | Coaching Foundations | SDR Performance Pitfalls | AE/SDR Survival Guide (10 Commandments) | Surviving AE Management (10 Archetypes) |
| **4** | Building Call Confidence | Navigating SDR Manager Madness | Simplifying Culture | Mastering Async Life |
| **5** | Email & Outreach | SDR Playbook: Leveling Up to Senior SDR | SDR Career Advice & Professional Presence | SDR Metrics, Visibility & Irreplaceability |
| **6** | Handling Objections | Experience-Based Learning | Field Signal Synthesis & Personal Brand | Knowledge Strategy & "I Don't Know" |
| **7** | Pipeline Mechanics | Prospecting Is Your Job Too (AE) | Self-Sourced Meetings Matter Most (AE) | Is Working in SaaS Even Worth It? |
| **8** | Discovery Mastery | The 30% Rule (Manager) | Stop Chasing Illusion of Potential (Manager) | Are You the Problem? (AE Self-Reflection) |
| **9** | Time & Territory | Salesforce Survival Guide | Slack for Sales Teams | SaaS Tools Stack |
| **10** | ROI & Commission Defense | Breaking Down the Commission Myth | Quotas Are Bullshit | Living the Feast-or-Famine Life |
| **11** | Advanced Prospecting | Sober Selling (Alcohol & Sales Culture) | Sober Selling Part 2 | Sober Selling Part 3 |
| **12** | Putting It All Together | Leveling Up SaaS Relationships | Dating & WFH Dynamics | Stay Single, Build Yourself First |

**Critical observation:** Dashboard titles don't match actual content for most lessons. "Building Call Confidence" (L4) is actually about manager madness, culture, and async work. "Discovery Mastery" (L8) is about the 30% rule and manager coaching. This is confusing for students.

---

## 2. AE / SDR / GENERIC SPECIFICITY MAP

### Current Role Distribution

| Lesson | Unit 1 | Unit 2 | Unit 3 |
|--------|--------|--------|--------|
| **1** | Both (structure) | AE-leaning (building dynamic) | AE-leaning (coaching delivery) |
| **2** | Both (silos) | Both (home office) | Both (ego/dynamics) |
| **3** | **SDR-specific** (pitfalls, BANT) | Both (survival commandments) | **SDR-specific** (managing up) |
| **4** | **SDR-specific** (manager madness) | Both (culture) | Both (async life) |
| **5** | **SDR-specific** (Senior SDR path) | **SDR-specific** (career advice) | **SDR-specific** (visibility, quota) |
| **6** | Generic (experience) | Both (brand, networking) | Both (knowledge strategy) |
| **7** | **AE-specific** (prospecting) | **AE-specific** (self-sourced pipeline) | Generic (SaaS career fit) |
| **8** | **Manager-specific** (30% rule) | **Manager-specific** (fake potential) | **AE-specific** (self-reflection) |
| **9** | Generic (Salesforce) | Generic (Slack) | Generic (SaaS tools) |
| **10** | Both (commission/OTE) | Both (quotas) | Both (feast/famine) |
| **11** | AE-leaning (sober selling) | AE-leaning (sober selling pt2) | AE-leaning (sober selling pt3) |
| **12** | Both (relationships) | Both (dating/WFH) | **SDR-specific** (stay single) |

### Fork Point Summary

**Hard SDR-only content (needs AE equivalent):**
- L3.1: SDR Performance Pitfalls (BANT, proactivity, script adaptation)
- L3.3: Surviving AE Management (10 manager archetypes, managing up)
- L4.1: Navigating SDR Manager Madness
- L5.1-5.3: Entire lesson is SDR promotion/career path
- L12.3: "Stay Single, Build Yourself" uses SDR-specific language (call blocks, sequences, OTE)

**Hard AE-only content (needs SDR equivalent):**
- L7.1: Prospecting Is Your Job Too (AE pipeline ownership)
- L7.2: Self-Sourced Meetings Matter Most (pipeline audit)
- L8.3: Are You the Problem? (AE self-reflection)

**Manager-only content (separate audience entirely):**
- L8.1: The 30% Rule (segmenting SDR teams)
- L8.2: Stop Chasing Illusion of Potential (fake vs real performers)

**Generic content that SHOULD be forked but isn't:**
- L1.1: Day 1 onboarding — AE onboarding vs SDR onboarding are completely different
- L2.1: Breaking down silos — SDR sees this from below, AE sees it from above
- L6.1-6.3: Experience/networking/knowledge — scenarios should be role-specific
- L9.1-9.3: Salesforce/Slack/Tools — usage patterns differ significantly by role
- L10.1-10.3: Commission/quotas/feast-famine — comp structures differ AE vs SDR

---

## 3. ACCOUNTABILITY GATE ASSESSMENT

### Current State: What Can Be Faked

**Trivially fakeable (0-5 seconds):**
- All cover screens (Screen 0) — just click "Begin Lesson"
- All narrative screens (Screens 1, 3) — just click "Continue"
- All homework screens (Screen 8) — checkboxes have no validation
- All completion screens (Screen 9) — auto-complete

**Medium difficulty to fake (requires some thought):**
- Silo Sorters — must sort 6 items into 3 correct columns
- Blame Chain Breakers — must pick correct answer for 4 scenarios
- Sequencers — must order 5 steps correctly
- Classifiers — must sort 8 items into 3 correct buckets
- Quizzes — must get 3/4 correct (75%)

**Hard to fake:**
- Nothing. There is no screen in any lesson that truly verifies learning.

### The Core Problem

1. **Every interactive has a fixed correct answer.** A student can brute-force every silo sorter, sequencer, and classifier by trial and error. Wrong answers flash red, right answers lock green. There's no penalty for guessing, no timer, no limit on attempts.

2. **Quizzes are 4 questions with obvious wrong answers.** Most wrong answers are intentionally absurd ("SDRs are not allowed to have hobbies", "Fire the SDR immediately", "You should only date other SDRs"). A student can pass every quiz without reading the lesson.

3. **Homework has zero enforcement.** Checkboxes are clickable with no validation. "Schedule a coaching session" and "Audit your calendar" are just text with optional checkboxes. There's no accountability — nobody verifies the work was done.

4. **The entire course can be clicked through in ~2-3 hours** if a student is willing to trial-and-error the interactives and guess on quizzes. For a $199 product, that's unacceptable.

### What "Premium Accountability" Should Look Like

The gates need to **vary wildly per lesson** and be **role-specific**. Here's a framework:

**Tier 1 — Reflection Gates (prove you were thinking)**
- Free-text response required before advancing (minimum character count)
- "In your own words, describe how this applies to your current role"
- AI or keyword validation (doesn't need to be perfect, just non-empty and on-topic)

**Tier 2 — Application Gates (prove you can apply it)**
- Scenario simulator where the student must construct a response, not just pick one
- "Write the email" / "Write the cold call opener" / "Build the sequence"
- Role-play transcript where student fills in their side of the conversation

**Tier 3 — Evidence Gates (prove you did the work)**
- Upload a screenshot of their completed calendar block
- Paste a real email they wrote using the framework
- Record a 60-second audio of their call opener (optional premium feature)
- Self-grade against a rubric, then compare to the rubric answer

**Tier 4 — Time Gates (prove you invested time)**
- Minimum time on screen before "Continue" appears (e.g., 90 seconds for narrative screens)
- Interactive elements require real engagement time (not just clicking)
- "Cooling off" period between lessons (can't complete all 12 in one day)

---

## 4. RECOMMENDED ACCOUNTABILITY GATES BY LESSON

| Lesson | Gate Type | Description |
|--------|-----------|-------------|
| **1 — Structure** | Evidence Gate | Must submit their actual Day 1 onboarding checklist (AE version or SDR version). Upload or paste. |
| **2 — Alignment** | Reflection Gate | "Describe a silo in your current org and how it affects your pipeline." Min 100 chars. |
| **3 — Coaching** | Application Gate (SDR) | Given a mock call transcript, identify 3 qualification gaps using BANT. / (AE) Write a coaching note for a specific SDR call recording. |
| **4 — Call Confidence** | Application Gate | Write 3 different cold call openers for 3 different personas. System evaluates structure. |
| **5 — Email & Outreach** | Evidence Gate | Paste a real outreach sequence (3+ emails). Self-grade against the framework rubric. |
| **6 — Objections** | Scenario Simulator | Live objection handling: system presents 5 objections in sequence, student must type responses. Timed (30 seconds per response). |
| **7 — Pipeline** | Application Gate (AE) | Build a pipeline audit: list 5 real deals, classify as self-sourced vs SDR-sourced, identify gaps. / (SDR) Build a weekly prospecting plan with specific accounts and outreach strategy. |
| **8 — Discovery** | Reflection Gate | "Write a self-assessment: Which of the 30% categories are you in? Provide 3 specific examples." Min 200 chars. |
| **9 — Time & Territory** | Evidence Gate | Screenshot of their actual Salesforce dashboard / CRM setup. Or paste their real time-blocked calendar. |
| **10 — Commission** | Application Gate | Build a personal financial plan: base salary, expected commission, emergency fund target, monthly budget. Real numbers required. |
| **11 — Advanced Prospecting** | Scenario Simulator | "You're at a client dinner. Your prospect orders a round. What do you say?" Free-text response with rubric comparison. |
| **12 — Putting It Together** | 72-Hour Strike Plan | Build a complete 72-hour action plan with specific goals, accounts, and metrics. This IS the final exam. Must be substantial (500+ chars). |

---

## 5. AE vs SDR FORK IMPLEMENTATION PLAN

### Infrastructure Required

1. **Role selection**: Add role picker (AE / SDR) at signup or first login
   - Store in `user_metadata.role` in Supabase Auth
   - Pass to iframe via URL param: `/course/1/units/1?role=sdr`
   
2. **Content branching in HTML**: Each lesson HTML reads the `role` param and swaps content blocks
   - Shared content stays shared
   - Role-specific sections render conditionally via `data-role="ae"` / `data-role="sdr"` attributes
   - JavaScript reads URL param and shows/hides appropriate blocks

3. **Three forking strategies** (choose per lesson):

   **Strategy A — Conditional blocks within same file**
   Best for: Lessons where 70%+ content is shared (L1, L2, L6, L9, L10, L12)
   - Same HTML file, `data-role` attributes on divergent sections
   - Pros: Single file to maintain, shared content stays DRY
   - Cons: File gets bigger, harder to read

   **Strategy B — Separate unit files per role**
   Best for: Lessons where content diverges significantly (L3, L5, L7, L8)
   - `aesdr_course05_1_v1_ae.html` and `aesdr_course05_1_v1_sdr.html`
   - Route.ts picks the right file based on user role
   - Pros: Clean separation, each file is focused
   - Cons: More files to maintain, shared content duplicated

   **Strategy C — Role-specific lessons**
   Best for: Lesson 8 (manager content doesn't apply to individual contributors)
   - L8 becomes AE-only or gets a completely different SDR version
   - SDR gets "How to work with your manager" instead of "How to manage SDRs"

### Per-Lesson Forking Plan

| Lesson | Strategy | What Changes for AE | What Changes for SDR |
|--------|----------|---------------------|----------------------|
| **1** | A (conditional) | Onboarding scenarios: managing new SDRs, setting up coaching cadence | Onboarding scenarios: learning CRM, first call block, AE relationship |
| **2** | A (conditional) | Silo-breaking from leadership angle, building team culture | Silo-breaking from contributor angle, navigating political dynamics |
| **3** | B (separate) | AE version: coaching delivery, pipeline ownership, self-assessment | SDR version: current content (pitfalls, BANT, managing up) |
| **4** | A (conditional) | Calendar/async from deal management perspective | Calendar/async from call block & sequence perspective |
| **5** | B (separate) | AE Playbook: leveling up to Enterprise AE, deal strategy, multi-threading | SDR Playbook: current content (Senior SDR path, visibility, metrics) |
| **6** | A (conditional) | Objection handling in discovery/demo contexts | Objection handling in cold call/outreach contexts |
| **7** | B (separate) | Current content works (prospecting, self-sourced pipeline) | SDR version: pipeline building, meeting quality, AE partnership |
| **8** | C (role-specific) | "Are You Replaceable?" — self-assessment, coachability, pipeline ownership | "Working With Your Manager" — managing up, feedback loops, career growth |
| **9** | A (conditional) | Salesforce for deal tracking, forecasting, pipeline views | Salesforce for activity logging, sequence tracking, lead management |
| **10** | A (conditional) | AE comp plans (base + commission + accelerators + clawbacks) | SDR comp plans (base + variable + meeting-to-close dependency) |
| **11** | A (conditional) | Client dinner scenarios, deal celebration contexts | Team bonding scenarios, after-work culture contexts |
| **12** | A (conditional) | Career growth from AE → Enterprise AE / Management | Career growth from SDR → Senior SDR → AE transition |

---

## 6. EXECUTION PLAN

### Phase 1 — Infrastructure (1-2 days)
- [ ] Add role picker to signup/first-login flow
- [ ] Store role in `user_metadata.role`
- [ ] Update `ProgressSaver` and iframe route to pass `?role=` param
- [ ] Add CSS utility classes for role-conditional content (`[data-role="ae"]`, `[data-role="sdr"]`)
- [ ] Add JavaScript role-detection to the shared lesson template

### Phase 2 — Accountability Gates (3-5 days)
- [ ] Build reusable gate components:
  - Reflection gate (free-text with min char count)
  - Application gate (structured input with rubric comparison)
  - Evidence gate (paste/upload with confirmation)
  - Time gate (minimum time before advance)
- [ ] Wire gates into the `postMessage` progress system
- [ ] Add gate state to `course_progress.state_data`

### Phase 3 — Content Forking (5-10 days, parallelizable)
- [ ] Fork Lesson 3 (Strategy B — separate files)
- [ ] Fork Lesson 5 (Strategy B — separate files)
- [ ] Fork Lesson 7 (Strategy B — separate files)
- [ ] Fork Lesson 8 (Strategy C — completely different SDR version)
- [ ] Add conditional blocks to Lessons 1, 2, 4, 6, 9, 10, 11, 12 (Strategy A)

### Phase 4 — Content Rewrite (5-10 days, parallelizable)
- [ ] Rewrite all quiz questions to have plausible wrong answers (remove joke options)
- [ ] Add accountability gates per the table in Section 4
- [ ] Update homework screens with enforced deliverables
- [ ] Fix font sizing on course homepages and section headers
- [ ] Clean up ghost text behind unit tabs/mark complete
- [ ] Update dashboard lesson titles/subtitles to match actual content

### Phase 5 — QA & Polish (2-3 days)
- [ ] Test full AE path (all 12 lessons, all gates)
- [ ] Test full SDR path (all 12 lessons, all gates)
- [ ] Test role switching (what happens if user changes role mid-course?)
- [ ] Test progress persistence across role-specific content
- [ ] Mobile/responsive QA on all new gate components

---

## 7. QUICK WINS (Can ship immediately)

1. **Fix dashboard titles** to match actual content (types.ts `LESSONS` array)
2. **Add time gates** to narrative screens (CSS-only: hide Continue button for 30-60 seconds)
3. **Remove joke quiz answers** and replace with plausible distractors
4. **Fix ghost text** behind unit tabs / mark complete button
5. **Increase font sizes** on course homepages per user request
6. **Add "." after "Structure"** and "It" before "drives results" on Course 1.1

---

*Created by Claude — AESDR Content Audit, April 2026*
