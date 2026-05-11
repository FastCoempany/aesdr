# State Handoff — 2026-05-11 (Part 1)

Author: previous Claude session  ·  Repo: `fastcoempany/aesdr`  ·  Production: `aesdr.com`

This file is the handoff brief for the next Claude session on this codebase.
Read it first.

---

## TL;DR — where things stand

- **Canonical source of truth: `main` branch.** It reflects production.
- **One PR in flight: #14** — `fix(dashboard): extract artifact tiles to client component`. Awaiting founder merge.
- The founder has been shipping fast this session. ~15 PRs over the day, 13 merged, 2 closed (#5 superseded by #6 due to remote rejecting `merge/*` pushes after PR opened).
- **Direct pushes to `main` are blocked.** All changes go via PR. Branch protection on the remote rejects direct push-to-main with HTTP 403.
- **All PRs created via GitHub MCP** (`mcp__github__create_pull_request`). Scope is restricted to `fastcoempany/aesdr`.

---

## Latest branches (sorted by recency)

| Branch | Status | Purpose |
|---|---|---|
| `main` | Current production | Canonical |
| `claude/fix-dashboard-rsc-handler-bug` | **PR #14 open, awaiting merge** | Dashboard RSC bug fix (event handlers on Link inside server component) |
| `claude/state-handoff-0511-part1` | This branch | The file you're reading right now |
| `claude/admin-ux-and-fixups` | Merged via PR #13 | 7-patch admin/UX cleanup |
| `claude/landing-validation-marquee` | Merged via PR #12 | Validation marquee section |
| `claude/static-page-brand-pass` | Merged via PR #11 | terms/privacy/refunds/about/contact brand redesign |
| `claude/admin-role-based-access` | Merged via PR #10 | Admin role bypass + AdminChip |
| `claude/fix-landing-scroll-jitter` | Merged via PR #9 | Scroll handler refactor (rAF, single source of truth) |
| `claude/landing-copy-tweaks` | Merged via PR #8 | Masthead simplify, eyebrow swap, descriptor update |
| `claude/review-brand-kit-progress-znGqz` | Merged via PR #7 | Partner kit + apply form + email |
| `claude/merge-2UyBs-with-lint-fix` | Merged via PR #6 | Brought `resume-session-2UyBs` (fork engine) onto main |

**Orphan branches that were audited and intentionally NOT merged** (have nothing necessary for production):
- `claude/review-aesdr-progress-0ot4l` — only 2 commits ahead of main; both superseded
- `claude/resume-aesdr-course-review-SH1do` — mobile work; explicitly not building mobile
- `affiliate-seeding` — 391 files of internal docs; all relevant content already in `content/aesdr-internal/`

---

## What's in flight right now

### PR #14 — Dashboard RSC handler bug fix

- **Branch:** `claude/fix-dashboard-rsc-handler-bug`
- **Why it exists:** `/dashboard` 500s when admin user (`mrcoe7@gmail.com`, who has all 12 lessons marked complete from prior testing) hits it. Real error from Vercel logs:
  ```
  Error: Event handlers cannot be passed to Client Component props.
  digests: 1407542458, 4175184602
  ```
- **Root cause:** `app/dashboard/page.tsx` (server component) had inline `onMouseEnter`/`onMouseLeave` arrow functions on two `<Link>` elements inside the `{allComplete && ...}` reveal-artifacts section. Functions can't cross server→client boundary.
- **Fix:** New `components/ArtifactTile.tsx` client component owns the hover-effect Link. Dashboard now uses `<ArtifactTile>` instead of inline Link blocks.
- **Test plan after merge:** click "Journey" from AdminChip menu → `/dashboard` should render cleanly with all 12 lessons visible + clickable.

---

## Production state (what's live on aesdr.com)

### Buyer-side
- Landing page with AE/SDR fork engine + skip animation + EditorialMasthead retired (overlap with nav AesdrBrand fixed)
- Eyebrow: `12 INTERACTIVE COURSES · BUILT BY OPERATORS · NOT BY COURSE-PEOPLE`
- Default descriptor: `"12-lesson sales survival course — for early-career AEs and SDRs."`
- Validation marquee between testimonials and pricing (23 companies, smoothstep scroll, pause-on-hover, prefers-reduced-motion respected)
- Pricing tiers: $249 SDR / $299 AE / $1,499 Team. Role-aware highlight.
- Bottom CTA: "Get Access" → `#pricing` (universal — admin uses chip menu for nav)
- Scroll handler refactored with rAF throttling and single-source-of-truth state computation (no more jitter)
- Static info pages (`/terms`, `/privacy`, `/refund-policy`, `/about`, `/contact`) on editorial palette via shared `LegalShell` component

### Partner-side (affiliate hub)
- `/partners` — hub home + Phase 1 pages (program, curriculum, FAQ, apply, etc.)
- `/partners/apply` — form persists to Supabase `partner_applications` + emails founder via Resend (from `AESDR Partners <partner@aesdr.com>`)
- `/partners/kit` — 8 public partner-prospect-facing docs (positioning brief, curriculum overview, co-promoting AESDR, approved claims, disclosure language pack, banned vocabulary, lockup usage rules, pilot rhythm)
- `/partners/kit-private` — 6 gated ops docs (promo copy pack, worked commission example, pre-workshop checklist, approval workflow, escalation contacts, lockup files & composition guide). Access via per-partner signed-URL token.
- `/admin/partner-kit` — token mint form + active tokens table + audit log

### Admin-side
- `ADMIN_EMAILS` env var = `mrcoe7@gmail.com,antaeus.coe@gmail.com`
- Admin users bypass every gate: paywall (`verifyPaidAccess`), partner-kit token (`readKitSession`), `COMING_SOON` proxy gate, route-allowlist proxy fall-through
- Admin sees `• ADMIN MODE ▾` chip top-center on every page (server-rendered conditional via `getAdminContext()` in `app/layout.tsx`)
- Click the chip → dropdown menu: Journey · Affiliate Hub · Public Kit · Gated Kit · Admin Tokens · Apply Form · Home · Sign Out
- Admin doesn't get logged in the partner-kit audit log (`session.isAdmin === true` short-circuits `logAccess` calls)
- Admin lesson gate also bypassed on `/dashboard` (all 12 lessons visible + clickable; `isAccessible` flag is admin-aware)

### Email infrastructure (working)
- Cloudflare Email Routing: `partner@aesdr.com` + `hello@aesdr.com` forward to `antaeus.coe@gmail.com`
- Resend: domain `aesdr.com` verified, `RESEND_API_KEY` set in Vercel env
- `EMAIL_FROM` = `AESDR Partners <partner@aesdr.com>`, `EMAIL_RECIPIENT` = `partner@aesdr.com`
- `lib/email.ts` exports `sendPartnerApplicationNotification`, called fire-and-forget from `/api/partners/apply/route.ts`

### Error handling
- `app/error.tsx` — editorial palette + iridescent turtle + collapsible diagnostic block (shows `error.message` if available, else `error.digest` only — Next.js strips messages in production builds)
- `app/global-error.tsx` — Sentry-wired fallback (uncertain if Sentry DSN is actually configured in env)

---

## Critical operating conventions

### Branching
- **Never push directly to `main`.** Remote returns 403. Use feature branches + PRs.
- Branch naming: `claude/<short-description>` for work-in-progress.
- Don't push to `merge/*` once a PR has been opened against it — remote will lock further pushes. If iteration needed, push to a new `claude/*` branch and re-open PR.

### Code conventions (from `AGENTS.md`)
- **Retired dark palette is FORBIDDEN for new work.** `--bg-main`, `--text-main`, `--theme`, `--coral`, `--cobalt`, `--amber`, `--violet`, `--theme-glow` exist for backwards compat with old course HTML only. Don't use in any new component/page.
- **Editorial palette is the only one:** `--cream` (#FAF7F2), `--ink` (#1A1A1A), `--crimson` (#8B1A1A), `--muted` (#6B6B6B), `--light` (#E8E4DF), `--iris` (gradient, reserved for role tokens, key CTAs, brand wordmark only).
- **Fonts via tokens:** `--display` (Playfair Display), `--serif` (Source Serif 4), `--cond` (Barlow Condensed), `--mono` (Space Mono), `--hand` (Caveat — Michael's voice / margin annotations only).
- Today's date in this repo's reality: `2026-05-11`.

### React Server Components — known gotcha
- Server components **cannot pass function props to client components**. Specifically: `<Link onMouseEnter={...}>` in a server component will 500 at render time. Always extract such patterns into a `"use client"` component.
- `next/link` is a client component. Inline event handlers on Links must be inside a `"use client"` boundary.

### Admin scope
- Server-only `ADMIN_EMAILS` env var. Not `NEXT_PUBLIC_`. Can't be spoofed client-side.
- `lib/admin.ts` exports `isAdminEmail(email)` (pure check) + `getAdminContext()` (session probe) + `requireAdmin()` (hard gate for `/admin/*` routes).
- `verifyPaidAccess` in `utils/access/verifyAccess.ts` short-circuits with `if (isAdminEmail(user.email)) return true;`.
- `readKitSession` in `lib/partner-kit-session.ts` returns a synthetic `{ isAdmin: true, partner_slug: "__admin__", ... }` for admins.

---

## Open / unresolved items the founder may surface next

- **The dashboard error**: PR #14 should fix it. If it persists after merge, the new `app/error.tsx` diagnostic block surfaces `error.digest`; correlate with Vercel function logs.
- **Lesson completion state for admin users**: `mrcoe7@gmail.com` has all 12 lessons marked complete in `course_progress` from prior testing. After PR #14, the reveal-artifacts section will render for admin without erroring. If founder wants the admin to see a "fresh start" view of dashboard, they'd need to clear those rows manually via Supabase, OR we can add an admin-only toggle to view-as-fresh-user.
- **The brand "secret": Rowan & Michael voice system** is intentionally kept in `content/aesdr-internal/` and NEVER rendered on any partner-facing or public surface. Per founder direction 2026-05-09. Even gated partner kit doesn't expose it.
- **No mobile build.** Course is desktop-only per founder direction. `/mobile` route exists for the coming-soon redirect but mobile traffic isn't a build priority.
- **Pricing source of truth:** `PRICING_ENGINE_SPEC.md` in the repo root. Refund policy page got updated to $249/$299/$1,499 in PR #11.

---

## Environment variables in Vercel

Critical ones (server-only unless noted):

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` / `STRIPE_PRICE_ID_*`
- `RESEND_API_KEY` — for `lib/email.ts`
- `EMAIL_FROM` = `AESDR Partners <partner@aesdr.com>`
- `EMAIL_RECIPIENT` = `partner@aesdr.com`
- `KIT_TOKEN_SECRET` — 48-byte base64, HMAC-signs partner-kit access tokens
- `ADMIN_EMAILS` = `mrcoe7@gmail.com,antaeus.coe@gmail.com`
- `NEXT_PUBLIC_SITE_URL` = `https://aesdr.com`
- `COMING_SOON` — runtime-flipped, currently `false`

---

## Where to find things in the codebase

| What | Path |
|---|---|
| Landing page | `app/page.tsx` + `app/page.module.css` |
| LandingSequence (animation engine) | `components/LandingSequence.tsx` + `components/landing-sequence/{animator,copy,typing,zoom-cards}.ts` |
| Pricing | `components/PricingTiers.tsx` |
| Checkout form | `components/CheckoutButton.tsx` (work-email validation for Team tier) |
| Partner hub pages | `app/partners/**/page.tsx` |
| Public partner kit content | `content/partner-kit/*.md` |
| Gated partner kit content | `content/partner-kit-private/*.md` |
| AESDR-internal-only docs (brand canon, voice system) | `content/aesdr-internal/*.md` — NEVER rendered |
| Markdown renderer | `lib/markdown.ts` (no deps, hand-rolled) |
| Token mint/verify | `lib/partner-kit-tokens.ts` |
| Admin helpers | `lib/admin.ts` |
| Admin chip + menu | `components/AdminChip.tsx` (`"use client"`) |
| Error page | `app/error.tsx` |
| Dashboard | `app/dashboard/page.tsx` |
| Course pages | `app/course/[lessonId]/page.tsx` |
| Validation marquee | `components/ValidationMarquee.tsx` + `.module.css` |
| Legal/info shell | `components/LegalShell.tsx` |

---

## Standing principles ratified this session

1. **AESDR language should not require interpretation.** Founder-stated, not yet codified as canon §X. Plain register only — no vineyard/pruning/honest-yield metaphors, no "operator-as-vintner" framing. Direct.
2. **Anything we hand a partner can plausibly leak.** Gated kit content is one screenshot away from public. The voice system stays internal.
3. **One environment, role-based access for admin.** No separate admin instance.
4. **Per-partner audit, not partner-stack discounts.** Buyers see the same price every audience, every channel, every partner.

---

## When PR #14 merges

1. Pull main locally: `git pull origin main`
2. Verify `/dashboard` loads for admin (founder will test)
3. If founder surfaces another issue, branch from main, fix on `claude/<descriptive-name>`, open PR via MCP.

That's the loop.
