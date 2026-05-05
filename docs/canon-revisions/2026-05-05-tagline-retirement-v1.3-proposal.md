`AESDR · CANON REVISION INTAKE · 2026-05-05 · TAGLINE-RETIREMENT-V1.3 · RATIFIED + EXECUTED`

# Canon revision: §1.3 / §14 / §15 retire the vineyard / pruning / honest-yield cluster

**Proposed:** 2026-05-05 · From v1.2 to v1.3 · **Ratified by Founder same day; scope expanded beyond Option B; executed in commit batch on `affiliate-seeding` and `main`.**

---

## Execution log (2026-05-05)

**Founder direction (verbatim):**
> *"i dont like the vineyard, pruning, honest yield language whatsoever. i dont talk like that. the course brand shouldnt talk like that. none of our language should have to be interpreted. it sounds sophisticated but its not necessary."*

**Resolution:** Beyond Option B. The metaphor cluster ("founding vineyard," "small rows," "careful pruning," "honest yield," "affiliate empire" as the structural-mirror counterpoint) removed wholesale from canon. §1.3 retitled and rewritten in plain language. §14 tagline removed. §15 glossary entry removed. Downstream partner-facing surfaces and authoring infrastructure updated in same batch.

**Standing principle (founder-stated 2026-05-05; not yet codified as canon §X but binding for authoring):** *AESDR language should not require interpretation.* Recorded here for follow-on canon-revision intake if founder wants it elevated to a §6.x style discipline. Other metaphors flagged for separate review when/if founder wants: §1.4 *"merciless mirror,"* §15 *"borrowed trust,"* §15 *"operating manual."* No action taken on those in this intake.

**Final canon §1.3 (v1.3):**
```
### 1.3 A handful of partners, not a marketplace
We recruit a handful of tightly aligned partners. We select carefully and decline often. Volume is not a virtue here; conversion quality is.
```

---

## 1. Triggering signal

**Source:** Founder review of partner-hub Phase 1 copy, 2026-05-04, in-conversation.

The hub spec originally instructed `/partners` hero to lift *"Less affiliate empire. More founding vineyard."* verbatim from §14 v1.1, paired with a sub-headline that named a "three to five at any given time" partner cap. During founder review, two distinct issues surfaced:

1. The "three to five" cap was a fabrication — never canon-ratified. (Already retired from the shipped page; flagged in the no-internal-references spec amendment 2026-05-05.)
2. The "Less affiliate empire. More founding vineyard." tagline reads as AI-generated structural-mirror copy ("Less X. More Y.") in the partner-prospect's eye, regardless of whether AESDR coined it. Founder rejected it on the hub hero.

The shipped `/partners` hero now reads *"Real partnerships, not affiliate links."* — a verdict-shaped Rowan headline that does not depend on the structural-mirror form.

This intake formalizes the question the founder review surfaced: should *"Less affiliate empire. More founding vineyard."* remain a deployable tagline in §14, or should it retire? And does the §1.3 doctrine ("Less affiliate empire, more founding vineyard") + §15 glossary entry ("Founding vineyard") move with it, or stay?

The hub-spec amendment 2026-05-05 already marks the tagline as **not deployable on partner-facing surfaces until/unless re-ratified** — but that's a spec-level guard, not a canon edit. The canon itself still lists the tagline as canonical. This intake closes the loop.

---

## 2. Current canon language (verbatim quote, v1.2)

### §1.3 — doctrine

```
### 1.3 Less affiliate empire, more founding vineyard
Small rows. Careful pruning. Honest yield. We recruit a handful of tightly
aligned partners, not a marketplace. Volume is not a virtue here; conversion
quality is.
```

### §14 — tagline pack (relevant entry only)

```
- *"Less affiliate empire. More founding vineyard."*
```

### §15 — glossary (relevant entry only)

```
| **Founding vineyard** | The mental model for the partner program — small rows,
careful pruning, honest yield. |
```

---

## 3. Proposed canon language (v1.3, ready to commit on founder approval)

**Three options. Founder picks one.**

### Option A — Retire from §14 only (minimal)

§14 tagline list: remove the *"Less affiliate empire. More founding vineyard."* line. §1.3 and §15 stay as-is — the doctrine and the glossary term remain valid internal vocabulary; only the tagline-form retires.

**Rationale for A:** The doctrine ("small rows, careful pruning, honest yield") is sound and partner-facing prose can express it without using the structural-mirror tagline. The glossary term remains useful for internal communication. Only the tagline-form is the problem.

### Option B — Retire from §14 + retitle §1.3 (moderate)

§14 tagline list: remove the line.
§1.3 retitle: *"Few partners, careful selection"* (or founder-chosen alternative). Body unchanged: *"Small rows. Careful pruning. Honest yield. We recruit a handful of tightly aligned partners, not a marketplace. Volume is not a virtue here; conversion quality is."*
§15 glossary: remove "Founding vineyard" entry.

**Rationale for B:** The vineyard metaphor is a stylistic flourish that tends to leak into authoring. Retiring it from §1.3 + §15 prevents future hub copy from regenerating the structural-mirror tagline by accident. The doctrine survives in plainer language.

### Option C — Keep, but mark "internal-only" (lightest touch)

§14: annotate the line *"(internal use only — do not deploy on partner-facing surfaces)"*. §1.3 and §15 unchanged.

**Rationale for C:** Founder may want the tagline preserved as canon for internal authoring vocabulary even though it's banned from rendered partner copy. The annotation makes the rule legible inside the canon itself.

---

## 4. Recommendation

**Option A.** The doctrine in §1.3 has independent value (small rows, careful pruning, honest yield is real strategy, not a phrase). The §15 glossary term is internal vocabulary. The §14 tagline-form is the only piece that surfaces in partner copy and is the only piece flagged in founder review. Retiring just the tagline is the surgical fix; further edits expand scope without resolving a stated problem.

If the founder later finds the vineyard metaphor regenerating in authoring drafts, Option B can be filed as a follow-on revision.

---

## 5. Downstream impact (Option A)

| Surface | What needs editing | Severity |
|---|---|---|
| `AFFILIATE_BRAND_CANON.md` §14 | Remove the line. Add a `(retired v1.3 — 2026-05-05)` strikethrough entry below the active list, OR remove cleanly with versioning row in §17 carrying the audit trail. Recommend: clean remove, §17 row records it. | S |
| `AFFILIATE_BRAND_CANON.md` §17 | Add v1.3 row: date, author, notes (retired §14 tagline; doctrine §1.3 + glossary §15 unchanged). | S |
| `docs/partner/AESDR-PARTNER-HUB-SPEC.md` (already shipped) | Spec already marks the tagline as "not deployable until/unless re-ratified" (commit `3fe82b2`). Once canon retires it, update the spec note from "until/unless re-ratified" to "retired in canon v1.3." | S |
| `docs/partner/HUB-BUILD-PROMPT.md` | If the build prompt references the tagline as a recommended hero option, remove. | S — verify only |
| `app/partners/page.tsx` | Already shipped without the tagline (commit `758a2cf`). No-op. | none |
| Other deliverables | The tagline does not appear in shipped kit deliverables D01–D40 to my knowledge. Search verified at intake-time: `grep "founding vineyard" docs/partner/ design-canon/` should return zero hits in body copy of partner-facing deliverables. (To verify before commit.) | S — verify only |

---

## 6. Five-question check on the proposed v1.3

1. **Does it pass §6.9.1 thumbnail?** N/A — taglines aren't thumbnailed.
2. **Does it pass §10.3 forbidden claims?** No claim involved.
3. **Does it pass §4.1 banned vocabulary?** Removal — no vocabulary added. Pass.
4. **Does it pass §6.4 iris-reservation expansion?** N/A — type only.
5. **Voice thumbnail:** §14 stays canonical for the remaining 11 taglines + 4 headlines. No voice impact.

Pass.

---

## 7. Open questions for founder

1. **Option A, B, or C?**
2. **If A:** does the §1.3 section title *"Less affiliate empire, more founding vineyard"* stay even though the tagline is gone? (Recommend: yes — section titles are internal navigation, not rendered partner copy.)
3. **If B:** what's the new §1.3 title? (Recommend: *"Few partners, careful selection."*)
4. **Audit trail in §14:** clean remove with §17 row only, or keep a struck-through "retired" line in §14 itself for in-canon visibility? (Recommend: clean remove + §17. The §17 versioning row is the audit trail; retired-tagline strikethroughs in the active list create reading friction.)

---

## 8. Implementation steps (after founder ratification)

1. Edit `AFFILIATE_BRAND_CANON.md` per chosen option. Update §17 with v1.3 row.
2. Edit `docs/partner/AESDR-PARTNER-HUB-SPEC.md` 2026-05-05 amendment note: "until/unless re-ratified" → "retired in canon v1.3, 2026-05-DD."
3. Mirror to `design-canon/09-affiliate-deliverables/AESDR-PARTNER-HUB-SPEC.md`.
4. Grep verification: `grep -rn "founding vineyard\|affiliate empire" docs/partner/ design-canon/ app/partners/ components/partners/` — confirm zero hits in rendered body copy. Spec/intake/code-comment hits are fine; flag any partner-facing rendered copy that surfaces.
5. Commit on `affiliate-seeding`: `canon: v1.3 — retire "Less affiliate empire. More founding vineyard." tagline (§14)`.
6. Push.

---

*End of intake. Awaiting founder ratification before canon edit.*
