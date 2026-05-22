# 2026-05-22 — `/partners` → `/affiliates` rename plan

> **Status:** Plan. Awaiting execution sign-off.
> **Scope:** Rename the consumer-side affiliate program namespace from
> `/partners` to `/affiliates` across routes, docs, deliverables, and
> internal references. Leave `/enterprise/*` (the B2B subsidiary, including
> `/enterprise/channel` for channel partners) **untouched**.
> **Owner:** Antaeus Coe.
> **Calibration anchor:** The canon doc is already named
> `AFFILIATE_BRAND_CANON.md`. The brand position is "affiliate"; the URL
> drifted to "partner." This plan closes the drift.

---

## Why this rename exists

The word "partner" has been doing too much work. Across the codebase it
refers to four different things:

1. The consumer-side affiliate program (individual creators / micro-creators
   / alumni ambassadors who promote AESDR for commission via signed link).
2. The B2B channel-partnership program (companies that resell or refer
   AESDR to their own audiences).
3. AE/SDR working-partnership ("your AE-SDR partner") in curriculum copy.
4. The legal partner-pilot-agreement in `D22-pilot-agreement.md`.

The rename collapses #1 to its true name (**affiliate**) and frees the
word "partner" to mean #2 and #3 cleanly. #4 stays "Partner Pilot
Agreement" because that's the legal title of the document; the parties in
the agreement become "AESDR" and "Affiliate" rather than "AESDR" and
"Partner."

---

## What's in scope

### App routes (Next.js)

| Current path | New path | Files |
|---|---|---|
| `app/partners/page.tsx` | `app/affiliates/page.tsx` | 1 |
| `app/partners/apply/page.tsx` | `app/affiliates/apply/page.tsx` | 1 |
| `app/partners/curriculum/page.tsx` | `app/affiliates/curriculum/page.tsx` | 1 |
| `app/partners/economics/page.tsx` | `app/affiliates/economics/page.tsx` | 1 |
| `app/partners/faq/page.tsx` | `app/affiliates/faq/page.tsx` | 1 |
| `app/partners/how-we-work/page.tsx` | `app/affiliates/how-we-work/page.tsx` | 1 |
| `app/partners/kit/page.tsx` | `app/affiliates/kit/page.tsx` | 1 |
| `app/partners/kit/[slug]/page.tsx` | `app/affiliates/kit/[slug]/page.tsx` | 1 |
| `app/partners/kit-private/page.tsx` | `app/affiliates/kit-private/page.tsx` | 1 |
| `app/partners/kit-private/[slug]/page.tsx` | `app/affiliates/kit-private/[slug]/page.tsx` | 1 |
| `app/partners/payments/page.tsx` | `app/affiliates/payments/page.tsx` | 1 |
| `app/partners/play/page.tsx` | `app/affiliates/play/page.tsx` | 1 |
| `app/partners/program/page.tsx` | `app/affiliates/program/page.tsx` | 1 |
| `app/partners/timeline/page.tsx` | `app/affiliates/timeline/page.tsx` | 1 |
| `app/partners/who-we-dont-work-with/page.tsx` | `app/affiliates/who-we-dont-work-with/page.tsx` | 1 |
| `app/partners/layout.tsx` | `app/affiliates/layout.tsx` | 1 |
| `app/partners/_components/*` (~8 files) | `app/affiliates/_components/*` | ~8 |

**Estimated route files:** ~23 TSX moves. `git mv` per file; no content
changes beyond rewiring imports + internal hrefs.

### Internal hrefs in code

Search-and-replace for `href="/partners` → `href="/affiliates`, plus
`router.push("/partners")` and similar. ESLint will surface broken
imports; type-check covers the routing.

### Redirects

Add to `next.config.ts` `redirects()` for backward compatibility:

```ts
async redirects() {
  return [
    { source: '/partners', destination: '/affiliates', permanent: true },
    { source: '/partners/:path*', destination: '/affiliates/:path*', permanent: true },
  ];
}
```

Permanent 301 redirects — preserves SEO equity, gracefully handles existing
bookmarks, partner-kit emails already in flight, anything that previously
linked to `/partners/*`.

### Docs

| Current folder | New folder | File count |
|---|---|---|
| `docs/partner/` | `docs/affiliate/` | 40+ deliverables (D01–D40, README, HUB-BUILD-PROMPT, L-and-D-approver-brief, AESDR-PARTNER-HUB-SPEC) |
| `docs/partner/kit-template/` | `docs/affiliate/kit-template/` | 6 files (00-canon-excerpt, 09a/b/c/d, 10d, 13-operating-cadence) |
| `content/partner-kit/` | `content/affiliate-kit/` | 9 files |
| `content/partner-kit-private/` | `content/affiliate-kit-private/` | 9 files |

Folder renames via `git mv`. File contents get internal references
updated separately.

### Deliverable D-series labels

The D-series file names keep their D-numbers (D01–D40 stay D01–D40) but
the descriptive portion gets re-titled where "partner" is doing
affiliate-side work:

| Current | New |
|---|---|
| `AESDR-PARTNER-HUB-SPEC.md` | `AESDR-AFFILIATE-HUB-SPEC.md` |
| `L-and-D-approver-brief.md` | unchanged (L&D-approver brief is a sendable artifact, doesn't carry the partner/affiliate label) |
| `D01-outreach-subject-lines.md` | unchanged file name (the subject lines themselves rewrite from "partner" → "affiliate" in body) |
| `D21-positioning-brief.md` | unchanged file name |
| `D22-pilot-agreement.md` | unchanged file name (the title in body becomes "Affiliate Pilot Agreement") |
| `D27-partner-vetting-scorecard.md` | unchanged file name (body rewrites "partner" → "affiliate") |
| `D32-kill-or-keep-memo.md` | unchanged file name (per founder call earlier; the file already represents the cut decision regardless of label) |
| `D34-pilot-closeout-notes.md` | unchanged |
| `D36-ambassador-conversion-playbook.md` | unchanged file name (ambassador is a sub-archetype of affiliate) |
| `D40-master-partner-kit-readme.md` | `D40-master-affiliate-kit-readme.md` |
| `HUB-BUILD-PROMPT.md` | references inside update to `/affiliates` paths |

The D-numbers are stable identifiers. Renaming the descriptive suffix on
some files matches the namespace; leaving most untouched avoids
file-history churn where the file name already reads cleanly.

### Internal terminology (body content)

Across all renamed docs and the kept-name docs that contain "partner"
references, the body text gets rewritten:

- "Partner" → "Affiliate" where the word refers to the consumer-side affiliate program
- "Partner kit" → "Affiliate kit"
- "Partner Pilot Agreement" → "Affiliate Pilot Agreement"
- "Partner vetting scorecard" → "Affiliate vetting scorecard"
- "Partner-promo page" → "Affiliate landing page"
- "Partner-relationship disclosure" → "Affiliate disclosure"

**Stays the same:**
- "Channel partner" (B2B reseller relationship — keep the "channel" prefix per AGENTS.md)
- "AE-SDR partnership" (working relationship in curriculum copy)
- "Partnership" as a generic word for working relationship
- "Partner" in the D22 legal-agreement parties block stays a defined term ("Partner means..." → "Affiliate means...")

### Admin chrome

`app/admin/layout.tsx` nav already has `{ href: "/admin/affiliates", label: "Affiliates" }` and `{ href: "/admin/partner-kit", label: "Partner Kit" }`. Post-rename:

- `app/admin/affiliates/*` (already exists) — stays as the affiliate admin landing
- `app/admin/partner-kit/*` → `app/admin/affiliate-kit/*` (folder + admin nav label update)

### Email templates

`lib/email.ts` — searches "partner" mentions inside template bodies and
metadata, rewrites to "affiliate" where referring to the consumer-side
program. `sendPartnerApplicationNotification` function name keeps for
backward compat; alias `sendAffiliateApplicationNotification` added as
the canonical export.

### Canon docs

- `AFFILIATE_BRAND_CANON.md` — already named correctly; verify body internal references match
- `AGENTS.md` — update the "Naming separation" block to reflect:
  - `/affiliates/*` is the consumer-side affiliate hub (was `/partners/*`)
  - `/enterprise/channel` is still the B2B channel-partnerships page
  - Write "affiliates" or "Affiliate Program" on consumer surfaces; "channel partners" with the "channel" prefix on first use for B2B
- `CLAUDE.md` — inherits from `AGENTS.md`
- `docs/canon-revisions/_reviews/2026-language-patch-progress.md` — update references post-rename

### Database / Stripe

- Any Supabase tables with `partner_id` column → `affiliate_id` (with migration)
- Stripe webhook handlers reading `partner_id` from session metadata → `affiliate_id`
- Existing rows: data migration with backward-compat alias for ~30 days, then drop the column

**Note:** If no current `partner_id` data exists in production yet (per
master plan, the affiliate hub is still scoping, no live affiliates), this
becomes a clean schema definition rather than a migration. Confirm prod
state before executing.

### Out of scope for this rename

- `/enterprise/*` (B2B subsidiary, including `/enterprise/channel`)
- `AESDR_ENTERPRISE_CANON.md`
- `app/enterprise/*` routes
- Curriculum lesson body content (where "partner" refers to AE-SDR working partnership)
- `D22-pilot-agreement.md` legal section headers (those are defined-term references in a legal doc)

---

## Execution sequence

Two PRs / commit batches for clean review:

### Phase 1 — Routes + redirects (ship first)

1. `git mv app/partners app/affiliates`
2. Update internal hrefs in code via search-and-replace
3. Add 301 redirects in `next.config.ts`
4. Update `app/admin/layout.tsx` Enterprise nav row (no change; the
   `/admin/affiliates` link stays)
5. Type-check + lint pass
6. Commit + ship

After Phase 1: production URLs serve `/affiliates/*` cleanly; existing
`/partners/*` bookmarks 301-redirect.

### Phase 2 — Docs + deliverables (ship second)

1. `git mv docs/partner docs/affiliate`
2. `git mv content/partner-kit content/affiliate-kit`
3. `git mv content/partner-kit-private content/affiliate-kit-private`
4. Rename the few D-series files that should carry the new label
5. Body-text rewrites: "partner" → "affiliate" contextually (sed for the
   safe cases; manual review for the ambiguous ones where "partner" might
   refer to AE-SDR partnership or D22 legal-party-name)
6. Update AGENTS.md naming separation block
7. canon-check pass
8. Commit + ship

After Phase 2: kit docs and internal canon align with the URL namespace.

### Phase 3 — Database (later, only if data exists)

Only if production `partner_id` data exists. Defer until first live
affiliate ships, then add as part of the affiliate-hub buildout.

---

## Risks

| Risk | Mitigation |
|---|---|
| Broken external links pointing at `/partners/*` | Permanent 301 redirects — Google reranks within ~30 days |
| Founder verbal communication still says "partner program" | Rename doc references; communication adjusts naturally over a quarter |
| The few files that retain "partner" in legitimate context (channel partner, AE-SDR partnership) get accidentally swept | Manual review during Phase 2 sed pass; canon-check verifies post-pass |
| Vercel preview URLs cached pointing at `/partners/*` | Vercel re-builds on push; cached previews self-update |
| Existing partner-kit PDFs already mailed reference `/partners/*` URLs | 301 redirects cover; PDFs continue to work |

---

## Estimated effort

| Phase | Files touched | Effort | Founder review |
|---|---|---|---|
| 1 — Routes + redirects | ~25 | 2–3h | 1h (verify nav + spot-check 3–5 pages) |
| 2 — Docs + deliverables | ~70 | 4–5h | 2h (skim renamed kit + diff body rewrites) |
| 3 — Database (deferred) | ~5 | 1h | 0.5h |
| **Total** | **~100** | **~7–9h** | **~3.5h** |

---

## Acceptance

Phase 1 ships clean when:
- `npm run lint` passes
- `npx tsc --noEmit` passes
- Visiting `/partners` redirects to `/affiliates` (302 → 200)
- All 15 affiliate routes load
- `/admin/affiliates` nav still resolves

Phase 2 ships clean when:
- `node scripts/canon-check.mjs` passes
- All `docs/affiliate/` files readable
- Search for `\bpartner\b` in renamed docs only matches in carved-out contexts (channel partner, AE-SDR partnership, D22 legal parties)
- AGENTS.md naming separation block reads correctly

---

## Open questions

- **D22 legal-doc party rename.** Confirm: the contract parties section
  rewrites `Partner` → `Affiliate` as a defined term? Or keep `Partner`
  in the legal doc for backward compatibility with already-signed
  agreements? Default: rename in the template; existing signed contracts
  stand on their executed text.
- **Email template alias period.** `sendPartnerApplicationNotification`
  function name kept for backward compatibility — for how long? Default:
  6 months, then drop.
- **External-facing URL announcement.** Do any third-party affiliates
  currently have `/partners/*` URLs in flight? If yes, send a brief
  email-blast noting the rename + redirects. Default: skip if no live
  affiliates yet.
