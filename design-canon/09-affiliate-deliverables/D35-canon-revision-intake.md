# D35 — Canon-Revision Intake Template

**Deliverable:** Internal template the founder fills out when proposing a change to `AFFILIATE_BRAND_CANON.md`. Forces a written justification before the canon updates, so revisions reflect real signal — not founder mood, not partner pressure, not deliverable inconvenience. The discipline is canon §17: *do not update canon to fit a deliverable; update the deliverable to fit canon, or argue for a canon change first.*
**Audience:** AESDR-internal — founder, ops, and any future contributor with canon-edit privileges. Never shared with partners. Archived per revision.
**Voice ratio:** 90 Rowan / 10 Michael per canon §3.3 (internal docs row). Plain, verdict-shaped, no marketing voice.
**Format:** Markdown source. Filled per proposed revision. Filed at `docs/canon-revisions/[YYYY-MM-DD]-[topic].md`. The filed intake is the artifact that travels with the canon-revision PR.
**Use timing:** Filled out *before* the canon-revision PR opens. The intake is the PR's body; the actual canon edit is the PR's diff.
**Canon refs:** `AFFILIATE_BRAND_CANON.md` §13 (honesty discipline), §16 (approval gates), §17 (versioning + "how to update").

> **Placeholder convention:** `[REVISION_DATE]`, `[REVISION_TOPIC]`, `[CURRENT_CANON_VERSION]` (e.g., v1.1), `[PROPOSED_CANON_VERSION]` (e.g., v1.2), `[FOUNDER_FIRST_NAME]`, `[OPS_FIRST_NAME]`. Each filled per intake.

---

## Why this template exists

Canon revisions accumulate. Most are good (`7c6aead` v1.1 added custom-iconography doctrine — earned its place); some would be bad if undisciplined (a partner pushes for an exception, the founder caves, the canon shifts to fit the partner). The template forces the proposer to answer five questions before the edit lands:

1. **What's the triggering signal?** Real pilot data, not vibes.
2. **What does the current canon say?** Cited verbatim, not paraphrased.
3. **What does the proposed change say?** Cited verbatim.
4. **What happens to existing deliverables?** Per canon §17, deliverables that contradict the new canon must update — list them.
5. **Who signs off?** Founder for canon; ops for downstream-deliverable-update workload.

If the proposer can't answer all five, the revision isn't ready.

---

## Template

> *(Mono eyebrow, top of file)*
> `AESDR · CANON REVISION INTAKE · [REVISION_DATE] · [REVISION_TOPIC]`

> *(Display italic, ~32pt)*
> *Canon revision: [REVISION_TOPIC]*

> *(Body context line, --serif 14pt italic)*
> *Proposed: [REVISION_DATE] · From [CURRENT_CANON_VERSION] to [PROPOSED_CANON_VERSION] · Proposed by [FOUNDER_FIRST_NAME]*

---

### 1. Triggering signal (what real thing prompted this?)

> *(--serif 16pt body, 3-6 sentences)*

Where did the proposed change come from? Be specific. One of:

- **Pilot postmortem** (D33 §8 lessons-we-keep). Reference the pilot ID and the postmortem entry verbatim.
- **Partner conversation.** Reference D27 scorecard or the call note. **Important:** if a partner pushed for the change, name that explicitly. The bias is to decline partner-driven canon changes unless the partner identified a genuine canon weakness.
- **Audit finding.** Reference the audit pass (e.g., `430ee52`-style) and the specific drift identified.
- **Founder gut-check.** Acceptable but lowest-priority signal. Founder gut-check changes require corroboration from at least one other signal class within 30 days, or the change reverts.
- **Compliance / legal.** Reference the legal counsel input.
- **External event** (e.g., FTC rule update, GDPR change). Reference the source.

> Triggering signal: [text]

---

### 2. Current canon language (verbatim quote)

> *(--mono 12pt block quote, exact lift from canon)*

```
[Verbatim quote from current canon section]
```

> Canon section: `§[N.N]` — *[section title]*

If the proposed change adds an entirely new section (no existing language to quote), write *"[New section — no current language]"* and skip to §3.

---

### 3. Proposed canon language (verbatim, ready to commit)

> *(--mono 12pt block quote, the exact text that will land in canon)*

```
[Verbatim text of the proposed canon change]
```

The proposed text must be ready-to-commit, not "something like this." If the language isn't final, the intake isn't ready.

---

### 4. Rationale (3-5 sentences, plain English)

Why is this change worth making? What does it solve that the current language doesn't? What pattern does it codify?

> Rationale: [text]

If the rationale takes more than 5 sentences, the change is probably two changes; consider splitting.

---

### 5. Downstream impact

Per canon §17: *update any deliverables that contradict the new canon.*

List every deliverable that will need editing if this revision lands:

| Deliverable | What needs editing | Severity (S/M/L) |
|---|---|---|
| D[##] | [text — what changes] | [S/M/L] |
| `kit-template/[file]` | [text] | [S/M/L] |
| Other (specify) | [text] | [S/M/L] |

**Severity guide:**
- **S** — single line edit, no semantic change.
- **M** — section edit, semantic change but bounded.
- **L** — full rewrite or removal of an existing deliverable section. L-severity items are blockers — the revision doesn't ship until they ship in lockstep.

If the table is empty, the change is purely additive (no contradiction). Note that explicitly: *"Purely additive; no existing deliverables contradict the new section."*

---

### 6. What this revision is NOT

Per canon §13 honesty discipline — name what the change does not do:

- Does it loosen any compliance requirement (FTC, CAN-SPAM, TCPA)? **It must not.** If it does, escalate to legal counsel before filing.
- Does it weaken any honest-disqualification stance? **It must not.** Honesty discipline is non-negotiable per canon §1.6.
- Does it accommodate a banned-vocab term? **It must not.** Per canon §4.1, banned vocab is zero-tolerance.
- Does it expand iris usage beyond canon §6.4? **It must not without separate visual-canon review.**

If any of the above are tripped, the revision is not eligible to file as-is. Rework or escalate.

---

### 7. Approval

| Role | Responsibility | Signed | Date |
|---|---|---|---|
| Founder | Canon authorship + final approval | [ ] | [YYYY-MM-DD] |
| Ops | Downstream deliverable update workload | [ ] | [YYYY-MM-DD] |
| Legal counsel | If §6 above flagged any compliance touch | [N/A] or [ ] | [YYYY-MM-DD] |

---

### 8. Post-merge checklist

After the canon-revision PR merges:

- [ ] `AFFILIATE_BRAND_CANON.md` versioning table (canon §17) updated with the new row.
- [ ] All §5 downstream deliverables edited and committed (separate commit per file recommended).
- [ ] `00-canon-excerpt.md` (kit-template) regenerated if any of canon §1, §3.3, §4.1, §6.6, §10.1, §13 changed.
- [ ] `00-INDEX.md` (deliverables) updated if any deliverables shipped/un-shipped/major-revised.
- [ ] `SESSION_STATE.md` "Recent activity" log gets a one-line entry.
- [ ] If any partner is mid-pilot, surface the change in the next D25 weekly report's §1 headline (only if the change affects their pilot — most won't).

---

## Severity-tier discipline

Not every canon-edit needs the full template. Right-size the intake to the change:

| Tier | Description | Template subset |
|---|---|---|
| **Editorial** | Typo, broken link, format fix | Skip the intake; commit directly with `canon: editorial — [topic]` PR title. |
| **Minor** | Clarification that doesn't change meaning | §1, §2, §3, §4, §7. Skip §5/§6/§8 if downstream impact is zero. |
| **Substantive** | Adds, removes, or changes meaning of any section | Full template. |
| **Major** | New version-row (v1.1 → v1.2) | Full template + a written summary in the canon §17 versioning table row. |

Use the lowest-tier intake the change earns. Over-templating editorial fixes is bureaucracy; under-templating substantive changes is drift.

---

## Examples (for calibration)

### Example 1 — Substantive (canon v1.0 → v1.1)

> Triggering signal: Founder direct instruction (2026-04-29, in conversation): icons and symbols are in-play but every glyph must read as custom AESDR.
>
> Current canon: §6.5 third bullet — "*No icons. Custom typographic dingbats only.*"
>
> Proposed canon: §6.5 third bullet rewrite + new §6.8 (custom iconography & symbol system) + new §6.9 (visual QA discipline).
>
> Rationale: The absolute icon ban prevented downstream deliverables from using even canonical glyphs (warning circle, terminal dots, classified stamp). Replacing with a custom-only doctrine + named seed inventory + new-icon-approval workflow preserves brand discipline while enabling production.
>
> Downstream: D06, D07, D08 (workshop assets) — verify icon usage now passes the §6.9.1 thumbnail test. M severity.

This is the actual v1.1 revision (`7c6aead`). The intake template formalizes what was done ad-hoc.

### Example 2 — Substantive (post-pilot)

> Triggering signal: D33 postmortem from pilot `c_2026-06-apex` §5 objection log — "5 of 18 partner-audience replies asked specifically about a Team-tier purchase pathway. Current FAQ Q07 disqualifies team-buyers; canon §13 doesn't address Team-tier-led intake."
>
> Current canon: §13 third bullet — "*Real pricing. Listed plainly.*"
>
> Proposed canon: §13 third bullet unchanged + new §13.7 — *"Team-tier intake. Manager-buyers asking about >10-seat pricing get referred to* `hello@aesdr.com` *for a custom conversation. The conversation is not a closing surface; it is honest scoping."*
>
> Rationale: Team-tier intake is a real signal that emerged from pilot data; we don't want to dilute the honest-disqualification register, but we also don't want to silently misroute interested team-buyers.
>
> Downstream: D23 Q07 — add a sentence pointing managers to `hello@aesdr.com`. S severity.

This is hypothetical; included to show the intake's typical shape.

---

## Visual treatment notes

**Layout pattern:** Internal markdown document. When rendered for archive, follows canon §8.5 PDF anatomy — cream background, 24mm margins, mono eyebrow, `--display` italic 32pt headline, `--serif` 14pt body, `--cond` 11pt section headers, `--mono` 12pt for the canon-language verbatim blocks.

**Palette:**
- Background: `--cream`.
- Type: `--ink` body, `--muted` for table headers and the mono eyebrow / footer.
- Section headers: `--cond` 11pt 700, .15em, uppercase, `--ink`.
- Document title: `--display` italic 700, 32pt.
- Verbatim canon-language blocks (§2, §3): `--mono` 12pt, `--ink`, on a 1px `--light`-bordered panel.
- Hairline rules between sections: `--light` 1px.

**Type tokens:** Per palette above. No Caveat — this is internal-doc register; Michael does not appear in canon-revision intakes per canon §3.4 (Caveat reserved for audience-facing voice surfaces).

**Iconography:** None. The markdown checkbox `[ ]` in §7 / §8 renders as plain text.

**Iris usage:** None. Internal-process docs do not get the iris fingerprint per canon §6.4.

**Deliberate departures from canon:** None.

**Five-question check (canon §6.9.1):**
1. **Thumbnail at 200×200:** Cream + display italic title + mono eyebrow + `--mono`-bordered canon quote panels = identifiably AESDR (canon-process register). Pass.
2. **Token check:** Pass.
3. **Iris reservation:** Pass — zero.
4. **Icon discipline:** Pass — type-only.
5. **Voice thumbnail:** *"Canon revisions accumulate. Most are good; some would be bad if undisciplined. The template forces the proposer to answer five questions before the edit lands."* — passes; verdict-shaped Rowan, identifiably AESDR.

---

## Forward dependencies

This template depends on:
- **Canon §17** versioning workflow. **Met.**
- **D33 postmortem** as a triggering-signal source. **Met.**
- **D27 partner vetting scorecard** as a triggering-signal source. **Met.**

This template is a forward dependency for:
- Every future canon revision after canon v1.1.
- **D40 §1 file `00-canon-excerpt.md`** — when the canon updates, the excerpt regenerates per §8 of this template.

---

## Open

- **Storage location.** Default: `docs/canon-revisions/[YYYY-MM-DD]-[topic].md`. Rationale: discoverable in repo, version-controlled with the canon itself.
- **Whether to require two-person review** for L-severity changes. Default: **founder + one other** (ops or counsel depending on §6). For solo founder pre-team scale, founder + a deliberate 24-hour cooling-off period before merge.
- **Threshold for Major-tier (version bump).** Default: any change to canon §1 (foundational doctrines), §3 (voices), §10 (compliance), §13 (honesty) is automatically Major regardless of size. Other section changes are Major if §5 downstream-impact severity sums to L.
- **Whether the intake itself is partner-readable.** Default: **no.** Canon-revision intakes are internal — partners see the canon's published state via `00-canon-excerpt.md`, not the deliberation behind it. Per canon §12 (founder-backstage doctrine).
- **Tooling.** Default: markdown file in repo. Reconsider Notion / Linear when the team grows past founder + ops.
