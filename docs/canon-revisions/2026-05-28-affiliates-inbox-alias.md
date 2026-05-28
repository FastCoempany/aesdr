# Canon revision — affiliates@aesdr.com as the canonical affiliate-side inbox

**Ratified:** 2026-05-28
**Surfaces:** affiliate-side kit pages, kit-private contact links, admin-
preview labels, `EMAIL_FROM` / `EMAIL_RECIPIENT` envs for affiliate-side
sends.
**Operationally depends on:** Cloudflare Email Routing rule
`affiliates@aesdr.com → antaeus.coe@gmail.com` (added 2026-05-28 in the
Cloudflare dashboard, not in repo).

## Decision

Add `affiliates@aesdr.com` as the canonical affiliate-side inbox.
Rename all `affiliate@aesdr.com` (singular) code/content references to
`affiliates@aesdr.com` (plural). Replace the stale `partner@aesdr.com`
references (from the pre-rename era, per
`2026-05-22-partners-to-affiliates-rename-plan.md`) with
`affiliates@aesdr.com` in active surfaces.

## Two-inbox model after this revision

| Address | Purpose | Goes to |
|---|---|---|
| `hello@aesdr.com` | Buyer / refund / general public | antaeus.coe@gmail.com |
| `affiliates@aesdr.com` | All affiliate-side ops (copy approval, pilot debrief, attribution disputes, contractual, escalations) | antaeus.coe@gmail.com |

## What was renamed in this pass

Active surfaces (renamed in repo):
- `app/affiliates/kit-private/page.tsx` — index "if you need a fresh
  access link, email …" mailto
- `content/affiliate-kit-private/lockup-files.md`
- `content/affiliate-kit-private/escalation-contacts.md` (6 refs)
- `content/affiliate-kit-private/approval-workflow.md`
- `content/affiliate-kit-private/pre-workshop-checklist.md`
- `.env.local.example` — `EMAIL_FROM` / `EMAIL_RECIPIENT` updated to
  `affiliates@aesdr.com` and `AESDR Affiliates <...>`
- `lib/affiliate-kit-session.ts` — admin-preview label now reads
  `Admin (affiliates@aesdr.com)` so the CaveatLayer PS on kit-private
  pages no longer leaks the founder's personal gmail when logged in
  as admin

Historical / intentionally untouched:
- `state0511-part1.md` — state snapshot, kept as the pre-rename record
- `lib/admin.ts` — `antaeus.coe@gmail.com` is the admin allowlist
  (auth identity, not a public-facing address); stays as-is

## What still uses hello@aesdr.com

Transactional emails to buyers (workshop confirmation, refund
acknowledgements, etc.) continue to send from `hello@aesdr.com`. The
canonical refund-language entry in `AFFILIATE_BRAND_CANON.md` still
reads `Email hello@aesdr.com and we process it within 3 business days.`

## Why not consolidate to one inbox

Considered, rejected. Affiliate-side traffic (copy approval, debriefs,
attribution disputes) has a different operational shape than buyer-side
traffic (refunds, content questions). Two aliases keep routing /
triaging clean without standing up a real ticketing system, and
re-consolidation is a trivial Cloudflare config change if we ever
decide the two should merge.
