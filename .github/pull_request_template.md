<!--
  Use this template for every PR touching buyer-facing copy or
  curriculum content. Skip the canon section only when the diff is
  pure infrastructure (migrations, deps, CI config).
  Canon docs live in docs/canon-revisions/.
-->

## Summary

<!-- 1-3 sentences. What changed and why. -->

## Test plan

- [ ] Type-check passes (`npx tsc --noEmit`)
- [ ] Lint passes (`npm run lint`) — no new warnings or errors
- [ ] Manual walkthrough of the affected surface(s) in `npm run dev`

## Canon checks

Applies to any change that ships strings to a buyer-facing surface
(`app/`, `components/`, `lib/email.ts`, `content/lessons/`,
`content/partner-kit*`). Skip if the diff is pure infrastructure.

- [ ] **R-G1** — no single-word abstract nouns asked to carry a concept
      on their own (*the move, the wedge, the verdict, the ledger*).
- [ ] **R-G2** — no sentence ends on a back-referencing pronoun (*it,
      this, the rest, etc.*) or trailing qualifier.
- [ ] **R-G3** — no three short declarative sentences stacked in a row.
- [ ] **R-G4** — no terms on the manufactured-concept blocklist (ESLint
      catches the mechanical ones; read for *the move, pressure,
      unlock (verb), leverage (verb), scale (verb), playbook, north
      star, source of truth* yourself).
- [ ] **R-G5** — read every sentence over 12 words aloud. No stumbles.
- [ ] **R-G6** — would a second-year SDR say this at a bar, sober?
- [ ] **R-G7** — no AI-tell phrases (*let me explain, at its core,
      we don't just X — we Y, it's not about X — it's about Y, imagine X,
      welcome to the future of*). No three-word list cadences.
- [ ] **R-G8** — no literary verb (*showed, demonstrated, revealed*)
      where the plain noun would carry the meaning on its own.
- [ ] **rep** — replaced with *AE*, *SDR*, or *AEs and SDRs* every time.

If this PR was driven by a canon rule, reference the rule in the
summary (e.g., "Fixes R-G4 violation on /about hero").

If this PR introduces a new pattern not yet captured in canon, add a
note to `docs/canon-revisions/_inbox/` so it can be promoted to canon
in the next review cycle.

## Naming separation

- [ ] If the diff touches `/partners/*` or `/enterprise/*`, the bare
      word *partner* does not appear without a qualifier on first use
      per page. Consumer side = *Partners* (capital P) or *affiliates*.
      B2B side = *channel partners* (always with "channel" prefix).

## Curriculum-specific (only if diff touches `content/lessons/`)

- [ ] Score against the six-axis rubric in
      `docs/canon-revisions/2026-05-19-curriculum-copy-rubric.md`
- [ ] Starting score, target score, axes lifted named in the PR body
- [ ] No axis below 1 in the after-state
- [ ] Read three non-consecutive pages aloud, no stumbles
- [ ] Any paragraph with a content (not style) change marked
      `[CONTENT QUESTION]` for founder review

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
