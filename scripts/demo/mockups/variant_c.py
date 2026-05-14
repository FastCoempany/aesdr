"""
Mockup C v3 — full-screen "Pilgrimage" cut. No letterbox.

Beats:
   0.0–1.4s   Leponeus enters and settles
   1.4–4.4s   "(this is Leponeus..." types letter-by-letter, parenthesis stays open
   4.4–13.4s  Counterclockwise lesson reveal — Breaking Down Silos appears
              first, each lesson fades as the next arrives at the next
              counterclockwise position; sequence ends on Surviving & Thriving
              in crimson, which holds
  13.4–18.6s  "...he's your trusty sales career mascot. no one cares about
              you more than Leponeus does.)" finishes typing
  18.6–22.0s  Mascot zooms out; AESDR iris wordmark zooms in full (uncropped);
              Surviving & Thriving pulls to crimson focus beneath
  22.0–24.4s  "Here's a sneak peek." writes on; hard-cut into course screen
  24.4–38.0s  Course screen with full chrome (Save&Exit, COURSE 3 chip,
              ADMIN MODE, Download button, sidebar with sections, BACK /
              CONTINUE footer). Cursor lands on the Series B HIGH button,
              button turns green, the other three rows fade fully out,
              reasoning subtext fades in below
  38.0–45.0s  Merged end card — AESDR iris wordmark (uncropped), "Change
              your life.", and the new section-grey tagline
"""

import math
import os
import subprocess
import tempfile
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

from _common import (
    W, H, FPS, DURATION, N,
    CREAM, INK, CRIMSON, MUTED, LIGHT, WARM_BONE, PARCHMENT,
    F_DISP_BI, F_DISP_BL, F_IT, F_REG, F_BODY, F_BODY_B, F_MONO, F_MONO_B,
    LESSONS, IRIS,
    clamp, ease_io, ease_in, ease_out, fade, lerp, iris_color,
    mascot, with_alpha,
    paste_centered, text_layer, text_centered, iris_text,
    apply_cinema,
)

ROOT = Path(__file__).resolve().parents[3]


# ─── Backgrounds + ambience ──────────────────────────────────────────

def gradient_bg(t):
    k = ease_io(clamp(t / 45.0))
    base = tuple(int(WARM_BONE[i] * (1 - k) + CREAM[i] * k) for i in range(3))
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    cx, cy = W / 2, H * 0.5
    rr = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2) / (math.hypot(W, H) / 2)
    v = np.clip(1.0 - rr * 0.20, 0.78, 1.0)
    arr = np.zeros((H, W, 3), dtype=np.float32)
    for c in range(3):
        arr[..., c] = base[c] * v
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), "RGB").convert("RGBA")


def particles(t, count=70):
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    rng = np.random.default_rng(42)
    for i in range(count):
        x0 = rng.random() * W
        y0 = rng.random() * H
        vx = (rng.random() - 0.5) * 24
        vy = -8 - rng.random() * 20
        x = (x0 + vx * t) % W
        y = (y0 + vy * t) % H
        r = 1 + rng.random() * 2.4
        a = int(50 + rng.random() * 70)
        d.ellipse([x - r, y - r, x + r, y + r], fill=(150, 140, 130, a))
    return layer.filter(ImageFilter.GaussianBlur(radius=0.8))


# ─── Counterclockwise constellation positions ────────────────────────

def cc_positions():
    """12 positions on a circle around the mascot, walked counter-clockwise.

    Index 0 is upper-right (the user-specified entry point for "Breaking
    Down Silos"). Each subsequent index moves ~30° counterclockwise around
    the screen.
    """
    start = -math.pi / 3  # upper-right
    out = []
    for i in range(12):
        angle = start - (i / 12) * 2 * math.pi
        r_x = 0.32 + 0.03 * math.sin(i * 1.7)
        r_y = 0.28 + 0.03 * math.cos(i * 1.3)
        out.append((angle, r_x, r_y))
    return out


# Lesson order in the counterclockwise reveal — Breaking Down Silos first,
# Surviving & Thriving last so it can stay in crimson.
CC_LESSON_ORDER = [
    1,   # 02 Breaking Down Silos
    0,   # 01 Creating Structure
    3,   # 04 Navigating the Workplace
    4,   # 05 The SDR Playbook
    5,   # 06 Building Real Camaraderie
    6,   # 07 Prospecting & Pipeline
    7,   # 08 The Discovery Reset
    8,   # 09 Called to Lead
    9,   # 10 Compensation Realities
    10,  # 11 Sober Selling
    11,  # 12 Relationships & Balance
    2,   # 03 Surviving & Thriving  ← held in crimson
]


# ─── Typed-on annotation helper ──────────────────────────────────────

def typed_substring(full: str, t: float, start: float, chars_per_s: float = 12.0):
    """Return the visible substring of `full` at time t, started at `start`,
    typed at `chars_per_s`."""
    if t < start:
        return ""
    n = int((t - start) * chars_per_s)
    return full[:max(0, min(len(full), n))]


def draw_wrapped(canvas, text, font, color, x, y, max_w, line_h, alpha=1.0):
    """Render `text` wrapped to max_w on `canvas`, anchored at (x, y).
    Returns the y-coord of the line after the last drawn line."""
    if not text:
        return y
    words = text.split(" ")
    line = ""
    lines = []
    probe = ImageDraw.Draw(canvas)
    for w in words:
        trial = (line + " " + w).strip()
        if probe.textbbox((0, 0), trial, font=font)[2] > max_w and line:
            lines.append(line)
            line = w
        else:
            line = trial
    if line:
        lines.append(line)
    for li, ln in enumerate(lines):
        tl = text_layer(ln, font, color, alpha)
        canvas.alpha_composite(tl, (int(x - 24), int(y + li * line_h - 24)))
    return y + len(lines) * line_h


# ─── Course screen — full chrome (matches screenshot #1 framing) ─────

def render_course_screen(w, h, t, click_t=5.0):
    """Faithful in-lesson mock for SECTION 03 · SUBJECT-LINE RISKS.

    Full chrome: Save&Exit pill, breadcrumb chip, ADMIN MODE, download CTA,
    progress bar, ghost numeral, sidebar (sections + pull quote), footer
    with BACK / CONTINUE. At t >= click_t, the Series B HIGH button is
    clicked: it turns solid green, the other three subject rows fade to
    transparent, and the reasoning text fades in beneath the Series B row.
    """
    layer = Image.new("RGBA", (w, h), CREAM + (255,))
    d = ImageDraw.Draw(layer)

    # ─── TOP BAR ─────────────────────────────────────────────────────
    # Save & Exit pill (small dark)
    sx0, sy0, sx1, sy1 = 22, 22, 138, 50
    d.rectangle([sx0, sy0, sx1, sy1], fill=INK)
    f_save = ImageFont.truetype(F_MONO_B, 11)
    d.text(((sx0 + sx1) // 2, (sy0 + sy1) // 2),
           "← SAVE & EXIT", font=f_save, fill=CREAM, anchor="mm")

    # COURSE 3 breadcrumb chip
    cx0 = sx1 + 18
    cx1 = cx0 + 84
    d.rounded_rectangle([cx0, sy0, cx1, sy1], radius=2, fill=CRIMSON)
    f_chip = ImageFont.truetype(F_MONO_B, 11)
    d.text(((cx0 + cx1) // 2, (sy0 + sy1) // 2),
           "COURSE 3", font=f_chip, fill=CREAM, anchor="mm")

    # ADMIN MODE chip (centered)
    ax0 = w // 2 - 70
    ax1 = ax0 + 140
    d.rounded_rectangle([ax0, sy0, ax1, sy1], radius=2,
                        outline=CRIMSON, width=1, fill=CREAM)
    d.ellipse([ax0 + 12, sy0 + 10, ax0 + 22, sy0 + 20], fill=CRIMSON)
    d.text(((ax0 + ax1) // 2 + 8, (sy0 + sy1) // 2),
           "ADMIN MODE ▾", font=f_chip, fill=INK, anchor="mm")

    # DOWNLOAD CTA (top-right) — mint with crimson hairline
    dl_w = 380
    dl_x1 = w - 22
    dl_x0 = dl_x1 - dl_w
    d.rectangle([dl_x0, sy0, dl_x1, sy1],
                fill=(133, 222, 178), outline=CRIMSON, width=1)
    f_dl = ImageFont.truetype(F_MONO_B, 11)
    d.text(((dl_x0 + dl_x1) // 2, (sy0 + sy1) // 2),
           "↓ DOWNLOAD AE/SDR ALIGNMENT CONTRACT BUILDER",
           font=f_dl, fill=INK, anchor="mm")

    # Progress bar (yellow → coral → magenta gradient)
    bar_y = 60
    bar_h = 3
    for x in range(w):
        u = x / w
        if u < 0.3:
            col = (242, 200, 70)
        elif u < 0.55:
            col = (240, 130, 80)
        elif u < 0.8:
            col = (220, 90, 110)
        else:
            col = (180, 100, 200)
        d.line([(x, bar_y), (x, bar_y + bar_h)], fill=col)

    # ─── EYEBROW ROW ─────────────────────────────────────────────────
    eb_y0 = 92
    eb_y1 = eb_y0 + 26
    d.rounded_rectangle([42, eb_y0, 146, eb_y1], radius=2, fill=CRIMSON)
    f_chip2 = ImageFont.truetype(F_MONO_B, 12)
    d.text(((42 + 146) // 2, (eb_y0 + eb_y1) // 2),
           "COURSE 3", font=f_chip2, fill=CREAM, anchor="mm")
    f_eb = ImageFont.truetype(F_MONO, 13)
    d.text((162, (eb_y0 + eb_y1) // 2),
           "SECTION 03  —  SUBJECT-LINE RISKS",
           font=f_eb, fill=MUTED, anchor="lm")

    # ─── GHOST NUMERAL "03" in the right-background of the body ──────
    ghost = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    gd = ImageDraw.Draw(ghost)
    f_ghost = ImageFont.truetype(F_DISP_BI, 240)
    gd.text((w - 470, 80), "03", font=f_ghost, fill=INK + (28,))
    layer.alpha_composite(ghost)

    # ─── HEADLINE + SUBHEAD ──────────────────────────────────────────
    f_h = ImageFont.truetype(F_DISP_BI, 64)
    d.text((42, 150), "Which of these earns a reply?", font=f_h, fill=INK)
    f_sub = ImageFont.truetype(F_BODY, 20)
    d.text((42, 226),
           "Six subject lines. High or Low. The reasoning unlocks after each verdict.",
           font=f_sub, fill=(110, 105, 95))

    # ─── SUBJECT ROWS ────────────────────────────────────────────────
    rows = [
        ("COLD OUTREACH · REVOPS",
         "“Quick question about your SDR ramp time”"),
        ("GENERIC SAAS OUTREACH",
         "“Introducing [Company] — Transform Your Sales Process!”"),
        ("TIMELY TRIGGER",
         "“Saw the Series B announcement — one question”"),
        ("BENEFIT-FIRST EMAIL",
         "“How we helped [Company] increase revenue by 40%”"),
    ]
    PICKED_IDX = 2

    sidebar_x = w - 300
    row_x0 = 42
    row_x1 = sidebar_x - 32
    row_y0 = 290
    row_h = 92
    f_re_eb = ImageFont.truetype(F_MONO, 12)
    f_re_t = ImageFont.truetype(F_BODY_B, 22)
    f_btn = ImageFont.truetype(F_MONO_B, 13)
    f_reason_hdr = ImageFont.truetype(F_MONO_B, 12)
    f_reason = ImageFont.truetype(F_BODY, 18)

    # Cursor target on Series B HIGH
    cursor_target = (0, 0)

    # Sibling-rows fade after click
    if t >= click_t:
        sib_alpha = clamp(1.0 - (t - click_t) / 0.6)
    else:
        sib_alpha = 1.0

    for i, (eb, line) in enumerate(rows):
        y = row_y0 + i * row_h
        is_picked = (i == PICKED_IDX and t >= click_t)
        a_row = sib_alpha if i != PICKED_IDX else 1.0
        if a_row <= 0.01:
            # Reserve cursor target if this is the picked row (it isn't)
            continue

        # Focus rectangle on the picked row as the cursor approaches
        if i == PICKED_IDX and t >= click_t - 1.0:
            border_a = clamp((t - (click_t - 1.0)) / 0.6)
            d.rectangle([row_x0 - 6, y - 6, row_x1 + 6, y + row_h - 18],
                        outline=(180, 175, 168) + (int(255 * border_a),),
                        width=1)

        # Eyebrow + line
        d.text((row_x0 + 6, y + 6), eb, font=f_re_eb,
               fill=MUTED + (int(255 * a_row),))
        d.text((row_x0 + 6, y + 28), line, font=f_re_t,
               fill=INK + (int(255 * a_row),))

        # HIGH / LOW buttons
        for j, (label, col) in enumerate([("↑ HIGH", (90, 160, 110)),
                                          ("↓ LOW", (190, 90, 80))]):
            bx = row_x1 - 254 + j * 128
            by = y + 14
            bx2, by2 = bx + 116, by + 38
            if is_picked and j == 0:
                d.rectangle([bx, by, bx2, by2], fill=col + (255,))
                d.text(((bx + bx2) // 2, (by + by2) // 2),
                       label, font=f_btn, fill=CREAM, anchor="mm")
            else:
                d.rectangle([bx, by, bx2, by2],
                            outline=col + (int(220 * a_row),), width=1)
                d.text(((bx + bx2) // 2, (by + by2) // 2),
                       label, font=f_btn,
                       fill=col + (int(255 * a_row),), anchor="mm")
            if i == PICKED_IDX and j == 0:
                cursor_target = ((bx + bx2) // 2, (by + by2) // 2)

        # Row divider
        if i < len(rows) - 1:
            d.line([(row_x0, y + row_h - 10), (row_x1, y + row_h - 10)],
                   fill=(220, 215, 208) + (int(255 * a_row),))

    # Reasoning text for the Series B row — fades in after click,
    # uses the room vacated by the faded-out siblings.
    if t > click_t:
        reason_a = clamp((t - click_t) / 0.7)
        ry = row_y0 + PICKED_IDX * row_h + row_h + 6
        d.text((row_x0 + 6, ry), "WHY HIGH —",
               font=f_reason_hdr, fill=(90, 160, 110, int(255 * reason_a)))
        lines = [
            "References a real, recent event. Reads as personal, not a mass sequence.",
            "The trailing “one question” hints at curiosity without overpromising.",
            "Pairs the timing with a low-cost ask — the reader doesn't owe you a meeting yet.",
        ]
        for li, ln in enumerate(lines):
            d.text((row_x0 + 6, ry + 26 + li * 28), ln,
                   font=f_reason, fill=(90, 90, 90, int(255 * reason_a)))

    # Animated cursor — lands on the Series B HIGH ~0.6s before click_t
    if t >= click_t - 0.8 and t <= click_t + 1.4 and cursor_target != (0, 0):
        k = clamp((t - (click_t - 0.8)) / 0.6)
        sx = row_x1 - 50
        sy = row_y0 + 4 * row_h
        cx_now = int(lerp(sx, cursor_target[0] - 20, ease_out(k)))
        cy_now = int(lerp(sy, cursor_target[1] - 14, ease_out(k)))
        d.polygon([(cx_now, cy_now),
                   (cx_now + 18, cy_now + 6),
                   (cx_now + 6, cy_now + 18)], fill=INK)
        d.polygon([(cx_now, cy_now),
                   (cx_now + 18, cy_now + 6),
                   (cx_now + 6, cy_now + 18)],
                  outline=CREAM, width=2)
        if t > click_t and t < click_t + 0.5:
            rk = (t - click_t) / 0.5
            rr = int(10 + rk * 60)
            ra = int((1 - rk) * 200)
            d.ellipse([cursor_target[0] - rr, cursor_target[1] - rr,
                       cursor_target[0] + rr, cursor_target[1] + rr],
                      outline=(90, 160, 110) + (ra,), width=2)

    # ─── RIGHT SIDEBAR ───────────────────────────────────────────────
    sb_x0 = sidebar_x
    d.line([(sb_x0 - 18, eb_y1 + 14), (sb_x0 - 18, h - 96)],
           fill=(220, 215, 208))

    f_sb_big = ImageFont.truetype(F_DISP_BI, 56)
    d.text((sb_x0, 88), "03", font=f_sb_big, fill=CRIMSON)
    f_sb_lab = ImageFont.truetype(F_MONO_B, 11)
    f_sb_eb = ImageFont.truetype(F_MONO, 11)
    d.text((sb_x0, 162), "LESSON 3.3 · SDR", font=f_sb_eb, fill=MUTED)
    d.text((sb_x0, 178), "SUBJECT-LINE RISKS", font=f_sb_lab, fill=INK)
    d.line([(sb_x0, 208), (sb_x0 + 220, 208)], fill=(220, 215, 208))
    d.text((sb_x0, 224), "SECTIONS", font=f_sb_eb, fill=MUTED)

    sections = [
        ("01", "THE DIAGNOSIS"),
        ("02", "QUALIFICATION & FEEDBACK"),
        ("03", "SUBJECT-LINE RISKS"),
        ("04", "TEMPLATES & HOMEWORK"),
    ]
    sec_y0 = 254
    sec_step = 56
    for i, (n, name) in enumerate(sections):
        active = (i == 2)
        col = CRIMSON if active else MUTED
        d.text((sb_x0, sec_y0 + i * sec_step),
               f"SECTION {n}", font=f_sb_eb, fill=col)
        d.text((sb_x0, sec_y0 + i * sec_step + 16),
               name, font=f_sb_lab, fill=col)
        if active:
            d.rectangle([sb_x0 - 14, sec_y0 + i * sec_step - 2,
                         sb_x0 - 12, sec_y0 + i * sec_step + 32],
                        fill=CRIMSON)

    # Iris pull-quote at the bottom of the sidebar
    quote_y = h - 220
    f_quote = ImageFont.truetype(F_DISP_BI, 18)
    quote_lines = [
        "The definition of",
        "insanity is doing the",
        "same call and expecting",
        "a different meeting.",
    ]
    for li, ln in enumerate(quote_lines):
        iris_layer = iris_text(ln, f_quote, t * 0.15 + li * 0.04)
        # iris_text returns a padded layer — paste so the text aligns
        # at sb_x0 (using its internal pad=80 offset)
        layer.alpha_composite(iris_layer, (sb_x0 - 80, quote_y + li * 26 - 80))

    # ─── FOOTER ──────────────────────────────────────────────────────
    foot_y = h - 56
    f_foot = ImageFont.truetype(F_MONO, 11)
    verdict_count = 1 if t >= click_t else 0
    d.text((42, foot_y + 14), f"{verdict_count} / 4 verdicts",
           font=f_foot, fill=MUTED)

    # BACK / CONTINUE buttons
    f_btn2 = ImageFont.truetype(F_MONO_B, 12)
    back_x0 = w // 2 + 40
    back_x1 = back_x0 + 120
    d.rectangle([back_x0, foot_y, back_x1, foot_y + 32],
                outline=INK, width=1)
    d.text(((back_x0 + back_x1) // 2, foot_y + 16),
           "← BACK", font=f_btn2, fill=INK, anchor="mm")
    cont_x0 = back_x1 + 16
    cont_x1 = cont_x0 + 150
    cont_active = t >= click_t + 0.6
    cont_fill = INK if cont_active else (190, 185, 178)
    d.rectangle([cont_x0, foot_y, cont_x1, foot_y + 32], fill=cont_fill)
    d.text(((cont_x0 + cont_x1) // 2, foot_y + 16),
           "CONTINUE →", font=f_btn2, fill=CREAM, anchor="mm")

    # Outer hairline
    d.rectangle([0, 0, w - 1, h - 1], outline=(210, 205, 198), width=1)
    return layer


# ─── Frame renderer ──────────────────────────────────────────────────

# Timing constants — single source of truth
T_TYPE1_START = 1.4
TYPE_FIRST = "(this is Leponeus..."
T_CC_START = 4.4
T_CC_PER = 0.75          # 12 * 0.75 = 9s
T_CC_END = T_CC_START + 12 * T_CC_PER  # 13.4
T_TYPE2_START = T_CC_END + 0.2  # 13.6
TYPE_SECOND_PREFIX = TYPE_FIRST  # carries forward
TYPE_SECOND_TAIL = ("he's your trusty sales career mascot. "
                    "no one cares about you more than Leponeus does.)")
T_AESDR_ZOOM = 18.6
T_SNEAK = 22.0
T_SNEAK_END = 24.4
T_LESSON_START = 24.4
T_LESSON_END = 38.0
T_ENDCARD = 38.0


def render(idx: int) -> Image.Image:
    t = idx / FPS
    bg = gradient_bg(t)

    # ─── 0–T_AESDR_ZOOM · MASCOT REVEAL + TYPING + CC LESSONS ────────
    if t < T_AESDR_ZOOM:
        # Mascot: enters from upper-left, scales 3.0 → 1.0 by 1.4s
        k_enter = ease_out(clamp(t / 1.4))
        scale = 3.0 - 2.0 * k_enter
        m = mascot("sprint", int(560 * max(1.0, scale)))
        dx = int(lerp(-260, 0, k_enter))
        dy = int(lerp(-180, 0, k_enter))
        paste_centered(bg, m, W * 0.50 + dx, H * 0.54 + dy)

        # Cream veil on entry
        if t < 1.0:
            veil = Image.new("RGBA", (W, H), CREAM + (int((1 - t / 1.0) * 110),))
            bg = Image.alpha_composite(bg, veil)

        # ─── Typed annotation (two-stage) ─────────────────────────
        # Stage 1: "(this is Leponeus..." types in, holds open
        # Stage 2 starts after CC reveal ends, continues with the tail
        f_ann = ImageFont.truetype(F_IT, 32)
        tx = W * 0.50
        ty = H * 0.84

        if t >= T_TYPE1_START:
            if t < T_TYPE2_START:
                shown = typed_substring(TYPE_FIRST, t, T_TYPE1_START,
                                        chars_per_s=10.0)
            else:
                tail_shown = typed_substring(
                    TYPE_SECOND_TAIL, t, T_TYPE2_START,
                    chars_per_s=18.0,
                )
                shown = TYPE_SECOND_PREFIX + " " + tail_shown
            # Blink a cursor caret while typing
            caret_on = (math.floor(t * 2.5) % 2) == 0
            display = shown + ("|" if caret_on else " ")
            # Wrap to two lines if needed (after CC + tail)
            f_probe = ImageDraw.Draw(bg)
            max_w = W * 0.78
            words = display.split(" ")
            line, lines = "", []
            for w_ in words:
                trial = (line + " " + w_).strip()
                if f_probe.textbbox((0, 0), trial, font=f_ann)[2] > max_w and line:
                    lines.append(line)
                    line = w_
                else:
                    line = trial
            if line:
                lines.append(line)
            for li, ln in enumerate(lines):
                text_centered(bg, ln, f_ann, MUTED,
                              tx, ty + li * 38 - (len(lines) - 1) * 19)

        # ─── Counterclockwise lesson reveal ──────────────────────
        if t >= T_CC_START:
            positions = cc_positions()
            for slot, lesson_idx in enumerate(CC_LESSON_ORDER):
                t_in = T_CC_START + slot * T_CC_PER
                t_out = t_in + T_CC_PER + 0.05  # crossfade with next
                # Last slot (Surviving & Thriving) holds — no fade-out
                if slot == len(CC_LESSON_ORDER) - 1:
                    a = fade(t, t_in, t_in + 0.35,
                             T_AESDR_ZOOM, T_AESDR_ZOOM + 0.6)
                else:
                    a = fade(t, t_in, t_in + 0.25,
                             t_out - 0.25, t_out)
                if a <= 0:
                    continue
                num, title, body = LESSONS[lesson_idx]
                angle, r_x, r_y = positions[slot]
                x = int(W * 0.5 + math.cos(angle) * (W * r_x))
                y = int(H * 0.5 + math.sin(angle) * (H * r_y))

                f_eb_l = ImageFont.truetype(F_MONO, 13)
                f_title = ImageFont.truetype(F_DISP_BI, 36)
                is_st = (lesson_idx == 2)  # Surviving & Thriving
                if is_st:
                    pulse = 0.88 + 0.12 * math.sin((t - t_in) * 3.5)
                    col_t = CRIMSON
                    a_title = a * pulse
                else:
                    col_t = INK
                    a_title = a * 0.92
                # Eyebrow
                tl_eb = text_layer(num, f_eb_l, MUTED, a * 0.85)
                paste_centered(bg, tl_eb, x, y - 28)
                # Title
                tl_t = text_layer(title, f_title, col_t, a_title)
                paste_centered(bg, tl_t, x, y + 8)

    # ─── Particles ───────────────────────────────────────────────────
    if 1.0 < t < T_LESSON_START - 0.4:
        pa = fade(t, 1.0, 2.0, T_LESSON_START - 1.6, T_LESSON_START - 0.4)
        if pa > 0:
            p = particles(t)
            bg.alpha_composite(with_alpha(p, pa))

    # ─── T_AESDR_ZOOM–T_SNEAK · AESDR ZOOM + S&T FOCUS ──────────────
    if T_AESDR_ZOOM <= t < T_SNEAK:
        # Mascot shrinks + drifts
        z_out = clamp((t - T_AESDR_ZOOM) / 1.6)
        m_scale = 1.0 * (1.0 - 0.85 * z_out)
        if m_scale > 0.08:
            m = mascot("sprint", max(40, int(560 * m_scale)))
            mx = int(W * 0.50 + 30 * z_out)
            my = int(H * 0.54 + 80 * z_out)
            paste_centered(bg, with_alpha(m, 1.0 - 0.9 * z_out), mx, my)

        # AESDR iris wordmark zooms in — capped at a size that always
        # leaves vertical margin so the glyphs are never clipped.
        z_in = clamp((t - (T_AESDR_ZOOM + 0.2)) / 1.6)
        z_in_e = ease_out(z_in)
        # Max font size 280 → layer height ~430 incl. iris_text pad
        f_size = max(20, int(40 + 240 * z_in_e))
        f_brand = ImageFont.truetype(F_DISP_BI, f_size)
        wm = iris_text("AESDR", f_brand, t * 0.20,
                       alpha=clamp(z_in * 2.0))
        # Center slightly above midline so S&T can sit beneath
        paste_centered(bg, wm, W * 0.50, H * 0.44)

        # Surviving & Thriving in crimson pulled to the spotlight
        pull = ease_out(clamp((t - (T_AESDR_ZOOM + 0.1)) / 1.3))
        f_st = ImageFont.truetype(F_DISP_BI, int(44 + 22 * pull))
        a_st = 1.0
        pulse = 0.92 + 0.08 * math.sin(t * 3.0)
        tl = text_layer("Surviving & Thriving", f_st, CRIMSON, a_st * pulse)
        paste_centered(bg, tl, W * 0.50, H * 0.66)

    # ─── T_SNEAK–T_SNEAK_END · "Here's a sneak peek." ───────────────
    if T_SNEAK <= t < T_SNEAK_END:
        # Keep the AESDR brand sitting in the upper half through this beat
        f_brand_s = ImageFont.truetype(F_DISP_BI, 240)
        wm_s = iris_text("AESDR", f_brand_s, t * 0.20)
        paste_centered(bg, with_alpha(wm_s, 0.65), W * 0.50, H * 0.32)

        # Hand-written sneak peek line types in
        f_sneak = ImageFont.truetype(F_IT, 64)
        shown = typed_substring("Here's a sneak peek.",
                                t, T_SNEAK, chars_per_s=11.0)
        caret_on = (math.floor(t * 2.5) % 2) == 0
        text_centered(bg, shown + ("|" if caret_on else ""),
                      f_sneak, INK, W * 0.50, H * 0.56, 1.0)

        # Quick flash just before the hard cut
        if t > T_SNEAK_END - 0.2:
            flash_a = clamp((t - (T_SNEAK_END - 0.2)) / 0.2) * 0.55
            veil = Image.new("RGBA", (W, H), CREAM + (int(255 * flash_a),))
            bg = Image.alpha_composite(bg, veil)

    # ─── T_LESSON_START–T_LESSON_END · COURSE SCREEN ────────────────
    if T_LESSON_START <= t < T_LESSON_END:
        # Hard-cut wash to cream behind the lesson card
        veil = Image.new("RGBA", (W, H), CREAM + (255,))
        bg = Image.alpha_composite(bg, veil)
        lt = t - T_LESSON_START
        click_t = 5.0
        lesson_w = 1860
        lesson_h = 1020
        screen = render_course_screen(lesson_w, lesson_h, lt,
                                      click_t=click_t)
        # Settle-in zoom (tiny)
        z = 1.02 - 0.02 * ease_out(clamp(lt / 1.0))
        zw = int(lesson_w * z)
        zh = int(lesson_h * z)
        screen_z = screen.resize((zw, zh), Image.LANCZOS)
        # Outgoing fade for the crossfade into the end card
        out_a = fade(t, T_LESSON_START, T_LESSON_START + 0.6,
                     T_LESSON_END - 0.8, T_LESSON_END)
        paste_centered(bg, with_alpha(screen_z, out_a), W * 0.50, H * 0.50)

    # ─── T_ENDCARD–45 · MERGED END CARD ──────────────────────────────
    if t >= T_ENDCARD:
        a = fade(t, T_ENDCARD, T_ENDCARD + 0.9, 44.2, 45.0)
        if a > 0:
            veil = Image.new("RGBA", (W, H), CREAM + (int(255 * a),))
            bg = Image.alpha_composite(bg, veil)
            # Big AESDR iris wordmark — sized so the layer fits the frame
            # vertically with room to spare (font 260 → layer ~430px tall).
            f_brand = ImageFont.truetype(F_DISP_BI, 260)
            wm = iris_text("AESDR", f_brand, t * 0.20)
            paste_centered(bg, with_alpha(wm, a), W * 0.50, H * 0.38)
            # "Change your life." — italic serif
            f_cta = ImageFont.truetype(F_IT, 54)
            text_centered(bg, "Change your life.", f_cta,
                          INK, W * 0.50, H * 0.60, a)
            # New tagline — section-grey mono, two lines
            f_tag = ImageFont.truetype(F_MONO, 22)
            tag_lines = [
                "SEED TO SERIES E AI-FIRST PRODUCTS.",
                "BUILT WITH FEEDBACK FROM THEIR FOUNDERS, SALES LEADERS,",
                "AES & SDRS — AT EVERY ONE.",
            ]
            for li, ln in enumerate(tag_lines):
                text_centered(bg, ln, f_tag, MUTED,
                              W * 0.50, H * 0.72 + li * 32, a)

    # ─── Cinematic post — no letterbox bars ──────────────────────────
    bg = apply_cinema(bg, idx, t,
                      leak=True, leak_color=(255, 175, 110),
                      letterbox_bars=False)
    return bg


def main():
    tmp = tempfile.mkdtemp(prefix="mockup-c45v3-")
    print(f"[C] rendering {N} frames → {tmp}")
    for i in range(N):
        if i % 60 == 0:
            print(f"  {i}/{N} ({i / N * 100:.0f}%)")
        f = render(i)
        f.convert("RGB").save(os.path.join(tmp, f"f-{i:05d}.png"), "PNG")
    out = ROOT / "scripts/demo/out/mockups/mockup-c.mp4"
    out.parent.mkdir(parents=True, exist_ok=True)
    print(f"[C] encoding → {out}")
    subprocess.check_call([
        "ffmpeg", "-y",
        "-framerate", str(FPS),
        "-i", os.path.join(tmp, "f-%05d.png"),
        "-c:v", "libx264", "-crf", "19", "-preset", "medium",
        "-pix_fmt", "yuv420p", "-movflags", "+faststart",
        str(out),
    ])
    print(f"[C] done → {out}")


if __name__ == "__main__":
    main()
