`AESDR · CANON REVISION INTAKE · 2026-05-27 · TAGLINE-PACK-V1.4`

# Canon revision: §14 tagline pack v1.4 + "tools" → "artifacts" vocabulary

**Proposed:** 2026-05-27 · From v1.3 to v1.4 · Proposed by Founder

---

## What changes

1. **§14 tagline drops the middle beat.**
   - v1.3: *"12 courses. 5 tools. Same you — way, way better."*
   - **v1.4: *"12 courses. Same you — way, way better."***
   The "5 tools" count is removed entirely rather than re-numbered.

2. **"Tools" is retired as the product-category noun in buyer-facing copy.**
   Use **"artifacts"** as the collective; **name the specific artifacts**
   wherever a list reads naturally. Ordinary-English "tool" (CRM-as-a-tool,
   Zapier tool integration, "tool of choice") is untouched — this is about
   the product category only. The mono-label inventory derivative from v1.3
   (*"12 courses · 5 takeaway tools"*) is **retired**.

3. **Count corrected and pinned to production.** The inventory is **seven
   takeaway artifacts + the 72-Hour Strike Plan as an end-of-course bonus**
   (gated on all twelve lessons complete), verified against
   `utils/content/catalog.ts`:
   - AE/SDR Alignment Contract (3.3)
   - Manager Archetype Map (4.1)
   - Async Cadence Template (4.3)
   - The "I Don't Know" Framework (6.3)
   - CRM Survival Guide (9.1)
   - Time Reclaimed Calculator (9.2)
   - ROI & Commission Defense Tracker (10.1)
   - *Bonus:* 72-Hour Strike Plan (`bonus-72-hr-strike-plan`)

## Why

- **"5 tools" was stale.** It predated catalog finalization. Production ships
  seven course-tied artifacts plus the Strike Plan bonus — the `/tools` page
  itself rendered eight cards while the tagline still said five. The count
  kept drifting because nothing pinned it to the catalog; pinning it (and
  removing it from the tagline) ends the drift.
- **"Tools" read generic.** Founder direction: name the artifacts. "Artifacts"
  is the collective already used in `positioning-brief` ("named takeaway
  artifacts") and the enterprise implementation page.
- **The tagline reads cleaner** without forcing a number into the second beat.

## Supersedes

- §14 tagline pack **v1.3** (`2026-05-21-tagline-pack-v1.3.md`), including its
  "Consumer inventory" derivative (founder-ratified 2026-05-22). v1.3 is
  retained as historical record.

## Surfaces updated in the ratifying commit

- **Buyer-facing (deployed):** `app/layout.tsx` (SEO + OG/Twitter), hero
  (`LandingSequence`), `coming-soon`, `mobile`, all `enterprise/*`,
  `affiliates/*`, `tools`, `about`, `dashboard`, `alumni`, `preview`,
  `free/manager-archetype-map`, `account/implementation-guide`, `lib/email.ts`,
  `lib/affiliate-kit.ts`, `CatalogTeaserGrid`.
- **Served kit:** `content/affiliate-kit/*`, `content/affiliate-kit-private/*`.
- **Internal references:** `content/aesdr-internal/*` (canon excerpt, claims
  sheet, positioning brief, pricing sheet, social posts, curriculum map — the
  last resolves three "tool inventory operationally pending" TODOs),
  `docs/affiliate/*`.

The `/tools` URL route is unchanged — this is copy-only, no redirects.
