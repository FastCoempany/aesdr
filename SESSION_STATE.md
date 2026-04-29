# AESDR — Session State

> Working brief for context recovery if a session corrupts or compacts. Update this file at the end of any session that moves the conversion-test work forward.

**Last updated:** 2026-04-29
**Branch:** `claude/resume-session-2UyBs`
**HEAD:** `696af91 — Auto-promote anonymous role to user_metadata on signup (G)`

---

## Product

AESDR is a sales survival course for early-career AEs & SDRs. 12 lessons, lifetime access. Pricing: $249 SDR / $299 AE / $1,499 Team (up to 10 seats). Built on Next.js 16 / React 19 / Supabase / Stripe.

## Brand — non-negotiable

Editorial palette only: `--cream` `--ink` `--crimson` `--muted` `--light` `--iris`. Dark palette retired and codified in [AGENTS.md](./AGENTS.md). Fonts via tokens only: `--display` (Playfair), `--serif` (Source Serif 4), `--cond` (Barlow Condensed), `--mono` (Space Mono), `--hand` (Caveat).

Ground-truth references for any visual work:
- `app/globals.css` — tokens
- `components/LandingSequence.module.css` — editorial palette in production
- `variants/variant-a-editorial-split.html` — canonical editorial split layout

---

## Current focus — landing-page conversion test

**Goal:** lift blended CR from ~2% toward 4%+ by fixing the highest-impact weaknesses on the landing scorecard.

**Strategy:** ship Mockup C ("Editorial Split Identity Gate") as a role-fork moment between scenes 1 and 2 of the confession animation. Visitor self-segments AE vs SDR, branched scenes + terminal lines play to their role, picked role threads through to pricing as a "Your tier" pre-highlight.

### Locked design decisions

- **Anonymous role:** `sessionStorage` (lenient — survives F5/back, resets on tab close)
- **Member role:** `user_metadata.role` server-side, skip the fork
- **Click-to-advance** across all typed phases; visible "skip animation →" mono-link bottom-right
- **Editorial masthead** top-left from t=0: "AESDR — Sales Survival Course · for early-career AEs & SDRs"
- **Role-aware hero descriptor:**
  - default: *"The 12-lesson sales survival course they never gave you."*
  - SDR: *"The 12-lesson playbook for SDRs who want out alive."*
  - AE: *"The 12-lesson playbook for AEs who want their forecast to mean something."*
- **Tracking event:** `landing_role_pick { role, source: 'editorial-fork' }`
- **No DB migration** — single `user_metadata.role` is enough
- **Out of scope:** member role-switching with dual-track progress preservation (future paid SKU)

### Locked copy

**Mockup C split:**
- Cream-left = SDR. *"You book the meetings. You take the no's. You're the front line of every pipeline you'll never get credit for."* Mono label: `role · pre-quota · pre-promotion`
- Crimson-right = AE. *"You close the deals. You ride the forecast. You carry the number that nobody else wants their name attached to."* Mono label: `role · quota-carrying · pipeline-owning`

**Branched scenes (after fork):**

SDR:
1. *"You've been doing this for 9 months. They said 'AE in 12.' Nobody's mentioned it since."*
2. *"You set your alarm for 6am on Sunday to 'lock in' this week. By Tuesday you'd stopped pretending."*
3. *"You have a degree. From a university. With a campus. And your job is to get hung up on 97 times a day."*

AE:
1. *"Your pipeline says $740K. You'd bet your rent on maybe $180K of it."*
2. *"Sunday night. You're doing 'pipeline review.' That means staring at a spreadsheet and hoping something moves."*
3. *"Last quarter you missed by 31%. This quarter your number went up 30%. Nobody explained the math."*

**Terminal lines:**

SDR:
- `> scanning your daily activity...`
- `> found: 47 dials. 3 connects. 1 "send me an email." 0 meetings booked.`
- `> LinkedIn requests sent: 94. Accepted: 11. Replies: "thanks for reaching out!"`
- `> CRM notes: "VM" "VM" "VM" "gatekeeper" "VM" "wrong number" "VM"`
- `> diagnosis: I am a human spam filter with a quota and a dream.`

AE:
- `> scanning your pipeline...`
- `> found: 22 open opportunities. 17 in "discovery" for 45+ days.`
- `> forecast accuracy last quarter: 34%. what you told your VP: 85%.`
- `> deals marked "closing this month": 8. deals that will actually close: probably 2.`
- `> diagnosis: professional optimist with a commission plan.`

**Shared terminal payoff:**
- *"This course will change your life a few times throughout. Afterward, you'll never make the same money again."*
- whisper: *"Keep scrolling. It has to get worse before it gets better."*

---

## Shipped on this branch

| Commit | Description |
|---|---|
| `f1338f9` | Fork mockups (A buttons, B typewriter, C identity) at `public/mockups/` |
| `18ee7ce` | Dark palette retirement directive in `AGENTS.md` |
| `fffeaa4` | Mockups rebuilt against editorial tokens |
| `a78e805` | PostHog env vars in `.env.local.example` |
| `abc245b` | PostHog wired: `lib/analytics.ts`, `components/PostHogClient.tsx`, `pricing_cta_clicked` from `CheckoutButton`, `account_role_switched` from `RoleSwitcher` |
| `0f7f084` | This recovery brief (`SESSION_STATE.md`) |
| `725a115` | **B + D** — `lib/role.ts` (anonymous role single-source-of-truth) + `LandingSequence.module.css` styles for editorial split, skip link, hero descriptor |
| `cabb755` | **C/1** — `landing-sequence/copy.ts` (locked branched copy + hero descriptor + fork halves) |
| `ac59e81` | **C/2** — `landing-sequence/zoom-cards.ts` (existing zoom array, extracted) |
| `55abb9c` | **C/3** — `landing-sequence/typing.ts` (Seg/Char types + flattenSegs/buildHTML helpers) |
| `38b3952` | **C/4** — `landing-sequence/animator.ts` (imperative engine: phases, click-to-advance, skip, zoom-scroll) |
| `945b6cc` | **C/5** — `LandingSequence.tsx` rewritten as thin shell + EventMap aligned (`landing_role_pick`, `landing_fork_skipped`) |
| `91ab565` | **E** — `EditorialMasthead` nameplate, mounted top-left in `app/page.tsx` |
| `df9f58e` | **F + H** — `PricingTiers` extracted with role-aware pre-highlight; `initialRole` threaded from server through to `<LandingSequence>` and `<PricingTiers>` |
| `696af91` | **HEAD** — **G** — `app/signup/page.tsx` auto-promotes anonymous `getRole()` to `user_metadata.role` via `signUp.options.data` and clears sessionStorage on success |

### PostHog status

- Project: AESDR (separate from antaeus, US region)
- Env vars: `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com`
- Local: keys in `.env.local` (gitignored)
- Vercel: keys must be added to Production + Preview + Development for events to flow
- Code: `lib/analytics.ts` no-ops when key is unset, so prod is safe before vars are set

---

## Plan sections B–H — all shipped ✅

All eight sections (A through H) of the role-fork conversion test are on this branch. Test plan for next session:

### Manual QA checklist

1. **Anonymous SDR path** — fresh tab → opener types → fork appears → click SDR side → branched SDR scenes type → SDR terminal lines → hero with SDR descriptor → scroll to pricing → SDR card has "Your tier" badge + iris border.
2. **Anonymous AE path** — repeat with the AE side; verify AE descriptor + AE card highlight.
3. **Skip button** — click "skip animation →" at any phase → fade straight to hero with default descriptor → no role highlight on pricing.
4. **Click-to-advance** — anywhere in any typing phase, spacebar/click should fast-forward the current line.
5. **Member with prefill** — sign up as SDR, refresh landing → opener and fork are skipped → branched SDR scenes type immediately → SDR pricing pre-highlight on first paint (no flicker).
6. **Member fork-skip event** — verify PostHog receives `landing_fork_skipped { reason: 'member-prefill' }` for member loads (currently fires on `onSkip` only — confirm this is correct or split into a separate boot-time fire if not).
7. **Persistence semantics** — anonymous picks SDR → F5 → still SDR (sessionStorage). Close tab → reopen → no role (correct, lenient mode).
8. **Editorial masthead** — visible at top-left from t=0 through the entire animation, doesn't crowd nav at 640px wide.
9. **Sign-up promotion** — anonymous picks SDR → signs up → check Supabase `auth.users.raw_user_meta_data` for `role: "sdr"`.

### Known follow-ups / not-yet-tested

- `landing_fork_skipped { reason: 'member-prefill' }` may not actually fire today because the animator only calls `onSkip` from the explicit skip button + Escape key, not from the member-prefill boot path. Decide whether to fire it on member boot or remove the `member-prefill` reason.
- Build verification (`npm run lint`, `npm run build`) hasn't run in this sandbox (no node_modules). Run locally before merging to main.
- `RoleSwitcher` (account page) still uses `account_role_switched` event — out of scope but worth confirming it continues to fire after the EventMap changes.

### Cleanup tickets (separate, lower priority)

- `app/signup/page.tsx:46` and `app/account/select-role/page.tsx:50` still reference retired dark palette tokens (`--bg-main`, `--text-main`, `--theme`, `--coral`, `--line`, `--bg-panel`). Rebuild against editorial tokens.
- Retired tokens still live in `app/globals.css` for legacy course HTML compat. Once all references in new code are gone, audit and prune the truly dead ones.

---

## Open questions / decisions

None blocking. All resolved in prior sessions. Re-confirm with user only if attempting work that contradicts the locked design decisions above.

## Pre-flight before next session

1. Confirm branch + HEAD match what's documented above. If not, ask user before reconciling.
2. Read `AGENTS.md` for brand directives (mandatory before any visual work).
3. Read `LandingSequence.module.css` and `variants/variant-a-editorial-split.html` before touching visuals.
4. Re-read this file's "Locked design decisions" and "Locked copy" sections — those are not up for re-litigation without explicit user request.
