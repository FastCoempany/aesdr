# AESDR — Session State (2026-05-11, part 3)

> Handoff for any Claude session picking up the landing-page conversion-test
> work. **Read this first**, then `SESSION_STATE.md` at repo root for the
> full design + copy lockdown.

**Last updated:** 2026-05-11
**Canonical work branch:** `claude/resume-session-2UyBs`
**HEAD on GitHub:** `570dd0a` — "Avoid setState-in-effect lint by using prev-state guard in useRole"
**DO NOT** use sandbox-suffixed branches like `claude/resume-session-2UyBs-hO9JK` — those are per-session forks and are stale relative to GitHub. Always read from `refs/heads/claude/resume-session-2UyBs`.

---

## Where the work is in the plan

Sections **A through H** of the editorial role-fork conversion test are all
shipped to `claude/resume-session-2UyBs`. Sections defined in `SESSION_STATE.md`
at repo root. Recap:

| Section | Status | Commit |
|---|---|---|
| A — PostHog wired | ✅ shipped | `abc245b` |
| B — `lib/role.ts` | ✅ shipped | `725a115` (B+D bundled) |
| C — LandingSequence rewrite into 5 modules | ✅ shipped | `cabb755`, `ac59e81`, `55abb9c`, `38b3952`, `945b6cc` |
| D — CSS for editorial split / skip / hero descriptor | ✅ shipped | (bundled with B) |
| E — `EditorialMasthead` mounted in `app/page.tsx` | ✅ shipped | `91ab565` |
| F — `PricingTiers` with role-aware pre-highlight | ✅ shipped (with H) | `df9f58e` |
| G — Signup auto-promotes role to `user_metadata` | ✅ shipped | `696af91` |
| H — Server reads `user_metadata.role`, passes `initialRole` | ✅ shipped (with F) | `df9f58e` |
| (lint fix to `useRole`) | ✅ shipped | `570dd0a` |

---

## What's in flight RIGHT NOW (mid-QA, bugs found)

User is running the manual QA checklist locally on Windows
(`C:\Users\tanya\aesdr`). Build passes, `npm run dev` boots, but **the landing
animation has visible bugs** that need fixing before the QA can complete.

### Pre-QA blockers resolved this session

1. **Supabase env vars not loading.** `proxy.ts` needs `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` from `.env.local`. They were present in the file, parsed fine via `node -e + dotenv`, but Next/Turbopack was misrouting the workspace root because of an orphan lockfile at `C:\Users\tanya\package-lock.json` (legit project up there, can't delete).

2. **Fix applied locally (NOT YET COMMITTED).** User added a `turbopack.root` block to `next.config.ts`:
   ```ts
   const nextConfig: NextConfig = {
     turbopack: {
       root: __dirname,
     },
     outputFileTracingIncludes: { /* unchanged */ },
     ...
   };
   ```
   This change exists on the user's local working tree but **has not been pushed**. It needs to land on `claude/resume-session-2UyBs` so deployments + future clones don't trip on the same issue. **Action item for next session:** verify the user's local change matches the above, then commit + push it.

### Bugs found in QA Test A (skip-immediately path)

Diagnosed from the source at HEAD `570dd0a`. Three distinct issues:

#### Bug 1 — Skip doesn't tear down animator state

`animator.ts → onSkipClick` calls `unlockScroll(role)` but **never sets `paused = true` or calls `clearTimers()`**. Pending `schedule()`d typing timers keep firing after fade. They check `if (paused) return;` but `paused` is only flipped in the React-effect cleanup, not on user-initiated skip. Result: typing characters keep appending to `refs.typingArea`, lines keep dissolving — visible as "typing residue" smudge at bottom-left of the screen post-skip.

Same problem on the **Escape** key branch of `onAdvanceKey` (a few lines above `onSkipClick`).

#### Bug 2 — `attachZoomScroll()` runs `update()` synchronously inside `unlockScroll`, racing the hero fade-in

`unlockScroll` schedules a hero fade-in via `setTimeout(..., 600)`. Then it calls `attachZoomScroll()` immediately, which runs `update()` at the bottom. That `update()`:

- Force-sets `hero.style.opacity = "1"` (cancels the planned fade)
- Force-sets `viewport.style.opacity = "0"` and `sideMarker.style.opacity = "0"`
- Then early-returns *before* the dot-update loop

Combined with `.markerDot { background: rgba(0,0,0,0.12) }` (visible default), there's a brief frame where dots flash visible before opacity:0 kicks in. User reports "all dots filled in but page is standing still" — that flash plus the inline-style-vs-class fight.

#### Bug 3 — `EditorialMasthead` overlaps nav `AesdrBrand`

`EditorialMasthead` is `position: fixed; top: 18px; left: 22px`. `<header className={styles.nav}>` in `app/page.tsx` mounts `<AesdrBrand>` at top-left of normal flow. They overlap visually. Top-left of every page now shows "AESDR — SALES SURVIVAL COURSE ..." stacked on top of the iris-shimmer "AESDR" wordmark. Needs either:

- Move EditorialMasthead so it doesn't overlap (e.g. shift right past nav brand, or position it in the nav itself), or
- Hide nav brand when EditorialMasthead is present, or
- Redesign nav so the masthead replaces the brand.

User has not given direction on this yet — surface as a question, don't unilaterally restructure the nav.

### Possible Bug 4 — Original "blur into next + blinking fast" zoom-card glitch

This is what kicked off the QA bug hunt. User scrolled into zoom cards (pre-skip), saw cards blur into each other and a "stuck blinking" state. Console had no JS errors. After a `Remove-Item -Recurse -Force .next` + restart, may have been Turbopack-cache fallout (we'd seen the warning *"Turbopack's filesystem cache has been deleted because we previously detected an internal error"*).

**Not yet retested after the Bug 1 fix.** Once the skip cleanup lands, re-run the no-skip path (let animation play through, scroll into zoom). If glitch persists, suspect: `update()` not RAF-wrapped, card scale math discontinuity at boundaries (look at `cardFrac` transitions around 0.12 / 0.78), or stale ref from StrictMode double-mount.

---

## Pending code changes (not yet applied)

### 1. `animator.ts` — skip cleanup (priority 1, will fix Bugs 1 visible artifacts)

File: `components/landing-sequence/animator.ts`

**Find `onSkipClick`:**
```ts
function onSkipClick() {
  opts.onSkip();
  unlockScroll(role);
}
```

**Replace with:**
```ts
function onSkipClick() {
  opts.onSkip();
  paused = true;
  clearTimers();
  advance = null;
  if (refs.typingArea) refs.typingArea.innerHTML = "";
  if (refs.termBody) refs.termBody.innerHTML = "";
  paused = false;
  unlockScroll(role);
}
```

**Also replace the Escape branch inside `onAdvanceKey`:**
```ts
if (e.key === "Escape") {
  opts.onSkip();
  unlockScroll(role);
}
```
**becomes:**
```ts
if (e.key === "Escape") {
  opts.onSkip();
  paused = true;
  clearTimers();
  advance = null;
  if (refs.typingArea) refs.typingArea.innerHTML = "";
  if (refs.termBody) refs.termBody.innerHTML = "";
  paused = false;
  unlockScroll(role);
}
```

(Refactor into a `cleanAndSkip()` helper after confirming the behavior fix — don't DRY before correctness.)

### 2. `next.config.ts` — `turbopack.root` (already on user's local disk, NOT pushed)

```ts
const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  // ...rest unchanged
};
```

Status: applied locally by user 2026-05-11, not committed. Should be a small standalone commit.

### 3. Masthead overlap fix (Bug 3) — DESIGN DECISION NEEDED

Don't fix without user direction. Three viable options, pick one with them:
- Move EditorialMasthead to top-center, or shift right of the nav brand
- Suppress nav `AesdrBrand` when LandingSequence is mounted (i.e. on `/`)
- Redesign nav: masthead replaces brand entirely, sign-in/get-access stay right-aligned

---

## Known follow-ups (lower priority — defer until QA passes)

From `SESSION_STATE.md`:

1. `landing_fork_skipped { reason: 'member-prefill' }` is defined in the PostHog EventMap but the animator only fires `opts.onSkip()` from the explicit skip button + Escape key, NOT from the member-prefill boot path. Either wire it into the boot path or drop the `member-prefill` reason. Currently a documented inconsistency.

2. `app/signup/page.tsx` lines ~46–200 still use retired dark palette tokens (`--bg-main`, `--text-main`, `--theme`, etc.). Out of scope for B–H but jarring next to the new editorial flow. Rebuild against editorial tokens (`--cream`, `--ink`, `--crimson`, `--muted`, `--light`, `--iris`) per `AGENTS.md`.

3. Retired tokens still live in `app/globals.css` for legacy course HTML compat. Audit + prune once all new code references are clean.

---

## Manual QA checklist (from previous handoff — repeated here for ref)

Run after applying the `animator.ts` skip-cleanup fix:

1. **Anonymous SDR path** — fresh tab, opener types, fork appears, click SDR side (cream), branched SDR scenes, SDR terminal, hero with SDR descriptor, scroll → SDR pricing card has iris border + "Your tier" badge.
2. **Anonymous AE path** — same but click AE (crimson) side. Verify AE descriptor + AE pricing highlight.
3. **Skip button** — click `skip animation →` mid-animation. Should jump cleanly to hero with default descriptor, no typing residue, no premature dots, no broken zoom. Pricing: no highlights.
4. **Click-to-advance** — Space/Enter/click outside fork halves fast-forwards current line.
5. **Member prefill** — sign up after picking SDR; reload `/`. Opener + fork skipped, SDR branched scenes type immediately, SDR pricing pre-highlight on first paint.

DevTools verifications during each:
- `sessionStorage.getItem('aesdr_role')` should match picked role
- Network filter `posthog` → `landing_role_pick { role, source: 'editorial-fork' }` fires on pick
- Supabase dashboard → `auth.users.raw_user_meta_data` contains `{ role: '<picked>' }` after signup

---

## Files of record (read before editing visuals)

Mandatory pre-work for any visual change:
- `AGENTS.md` — brand palette directive (editorial tokens only; dark palette retired)
- `app/globals.css` — token definitions
- `components/LandingSequence.module.css` — editorial palette in production
- `variants/variant-a-editorial-split.html` — canonical editorial split layout

---

## Pre-flight for next session

1. Verify branch + HEAD on GitHub matches what's at the top of this file. If user says they're working on a sandbox-suffix branch, that's a *fork* — read context from `refs/heads/claude/resume-session-2UyBs` instead.
2. Read `SESSION_STATE.md` at repo root for locked design + copy. Do NOT relitigate.
3. Read this file's "Pending code changes" — Bug 1 fix is highest priority; will likely unblock Tests A/B/C of the manual QA.
4. Check whether `next.config.ts` on the branch contains the `turbopack.root` block. If not, commit the user's local change (you'll need to ask them to paste their current `next.config.ts` since their local copy is the source of truth for that edit).
5. Surface Bug 3 (masthead overlap) as a design-decision question — do not unilaterally restructure the nav.
