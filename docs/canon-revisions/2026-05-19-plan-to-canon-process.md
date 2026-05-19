# Plan-to-canon dev process

> **Status:** Active. Defines how a voice rule moves from "I noticed
> this in a draft last Tuesday" to "every PR is checked against it"
> without losing the rule in conversation or letting it pile up
> unenforced.
> **Owner:** Antaeus Coe.
> **Last revised:** 2026-05-19 (v2 — rewritten after v1 used gummy
> compound nouns it was supposed to flag).

The base canon and its supplements grow over time. Without a process,
either rules pile up faster than enforcement, or they stay verbal
("Antaeus mentioned that thing about X in a Slack message in May")
and never reach canon. This doc fixes both ends.

---

## The five-step lifecycle

### Step 1 — Capture

Founder flags a pattern. Could be: a sentence in a draft that read
wrong, a recurring pattern across pages, a phrase that started
leaking from internal docs into buyer-facing copy, a piece of
feedback in a review session.

The output is one markdown file in `docs/canon-revisions/_inbox/`,
named `YYYY-MM-DD-short-slug.md`. The file contains:

- One sentence naming the pattern.
- One or two real examples (a before-and-after if known).
- Who flagged it and on what date, and in what context.
- A guess at whether this is canon-worthy or one-off.

The inbox is intentionally low-friction. Better to over-capture than
let a rule die in a Slack thread.

### Step 2 — Promote

Once a pattern appears in the inbox three times (same author or
different), it is promoted to canon. Promotion is one of:

- Edit an existing canon doc (preferred — keeps the surface small).
- Add a new R-G entry to the language-patch supplement.
- A new standalone doc, if the rule has a structure existing canon
  doesn't cover.

Promotion is a commit. PR title: `canon: promote <pattern> to R-G<n>`.

### Step 3 — Sweep

A promoted rule triggers a sweep. The sweep finds existing violations
across surfaces and either fixes them in-place or batches them in
the master plan.

The output is a new entry in the language-patch master plan
(`2026-05-19-language-patch-master-plan.md` or its successor) listing
the violations found and which sweep batch they ship in.

### Step 4 — Enforce

A promoted rule gets scaffolding so future violations don't recur:

- An ESLint rule for the mechanical bans (R-G4 banned phrases, the
  "rep" check, the "decision-grade" string).
- An entry on the pre-merge PR checklist for the rules that need
  taste, not regex.
- An update to `CLAUDE.md` and `AGENTS.md` so the next AI session
  inherits the canon at start.
- A reminder on the quarterly review schedule.

Some rules can be mechanically enforced. Most need a human read.
Step 4 splits them.

### Step 5 — Review

Quarterly. Three questions, on one page:

- Is the rule still being violated in the wild? If no, retire it.
- Is the rule being violated by someone who has read it? If yes,
  the rule is unclear and needs a rewrite.
- Has a new pattern emerged this quarter that no existing rule covers?
  If yes, run that pattern through Step 1 capture.

Reviews aren't quarterly meetings. They are a single working session,
about one hour, output to `docs/canon-revisions/_reviews/YYYY-Q*.md`.

---

## Roles

**Founder** (Antaeus). Captures patterns. Signs off on promotion.
Decides retirements. The voice belongs to the founder; the model is
the editor, not the author.

**AI agent / collaborator** (Claude or successor). Sweeps surfaces
when a rule is promoted. Runs the audit pass on the curriculum.
Generates candidate rewrites. Does not promote rules without founder
sign-off.

**Future contributors.** Read the canon during onboarding. Cite the
canon in PR descriptions when an edit was canon-driven. Add to the
inbox when they spot a new pattern.

---

## Capture template

Every inbox file uses this template:

```markdown
# <Pattern name in one short phrase>

## What the pattern is
<One sentence — what's the violating shape?>

## Examples
**Before.**
<Real or paraphrased example>

**After (if known).**
<What the canon-compliant version is, or "unknown — need to think">

## Flagged by
<Name, date, context — e.g. "Antaeus, 2026-05-19, reviewing /preview
copy">

## Canon-worthy?
<Y / N / not sure. If N, why is this one-off?>
```

---

## Enforcement levels

Three levels, depending on whether the rule can be checked by a regex
or whether it needs a human read.

### Level 1 — Mechanical

The rule can be checked by an ESLint plugin or a simple regex pass.

Examples that fit Level 1:
- *rep* used as a noun for a salesperson → blocked.
- Any R-G4 manufactured-concept term in a JSX string → blocked.
- More than two em-dashes in a single paragraph → flagged.

These go into `.eslintrc.js` or a custom CI step. A failing build
blocks the merge.

### Level 2 — Checklist

The rule needs taste, not regex. The PR template names the rule and
asks the reviewer to confirm it ran.

A template entry looks like:

```markdown
- [ ] R-G1 read: no single-word abstract nouns asked to carry a concept on their own.
- [ ] R-G2 read: every sentence ends on a concrete noun or named clause; no trailing pronouns.
- [ ] R-G3 read: no three short declaratives in a row.
- [ ] R-G5 read: long sentences (12+ words) read aloud cleanly.
- [ ] R-G6 read: would survive the SDR-at-a-bar test.
- [ ] R-G7 read: no AI-tell phrases.
- [ ] R-G8 read: no *showed* / *demonstrated* / *revealed* where the noun would do the work.
```

PR review either confirms the boxes were honestly checked or flags
violations.

### Level 3 — Cultural

The rule is too contextual for mechanical or checklist enforcement.
It lives in the canon as guidance and gets enforced through founder
review on copy-heavy changes.

Example: "operator voice register." Hard to regex. Hard to checklist
without becoming subjective. Founder reads the page and signs off.

---

## Anti-patterns this process avoids

**Verbal-only rules.** A founder mentioning a problem in conversation
doesn't make a canon entry. Without a Step 1 capture, the rule dies
the next time someone unfamiliar with the conversation writes copy.

**Canon sprawl.** Every flagged pattern getting its own rule produces
a fifty-rule canon nobody reads end to end. The Step 2 promotion
threshold (three flags) and the Step 5 retirement loop keep the
active canon legible.

**When a rule gets promoted but the sweep doesn't happen.** A rule promoted without a
sweep means the canon says one thing and the production surfaces say
another. Step 3 is non-optional. If the sweep can't happen in the
same week, the promotion waits.

**Mechanical-only enforcement.** Some violations can be regex'd. Most
can't. Pretending the canon is fully automatable means the rules
that need a human eye silently degrade. Step 4 has three levels for
this reason.

**Rules nobody removes.** Rules that haven't fired in 90 days
might be retirable. Step 5 keeps the active canon small.

---

## Initial inventory of active rules

As of 2026-05-19, the active canon contains:

**Base canon** (`2026-05-19-consumer-brand-voice-canon.md`):
- The blocklist (rep, crush, world-class, best-in-class, etc.).
- The substitution table.
- The seven moves.
- Surface-specific notes.
- Five quick tests.

**Language-patch supplement** (`2026-05-19-language-patch-supplement.md`):
- R-G1 — single-word abstract nouns can't carry concepts on their own.
- R-G2 — no sentence ends on a back-referencing pronoun.
- R-G3 — three short declaratives in a row reads as AI cadence.
- R-G4 — manufactured-concept blocklist.
- R-G5 — read every long sentence aloud before shipping.
- R-G6 — would a second-year SDR say this at a bar?
- R-G7 — AI-tell hygiene (phrase and structural bans).
- R-G8 — prefer the plain noun over the literary verb.

**Curriculum rubric** (`2026-05-19-curriculum-copy-rubric.md`):
- Six-axis scoring (length variety, specificity, AI-tell absence,
  sentence endings, register, filler and over-cutting).
- 6 / 9 / 10 quality bar.
- Per-lesson acceptance criteria.

About thirty atomic checks across three docs. Quarterly review will
prune.

---

## Bootstrapping note

This process is itself new as of 2026-05-19. The five-step lifecycle
applies retroactively to the rules already in canon: R-G1 through
R-G8 were captured in founder direction, promoted in this supplement,
and now enter Step 3 sweep (the master plan) and Step 4 enforcement
(the ESLint rule + PR checklist update).

The first quarterly review is scheduled for 2026-08-19. By then we
know whether the process keeps pace with the rules or needs revision.
