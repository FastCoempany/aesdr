`AESDR · CANON REVISION INTAKE · 2026-05-21 · TAGLINE-PACK-V1.3`

> **SUPERSEDED by v1.4** (`2026-05-27-tagline-pack-v1.4.md`): the §14 tagline
> dropped the "5 tools" beat → *"12 courses. Same you — way, way better."*,
> and "tools" was retired as the product-category noun in favor of named
> "artifacts." Retained as historical record — do not lift its tagline forms
> verbatim.

# Canon revision: §14 tagline pack v1.3

**Proposed:** 2026-05-21 · From v1.2 to v1.3 · Proposed by Founder

---

## 1. Triggering signal

**Source:** Founder ratification during the Tier B/C/D cadence + hierarchy re-sweep audit (2026-05-21).

The hierarchy reframe (Course → Lesson → Section, with Course as the top-level 12) ratified across all partner-kit, curriculum, and consumer-surface documents in commits `8cee550` through `bbe5c47` left the §14 tagline pack as the last surface still saying "12 lessons" verbatim. The conflict was flagged at audit close: the canon §14 v1.2 tagline `"12 lessons. 5 tools. 1 new you."` contradicts the hierarchy canon's `12 courses` reframe, and the mono-label tagline-derivatives in 15+ mockups (warning-tag patterns, fork-* labels, variants/) still propagate the old hierarchy because the §14 tagline they echo hasn't been updated.

Founder also called the "new you" beat — added in v1.2 to make the tagline a contract — and proposed a more honest replacement that preserves the contract without implying identity-shift.

---

## 2. Current canon language (verbatim quote, v1.2)

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

> Canon section: `§14` — *Tagline pack (canonical)*

---

## 3. Proposed canon language (v1.3, ready to commit)

```
## 14. Tagline pack (canonical)

Repeatable across collateral, host scripts, social, decks. Use, don't paraphrase, unless the canon is updated first.

- "You can already feel it. You have to be a part of this."
- "Real Operator. Never guru."
- "12 courses. 5 tools. Same you — way, way better." (revised v1.3 — supersedes v1.2 "12 lessons. 5 tools. 1 new you.")
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

One change, two rationales:

- **Hierarchy alignment.** `12 lessons` → `12 courses` brings the canonical tagline into line with the Course → Lesson → Section hierarchy ratified across partner-kit, curriculum-map, syllabus, FAQ, and consumer surfaces. With v1.2 standing, every mono-label tagline-derivative in mockups, warning-tags, and partner-promo surfaces had to choose between matching the canon §14 verbatim ("12 lessons") or matching the hierarchy ("12 courses"). v1.3 removes that conflict.
- **"Same you — way, way better." replaces "1 new you."** The v1.2 "new you" beat tried to make the tagline a contract by promising identity-shift. The new phrasing keeps the contract — outcome change is implied — without claiming AESDR rewrites the buyer's identity. "Same you — way, way better." is more honest per canon §13 (honesty discipline) and stays cleanly within §10.2 approved-claims (no income, no specific outcome, no transformation theatre). The em-dash pause + repeated "way, way" is the brand fingerprint: a beat the buyer hears, not a flourish that demands interpretation. (An earlier in-draft form used a doubled-comma pause "way....way better"; founder swapped to the em-dash form for print-render durability — see §8 closed-question note below.)

Both moves together: the tagline now reads as something an operator would say to another operator at a bar (canon R-G6 bar test). The v1.2 form read as something a brand wrote; the v1.3 form reads as something a buyer would repeat.

---

## 5. Downstream impact

| Deliverable | What needs editing | Severity (S/M/L) |
|---|---|---|
| `AFFILIATE_BRAND_CANON.md` §14 + §"Decisions log" | Update v1.2 line in §14 and append v1.3 row in decisions log. | S |
| `docs/partner/D23-partner-facing-faq.md` line 80 | `*"12 lessons. 5 tools. 1 new you."*` → `*"12 courses. 5 tools. Same you — way, way better."*` | S |
| `docs/partner/D31-curriculum-map.md` line 137 | Same. | S |
| `docs/partner/D28-pricing-and-promo-sheet.md` line 146 | Same. | S |
| `docs/partner/HUB-BUILD-PROMPT.md` line 34 | Same. | S |
| `docs/partner/kit-template/00-canon-excerpt.md` §"Tagline pack" | Republish from canon: drop the v1.2 parenthetical, install v1.3 line with parenthetical. | S |
| `docs/partner/D30-lesson-preview-spec.md` lines 97 + 99 | Mono-label `aesdr.com · 12 lessons · 5 tools · 1 new you` → `aesdr.com · 12 courses · 5 tools · same you, way better` (abbreviated derivative form for mono-label rhythm; see §6 below). | S |
| Mono-label tagline-derivatives in mockups + variants | `12 lessons · at your own pace · 1 you` → `12 courses · at your own pace · same you, way better` (9 files); `AESDR — 12 lessons / at your own pace / classified` warning-tag → `AESDR — 12 courses / at your own pace / classified` (~7 hero mockups); `12 lessons · one unbroken reel` → `12 courses · one unbroken reel` (syllabus variant-B marquee). | M — 17 mockup files |

**Severity total:** ~25 file touches, all single-line edits. No semantic changes beyond the canonical tagline swap itself.

**Bundling:** Ship as a single commit on `build/behavioral-pass`. Canon-check expected to stay at 3 known curriculum exemptions.

---

## 6. Derivative-form policy (mono-label adaptations)

The full v1.3 tagline `"12 courses. 5 tools. Same you — way, way better."` is 49 characters with periods and an em-dash pause — it fits headlines, slide closes, and standalone hero captions, but it's longer than the visual budget of a mono-label `· `-separator tag.

Two derivative forms are pre-cleared for mono-label use:

| Form | Use surfaces |
|---|---|
| **Full:** `12 courses. 5 tools. Same you — way, way better.` | Slide closes, hero captions, brand-line sign-offs, partner-promo `curr-h` headers |
| **Mono-label short:** `12 courses · at your own pace · same you, way better` | Hero warning-tags, fork-* labels, variant editorial-split CTA tags, lesson-preview thumbnail mono lines |
| **Inventory short:** `12 courses · 5 tools · same you, way better` | Curriculum-map closers, syllabus footer CTA, places that need the inventory beats |
| **Consumer inventory:** `12 courses · 5 takeaway tools` (or `12 courses with 5 takeaway tools`) | Homepage feature bullets, syllabus banner, preview footer, enterprise pricing description, affiliate catalog teaser. The "takeaway" modifier survives as buyer-side clarifier: it names what the tools *are* (artifacts they leave the program with) rather than relying on context. Founder-ratified addition 2026-05-22. |

Derivative usage is canon-cleared per this revision; do not paraphrase further without a new canon-revision intake.

---

## 7. Compliance check (canon §10)

- **§10.2 approved claims:** "Same you — way, way better." names outcome change as relative ("better") rather than absolute or specific. No income claim, no conversion-rate claim, no promotion-timing claim. **Pass.**
- **§10.3 forbidden claims:** No identity-transformation promise (the v1.2 "new you" implied one); no guru-style "this will change your life" register. The line acknowledges the buyer is the same person — the program changes operating capability, not personhood. **Pass.**
- **§13 honesty discipline:** "Same you" is the honest filter — buyers who expected a transformation course will self-select away; buyers who want sharper tools without the identity theater will self-select toward. The honest disqualification is built into the tagline itself. **Pass.**

---

## 8. Open

- ~~**Whether the v1.3 tagline gets a print-render variant**~~ **RESOLVED 2026-05-21 (same day as ratification):** Founder swapped the in-draft doubled-comma pause `way....way better` to the em-dash form `Same you — way, way better.` before any downstream production. Em-dash survives Pandoc / wkhtmltopdf / DOCX normalization cleanly; doubled-comma form was print-fragile. The em-dash form is the single canonical phrasing across screen, print, and partner channels. No print-render variant needed.
- **Whether to retire the v1.2 entry from `2026-05-04-tagline-pack-v1.2.md`** or leave it as historical record. Default: **leave as historical record**, with a one-line note at the top pointing to v1.3 as the active tagline.
