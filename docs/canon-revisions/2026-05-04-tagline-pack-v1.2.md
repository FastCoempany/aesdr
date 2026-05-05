`AESDR · CANON REVISION INTAKE · 2026-05-04 · TAGLINE-PACK-V1.2`

# Canon revision: §14 tagline pack v1.2

**Proposed:** 2026-05-04 · From v1.1 to v1.2 · Proposed by Founder

---

## 1. Triggering signal

**Source:** Partner Hub Phase 0 ratification (2026-05-02), founder-direct in-conversation correction during build-prompt edit pass.

The build prompt for the AESDR Partner Hub (commit `7f102b6`, `docs/partner/HUB-BUILD-PROMPT.md` §[2]) cited three taglines that did not appear in canon §14 v1.1. Claude flagged the contradiction during the prefilled-response gate before sub-batch A; founder confirmed (a) — update canon §14 before the hub uses the new taglines.

The hub's `/partners` page hero, `/partners/program` opener, and `/partners/curriculum` closing line all rely on at least one of the three new taglines. Without canon update, the hub authoring stalls (per canon §14 + §17, taglines do not change without canon update first).

---

## 2. Current canon language (verbatim quote, v1.1)

```
## 14. Tagline pack (canonical)

Repeatable across collateral, host scripts, social, decks. Use, don't paraphrase, unless the canon is updated first.

- "The operating manual, not the motivation engine."
- "Less affiliate empire. More founding vineyard."
- "If you want generic sales hype, the internet has a surplus."
- "We do not teach you to sell. We teach you to be the person who sells."
- "Borrowed trust is a merciless mirror."
- "12 lessons. 5 tools. 1 you."
- "Not video lectures. Not motivation. Operating judgment."
- "No motivational BS. No 'crush your quota' energy."
- "This isn't corporate-y but it will advance your career."
- "We part as adults."
```

> Canon section: `§14` — *Tagline pack (canonical)*

---

## 3. Proposed canon language (v1.2, ready to commit)

```
## 14. Tagline pack (canonical)

Repeatable across collateral, host scripts, social, decks. Use, don't paraphrase, unless the canon is updated first.

- "You can already feel it. You have to be a part of this." (added v1.2 — partner-hub pull)
- "Real Operator. Never guru." (added v1.2 — partner-hub pull; replaces the doctrine-form "operator over guru" as the tagline-form)
- "12 lessons. 5 tools. 1 new you." (revised v1.2 — supersedes earlier "12 lessons. 5 tools. 1 you.")
- "The operating manual, not the motivation engine."
- "Less affiliate empire. More founding vineyard."
- "If you want generic sales hype, the internet has a surplus."
- "We do not teach you to sell. We teach you to be the person who sells."
- "Borrowed trust is a merciless mirror."
- "Not video lectures. Not motivation. Operating judgment."
- "No motivational BS. No 'crush your quota' energy."
- "This isn't corporate-y but it will advance your career."
- "We part as adults."
```

---

## 4. Rationale

Three changes, three rationales:

- **"You can already feel it. You have to be a part of this."** — A new high-leverage hero-slot tagline for partner-facing surfaces. Carries the canon §1.4 borrowed-trust-as-merciless-mirror frame without naming it: the prospect knows AESDR is a fit before the page argues it; the page just confirms what they already feel. Pairs with `/partners` hero + `/reveal` artifact pick + workshop close-out.
- **"Real Operator. Never guru."** — Promotes the §1.5 doctrine-form *"operator over guru"* into a tagline-form. Use-case asymmetry: "operator over guru" is a phrase that describes the canon; "Real Operator. Never guru." is a phrase that lands as a hero or social caption. Both stay in canon (the doctrine in §1.5, the tagline in §14).
- **"12 lessons. 5 tools. 1 new you."** — Replaces *"12 lessons. 5 tools. 1 you."* by adding the **"new"** beat. The prior version was descriptive; the revised version is a contract. Slight register shift toward outcome-naming, still within canon §10.2 approved-claims (no income claim, no specific outcome promise — "new" is identity-shift, not income-shift). Per canon §1.5 (operator-over-guru), this tagline is acceptable because the program does in fact change the rep's operating identity (per the Identity arc of the curriculum, real per the production lessons).

---

## 5. Downstream impact

| Deliverable | What needs editing | Severity (S/M/L) |
|---|---|---|
| AESDR Partner Hub (Phase 1, in-flight) | Hub uses new taglines verbatim where applicable. No edit needed; inherits at author-time. | S — author-time application |
| `D31-curriculum-map.md` | Per-section "5 tools" headline references the §14 tagline. Update *"12 lessons. 5 tools. 1 you."* → *"12 lessons. 5 tools. 1 new you."* | S |
| `D09-workshop-deck.md` slide 14 (catalog) | Closing trail line currently says *"12 LESSONS · 5 TOOLS · 1 YOU"*. Update to *"12 LESSONS · 5 TOOLS · 1 NEW YOU"*. | S |
| `D26-partner-promo-page.md` §7 closing | Same. | S |
| `D40-master-partner-kit-readme.md` §1 welcome | Update tagline cluster if present. | S |
| `tools/rendered/04-d09-workshop-deck.html` slide 14 closing tag | Update text. | S |
| `tools/rendered/06-d26-partner-promo-page.html` curriculum closing | Update text. | S |
| `kit-template/00-canon-excerpt.md` §"Tagline pack" excerpt | Republish from canon. | S |

**Severity:** All single-line edits, no semantic changes. Total impact: ~8 files, ~5 minutes editorial time after canon ratifies.

**Bundling:** This cleanup runs in parallel with the discount-doctrine cleanup batch and the curriculum-terminology cleanup batch (Course→Lesson→Section). All three are kit-cleanup ripples — recommend executing as one combined Sub-batch 0 in the hub-build sequence.

---

## 6. What this revision is NOT

- Does NOT loosen any compliance requirement (FTC, CAN-SPAM, TCPA). All three new taglines are observation-shaped, not income-claiming. **Pass canon §10.2 + §10.3.**
- Does NOT weaken any honest-disqualification stance. Canon §1.6 + §13 unchanged.
- Does NOT accommodate banned vocabulary. None of the new taglines contain canon §4.1 banned terms (verified: no "crush," "game-changer," "unlock," "mindset," "rise and grind," "thought leader," "lead with value," "synergy," "amazing," "empower," "rockstar," "ninja"). **Pass §4.1.**
- Does NOT expand iris usage beyond canon §6.4. Tagline pack governs copy; iris reservation governs visual.

---

## 7. Approval

| Role | Responsibility | Signed | Date |
|---|---|---|---|
| Founder | Canon authorship + final approval | [x] | 2026-05-04 |
| Ops | Downstream deliverable update workload | [x] | 2026-05-04 (combined with hub-build kit cleanup) |
| Legal counsel | If §6 above flagged any compliance touch | N/A | — |

---

## 8. Post-merge checklist

- [x] `AFFILIATE_BRAND_CANON.md` versioning table (canon §17) updated with v1.2 row.
- [ ] All §5 downstream deliverables edited (executed as part of hub-build Sub-batch 0).
- [ ] `kit-template/00-canon-excerpt.md` regenerated with v1.2 §14 content.
- [ ] `00-INDEX.md` updated with new canon version reference.
- [ ] `SESSION_STATE.md` "Recent activity" log entry.
- [ ] No mid-pilot partners affected (no pilots in flight at time of revision).

---

*Revision filed under canon §17 versioning workflow. Source intake template: `D35-canon-revision-intake.md`. Filed during AESDR Partner Hub Phase 1 build, Sub-batch 0a.*
