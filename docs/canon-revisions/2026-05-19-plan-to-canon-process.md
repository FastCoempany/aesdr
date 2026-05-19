# Plan-to-canon dev process

> **Status:** Active. Defines how a voice rule moves from "noticed in
> conversation" to "enforced in production" without lossy hand-off or
> drift over time.
> **Owner:** Antaeus Coe.
> **Last revised:** 2026-05-19.

The base canon and its supplements grow over time. Without a process,
either rules pile up faster than enforcement, or rules stay verbal
("Antaeus mentioned that thing about X") and never make it into
canon. This doc fixes both ends.

---

## The five-step lifecycle

### Step 1 · Capture
A voice pattern is flagged. Could be: a sentence in a draft that
felt wrong, a recurring pattern across surfaces, a piece of founder
feedback in a review session, a phrase that started leaking from
internal docs into buyer-facing copy.

**Output.** One markdown file in `docs/canon-revisions/_inbox/`, named
`YYYY-MM-DD-short-slug.md`. Contains:
- The pattern, in one sentence
- One or two real examples (before/after if possible)
- Who flagged it and when
- A guess at whether this is canon-worthy or one-off

The inbox is intentionally low-friction. Better to over-capture than
let a rule die in conversation.

### Step 2 · Promote
Once a pattern has been flagged three times in the inbox (same author
or different), it's promoted to canon. Promotion = one of:
- Edit to an existing canon doc (preferred, keeps surface area small)
- New rule entry under R-G* in the language-patch supplement
- Standalone new doc if the rule is structurally different from
  existing canon

Promotion gets a commit. PR title: `canon: promote <pattern> to R-G<n>`.

### Step 3 · Sweep
A promoted rule triggers a sweep. The sweep finds violations across
surfaces and either fixes them in-place or files them as a backlog
batch.

**Output.** A new entry in the live master plan
(`2026-05-19-language-patch-master-plan.md` or its successor) listing
the violations found and the sweep batch they ship in.

### Step 4 · Enforce
A promoted rule gets enforcement scaffolding:
- ESLint rule for blocked phrases in JSX strings (where mechanical)
- Pre-merge PR checklist updated to reference the rule
- `CLAUDE.md` / `AGENTS.md` updated so the next AI session inherits it
- Quarterly review schedule entry

Some rules can be mechanically enforced (banned phrases, "rep" usage).
Most require taste — those live on the checklist, not in CI.

### Step 5 · Review
Quarterly. Three questions:
- Is the rule still violated in the wild? If no, it might be retired.
- Has the rule been violated by someone who'd read it? If yes, the
  rule is unclear and needs a rewrite.
- Has a new pattern emerged that the rule doesn't cover? If yes,
  start at Step 1 with that pattern.

Reviews aren't quarterly meetings; they're a single working session,
~1 hour, output to `docs/canon-revisions/_reviews/YYYY-Q*.md`.

---

## Roles

- **Founder** (Antaeus). Captures patterns, signs off on promotion,
  decides retirements.
- **AI agent / collaborator** (Claude or successor). Sweeps surfaces
  on rule promotion, runs the audit pass, generates the candidate
  rewrites. Does *not* promote rules without founder sign-off — the
  voice is the founder's, not the model's.
- **Future contributors.** Read the canon during onboarding. Reference
  it in PR descriptions when their edit was canon-driven. Add to the
  inbox when they spot patterns.

---

## Capture template

For consistency, every inbox file uses this template:

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

Not every rule can or should be mechanically enforced. Three levels:

### Level 1 · Mechanical
The rule can be checked by a regex or ESLint plugin. Examples:
- `rep` → blocklist regex
- R-G4 manufactured-concept terms → ESLint rule on JSX strings
- Em-dash count per paragraph → harder, but possible

These go into `.eslintrc.js` or a custom CI step. Failing builds
fail merges.

### Level 2 · Checklist
The rule requires reading taste. Goes into the pre-merge PR
checklist:

```markdown
- [ ] R-G1 read: no single-word abstract nouns doing concept work
- [ ] R-G2 read: every sentence ends on something concrete
- [ ] R-G3 read: no three-short-declaratives-in-a-row
- [ ] R-G5 read: read aloud, no stumbles
- [ ] R-G6 read: would survive the bar test
- [ ] R-G7 read: no AI-tell phrases
```

PR review either confirms checks ran or flags the violations.

### Level 3 · Cultural
The rule is too contextual for mechanical or checklist enforcement.
Lives in the canon as guidance and is enforced through founder
review on copy-heavy changes.

Example: "operator-voice register" — not enforceable by regex, hard
to checklist, easy to read once you know what good looks like.

---

## Anti-patterns this process avoids

**Verbal-only rules.** A founder mentioning "I don't like X" doesn't
make X canon. Without Step 1 capture, the rule dies the next time
someone unfamiliar with the conversation writes copy.

**Canon sprawl.** Every flagged pattern getting its own rule creates
a 50-rule canon nobody reads. Step 2 promotion threshold (three
flags) plus Step 5 retirement keeps the canon legible.

**Sweep skipping.** A rule promoted without a sweep means the canon
says one thing and production says another. Step 3 sweep is
non-optional. If the sweep can't happen right away, the promotion
waits.

**Mechanical-only enforcement.** Some violations can be regex'd. Most
can't. Pretending the canon is fully automatable means the un-
automatable rules silently degrade. Step 4 has three levels
deliberately.

**Canon-as-graveyard.** Rules that haven't fired in 90 days might be
retired. Step 5 keeps the active canon small.

---

## Initial inventory of active rules

As of 2026-05-19, the active canon contains:

**Base canon (`2026-05-19-consumer-brand-voice-canon.md`):**
- The blocklist (rep, crush, world-class, best-in-class, etc.)
- The substitution table
- The seven moves
- Surface-specific notes
- Five quick tests

**Language-patch supplement (`2026-05-19-language-patch-supplement.md`):**
- R-G1 · Gummy-abstraction rule
- R-G2 · Trailing-vague-pronoun rule
- R-G3 · Telegraphic-rhythm rule
- R-G4 · Manufactured-concept blocklist
- R-G5 · Read-aloud test
- R-G6 · Bar test
- R-G7 · AI-tell hygiene

**Curriculum rubric (`2026-05-19-curriculum-copy-rubric.md`):**
- Six-axis scoring (rhythm, specificity, AI-tell, sentence-end,
  register, brevity)
- 6/9/10 quality bar
- Per-lesson acceptance criteria

Total rules in active enforcement: ~30 atomic checks across three
docs. Quarterly review will prune.

---

## Bootstrapping note

This process is itself new as of 2026-05-19. The five-step lifecycle
applies retroactively to the rules already in canon: R-G1 through
R-G7 were captured (in the founder direction message), promoted (this
supplement), and now enter Step 3 sweep (the master plan) and Step 4
enforcement (ESLint + PR checklist updates).

First quarterly review: 2026-08-19. By then we'll know whether the
process works or needs revision.
