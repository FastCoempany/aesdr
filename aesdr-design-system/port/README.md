# Brand port — foundation files ready to drop into `main`

This folder contains the **net-new files** that the design-system port needs in `main`. Run `install.sh` from the repo root and these files land at their target paths.

Everything here mirrors the target path inside `main`:

```
aesdr-design-system/port/
├── install.sh                              ← run this
├── public/mascot/
│   ├── leponeus-doctrine.png               → public/mascot/leponeus-doctrine.png
│   ├── leponeus-diagnosis.png              → public/mascot/leponeus-diagnosis.png
│   ├── leponeus-sprint.png                 → public/mascot/leponeus-sprint.png
│   ├── leponeus-fall.png                   → public/mascot/leponeus-fall.png
│   ├── leponeus-recovery.png               → public/mascot/leponeus-recovery.png
│   ├── leponeus-rest.png                   → public/mascot/leponeus-rest.png
│   ├── leponeus-verdict.png                → public/mascot/leponeus-verdict.png
│   └── leponeus-owner.png                  → public/mascot/leponeus-owner.png
├── components/brand/
│   └── Mascot.tsx                          → components/brand/Mascot.tsx
├── utils/brand/
│   └── lesson-poses.ts                     → utils/brand/lesson-poses.ts
└── app/
    ├── opengraph-image.tsx                 → app/opengraph-image.tsx
    └── twitter-image.tsx                   → app/twitter-image.tsx
```

## Why these specific files

These are all **net-new** — nothing in `main` exists at any of these paths today. Net-new files can be `cp`'d directly; no merging with existing code, no integration ambiguity.

Surfaces that require *integration* (dashboard header, welcome page hero, landing pricing section, etc.) are intentionally NOT in this port. Those need to merge into existing files and live as paste-ready snippets in `state0511-design-system.md` instead.

## Workflow for the next product-builder session

From a fresh branch off `main`:

```bash
# 1. Materialize the port dir in the main working tree
git checkout aesdr-design-system -- aesdr-design-system/port

# 2. Run the installer
bash aesdr-design-system/port/install.sh

# 3. Verify
npm run lint
npm run build

# 4. Smoke-test the OG card
npm run dev
# open http://localhost:3000/opengraph-image  (Next.js exposes the route)

# 5. Stage + commit + push + open PR
git add public/mascot \
        components/brand \
        utils/brand \
        app/opengraph-image.tsx \
        app/twitter-image.tsx
git commit -m "foundation: AESDR brand port (mascot, lesson-poses, OG card)"
git push -u origin <branch>
```

## What this gives you in production

After the Foundation PR merges:

- **Every shared aesdr.com URL has a designed OG card.** No more code needed for this surface — Next.js auto-injects the `<meta>` tags from `app/opengraph-image.tsx`.
- **Any future surface can render Leponeus in one line:** `<Mascot pose="doctrine" />`. No image imports, no path lookups, no size logic.
- **Lesson-to-pose mapping is the single source of truth.** Change one constant in `utils/brand/lesson-poses.ts` and every surface using it updates.

## What's still to do after the Foundation PR

13 surface PRs (sequencing in `state0511-design-system.md`):

1. ~~OG card~~ ← ships with the Foundation PR (no separate PR)
2. Landing hero — `<Mascot pose="doctrine" size={320} priority />` into the hero
3. Landing pricing — `<Mascot pose="verdict" size={140} />` into the pricing section
4. `/welcome` — `<Mascot pose="doctrine" size={280} priority />` into the corner-bracketed right column
5. `/syllabus` — `<Mascot pose="doctrine" size={200} priority />` into the hero
6. `/dashboard` journey header — dynamic pose via `poseForLesson(currentLesson.id)`
7. `/reveal` — `<Mascot pose="verdict" size={200} priority />`
8. `/artifacts/playbill` — `<Mascot pose="owner" size={240} priority />`
9. `/artifacts/redline` — `<Mascot pose="diagnosis" size={240} priority />`
10. `app/error.tsx` — swap `/turtle.png` for `<Mascot pose="recovery" size={320} />`
11. `app/not-found.tsx` — rebuild palette + `<Mascot pose="fall" size={280} />`
12. `/coming-soon` — swap `/turtle.png` for `<Mascot pose="doctrine" size={320} />`
13. Course completion screen — new route `/course/[lessonId]/complete` with `poseForLesson(lessonId)`
14. Email templates — React Email components using the same Mascot import

Each is independent. Cherry-pick in any order.

## Refreshing the port

If the canon updates (new pose, refined PNG, new constant), re-run on the canon branch:

```bash
# On aesdr-design-system branch:
cp aesdr-design-system/brand/canon/mascot/png/leponeus-*.png aesdr-design-system/port/public/mascot/
# edit aesdr-design-system/port/{components,utils,app}/ as needed
git commit -am "port: refresh foundation files from canon vN.N"
git push
```

Then the product-builder session re-runs `install.sh` on a new branch off `main` to pick up the changes.
