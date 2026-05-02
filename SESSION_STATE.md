# AESDR — Session State

> Working brief for context recovery if a session corrupts or compacts. Update this file at the end of any session that moves a workstream forward.

**Last updated:** 2026-05-02
**Active branch:** `affiliate-seeding`
**HEAD:** *(see `git log -1 --oneline affiliate-seeding`)*

---

## Two parallel workstreams

This repo carries two independent workstreams. Sessions should not blur them.

1. **Landing-page conversion test** (branch `claude/resume-session-2UyBs`, since merged to `main`) — the AE/SDR role-fork between scenes 1 and 2 of the confession animation, PostHog wired, mockups rebuilt against editorial tokens.
2. **Affiliate / partner ecosystem build** (branch `affiliate-seeding`) — the 40-deliverable partner kit + canon + brand-kit snapshots. **This is the active workstream as of 2026-05-02.**

The two workstreams share the canon (`AGENTS.md` + `AFFILIATE_BRAND_CANON.md`) but otherwise touch separate files.

---

## Brand — non-negotiable (both workstreams)

Editorial palette only: `--cream` `--ink` `--crimson` `--muted` `--light` `--iris`. Dark palette retired and codified in [AGENTS.md](./AGENTS.md). Fonts via tokens only: `--display` (Playfair), `--serif` (Source Serif 4), `--cond` (Barlow Condensed), `--mono` (Space Mono), `--hand` (Caveat).

Ground-truth references for any visual work:
- `app/globals.css` — tokens
- `components/LandingSequence.module.css` — editorial palette in production
- `variants/variant-a-editorial-split.html` — canonical editorial split layout
- `AFFILIATE_BRAND_CANON.md` — affiliate-ecosystem-specific canon (v1.1)

---

## Affiliate workstream — current state

**Source of truth for status:** `design-canon/09-affiliate-deliverables/00-INDEX.md` (shipped batch 7.5).

### Shipped to date

- **35 of 40 D-numbered deliverables** across batches 1–7.
- **9 sub-deliverables** — 8 kit-template files (`00-canon-excerpt`, `09a-d`, `10d`, `11`, `13`) + L&D-approver brief.
- **Canon v1.1** at root (`AFFILIATE_BRAND_CANON.md`).
- **Design-canon snapshot** at `design-canon/` (everything brand-bearing repo-wide).
- **Design-canon-seed** at `design-canon-seed/` (12-file Claude Design onboarding kit).

### Batch history

| Batch | Commit | What shipped |
|---|---|---|
| 1 | `0edcfcb` | D01–D05 (outreach + objection replies) |
| 2 | `2352328` | D19, D20, D21, D32, D33 (positioning + claims + disclosure + ops templates) |
| 2.5 | `7c6aead` | Canon v1.1 — custom-iconography doctrine + visual QA |
| 3 | `bfedd0b` | D06, D07, D08, D14, D34 (workshop page cluster + close-out notes) |
| 4 | `4788316` | D10, D11, D12, D13, D15, D16 (workshop email + SMS sequence) |
| 5 | `87d16c9` | D09, D17, D18, D23, D27 (workshop deck + funnel-completing pieces + vetting) |
| 6 | `8bd32a0` | D22, D25, D28, D31, D40 (partner contract + ops + kit assembly) |
| 7 | `df505d2` | D24, D26, D29, D30, L&D brief (audience-facing surfaces + L&D brief) |
| 7.5 | *(current)* | 8 kit-template files, cross-reference patches (D14, D19, D20, D21, D32, D33), 00-INDEX, this SESSION_STATE update |

### Remaining D-numbered (5)

**Batch 8 — post-pilot codification:**
- D35 — canon-revision intake template
- D36 — ambassador-conversion playbook
- D37 — reporting dashboard spec
- D38 — post-pilot launch announcement
- D39 — case-study template

### Operationally pending (block production sends; not D-numbered)

See `00-INDEX.md` §"Operationally pending" for the full list. The most-blocking:

1. **Host casting** — blocks D09 production-ready render, D29 swap, D30 recording, D23 Q10 content. Canon §17 outstanding Q1 + Q4.
2. **Admissions alias setup** — blocks D17 production sends. Canon §12.3 outstanding Q3.
3. **Counsel review of D22 v1** — blocks first partner contract execution.
4. **L&D-approver brief PDF** — shipped (batch 7); needs prospect-customization workflow standup before first send.
5. **Stripe webhooks + Vimeo token-gating + analytics infrastructure** — block D24 replay page + D17 trigger detection in production.

---

## Landing-page workstream — last known state

Last touched on `claude/resume-session-2UyBs` (now merged into `main`). Plan sections B–H all shipped per the prior session log:

- B: `lib/role.ts` — getRole/setRole/clearRole/useRole hook (sessionStorage `aesdr_role`)
- C: `LandingSequence.tsx` rewrite with branched scenes
- D: `LandingSequence.module.css` split-layer styles
- E: `components/EditorialMasthead.tsx`
- F: `components/PricingTiers.tsx` with role-aware pre-highlight
- G: `app/signup/page.tsx` — `user_metadata.role` on signup
- H: `app/page.tsx` — server-side role read for member fork-skip

PostHog wired: `lib/analytics.ts`, `components/PostHogClient.tsx` mounted in `app/layout.tsx`. Events firing: `pricing_cta_clicked`, `account_role_switched`, `landing_role_pick`. Vercel env vars need to be set for events to flow in production.

### Cleanup tickets still open on landing-page work

- `app/signup/page.tsx:46` and `app/account/select-role/page.tsx:50` still reference retired dark palette tokens. Rebuild against editorial tokens.
- Retired tokens still live in `app/globals.css` for legacy course HTML compat. Once all references in new code are gone, audit and prune the truly dead ones.

---

## Pre-flight before next session (affiliate workstream)

1. Confirm branch + HEAD match `git log -1 affiliate-seeding`. If not, ask user before reconciling.
2. Read `00-INDEX.md` first — it's the canonical map of what's shipped and what's pending.
3. Read `AGENTS.md` + `AFFILIATE_BRAND_CANON.md` v1.1 for brand directives (mandatory before any visual work).
4. Read the most recent batch's commit message — captures any decisions taken that aren't yet in canon.
5. Re-read `00-INDEX.md` §"Operationally pending" to track real-world blockers.

## Pre-flight before next session (landing-page workstream)

1. Switch to `main`. Cleanup tickets above are the open work.
2. Re-read `app/page.tsx` and `LandingSequence.module.css` before touching visuals.

---

## Open questions / decisions blocking work

### Affiliate workstream

| Question | Blocks | Default until decided |
|---|---|---|
| Host casting (name, tenure, prior roles) | D09, D29, D30, D23 Q10 | `[HOST_FIRST_NAME]` placeholders everywhere |
| Workshop title pick (from D08 ranked options) | D09 slide 01 | Working placeholder |
| Admissions alias public-name (real first name vs role-only) | D17 sender, D23 Q10 | Role-only as `Admissions` |
| Pilot discount default (D28 § published rate) | D28 partner rate | Recommend 20% off list |
| Commission rate default (D22 §5.1) | D22 first execution | 30% of net revenue (per archetype calibration optional) |
| AESDR legal entity formation | D22 §1 `[AESDR_LEGAL_ENTITY]` | Operationally pending |
| Governing law jurisdiction (D22 §17) | D22 first execution | Default Delaware unless counsel says otherwise |

### Landing-page workstream

None blocking. Re-confirm with user only if attempting work that contradicts the locked design decisions in prior `claude/resume-session-2UyBs` session log.

---

## Recent activity log

- **2026-05-02** — Batch 7.5 cleanup: shipped 8 kit-template files, patched cross-reference drift in D14, D19, D20, D21, D32, D33, added 00-INDEX. SESSION_STATE refreshed.
- **2026-05-02** — Batch 7: D24 replay page, D26 partner-promo landing page, D29 founder + host bio stubs, D30 lesson preview spec, L&D-approver brief.
- **2026-05-02** — Batch 6: D22 partner pilot agreement, D25 weekly partner reporting, D28 pricing & promo sheet, D31 curriculum map, D40 master partner-kit folder README.
- **2026-05-02** — Batch 5: D09 workshop deck, D17 high-intent DM, D18 deadline-window email, D23 partner-facing FAQ, D27 partner vetting scorecard.
- **2026-04-30** — Audit pass `430ee52`: patched three stale references found in batches 1–4 output.
- **2026-04-29** — Canon v1.1: custom-iconography doctrine + visual QA discipline (`7c6aead`).
- **2026-04-29** — Canon v1.0: Affiliate & Partner Brand Canon initial (`aa4461d`).
- **2026-04-28** — Last update to landing-page workstream (PostHog wired through role-fork conversion funnel).

---

*This file is the context-recovery brief, not the source of truth for any individual deliverable. The source of truth for affiliate deliverables is `design-canon/09-affiliate-deliverables/00-INDEX.md`. The source of truth for canon is `AFFILIATE_BRAND_CANON.md`.*
