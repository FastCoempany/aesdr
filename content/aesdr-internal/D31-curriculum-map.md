# D31 — Curriculum Map (12-Course Library Catalog)

**Deliverable:** Single canonical reference document mapping AESDR's 12 courses in the production library-catalog metaphor, with per-course question, annotation, and outcome territory. Each course is 3 lessons; each lesson is ~4 sections. The document AESDR points to whenever a partner, prospect, or L&D approver asks "what does this program actually teach?" Every other surface that describes the curriculum (registration page, FAQ, replay page, host bio context, L&D brief) lifts from here.
**Audience:** Three audiences, three render targets, same content.
- **Partners** — required reference; pinned in the partner kit (D40).
- **Prospects** — embedded into the registration page (D07/D26), the offer page, and as a downloadable PDF in the same-day attendee email (D13).
- **L&D approvers** — the program-shape document referenced from the L&D-approver brief PDF.
**Voice ratio:** 80 Rowan / 20 Michael per canon §3.3 (verdict mode). The Michael register lives in the per-lesson annotation lines (lifted verbatim from `app/syllabus/page.tsx`); the per-lesson outcome statements stay in operating-manual register.
**Format:** Markdown source. Renders to (1) PDF one-pager for partner kit + L&D brief, (2) embedded HTML block on registration / offer / replay pages, (3) standalone web page (eventual). Per canon §6.5 + §8.5.
**Canon refs:** `AFFILIATE_BRAND_CANON.md` §1.5 (operator over guru), §1.6 (honesty), §3.3 (voice ratios), §13 (honesty discipline), §14 (taglines).
**Source of truth:** `app/syllabus/page.tsx` (commit `20cbc9e`, 2026-04-22). When the production syllabus changes, this document updates first; every other partner-kit surface follows.

> **Placeholder convention:** No partner placeholders. `[HOST_FIRST_NAME]` appears once in the closing note. Per-lesson outcome statements are partner-agnostic.

---

## Structure in one paragraph

AESDR is **12 courses. 36 lessons total** (3 per course). Each lesson is **~4 sections.** Each course is a card in the library catalog — a real call number, a real question, a margin annotation in the host's hand. The catalog metaphor is intentional: this is a reference work you check out, work through, return when you're a different rep. There are no clusters, no tiers, no hidden upsell tracks. *Twelve cards. Drawer A. Sorted by chapter order.* All open from day one — no drip-gating per canon §1.6.

Every course has a **dual track** — AE-side framing and SDR-side framing in the same content, role-conditional via `[data-role]` per the production app. Where the audit dated 2026-04-09 surfaced misalignment between dashboard titles and course content, the syllabus page (2026-04-22) is the cleanup; this document inherits the cleaned version.

> **Terminology note (canon v1.2 → hub Phase 1):** *Course* (top level, 12 cards) → *Lesson* (3 per course) → *Section* (~4 per lesson). Production syllabus page (`app/syllabus/page.tsx`) currently labels the 12 cards as "Lessons" with `L01–L12` call numbers — that's a separate cleanup. This document and the partner hub use the corrected hierarchy; the call numbers `L01–L12` remain consistent with production until the syllabus surface is updated.

---

## The catalog

> **Card Catalog · Shelf 12 · Drawer A · Est. 2026**
> Dewey 658.85 · AESDR/SAL · Non-Fiction
> *Twelve lessons filed under one call number. Check each one out. Return when you're a different rep.*

### `658.85 / L01` — Building Real Camaraderie

> *"When's the last time your team felt like an actual team?"*
>
> *— keep. read twice.* `Mon 01`

The performance variable nobody talks about. Three principles for partnership without forced happy-hour energy. Three practical tools for the week. Real recognition, real acknowledgment, real audit. AE-side: from managing tasks to actual partnership. SDR-side: from clock-in/clock-out to earning real partnership. **3 lessons · ~150 min total.**

### `658.85 / L02` — Breaking Down Silos

> *"How many deals died in the handoff you never talked about?"*
>
> *— cc: solutions eng.* `Tue 02`

Silos as deal killers, plus the home-office build-out (your remote setup is your deal room or your outbound factory) and the AE-ego problem nobody addresses honestly. Includes "diagnose the silo," "name the killer," and "unpacking AE ego" — uncomfortable on purpose. **3 lessons · ~150 min total.**

### `658.85 / L03` — Performance Pitfalls

> *"Are you getting better — or just getting by?"*
>
> *— mirror test.* `Wed 03`

The four pitfalls every early-career rep falls into. The Survival Guide's Ten Commandments for AE-SDR partnerships. The 10 AE Manager Archetypes — what the room sees in you, plus how to manage up when they apply to your manager. BANT-as-game in the unit-1 interactive. **3 lessons · ~150 min total.**

### `658.85 / L04` — Navigating Manager Madness

> *"Does your manager coach you… or just count your calls and faults?"*
>
> *— send to Todd.* `Thu 04`

The 10 SDR Manager Archetypes — diagnose the kind of management you're under, build the managing-up framework that survives it. Plus simplifying company culture (decode it before it burns you) and mastering async life (your calendar is your contract). **3 lessons · ~150 min total.**

### `658.85 / L05` — tHe SaLeS pLaYbOoK

> *"What's your system? And if you don't have one — what have you been doing?"*
>
> *— LinkedIn isn't one.* `Fri 05`

The 6-step promotion recipe, ramp planning, and the visibility score that gets you the title. Plus filtering the noise of unsolicited career advice and how to become irreplaceable in a structurally replaceable role. The lesson title's stylized casing is a deliberate signal: most "playbooks" deserve the irony. **3 lessons · ~150 min total.**

### `658.85 / L06` — bEyOnD tHe SaLeS pLaYbOoK

> *"What do you do when the script runs out and you're live?"*
>
> *— improvise w/ intent.* `Sat 06`

What experience teaches that books can't. Networking redefined (be the motherboard, not another cog). The strategy of knowing just enough — when "I don't know" is a power move and when product-encyclopedia-energy is the sign you're stalling. **3 lessons · ~150 min total.**

### `658.85 / L07` — Prospecting & Pipeline

> *"If inbound dried up tomorrow, would you survive?"*
>
> *— build outbound muscle.* `Sun 07`

Prospecting is the AE's job too — coasting is visible to everyone, especially your SDR. Self-sourced meetings as the AE moat. Plus the existential unit: *Is working in SaaS even worth it?* — the harsh truth, who thrives, who shouldn't. **3 lessons · ~150 min total.**

### `658.85 / L08` — The 30% Rule

> *"What's your actual close rate? Not the one you told your VP."*
>
> *— do the math honestly.* `Mon 08`

The 30/40/30 breakdown — what your manager is already doing whether they say so or not. Stop chasing the illusion of potential (the enthusiasm trap). And the AE self-reflection: *are you the problem?* — uncoachable habits hiding in plain sight. **3 lessons · ~150 min total.**

### `658.85 / L09` — CRM Survival Guide

> *"Is your CRM protecting you — or building the case against you?"*
>
> *— log before you forget.* `Tue 09`

The five biggest CRM pain points and the discipline that solves them. Slack as productivity-killer-in-disguise — controlling signal, cutting noise. The SaaS-tools stack: when tools amplify skill versus when they hide laziness. **3 lessons · ~150 min total.**

### `658.85 / L10` — Breaking Down the Commission Myth

> *"Can you survive three bad months in a row? Mentally? Financially?"*
>
> *— 3 months runway min.* `Wed 10`

OTE is a fantasy until you read the comp plan's fine print. Quotas are bullshit — and here's how to play the game without losing the plot. Living the feast-or-famine life: the financial discipline most early-career reps build too late. **3 lessons · ~150 min total.**

### `658.85 / L11` — Sober Selling

> *"What if the problem is bigger than your process — what if it's what you're doing when no one's watching?"*
>
> *— 21+. not metaphor.* `Thu 11`

Alcohol and sales culture, head-on. Three units: the work-hard-drink-harder myth and the sober edge; conference culture (where the deals start and the careers stall); professional presence at events. Not metaphor. The annotation says it. **3 lessons · ~150 min total.**

### `658.85 / L12` — Leveling Up SaaS Relationships

> *"Who would vouch for you if you changed companies tomorrow?"*
>
> *— name 5.* `Fri 12`

The SaaS lifestyle gap and what it does to relationships. The home-office trap (presence vs proximity, the emotional black hole of always-on). And the most-debated unit in the catalog: *why SDRs should stay single* — career compounding versus relationship timing. Honest math, not advice. **3 lessons · ~150 min total.**

---

## Tools

The course-content audit (2026-04-09) names "5 tools" as a reference point in the production curriculum. **Tool inventory is operationally pending verification** — recommend confirming which 5 tools ship with v1 (operating sheets, prep templates, etc.) before this section gets numerically specific. Until verified, the partner-facing line is:

> *Each lesson ships with worksheets and takeaway tools you fill against your real reps, your real pipeline, your real comp plan. Not "imagine a prospect named Bob."*

The canon §14 tagline — *"12 lessons. 5 tools. 1 new you."* — stays as the headline frame; the per-tool inventory is filled in once production confirms.

---

## Time commitment

| Pace | Total runtime | Worksheet time | Discord (Untamed) time |
|---|---|---|---|
| **Recommended** — 1–2 lessons / week over 6–8 weeks | ~12 hrs video | ~6 hrs | Optional, ~1 hr / week |
| **Compressed** — 2–3 lessons / week over 4–5 weeks | ~12 hrs video | ~6 hrs | Optional, ~2 hrs / week |
| **Stretched** — 1 lesson / 2 weeks over 6 months | ~12 hrs video | ~6 hrs | Optional |

The honest pace estimate per FAQ Q02: *if you have an hour a week and the will to actually do the worksheet, you'll finish.*

---

## What the curriculum is not

Per canon §13 honesty discipline — the absences:

- **Not a sales-introduction course.** AESDR assumes you have the seat. If you're trying to break into sales, this isn't the course.
- **Not a sales-leadership course.** The SDR-to-AE-to-first-year-AE arc is the spine. Manager-track content is partial (L3.3, L4.1, L8.1, L8.2 carry it) but the program isn't a leadership curriculum.
- **Not industry-specific.** Calibrated for early-career SaaS sales generally; not vertical-specific tactics.
- **Not a credential program.** No certificate, no badge, no hiring-weight credential. The line on a LinkedIn profile would be *"AESDR · 12-lesson operating curriculum"* — honest and accurate, not credentialed.
- **Not a coaching program.** No live cohort sessions, no 1:1 calls, no scheduled office hours. Self-paced curriculum + asynchronous Untamed community.
- **Not sanitized.** Lessons titled *"Quotas Are Bullshit"* and *"Why SDRs Should Stay Single"* are not metaphor or marketing — they're the lesson titles. The annotations are in the host's hand. AESDR is unconventional in tone but conventional in shape: 12 lessons, structured curriculum, defined outcomes, refundable.

---

## Pre-requisites

> *None.*
>
> *AESDR doesn't gate on prior education, prior tenure, or prior toolset. The audience filter is the role you're in, not the path you took to it.*

---

## Visual treatment notes

**Layout pattern:** Two render targets, one source.

- **PDF one-pager (partner kit, L&D brief):** canon §8.5 PDF anatomy. Cream, 24mm margins, mono eyebrow, `--display` italic title, `--serif` body. Each lesson card uses the production syllabus pattern: call number top, title, italic question, mono date stamp, Caveat margin annotation. Hairline `--light` rules between cards.
- **Embedded page block (registration / offer / replay):** canon §6.3 white-panel-on-cream pattern. Cards inline, scrollable.

**Palette:**
- Background: `--cream`.
- Body type: `--ink`.
- Call numbers (`658.85 / L01`): `--mono` 13pt, `--muted`.
- Lesson titles: `--display` italic 700, 22pt, `--ink`. (Stylized titles L05/L06 keep their alternating casing as authored in production.)
- Per-lesson question: `--display` italic 400, 18pt, `--ink`.
- Margin annotation: `--hand` 22pt, `--crimson`, rotation `-1deg`.
- Stamp / day field: `--mono` 11pt, `--muted`, with a 1px `--ink` border (rectangular, ~32×16px) — the "checkout stamp" visual.
- Library-eyebrow ("Card Catalog · Shelf 12 · Drawer A"): `--mono` 11pt, `--muted`, .25em letter-spacing.

**Type tokens:** Per palette above. Caveat appears 12 times (one annotation per lesson) — within canon §3.4's Michael-only-as-margin discipline because each annotation is genuinely a margin-position element, not body type.

**Iconography:** None. The catalog metaphor is built from typographic structure (call numbers, stamps, hairline rules, margin annotations) — no clipart, no decorative icons, no library-shelf imagery. Per canon §6.5.

**Iris usage:** None on the curriculum-map render itself. When embedded above an offer block on the registration / offer / replay pages, the offer block carries the single iris CTA. Per canon §6.4.

**Deliberate departures from canon:** The 12 Caveat instances are more Michael-register than most surfaces. Justified because the annotations are lifted verbatim from `app/syllabus/page.tsx` and are part of the production brand fingerprint — the partner kit reflects what the product actually looks like, not a sanded version of it.

**Five-question check (canon §6.9.1):**
1. **Thumbnail at 200×200:** Cream + display italic lesson titles + mono call numbers + Caveat-crimson annotations + library-catalog eyebrow = identifiably AESDR. Pass.
2. **Token check:** Pass.
3. **Iris reservation:** Pass — zero on the map itself.
4. **Icon discipline:** Pass — type-only.
5. **Voice thumbnail:** *"Twelve cards. Drawer A. Sorted by chapter order. All open from day one — no drip-gating. Twelve lessons filed under one call number. Check each one out. Return when you're a different rep."* — passes; identifiably AESDR. The library-as-curriculum metaphor is the production brand fingerprint.

---

## Forward dependencies

This map depends on:
- **`app/syllabus/page.tsx` (commit `20cbc9e`, 2026-04-22)** — source of truth for titles, questions, annotations, stamps. **Met.**
- **`docs/planning/course-content-audit.md` (2026-04-09)** — source of truth for unit-level content territory and AE/SDR fork structure. **Met.**
- **Tool inventory verification** — production curriculum's 5 tools need confirmation; partner-facing tool list filled when verified. **Operationally pending.**

This map is a forward dependency for:
- **D09 workshop deck** slide 14 (curriculum tease, broad-allusive register).
- **D24 replay page** §4 "what you saw" recap.
- **D26 partner-promo page** §7 curriculum block.
- **D23 FAQ** Q03 (format) + Q12 (post-enrollment experience).
- **L&D-approver brief** — sanitized lesson list lifts from the catalog above, presented in L&D-acceptable working titles per the brief's §"What [PROSPECT_NAME] would learn."
- **D30 lesson preview spec** — the canonical preview lesson alludes to L11 territory ("The Cost of Being On" working title).
- **D40 master partner-kit folder** — pins this map as a top-three reference doc.

---

## Closing note

> *(--serif italic 16pt, --ink, single paragraph below the catalog — the document's last visual beat.)*
>
> *Twelve lessons. Real questions on each card. Annotations in the host's hand. Open from day one, lifetime access, refundable in 14 days. Hosted by [HOST_FIRST_NAME], built from operator interviews, kept current as the role changes. Check one out.*

---

## Open

- **Tool inventory.** Verify the 5 tools (operating sheets, prep templates) shipping in production. Until verified, this document references "worksheets and takeaway tools" generically. Once verified, restore the per-tool listing with real names and lesson anchors.
- **Per-unit titles.** The catalog above shows lesson-level titles (12 entries). The production curriculum has 36 units (3 per lesson). Decision: should the partner-facing map list units (36 cards) or stay at the lesson-level (12 cards)? Default: **12 cards (lesson-level only)** — partners and prospects need shape, not granularity. The registration page and replay page use the same 12-card view. Internal docs may reference units.
- **Stylized lesson titles (L05, L06).** Production renders them with alternating casing (`tHe SaLeS pLaYbOoK`). Default: **preserve verbatim in all renders.** The casing is the brand move; sanding it to `The Sales Playbook` reads as failing to recognize the joke.
- **Library metaphor scope.** The metaphor is surface-deep on this map (call numbers, drawers, stamps, "check one out"). It does NOT extend to fictional library imagery (no card catalog drawer renders, no card stock textures, no "due date" fictions). Per canon §6.5, decoration earns its keep or gets cut.
