# Attribution build-cost analysis

**Version:** 1.0
**Effective:** 2026-05-31
**Owners:** partnerships lead.
**Companion docs:** `AFFILIATE_BRAND_CANON.md`, OS doc § Attribution Decision, `docs/partnerships/discovery-doctrine.md`.
**Status:** Day 5 deliverable in the 90-day plan. Feeds the Day 22 attribution-platform decision memo (`docs/partnerships/attribution-decision.md`).

---

## Headline finding

The three "gaps" the OS doc identified are **substantially closed.** The custom Supabase + Stripe attribution system is essentially complete and in production. Only one piece of plumbing is unfinished. The build-vs-buy decision on Day 22 therefore reduces to "stay vs. swap to Rewardful for polish," not "build from scratch vs. buy."

| OS doc gap | Audit finding | Remaining work |
|---|---|---|
| 1. Partner self-serve dashboard | Built. 5 sub-pages live. | Polish only. |
| 2. Automated payout scheduling | Pipeline built. Lifecycle cron exists but is NOT scheduled in `vercel.json`. | 1 line of config + monitoring. |
| 3. Link-level click tracking | Built. `/r/[slug]` writes to `affiliate_clicks` on every click; attribution cookie set; webhook closes the loop. | None. |

Details and hour estimates below.

---

## Gap 1 — Partner self-serve dashboard (BUILT)

**What exists:**

- `app/affiliates/dashboard/page.tsx` (469 lines) — overview tile grid: clicks, attributed enrollments, projected commission, paid commission. Status pills for pending / cleared / paid / refunded.
- `app/affiliates/dashboard/payments/page.tsx` (199 lines) — Stripe Connect onboarding flow, payout history table, account-status indicator.
- `app/affiliates/dashboard/links/page.tsx` + `LinkForm.tsx` — self-serve link creation via `createAffiliateLink` server action. Affiliates can create their own tracked links without admin involvement.
- `app/affiliates/dashboard/submissions/page.tsx` — copy submission queue (the Warden review path).
- `app/affiliates/dashboard/playbooks/page.tsx` + per-archetype sub-routes — onboarding playbooks per affiliate archetype.
- `app/affiliates/dashboard/_components/StatTile.tsx` — reusable stat tile.

**Data the dashboard reads:** `affiliates`, `affiliate_clicks`, `affiliate_attributions`, `affiliate_payouts`, `affiliate_links`, `affiliate_copy_submissions`.

**Permissions:** Server-side Supabase client checks the signed-in user matches the affiliate's `email` field (or admin allowlist via `isAdminEmail`). No client-side trust.

**Remaining polish work (optional, not blocking):** ~4-6 hours total
- Add an "income year-to-date" rollup for tax-form preparation (the 1099-NEC threshold notice). 1 hour.
- Add a "next payout estimated" tile based on cleared-but-unpaid attributions plus a typical batch cadence. 1 hour.
- Add an inline "share this link" copy-to-clipboard with pre-built UTM-tagged variants. 2 hours.
- Visual treatment audit — check against the §6 visual canon (cream/ink/crimson, no retired palette tokens). 1-2 hours if any drift.

---

## Gap 2 — Automated payout scheduling (PIPELINE BUILT, NOT SCHEDULED)

**What exists:**

- `app/api/cron/affiliate/route.ts` — daily affiliate-lifecycle cron. Promotes `affiliate_attributions` from `pending` → `cleared` once `refund_window_closes_at` has passed AND the underlying purchase is still active. Idempotent. Auth-gated via `verifyCronAuth` against `CRON_SECRET`.
- `runAffiliatePayoutBatch` (app/actions/affiliate.ts:503) — admin-triggered batch payout. Pulls all cleared-but-unpaid attributions for an affiliate, inserts an `affiliate_payouts` row at status `processing`, calls `transferToAffiliate` (Stripe Connect Standard transfer to the affiliate's connected account), and on success flips attributions to `paid`. Fires a payout-notification email via Resend. Failures roll the payout back to `failed` and leave attributions untouched for the next run.
- `markPayoutPaid` (app/actions/affiliate.ts:105) — manual status update path for edge cases.
- `app/api/webhooks/stripe/route.ts` (413 lines) — handles three events relevant to attribution:
  - `checkout.session.completed` — writes `affiliate_attributions` row from `affiliate_link_id` + `affiliate_click_id` session metadata.
  - `charge.refunded` — flips matching `affiliate_attributions` to `status=refunded` (clawback).
  - Idempotent via unique index on `purchase_id`.
- `app/api/affiliates/stripe/{connect,dashboard,refresh}/route.ts` — Stripe Connect Standard onboarding flow for the affiliate.

**The one real gap:** the affiliate lifecycle cron is NOT in `vercel.json`. Current `crons` are: `/api/cron/drip`, `/api/cron/abandonment`, `/api/cron/dropoff`, `/api/cron/review`. No entry for `/api/cron/affiliate`. The route exists and would run if invoked manually or scheduled, but Vercel is not invoking it on schedule today.

**Work to close it:** ~15 minutes
- Add one block to `vercel.json` crons array:
  ```
  { "path": "/api/cron/affiliate", "schedule": "0 12 * * *" }
  ```
  (Noon UTC — outside the existing 13/14/15/16 UTC window so the cron load is staggered.)
- Confirm `CRON_SECRET` env var is set in Vercel (likely already is — the 4 existing crons use it).
- Deploy. Watch the first invocation on Vercel's logs to confirm it runs cleanly.

**Optional follow-on (~2-3 hours):**
- Add monitoring — Sentry-instrument the cron and the payout-batch action so failures surface without manual log inspection.
- Add an admin-facing "last cron run" timestamp on the affiliates admin page so the partnerships lead can confirm health at a glance.

---

## Gap 3 — Link-level click tracking (FULLY BUILT)

**What exists:**

- `app/r/[slug]/route.ts` — on every click:
  1. Loads the link by slug from `affiliate_links` (404 if inactive, expired, or unknown).
  2. Inserts a row into `affiliate_clicks` with `link_id`, `affiliate_slug`, `ip_hash` (salted), `user_agent`, `referrer`, `visitor_id` (1-year cookie for de-dup).
  3. Logs an `affiliate_clicked` event via `logEvent`.
  4. Builds the destination URL with the link's UTMs preserved.
  5. 302-redirects.
  6. Sets the `aesdr_attribution` cookie (httpOnly, 30-day TTL) containing the `link_id` + `click_id`.
- `app/api/checkout/route.ts` reads the attribution cookie and passes `affiliate_link_id` + `affiliate_click_id` as Stripe session metadata.
- The webhook (above) writes the attribution row when checkout completes.

**The attribution chain end-to-end:**

```
click  →  /r/[slug]  →  affiliate_clicks row + cookie + redirect
buy    →  /api/checkout reads cookie  →  Stripe session metadata
paid   →  webhook reads metadata  →  affiliate_attributions row (pending)
+30d   →  cron promotes pending → cleared
batch  →  admin runs runAffiliatePayoutBatch → Stripe transfer → status=paid
refund →  webhook → status=refunded (clawback)
```

**Remaining work:** none. The chain is closed.

**Optional follow-on (~1-2 hours):**
- The OS doc referenced a table called `affiliate_link_clicks`. The actual table is `affiliate_clicks` (created in `20260519_affiliate_backend.sql`). Update the OS doc copy block + the dispatch line for the Day 35-37 task to match the real column names.

---

## Rollup — total remaining build effort

| Gap | Status | Effort to close |
|---|---|---|
| 1. Partner self-serve dashboard | Built; polish only | 4-6 hours (optional) |
| 2. Payout scheduling | Pipeline built; cron not scheduled | **15 min + 2-3 hours optional monitoring** |
| 3. Link-click tracking | Built end-to-end | 0 hours; ~1-2 hours optional OS-doc cleanup |
| **Minimum to call the system "complete"** | | **~15 minutes** |
| Reasonable polish pass | | ~8-12 hours total |

---

## Implication for the Day 22 build-vs-buy decision

The Day 22 attribution-platform decision was originally framed as: "extend the custom system (large build effort) vs. adopt Rewardful at $49/mo." The build effort is much smaller than the OS doc assumed. The honest framing now:

- **Custom system today:** functional end-to-end. One config line away from full automation. Marginal polish backlog is 8-12 hours.
- **Rewardful at $49/mo Starter:** would provide visual polish on the partner dashboard, an out-of-box dispute/payout workflow, and removes ongoing maintenance from the partnerships lead's plate. Adds a monthly cost. Adds an integration risk (webhook reliability, Stripe connection re-mapping).
- **Recommendation for the Day 22 memo:** **stay on custom**, at least through Phase 30 and likely Phase 60. The marginal effort to close the actual remaining work (15 minutes + ongoing polish as the partner cohort grows) is lower than the integration risk of swapping. Re-evaluate at Phase 90 if any of these triggers fire:
  1. Active affiliate count exceeds 25 and the dashboard polish backlog becomes the bottleneck.
  2. "Where's my dashboard?" inquiries exceed 2 per week.
  3. A Stripe Connect edge case (account de-activation, dispute, OFAC) requires functionality the custom code doesn't have.

These trigger conditions belong in the Day 22 memo verbatim.

---

## Versioning

| Version | Date | Author | Notes |
|---|---|---|---|
| 1.0 | 2026-05-31 | partnerships lead | Initial audit. Found the three "gaps" in the OS doc are substantially closed. The only unfinished item is scheduling `/api/cron/affiliate` in `vercel.json`. Updates the framing of the Day 22 build-vs-buy decision. |

**How to update:** when any of the trigger conditions fire (active affiliate count, dashboard inquiry rate, edge-case requirement), open a PR titled `partnerships: attribution build-cost — <topic>` and update the rollup table + the recommendation accordingly.
