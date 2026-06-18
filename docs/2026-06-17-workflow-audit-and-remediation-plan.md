# AESDR — Workflow Audit & Remediation Plan
*Adversarial audit, 2026-06-17. Grounded in code, not memory.*

## What this is
A consolidated punch-list of everything **two rounds** of adversarial auditing found across every workflow, plus the gaps the flow-chart exercise surfaced. Round 1 ran three passes (buyer/payments · affiliate/operator/money · enterprise/security/systemic). Round 2 ran a second, broader sweep across the workflows *and* the rest of the app for gaps, broken promises, and unfinished wiring — and it surfaced the heaviest findings in the doc: the **product-delivery layer** (curriculum depth + end-of-course artifacts) is wired but never invoked, and the **affiliate commission rate is misrepresented** to the people the system pays. Each item is evidence-backed (`file:line`), severity-ranked, and phased so it can be run methodically. **The money-, deploy-, and delivery-breaking items were re-verified against the source by hand** (marked ✅).

## How to use it
Work top-down by phase. Each item has a `[ ]` you tick when its **Done-when** is met. Don't start a later phase before its blockers (noted in **Depends**) are closed. Effort: **S** ≈ <½ day · **M** ≈ ½–2 days · **L** ≈ multi-day.

## Scoreboard
| Severity | Count | Meaning |
|---|---|---|
| 🔴 Critical | 8 | Loses money, charges without delivering, or breaks a fresh deploy. Do first. |
| 🟠 High | 19 | A real workflow is broken or a user-/founder-facing wire is dead. |
| 🟡 Medium | 22 | Degraded, silent-failure, or correctness gaps with limited blast radius. |
| ⚪ Low | 10 | Cleanup, cosmetics, hardening. |

> **Cross-cutting theme #1 (Round 1):** the partnership/agent subsystem is built to *fail silently by design* — fail-safe-OFF switches, best-effort `try/catch` swallows, console-only logging, and some schema created out-of-band. Safe for "don't send bad outreach," but it means broken infrastructure (unapplied migrations, a missing webhook, an unscheduled cron) is **invisible at runtime.** Several fixes below are really about making failure *loud*.
>
> **Cross-cutting theme #2 (Round 2):** the **delivery layer is built but not connected.** The artifact engine, the three-units-per-lesson structure, and the $40 unlock all exist as code and schema — but nothing *invokes* them: no caller generates the artifacts, no navigation reaches units 2 & 3, and the commission number the code uses isn't the one every buyer-facing surface promises. These aren't bugs in a feature; they're features that were wired and never plugged in. The buyer pays for the whole thing and reaches the end to find the last third missing.

---

## PHASE 0 — Critical: money, data integrity, delivery, deploy

> **Run order (Round-2 reframing):** start with **Part A** — the four product-integrity Criticals. They're the difference between "the buyer gets what they paid for" and "they don't," and three of them are pure broken-wiring (cheap relative to blast radius). Then **Part B** — the money/deploy Criticals (P0-1…P0-4). The Part-B IDs and their downstream `Depends` chains (P1-1, P0-3, P2-6, P2-9) are unchanged; only the physical order moved.

### Part A — Product-integrity Criticals · *the buyer paid; does the product deliver?*

### [ ] P0-5 · The end-of-course artifacts never generate — nothing triggers generation  🔴 ✅verified
- **Where:** `generateArtifacts` (`lib/artifacts/generate.ts:56`) has exactly one caller — `POST /api/artifacts` (`app/api/artifacts/route.ts:67`) — and **nothing in the app ever POSTs `/api/artifacts`** (grep: zero `fetch` to it). The reveal pick (`app/reveal/RevealView.tsx:55`) POSTs `/api/reveal`, which only writes `reveal_picks` and redirects (`app/api/reveal/route.ts:34-54`) — no generation. The artifact pages read `GET /api/artifacts` → `getCachedArtifact` → 404 "Artifact not ready yet."
- **Wrong:** generation is fully built but never invoked; the cache the pages read is never populated.
- **Impact:** the entire end-of-course payoff — **Diagnostic / Playbill / Redline** (the "substantial assets") — resolves to "not ready yet" for every buyer. The reward the whole course climbs toward, and the thing the $40 unlock sells (P1-16), does not exist at runtime.
- **Fix:** invoke `POST /api/artifacts` at the right moment — on course-completion and/or first artifact-page load — gated on completion (P1-8), with a generating state and a backfill on the reveal pick.
- **Done when:** finishing the course produces a real Diagnostic/Playbill/Redline the artifact page renders. **Effort:** M · **Depends:** P0-6 (constraint blocks the write), P1-8 (completion gate)

### [ ] P0-6 · `generated_artifacts` CHECK constraint rejects the real artifact types  🔴 ✅verified
- **Where:** `supabase/migrations/20260413_generated_artifacts.sql:7` — `CHECK (artifact_type IN ('diagnostic','playbook','mirror'))`. The code writes/reads `diagnostic` / **`playbill`** / **`redline`** (`app/api/artifacts/route.ts:31`, `lib/artifacts/*`). The artifacts were renamed Playbook→Playbill, Mirror→Redline; the constraint was never migrated.
- **Wrong:** inserting a `playbill` or `redline` row violates the CHECK — generation throws even after P0-5 is fixed.
- **Impact:** a hidden second floor under P0-5. Wiring the trigger alone still 500s on every non-diagnostic artifact.
- **Fix:** dated migration to set the constraint to `('diagnostic','playbill','redline')`. **Verify the live column first** — like `course_progress` (P0-4), this table may have been altered out-of-band, in which case prod already accepts the new types and only `migrations/` is stale.
- **Done when:** a `playbill`/`redline` row inserts cleanly *and* `migrations/` matches prod. **Effort:** S · **Depends:** — *(do before/with P0-5)*

### [ ] P0-7 · Units 2 & 3 are stranded — the lesson "completes" after one-third  🔴 ✅verified-structural
- **Where:** `app/course/[lessonId]/page.tsx:99-114` selects exactly one unit (`?unit=` → saved `stateData.unit` → `units[0]`) and renders a single iframe with **no unit-navigation UI.** `?unit=` is set nowhere in the product — only in `tests/e2e/full-journey.spec.ts:73`. The unit-1 file fires `aesdr:complete` for the **whole lesson** at its last screen (`content/lessons/html/lesson-03/aesdr_course03_1_v1.html:2044`) and its terminal CTA navigates to `/dashboard` (`:1603`). No lesson HTML or component links to `?unit=2`/`units/2` (grep returned only the test).
- **Wrong:** the player loads only unit 1 of each lesson, marks the lesson complete at the end of unit 1, and exits to the dashboard. Units 2 & 3 (`aesdr_courseXX_2_v1.html` / `_3_v1.html`) load only by hand-typing `?unit=2`.
- **Impact:** the product is sold as **36 units / "three sub-units per lesson"** (`app/artifacts/redline/RedlineView.tsx:236` "12 courses · 36 lessons"; `AESDR_ENTERPRISE_CANON.md:581` "12 courses / 36 sub-lessons"; partner-hub spec "36 units total"; the D30 host-read script "twelve lessons, thirty-six units"). In product, **24 of 36 units never load**, and "course complete" — which gates the reveal, the artifacts, and the alumni track — is satisfied after one-third of each lesson.
- **Fix:** add unit-to-unit navigation (advance `?unit=`/`stateData.unit` on unit completion; move `aesdr:complete` to the final unit only; render a unit list / next-unit control). **Verify the other 11 unit-1 files share this terminal behavior** before sizing.
- **Done when:** a buyer reaches units 2 & 3 in-product and "complete" requires all three. **Effort:** L · **Depends:** — *(interacts with P1-4 completion-event unification)*

### [ ] P0-8 · Affiliates are promised 40% but the code pays 30% — in the kit, the contract, and the emails the system sends  🔴 ✅verified
- **Where:** code pays **30%** — `lib/affiliate.ts:25` `DEFAULT_COMMISSION_RATE = 0.3`, applied in the webhook (`app/api/webhooks/stripe/route.ts:283`, stored `:292`). Surfaces promise **40%** — the public calculator `app/affiliates/calculator/Calculator.tsx:13` (`const COMMISSION = 0.4`; copy `:64,171`) + `app/affiliates/calculator/page.tsx:8`; the kit (`KitDocWhatYouEarn.tsx`, `KitDocSampleAgreement.tsx`); the contract-styled `content/affiliate-kit/sample-partnership-agreement.md`; and **the outreach emails the system sends** — `lib/partnerships/outreach-templates.ts:48,59,70,215,228` ("40% commission on a 30-day attribution window, paid clean through Stripe"). 30% also appears in `app/affiliates/program/page.tsx` + `economics/page.tsx` (so the site contradicts itself, too).
- **Wrong:** a 10-point gap between what affiliates are told — including a "sample partnership agreement" and cold first-touch emails — and what they're actually paid.
- **Impact:** every affiliate who does the math off the calculator/kit/agreement is underpaid by a quarter against the promise. The outreach templates make it a **written misrepresentation to people the system cold-mailed.**
- **Fix:** pick the real number and make `lib/affiliate.ts` the single source the calculator + kit import. If 40%, set the constant to `0.4` and re-check payout math + Stripe-fee handling; if 30%, sweep every 40% surface incl. outreach-templates + the agreement md. Decide net-vs-gross-of-Stripe-fees and state it once (see P2-16).
- **Done when:** one rate, asserted in a test, shown identically everywhere including the sent emails. **Effort:** M · **Depends:** —

### Part B — Money & deploy Criticals

### [ ] P0-1 · Payout batch can double-transfer real money  🔴 ✅verified
- **Where:** `lib/stripe-connect.ts:124-132`, `app/actions/affiliate.ts:503-587`
- **Wrong:** `stripe.transfers.create({…})` is called with **no `idempotencyKey`**; the batch selects `status='cleared'` rows, inserts a `processing` payout, transfers, then marks `paid` *after*. A re-clicked payout, a Server-Action retry, or two concurrent runs each read the same `cleared` rows and each fire a real transfer.
- **Impact:** an affiliate is paid twice. Unrecoverable without a clawback.
- **Fix:** pass `{ idempotencyKey: 'payout:'+payout.id }`; before transferring, atomically claim rows (`update … set status='processing' where status='cleared'` and operate only on claimed ids); refuse if a non-failed payout already exists for those ids.
- **Done when:** a forced double-run / double-click transfers **at most once**. **Effort:** M · **Depends:** —

### [ ] P0-2 · Refunds-after-paid and chargebacks never claw back commission  🔴 ✅verified
- **Where:** `app/api/webhooks/stripe/route.ts:345-355` (refund), `:391-410` (dispute)
- **Wrong:** `charge.refunded` flips attribution only `.in('status',['pending','cleared'])` — an already-`paid` attribution stays paid. `charge.dispute.created` updates `purchases.status='disputed'` but **does not touch `affiliate_attributions` at all.**
- **Impact:** you pay (or keep paid) 30% commission on revenue you refunded or lost to a chargeback, with no reversal path.
- **Fix:** on dispute, flip matching attributions to `reversed`/`clawback`; on refund of an already-`paid` attribution, write a negative/clawback ledger row (net against the next payout).
- **Done when:** a refund or dispute on a paid sale produces a clawback the next payout nets out. **Effort:** M · **Depends:** —

### [ ] P0-3 · The admin "refund" button issues no refund and doesn't flip attribution  🔴 ✅verified
- **Where:** `app/api/admin/refund/route.ts:36-40`
- **Wrong:** it's a single `purchases.update({status:'refunded'})`. **No Stripe `refunds.create`, no attribution flip.** (Auth itself is sound: origin + `isAdminEmail` + rate-limit.)
- **Impact:** the customer loses access but is **not given their money back** (chargeback/complaint risk), and the affiliate is still paid (commission clears on a "refunded" sale). This is the operator-facing path — the one a human actually clicks.
- **Fix:** make the button call Stripe to issue the real refund and let the resulting `charge.refunded` webhook (after P0-2) do the DB + attribution flips. Or, at minimum, replicate the attribution flip here and rename if it's truly access-revoke-only.
- **Done when:** clicking refund refunds the card and reverses the commission. **Effort:** M · **Depends:** P0-2

### [ ] P0-4 · `course_progress` has no `CREATE TABLE` migration — a fresh deploy is broken  🔴 ✅verified
- **Where:** `supabase/migrations/*` (no create-table for `course_progress`; only `ALTER`/RLS), used by all of course-progress + artifact generation + the `merge_lesson_progress` RPC.
- **Wrong:** the table exists only because it was created out-of-band. A DB rebuilt purely from `migrations/` has no `course_progress`.
- **Impact:** every progress read/write and artifact generation fails on a from-scratch environment (staging rebuild, disaster recovery, new region).
- **Fix:** commit the real `CREATE TABLE course_progress (…)` DDL as a dated migration matching production's live schema.
- **Done when:** `migrations/` alone can stand up a working DB. **Effort:** S · **Depends:** — *(needs a peek at the live table definition)*

---

## PHASE 1 — High: broken wires users & the founder actually hit

### [ ] P1-1 · Move the payout out of a Server Action (it can be killed mid-transfer)  🟠
- **Where:** `app/admin/tower/actions.ts:316-320` (`executePayout`) → `app/actions/affiliate.ts:503`
- **Wrong:** Stripe transfer + multi-row writes + email run in a `"use server"` action with no `maxDuration`. Killed after `transfers.create` but before `status='paid'` → torn write → **next run pays again** (compounds P0-1).
- **Fix:** route handler with explicit `maxDuration` + the idempotency/claim from P0-1 + a reconcile step that detects an existing transfer before re-sending.
- **Done when:** an interrupted payout is safely resumable, never double-paid. **Effort:** M · **Depends:** P0-1

### [ ] P1-2 · Inbound-email webhook doesn't exist → sentinel & follow-up reply-detection are dead in practice  🟠 ✅verified
- **Where:** `app/api/webhooks/` contains only `stripe/`. `partner_inbound_email` is **read** by `sentinel/route.ts:120,180`, `followup/route.ts:93`, candidate room `:135` — **never written** in-repo. The migration (`20260605_partner_agent_infra.sql:12-16`) names a writer route that doesn't exist; the director plan claims the pipe is "live and tested."
- **Impact:** unless an out-of-repo email worker writes directly to Supabase, the table is always empty → **bright-signal alerts never fire** and the **follow-up ladder never halts on a real reply.**
- **Fix:** build `app/api/webhooks/inbound-email` (or confirm + **document** the external Cloudflare worker's direct-write, and add a smoke test).
- **Done when:** a real inbound reply lands a `partner_inbound_email` row and trips sentinel. **Effort:** M · **Depends:** — *(verify the external worker first)*

### [ ] P1-3 · Enterprise-intent signals never reach the tower board (event-name mismatch)  🟠 ✅verified
- **Where:** `sentinel/route.ts:97` expects `enterprise_intent_submitted`; client + `/x/track:76` emit `kit_enterprise_intent_submitted`.
- **Impact:** a high-intent enterprise-track submission emails the founder but **never becomes a `partner_signals` row** → invisible on the board and in the almanac count.
- **Fix:** add `kit_enterprise_intent_submitted` to the bright-event set (or normalize the names).
- **Done when:** an enterprise-track submit shows on the tower board. **Effort:** S · **Depends:** —

### [ ] P1-4 · Unify course completion so the iframe path fires `course_completed`  🟠 ✅verified
- **Where:** iframe completion `app/api/progress/complete/route.ts` emits **no events**; the all-12 gate + `course_completed`/`lesson_completed` live only in `app/actions/progress.ts:39-66` (manual button).
- **Impact:** for normal (iframe) users the completion event never sets → anything gated on it can't fire. Also makes the events table an unreliable completion record.
- **Fix:** emit the events (and run the all-12 gate) from `/api/progress/complete`, ideally via a shared helper both paths call.
- **Done when:** finishing lesson 12 in-product emits `course_completed`. **Effort:** M · **Depends:** — *(blocks P1-6, P2-1)*

### [ ] P1-5 · Schedule the `retention` cron — 5 lifecycle emails are dead  🟠 ✅verified
- **Where:** `app/api/cron/retention/route.ts` (the sole caller of lesson-nudge, weekly-framing, win-back, 6/12-mo alumni) is **absent from `vercel.json`**.
- **Impact:** zero lesson-completion nudges, Sunday framing, 45-day win-back, alumni re-engagement.
- **Fix:** add `{ "path": "/api/cron/retention", "schedule": "0 17 * * *" }` (it self-gates Sundays + is idempotent via the events table).
- **Done when:** the cron runs and the four emails fire on their windows. **Effort:** S · **Depends:** P1-4 (the alumni branch needs a reliable `course_completed`)

### [ ] P1-6 · "Pause me" must actually pause the running crons  🟠 ✅verified
- **Where:** `paused_until` written `app/actions/pause.ts:27`, honored **only** by the unscheduled `retention` cron (`:70-77`). `drip`/`dropoff`/`review` never check it.
- **Impact:** a buyer who pauses still gets day-3/7 drip and 5/10/21-day dropoff nags — the opposite of the promise.
- **Fix:** add the `paused_until` filter to `drip`, `dropoff`, `review` (centralize one `isPaused` helper).
- **Done when:** a paused buyer receives nothing from any cron. **Effort:** M · **Depends:** —

### [ ] P1-7 · Apply form can't acknowledge applicants — it collects no email  🟠 ✅verified
- **Where:** `components/affiliates/ApplicationForm.tsx:36-44` (name/audience/channel/size/link — **no email**); `app/api/affiliates/apply/route.ts` notifies the founder only; the page promises "a yes-or-no within 5 business days."
- **Impact:** applicants get zero confirmation and the founder has no address to send the promised decision.
- **Fix:** add an email field to the form + table; add a `sendApplicantAcknowledgement`; send it on submit.
- **Done when:** an applicant gets a "we got it" email and the founder can reply. **Effort:** M · **Depends:** —

### [ ] P1-8 · Gate the artifacts API on completion  🟠 ✅verified-ish
- **Where:** `app/api/artifacts/route.ts` GET/POST check only `auth.getUser()`; `/reveal` is gated but the API + artifact pages aren't.
- **Impact:** any logged-in buyer can generate/pull their end-of-course "keeper" without finishing — the reward gate is cosmetic.
- **Fix:** add the all-12 `course_progress` check (mirror `app/reveal/page.tsx`), with the same founder-bypass cookie.
- **Done when:** a non-completer gets 403 from the artifact API + pages. **Effort:** S · **Depends:** —

### [ ] P1-9 · Workshop reminders go to a placeholder, not registrants  🟠 ✅verified
- **Where:** `app/api/cron/usher/route.ts:27-28,147,175,196` send all stages `to: WORKSHOP_REGISTRANT_GROUP_ADDR || hello@aesdr.com`; usher reads `partner_workshop` (state only), never `workshop_registrants`. The confirmation email promises reminders that never arrive; no calendar invite is generated.
- **Impact:** registrants get zero reminders/replay.
- **Fix:** fan out per-registrant (idempotency key `workshop:<id>:<stage>:<registrantId>`), reading `workshop_registrants`; generate a real calendar invite or fix the copy.
- **Done when:** each registrant gets their own T-48h/T-1h/replay. **Effort:** M · **Depends:** —

### [ ] P1-10 · Webhook idempotency is non-atomic → double welcome/receipt on retries  🟠 ✅verified
- **Where:** `app/api/webhooks/stripe/route.ts:163-169` (SELECT-then-`isNewPurchase`), emails gated at `:245-257`.
- **Impact:** concurrent Stripe retries both compute `isNewPurchase=true` → duplicate welcome + receipt (+ possible duplicate attribution events).
- **Fix:** gate "first processing" on an atomic signal — insert-and-catch-unique-violation, or a `processed_at` claim.
- **Done when:** a replayed event sends nothing twice. **Effort:** M · **Depends:** —

### [ ] P1-11 · `partner_kit_*` column drift hard-fails kit links  🟠 ✅verified
- **Where:** migration `20260509_partner_kit_gate.sql` defines `partner_slug`; `lib/affiliate-kit-tokens.ts:104,118,139,168` read/write `affiliate_slug`; no rename migration (`20260522` renamed the affiliate_* tables, not the kit tables). These writes **throw** (not best-effort).
- **Impact:** if the live column wasn't renamed out-of-band, minting/verifying private-kit links + the access audit hard-fail with "column does not exist."
- **Fix:** add a rename migration for `partner_kit_tokens`/`partner_kit_access` (or fix the code to match the live column — verify which is live first).
- **Done when:** code column names == live + migrations agree. **Effort:** S · **Depends:** — *(verify live schema)*

### [ ] P1-12 · `NEXT_PUBLIC_SITE_URL` silently defaults to prod at ~15 sites  🟠 ✅verified-pattern
- **Where:** `app/api/checkout/route.ts:33`, `app/api/admin/refund/route.ts:12`, `lib/stripe-connect.ts:34`, `app/login/page.tsx:63`, +more.
- **Impact:** on any preview/staging where it's unset, Stripe success/cancel redirects, login callbacks, and same-origin POST guards silently target **production**.
- **Fix:** fail-fast (throw at boot) if unset outside production.
- **Done when:** a misconfigured env refuses to run rather than pointing at prod. **Effort:** S · **Depends:** —

### [ ] P1-13 · Rate limiting evaporates to per-instance memory without Upstash  🟠 ✅verified
- **Where:** `lib/rate-limit.ts:30-34` falls back to in-memory if `UPSTASH_*` unset.
- **Impact:** on serverless, global limits (coming-soon brute-force, checkout, refund, enterprise-inquiry) become per-cold-instance ≈ ineffective, silently.
- **Fix:** require Upstash in production (or alert loudly if absent).
- **Done when:** prod refuses to boot without a real rate-limit backend. **Effort:** S · **Depends:** —

### [ ] P1-14 · Strike counter re-pause trap + non-active no-op  🟠 ✅verified
- **Where:** `app/actions/affiliate.ts:413-435` — `sameCategoryCount` counts **lifetime** same-category strikes; `shouldPause` requires `status='active'`.
- **Impact:** a reactivated affiliate is re-paused on the *very next* same-category decline; a `vetting`/`paused` affiliate accrues strikes that never trigger the pause.
- **Fix:** count only strikes since last reactivation; define intended behavior for non-active states.
- **Done when:** a reactivated affiliate gets a fresh 3-strike window. **Effort:** M · **Depends:** —

### [ ] P1-15 · Diagnostic category scores are always 0% (key mismatch)  🟠 ✅verified
- **Where:** `lib/artifacts/extract.ts:157` reads `extra.exerciseScores` and `:165` `extra.quizScore`; the lessons write a different key — `AESDR.setExtra('exercises', scores)` (`content/lessons/html/lesson-03/aesdr_course03_1_v1.html:1885`).
- **Impact:** the per-category breakdown in the Diagnostic sums keys that never exist → **every category resolves to 0%.** Masked today by P0-5, but it surfaces the instant artifacts generate — an authoritative-looking scoreboard that's uniformly, confidently wrong.
- **Fix:** align the keys (read `exercises`/`quiz`, or have lessons write `exerciseScores`/`quizScore`); add a fixture test built from a real saved `state_data` row so it can't silently drift again.
- **Done when:** a completed course yields non-zero, correct category percentages. **Effort:** S · **Depends:** P0-5

### [ ] P1-16 · The $40 artifact unlock grants access to an artifact that's never produced  🟠 ✅verified
- **Where:** `components/UnlockArtifactTile.tsx:26` → `/api/checkout` `tier:'artifact_unlock'` (`app/api/checkout/route.ts:17,52,64`) → webhook writes an `artifact_unlocks` row (`app/api/webhooks/stripe/route.ts:85-94`). The unlocked artifact is never generated (P0-5).
- **Impact:** a buyer can be charged $40 to "unlock" the second artifact and receive a grant row pointing at content that doesn't exist. (Also: if `STRIPE_PRICE_ID_ARTIFACT_UNLOCK` is unset, checkout 400s "Invalid tier" — verify it's configured.)
- **Fix:** downstream of P0-5 — guarantee the unlock triggers generation of the purchased type; until P0-5 lands, hide the unlock CTA rather than sell a no-op.
- **Done when:** paying for the unlock yields the artifact. **Effort:** M · **Depends:** P0-5

### [ ] P1-17 · The success page strands the buyer after 30s; `/signup` recovery is unverified  🟠 ✅verified-behavior
- **Where:** `app/success/page.tsx:69-77` polls `/api/purchase-status` every 2s and **gives up at 30s** → "Purchase processing"; the only recovery offered is "create an account manually" → `/signup` (`:363-366`). Credentials + welcome email are webhook-driven.
- **Impact:** if the webhook lags or fails, the buyer is charged, sees "processing," gets no credentials or email, and is handed `/signup` — which only helps if signup links an existing purchase by email. If it doesn't, that's **paid-with-no-access and no self-serve recovery.**
- **Fix:** verify (or build) the `/signup`→existing-purchase linkage; lengthen/retry the poll; add an explicit "charged but not provisioned" reconcile + a real support escalation.
- **Done when:** a delayed/failed webhook still lands the buyer in the course, or shows a real recovery (not a dead `/signup`). **Effort:** M · **Depends:** P1-10 *(idempotency is adjacent)*

---

## PHASE 2 — Disconnected funnels, dormant rewards, robustness

### [ ] P2-1 · Wire (or delete) the dormant completion emails  🟡 ✅verified
- **Where:** `sendRevealUnlockedEmail` (`lib/email.ts:2269`) and `sendLessonCompleteEmail` (`:2094`, holds the lesson-12 **Discord invite** — which also lives on `/alumni`) have **zero call sites**.
- **Fix:** wire `sendRevealUnlockedEmail` to `course_completed`; wire `sendLessonCompleteEmail` to per-lesson completion — or delete both.
- **Done when:** finishing the course emails the reveal + opens Discord by email (or the dead code is gone). **Effort:** M · **Depends:** P1-4

### [ ] P2-2 · Day-0 +12h / +36h activation emails are unwired  🟡 ✅verified
- **Where:** `sendDay0PlusTwelveHours` / `sendDay0PlusThirtySixHours` (`lib/email.ts:1584,1624`) — no call sites; the drip cron only does day3/day7.
- **Fix:** wire into the drip cron (or delete).  **Done when:** decided + acted. **Effort:** S · **Depends:** —

### [ ] P2-3 · Free-lead capture is a dead end  🟡 ✅verified
- **Where:** `app/api/free/manager-archetype-map/route.ts` sends one asset; nothing ever reads `free_leads` again; `converted_purchase_id` never written.
- **Fix:** add a free-lead nurture (drip → buy) **or** document it as one-shot and stop implying a funnel. *(This is the orphaned capture I wrongly drew on the buyer path — it belongs on a marketing/lead map.)*
- **Done when:** free leads either get nurtured or are explicitly one-shot. **Effort:** M · **Depends:** —

### [ ] P2-4 · Always write the `checkout_sessions` row (abandonment blind spot)  🟡
- **Where:** `app/api/checkout/route.ts` wraps the insert in `if (email)`; abandonment keys off `checkout_sessions.user_email`.
- **Fix:** always insert (email nullable), backfill from the webhook.  **Effort:** S · **Depends:** —

### [ ] P2-5 · Team seat limit is non-atomic  🟡
- **Where:** `app/api/team/invite/route.ts:55-62` count-then-insert; accept path doesn't re-check `max_seats`; pending/declined rows consume quota.
- **Fix:** enforce seats in a locked transaction on accept; exclude expired/declined from the count. **Effort:** M · **Depends:** —

### [ ] P2-6 · Handle failed payments & dispute-loss webhook events  🟡 ✅verified
- **Where:** webhook handles only `checkout.session.completed`, `charge.refunded`, `account.updated`, `charge.dispute.created`.
- **Fix:** add `payment_intent.payment_failed` / `checkout.session.async_payment_failed` (mark/alert) and `charge.dispute.funds_withdrawn` (finalize the clawback from P0-2). **Effort:** M · **Depends:** P0-2

### [ ] P2-7 · Post-charge email failure leaves the buyer charged & silent  🟡
- **Where:** webhook welcome/receipt in a `try/catch` that only Sentry-logs (`:246-256`); a transient send failure at first-processing → those emails are **never** sent (no backfill).
- **Fix:** an outbox/retry for post-charge welcome + receipt. **Effort:** M · **Depends:** —

### [ ] P2-8 · SMS: consent collected, channel doesn't exist  🟡 ✅verified
- **Where:** `phone_e164`/`sms_opted_in` stored, `sms_enabled` toggled (`affiliate.ts:756`), but **no SMS sender anywhere**; the workshop confirmation promises SMS reminders.
- **Fix:** build the sender **or** stop collecting numbers/consent and soften the copy (compliance risk to collect for a dead channel). **Effort:** M (build) / S (remove). · **Depends:** —

### [ ] P2-9 · Payout reconciliation gaps  🟡 ✅verified
- **Where:** `markPayoutPaid` (`affiliate.ts:105-150`) vs the batch — no per-affiliate lock, no check that attributions aren't already on another payout. Almanac counts "payouts ready" without filtering `stripe_account_status='enabled'` (`almanac:45` vs `affiliate:510`) → the digest reports runs that error.
- **Fix:** restrict `markPayoutPaid` to non-in-flight states + claim attributions on payout insert; filter almanac on enabled. **Effort:** M · **Depends:** P0-1

### [ ] P2-10 · Paused-affiliate recovery + reactivation email  🟡 ✅verified
- **Where:** a paused affiliate is blocked at `submitAffiliateCopy:170` with no self-unpause; `paused→active` (`setAffiliateStatus`) sends no email.
- **Fix:** an explicit reactivate path that resets the strike window + a reactivation email. **Effort:** S · **Depends:** P1-14

### [ ] P2-11 · Add error monitoring to the agent pipeline  🟡 ✅verified
- **Where:** only `drip` + `retention` call Sentry; courier/scribe/followup/usher/sentinel/almanac/dossier-enrich/contact-finder + `lib/partnerships/*` + `partner-alerts` use `console.error` only.
- **Fix:** wrap cron catch blocks + swallow sites with `Sentry.captureException`; add the `partner_outbound_queue` `failed` count to the almanac digest (no auto-retry today).
- **Done when:** a broken agent shows up in Sentry, not just Vercel logs. **Effort:** M · **Depends:** —

### [ ] P2-12 · Unify env-var missing behavior (fail loud)  🟡 ✅verified
- **Where:** `EMAIL_RECIPIENT` silently falls back on the enterprise path but silently *drops* three other notifications (`lib/email.ts:165-169,694-700,818-824`); `PARTNER_ALERT_EMAIL`/`WORKSHOP_REGISTRANT_GROUP_ADDR` hardcoded fallbacks.
- **Fix:** a startup/health check for required notification env vars; prefer fail-loud over silent drop. **Effort:** S · **Depends:** —

### [ ] P2-13 · The 14-day refund window is unenforced  🟡
- **Where:** the refund policy promises a 14-day window (`/refund-policy`); the admin refund path (P0-3) applies **no time check**; there is no self-serve refund route.
- **Impact:** the window exists only as copy — honored at manual founder discretion, with nothing enforcing it either way. A day-1 request and a day-40 request look identical to the system.
- **Fix:** when the refund button becomes real (P0-3), check purchase age against the window; decide self-serve vs manual-only and align the copy. **Effort:** S · **Depends:** P0-3

### [ ] P2-14 · Free manager-archetype-map: delivery vs promise  🟡 *(verify copy/asset)*
- **Where:** `app/api/free/manager-archetype-map/route.ts` + the capture-form copy (`app/free/manager-archetype-map/EmailCaptureForm.tsx`). Confirm what's promised (a PDF? five archetypes?) against the single asset actually emailed.
- **Impact:** a broken promise on the top-of-funnel freebie erodes trust *before* purchase. Pairs with P2-3 (the capture is also a dead end).
- **Fix:** reconcile the asset to the promise (or soften the promise to the asset). **Effort:** S · **Depends:** — *(read exact copy + sent asset)*

### [ ] P2-15 · Weekly-nudge opt-in is collected but never acted on  🟡 ✅verified-ish
- **Where:** the weekly-nudge / Sunday-framing opt-in's only sender is the **unscheduled** `retention` cron (P1-5) / its dormant framing branch.
- **Impact:** users who opt into a weekly nudge get nothing — another consent-collected-channel-dead pattern (cf. P2-8 SMS).
- **Fix:** falls out of P1-5 (schedule retention); confirm the opt-in flag is actually read by the sender. **Effort:** S · **Depends:** P1-5

### [ ] P2-16 · Money-copy inconsistencies: net-vs-gross + minimum payout  🟡
- **Where:** commission is described without a consistent net-vs-gross-of-Stripe-fees statement — `app/affiliates/payments/page.tsx:65` names the Stripe fee, while outreach says "paid clean through Stripe" (`outreach-templates.ts`); plus any "$50 minimum payout" claim vs the batch's actual threshold.
- **Impact:** affiliates can't reconcile expected vs received. Small, but it's money copy, and it compounds P0-8.
- **Fix:** state net-vs-gross once and the real minimum once, sourced from the same constants as P0-8. **Effort:** S · **Depends:** P0-8

---

## PHASE 3 — Consistency, dead code, hardening

- [ ] **P3-1 · Delete the dead inline-LLM Server Actions** ⚪✅ — `runScoutSweepAction`/`runDossierNow` (`actions.ts:384,590`) + orphaned `runScoutSweep`/`runDossier`; the live UI uses the route handlers. Removes two drifted research engines + duplicated `dossier_brief` writes. **M**
- [ ] **P3-2 · Delete dead lib exports** ⚪✅ — `extractOwnDomain`, `findEmailForCandidateId` (`email-finder.ts:87,460`), zero importers. **S**
- [ ] **P3-3 · Drop the phantom `lesson_nudge_last_id`** ⚪✅ — TS-interface-only (`retention/route.ts:35`), never migrated/used. **S**
- [ ] **P3-4 · Review-nudge uses the real name** ⚪✅ — `review/route.ts:89` hardcodes `'there'`; add `customer_name` to the select. **S**
- [ ] **P3-5 · Migration hygiene** 🟡✅ — verify every migration is applied (best-effort swallows hide unapplied ones: `email_checked_at` re-bills BetterContact each pass if missing; `dossier_brief`; `dossier_runs`/`scout_sweep_runs`); add migration state-tracking; remove the stale `_apply_all_affiliate_hub.sql` bundle (pre-rename `partner_slug`); tighten `tower/page.tsx:68-78` "migration missing == any error" conflation. **M**
- [ ] **P3-6 · Document or build the channel motion** 🟡✅ — every outbound cron filters `motion='affiliate'`; nothing consumes `motion='channel'`, so a pasted channel row sits inert. Enterprise is form→inbox, zero rails; `herald` is chat-only. Decide: document as unsupported, or build. Fix the misleading migration comment (`20260605:32`). **M**
- [ ] **P3-7 · Tighten the `affiliates` self-update RLS** ⚪✅ — `WITH CHECK` doesn't restrict columns despite the "display_name only" comment (`20260522_affiliates_entity.sql`). **S**
- [ ] **P3-8 · Env-var edge cases** ⚪✅ — `IP_HASH_SALT` predictable + inconsistent across two call sites; `SCRIBE_MIN_VOICE_FIT` → `NaN` on a non-numeric value silently breaks the draft filter. **S**
- [ ] **P3-9 · `affiliate_attributions.click_id` — use or drop** ⚪✅ — written (`webhooks/stripe:288`) from the click cookie, never read; either build click→purchase dedup/fraud or remove the machinery. **S**
- [ ] **P3-10 · The `verdict` field rename (optional)** ⚪ — the live UI now reads "the call," but the DB column / JSON property / `dossier_runs.verdict` are still `verdict` (consistent, no drift). Rename the plumbing only if you want it tidy. **S**
- [ ] **P3-11 · Reference-only `design-canon/**` mirrors live components** ⚪ — `design-canon/05-app-pages/*` + `design-canon/04-components/*` duplicate live files (`reveal--RevealView.tsx`, `UnlockArtifactTile.tsx`, …) and can silently drift from the real ones. Confirm `design-canon/**` is not imported/routable, label it "reference only," and remove or clearly mark stale copies. **S**

---

## Security: verify, don't assume

### Security — Round 2 (actionable)
### [ ] SEC-2 · `mintAction` / `revokeAction` don't call `requireAdmin()`  🟠 ✅verified
- **Where:** `app/admin/affiliate-kit/page.tsx:37-72` — both Server Actions import `mintToken`/`signToken` and write tokens (`revokeAction` sets `revoked_at`) but **neither calls `requireAdmin()`** (unlike every `/api/admin/*` route handler, which does).
- **Impact:** private-kit tokens could be minted/revoked without an admin auth check if these page-level actions are invocable by a non-admin.
- **Fix:** `await requireAdmin()` at the top of both actions (and any sibling page actions). **Done when:** a non-admin invocation is rejected. **Effort:** S
### [ ] SEC-3 · `/x/track` is an unauthenticated, service-role write endpoint  🟡 ✅verified
- **Where:** `app/(affiliate-experience)/x/track/route.ts:10,48` uses `createAdminClient()` (service-role) with **no `verifyCronAuth` / `requireAdmin` / `rateLimit` / origin check.**
- **Impact:** an open, service-role-backed writer (analytics/intent events that feed the tower board — see P1-3) is spoofable and floodable.
- **Fix:** validate origin + rate-limit + schema-validate the body; don't hand an unauthenticated route the service-role client — scope a least-privilege insert. **Effort:** S
### [ ] SEC-4 · `/x/*` bypasses every gate on prod, and the "doesn't exist on disk" comment is false  🟡 ✅verified
- **Where:** `proxy.ts:45-47` early-returns for `/x/*` past coming-soon + the lock; the inline comment claims "on main, those routes don't exist on disk." They **do** — `app/(affiliate-experience)/x/**` is in-repo, so they're served on the main deploy.
- **Impact:** the locked prospect experience and the unauth `/x/track` (SEC-3) are reachable on production even behind the coming-soon gate.
- **Fix:** gate `/x/*` behind `AFFILIATE_EXPERIENCE` (or an allowlist), or consciously accept it and correct the comment so the next reader isn't misled. **Effort:** S
### [ ] SEC-5 · `COMING_SOON` fails open + a bypass code is committed  ⚪ ✅verified
- **Where:** `proxy.ts:99` `process.env.COMING_SOON === "true"` (unset/typo ⇒ gate OFF); `.env.local.example:39` ships the literal `Bypass code 741407`.
- **Impact:** the holding-page gate fails open on misconfig (the bottom-of-proxy lock still catches non-allowlisted paths, but allowlisted surfaces go public). The example file documents a real-looking bypass code — the current mechanism is server-side, so it's *not* a live bundle leak, but it should be rotated + scrubbed.
- **Fix:** fail-loud if the gate var is malformed in a pre-launch env; rotate `COMING_SOON_BYPASS_CODE` and replace the literal in the example with a placeholder. **Effort:** S

### Round-1 security posture (verify, don't assume)
- [ ] **SEC-1 · Trace where `aesdr_bypass` is minted.** ✅ It's *read* as a paywall + reveal + artifacts + dashboard + course + tools bypass (8 sites + `proxy.ts:137`), but **no in-app setter showed up in grep** — meaning it's likely set by hand (founder devtools), which is safe. Confirm there is **no unauthenticated endpoint that sets it.** **S**
- ✅ **Confirmed sound (no action):** all 14 crons use timing-safe `verifyCronAuth`; all `/api/admin/*` use `requireAdmin`; `proxy.ts:106` excludes `/api/` from the *holding-page* redirect only (not auth) and is correctly scoped; the old no-auth `/api/admin/state` dump is removed; public routes (`checkout`, `purchase-status`, `workshop-register`, `affiliates/apply`, `kit-private/auth`) are legitimately public; RLS is service-role-only on all partner/affiliate tables.

## Could-not-verify-from-code (needs a live check)
- [ ] Are **all migrations actually applied** in production? (Several backstops are only as real as their unique indexes + the out-of-band tables.)
- [ ] Does the **external inbound-email worker** exist and write `partner_inbound_email`? (P1-2)
- [ ] Do the **model IDs** `claude-opus-4-6` / `claude-sonnet-4-6` resolve at the API? If not, scout/dossier silently fail into the caught error banner. (SDK is `@anthropic-ai/sdk@0.88.0`.)
- [ ] Is `WORKSHOP_REGISTRANT_GROUP_ADDR` a real list, or the `hello@` placeholder? (P1-9)
- [ ] Does the live `generated_artifacts` constraint already allow `playbill`/`redline` (altered out-of-band), or only `migrations/` is stale? (P0-6)
- [ ] Do the other **11 unit-1 lesson files** all fire `aesdr:complete` + exit to `/dashboard` like `lesson-03`'s? (P0-7 — confirms the blast radius is all 12, not one.)
- [ ] Does **`/signup` link an existing purchase by email** and grant course access, or just create an orphan account? (P1-17)
- [ ] Is **`STRIPE_PRICE_ID_ARTIFACT_UNLOCK`** set in prod? If not, the $40 unlock 400s before it can even be a no-op. (P1-16)
- [ ] What does the free **manager-archetype-map** email actually deliver vs what the capture form promises? (P2-14)

---

## Verified working — *don't spend time here*
Stripe signature verification · refund→access revocation (the `status='active'` gate) · the webhook `charge.refunded`→attribution flip (for pending/cleared) · drip/abandonment/dropoff/review crons are scheduled & double-send-guarded via `*_sent` flags · `reveal_picks` + team-owner creation use race-safe upserts · the `merge_lesson_progress` RPC fixes the two-tab progress race · cron-auth / admin-gating / RLS posture / the `/api` proxy exclusion.
