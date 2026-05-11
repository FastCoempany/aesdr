# State Handoff — 2026-05-11 (Design System)

Author: design-system-caretaker session  ·  Repo: `fastcoempany/aesdr`  ·  Companion branch: `aesdr-design-system`

Counterpart to `state0511-part1.md` and `state0511-part2.md` (which cover the product on `main`). This file covers the **brand canon** on the `aesdr-design-system` branch. Read it if you're touching anything visual — mascot, icons, spots, palette, OG, certificates/artifacts, lesson hero art.

---

## TL;DR

- Branch `aesdr-design-system` is the **brand canon sandbox**. Production never imports from it directly; the product builder reads it and ports assets into `app/`, `components/`, `public/`.
- Canon was bumped to **v1.1** today (commit `1a0abee`). Files documenting the bump: `aesdr-design-system/brand/canon/mascot/README.md`, `manifest.json`.
- **8 transparent-bg iridescent PNG mascots** ship at `aesdr-design-system/brand/canon/mascot/png/leponeus-{key}.png`. These replace the v1.0 cloud-backdrop versions (which are preserved at `png/source/` for reference).
- A re-runnable cutout pipeline (`png/cutout.py`) regenerates transparent versions from any new source PNG using `rembg + isnet-general-use`. ~5s per pose.
- **18 refined icon glyphs** and **5 hybrid spot illustrations** (line-art scaffolding + iridescent PNGs) live in `brand/synthesis.jsx`.

---

## What changed on `aesdr-design-system` since you last looked

Commits on the branch (newest first):

| SHA | Summary |
|---|---|
| `360aec2` | Refined 18 icons + hybrid spots (creatures inside line-art) |
| `1a0abee` | 7 fallback SVGs refined + canon bumped to v1.1 |
| `e0579b0` | 8 iridescent PNGs dropped into wired png/ folder |
| `c8631e8` | PNGs background-removed into transparent cutouts via rembg |
| `2d70940` | Prompts.md clarified: one self-contained message per pose |
| `03f5945` | Doctrine SVG refined: hex scutes, almond eye, ear fold, toes |
| `3115d57` | Initial dual-tier render wiring (PNG hero + SVG small) |

The single user-facing change you actually need to know: the PNGs at `aesdr-design-system/brand/canon/mascot/png/leponeus-*.png` now have **transparent backgrounds**. Earlier versions had a soft gray-blue cloud backdrop that fought with non-cream surfaces.

---

## Action item — image swap (if you used the v1.0 PNGs anywhere)

If `app/error.tsx`, any landing component, or anything else currently references a Leponeus PNG with a cloud background, swap it to the transparent version. The file paths and names are unchanged — they're at the same canonical filenames, just with transparency now.

If you copied PNGs into `public/` already, `cp` the new ones over. Files to copy:

```
aesdr-design-system/brand/canon/mascot/png/leponeus-doctrine.png
aesdr-design-system/brand/canon/mascot/png/leponeus-diagnosis.png
aesdr-design-system/brand/canon/mascot/png/leponeus-sprint.png
aesdr-design-system/brand/canon/mascot/png/leponeus-fall.png
aesdr-design-system/brand/canon/mascot/png/leponeus-recovery.png
aesdr-design-system/brand/canon/mascot/png/leponeus-rest.png
aesdr-design-system/brand/canon/mascot/png/leponeus-verdict.png
aesdr-design-system/brand/canon/mascot/png/leponeus-owner.png
```

Each is 1024×1024, ~1.5–2 MB transparent PNG.

---

## The 8 expressions — when to use which

| Key | Name | Use |
|---|---|---|
| `doctrine` | The Doctrine | Default. Brand-voice moments. Lockups, headers, certificates, signatures. |
| `diagnosis` | The Diagnosis | Honest-mirror moments. Lesson 01. Self-assessment intros. |
| `sprint` | The Sprint | Bursts of velocity. Onboarding momentum. Streak achievements. |
| `fall` | The Fall | The dip. Burnout. Lesson 05. **Avoid on error pages** — use `recovery` there instead (fall = "you broke", recovery = "we get back up"). |
| `recovery` | The Recovery | Bounce-back. Lesson 09. Error pages. "Welcome back" emails. |
| `rest` | The Rest | Permission to pause. Sundays only. Logged-out / paused state. |
| `verdict` | The Verdict | Pricing, closing, the moment of judgment. Crimson ear-tip. |
| `owner` | The Owner | Final state. Lesson 12. Artifact pages. The "you finished" moment. A-mark on shell. |

Canon rule: **max 1 mascot per editorial spread, 1 per badge, 1 per onboarding screen**. Scarcity is what gives it weight.

---

## Lesson → pose mapping (already encoded; copy into a TS constant)

From `aesdr-design-system/brand/synthesis.jsx` (`BADGES` array):

```ts
// utils/brand/lesson-poses.ts (suggested location)
export type Pose =
  | "doctrine" | "diagnosis" | "sprint" | "fall"
  | "recovery" | "rest" | "verdict" | "owner";

export const LESSON_POSE: Record<number, Pose> = {
  1:  "doctrine",   // The First Crawl — Diagnosis
  2:  "doctrine",   // The Camaraderie — Team
  3:  "verdict",    // The Lie Decoded — Manager
  4:  "verdict",    // The Verdict — Commission
  5:  "fall",       // The Fall — Playbook
  6:  "sprint",     // Beyond the Script
  7:  "doctrine",   // The Chaos Bridled
  8:  "doctrine",   // A Pipeline Read
  9:  "recovery",   // The Recovery — Burn
  10: "doctrine",   // The Long Mile — Exit
  11: "verdict",    // The Money Spoken
  12: "owner",      // The Owner — Own It
};
```

This mapping is the brand's narrative arc. Don't reassign without a canon discussion.

---

## Open gaps the product builder may want to close next

Things I see in `app/` that don't yet use the mascot system but probably should. Specs below are starting points, not finished designs.

### Gap 1 — OG card (highest ROI, easiest)

Every shared URL becomes an ad. Currently `aesdr.com` ships no `<meta property="og:image">` (verify before building).

**Suggested implementation:** Next.js App Router has a convention — `app/opengraph-image.tsx` generates an OG image dynamically via `next/og`. Compose: cream background + the doctrine PNG centered-left + the AESDR wordmark right + a tagline. 1200×630 px.

```tsx
// app/opengraph-image.tsx
import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG() {
  const png = readFileSync(join(process.cwd(), "public/mascot/leponeus-doctrine.png"));
  const dataUri = `data:image/png;base64,${png.toString("base64")}`;
  return new ImageResponse(
    (
      <div style={{
        width: "100%", height: "100%", display: "flex",
        background: "#FAF7F2", color: "#1A1A1A",
        padding: "60px 80px", fontFamily: "serif",
      }}>
        <img src={dataUri} width={400} height={400} style={{ alignSelf: "center" }} />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", marginLeft: 60 }}>
          <div style={{ fontSize: 96, fontStyle: "italic", fontWeight: 900 }}>AESDR<span style={{ color: "#8B1A1A" }}>.</span></div>
          <div style={{ fontSize: 32, marginTop: 24, color: "#6B6B6B", fontStyle: "italic" }}>The honest sales doctrine.</div>
          <div style={{ fontSize: 18, marginTop: 36, letterSpacing: ".2em", color: "#6B6B6B", textTransform: "uppercase", fontFamily: "monospace" }}>Twelve lessons · One doctrine</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
```

Plus a sibling `app/twitter-image.tsx` with the same export so Twitter cards work. Next.js auto-wires the `<meta>` tags from the file's existence.

### Gap 2 — Playbill / Redline artifact hero

`/artifacts/playbill` and `/artifacts/redline` are the binary takeaway from `/reveal` ("Choose your keeper — two readings of the same story"). They're the brand's "two voices" made manifest as student artifacts. The mascot could anchor each:

- **Playbill** (the staged, three-act self-portrait): `owner` pose works — it's the "final state" pose with the crimson A-mark on the shell. Frames the artifact as the culmination.
- **Redline** (the manuscript reading, presumably): `diagnosis` pose — the honest-mirror counterpart. Frames the artifact as the unflinching read.

Open question for the user: do you want both artifacts to share the `owner` pose (showing it's the same student, different reading), or should each carry its assigned counterpart pose? My recommendation is the second — but verify before building.

### Gap 3 — `/reveal` itself

The "Choose your keeper" page is the moment of judgment. `verdict` pose fits — that's literally what the pose was designed for. A single iridescent verdict pose at the top of the page, framing the binary choice below.

### Gap 4 — Course lesson hero

Each `app/course/[lessonId]/page.tsx` renders a lesson. The lesson's pose (from `LESSON_POSE` above) should appear once at the top — a single iridescent figure anchoring the lesson's emotional theme. Single use per page; canon scarcity rule applies.

### Gap 5 — Dashboard lesson grid

After PR #14 merges, `/dashboard` shows the 12 lessons for admins. Each lesson card could show its pose as a thumbnail (size ~80–100px, transparent PNG, cream card background). The dashboard becomes a literal expression sheet of the student's journey.

### Gap 6 — Email templates (Resend already wired)

`/api/partners/apply` sends via Resend. Worth building branded transactional templates for:

- **Welcome** (doctrine, after signup)
- **Lesson complete** (lesson-mapped pose, on each lesson finish)
- **Reveal unlocked** (verdict, when all 12 are done)
- **Comeback** (recovery, if dormant for 7+ days)

React Email is the right framework — same JSX patterns as the rest of the app. Templates would live at `components/emails/*.tsx`, sent by `lib/email.ts`.

### Gap 7 — `app/welcome/page.tsx`

`/welcome` exists per the route map. Doctrine pose, hero-sized (~400px), with a single sentence introducing the doctrine. Onboarding step zero.

### Gap 8 — Error pages

`app/error.tsx` already has "iridescent turtle" per state0511-part1. Confirm it's using the new transparent PNG, not the cloud-bg version. If it uses `fall`, consider swapping to `recovery` per the canon note above ("fall = you broke", "recovery = we get back up" — error pages should signal recovery, not defeat).

`app/not-found.tsx` — `fall` is actually on-brand here (the 404 is a *user* fall, not a system failure). Caption suggestion: "Every mile looks the same. This one isn't here."

---

## Conventions I followed (so your edits stay consistent)

- **Palette is editorial only:** `#FAF7F2` (cream), `#1A1A1A` (ink), `#8B1A1A` (crimson), `#6B6B6B` (muted), `#E8E4DF` (light), iris gradient for role tokens + key CTAs + brand wordmark only. Matches `AGENTS.md`.
- **Fonts via tokens:** Playfair Display (display), Source Serif 4 (serif body), Barlow Condensed (condensed sans), Space Mono (mono), Caveat (hand — Michael's voice / margin annotations only).
- **1.6px round-cap monoline** for all flat-SVG iconography. Crimson reserved for change/loss/money — never decorative.
- **Mascot scarcity:** Max one mascot per editorial spread / badge / onboarding screen.
- **PNG > SVG by default.** SVG fallback only for single-color reproduction (favicon ≤32px, print plates, swag, App Mark on dark) or onError fallback.
- **No anthropomorphizing of Leponeus.** No waving, no thumbs up, no smiling, no speech bubbles. The eight expressions are the only vocabulary.

---

## Where to find things on `aesdr-design-system` branch

| What | Path |
|---|---|
| Live design system HTML (boot via `python -m http.server`) | `aesdr-design-system/brand/AESDR Brand Visual System.html` |
| Mascot PNGs (transparent, canonical) | `aesdr-design-system/brand/canon/mascot/png/leponeus-*.png` |
| Mascot PNGs (cloud-bg source masters) | `aesdr-design-system/brand/canon/mascot/png/source/` |
| Cutout pipeline | `aesdr-design-system/brand/canon/mascot/png/cutout.py` |
| AI generation prompts | `aesdr-design-system/brand/canon/mascot/png/prompts.md` |
| Flat fallback SVGs (8 poses) | `aesdr-design-system/brand/canon/mascot/leponeus-*.svg` |
| SVG sprite (all 8 in one file) | `aesdr-design-system/brand/canon/mascot/leponeus.sprite.svg` |
| Canon README + changelog | `aesdr-design-system/brand/canon/mascot/README.md` |
| Manifest (machine-readable) | `aesdr-design-system/brand/canon/mascot/manifest.json` |
| 18-glyph icon set (JSX source) | `aesdr-design-system/brand/synthesis.jsx` (search `const ICON_SET`) |
| 5 spot illustrations (JSX source) | `aesdr-design-system/brand/synthesis.jsx` (search `function spot`) |
| Color + type tokens (CSS) | `aesdr-design-system/colors_and_type.css` |
| Master hero render (reference for re-generation) | `aesdr-design-system/aesdrmascot.png` |

---

## How to ship a new pose or refresh an existing one

If the brand ever needs a 9th expression OR a regenerated pose:

1. Bump version on this branch first. Open prompts.md and add the per-pose paragraph (mirroring the 8 existing ones).
2. Generate the new source PNG with the prompts (ChatGPT image / Sora image / Flux / Midjourney). Drop it at `png/source/leponeus-{key}.png`.
3. `python3 aesdr-design-system/brand/canon/mascot/png/cutout.py` — produces the transparent cutout at `png/leponeus-{key}.png`.
4. Update manifest.json + README changelog + bump canon version.
5. Open a PR to the design-system branch with the new asset, then a separate PR to `main` to swap the asset into `public/mascot/`.

---

## What I'm NOT doing (your lane)

Explicitly out of scope for the design-system caretaker:

- Touching anything in `app/`, `components/`, `lib/`, `public/`, `content/`. Those are the product builder's lane.
- Wiring components into routes.
- Tailwind config edits (palette tokens may need adding to `tailwind.config.ts` — your call on the implementation).
- Email template authoring.
- The OG card itself (spec above, but the build belongs in `main`).

If you need a new asset (icon variant, mascot pose, spot illustration, palette token), open an issue or ping in your state file — I'll add it to the canon and let you know when it's ready.

---

## Pre-flight for the product-builder session

1. Read this file + state0511-part1.md + state0511-part2.md.
2. Check whether anything in `app/` or `public/mascot/` uses cloud-bg PNGs from before today. If yes, swap to the transparent versions.
3. Decide priority order on Gaps 1–8 above. Recommend Gap 1 (OG card) first — single highest-leverage move.
4. When a gap involves a brand decision (e.g. pose choice for playbill vs redline), ping the user, not the design-system canon. The canon is here to enforce, not to decide.
