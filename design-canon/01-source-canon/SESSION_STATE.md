# AESDR — Session State

> Working brief for context recovery if a session corrupts or compacts. Update this file at the end of any session that moves the conversion-test work forward.

**Last updated:** 2026-04-28
**Branch:** `claude/resume-session-2UyBs`
**HEAD:** `abc245b — Wire PostHog into the role-fork conversion funnel`

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

## Shipped on this branch (5 commits ahead of main)

| Commit | Description |
|---|---|
| `f1338f9` | Fork mockups (A buttons, B typewriter, C identity) at `public/mockups/` |
| `18ee7ce` | Dark palette retirement directive in `AGENTS.md` |
| `fffeaa4` | Mockups rebuilt against editorial tokens |
| `a78e805` | PostHog env vars in `.env.local.example` |
| `abc245b` | **HEAD** — PostHog wired: `lib/analytics.ts`, `components/PostHogClient.tsx` mounted in `app/layout.tsx`, `pricing_cta_clicked` firing from `CheckoutButton`, `account_role_switched` from `RoleSwitcher` |

### PostHog status

- Project: AESDR (separate from antaeus, US region)
- Env vars: `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com`
- Local: keys in `.env.local` (gitignored)
- Vercel: keys must be added to Production + Preview + Development for events to flow
- Code: `lib/analytics.ts` no-ops when key is unset, so prod is safe before vars are set

---

## Still to build — plan sections B–H

- **B.** `lib/role.ts` — `getRole/setRole/clearRole/useRole` hook, sessionStorage key `aesdr_role`, dispatches `CustomEvent('aesdr-role-change')` for cross-component reactivity
- **C.** `LandingSequence.tsx` rewrite — branched `SCENES_*` / `TERM_LINES_*`, editorial split layer between scene 1 and post-fork scenes, click-to-advance, skip button, `initialRole?: 'ae' | 'sdr'` prop (skips fork when set), role-aware hero descriptor via `useRole()`
- **D.** `LandingSequence.module.css` — split layer styles (port Mockup C exactly: ghost numerals, corner brackets, iris vertical divider), `.skipLink`, `.heroDescriptor`
- **E.** `components/EditorialMasthead.tsx` — fixed top-left, mono 10px, "AESDR" in `--crimson` rest in `--muted`. Mount in `app/page.tsx` outside the animation tree
- **F.** `components/PricingTiers.tsx` — extract pricing block from `app/page.tsx:67-110`. Reads `useRole()` to apply `.priceCardPersonal` modifier + iris "Your tier" badge on matching card. Coexists with existing `.priceCardFeatured` (Team)
- **G.** `app/signup/page.tsx:22-26` — after `signUp` succeeds, read `getRole()` and pass via `options.data: { role }` so it lands on `user_metadata.role`. Clear sessionStorage on success
- **H.** `app/page.tsx` (server) — read Supabase user, extract `user_metadata.role`, pass to `<LandingSequence initialRole={role} />` so members skip the fork

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
