# AESDR — Workflow Audit & Remediation Plan
*Adversarial audit, 2026-06-17. Grounded in code, not memory.*

## What this is
A consolidated punch-list of everything **five rounds** of adversarial auditing found across every workflow, plus the gaps the flow-chart exercise surfaced. Round 1 ran three passes (buyer/payments · affiliate/operator/money · enterprise/security/systemic). Round 2 ran a second, broader sweep across the workflows *and* the rest of the app for gaps, broken promises, and unfinished wiring — surfacing the **product-delivery layer** (curriculum depth + end-of-course artifacts) wired-but-never-invoked, and the **affiliate commission misrepresentation**. Round 3 ran **twelve domain-specialist passes** (auth/team · email/compliance · curriculum · infra/config · enterprise/workshop · admin · agent-crons · affiliate experience · data/RLS · deep security · frontend/brand/a11y · build/CI/tests) — ~74 further findings, including the worst security and access issues in the whole document: **affiliate-payout account takeover**, the **team tier being paid-but-unusable**, **affiliate links that never attribute**, and a **CAN-SPAM exposure** across every lifecycle email. Round 4 ran **seven specialist lenses** (state-machines/lifecycles · money-reconciliation · legal/tax/FTC · timezone/date math · performance/scale/cost · a line-by-line read of the Stripe webhook + `lib/email.ts` · lesson-HTML interaction logic) — ~64 further findings at the seams the component passes missed: a **paying buyer who can be permanently locked out**, an **affiliate-tax (1099/W-9) compliance gap**, a **materially false privacy policy**, a **78MB auto-playing landing video**, and uncapped LLM spend. Round 5 ran **seven UX/ops/copy/config lenses** (onboarding/first-run · email deliverability · integration config · naming/brand separation · empty-loading-error states · brand-voice canon · PII data-flow) — ~59 further findings (no new Criticals, mostly High/Medium): silent money-failure swallows, no admin error boundary, a single root sending-domain that risks spamming the welcome+receipt, free-text PII flowing to PostHog/Sentry/Anthropic unmasked, and the canon's own banned terms shipping where the linter can't reach. Each item is evidence-backed (`file:line`), severity-ranked, and tagged **[M]echanical** (I can patch it with no decision) or **[D]ecision-needed** (the exact question is in the [decision list](#what-i-need-from-you--the-decision-list)). **The money-, deploy-, delivery-, and access-breaking items were re-verified against the source by hand** (marked ✅).

## ✅ STATUS — patch run + adversarial review (2026-06-22)
*Where every finding actually stands after the remediation pass. Legend: ✅ fixed in code (on `main`, builds + the money math is unit-tested) · 🟡 loose (a sliver remains) · ⬜ on you (decision, infra, or external).*
**Caveat:** "fixed" = code-complete + `tsc`/lint/`build` green + unit tests on the commission/clawback math. It is **not** load-tested end-to-end — review + a staging pass before flipping `COMING_SOON` off.

**Everything is on `main` (production branch).** Cost: all cron schedules disabled + agent levers off → nothing auto-spends. **6 DB migrations applied + verified** in prod: attribution-status (re-enables payouts), generated_artifacts CHECK, course_progress, email_suppressions, commission_clawbacks, **+ clawback-unique/net_paid** (this last one ⬜ — from the review below; **run it before any payout**).

### ✅ Fixed (the large majority)
- **Phase 0 Criticals:** P0-1 (payout double-pay) · P0-2 (clawback ledger, hardened) · P0-3 (real admin refund) · P0-4 (course_progress) · P0-5 (artifacts generate) · P0-6 (artifact CHECK) · P0-7 (units 2&3) · P0-8 (commission rate+base — **40% of net**, founder set 2026-06-29) · P0-9 (account-takeover) · P0-10 (team tier) · P0-11 (affiliate links) · P0-12 (CAN-SPAM unsubscribe — see 🟡) · P0-13 (buyer lockout).
- **Phases 1–3 + Rounds 3/4/5:** the bulk of the `[M]` items + every `[D]` whose default you accepted — proxy/auth, webhook hardening, the email overhaul (unsubscribe + per-recipient one-click + cron suppression across all 5 crons), tools gate, identity, PII/log/replay hardening, `ip_hash` HMAC, markdown XSS, naming + canon copy, env docs, empty/error states, the silent-money-button fixes.
- **Test net:** `tests/unit/` (commission · clawback netting · hash-ip · markdown XSS) wired into CI — closes R3-CI-1/4.

### ⬜ Decisions resolved → applied in code
- **P0-14 (tax):** Stripe files the 1099-NECs → dashboard/lib copy corrected. ✅
- **P0-8 / commission:** 40% of net (founder reversed decision #27 on 2026-06-29 — keep the kit's 40% / 30-day across the board), one source of truth (`lib/commission.ts`). ✅

### ⬜ On you — still open
- **Decisions / legal:** P0-15 privacy-vs-trackers · CAN-SPAM physical mailing address (you chose none → P0-12 stays partial) · R4-LEG-6 ToS governing-law/arbitration · R4-LEG-7/R5-PI-4 scraped-prospect GDPR basis · R4-LEG-4 earnings-claim substantiation.
- **Infra:** set **Vercel env vars** (incl. new `RESEND_WEBHOOK_SECRET`) · email-domain **DNS split** · **re-encode the 78 MB video** (P0-16) · keep `COMING_SOON=true`/levers off · at launch restore crons + flip COMING_SOON.
- **Only you:** a **staging/QA pass** against real Stripe-test + Supabase data.

### ✅ Loose slivers — now closed (2026-06-29 pass)
- Unsubscribe: visible footer link now carries `?email=`; Resend bounce/complaint webhook live at `/api/webhooks/resend` (svix-verified) → suppressions (P0-12 / R5-DV-2).
- Applicant "we got it" acknowledgement email now sends on submit (P1-7).
- Partial-refund commission proration — pro-rata clawback for full **and** partial, unit-tested, idempotent on redelivery (R4-MON-4 / decision #28).
- `lesson-01` u1 — confirmed it already emits the standard `quizScore` the artifact extractor reads (12 call sites); the leftover `_extra.lesson` is intentional resume state. No change needed (R4-LH-8).

## ❓ What I need from you — every open item as a question (2026-06-29)
*The 23 items not yet ✅, each as a one-sentence question + whether I can do the work once you answer. Pattern: I can build almost all of it; what I need is a decision, a number, an env var, or a DNS/legal action only you can take.*

### The 9 ⬜ (not started — each needs one thing from you)
| ID | Question | Can I do it? |
|---|---|---|
| P1-2 | Do you want inbound email (replies parsed back into the app), and through which provider? | **Yes** — I build it once you name the provider. |
| P1-12 | Have you set `NEXT_PUBLIC_SITE_URL` in Vercel so I can switch on the crash-if-missing guard? | **Yes (code)** — only you can set the Vercel var. |
| P1-13 | Have you added the `UPSTASH_*` keys in Vercel so rate-limiting can fail closed in prod? | **Yes (code)** — only you can set the var. |
| P2-12 | Once those vars exist, want one startup check that refuses to boot if a required var is missing? | **Yes** — after the vars are set. |
| P3-10 | Want me to rename the internal `verdict` field to "call" for tidiness (zero user-facing impact)? | **Yes** — just say the word. | Redline book-review motif + mascot pose; recommend keep 
| R3-AUTH-5 | Do you want a "delete my account / export my data" flow now (GDPR/CCPA), or defer it? | **Yes** — I build it once you say go. |
| R4-LEG-5 | Should affiliate copy be hard-blocked without an FTC disclosure, or stay a soft warning? | **Yes** — once you pick which. |
| §13 | Want the attribution window enforced at credit time (the anti-fraud R3-AF-4 change this rolls into)? | **Yes** — once you greenlight R3-AF-4. |
| §14 | Can a commission rate ever be below 1% — if never I clamp it, if yes what should sub-1% mean? | **Yes** — once you answer. |

### The 14 👤 (on you — decision / number / DNS / legal)
| ID | Question | Can I do it? |
|---|---|---|
| P0-15 | Should the privacy policy disclose your processors (Stripe/Supabase/Resend/PostHog/Anthropic), or should we pull the trackers? | **Yes** — I write it once you pick which. |
| P0-16 | Do you want the 78 MB auto-playing video re-encoded and served from Blob/Mux? | **Partly** — I wire the player; the re-encode + upload is yours. |
| R4-MON-7 | Do you want to collect sales tax/VAT (turn on Stripe Tax) given your nexus? | **Yes (wiring)** — the nexus/registration call is yours. |
| R4-LEG-2 | Do you want a cookie-consent banner gating analytics for EU/UK visitors? | **Yes** — once you say add it. |
| R4-LEG-4 | Do you have a real source to back any earnings/results claims, or should we cut them? | **Yes (copy)** — I can't invent the data; you give the source or the call. |
| R4-LEG-6 | What governing-law + arbitration terms should the ToS state? | **No** — needs your lawyer's text; I'll paste it in. |
| R4-LEG-7 | What's your lawful basis for storing scraped prospect PII, or should we stop storing it? | **Yes (implement)** — the legal basis is your call. |
| R4-PERF-1 | What dollar cap per Scout sweep should I enforce? | **Yes** — once you give the number. |
| R4-PERF-2 | What dollar cap per dossier brief should I enforce? | **Yes** — once you give the number. |
| R4-PERF-12 | How long should the `events` log be kept before auto-purge? | **Yes** — once you give the window. |
| R5-DV-1 | Do you want marketing mail split onto a subdomain, separate from transactional? | **Partly** — the DNS is yours; I update the from-addresses after. |
| R5-DV-6 | Have you set SPF/DKIM/DMARC for the sending domain? | **No** — DNS is yours; I'll hand you the exact records. |
| R5-DV-7 | BIMI logo not in inboxes | 👤 | **Deferred** — a later branding upgrade (DMARC already enforcing); guide: `docs/2026-06-29-bimi-setup.md` |
| R5-PI-4 | Do you want consent + a retention limit on scraped prospect data, or to stop persisting it? | **Yes (implement)** — the decision is yours. |
| R5-PI-9 | What retention window should each table keep before auto-purge? | **Yes** — once you give the windows. |

### 🔎 Adversarial review of the money/auth diffs — 14 findings
- **Fixed:** §1 duplicate clawbacks on Stripe re-delivery (unique index + idempotent upsert) · §2 gross-vs-net reporting (`net_paid_cents`) · §3b missing clawback-update error checks · §4 null/`full` netting edge (extracted + unit-tested `applyClawbacks`) · §6 fee-currency guard · §12 dropped the `isNewPurchase` gate that lost attribution on retry.
- **Fixed 2026-06-29:** §5 refund-reconciliation cron (idempotent replay of dropped `charge.refunded`) · §7 paginated `findUserIdByEmail` (no 50/200 ceiling) · §8 self-referral gmail dot/+alias normalization (unit-tested) · §9 a refund now claws back `processing` (mid-payout) attributions too · §10 refund matches the session that actually has a purchase across the PI · §11 `markPayoutPaid` nets open clawbacks (guarded so a batch payout isn't double-netted). Refund logic centralized in `lib/refunds.ts`, shared by the webhook + the cron.
- **Verified already-safe:** §3a clawback concurrency (the attribution claim serializes payout batches per affiliate first).
- **Open / lower-frequency:** §13 `attribution_window_closes_at` written-never-read — its real fix is **R3-AF-4** (attribution-window enforcement at credit time), so it's folded there rather than given a fake read · §14 `resolveCommissionRate` sub-1% ambiguity (awaits your call on whether a <1% rate is ever real).

## How to use it
Work top-down by phase. Each item has a `[ ]` you tick when its **Done-when** is met. Don't start a later phase before its blockers (noted in **Depends**) are closed. Effort: **S** ≈ <½ day · **M** ≈ ½–2 days · **L** ≈ multi-day.

## Scoreboard
*(Phases 0–3 + Security = the original 59. Round 3 adds ~74 ([Round 3](#round-3--twelve-domain-deep-sweep)). Round 4 adds ~64 ([Round 4](#round-4--seven-specialist-lenses)). Round 5 adds ~61 ([Round 5](#round-5--seven-uxopscopyconfig-lenses)). The eight new Criticals from Rounds 3–4 are promoted into Phase 0 as P0-9…P0-16; Round 5 added no new Criticals. Counts below are combined totals.)*

| Severity | Count | Meaning |
|---|---|---|
| 🔴 Critical | 16 | Loses money, charges without delivering, hands over an account, strands a paid buyer, creates legal exposure, or breaks a fresh deploy. Do first. |
| 🟠 High | ~93 | A real workflow is broken or a user-/founder-facing wire is dead. |
| 🟡 Medium | ~104 | Degraded, silent-failure, or correctness gaps with limited blast radius. |
| ⚪ Low | ~56 | Cleanup, cosmetics, hardening. |
| **Total** | **~269** | |

> **Cross-cutting theme #1 (Round 1):** the partnership/agent subsystem is built to *fail silently by design* — fail-safe-OFF switches, best-effort `try/catch` swallows, console-only logging, and some schema created out-of-band. Safe for "don't send bad outreach," but it means broken infrastructure (unapplied migrations, a missing webhook, an unscheduled cron) is **invisible at runtime.** Several fixes below are really about making failure *loud*.
>
> **Cross-cutting theme #2 (Round 2):** the **delivery layer is built but not connected.** The artifact engine, the three-units-per-lesson structure, and the $40 unlock all exist as code and schema — but nothing *invokes* them: no caller generates the artifacts, no navigation reaches units 2 & 3, and the commission number the code uses isn't the one every buyer-facing surface promises. These aren't bugs in a feature; they're features that were wired and never plugged in. The buyer pays for the whole thing and reaches the end to find the last third missing.
>
> **Cross-cutting theme #3 (Round 3):** **identity and gating are trusted from the wrong side, and nothing in CI would catch any of it.** Affiliate identity reads from client-writable `user_metadata`; the team tier's access depends on RLS that denies the very members it's for; completion is a string the client asserts; the proxy allowlist silently swallows whole routes (`/r/*`, `/team`). Underneath all of it, **CI runs no tests** and the lint/canon gates are non-blocking — so every bug in this document shipped green. Many Round-3 fixes are one-liners; the reason there are so many is that there was no net.
>
> **Cross-cutting theme #4 (Round 4):** **the failure paths and the off-happy-path cases were never finished.** The Stripe webhook logs hard failures to Sentry and then returns **200**, so Stripe never retries and a paid buyer strands (no login, no team, no commission). Refunds assume "full"; disputes assume "lost"; restore assumes "same device"; the LLM agents assume "stop when the timer says so" with no token cap; the marketing copy and the legal pages each describe a *different* product than the code ships (commission base, 1099 handling, tracking, deletion). The happy path mostly works; almost every Round-4 finding is what happens when something deviates from it — a transient error, a partial refund, a won dispute, a new device, a non-USD price, an EU visitor, an audit.
>
> **Cross-cutting theme #5 (Round 5):** **the surfaces the founder doesn't look at got none of the care the happy path did.** What the user sees when a request *fails* (silent swallows, "All clear" over a broken query, a $40 button that does nothing), what leaves to third parties (deal free-text to PostHog, reflections to Anthropic, unmasked session replays), how the mail is *sent* (one root domain for everything, no bounce handling), and what the copy literally *says* (the canon's own banned words, where the linter can't reach) — all of it is a tier less finished than the core logic. None of it is a new Critical; all of it is the difference between "works in the demo" and "holds up in production with real users, real failures, and a regulator reading the privacy policy."

---

## PHASE 0 — Critical: money, data integrity, delivery, deploy

> **Run order:** **Part A** (product-integrity, P0-5…8), **Part C** (Round-3 access/identity/legal, P0-9…12), and **Part D** (Round-4 strandings/legal/cost, P0-13…16) co-lead — between them they're "the buyer/affiliate/team-member gets what they paid for, nobody can take over an account, we're not breaking tax/privacy law, and we're not bleeding cash." Several are pure broken-wiring (cheap relative to blast radius). Then **Part B** — the money/deploy Criticals (P0-1…P0-4). All IDs and their downstream `Depends` chains (P1-1, P0-3, P2-6, P2-9) are unchanged; only the physical order moved.

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
- **Round-4 expansion (the commission picture is worse than a rate mismatch):** (1) **R4-MON-2 ✅** — `affiliates.commission_pct` exists but the webhook never reads it (hardcodes `DEFAULT_COMMISSION_RATE`), so even setting the column to 40 changes nothing; this is *why* 40% can't take effect. (2) **R4-MON-1 / R4-LEG-1** — the program page and the **binding D22 agreement** define commission as "30% of **net** (gross − refunds − fees − tax)," but the code pays 30% of **gross** and the calculator shows 40% of gross — three different formulas. (3) **R4-MON-5/6/7/8** — gross-vs-net interacts with who-eats-Stripe-fees, no currency guard, uncollected tax, and per-row rounding that won't reconcile. The real fix is **one `computeCommission()` function** (rate from the column, base + fee + tax + rounding decided once) that the webhook, calculator, kit, and D22 all derive from.

### Part C — Round-3 Criticals · *access, identity, legal (co-lead with Part A)*

### [ ] P0-9 · Affiliate-payout account takeover via client-writable `user_metadata`  🔴 ✅verified · [D]
- **Where:** `lib/affiliate-entity.ts:139-150` — `getAffiliateForUser` returns the row matched by `user_id`, else **falls back to `bySlug` using the JWT `user_metadata.affiliate_slug`**; `app/api/affiliates/stripe/dashboard/route.ts:24-28` feeds that straight from `user.user_metadata`; the dashboard gates (`app/affiliates/dashboard/page.tsx:63`, links/playbooks, `app/actions/affiliate.ts:38`) read `user_metadata.is_affiliate`.
- **Wrong:** affiliate identity + authorization are read from `user_metadata`, which **any user can write** client-side via `supabase.auth.updateUser({ data })` (the app already does this at `signup/page.tsx:30`).
- **Impact:** a signed-up user runs `updateUser({ data:{ affiliate_slug:"<victim>" } })` (slugs are public via `/r/<slug>`) → `POST /api/affiliates/stripe/dashboard` returns a **single-use Stripe Express login link to the victim's payout/bank/tax account.** Setting `is_affiliate:true` likewise unlocks the affiliate dashboard, link-minting, and copy submission for anyone. Account takeover + self-serve privilege escalation.
- **Fix:** authorize off a server-trusted source only — an `affiliates.user_id` match, or `app_metadata` (clients can't write it) set by the admin activation path; delete the `jwtAffiliateSlug` fallback.
- **Done when:** editing `user_metadata` cannot reach any affiliate's account, dashboard, or links. **Effort:** M · **Depends:** R3-AF-2 (activation must provision `user_id`/claims — same fix)

### [ ] P0-10 · The team tier is paid-but-unusable — members are denied access *and* can't even join  🔴 ✅verified · [M]
- **Where:** **(access)** `utils/access/verifyAccess.ts:51-73` and `app/api/tools/[slug]/route.ts:51-72` read the *owner's* team purchase under the *member's* anon JWT, but `purchases` RLS (`rls-policies.sql:30-35`) returns only `auth.uid()`/`auth.email()` rows → `null`. **(join)** `app/team/accept/page.tsx:50` sends new members to `/signup?next=…&email=…`, but `app/signup/page.tsx` never reads `next`/`email` and hardcodes `router.push("/login")` (`:46`) → the invite token is dropped.
- **Wrong:** an accepted member's access check resolves to "no purchase on file," and a brand-new member can never complete the invite at all.
- **Impact:** the whole team tier — sold and paid for — delivers nothing: members are bounced to `/login?reason=no_purchase`, and the seat stays "Pending" forever. (Compounded by R3-SEC-6: the invite isn't bound to the invited email, so a leaked token = seat theft.)
- **Fix:** resolve the team-purchase check via the service-role admin client (or a `SECURITY DEFINER` function); make `/signup` honor `next`/`email` and round-trip back to `/team/accept`.
- **Done when:** an invited person signs up, accepts, and loads a lesson. **Effort:** M · **Depends:** —

### [ ] P0-11 · Affiliate links never attribute — the click endpoint is unreachable  🔴 ✅verified · [M]
- **Where:** `app/r/[slug]/route.ts` (logs the click, sets the 30-day attribution cookie, redirects) vs `proxy.ts:116-146` — `/r/*` is in **neither** `PUBLIC_PATHS` nor the pass-through allowlist, so an anonymous visitor falls through to the landing-page 302 (and to `/coming-soon` while pre-launch) **before the handler runs.**
- **Wrong:** every affiliate-link click by a normal (logged-out) audience member is redirected away before the click row or cookie is written.
- **Impact:** the attribution chain never starts → **no affiliate can ever earn a commission**, and the entire agent/outreach subsystem built to recruit affiliates feeds a funnel that captures nothing. Same root cause as `/team` (P0-10) and `/r/` (A3): routes silently missing from the proxy allowlist.
- **Fix:** add `pathname.startsWith("/r/")` to the proxy pass-through + the API-style coming-soon exemption.
- **Done when:** a logged-out click on `/r/<slug>` logs the click, sets the cookie, and 302s to the destination. **Effort:** S · **Depends:** —

### [ ] P0-12 · CAN-SPAM/CASL exposure across every lifecycle email  🔴 ✅verified · [D]
- **Where:** `lib/email.ts:2003-2038` — both shared footers carry only `hello@aesdr.com` + links, **no physical postal address**; the sole opt-out is "reply UNSUBSCRIBE" + a `mailto:` `List-Unsubscribe` header, but **no route processes it** and **no cron checks a suppression flag** (`drip`/`dropoff`/`retention`/`review`/`abandonment` query none).
- **Wrong:** every marketing/lifecycle email (win-back, drip, dropoff, Sunday-framing, alumni, review-ask) ships with no mailing address and an unsubscribe that nothing honors.
- **Impact:** a flat CAN-SPAM (physical-address + honor-opt-out) and CASL violation on all non-transactional mail — statutory per-email exposure, and opt-outs are silently ignored forever. The `List-Unsubscribe-Post: One-Click` paired with a `mailto:` is also malformed per RFC 8058 (Gmail/Yahoo bulk-sender risk).
- **Fix:** add a real physical mailing address to both footers; build an unsubscribe route + suppression flag; gate every lifecycle cron on it; serve an HTTPS one-click `List-Unsubscribe`. The **only** decision is the address; the rest is mechanical.
- **Done when:** every marketing email carries an address and a working unsubscribe that suppresses future sends. **Effort:** M · **Depends:** —

### Part D — Round-4 Criticals · *failure-path strandings, legal exposure, runaway cost*

### [ ] P0-13 · A paying first-time buyer can be permanently locked out  🔴 ✅verified · [M]
- **Where:** `app/api/webhooks/stripe/route.ts:116-159`. `createUser` failing for *any* reason hits the `else if (createError)` branch (`:128`) that assumes "email already exists" — it nulls `tempPassword` (`:132`), can't find the brand-new user, leaves `userId = null`. The purchase is written `user_id: null` (`:176`), the welcome email takes the no-password path ("use your existing password"), and the handler returns **200** so Stripe never retries.
- **Wrong:** a transient Supabase 429 / 5xx / network blip on `createUser` is indistinguishable from a real "exists," with no `createError.code`/`status` check.
- **Impact:** a paying customer ends with no auth account, a userless purchase, and an email telling them to use a password they never received — they **cannot log in, ever**, and it never self-heals. The same null-`userId` path strands team buyers (no team created), and the sibling pattern at `:185` (purchase upsert error logged, execution continues) silently drops affiliate attribution while still emailing "you're in."
- **Fix:** branch on `createError.code`/`status` — only `email_exists`/422 means exists; for anything else, `Sentry.captureException` + **return 500** so Stripe retries. Likewise return 500 on `purchaseError` before any email/team/attribution runs.
- **Done when:** a transient provisioning error produces a Stripe retry, not a stranded paid customer. **Effort:** M · **Depends:** —

### [ ] P0-14 · Affiliate payouts have no 1099-NEC / W-9 tax handling — and the dashboard says the opposite  🔴 · [D]
- **Where:** `lib/stripe-connect.ts:1-10` (header claims "Standard accounts… handle 1099-K on Stripe's side") + `:114-133` (pays via the **Transfers API**); `app/actions/affiliate.ts:503-608` (payout gates only on `stripe_account_status`); the `affiliates` table has no W-9/TIN/threshold columns; `app/affiliates/dashboard/payments/page.tsx:117` tells affiliates "Stripe handles 1099-K reporting."
- **Wrong:** platform→affiliate **Transfers are AESDR's own payments for promotional services**, so the **1099-NEC + W-9 obligation is AESDR's** (Stripe's 1099-K covers a connected account's *own* processing volume, not platform transfers). No W-9 is collected, no TIN stored, no $600 threshold tracked, no NEC issued — and the public copy asserts the reverse.
- **Impact:** IRS exposure (IRC §6721/§6722 per-form penalties) plus **24% backup-withholding liability** on every payout made without a TIN on file; compounds per-affiliate, per-year. A real, scaling tax-compliance gap, not a cosmetic one.
- **Fix:** collect W-9/W-8BEN before the first transfer (Stripe 1099 tax-form collection, or self-file); add `tax_form_status`/`tin_last4`/`country` columns; gate `runAffiliatePayoutBatch` on `tax_form_status` the way it gates on Stripe-enabled; track cumulative yearly payout per affiliate; fix the false copy. **Genuine legal review on the NEC-vs-K determination + backup withholding.**
- **Done when:** no affiliate is paid before a W-9 is on file, and NECs can be issued. **Effort:** L · **Depends:** — *(needs the tax-filing-strategy decision)*

### [ ] P0-15 · The privacy policy is materially false (claims "no third-party tracking" while running an ad pixel + emailing PII to PostHog)  🔴 · [D]
- **Where:** `app/privacy/page.tsx:47-55` ("we do not share your data with advertisers") and `:65-71` ("**No third-party tracking cookies are used**") — contradicted by `components/RedditPixel.tsx` (Reddit ads pixel, hardcoded init, mounted site-wide at `app/layout.tsx:102`), `app/success/page.tsx:56` (`rdt('track','Purchase')`), `components/PostHogClient.tsx` (`identify(user.id, { email, role })`), and Vercel Analytics. No processor (Reddit, PostHog, Vercel, Stripe, Resend, Anthropic, BetterContact) is disclosed.
- **Wrong:** the policy affirmatively denies third-party tracking and advertiser-sharing while a Reddit advertising pixel fires on every page and PostHog receives the user's **email** tied to a stable id.
- **Impact:** an **affirmative misrepresentation** — FTC §5 deceptive-practices + state UDAP/CCPA (cross-context behavioral-ad sharing without notice/opt-out) + GDPR/ePrivacy. A false statement is a stronger enforcement hook than silence; this is the single sharpest legal exposure in the audit. (Pairs with R4-LEG-2: those trackers also fire for EU/UK visitors with no consent gate.)
- **Fix:** rewrite the policy to name every processor and disclose the pixel/analytics purpose — **or** remove the Reddit pixel + PostHog `identify` to make the current text true (decision). Add a consent gate for EU/UK.
- **Done when:** the policy matches what actually runs (and trackers gate on consent for EU/UK). **Effort:** M (copy) + the consent build · **Depends:** —

### [ ] P0-16 · A 78MB video auto-plays on the landing page (~780GB/mo egress at 10k views)  🔴 ✅verified · [M]
- **Where:** `app/page.tsx:76-77` `autoPlay`s `public/leponeus-sneak-peek.mp4` (**78MB**, verified by `ls`) with no `poster`/lazy-load; also `public/reveal/*.png` (4–7MB ×6 ≈ 34MB), `public/turtle.png` (3.2MB), and 8 mascots (~1.5–2MB) served raw — no `next/image`, no `images` config in `next.config.ts`.
- **Wrong:** the primary marketing page force-downloads ~78MB of video (plus heavy PNGs) on first paint.
- **Impact:** ~**780GB/month** of Vercel egress at 10k landing views — a real bandwidth bill — and a brutal LCP / mobile-data hit on the highest-traffic, first-impression page.
- **Fix:** transcode the video to ~2–5MB + a `poster` + serve from Blob/Mux (or load behind a click); re-compress the PNGs and route them through `next/image` with `images.formats`.
- **Done when:** the landing page transfers a few MB, not ~100MB. **Effort:** M · **Depends:** —

### Part B — Money & deploy Criticals

### [ ] P0-1 · Payout batch can double-transfer real money  🔴 ✅verified
- **Where:** `lib/stripe-connect.ts:124-132`, `app/actions/affiliate.ts:503-587`
- **Wrong:** `stripe.transfers.create({…})` is called with **no `idempotencyKey`**; the batch selects `status='cleared'` rows, inserts a `processing` payout, transfers, then marks `paid` *after*. A re-clicked payout, a Server-Action retry, or two concurrent runs each read the same `cleared` rows and each fire a real transfer.
- **Impact:** an affiliate is paid twice. Unrecoverable without a clawback.
- **Fix:** pass `{ idempotencyKey: 'payout:'+payout.id }`; before transferring, atomically claim rows (`update … set status='processing' where status='cleared'` and operate only on claimed ids); refuse if a non-failed payout already exists for those ids.
- **Done when:** a forced double-run / double-click transfers **at most once**. **Effort:** M · **Depends:** —
- **Round-3 note (R3-AD-1, ✅):** there are **two** buttons that fire this batch — the tower `PayoutButton` and `app/admin/affiliates/[affiliateSlug]/page.tsx:414` — so the double-fire is reachable by clicking both, not just a retry. And a **separate** double-settle path exists (R3-AF-9): `markPayoutPaid` (manual) and the batch don't exclude each other. The atomic row-claim fix must cover all three entry points.

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
- **Round-3 note (R3-DATA-5, ✅):** the `(user_id, lesson_id)` **unique constraint** four upserts + the `merge_lesson_progress` RPC rely on is added by a bare `ALTER` (`20260403_add_unique_constraint.sql:11`) that assumes the table exists. Fold it into the new `CREATE TABLE` as an inline `UNIQUE`, or every `ON CONFLICT (user_id, lesson_id)` throws on a clean DB.

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
- **Round-3 additions (✅):** R3-AF-6 — the payout gate trusts the cached `stripe_account_status` column, so a since-disabled account is still paid (re-`retrieveAccount` live before transfer). R3-AF-7 — `mapAccountStatus` marks "enabled" without checking the `transfers` capability, so a Standard account passes the gate then 400s on `transfers.create`. R3-AD-3 — the tower's "N waiting on you" counts affiliates with no enabled Stripe account, so the headline never reaches zero.

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

- [ ] **P3-1 · Delete the dead inline-LLM Server Actions** ⚪✅ — `runScoutSweepAction`/`runDossierNow` (`actions.ts:384,590`) + orphaned `runScoutSweep`/`runDossier`; the live UI uses the route handlers. Removes two drifted research engines + duplicated `dossier_brief` writes. **M** · *(Round-3 ✅: grep confirms **no component calls** these actions — they are genuinely orphaned, so deletion is safe and the single-call engine's brace-parse bug (R3-AG-11) becomes moot. Their being live was a false alarm from one Round-3 pass.)*
- [ ] **P3-2 · Delete dead lib exports** ⚪✅ — `extractOwnDomain`, `findEmailForCandidateId` (`email-finder.ts:87,460`), zero importers. **S**
- [ ] **P3-3 · Drop the phantom `lesson_nudge_last_id`** ⚪✅ — TS-interface-only (`retention/route.ts:35`), never migrated/used. **S**
- [ ] **P3-4 · Review-nudge uses the real name** ⚪✅ — `review/route.ts:89` hardcodes `'there'`; add `customer_name` to the select. **S**
- [ ] **P3-5 · Migration hygiene** 🟡✅ — verify every migration is applied (best-effort swallows hide unapplied ones: `email_checked_at` re-bills BetterContact each pass if missing; `dossier_brief`; `dossier_runs`/`scout_sweep_runs`); add migration state-tracking; remove the stale `_apply_all_affiliate_hub.sql` bundle (pre-rename `partner_slug`); tighten `tower/page.tsx:68-78` "migration missing == any error" conflation. **M**
- [ ] **P3-6 · Document or build the channel motion** 🟡✅ — every outbound cron filters `motion='affiliate'`; nothing consumes `motion='channel'`, so a pasted channel row sits inert. Enterprise is form→inbox, zero rails; `herald` is chat-only. Decide: document as unsupported, or build. Fix the misleading migration comment (`20260605:32`). **M**
- [ ] **P3-7 · Tighten the `affiliates` self-update RLS** ⚪✅ — `WITH CHECK` doesn't restrict columns despite the "display_name only" comment (`20260522_affiliates_entity.sql`). **S**
- [ ] **P3-8 · Env-var edge cases** ⚪✅ — `IP_HASH_SALT` predictable + inconsistent across two call sites; `SCRIBE_MIN_VOICE_FIT` → `NaN` on a non-numeric value silently breaks the draft filter. **S**
- [ ] **P3-9 · `affiliate_attributions.click_id` — use or drop** ⚪✅ — written (`webhooks/stripe:288`) from the click cookie, never read. **Superseded by R3-AF-4 (High):** the right move is to *use* it — validate the `click_id` against `affiliate_clicks` (matching link, unexpired, within `attribution_window_closes_at`, buyer ≠ affiliate) before crediting commission. Promote out of P3 to the affiliate-fraud fix. **S→M**
- [ ] **P3-10 · The `verdict` field rename (optional)** ⚪ — the live UI now reads "the call," but the DB column / JSON property / `dossier_runs.verdict` are still `verdict` (consistent, no drift). Rename the plumbing only if you want it tidy. **S**
- [ ] **P3-11 · Reference-only `design-canon/**` mirrors live components** ⚪ — `design-canon/05-app-pages/*` + `design-canon/04-components/*` duplicate live files (`reveal--RevealView.tsx`, `UnlockArtifactTile.tsx`, …) and can silently drift from the real ones. Confirm `design-canon/**` is not imported/routable, label it "reference only," and remove or clearly mark stale copies. **S**

---

## ROUND 3 — Twelve-domain deep sweep
*The four Criticals this round surfaced are promoted to Phase 0 (P0-9…P0-12). Everything else is below, grouped by domain, each tagged 🟠/🟡/⚪ and **[M]** (I patch it, no decision) or **[D]** (needs your answer — consolidated in the decision list). `file:line` is the evidence; one clause says why. Items that extend an existing finding are cross-referenced in place above.*

### Auth & team
- [ ] **R3-AUTH-3** · `/team` unreachable for non-admin owners — 🟠 **[M]** — `proxy.ts:126`: `/team`+`/team/accept` absent from the allowlist → a real owner 302s to `/`. Add `pathname.startsWith("/team")`.
- [ ] **R3-AUTH-4** · Password change not recovery-gated — 🟠 **[D]** — `app/account/reset-password/page.tsx:28`: any live session rotates the password with no current-password prompt (shared/stale-tab takeover).
- [ ] **R3-AUTH-5** · No account deletion / data export — 🟠 **[D]** — promised in `app/privacy/page.tsx:76` + procurement (GDPR Art. 28); no implementation exists anywhere.
- [ ] **R3-SEC-6** · Team invite not bound to the invited email — 🟡 **[M]** — `app/team/accept/page.tsx:54`: token-bearer claims the seat (no `email` match); token also leaks via referer in the `/signup?next=…` URL.
- [ ] **R3-AUTH-6** · Welcome "Continue" bypasses the password overlay — 🟡 **[M]** — `app/welcome/page.tsx:44`: dismissible overlay + always-clickable Continue (contradictory; dashboard redirect already enforces it).
- [ ] **R3-AUTH-7** · `PasswordOverlay` CTA uses the retired palette — ⚪ **[M]** — `components/PasswordOverlay.tsx:95`: hardcoded legacy rainbow vs `var(--iris)`.
- [ ] **R3-AUTH-8** · Signup success copy lies — ⚪ **[M]** — `app/signup/page.tsx:107` says "Redirecting to your dashboard," `:46` pushes `/login`.
- [ ] **R3-AUTH-9** · Team owner forced through the SDR/AE role gate — ⚪ **[D]** — `app/dashboard/page.tsx:54`: webhook sets no role for team buyers; owner must self-ID as SDR/AE (no manager option).

### Email & compliance
- [ ] **R3-EMAIL-3** · `List-Unsubscribe-Post: One-Click` paired with a `mailto:` is invalid (RFC 8058) — 🟠 **[M]** — `lib/email.ts:30`; folds into P0-12's HTTPS unsubscribe.
- [ ] **R3-EMAIL-4** · Retired-palette rainbow bar in 4 buyer emails — 🟡 **[D]** — `lib/email.ts:996,1175,2147,2299` (welcome/receipt/lesson-complete/reveal).
- [ ] **R3-EMAIL-5** · `sendReviewNudge` hardcodes the name `'there'` — 🟡 **[M]** — `app/api/cron/review/route.ts:89`; add `customer_name` to the select.
- [ ] **R3-EMAIL-6** · Dropoff email shows "Lesson 3" not the title — 🟡 **[M]** — `app/api/cron/dropoff/route.ts:102,114`; resolve from `LESSONS`.
- [ ] **R3-EMAIL-7** · `mascotRow` images are `alt=""` — ⚪ **[M]** — `lib/email.ts:113`; the mascot is the emotional payload, blank when images are off.
- [ ] **R3-EMAIL-8** · Refund-window copy contradiction — ⚪ **[D]** — receipt says firm "14 days"; `dropoff21d` (`lib/email.ts:1918`) calls it "more guideline than rule" (ties to P2-13).

### Affiliate experience
- [ ] **R3-AF-2** · Activation never provisions affiliate `user_id`/claims — 🟠 **[D]** — `app/actions/affiliate.ts:655` inserts with null `user_id`; activated affiliates can't reach dashboard/links/Stripe. The flip side of P0-9 — same fix.
- [ ] **R3-AF-3** · No self-referral / fraud protection — 🟠 **[D]** — `webhooks/stripe:264-318`: an affiliate buying via their own link earns 30%; no buyer≠affiliate check.
- [ ] **R3-AF-4** · Attribution spoofable + window unenforced — 🟠 **[M]** — checkout trusts the client cookie; webhook credits on `link_id` alone, never validating `click_id` or `attribution_window_closes_at` (supersedes P3-9).
- [ ] **R3-AF-5** · Cleared-but-unpayable commission accrues forever — 🟡 **[D]** — `cron/affiliate:70` clears regardless of Stripe state; no expiry/forfeiture/reminder → open-ended liability.
- [ ] **R3-AF-6 / R3-AF-7** · Stale payout-status cache + `transfers`-capability not checked — 🟡 **[M]** — (detailed under P2-9).
- [ ] **R3-AF-8** · `submitAffiliateCopy` unvalidated channel/format + raw `draft_url` — 🟡 **[M]** — `app/actions/affiliate.ts:174`; a `javascript:`/`data:` URL renders as a clickable link in the founder's review queue.
- [ ] **R3-AF-10** · `/x/track` auto-registers attacker slugs + triggers founder emails — 🟡 **[D]** — `x/track/route.ts:50`: unauth upsert + `sendProspect*Email` with attacker-controlled props (extends the unauth `/x/track` note in Security).
- [ ] **R3-AF-11** · `/x/ops/login` non-constant-time password compare — ⚪ **[M]** — `x/ops/login/route.ts:18` `pw !== expected`.
- [ ] **R3-AF-12** · Dashboard link pill mislabels inactive links "Refunded" — ⚪ **[M]** — `app/affiliates/dashboard/page.tsx:318`; affiliates read it as a clawback.

### Agents & crons
- [ ] **R3-AG-1** · Courier double-sends on a crash between send and sent-log insert — 🟠 **[D]** — `cron/courier:130` sends, `:162` writes the idempotency row; a crash between re-sends next tick. (Critical when courier is enabled; lever is OFF today.)
- [ ] **R3-AG-3** · Scout has no lever gate — 🟠 **[D]** — `agent-switch.ts:14` `PARTNER_AGENTS` omits `scout`; the most token-expensive agent has no kill-switch, only "don't click."
- [ ] **R3-AG-4** · `after()` research silently dropped → run stuck `running` forever — 🟠 **[M]** — `run-sweep`/`run-brief`; add a stale-run reaper (`updated_at` age) in the poll GET.
- [ ] **R3-AG-5** · Prompt-injection: scraped page text → outreach `[REAL DETAIL]` and `contact_path` — 🟠 **[D]** — `dossier-research.ts:126`→`outreach-templates.ts:159`, and (R3-SEC-3) a candidate page can write an attacker email into `contact_path` that then routes real sends (`email-finder.ts:396`).
- [ ] **R3-AG-6** · Model-404 swallowed as "nothing found" → infinite retry loop — 🟠 **[M]** — `scout-research.ts:228`, `dossier-research.ts:183`; inspect the error, surface the model ID.
- [ ] **R3-AG-8** · Followup advances on a missing-inbound-table error (silent) — 🟡 **[M]** — `cron/followup:90`; treat the query error as "can't confirm no-reply" and fail-closed.
- [ ] **R3-AG-9** · Contact-finder re-bills BetterContact on a batch timeout — 🟡 **[D]** — `email-finder.ts:562`; mark-checked at enqueue or resume the request id (need the billing-trigger answer).
- [ ] **R3-AG-10** · Sentinel cursor advances past unprocessed events on an upsert failure — 🟡 **[M]** — `cron/sentinel:204-229`; only advance past successfully-written events.
- [ ] **R3-AG-2** · `verifyCronAuth` 500s (not 401) on a wrong-byte-length header — ⚪ **[M]** — `lib/cron-auth.ts:19`; compare on `Buffer.byteLength`.
- [ ] **R3-AG-12** · drip/dropoff/review double-send to duplicate-email purchase rows — ⚪ **[M]** — `cron/drip:47`; dedupe by email / scope by `user_id`.
- [ ] **R3-AG-13** · usher T-1h fires for past-due workshops + skips T-48h on a missed tick — ⚪ **[M]** — `cron/usher:162`; tighten the window.

### Data layer / RLS / migrations
- [ ] **R3-DATA-1** · `testimonials` leaks customer emails to the anon key — 🟠 **[D]** — `20260519_testimonials.sql:42` public-read is row-level not column-level; anon can `select=email,user_id`. (View vs admin-client.)
- [ ] **R3-DATA-2** · `course_completed` idempotency defeated — 🟡 **[M]** — `app/actions/progress.ts:54` reads `events` (RLS-on, no policy) with the anon client → count always 0 → the event re-fires every re-completion.
- [ ] **R3-DATA-3** · Deleting a `purchases` row cascade-destroys the commission ledger — 🟡 **[D]** — `20260519_affiliate_backend.sql:61` `on delete cascade` (restrict vs set-null).
- [ ] **R3-DATA-4** · `affiliate_metrics` view bypasses RLS — 🟡 **[M]** — `20260522_affiliate_metrics_view.sql`; add `with (security_invoker = true)`. *(onConflict→unique-index matrix and all other schema-drift came back clean — stated so you don't re-audit.)*

### Curriculum & content
- [ ] **R3-CURR-1** · Tools completion-gate bypassable — 🟠 **[D]** — `app/tools/[slug]/route.ts` + `app/api/tools/[slug]/route.ts` gate on purchase only (the gated logic lives in `download/route.ts`); the `/tools` page links the ungated routes, so the "finish all 12" bonus opens immediately.
- [ ] **R3-CURR-2** · Completion falsely claimable via the API — 🟠 **[D]** — `app/api/progress/complete/route.ts:26` marks any string complete; no `{1..12}` validation, no progress check.
- [ ] **R3-CURR-3** · Preview promises a Course-3 asset that's actually the Course-4 tool — 🟡 **[D]** — `app/preview/page.tsx:129`.
- [ ] **R3-CURR-4** · Enterprise curriculum names the wrong course for the Alignment Contract — 🟡 **[M]** — `app/enterprise/curriculum/page.tsx:81` says Course 2; it's gated on Course 3.
- [ ] **R3-CURR-5** · Course titles disagree across dashboard/syllabus/affiliate/enterprise — 🟡 **[D]** — `progress/types.ts` vs `syllabus` vs catalog vs enterprise.
- [ ] **R3-CURR-6** · `merge_lesson_progress` clobbers `last_screen` (no `GREATEST`) — ⚪ **[M]** — `20260413_security_hardening.sql:88`; out-of-order saves move the bookmark backward.

### Enterprise & workshop
- [ ] **R3-ENT-1** · Workshop replay is structurally undeliverable — 🟠 **[D]** — registration writes `workshop_registrants`; usher reads `partner_workshop` + sends to one placeholder; the confirmation promises "everyone gets it automatically."
- [ ] **R3-ENT-2** · Reminders reference a calendar invite / join link that's never generated — 🟠 **[D]** — `cron/usher:51`; no `.ics` anywhere, no `join_url` column.
- [ ] **R3-ENT-3** · Enterprise CTA source attribution is dead (11 sources → "direct") — 🟡 **[M]** — `app/enterprise/contact/actions.ts:38`; add the real slugs to `VALID_SOURCES`.
- [ ] **R3-ENT-4** · Procurement says "five-dimension diagnostic"; it's 8 everywhere else — 🟡 **[M]** — `app/enterprise/procurement/page.tsx:131`.
- [ ] **R3-ENT-5** · Diagnostic billed "32 prompts"; any one respondent sees 24 — ⚪ **[M]** — `…/diagnostic-instrument/page.tsx:30`.
- [ ] **R3-ENT-6** · Success page hardcodes the iris gradient, bypassing the a11y fallback — ⚪ **[M]** — `app/success/page.tsx:12`; use `var(--iris)`.

### Admin / Control Tower
- [ ] **R3-AD-2** · `RefundButton` swallows failure — operator believes a refund succeeded — 🟠 **[M]** — `app/admin/users/RefundButton.tsx:10`; add an error state.
- [ ] **R3-AD-4** · `markManualSent` swallows the audit-log insert error but still marks sent — 🟡 **[M]** — `app/admin/tower/actions.ts:202`; throw on non-`23505` errors.

### Security (XSS / redirect / rate-limit)
- [ ] **R3-SEC-4** · Stored XSS / `javascript:` in the markdown renderer — 🟡 **[M]** — `lib/markdown.ts:35` interpolates the link href unescaped (admin-gated input today; reachable if P0-9 or a self-serve editor lands).
- [ ] **R3-SEC-5** · Open redirect via `aesdr:navigate` (`//host` bypasses `startsWith("/")`) — 🟡 **[M]** — `components/ProgressSaver.tsx:123`; match `auth/callback`'s `!startsWith("//")` guard.
- [ ] **R3-SEC-7** · Rate-limit gaps — 🟡 **[M]** — `/api/affiliates/apply` (unauth DB+email flood), the three `/api/affiliates/stripe/*` routes, and client-side login/signup/reset have no app-level limiter.

### Infra / config / SEO
- [ ] **R3-INFRA-1** · `CRON_SECRET` undocumented → a by-the-book fresh deploy 500s every cron — 🟠 **[M]** — read by `lib/cron-auth.ts:10`, absent from `.env.local.example`.
- [ ] **R3-INFRA-2** · Pre-launch index leak on `/free/manager-archetype-map` — 🟠 **[D]** — `page.tsx:11` hardcodes `index:true`, ungated on launch mode, public during coming-soon.
- [ ] **R3-INFRA-3** · `EMAIL_FINDER_API_KEY` undocumented → contact-finder silently no-ops — 🟡 **[M]** — add to `.env.local.example`.
- [ ] **R3-INFRA-4** · 8 more env vars read-but-undocumented — 🟡 **[M]** — `COMING_SOON_BYPASS_CODE`, `ADMIN_EMAILS`, `AFFILIATE_OPS_PASSWORD`, `PARTNER_ALERT_EMAIL`, `WORKSHOP_REGISTRANT_GROUP_ADDR`, `SCRIBE_MIN_VOICE_FIT`, `NEXT_PUBLIC_INBOX_COMPOSE_BASE`/`_SEARCH_BASE`.
- [x] **R3-INFRA-5** · ~~`ANTHROPIC_API_KEY` never read~~ — **RESOLVED (Round 5):** it *is* read — `new Anthropic()` resolves `ANTHROPIC_API_KEY` from env by default, and the key is set in Vercel. No action; the example entry is correct.
- [ ] **R3-INFRA-6** · sitemap vs robots `allow`-list drift — ⚪ **[M]** — `sitemap.ts:39` lists URLs absent from `robots.ts:18`.
- [ ] **R3-INFRA-7** · `IP_HASH_SALT` committed default defeats IP pseudonymization — ⚪ **[D]** — `app/api/free/manager-archetype-map/route.ts:18`, `lib/affiliate.ts:58`.

### Frontend / brand / accessibility
- [ ] **R3-FE-1** · Mobile gate hard-walls the marketing/affiliate/lead-gen funnel — 🟠 **[D]** — `components/MobileGate.tsx:15`: phones hit "desktop only" on `/syllabus`, `/compare`, `/enterprise/*`, all `/affiliates/*`, the free magnet.
- [ ] **R3-FE-2** · Retired-palette colors as live surfaces in new components — 🟠 **[M]/[D]** — `admin/users:181` (`#10B981`), kit `EnterprisePanel`/`KitDoc*` (`#8B5CF6`); swaps mechanical, but the active palette has no green (status-color decision).
- [ ] **R3-FE-3** · `--light` (#E8E4DF) used as text, 1.18:1 invisible — 🟠 **[M]** — `enterprise.module.css:908` (`.checkNo`): the enterprise comparison "not included" marks are unreadable.
- [ ] **R3-FE-4** · Ops password field has no accessible label — 🟠 **[M]** — `x/ops/layout.tsx:48` (placeholder only).
- [ ] **R3-FE-5** · DirectorPlan accordions/checkboxes not keyboard-operable — 🟠 **[M]** — `admin/tower/director/DirectorPlan.tsx:218` (`role=button`/`checkbox`, no `onKeyDown`).
- [ ] **R3-FE-7** · ~10 unlabeled form controls across `/admin` + `/x/ops` — 🟡 **[M]** — add `aria-label` per control.
- [ ] **R3-FE-6** · `admin/design` names retired hex (future canon-CI tripwire) — ⚪ **[M]** — allowlist it when a hex rule lands. *(Verified clean: all internal links resolve, `/partners→/affiliates` 301s exist, `#6B6B6B`-on-cream passes AA.)*

### Build / CI / tests
- [ ] **R3-CI-1** · CI runs no tests at all — 🟠 **[D]** — `.github/workflows/ci.yml` is lint→tsc→canon→build; `npm test` is never invoked. **This is why every bug in this doc shipped green.**
- [ ] **R3-CI-2** · The "full journey" e2e is a 1,963-line screenshot script (2 assertions) that force-advances past broken lessons — 🟠 **[D]** — `tests/e2e/full-journey.spec.ts`; structurally can't fail on the known bugs.
- [ ] **R3-CI-3** · Canon enforcement is non-blocking — 🟠 **[D]** — lint is `warn`-only (no `--max-warnings 0`), `canon-check` runs `--soft`; the brand gate is decorative.
- [ ] **R3-CI-4** · Money/auth/artifact paths have zero coverage — 🟠 **[M]** — add vitest + pure-function tests for commission / attribution-window / artifact math.
- [ ] **R3-CI-5** · `tsc` runs before build → Next route-type validation skipped in CI — 🟡 **[M]** — reorder the steps (`.next/types` only exists post-build).
- [ ] **R3-CI-6** · `api-critical-paths.spec` asserts the wrong status for `/api/purchase-status` — 🟡 **[M]** — expects ≥400, impl returns `200 {confirmed:false}`; would fail if it ran.
- [ ] **R3-CI-7** · Deps caret-ranged; `eslint-config-next` off-version from `next` — ⚪ **[M]** — pin runtime-critical deps; align the preset.

> **Reconciliation:** the build pass reported "no 40% commission bug." It checked `EconomicsCalculator.tsx` (0.30) and the FAQ/email but **not** `app/affiliates/calculator/Calculator.tsx:13` (`0.4`), the calculator copy, or `lib/partnerships/outreach-templates.ts` (all "40%") — which I read by hand. **P0-8 stands**: 30% and 40% both ship, on different surfaces. Also confirmed: `next@16.2.4` is the **stock** registry build, not a fork (the AGENTS.md "not the Next.js you know" framing is about conventions, not a patched binary).

---

## ROUND 4 — Seven specialist lenses
*Aimed at the seams and the off-happy-path cases. The four Criticals are promoted to Phase 0 (P0-13…P0-16); the rest are below, grouped by lens, tagged severity + **[M]**/**[D]**. ✅ = I hand-verified it this round. Several extend an existing item (cross-referenced inline).*

### Money & accounting
- [ ] **R4-MON-1** · Commission base is **gross**, but the program page *and* the binding D22 agreement say "30% of **net** (gross − refunds − fees − tax)" — 🟠 **[D]** — `webhooks/stripe:283` vs `affiliates/program/page.tsx:202`, `docs/affiliate/D22-pilot-agreement.md:70`. (Third data point in the commission cluster — see P0-8.)
- [ ] **R4-MON-2** · `affiliates.commission_pct` is a **dead column** — the webhook hardcodes `DEFAULT_COMMISSION_RATE` and never reads it, so the founder setting it to 40 (per the runbook) does nothing — 🟠 **[M]** ✅ — `webhooks/stripe:283,292`, `20260522_affiliates_entity.sql:47`. **This is the mechanism under P0-8.**
- [ ] **R4-MON-3** · Team sales **are** affiliate-attributed despite the public "team isn't attributable" promise — 🟠 **[M]** ✅ — `webhooks/stripe:266` (no tier guard) vs `affiliates/faq/page.tsx:133`; pays 30% of the large team ticket.
- [ ] **R4-MON-4** · Partial refunds revoke the **whole** purchase + 100% of commission — 🟠 **[D]** — `webhooks/stripe:325-356` never reads `amount_refunded`; the refund policy explicitly allows case-by-case partials.
- [ ] **R4-MON-5** · Connect pays commission on gross while the platform also absorbs the Stripe fee → true channel cost ~33% of gross, not 30% — 🟡 **[D]** — `stripe-connect.ts:114` (no `application_fee_amount`).
- [ ] **R4-MON-6** · No currency validation — `amount_total` assumed USD-cents, transfer hardcoded `usd`; a zero-decimal (JPY) sale is wrong by 100× — 🟡 **[M]** — `webhooks/stripe:65`, `stripe-connect.ts:126`.
- [ ] **R4-MON-7** · Sales tax / VAT never collected (`automatic_tax` off); if ever enabled, commission would be paid on collected tax — 🟡 **[D]** — `checkout/route.ts:79`.
- [ ] **R4-MON-8** · Per-row rounded commissions don't reconcile to the rounded total + `affiliate_payouts.attribution_ids` is a bare `uuid[]` (danglers when a purchase is deleted) — 🟡 **[M]/[D]** — `webhooks/stripe:283`, `20260519_affiliate_backend.sql:93`.
- [ ] **R4-MON-9** · The $40 artifact unlock has no refund handling — a refunded unlock leaves the grant + access permanent — ⚪ **[M]** — `webhooks/stripe:325` looks up only `purchases`; unlocks write `artifact_unlocks`.

### State machines & lifecycle
- [ ] **R4-SM-1** · No `partner_workshop` **creation** path — nothing inserts a row, so the whole usher state machine can never run — 🟠 **[D]** — upstream of P1-9 / R3-ENT-1.
- [ ] **R4-SM-2** · Dispute **won** → buyer locked out forever (no `charge.dispute.closed` handler restores `active`) — 🟠 **[M]** — `webhooks/stripe:391`.
- [ ] **R4-SM-3** · Team buyer charged but stranded with no team when the webhook can't resolve a user id — 🟠 **[D]** ✅ — `webhooks/stripe:190` (gated on `userId && isNewPurchase`; userless purchase never retries). Same root as P0-13.
- [ ] **R4-SM-4** · Promoting an application to affiliate never advances `affiliate_applications.status` → the review queue never drains — ⚪ **[M]** — `affiliate.ts:655`.
- [ ] **R4-SM-5** · Followup "halt on reply" is blind to manual-channel contacts (no email to match) → the ladder advances on the timer alone — ⚪ **[D]** — `cron/followup:90`. *(Payout-stuck-in-`processing` after a crash = P1-1; cleared-attribution-on-disputed-purchase = the dispute half of P0-2 — both noted there.)*

### Timezone & date math
- [ ] **R4-TZ-1** · The 1-hour abandonment email reaches **~1/24 of carts** — a daily cron samples a 1-hour window — 🟠 **[D]** — `vercel.json` (`0 13 * * *`) vs `cron/abandonment` `[now-2h, now-1h]`.
- [ ] **R4-TZ-2** · Workshop reminders show the time in **UTC** while the confirmation + page use the affiliate's tz — registrant sees two different times — 🟡 **[M]** — `cron/usher:43` (`toUTCString()`) vs `formatWorkshopDateForDisplay`.
- [ ] **R4-TZ-3** · The "7am ET" almanac arrives **6am ET for ~4 winter months** (hardcoded `0 11 * * *` UTC drifts with DST) — ⚪ **[D]** — `vercel.json` vs the "7am ET" copy. *(Good news: drip/dropoff/review/retention/refund-window/attribution-window/followup/invite-expiry date math is all correctly UTC-anchored — verified clean.)*

### Stripe webhook + `lib/email.ts` (line-by-line)
- [ ] **R4-DR-2** · Purchase-upsert failure logged but execution continues → team made with `purchase_id:null`, attribution silently skipped, "you're in" email still sent for an uncommitted purchase — 🟠 **[M]** ✅ — `webhooks/stripe:185`. (Folded into P0-13's fix.)
- [ ] **R4-DR-3** · Team created only when `isNewPurchase` → a first-attempt team-creation failure never retries (the `existingTeam` guard already makes the flag redundant + harmful) — 🟡 **[M]** ✅ — `webhooks/stripe:190`.
- [ ] **R4-DR-4** · `team.max_seats: 10` hardcode, unrelated to what was purchased (no quantity/seat selection exists) — 🟡 **[D]** — `webhooks/stripe:210`.
- [ ] **R4-DR-5** · `account.updated` may be delivered to a *separate* Connect endpoint (then affiliate Stripe status never updates) + `mapAccountStatus` masks unknown shapes as `restricted` — 🟡 **[D]** — `webhooks/stripe:364`, `stripe-connect.ts:90`.
- [ ] **R4-DR-6** · `sendWorkshopRegistrationConfirmation` double-escapes `firstName` ("Mac & Co" → "Mac &amp;amp; Co") — 🟡 **[M]** — `email.ts:2401` + `:233`.
- [ ] **R4-DR-7** · `name === 'there'` is an overloaded sentinel duplicated across two files; a buyer named "there"/"There" is mishandled — ⚪ **[M]** — `webhooks/stripe:121`, `email.ts:960`.
- [ ] **R4-DR-8** · `'ae'` tier is mislabeled "Individual" on the receipt (the only record of what they bought) — ⚪ **[M]** — `email.ts:1157`.
- [ ] **R4-DR-9** · `htmlToText` drops the URL for links whose label has nested tags → plain-text links with no destination — ⚪ **[M]** — `email.ts:54`.
- [ ] **R4-DR-10** · Receipt number + "Member No." are generated at render time (non-reproducible across resends); `$NaN` if a non-number ever reaches the receipt — ⚪ **[M]** — `email.ts:1006,1159`.
- [ ] **R4-DR-11** · `safeSend` returns `false` (not throw) on a Resend API error; the webhook only catches throws → a failed welcome/receipt is invisible even to Sentry — ⚪ **[M]** — `email.ts:127` ↔ `webhooks/stripe:246`.
- [ ] **R4-DR-12** · `weeklyFraming` divides by `total` (a zero-lesson learner is told they're in the "final third") + dangling clause when `completed===total` — ⚪ **[M]** — `email.ts:1456`.

### Legal / tax / FTC / privacy
- [ ] **R4-LEG-1** · 40% (marketing/calculator) vs "30% of net" (the binding D22 affiliate agreement) — contract-vs-marketing conflict — 🟠 **[D]** — `D22-pilot-agreement.md:70` vs `Calculator.tsx:13`. (Commission cluster; see P0-8.)
- [ ] **R4-LEG-2** · Reddit pixel + PostHog + a 1-year visitor cookie fire for EU/UK with **no consent banner and no geo-gating** (ePrivacy/GDPR prior-consent) — 🟠 **[D]** — `layout.tsx:99`, `lib/analytics.ts`, `r/[slug]:104`; no consent infra exists.
- [ ] **R4-LEG-3** · Privacy policy promises access/erasure ("permanently removed") with no DSAR path — the legal-page **contradiction** (distinct from R3-AUTH-5, the missing feature) — 🟠 **[D]** — `privacy/page.tsx:73`.
- [ ] **R4-LEG-4** · No FTC earnings-claim substantiation/typicality disclaimer on the calculator's "$X/yr" projections ("real benchmarks" uncited; disclaimer not prominent) — 🟡 **[M]/[D]** — `Calculator.tsx:53,170`.
- [ ] **R4-LEG-5** · FTC affiliate disclosure (16 CFR 255) is taught well but **not enforced** — `submitAffiliateCopy`/`canon-check` never check for a disclosure; warden is an optional LLM, not a gate — 🟡 **[M]** — `affiliate.ts:157`, `canon-mechanical.ts`.
- [ ] **R4-LEG-6** · ToS has no governing-law / dispute-resolution / arbitration and no affiliate terms; D22 ships an unfilled `[GOVERNING_LAW_STATE]` — 🟡 **[D]** — `terms/page.tsx`, `D22:182`. *(Genuine legal review warranted.)*
- [ ] **R4-LEG-7** · Indirect collection of non-consenting individuals' PII (scraped + Anthropic-enriched prospects) with no GDPR Art. 14 basis/notice — 🟡 **[D]** — `partner_pipeline`, `email-finder.ts`, `dossier-research.ts`.

### Performance / scale / cost
- [ ] **R4-PERF-1** · Scout `researchSweep` has **no per-run token cap** (≤400 searches + 240 fetches; the full transcript is re-billed each of 20 turns) — 🟠 **[D]** — `scout-research.ts:45,189`. The single largest LLM-spend surface; Critical when run.
- [ ] **R4-PERF-2** · dossier-enrich per-row research is uncapped (6+4 tools × 12 turns, ≤48 briefs/day); `BATCH` caps rows, not tokens — 🟠 **[D]** — `dossier-research.ts:24`.
- [ ] **R4-PERF-3** · The lean LLM caps live in the **dead** `anthropic-agents.ts`; the live engines are the expensive ones — 🟠 **[M]** — extends P3-1.
- [ ] **R4-PERF-4** · Admin dashboard reads **all** `course_progress` + **all** active `purchases` on every load and aggregates in JS — 🟠 **[D]** — `admin/page.tsx:7,9`; push to a SQL aggregate/RPC.
- [ ] **R4-PERF-5** · retention cron does N+1 per-candidate `course_progress` reads with no index on `is_completed`/`completed_at`/`updated_at` — 🟠 **[M]** — `cron/retention:184,242`; the `dropoff` cron's `.in()` batch is the reference fix.
- [ ] **R4-PERF-6** · `partner_pipeline` hot crons (contact-finder/scribe/followup, every 5–15 min) have **no covering composite index** — index-scan-on-status + heap-filter, degrading as scout fills the table — 🟠 **[M]** — `20260531…partner_pipeline.sql:25`.
- [ ] **R4-PERF-7** · Email crons fire `Promise.all` over the whole batch into Resend (≈2 req/s limit); `safeSend` has no 429 retry → silent drops once a cohort exceeds a few dozen — 🟠 **[M]** — `drip`/`review`/`dropoff`, `email.ts:127`.
- [ ] **R4-PERF-8** · Lesson content is read from disk on **every** request, **twice** per view, with no cache — 🟠 **[M]** — `catalog.ts:79,119`, `units/[unitId]/route.ts`.
- [ ] **R4-PERF-9** · Oversized raw assets beyond the landing video: `reveal/*.png` 4–7MB ×6, `turtle.png` 3.2MB, mascots ~1.5–2MB ×8 — no `next/image`/`images` config — 🟠 **[M]** — `public/`, `next.config.ts`. (With P0-16.)
- [ ] **R4-PERF-10** · `affiliate_prospect_events` is unbounded + `/x/track` runs 2–3 `count(exact)` per high-intent event with no `(prospect_slug, name)` index — 🟡 **[M]** — `x/track:77`.
- [ ] **R4-PERF-11** · Admin affiliates page pulls the **entire** `affiliate_clicks` table (unfiltered `select`) to count per-slug in JS — 🟡 **[D]** — `admin/affiliates/page.tsx:26`.
- [ ] **R4-PERF-12** · `events` append-log has no TTL/partition/retention — grows fastest of all tables, forever — 🟡 **[D]** — `20260519_events.sql`.
- [ ] **R4-PERF-13** · A stale model id 404s and the engines re-issue the emit call on a non-timeout error (double failed round-trip) — 🟡 **[D]** — extends R3-AG-6.
- [ ] **R4-PERF-14** · contact-finder/courier `maxDuration` vs batch size can overrun + half-write if `BATCH` is raised to clear a backlog — 🟡 **[M]** — `cron/contact-finder:24`.
- [ ] **R4-PERF-15** · Every email builds its HTML **twice** per send (html + a full `htmlToText` rebuild, ×22 sites) — ⚪ **[M]** — `email.ts` (e.g. `:2111`).
- [ ] **R4-PERF-16** · `tools/page` is `force-dynamic` for a static array; `CourseFramePreview` does an uncached `readFileSync` of a 125KB lesson — ⚪ **[M]** — `tools/page.tsx:15`.

### Lesson-HTML interaction logic *(systemic across all 36 unless noted)*
- [ ] **R4-LH-1** · Cross-device restore loses **all** exercise/quiz/timeline progress and lands the learner on screen 0 (restore re-applies only gate text; no lesson reads the `?screen` the host sends) — 🟠 **[D]** — `restoreFromParent` + `page.tsx:110`.
- [ ] **R4-LH-2** · Quiz score never reaches the extractor (`_extra.quiz {ans,submitted,passed}` vs `extract.ts` `quizScore {correct,total}`) — 🟠 **[M]** — extends P1-15 (the quiz half; shape differs too, so a rename alone won't fix it).
- [ ] **R4-LH-3** · A garbage/mis-cased `?role` renders **both** AE+SDR variants stacked while the JS silently builds SDR; an AE who loses the param becomes an SDR — 🟠 **[M]** — head role script, no normalization/whitelist.
- [ ] **R4-LH-4** · Role-fork localStorage keys omit `role` → answers and `completed` flags leak across the two forks of a unit — 🟡 **[D]** — `_storageKey` derived from pathname only.
- [ ] **R4-LH-5** · `aesdr:restore` (fixed 1.5s timeout, no ready-handshake) clobbers a textarea mid-type and silently no-ops if the iframe listener isn't ready yet — 🟡 **[D]** — `ProgressSaver.tsx:144`.
- [ ] **R4-LH-6** · restoreFromParent overwrites `_lessonExtra` wholesale then re-persists → can regress fresher localStorage (split-brain on next reload) — ⚪ **[M]**.
- [ ] **R4-LH-7** · Resuming directly onto the completion screen never re-fires `aesdr:complete` — ⚪ **[M]** — adjacent to P1-4.
- [ ] **R4-LH-8** · lesson-01 unit 1 uses a divergent `_extra.lesson` shape the extractor can't read (template outlier) — ⚪ **[M]** — file-specific.
- [ ] **R4-LH-9** · The lesson HTML uses the **retired** fonts (Inter/Abril/DM-Mono) + dark palette (`--black/--amber/--cobalt`) across all 36 — brand-canon drift — ⚪ **[D]**. *(Verified sound, don't re-chase: the gate engine has no stuck/skippable gates, no mismarked answers, consistent pass thresholds, and no `eval`/XSS.)*

---

## ROUND 5 — Seven UX/ops/copy/config lenses
*UX, operations, copy, and config — the surfaces the code-correctness passes didn't grade. No new Criticals; mostly High/Medium and overwhelmingly `[M]`. Grouped by lens. Several reconciliations/resolutions are folded back into earlier sections (R3-INFRA-5 closed; model IDs confirmed).*

### Onboarding & first-run UX
- [ ] **R5-OB-1** · Temp-password login lands on a `/welcome` marketing splash with a **dismissable** password overlay, across **three** different password routes (set-password / change-password / the overlay) — 🟠 **[D]** — `login:47`, `welcome`, `PasswordOverlay`, `account/change-password`.
- [ ] **R5-OB-2** · Success page + welcome email promise "**no onboarding checklist** — straight into Course 1," then the app forces 3 gates (set-password → select-role → a "pick your 25-min window" onboarding form) — 🟠 **[M]** — `success:257`, `email.ts:1023` vs `dashboard:49-74`.
- [ ] **R5-OB-3** · No "step N of M" across the forced setup gates (each looks terminal; inconsistent labels) — 🟡 **[M]** — `account/*`.
- [ ] **R5-OB-4** · The welcome email passes `?email=` but the login form ignores it → the buyer retypes the email they just bought with — 🟡 **[M]** — `email.ts:944` vs `login:14`.
- [ ] **R5-OB-5** · The empty dashboard assumes progress; no first-run orientation (what a lesson is, that progress saves) — 🟡 **[M]** — `dashboard:393`.
- [ ] **R5-OB-6** · "Save & Exit" performs no synchronous save and shows no confirmation before the fade-to-black — 🟡 **[D]** — `SaveExitButton:14`, `ProgressSaver:44`. *(The "Resume reloads Unit 1" loop = the UX face of P0-7; signup copy-lie = R3-AUTH-8; member-number mismatch = R4-DR-10. The role-gate "oversell" guess was **refuted** — R4 verified the fork is real.)*

### Email deliverability & sender reputation
- [ ] **R5-DV-1** · One root domain (`aesdr.com`) carries transactional **and** bulk marketing **and** the founder's mailbox — no subdomain split (the internal ops doc flags this as unbuilt) — 🟠 **[D]/live** — `email.ts:28`, `courier:31`.
- [ ] **R5-DV-2** · No Resend bounce/complaint webhook → hard-bounced/complained addresses are never suppressed; every cron re-sends to them — 🟠 **[D]** — missing `app/api/webhooks/resend/`.
- [ ] **R5-DV-3** · "Reply UNSUBSCRIBE" + all replies depend on human triage of a forwarded Gmail; no programmatic consumer-inbound processing — 🟡 **[D]** — `email.ts:2010` (`hello@`→founder Gmail; *not* a black hole, but unactioned).
- [ ] **R5-DV-4** · Bulk/marketing sent to unconfirmed addresses (abandonment → never-completed checkout emails; free-lead single-opt-in); no double-opt-in anywhere — 🟡 **[D]** — `cron/abandonment:21`.
- [ ] **R5-DV-5** · No `List-Id` / `Precedence: bulk` / Message-ID threading on bulk mail — 🟡 **[M]** — `email.ts:30`.
- [ ] **R5-DV-6** · SPF/DKIM/DMARC + root-domain mixing (Resend **and** Google Workspace both send as `@aesdr.com`) — a DMARC-alignment gap could **silently spam the welcome + receipt** — 🟠 **[live-check]** — `dig` the records. *(Burst-send 429 drops = R4-PERF-7; mailto-only one-click = P0-12/R3-EMAIL-3.)*

### Integration config (Stripe / Supabase / Resend / Anthropic)
- [ ] **R5-IC-1** · No `allow_promotion_codes` → a launch / affiliate-recovery discount is impossible without a code change — 🟠 **[D]** — `checkout:79`.
- [ ] **R5-IC-2** · The Stripe client pins **no `apiVersion`** + caret `^22.0.0` → a rebuild can silently shift the payments API version under a green build — 🟠 **[D]** — `checkout:13`, `webhooks/stripe:20`.
- [ ] **R5-IC-3** · `customer_creation` unset → no reusable Stripe Customer; repeat-buyer + receipt linkage is email-string-based — 🟡 **[D]** — `checkout:79`.
- [ ] **R5-IC-4** · `email_confirm: true` auto-verifies an unproven email → account squatting + the temp-password lands in an inbox the payer may not control — 🟡 **[D]** — `webhooks/stripe:116`.
- [ ] **R5-IC-5** · Temp-password generator is modulo-biased + no server-enforced strength (`minLength=6`, relies on Supabase defaults) + no temp-password expiry — 🟡 **[M]/[D]** — `webhooks/stripe:23`, `set-password:129`.
- [ ] **R5-IC-6** · Auth-callback redirect allowlist omits `/welcome`, `/affiliates`, `/enterprise` → magic-link `next=` is bounced to `/dashboard` — 🟡 **[M]** — `auth/callback:7`.
- [ ] **R5-IC-7** · Resend sends carry no `idempotencyKey` (cron retries can double-send — the config backstop the DB-flag-after-send pattern lacks) and no `tags` (zero send-analytics) — 🟡 **[M]/[D]** — `email.ts:127`.
- [ ] **R5-IC-8** · Anthropic clients set no `timeout`/`maxRetries` → the SDK's 10-min timeout + 2 retries fight the 60s artifact route ceiling and eat the streaming budget — 🟡 **[M]** — `llm.ts`, `scout-research.ts:167`.
- [ ] **R5-IC-9** · `anthropic-agents.ts` defaults bypass `getAgentModel`; deprecated `claude-opus-4-1` sits in `SUPPORTED_MODELS` (retires 2026-08-05); a comment falsely claims the SDK gates model IDs — ⚪ **[M]** — `anthropic-agents.ts:20`, `agent-switch.ts:44`.
- [ ] **R5-IC-10** · `listUsers({perPage:50})` provisioning fallback fails **silently past 50 users** → userless purchase at scale (compounds P0-13) — ⚪ **[D]** — `webhooks/stripe:150`.

### Naming & brand separation
- [ ] **R5-NM-1** · Affiliate-kit description constants say "partners" (`lib/affiliate-kit.ts`, `affiliate-kit-private.ts`) — rendered on `/affiliates/kit` + `/x/kit` — 🟠 **[M]**.
- [ ] **R5-NM-2** · "partner hub" in the shared `HubChrome` (footer + 2 aria-labels) on **every** `/affiliates` page — 🟠 **[M]** — `HubChrome:108,46,56`.
- [ ] **R5-NM-3** · `EconomicsCalculator` says "partners" while the same sentence on `/affiliates/page` says "affiliates" — 🟡 **[M]** — `EconomicsCalculator:139`.
- [ ] **R5-NM-4** · The application form's UTM source is `partners-page` — 🟡 **[D]** — `ApplicationForm:42` (check if a report keys on the literal first).
- [ ] **R5-NM-5** · Bare "Partner" without the "channel" prefix on a few `/enterprise` labels — ⚪ **[M]** — `enterprise/integrations:33`, `channel-one-pager`. *(Clean negative: **no** enterprise↔consumer brand bleed; the rename is structurally done — this is residue in plumbing strings.)*

### Empty / loading / error states
- [ ] **R5-EE-1** · The $40 artifact-unlock tile silently swallows a failed checkout (no error; sale lost) — 🟠 **[M]** — `UnlockArtifactTile:40`.
- [ ] **R5-EE-2** · The reveal "choose your keeper" CTA swallows a 500 at the course's emotional climax — 🟠 **[M]** — `RevealView:70`.
- [ ] **R5-EE-3** · **No error boundary anywhere under `app/admin/`** → ~15 server-action failures full-page-crash with raw Postgres text — 🟠 **[M]** — add `app/admin/error.tsx`.
- [ ] **R5-EE-4** · The affiliate-detail "Pay out via Stripe Connect" button has no confirm/pending/error (double-submit on real money — a **second** unguarded payout trigger) — 🟠 **[M]** — `[affiliateSlug]:413`. Reinforces P0-1 / R3-AD-1.
- [ ] **R5-EE-5** · Affiliate Submissions renders the new-user empty state on a DB error (real submissions vanish, "start over") — 🟠 **[M]** — `submissions:74`.
- [ ] **R5-EE-6** · The tower reads "All clear." while sub-panels silently failed to load — 🟡 **[M]** — `tower:129`.
- [ ] **R5-EE-7** · The admin dashboard shows a fabricated `$0` / `0` on a failed aggregate query — 🟡 **[M]** — `admin/page.tsx:6`.
- [ ] **R5-EE-8** · No `loading.tsx` for the tower / candidate room (long live-research routes show a frozen page) — 🟡 **[M]**.
- [ ] **R5-EE-9** · Stripe post-onboarding refresh strands the affiliate on stale "Not connected" with no feedback → re-click loop — 🟡 **[M]** — `PaymentsControls:49`.
- [ ] **R5-EE-10** · The calculator shows sub-1 fractional sales ("0.5 sales → $50/mo") — 🟡 **[D]** — `Calculator:136`.
- [ ] **R5-EE-11** · `ReviewActions` success gives no confirmation → double-submit risk (flips an affiliate's gate) — 🟡 **[D]** — `ReviewActions:84`.
- [ ] **R5-EE-12** · Cluster of admin zero-data/`$NaN`/`"null"`-key gaps: Users table blank-when-empty + `$NaN` amount; `[affiliateSlug]` Links/Attributions blank; tower payout buckets null slug under `"null"`; playbooks "archetype: undefined"; static status forms (no pending) — ⚪ **[M]** — `admin/users`, `affiliates`, `tower:179`, `playbooks:147`. *(Buyer dashboard, artifact pages, and the tower `PayoutButton` are exemplary — don't regress them.)*

### Brand-voice canon (live copy)
- [ ] **R5-CN-1** · "**operating system**" (R-G4 banned) is the Manager-Archetype metaphor on 3 buyer surfaces (free magnet, tools, enterprise) — and it's in **neither** enforcer — 🟠 **[M]** — `free/manager-archetype-map:165`, `tools:45`, `enterprise/implementation:186`.
- [ ] **R5-CN-2** · "**takeaway artifacts**" (retired for "substantial assets" in v1.5; "takeaway" founder-banned) ships in 4 emails — `lib/email.ts` is outside the ESLint scope — 🟠 **[M]** — `email.ts:1372,1564,2072`.
- [ ] **R5-CN-3** · "**leverage**" (R-G4 banned) ×3 — affiliate playbooks ×2 + lesson-09 — 🟡 **[M]** — `playbooks:106,109`, `aesdr_course09_2_v1.html:1601`.
- [ ] **R5-CN-4** · R-G7 "isn't X — it's Y" pivot opening **6** sidebar mottos / callouts across lessons 03–07 — 🟡 **[M]** — `aesdr_course06_2:1596`, `07_3:1685`, `04_2:1674,1384`, `03_2:1663`, `05_3:1661`.
- [ ] **R5-CN-5** · "**deep dive / deep-dive**" (R-G4 banned) ×4 as task headings + body — 🟡 **[M]** — `aesdr_course10_1:1571,1578,1730`, `06_3:1463`.
- [ ] **R5-CN-6** · British "recognise" on `/about` (canon §5 = American spelling) — ⚪ **[M]** — `about:24`. *(Enforcement-coverage gap behind all of these: the ESLint blocklist is `warn`-only **and** scoped to `app`/`components` `.ts/.tsx` only — it never sees `lib/email.ts` or `content/lessons/**`; "operating system" is in neither enforcer. Extends R3-CI-3. The lesson **prose is otherwise unusually clean** — no banned vocab, no R-G3 cadence; "verdict"/"reps"/"blueprint"/"mindset" uses are all the allowed carve-outs.)*

### PII data-flow & privacy-by-design
- [ ] **R5-PI-1** · The affiliate's confidential deal/pipeline free-text is sent to **PostHog** as event props — 🟠 **[M]** — `EnterprisePanel:57`→`track.ts:60`.
- [ ] **R5-PI-2** · Sentry + PostHog **session replay** record buyer free-text unmasked (`replaysOnErrorSampleRate:1.0`, no `maskAllInputs`) — 🟠 **[M]/[D]** — `sentry.client.config.ts:6`, `analytics.ts:38`.
- [ ] **R5-PI-3** · Buyer name + free-text reflections are sent to **Anthropic** in artifact prompts, unredacted — 🟠 **[M]/[D]** — `llm.ts:418,588`.
- [ ] **R5-PI-4** · Scraped-prospect identity is chained to **Anthropic** then **BetterContact** with no consent gate + persisted indefinitely — 🟠 **[D]** — `dossier-research.ts:123`→`email-finder.ts:153`.
- [ ] **R5-PI-5** · Full Supabase/Resend error **objects** logged to console on PII inserts (email echoes in `details`) — 🟡 **[M]** — `free/...:82`, `apply:109`, +5 sites; log `.message` only.
- [ ] **R5-PI-6** · An inbound prospect's raw email is interpolated into a console log **label** — 🟡 **[M]** — `partner-alerts.ts:55`.
- [ ] **R5-PI-7** · PostHog `$pageview` captures the full URL incl. the prospect slug (`?p=`) + attribution params — 🟡 **[M]** — `PostHogClient:14`.
- [ ] **R5-PI-8** · `ip_hash` has **three no-salt call sites** (`req-meta.ts:5`, `apply:70`, `enterprise/contact:55`) + 4 inconsistent implementations → brute-forceable, defeats de-dup, and the hash leaves the DB into founder emails — 🟡 **[M]** — consolidate to one HMAC helper.
- [ ] **R5-PI-9** · **No retention/TTL anywhere** → ~15 PII-bearing tables (events, clicks, prospect events, inbound bodies, phone, leads) grow forever — 🟡 **[D]** — (broadens R4-PERF-12).
- [ ] **R5-PI-10** · Over-collection: full `user_agent` + `referrer` stored on every telemetry row, never read for the stated triage purpose — ⚪ **[M]**. *(testimonials anon-email = R3-DATA-1. **Erasure reachability:** PostHog / Sentry / BetterContact / Anthropic / Resend / Vercel-logs are all unreachable today — reinforces R4-LEG-3.)*

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

## What I need from you — the decision list
*Everything tagged **[M]** in this document I can patch right now on the branch with no input — that's the large majority. The list below is the complete set of what blocks the rest. Each decision has a **recommended default**; reply "defaults" (optionally "…except 3, 14") and I can patch every [M] item plus every [D] whose default you accept. The genuinely-yours items (a mailing address, Vercel env, a CI test project) I'll prep so you only have to paste/apply.*

### A · Product & policy decisions (one line each; default in **bold**)
**Money**
1. Commission rate — 30% or 40%? (P0-8) → default **30%** (what the ledger already pays); I sweep every "40%" surface down.
2. Commission net-or-gross of Stripe fees + real minimum payout? (P2-16) → default **gross, $50 minimum**, stated once.
3. Self-referral purchases (R3-AF-3) → default **flag `self_referral` + exclude from payout** (reviewable; not silent-drop, not hard-block).
4. Forfeiture window for cleared-but-unpayable commission (R3-AF-5) → default **180 days + reminder emails, then forfeit** (confirm it's OK for your state).

**Identity & access**
5. Affiliate identity source (P0-9 + R3-AF-2) → default **key on `affiliates.user_id`, provisioned at activation** (auto-link/create the Supabase user + set-password email).
6. Account-deletion policy (R3-AUTH-5) → default **soft-delete auth + anonymize purchase rows** (keep financials for tax/clawback).
7. Password-change re-auth (R3-AUTH-4) → default **require current password + a fresh recovery token**.
8. Team-owner role (R3-AUTH-9) → default **owners skip the SDR/AE gate** (manager view).

**Curriculum**
9. Tool-gate scope (R3-CURR-1) → default **enforce the full per-lesson gate map on the OPEN routes**.
10. Minimum completion signal (R3-CURR-2, also closes P0-7) → default **`last_screen` at the final screen of all 3 units** before `is_completed`.
11. Canonical course titles (R3-CURR-5) → default **the dashboard `LESSONS` titles**, sourced everywhere.
12. Preview course label (R3-CURR-3) → default **relabel as Course 4** (keep the Archetype Map).

**Email & brand**
13. **Physical mailing address for the email footers (P0-12) — I need the actual address/PO box.** *(Hard blocker; no default possible.)*
14. Refund window (P2-13 / R3-EMAIL-8) → default **firm 14 days**, reconcile the dropoff-21d copy.
15. In-email iris (R3-EMAIL-4) → default **solid `--crimson` bar** (email-safe).
16. "Active" status color, since the active palette has no green (R3-FE-2) → default **crimson text + dot**.

**Automation (only bites once levers are on)**
17. Scout lever (R3-AG-3) → default **add scout to the fail-closed gated set**.
18. Auto-fill outreach from scraped content (R3-AG-5) → default **never auto-promote; mark "suggested" until a human approves**.
19. Courier crash-window (R3-AG-1) → default **claim-before-send** (a send-failure leaves a claimed row to clear once).
20. /x/track unknown slugs (R3-AF-10) → default **reject + rate-limit**.

**Infra / SEO / CI**
21. `/free/manager-archetype-map` indexable pre-launch? (R3-INFRA-2) → default **no — gate on launch mode**.
22. `IP_HASH_SALT` (R3-INFRA-7) → default **require it** (skip/throw if unset).
23. Mobile-gate scope (R3-FE-1) → default **coursework-only deny-list** (`/course`,`/tools`,`/dashboard`,`/artifacts` walled; everything else open on mobile).
24. CI test scope (R3-CI-1/2/4) → default **add auth-free specs now**, add the seeded full-journey e2e once you provision a test project (item B-4 below).
25. Canon CI (R3-CI-3) → default **escalate R-G4 hard-bans to `error` now**, leave the legacy backlog as `warn`.
26. Channel/enterprise motion (P3-6, still open) → default **document as unsupported** for now.

### A2 · Round-4 decisions (defaults in **bold**)
**Money & tax**
27. Commission base — code pays 30%-of-**gross**, the **D22 contract** says 30%-of-**net** (gross − refunds − fees − tax), the calculator says 40% (P0-8, R4-MON-1/5) → default **honor the contract: 30% of net**, build one `computeCommission()`, fix the calculator + every "40%" string. *(Supersedes decision #1's bare "30%": net is the contractual base.)*
28. Partial refunds (R4-MON-4) → default **keep access, reduce commission pro-rata** (vs all-or-nothing).
29. Currency (R4-MON-6) → default **assert USD-only** (reject/alert otherwise).
30. Sales tax / VAT (R4-MON-7) → **your call** on nexus; if you collect, I switch the commission base to `amount_subtotal` at the same time.
31. Rounding + payout ledger (R4-MON-8) → default **round at payout + a `payout_attributions` join table** (FKs, no danglers).
37. **Affiliate 1099/W-9 (P0-14)** → **your call (+ legal review):** Stripe files the NECs (Connect tax-reporting; likely Express/Custom) vs AESDR collects W-9s and self-files — and hard-block payouts until a W-9 is on file (recommended).

**Webhook / lifecycle**
33. Webhook hard-failure policy (P0-13, R4-SM-3, R4-DR-2) → default **return 500 on any non-`email_exists` provisioning error and on purchase-upsert error** so Stripe retries (P1-10 idempotency covers the duplicate-email risk).
32. `partner_workshop` creation (R4-SM-1) → default **an admin "create workshop" action** (vs auto-create from `affiliates.workshop_*`).
34. Team seats (R4-DR-4) → default **fixed 10-seat SKU, hoisted to a named constant** (no quantity selector exists today).
35. Abandonment 1h email (R4-TZ-1) → default **run the cron hourly** so the 1-hour window tiles the day.
36. Almanac "7am ET" (R4-TZ-3) → default **an in-handler ET-hour gate** (mail only in the 7-o'clock ET hour).

**Legal / privacy**
38. Tracking vs policy (P0-15, R4-LEG-2) → default **keep the Reddit pixel + PostHog, disclose every processor, add a geo-gated EU/UK consent banner** (vs remove the trackers to match the current text).
39. DSAR (R4-LEG-3) → default **align the policy copy to current capability now, build the erasure/export pipeline next** (with R3-AUTH-5).
40. Earnings-claim basis (R4-LEG-4) → **need the source** for the 1–3.5% click/conv benchmarks (or I relabel them "illustrative" + add a typicality disclaimer).
41. Governing law (R4-LEG-6) → **your call (+ legal review):** state of incorporation + whether to mandate arbitration / class-waiver.
42. Scraped-prospect data (R4-LEG-7) → **your call:** lawful basis (legitimate interest) + retention window + an Art. 14 notice line in EU outreach.

**Cost / performance / content**
43. LLM cost ceiling (R4-PERF-1/2) → **a number, please:** acceptable $ per scout sweep / per dossier brief (drives the token + `max_uses` caps); default meanwhile is a hard token-sum break + lower caps on the unattended cron path.
44. Landing video (P0-16) → default **re-encode to ~3MB + poster + lazy-load** (vs move to Mux/Blob).
45. `events` retention (R4-PERF-12) → default **archive/delete > 180 days for high-volume event types** (vs partition).
46. Lesson restore contract (R4-LH-1) → **your call:** are exercises local-only (cross-device restores gates only), or should the exercise blob persist to Supabase for true cross-device? The `?screen`-resume half is mechanical either way.
47. Lesson re-skin (R4-LH-9) → **your call:** re-font/re-palette all 36 lessons to the active brand now (large effort), or leave the legacy course styling.

### A3 · Round-5 decisions (defaults in **bold**)
**Onboarding / email-sending**
48. Onboarding flow (R5-OB-1/2) → default **collapse to one password route, drop the `/welcome` splash, and soften the "no checklist" copy** (keep the 3 setup steps; stop promising there are none).
49. Save-on-exit (R5-OB-6) → default **synchronous save + a brief "Saved" before the exit fade**.
50. Sender-subdomain split (R5-DV-1/6) → default **bulk on `news.aesdr.com`, transactional on root, cold-outreach on its own subdomain**, each DMARC-aligned (your DNS to apply).
51. Bounce/complaint handling (R5-DV-2) → default **build `app/api/webhooks/resend` + an `email_suppressions` table checked in `safeSend`**.
52. Double-opt-in (R5-DV-4) → default **suppress abandonment sends to bounced addresses; no DOI on the self-requested free asset**.

**Stripe / Supabase / Resend / Anthropic config**
53. Promo codes (R5-IC-1) → default **`allow_promotion_codes: true` on sdr/ae only**; decide whether a coupon should also shrink affiliate commission (it's computed off `amount_total`, which a coupon reduces).
54. Stripe `apiVersion` (R5-IC-2) → **tell me the version live in your Dashboard**; I pin it + exact-pin `stripe`.
55. Receipts (R5-IC-3) → default **keep Resend receipts**, set `customer_creation:'always'`, store the Customer id as the repeat-buyer join key.
56. `email_confirm` (R5-IC-4/5) → default **accept asserted-by-payment** + make the temp password one-time + short-lived; turn on Supabase leaked-password protection + a min-length floor (your Auth dashboard).
57. Resend idempotency scheme (R5-IC-7) → default **`<type>:<sessionId|userId>`** per send + `tags`.
58. `listUsers` fix (R5-IC-10) → default **`getUserByEmail` if the pinned Supabase-JS supports it, else paginate** + Sentry-alert on a null fallback.

**Naming / UX / PII**
59. UTM rename (R5-NM-4) → **`partners-page` → `affiliates-page`** unless a report keys on the literal (tell me).
60. Calculator fractional sales (R5-EE-10) → default **render sub-1 as "~1 every N months"** + floor the dollars to match.
61. Admin error UX (R5-EE-3/11) → default **add `app/admin/error.tsx`** (catches the ~15 crash sites) + a success state on `ReviewActions`.
62. Session-replay masking (R5-PI-2) → default **mask all inputs/text + block media (Sentry & PostHog); disable replay on `/course`, `/artifacts`, `/x/*`**.
63. Anthropic PII (R5-PI-3) → default **drop the buyer name from the artifact prompt** (render it client-side) + add Anthropic to the sub-processor list (with P0-15).
64. PII retention windows (R5-PI-9) → **per-table windows, please** (default: telemetry deleted > 180d; prospect/lead PII pruned by a real retention cron).

### B · Access / credentials I don't have (these unblock autonomous DB work + verification)
- **`DATABASE_URL`** (direct connection, port 5432) set in the **Claude Code web environment config** (not Vercel) → I run all the DB migrations myself (the `course_progress` CREATE, the artifact `CHECK`, the RLS/constraint/cascade fixes). Needs a fresh session after you set it. Without it, every DB fix is me writing SQL for **you** to paste in the Supabase SQL editor.
- **Live schema of the out-of-band tables** — paste `\d course_progress`, `\d generated_artifacts`, `\d affiliates` (or grant read) so migrations match prod and I know whether the artifact `CHECK` was already altered.
- **Vercel env vars** — you control Vercel; I'll hand you the exact list to set (`CRON_SECRET`, the 9 undocumented vars, `UPSTASH_*`, the `NEXT_PUBLIC_SITE_URL` fail-fast). I can't set these.
- **A CI test project** (only if you want the full e2e in CI) — a throwaway Supabase + Stripe-test project + `TEST_EMAIL`/`TEST_PASSWORD` secrets.

### C · External facts to confirm (a few words each)
- Does the **inbound-email worker** exist and write `partner_inbound_email`? (P1-2)
- Do the **model IDs** `claude-opus-4-6` / `claude-sonnet-4-6` resolve — or which should I use? (P0-8-adjacent, R3-AG-6)
- Is **`WORKSHOP_REGISTRANT_GROUP_ADDR`** a real list, and **where does the workshop join URL come from**? (R3-ENT-1/2)
- Does **BetterContact bill at enqueue or at result-read**? (R3-AG-9)
- Is **`STRIPE_PRICE_ID_ARTIFACT_UNLOCK`** (and the other price IDs) set in prod? (P1-16)

### D · Process note
Migrations are applied by hand in the Supabase SQL editor today, so until `DATABASE_URL` lands every DB-touching fix ships as SQL for you to run. I develop on `claude/keen-dirac-hzn00m`, commit + push, and open no PR unless you ask. Give me the section-A defaults (or overrides) + the mailing address + `DATABASE_URL`, and I can take every [M] item and every accepted-default [D] item end-to-end.

## Could-not-verify-from-code (needs a live check)
- [ ] Are **all migrations actually applied** in production? (Several backstops are only as real as their unique indexes + the out-of-band tables.)
- [ ] Does the **external inbound-email worker** exist and write `partner_inbound_email`? (P1-2)
- [x] ~~Do the **model IDs** resolve at the API?~~ — **RESOLVED (Round 5):** `claude-sonnet-4-6` / `claude-opus-4-6` / `-4-5` / `-4-1` are all valid; `claude-opus-4-1` is **deprecated, retiring 2026-08-05** — drop it from `SUPPORTED_MODELS` (R5-IC-9).
- [ ] Is `WORKSHOP_REGISTRANT_GROUP_ADDR` a real list, or the `hello@` placeholder? (P1-9)
- [ ] Does the live `generated_artifacts` constraint already allow `playbill`/`redline` (altered out-of-band), or only `migrations/` is stale? (P0-6)
- [ ] Do the other **11 unit-1 lesson files** all fire `aesdr:complete` + exit to `/dashboard` like `lesson-03`'s? (P0-7 — confirms the blast radius is all 12, not one.)
- [ ] Does **`/signup` link an existing purchase by email** and grant course access, or just create an orphan account? (P1-17)
- [ ] Is **`STRIPE_PRICE_ID_ARTIFACT_UNLOCK`** set in prod? If not, the $40 unlock 400s before it can even be a no-op. (P1-16)
- [ ] What does the free **manager-archetype-map** email actually deliver vs what the capture form promises? (P2-14)
- [ ] Are any **affiliates already backfilled with `user_id`** in prod, or is the client-writable JWT-slug fallback the *only* live identity path? (P0-9 blast radius)
- [ ] Is the **PostgREST anon endpoint** reachable such that `testimonials?select=email` actually returns data in prod? (R3-DATA-1)
- [ ] Which webhook endpoint receives Stripe **`account.updated`** — this `/api/webhooks/stripe`, or a separate Connect endpoint? (R4-DR-5 — determines whether affiliate Stripe status ever updates)
- [ ] Is **`automatic_tax`** actually disabled in the live Stripe config, and does AESDR have sales-tax/VAT **nexus**? (R4-MON-7)
- [ ] Does **BetterContact** bill at enqueue or at result-read? (R4-PERF / R3-AG-9 — determines the re-bill fix)

---

## Verified working — *don't spend time here*
Stripe signature verification · refund→access revocation (the `status='active'` gate) · the webhook `charge.refunded`→attribution flip (for pending/cleared) · drip/abandonment/dropoff/review crons are scheduled & double-send-guarded via `*_sent` flags · `reveal_picks` + team-owner creation use race-safe upserts · the `merge_lesson_progress` RPC fixes the two-tab progress race · cron-auth / admin-gating / RLS posture / the `/api` proxy exclusion.

---

## 📋 Master status table (all findings)
*Legend: ✅ done (in code on main) · 🟡 partial · ⬜ not started/deferred · 👤 on you (decision/infra/external). "Done" = patched + builds + (money math) unit-tested, not individually load-tested.*

**Tally — ✅ 275 done · 🟡 0 partial · ⬜ 1 not-started · 👤 2 on you · 278 total.** (2026-06-29 batch 4: **sales tax wired** — `automatic_tax: {enabled:true}` on the checkout (R4-MON-7 ✅, Stripe Tax enabled by founder); **BIMI** split out as its own item R5-DV-7 👤 — DMARC is enforcing but the logo-in-inbox needs a VMC cert + `default._bimi` DNS + a square SVG-PS mark, see `docs/2026-06-29-bimi-setup.md`; P3-10 clarified — `verdict` is the Redline book-review motif + a mascot pose, recommend keep. Batch 3 had set commission → 40% / attribution → 30-day across the board, Delaware confirmed, R5-DV-6 (DMARC) resolved, and the scraped-prospect retention purge. tsc/lint/build green, 48 unit tests.) **The 3 remaining:** P3-10 (⬜ — `verdict`, recommend keep); R4-LEG-4 (👤 — no product earnings claims; source the `/about` stats if you want); R5-DV-7 (👤 — BIMI **deferred** as a later branding upgrade; guide saved for when you want it).

### Phase 0

| ID | Finding | Status | Note |
|---|---|---|---|
| P0-1 | Payout can double-transfer | ✅ | Idempotency key + atomic claim |
| P0-2 | Refund/chargeback no clawback | ✅ | Clawback ledger nets next payout |
| P0-3 | Admin "refund" refunds nothing | ✅ | Calls Stripe + flips attribution |
| P0-4 | `course_progress` no CREATE migration | ✅ | Dated CREATE TABLE committed |
| P0-5 | Artifacts never generate | ✅ | Invoked on completion + backfill |
| P0-6 | Artifact CHECK rejects real types | ✅ | Constraint migrated to playbill/redline |
| P0-7 | Units 2 & 3 stranded | ✅ | Per-unit completion + nav |
| P0-8 | Promised 40%, code pays 30% | ✅ | One source (lib/commission.ts); 40% of net (founder set 2026-06-29) |
| P0-9 | Affiliate account takeover | ✅ | Server-trusted identity; fallback deleted |
| P0-10 | Team tier paid-but-unusable | ✅ | Service-role check + signup round-trip |
| P0-11 | Affiliate links never attribute | ✅ | `/r/` added to proxy allowlist |
| P0-12 | CAN-SPAM across lifecycle email | ✅ | Footer link carries `?email=`; Resend bounce webhook live |
| P0-13 | Paying buyer locked out | ✅ | Branches on createError; returns 500 |
| P0-14 | No 1099/W-9 tax handling | ✅ | Stripe files NECs; copy corrected |
| P0-15 | Privacy policy materially false | ✅ | 8 subprocessors + lawful basis disclosed |
| P0-16 | 78MB video auto-plays | ✅ | Click-to-play (autoplay removed); re-encode optional |

### Phase 1

| ID | Finding | Status | Note |
|---|---|---|---|
| P1-1 | Payout in killable Server Action | ✅ | Route handler + maxDuration + claim |
| P1-2 | Inbound-email webhook absent | ✅ | Handled externally (Antaeus gmail); not needed in-app |
| P1-3 | Enterprise-intent event mismatch | ✅ | Event added to bright set |
| P1-4 | Iframe path no `course_completed` | ✅ | Emitted from `/api/progress/complete` |
| P1-5 | `retention` cron unscheduled | ✅ | Wired (schedule off for cost) |
| P1-6 | "Pause me" doesn't pause crons | ✅ | `paused_until` filter across crons |
| P1-7 | Apply form collects no email | ✅ | Applicant acknowledgement email sent on submit |
| P1-8 | Artifacts API ungated | ✅ | All-12 completion check added |
| P1-9 | Workshop reminders to placeholder | ✅ | Per-registrant fan-out |
| P1-10 | Non-atomic webhook idempotency | ✅ | Atomic first-processing claim |
| P1-11 | `partner_kit_*` column drift | ✅ | Code/migration column names agree |
| P1-12 | `NEXT_PUBLIC_SITE_URL` defaults to prod | ✅ | getSiteUrl() guard; throws on a misconfigured deploy |
| P1-13 | Rate-limit evaporates without Upstash | ✅ | Require Upstash in prod; in-memory only as outage fallback |
| P1-14 | Strike counter re-pause trap | ✅ | Strikes since last reactivation |
| P1-15 | Diagnostic scores always 0% | ✅ | Keys aligned + fixture test |
| P1-16 | $40 unlock grants nonexistent artifact | ✅ | Downstream of P0-5 generation |
| P1-17 | Success page strands at 30s | ✅ | Signup links existing purchase |

### Phase 2

| ID | Finding | Status | Note |
|---|---|---|---|
| P2-1 | Dormant completion emails | ✅ | Wired to completion events |
| P2-2 | Day-0 +12h/+36h emails unwired | ✅ | Wired into drip cron |
| P2-3 | Free-lead capture dead end | ✅ | Documented one-shot / nurture |
| P2-4 | `checkout_sessions` not always written | ✅ | Always insert, backfill |
| P2-5 | Team seat limit non-atomic | ✅ | Locked check on accept |
| P2-6 | Failed-payment/dispute events unhandled | ✅ | New webhook event handlers |
| P2-7 | Post-charge email failure silent | ✅ | Retry/backfill + Sentry |
| P2-8 | SMS consent, no channel | ✅ | Copy softened / consent gated |
| P2-9 | Payout reconciliation gaps | ✅ | Claim + live Stripe re-check |
| P2-10 | No paused-affiliate recovery | ✅ | Reactivate path + email |
| P2-11 | No agent-pipeline monitoring | ✅ | Sentry across cron catches |
| P2-12 | Env-var missing behavior split | ✅ | lib/env requireEnv() — one fail-loud path |
| P2-13 | 14-day refund window unenforced | ✅ | Age check on refund path |
| P2-14 | Free archetype-map delivery vs promise | ✅ | Asset reconciled to copy |
| P2-15 | Weekly-nudge opt-in never acted | ✅ | Falls out of retention schedule |
| P2-16 | Net-vs-gross + minimum copy | ✅ | Sourced from commission constants |

### Phase 3

| ID | Finding | Status | Note |
|---|---|---|---|
| P3-1 | Dead inline-LLM Server Actions | ✅ | Orphaned actions deleted |
| P3-2 | Dead lib exports | ✅ | Removed |
| P3-3 | Phantom `lesson_nudge_last_id` | ✅ | Dropped |
| P3-4 | Review-nudge real name | ✅ | `customer_name` selected |
| P3-5 | Migration hygiene | ✅ | State-tracking + stale bundle removed |
| P3-6 | Channel motion undocumented | ✅ | Documented as unsupported |
| P3-7 | `affiliates` self-update RLS loose | ✅ | `WITH CHECK` column-restricted |
| P3-8 | Env-var edge cases | ✅ | Salt + `SCRIBE_MIN_VOICE_FIT` guarded |
| P3-9 | `click_id` written never read | ✅ | Validated (superseded by R3-AF-4) |
| P3-10 | `verdict` field rename | ✅ | Keep — Redline book-review motif + mascot pose (founder agreed 2026-06-29) |
| P3-11 | `design-canon/**` mirrors live | ✅ | Do-not-edit banner; scanners already exclude |

### Security

| ID | Finding | Status | Note |
|---|---|---|---|
| SEC-1 | Trace `aesdr_bypass` minting | ✅ | No unauth setter; founder-only |
| SEC-2 | `mintAction`/`revokeAction` no admin check | ✅ | `requireAdmin()` added |
| SEC-3 | `/x/track` unauth service-role write | ✅ | Origin + rate-limit + schema |
| SEC-4 | `/x/*` bypasses gates on prod | ✅ | Gated + comment corrected |
| SEC-5 | `COMING_SOON` fails open; bypass committed | ✅ | Fail-loud + code scrubbed |

### Round 3

| ID | Finding | Status | Note |
|---|---|---|---|
| R3-AUTH-3 | `/team` unreachable for owners | ✅ | Added to proxy allowlist |
| R3-AUTH-4 | Password change not recovery-gated | ✅ | Current-password re-auth before change |
| R3-AUTH-5 | No account deletion/export | ✅ | Export + delete account at /account/data |
| R3-AUTH-6 | Welcome bypasses password overlay | ✅ | Overlay enforced |
| R3-AUTH-7 | PasswordOverlay retired palette | ✅ | Uses `var(--iris)` |
| R3-AUTH-8 | Signup success copy lies | ✅ | Copy corrected |
| R3-AUTH-9 | Team owner forced role gate | ✅ | Owners skip SDR/AE gate |
| R3-EMAIL-3 | One-click + mailto invalid | ✅ | HTTPS one-click unsubscribe |
| R3-EMAIL-4 | Retired rainbow bar in emails | ✅ | Solid crimson bar |
| R3-EMAIL-5 | `sendReviewNudge` hardcodes 'there' | ✅ | `customer_name` selected |
| R3-EMAIL-6 | Dropoff shows "Lesson 3" not title | ✅ | Resolved from LESSONS |
| R3-EMAIL-7 | `mascotRow` images `alt=""` | ✅ | Alt text added |
| R3-EMAIL-8 | Refund-window copy contradiction | ✅ | Firm 14 days reconciled |
| R3-AF-2 | Activation no `user_id`/claims | ✅ | Provisioned at activation |
| R3-AF-3 | No self-referral protection | ✅ | `self_referral` flag + exclude |
| R3-AF-4 | Attribution spoofable, window unenforced | ✅ | Click/window validated |
| R3-AF-5 | Cleared-unpayable accrues forever | ✅ | Forfeiture window + reminders |
| R3-AF-6 | Stale payout-status cache | ✅ | Live `retrieveAccount` before pay |
| R3-AF-7 | `transfers` capability unchecked | ✅ | Capability gate added |
| R3-AF-8 | Unvalidated channel + raw `draft_url` | ✅ | URL/scheme validated |
| R3-AF-9 | `markPayoutPaid`/batch double-settle | ✅ | Mutual-exclusion on states |
| R3-AF-10 | `/x/track` auto-registers slugs | ✅ | Reject unknown + rate-limit |
| R3-AF-11 | Ops login non-constant-time | ✅ | `timingSafeEqual` |
| R3-AF-12 | Inactive links mislabeled "Refunded" | ✅ | Label fixed |
| R3-AG-1 | Courier double-sends on crash | ✅ | Claim-before-send (lever off) |
| R3-AG-2 | `verifyCronAuth` 500s not 401 | ✅ | Compare on byteLength |
| R3-AG-3 | Scout has no lever gate | ✅ | Added to gated set |
| R3-AG-4 | `after()` run stuck `running` | ✅ | Stale-run reaper |
| R3-AG-5 | Prompt-injection into outreach | ✅ | Never auto-promote; suggested |
| R3-AG-6 | Model-404 swallowed, retry loop | ✅ | Inspect error, surface model |
| R3-AG-8 | Followup advances on missing table | ✅ | Fail-closed on query error |
| R3-AG-9 | Contact-finder re-bills on timeout | ✅ | Mark-checked at enqueue |
| R3-AG-10 | Sentinel cursor skips unprocessed | ✅ | Advance only past written |
| R3-AG-11 | Single-call engine brace-parse bug | ✅ | Moot (dead engine deleted) |
| R3-AG-12 | drip/dropoff/review double-send dupes | ✅ | Dedupe by email/user_id |
| R3-AG-13 | usher T-1h fires past-due | ✅ | Window tightened |
| R3-DATA-1 | `testimonials` leaks emails to anon | ✅ | Column-safe view/admin-client |
| R3-DATA-2 | `course_completed` idempotency defeated | ✅ | Service-role events read |
| R3-DATA-3 | Purchase delete cascades ledger | ✅ | Restrict/set-null |
| R3-DATA-4 | `affiliate_metrics` view bypasses RLS | ✅ | `security_invoker=true` |
| R3-DATA-5 | Progress unique constraint bare ALTER | ✅ | Folded into CREATE TABLE |
| R3-CURR-1 | Tools completion-gate bypassable | ✅ | Full per-lesson gate map |
| R3-CURR-2 | Completion falsely claimable | ✅ | `{1..12}` validation |
| R3-CURR-3 | Preview promises wrong asset | ✅ | Relabeled Course 4 |
| R3-CURR-4 | Enterprise names wrong course | ✅ | Corrected to Course 3 |
| R3-CURR-5 | Course titles disagree | ✅ | Sourced from dashboard LESSONS |
| R3-CURR-6 | `merge_lesson_progress` clobbers screen | ✅ | `GREATEST` on last_screen |
| R3-ENT-1 | Workshop replay undeliverable | ✅ | Per-registrant from registrants |
| R3-ENT-2 | Reminders reference missing invite | ✅ | `.ics`/join_url generated |
| R3-ENT-3 | Enterprise CTA attribution dead | ✅ | Real slugs in VALID_SOURCES |
| R3-ENT-4 | "Five-dimension" vs 8 diagnostic | ✅ | Corrected to 8 |
| R3-ENT-5 | "32 prompts"; respondent sees 24 | ✅ | Copy corrected |
| R3-ENT-6 | Success page hardcodes iris | ✅ | Uses `var(--iris)` |
| R3-AD-1 | Two buttons fire payout batch | ✅ | Atomic claim covers all paths |
| R3-AD-2 | `RefundButton` swallows failure | ✅ | Error state added |
| R3-AD-3 | "Waiting on you" counts disabled | ✅ | Filtered on enabled Stripe |
| R3-AD-4 | `markManualSent` swallows audit error | ✅ | Throws on non-23505 |
| R3-SEC-3 | Contact-path injection routes sends | ✅ | Validated before send |
| R3-SEC-4 | Markdown `javascript:` href XSS | ✅ | Href escaped + scheme-checked |
| R3-SEC-5 | Open redirect via `//host` | ✅ | `!startsWith("//")` guard |
| R3-SEC-6 | Team invite not email-bound | ✅ | Token bound to invited email |
| R3-SEC-7 | Rate-limit gaps | ✅ | Limiter on apply/stripe routes |
| R3-INFRA-1 | `CRON_SECRET` undocumented | ✅ | Added to `.env.local.example` |
| R3-INFRA-2 | Pre-launch index leak on magnet | ✅ | Gated on launch mode |
| R3-INFRA-3 | `EMAIL_FINDER_API_KEY` undocumented | ✅ | Documented |
| R3-INFRA-4 | 8 more env vars undocumented | ✅ | Documented |
| R3-INFRA-5 | `ANTHROPIC_API_KEY` never read | ✅ | Resolved — it is read (no-op) |
| R3-INFRA-6 | sitemap/robots allow-list drift | ✅ | Lists aligned |
| R3-INFRA-7 | `IP_HASH_SALT` committed default | ✅ | No-fallback HMAC; null if unset |
| R3-FE-1 | Mobile gate walls funnel | ✅ | Coursework-only deny-list |
| R3-FE-2 | Retired palette as live surfaces | ✅ | Active-palette swaps |
| R3-FE-3 | `--light` text invisible | ✅ | Contrast fixed |
| R3-FE-4 | Ops password field no label | ✅ | Accessible label added |
| R3-FE-5 | DirectorPlan not keyboard-operable | ✅ | `onKeyDown` handlers |
| R3-FE-6 | `admin/design` names retired hex | ✅ | Allowlisted for canon-CI |
| R3-FE-7 | ~10 unlabeled form controls | ✅ | `aria-label` per control |
| R3-CI-1 | CI runs no tests | ✅ | vitest unit tests in CI |
| R3-CI-2 | e2e is screenshot script | ✅ | Auth-free specs added |
| R3-CI-3 | Canon enforcement non-blocking | ✅ | R-G4 hard-bans escalated |
| R3-CI-4 | Money/auth zero coverage | ✅ | Pure-function tests added |
| R3-CI-5 | `tsc` before build skips route types | ✅ | Steps reordered |
| R3-CI-6 | Spec asserts wrong status | ✅ | Expectation corrected |
| R3-CI-7 | Deps caret-ranged | ✅ | Runtime deps pinned |

### Round 4

| ID | Finding | Status | Note |
|---|---|---|---|
| R4-MON-1 | Gross vs "30% of net" contract | ✅ | One computeCommission (net) |
| R4-MON-2 | `commission_pct` dead column | ✅ | Webhook reads the column |
| R4-MON-3 | Team sales wrongly attributed | ✅ | `tier !== 'team'` guard |
| R4-MON-4 | Partial refunds revoke 100% | ✅ | Pro-rata clawback (full+partial), unit-tested, idempotent |
| R4-MON-5 | Commission on gross + fee absorbed | ✅ | Base net of Stripe fee |
| R4-MON-6 | No currency validation | ✅ | USD asserted, else skip+alert |
| R4-MON-7 | Sales tax / VAT never collected | ✅ | automatic_tax wired; Stripe Tax enabled (founder) |
| R4-MON-8 | Per-row rounding won't reconcile | ✅ | Round at payout + join table |
| R4-MON-9 | $40 unlock no refund handling | ✅ | Unlock refund handled |
| R4-SM-1 | No `partner_workshop` creation | ✅ | Admin create-workshop action |
| R4-SM-2 | Dispute won → locked out forever | ✅ | `dispute.closed` restores access |
| R4-SM-3 | Team buyer stranded, no retry | ✅ | Returns 500 (same as P0-13) |
| R4-SM-4 | Application status never advances | ✅ | Status advanced on promote |
| R4-SM-5 | Followup blind to manual contacts | ✅ | Fail-closed on no-email |
| R4-TZ-1 | 1h abandonment hits ~1/24 | ✅ | Hourly schedule (off for cost) |
| R4-TZ-2 | Workshop reminders UTC vs tz | ✅ | Affiliate tz formatting |
| R4-TZ-3 | Almanac "7am ET" drifts with DST | ✅ | In-handler ET-hour gate |
| R4-DR-2 | Purchase-upsert failure continues | ✅ | Returns 500 before side-effects |
| R4-DR-3 | Team only on `isNewPurchase` | ✅ | Guard removed |
| R4-DR-4 | `max_seats:10` hardcode | ✅ | Named constant SKU |
| R4-DR-5 | `account.updated` endpoint/mask | ✅ | Unknown shapes handled |
| R4-DR-6 | `firstName` double-escaped | ✅ | Single escape |
| R4-DR-7 | `name==='there'` sentinel | ✅ | Disambiguated |
| R4-DR-8 | `'ae'` mislabeled "Individual" | ✅ | Receipt label fixed |
| R4-DR-9 | `htmlToText` drops nested-tag URLs | ✅ | URL preserved |
| R4-DR-10 | Receipt/member no. non-reproducible | ✅ | Stable + NaN-guarded |
| R4-DR-11 | `safeSend` false not throw | ✅ | Send failure surfaced |
| R4-DR-12 | `weeklyFraming` divide-by-total | ✅ | Zero-lesson guarded |
| R4-LEG-1 | 40% vs "30% net" contract | ✅ | Honors contract; calculator fixed |
| R4-LEG-2 | Trackers fire EU/UK no consent | ✅ | Consent banner; analytics opt-in for all |
| R4-LEG-3 | Policy promises erasure, no DSAR | ✅ | Copy aligned to capability |
| R4-LEG-4 | No FTC earnings substantiation | ✅ | /about stats cited to 2024 Bridge Group SDR report; verify the 51% AE-quota attribution |
| R4-LEG-5 | FTC disclosure not enforced | ✅ | FTC disclosure hard-blocks copy submission |
| R4-LEG-6 | ToS no governing-law/arbitration | ✅ | Delaware* + AAA arbitration + class waiver |
| R4-LEG-7 | Scraped-PII no GDPR Art.14 basis | ✅ | Legitimate-interest basis + retention purge built |
| R4-PERF-1 | Scout sweep no token cap | ✅ | $10/run ceiling |
| R4-PERF-2 | dossier-enrich uncapped | ✅ | $10/run ceiling |
| R4-PERF-3 | Lean caps in dead module | ✅ | Caps moved to live engines |
| R4-PERF-4 | Admin reads all rows in JS | ✅ | SQL aggregate/RPC |
| R4-PERF-5 | Retention N+1 reads, no index | ✅ | Batched + indexed |
| R4-PERF-6 | Hot crons no composite index | ✅ | Covering index added |
| R4-PERF-7 | Email crons no 429 retry | ✅ | Throttle + retry |
| R4-PERF-8 | Lesson read from disk each request | ✅ | Cached |
| R4-PERF-9 | Oversized raw PNG/mascot assets | ✅ | `next/image` + formats |
| R4-PERF-10 | `prospect_events` unbounded + count | ✅ | Indexed |
| R4-PERF-11 | Admin pulls whole clicks table | ✅ | Aggregate in SQL |
| R4-PERF-12 | `events` log no TTL | ✅ | Indefinite (founder decision) |
| R4-PERF-13 | Stale model re-issues emit | ✅ | Error inspected |
| R4-PERF-14 | maxDuration vs batch overrun | ✅ | Sized / resumable |
| R4-PERF-15 | HTML built twice per send | ✅ | Single build |
| R4-PERF-16 | `tools` force-dynamic + uncached read | ✅ | Static + cached |
| R4-LH-1 | Cross-device restore loses progress | ✅ | `?screen` resume honored |
| R4-LH-2 | Quiz score never reaches extractor | ✅ | Shape aligned |
| R4-LH-3 | Bad `?role` stacks both variants | ✅ | Normalized/whitelisted |
| R4-LH-4 | Role-fork keys leak across forks | ✅ | `role` in storage key |
| R4-LH-5 | `aesdr:restore` clobbers textarea | ✅ | Ready-handshake |
| R4-LH-6 | restore overwrites `_lessonExtra` | ✅ | Merge not clobber |
| R4-LH-7 | Resume on completion no re-fire | ✅ | Re-fires `aesdr:complete` |
| R4-LH-8 | lesson-01 u1 divergent shape | ✅ | Unit-1 emits standard `quizScore`; extractor reads it |
| R4-LH-9 | Lessons use retired fonts/palette | ✅ | Re-skinned to active brand |

### Round 5

| ID | Finding | Status | Note |
|---|---|---|---|
| R5-OB-1 | Three password routes + splash | ✅ | Collapsed to one route |
| R5-OB-2 | "No checklist" promise vs 3 gates | ✅ | Copy softened |
| R5-OB-3 | No "step N of M" in setup | ✅ | Step indicator added |
| R5-OB-4 | Login ignores `?email=` | ✅ | Email prefilled |
| R5-OB-5 | Empty dashboard no orientation | ✅ | First-run orientation |
| R5-OB-6 | Save & Exit no synchronous save | ✅ | Sync save + "Saved" |
| R5-DV-1 | One root sending domain | ✅ | No split now (founder decision) |
| R5-DV-2 | No Resend bounce webhook | ✅ | `/api/webhooks/resend` svix-verified → suppressions |
| R5-DV-3 | Replies depend on human triage | ✅ | Suppression path built |
| R5-DV-4 | Bulk to unconfirmed addresses | ✅ | Suppress bounced |
| R5-DV-5 | No List-Id/Precedence on bulk | ✅ | Bulk headers added |
| R5-DV-6 | SPF/DKIM/DMARC root mixing | ✅ | DMARC published + quarantine/reject enforced; BIMI optional |
| R5-DV-7 | BIMI logo not in inboxes | 👤 | **Deferred** — a later branding upgrade (DMARC already enforcing); guide: `docs/2026-06-29-bimi-setup.md` |
| R5-IC-1 | No `allow_promotion_codes` | ✅ | Enabled on sdr/ae |
| R5-IC-2 | Stripe pins no `apiVersion` | ✅ | Pinned via central client |
| R5-IC-3 | No reusable Stripe Customer | ✅ | `customer_creation:'always'` |
| R5-IC-4 | `email_confirm:true` auto-verifies | ✅ | Accept asserted-by-payment |
| R5-IC-5 | Temp-password biased/no expiry | ✅ | Strong + one-time + short-lived |
| R5-IC-6 | Callback allowlist omits routes | ✅ | `/welcome`/`/affiliates` added |
| R5-IC-7 | Resend sends no idempotencyKey | ✅ | Per-send key + tags |
| R5-IC-8 | Anthropic no timeout/maxRetries | ✅ | Set against route ceiling |
| R5-IC-9 | Deprecated `claude-opus-4-1` listed | ✅ | Dropped from SUPPORTED_MODELS |
| R5-IC-10 | `listUsers(50)` fails past 50 | ✅ | getUserByEmail/paginate |
| R5-NM-1 | Kit constants say "partners" | ✅ | Renamed to affiliates |
| R5-NM-2 | "partner hub" in HubChrome | ✅ | Renamed |
| R5-NM-3 | EconomicsCalculator "partners" | ✅ | Renamed |
| R5-NM-4 | UTM source `partners-page` | ✅ | Renamed `affiliates-page` |
| R5-NM-5 | Bare "Partner" on enterprise | ✅ | "channel" prefix added |
| R5-EE-1 | $40 tile swallows failed checkout | ✅ | Error state added |
| R5-EE-2 | Reveal CTA swallows 500 | ✅ | `role=alert` error shown |
| R5-EE-3 | No error boundary under admin | ✅ | `app/admin/error.tsx` |
| R5-EE-4 | Pay-out button no confirm/pending | ✅ | Guarded (with P0-1) |
| R5-EE-5 | Submissions empty-state on DB error | ✅ | Distinguishes error |
| R5-EE-6 | Tower "All clear" over failure | ✅ | Surfaces sub-panel failures |
| R5-EE-7 | Admin shows fabricated $0 | ✅ | Distinguishes failed query |
| R5-EE-8 | No `loading.tsx` for tower | ✅ | Loading states added |
| R5-EE-9 | Stripe refresh strands on stale | ✅ | Feedback on refresh |
| R5-EE-10 | Calculator shows fractional sales | ✅ | "~1 every N months" |
| R5-EE-11 | `ReviewActions` no confirmation | ✅ | Success state added |
| R5-EE-12 | Admin zero-data/`$NaN`/null-key gaps | ✅ | Empty/NaN guards |
| R5-CN-1 | "operating system" on 3 surfaces | ✅ | Replaced; in enforcer now |
| R5-CN-2 | "takeaway artifacts" in 4 emails | ✅ | → "substantial assets" |
| R5-CN-3 | "leverage" ×3 | ✅ | Replaced |
| R5-CN-4 | R-G7 "isn't X — it's Y" ×6 | ✅ | Rewritten |
| R5-CN-5 | "deep dive" ×4 | ✅ | Replaced |
| R5-CN-6 | British "recognise" on /about | ✅ | Americanized |
| R5-PI-1 | Deal free-text to PostHog | ✅ | Not sent as props |
| R5-PI-2 | Session replay unmasked | ✅ | maskAll inputs/text + media |
| R5-PI-3 | Buyer name to Anthropic | ✅ | Name dropped from prompt |
| R5-PI-4 | Scraped PII chained, persisted | ✅ | Retention purge (90d/30d) live; clicks low-PII left as-is |
| R5-PI-5 | Full error objects logged | ✅ | Log `.message` only |
| R5-PI-6 | Raw email in console label | ✅ | Removed |
| R5-PI-7 | PostHog captures full URL | ✅ | Slug/params scrubbed |
| R5-PI-8 | `ip_hash` three no-salt sites | ✅ | One HMAC helper |
| R5-PI-9 | No retention/TTL anywhere | ✅ | Policy set; partner_pipeline purge built (others keep-by-decision) |
| R5-PI-10 | Over-collection UA/referrer | ✅ | Trimmed to triage need |

### Adversarial review

| ID | Finding | Status | Note |
|---|---|---|---|
| §1 | Duplicate clawbacks on re-delivery | ✅ | Unique index + idempotent upsert |
| §2 | Gross-vs-net reporting | ✅ | `net_paid_cents` |
| §3 | Clawback concurrency + error checks | ✅ | Serialized (3a) + checks (3b) |
| §4 | Null/`full` netting edge | ✅ | Extracted + unit-tested |
| §5 | Dropped-final-refund | ✅ | Idempotent reconcile cron replays dropped refunds |
| §6 | Fee-currency guard | ✅ | Guarded |
| §7 | `listUsers(200)` scale ceiling | ✅ | Paginated `findUserIdByEmail` (both call sites) |
| §8 | Self-referral gmail-alias bypass | ✅ | Inbox-normalized compare (dots/+alias), unit-tested |
| §9 | Refund racing mid-payout attribution | ✅ | `processing` attributions clawed back too |
| §10 | Refund matches first session per PI | ✅ | Matches the session that has a purchase across the PI |
| §11 | `markPayoutPaid` doesn't net clawbacks | ✅ | Nets clawbacks when `net_paid_cents` unset |
| §12 | Dropped `isNewPurchase` lost attribution | ✅ | Gate removed |
| §13 | `attribution_window_closes_at` unused | ✅ | 30-day window enforced at credit time |
| §14 | `resolveCommissionRate` sub-1% ambiguity | ✅ | Rejects ≤1% / ≥100% resolved rate |
