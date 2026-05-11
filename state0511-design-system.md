# State Handoff — 2026-05-11 (Design System)

Author: design-system-caretaker session  ·  Repo: `fastcoempany/aesdr`  ·  Companion branch: `aesdr-design-system`

Counterpart to `state0511-part1.md` and `state0511-part2.md`. This file covers the **brand canon on the `aesdr-design-system` branch** + the **deployment specs** for porting it into `main`. Read it if you're touching anything visual — mascot, icons, spots, palette, OG, lesson pages, certificates/artifacts, dashboard, welcome, etc.

> **v2 — 2026-05-11 (later same day).** All pose decisions are now **locked by the founder**. Specs below are paste-ready. Six new findings from a full app survey are folded in (`/turtle.png`, `/not-found.tsx` palette issue, course-page iframe shape, the three brand metaphors, EditorialMasthead overlap, the foundation step).

---

## TL;DR

- Branch `aesdr-design-system` = brand canon sandbox. Canon now at **v1.1** (mascot, 8 transparent PNGs, 18 icons, 5 spots, refined fallback SVGs, single-file shareable HTML build).
- Production never imports from `aesdr-design-system`. Assets get copied into `public/mascot/` and wired via new components in `components/brand/`.
- **One foundation PR comes first** (move PNGs in, create `<Mascot>` component). Then 13 surface PRs can land in any order.
- **All pose decisions locked.** No further design discussion needed before execution.

---

## Locked pose decisions (founder-approved 2026-05-11)

| Surface | Pose | Size | Notes |
|---|---|---|---|
| Landing hero | `doctrine` | ~320 px | Post-fork/skip, beside descriptor copy. Single biggest brand impression. |
| Landing pricing | `verdict` | ~140 px | Beside "Pricing" eyebrow. Echoes "your check is the verdict" framing. |
| Landing nav | — | — | **Skip.** No mascot in nav. Scarcity preserved. Text wordmark stays. |
| `/welcome` | `doctrine` | ~280 px | Inside the existing corner-bracketed right column or above headline. |
| `/syllabus` hero | `doctrine` | ~200 px | Library/card-catalog metaphor; mascot anchors brand without competing with the 12 cards. |
| `/dashboard` journey header | **dynamic** | ~140–180 px | `doctrine` if 0 complete, current lesson's mapped pose if mid-journey, `owner` if all 12 done. |
| `/reveal` | `verdict` | ~200 px | "Choose your keeper" = judgment moment. Pose carries the weight. |
| `/artifacts/playbill` | `owner` | ~240 px | The staged three-act formal finish. Owner has the A-mark on shell. |
| `/artifacts/redline` | `diagnosis` | ~240 px | The honest mirror, manuscript-with-edits. Counterpart to playbill. |
| `app/error.tsx` | `recovery` | ~280 px | **Swap from current `/turtle.png` to `/mascot/leponeus-recovery.png`.** |
| `app/not-found.tsx` | `fall` | ~280 px | **Rebuild this page on editorial palette first** — it still uses retired dark tokens. |
| `/coming-soon` | `doctrine` | (existing) | **Swap from `/turtle.png` to `/mascot/leponeus-doctrine.png`.** |
| Course lesson page | — | — | See "Open question: lesson page" below. Page is full-screen iframe; no Next.js-rendered hero possible. |
| Email templates | tone: "uncomfortable truths" | n/a | Welcome / lesson-complete (lesson's pose) / comeback (recovery) / reveal-unlocked (verdict). Dry, anti-guru. |

**Canon scarcity rule preserved everywhere:** max one mascot per page. No surface gets two. Tested as a posture for now — willing to revisit later.

---

## What I found doing the full survey (six things you should know)

### Finding 1 — `/turtle.png` is in production today

`public/turtle.png` (3.3 MB) is referenced from `app/error.tsx` and `/coming-soon`. The error page comment calls it "iridescent-turtle motif." Per the canon, this should be **swapped to the appropriate `/mascot/leponeus-{pose}.png`** — `recovery` for error, `doctrine` for coming-soon. The current asset predates the 8-pose canon.

### Finding 2 — `app/not-found.tsx` is still on the retired dark palette

```jsx
style={{ background: "var(--bg-main)", color: "var(--text-main)" }}
// ...
color: "var(--theme)", border: "1px solid var(--theme)",
```

Per AGENTS.md, those tokens are retired and forbidden in new code. Rebuild on editorial palette **before** the `fall` pose lands. Otherwise the mascot ships onto a non-canon-compliant background.

### Finding 3 — Course pages are full-screen iframes

`app/course/[lessonId]/page.tsx` mounts the lesson content from `content/lessons/html/lesson-XX/` as a **fixed-position iframe filling the entire viewport**. The only Next.js chrome is `SaveExitButton` (top-left) and tool download buttons (top-right). There's no Next.js-rendered hero/sidebar.

"Course lesson hero" as originally specced isn't possible. Three real options:

- **A. Floating mascot indicator (top-center, small).** Persistent ~48 px mascot at top-center, pose-mapped to the lesson. Doesn't intrude on the iframe.
- **B. Pre-lesson splash.** Brief Next.js intro page with the lesson's pose + "Begin lesson" CTA before the iframe mounts. Adds friction.
- **C. Post-lesson completion screen.** When `MarkCompleteButton` fires, show a celebration screen with the lesson's pose + "next lesson" CTA before redirecting to dashboard. Strongest narrative payoff.
- **D. Inside the iframe.** Touches `content/lessons/html/lesson-XX/`. Different scope. Skip.

**My recommendation: C.** That's a moment that *should* exist anyway — students currently just hit Save & Exit and silently return to dashboard. A completion celebration screen is a feature-gap the mascot solves.

### Finding 4 — The app has three brand metaphors, not one

- **Library / card catalog** — `/syllabus`. Lessons are "books" with Dewey numbers, call slips, due-date stamps.
- **Journey / timeline** — `/dashboard`. Vertical timeline with crimson nodes, cryptic teasers, gold-star reveal node.
- **Theatre / manuscript** — `/reveal`, `/artifacts/playbill`, `/artifacts/redline`. Two artifacts = two readings of the same story.

Each metaphor is internally consistent. The mascot lives across all three but the *surrounding scaffolding* differs. That's a feature.

### Finding 5 — `EditorialMasthead` contends for top-left

`components/EditorialMasthead.tsx` is a fixed-position nameplate ("AESDR — Sales Survival Course · for early-career AEs & SDRs") at `top: 18px; left: 22px`, visible during the LandingSequence animation. It overlaps the nav `AesdrBrand` per state0511-part2.md. **My nav recommendation (skip the mascot in nav) is compatible** — EditorialMasthead stays, AesdrBrand stays, neither gets a mascot, the overlap is its own separate fix.

### Finding 6 — No `/mascot/` folder in `public/` yet

The 8 canon PNGs live only on the design-system branch. Production has zero copies. Step zero of the brand port is `cp` into `public/mascot/`.

---

## Foundation PR (must land first)

Before any surface PR, one foundation commit:

1. `cp aesdr-design-system/brand/canon/mascot/png/leponeus-*.png public/mascot/` (8 files, ~14 MB)
2. `components/brand/Mascot.tsx`:

   ```tsx
   import Image from "next/image";

   export type Pose =
     | "doctrine" | "diagnosis" | "sprint" | "fall"
     | "recovery" | "rest" | "verdict" | "owner";

   export function Mascot({
     pose,
     size = 240,
     priority = false,
     className,
     style,
   }: {
     pose: Pose;
     size?: number;
     priority?: boolean;  // true for above-fold (hero, lesson splash)
     className?: string;
     style?: React.CSSProperties;
   }) {
     return (
       <Image
         src={`/mascot/leponeus-${pose}.png`}
         alt={`Leponeus — ${pose}`}
         width={size}
         height={size}
         priority={priority}
         className={className}
         style={{ display: "block", ...style }}
       />
     );
   }
   ```

3. `utils/brand/lesson-poses.ts`:

   ```ts
   import type { Pose } from "@/components/brand/Mascot";

   export const LESSON_POSE: Record<string, Pose> = {
     "1":  "doctrine",   // The First Crawl — Diagnosis
     "2":  "doctrine",   // The Camaraderie — Team
     "3":  "verdict",    // The Lie Decoded — Manager
     "4":  "verdict",    // The Verdict — Commission
     "5":  "fall",       // The Fall — Playbook
     "6":  "sprint",     // Beyond the Script
     "7":  "doctrine",   // The Chaos Bridled
     "8":  "doctrine",   // A Pipeline Read
     "9":  "recovery",   // The Recovery — Burn
     "10": "doctrine",   // The Long Mile — Exit
     "11": "verdict",    // The Money Spoken
     "12": "owner",      // The Owner — Own It
   };

   export function poseForLesson(lessonId: string | number): Pose {
     return LESSON_POSE[String(lessonId)] ?? "doctrine";
   }
   ```

4. (Optional) Extend `tailwind.config.ts` with brand color tokens so components can write `bg-cream text-ink` instead of hex codes.

---

## Per-surface deployment specs

### Surface 1 — OG card (`app/opengraph-image.tsx`)

Founder-approved copy:

```
AESDR
12-lesson sales survival course.
Built by operators, not course-people.
aesdr.com
```

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
        <img src={dataUri} width={420} height={420} style={{ alignSelf: "center" }} />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", marginLeft: 60 }}>
          <div style={{ fontSize: 124, fontStyle: "italic", fontWeight: 900, letterSpacing: "-0.02em" }}>AESDR</div>
          <div style={{ fontSize: 36, marginTop: 28, color: "#6B6B6B", fontStyle: "italic", lineHeight: 1.3 }}>
            12-lesson sales survival course.<br/>Built by operators, not course-people.
          </div>
          <div style={{ fontSize: 20, marginTop: 40, letterSpacing: ".2em", color: "#8B1A1A", textTransform: "uppercase", fontFamily: "monospace" }}>aesdr.com</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
```

Plus `app/twitter-image.tsx` as a one-line re-export. Next.js auto-injects `<meta>` tags.

### Surface 2 — Landing hero

Where: post-LandingSequence resolution, beside the role-aware hero descriptor. Coordinate with `components/landing-sequence/animator.ts` so the mascot fades in only after the typing finishes (or immediately on skip).

```tsx
<div className={styles.heroPanel}>
  <Mascot pose="doctrine" size={320} priority />
  <p className={styles.heroDescriptor}>{descriptor}</p>
</div>
```

### Surface 3 — Landing pricing

In `app/page.tsx`, beside the section eyebrow:

```tsx
<section id="pricing" className={styles.pricingSection}>
  <div className={styles.pricingHeader}>
    <Mascot pose="verdict" size={140} />
    <div>
      <p className={styles.sectionLabel}>Pricing</p>
      <h2 className={styles.sectionHeadline}>One price. Lifetime access.</h2>
    </div>
  </div>
  <div className={styles.divider} />
  <PricingTiers initialRole={initialRole} />
</section>
```

### Surface 4 — `/welcome`

In the existing corner-bracketed right column, above the "Stop Surviving. Start Owning It." headline:

```tsx
<div className={styles.heroRight}>
  {/* corner brackets unchanged */}
  <Mascot pose="doctrine" size={280} priority style={{ marginBottom: 16 }} />
  <div className={styles.monoLabel}>The Unfiltered SaaS Sales Survival Guide</div>
  <h1 className={styles.heroH1}>Stop Surviving.<br/>Start <span className={styles.heroAccent}>Owning</span> It.</h1>
  {/* …rest unchanged */}
</div>
```

### Surface 5 — `/syllabus`

Above or beside the `<h1>The Syllabus.</h1>`:

```tsx
<section className={styles.hero}>
  <Mascot pose="doctrine" size={200} priority />
  <div className={styles.heroKicker}>Shelf 12 · Drawer A · Est. 2026</div>
  <h1 className={styles.heroTitle}>The <em>Syllabus.</em></h1>
  {/* …rest unchanged */}
</section>
```

### Surface 6 — `/dashboard` journey header

In `app/dashboard/page.tsx`, between the `header` open and the timeline. The mascot becomes a mood ring — pose changes by student state. Zero risk to the timeline below.

```tsx
import { poseForLesson } from "@/utils/brand/lesson-poses";
import { Mascot } from "@/components/brand/Mascot";

// after computing completedCount/currentLesson/allComplete:
const headerPose = allComplete
  ? "owner"
  : completedCount === 0
    ? "doctrine"
    : poseForLesson(currentLesson.id);

// replace the existing <header> with:
<header className="mb-16" style={{ display: "flex", gap: 24, alignItems: "center" }}>
  <Mascot pose={headerPose} size={160} priority />
  <div>
    <p style={{ /* The Journey eyebrow */ }}>The Journey</p>
    <h1 style={{ /* big italic headline */ }}>
      {completedCount === 0
        ? "It starts now."
        : completedCount === LESSONS.length
          ? "You made it."
          : `${completedCount} down. ${LESSONS.length - completedCount} to go.`}
    </h1>
  </div>
</header>
```

### Surface 7 — `/reveal`

Above the "Choose your keeper" UI in `app/reveal/RevealView.tsx`:

```tsx
<Mascot pose="verdict" size={200} priority />
{/* …existing reveal UI */}
```

### Surface 8 — `/artifacts/playbill`

Above the artifact view (and inside the empty-state "The curtain has not risen" screen):

```tsx
<Mascot pose="owner" size={240} priority />
{/* …existing PlaybillView or empty state */}
```

### Surface 9 — `/artifacts/redline`

Same pattern, different pose:

```tsx
<Mascot pose="diagnosis" size={240} priority />
{/* …existing RedlineView or empty state */}
```

### Surface 10 — `app/error.tsx`

**Swap the existing `/turtle.png` reference:**

```tsx
// Before:
<img src="/turtle.png" alt="" /* … */ />

// After:
<Mascot pose="recovery" size={320} />
```

The eyebrow "Error · The turtle stopped" still works for either pose; keep it or change to taste.

### Surface 11 — `app/not-found.tsx`

**First: rebuild the page on editorial palette.** Replace `var(--bg-main)`, `var(--text-main)`, `var(--theme)` with `var(--cream)`, `var(--ink)`, `var(--crimson)`. Then:

```tsx
<Mascot pose="fall" size={280} />
<h1>404</h1>
<p>Every mile looks the same. This one isn't here.</p>
<Link href="/">Back to home</Link>
```

(The caption is a callback to the brand's "Long Mile" spot illustration. Optional but on-brand.)

### Surface 12 — `/coming-soon`

Swap `/turtle.png` for `<Mascot pose="doctrine" size={320} />`. Same pattern as error page.

### Surface 13 — Course lesson page (open question — see Finding 3)

Recommended: **build a post-lesson completion screen** as a new route. When `MarkCompleteButton` fires:

```tsx
// pseudocode
await markComplete(lessonId);
router.push(`/course/${lessonId}/complete`);
```

`/course/[lessonId]/complete/page.tsx`:

```tsx
<main>
  <Mascot pose={poseForLesson(lessonId)} size={360} priority />
  <p>{TEASERS[lessonId].kicker}</p>   {/* iris-shimmer kicker is already brand voice */}
  <h1>Lesson {lessonId} complete.</h1>
  <Link href={`/course/${nextLessonId}`}>Next lesson →</Link>
  <Link href="/dashboard">Back to The Journey</Link>
</main>
```

Defer if scope is heavy. The minimum acceptable port is surfaces 1–12; surface 13 can come later.

### Surface 14 — Email templates (Resend + React Email)

Tone: **uncomfortable truths.** Match the live landing voice — dry, anti-guru, sober/fun/practical. No "Hey there!" sunshine.

| Template | Trigger | Pose | Subject (sketch) |
|---|---|---|---|
| Welcome | After signup | `doctrine` | "You signed up. Now what." |
| Lesson complete | After `MarkCompleteButton` | `poseForLesson(lessonId)` | "Lesson {N} done. {N+1} is the harder one." |
| Comeback | 7+ days dormant | `recovery` | "You haven't shown up in a week. That's data." |
| Reveal unlocked | After 12th lesson | `verdict` | "Choose your keeper." |

Components at `components/emails/{Welcome,LessonComplete,Comeback,RevealUnlocked}.tsx`, sent by `lib/email.ts` (already wired for Resend per state0511-part1.md).

---

## Sequencing recommendation

1. **Foundation PR** — `<Mascot>` component, `lesson-poses.ts`, copy PNGs to `public/mascot/`. Blocks everything.
2. **OG card** (Surface 1) — 30 min, zero blast radius, immediate distribution win.
3. **Error + not-found palette fix + mascot swap** (Surfaces 10–12) — also closes the not-found dark-palette debt. Three small commits.
4. **Welcome + Syllabus + Dashboard header** (Surfaces 4, 5, 6) — three high-visibility brand-voice surfaces.
5. **Landing hero + pricing** (Surfaces 2, 3) — coordinate with LandingSequence animation.
6. **Reveal + Playbill + Redline** (Surfaces 7, 8, 9) — narrative climax. Founder may want close QA.
7. **Course lesson completion screen** (Surface 13) — feature gap, scope before starting.
8. **Email templates** (Surface 14) — depends on in-app components for visual consistency.

Each can be its own PR. Cherry-pick to taste.

---

## Three known cleanups to batch with the brand port

1. **`/turtle.png` references** → swap to `/mascot/leponeus-{pose}.png` (recovery for error, doctrine for coming-soon).
2. **`app/not-found.tsx` palette** → `--bg-main` / `--text-main` / `--theme` → `--cream` / `--ink` / `--crimson`.
3. **`app/signup/page.tsx` + `app/account/select-role/page.tsx`** still use retired tokens per SESSION_STATE.md. Worth folding into the brand-pass batch.

---

## What's on `aesdr-design-system` branch

| Path | Status |
|---|---|
| `brand/canon/mascot/png/leponeus-{8}.png` | ✅ Transparent cutouts, ready to deploy |
| `brand/canon/mascot/png/source/leponeus-{8}.png` | ✅ Source masters (cloud bg) for re-cutting |
| `brand/canon/mascot/png/cutout.py` | ✅ Re-runnable rembg pipeline |
| `brand/canon/mascot/png/prompts.md` | ✅ AI gen prompts |
| `brand/canon/mascot/leponeus-{8}.svg` | ✅ Flat fallback SVGs (print/swag/favicon) |
| `brand/canon/mascot/leponeus.sprite.svg` | ✅ All 8 in one `<use>`-able file |
| `brand/canon/mascot/manifest.json` | ✅ Machine-readable canon · v1.1 |
| `brand/canon/mascot/README.md` | ✅ Canon doc + changelog |
| `brand/synthesis.jsx` | ✅ Live design canvas (mascot, 18 icons, 5 spots, badges, lockups) |
| `dist/aesdr-brand-visual-system.standalone.html` | ✅ 21 MB single-file shareable HTML |
| `build/build-standalone.py` | ✅ Re-runnable single-file build |

---

## Conventions to honor (from AGENTS.md)

- Editorial palette only — `--cream`, `--ink`, `--crimson`, `--muted`, `--light`, `--iris`. Dark palette retired.
- Fonts via tokens — `--display`, `--serif`, `--cond`, `--mono`, `--hand`.
- 1.6 px round-cap monoline for all flat SVG iconography. Crimson reserved for change/loss/money.
- Mascot scarcity: max 1 per page/spread.
- No anthropomorphizing of Leponeus — no waving, no thumbs, no smiling, no speech bubbles. 8 expressions only.
- All changes to `main` go via PR. Direct push blocked (403).
- Internal canon docs live in `content/aesdr-internal/` and never render publicly.

---

## What I'm NOT doing (your lane)

- Touching anything in `app/`, `components/`, `lib/`, `public/`, `content/`. Product builder's lane.
- Wiring components into routes.
- Tailwind config edits.
- Email template authoring.
- The OG card itself (spec above; build belongs in `main`).
- Course content (`content/lessons/html/lesson-XX/`).

If you need a new asset (icon variant, mascot pose, spot illustration, palette token), open an issue or write in your next state file. I'll add it to the canon and let you know.

---

## Pre-flight for the product-builder session

1. Read this file + state0511-part1.md + state0511-part2.md + AGENTS.md.
2. Start with the **foundation PR** (PNGs → `public/mascot/`, `Mascot.tsx`, `lesson-poses.ts`).
3. Decide on the **course lesson completion screen** approach (Surface 13). If scope is heavy, ship surfaces 1–12 first.
4. Pose decisions are all locked. Don't re-litigate — execute against the specs above.
5. If a surface PR opens with something contradicting the canon, ping me via state file or PR comment.
