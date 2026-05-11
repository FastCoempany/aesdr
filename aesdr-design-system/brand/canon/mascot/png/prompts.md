# Leponeus — AI Generation Prompts (v1.1 — Iridescent Render Pass)

> **Tool**: ChatGPT / Sora image (gpt-image-1) — works with any image model that accepts a reference image (DALL·E 3 with vision, Midjourney `--cref`, Flux Kontext, Nano Banana).
>
> **Reference**: Always attach `aesdr-design-system/aesdrmascot.png` (the existing hero render) as the style reference.
>
> **Output spec**: 1024×1024 PNG, transparent or soft-gray-blue background, sRGB. One creature per image. No text. No watermark.

---

## Workflow

1. Open a fresh ChatGPT image session (or Sora image / Midjourney).
2. Upload `aesdrmascot.png` as the style reference.
3. Paste the **System Style Block** below as your first message — establish the subject and style.
4. For each of the 8 expressions, paste the per-pose block. Generate. Pick the best of 2–4 variants.
5. Save as `leponeus-{key}.png` in this folder (`brand/canon/mascot/png/`). Lowercase keys: `doctrine`, `diagnosis`, `sprint`, `fall`, `recovery`, `rest`, `verdict`, `owner`.
6. Once a file exists at the predicted path, `synthesis.jsx` will swap it in automatically at sizes ≥120px. Smaller uses (badges, lockup, inline) stay on the canonical flat SVGs.

### Consistency tips

- **Always re-attach the reference image** with every prompt. Models drift without it.
- **Re-paste the System Style Block** before each per-pose block. Don't rely on the model to remember.
- If a generation strays (e.g., the strap disappears, ears change scale, background turns dark), regenerate — don't accept "close enough." The expression sheet only works if the 8 read as the same creature.
- Generate the **doctrine** pose first. Use its output as a secondary reference for the other 7.

---

## System Style Block — paste before EVERY per-pose prompt

```
SUBJECT — A single creature, hybrid of a tortoise and a hare. Tortoise body with a
hexagonally-segmented domed shell, four short scaled legs, and a round scaled head.
Long upright hare-like ears emerge from the head, with the same scale texture as the
body. A thin crimson red (#8B1A1A) leather strap runs horizontally across the head
just below where the ears attach, at eye-level.

SURFACE — Every surface (shell, head, ears, legs) is covered in tiny overlapping
iridescent mother-of-pearl scales. The scales shimmer with shifting pale blue, soft
pink, lavender, teal, and gold. The shell hexagons catch light at different angles,
creating a pearlescent gradient across the entire creature. Subtle subsurface
scattering on the ears. Matte-pearl finish, not glossy plastic.

LIGHTING & BACKGROUND — Soft three-quarter studio lighting from upper left. Cool
gray-blue (#C5CFD8) sky backdrop with wisps of soft white cumulus clouds drifting
behind and beneath the creature. The creature floats slightly off-frame-center,
casting a faint diffuse shadow on the cloudwash below. No ground plane. No horizon.

STYLE — Hyperreal digital 3D render, painterly finish, octane / redshift render
aesthetic. Square 1:1 aspect ratio. Centered composition, creature occupies ~70%
of frame, ample negative space around it. No text, no watermark, no UI.

CONSISTENCY — Match the attached reference exactly for scale texture, color palette,
and rendering style. Only the POSE and EXPRESSION change between generations.
```

---

## Per-pose prompts

### 01 · doctrine

```
[Style block above]

POSE — Doctrine (the canonical pose). Body angled three-quarter to the right.
Both ears upright, vertical, parallel. Eyes open and alert, looking forward with
calm authority. Mouth a soft neutral line. Crimson strap clearly visible. Body
level, floating horizontal. This is the default — the pose the brand speaks in.
```

### 02 · diagnosis

```
[Style block above]

POSE — Diagnosis (the honest mirror). Head tilted slightly down and to the side,
gaze turned inward. Eyes half-lidded, reflective. Ears upright but with a faint
backward droop. Mouth a thin flat line. Body still level but the head posture
reads as somber self-examination. No tears, no frown — just honesty.
```

### 03 · sprint

```
[Style block above]

POSE — Sprint (the burst). Body angled forward, leaning into motion. Front legs
reaching, back legs pushing off. Ears swept fully backward by the velocity,
streaming behind the head almost parallel to the ground. Eyes wide and focused
forward. Faint horizontal motion streaks in the cloudwash behind. Crimson strap
pulled taut against the head.
```

### 04 · fall

```
[Style block above]

POSE — Fall (the dip / burnout). Body tilted downward, sinking. Head hung low,
ears slack and drooping over the sides of the head. A single jagged crimson red
crack runs across the top of the shell (this is the only place crimson appears
outside the strap). Eyes downturned or softly closed. The clouds beneath feel
heavier, denser. The creature looks defeated but not destroyed.
```

### 05 · recovery

```
[Style block above]

POSE — Recovery (the sprout). Doctrine pose, but with a delicate young green
sprout — two small fresh leaves on a slender stem — emerging from the top of
the shell where a faint, healing crimson hairline crack is closing. Eyes open,
hopeful, looking up and to the right at the sprout. Ears upright. The lighting
is slightly warmer here, like dawn. This is the bounce-back.
```

### 06 · rest

```
[Style block above]

POSE — Rest (Sundays only). Body curled smaller, head tucked close to the shell.
Ears folded backward and downward, lying flat along the top of the shell. Eyes
peacefully closed (two soft horizontal arcs of dark lashes). Mouth relaxed. Soft
clouds wrap around and partially envelop the creature like a blanket. Lighting
slightly dimmer, dusk-soft. Stillness.
```

### 07 · verdict

```
[Style block above]

POSE — Verdict (the closing). Doctrine pose, ears upright and tall, posture
authoritative and direct. The very tip of the RIGHT ear (top ~15%) is dipped in
saturated crimson red (#8B1A1A) — as if marked with pigment — fading smoothly
back to the iridescent scale texture below. Eyes steady, locked forward. Strap
visible. The expression is unflinching, not cruel.
```

### 08 · owner

```
[Style block above]

POSE — Owner (the final state). Doctrine pose, but the center of the shell bears
an elegant italic serif capital letter "A" embossed/inlaid into the iridescent
scales in crimson red (#8B1A1A). The "A" is in a Playfair Display-style italic,
proportional to the shell. Head held slightly higher than doctrine. Posture
confident, settled, finished. The creature has arrived.
```

---

## Acceptance checklist (per generation)

Before saving a generation as canonical, confirm:

- [ ] Creature is recognizably the same as the reference (scale texture, color palette)
- [ ] Crimson strap present at eye-level (except `fall` where the head is too low to see it clearly — that's OK)
- [ ] Background is cool gray-blue with soft clouds — no other environments
- [ ] No anthropomorphizing: no smile, no waving, no thumbs, no human gestures
- [ ] Pose-specific element present (crack for fall, sprout for recovery, ear-tip crimson for verdict, "A" for owner)
- [ ] Square 1:1, single creature, centered
- [ ] No text, no watermark, no UI artifacts

If a generation fails any of these, regenerate. The 8 must read as a coherent sheet.

---

## After saving

Once all 8 PNGs are in this folder named `leponeus-doctrine.png` … `leponeus-owner.png`:

1. `synthesis.jsx` picks them up automatically for the Mascot System hero and the Expression Sheet (any render at size ≥120px).
2. Badges, lockups, and inline mascots keep the flat canonical SVG — they're too small for the iridescent detail to read, and they need to stay strict to the 4-color canon.
3. Bump the canon version to `v1.1` in `brand/canon/mascot/README.md` and `manifest.json`.
