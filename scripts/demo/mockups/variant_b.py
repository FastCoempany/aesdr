"""
Mockup B — 45s tactical commercial. "The Brief" cut.

Visual vocabulary: dossier opening, terminal diagnostic, hard cuts to
faux lesson UI, BANT picker in motion, crimson slam, validated logos
as evidence index. Letterboxed 2.39:1, light leaks dim, grain heavier.
Course teases: 12 lesson card flashes, lesson header, BANT interactive,
journey dashboard row reveal.
"""

import math
import os
import random
import subprocess
import tempfile
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

from _common import (
    W, H, FPS, DURATION, N,
    CREAM, INK, CRIMSON, MUTED, LIGHT, WARM_BONE,
    F_DISP_BI, F_DISP_BL, F_IT, F_BODY, F_BODY_B, F_MONO, F_MONO_B,
    LESSONS, VALIDATED,
    clamp, ease_io, ease_in, ease_out, fade, lerp, iris_color,
    mascot, with_alpha,
    paste_centered, text_layer, text_centered, iris_text,
    render_lesson_card, render_dashboard_row, render_lesson_header,
    render_bant_pick, render_validated_strip,
    apply_cinema, letterbox, film_grain, vignette,
)

ROOT = Path(__file__).resolve().parents[3]


def add_scanlines(img, strength=0.08, seed=0):
    arr = np.array(img).astype(np.float32)
    pattern = np.ones(H) - strength * (np.arange(H) % 2)
    arr[..., :3] *= pattern[:, None, None]
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), "RGBA")


def render(idx: int) -> Image.Image:
    t = idx / FPS

    # Background palette flips on hard cuts: terminal black → cream
    in_term = t < 7.6
    in_slam = 27.8 < t < 28.6
    if in_slam:
        bg_color = CRIMSON
    elif in_term:
        bg_color = (12, 12, 14)
    else:
        bg_color = CREAM
    bg = Image.new("RGBA", (W, H), bg_color + (255,))
    d = ImageDraw.Draw(bg)

    # ─── 0–7s · TERMINAL DIAGNOSTIC ───
    if t < 7.7:
        # Chrome
        d.rectangle([0, 0, W, 56], fill=(36, 36, 40))
        f_mono_sm = ImageFont.truetype(F_MONO, 22)
        d.text((28, 16), "diagnose.sh", font=f_mono_sm, fill=(170, 170, 168))
        d.text((W - 28, 16), "AESDR · CASE FILE",
               font=f_mono_sm, fill=(150, 150, 150), anchor="rt")

        f_mono = ImageFont.truetype(F_MONO, 34)
        f_mono_b = ImageFont.truetype(F_MONO_B, 34)
        rows = [
            (0.3,  0.04,  "> diagnosing week 47…",                (180, 180, 170), f_mono),
            (1.5,  0.035, "> dials made           = 47",          (220, 220, 215), f_mono),
            (2.5,  0.035, "> connects             = 3",           (220, 220, 215), f_mono),
            (3.5,  0.035, "> meetings booked      = 0",           (220, 100, 100), f_mono_b),
            (4.5,  0.035, "> linkedin replies     = \"thanks!\"",  (180, 180, 170), f_mono),
            (5.6,  0.030, "> diagnosis: you need a map.",         (220, 100, 100), f_mono_b),
        ]
        y = 140
        for t_in, cdur, raw, col, fnt in rows:
            if t < t_in:
                y += 64
                continue
            n_chars = int((t - t_in) / cdur)
            shown = raw[:max(0, n_chars)]
            d.text((90, y), shown, font=fnt, fill=col)
            if len(shown) < len(raw):
                bbox = d.textbbox((90, y), shown, font=fnt, anchor="lt")
                d.rectangle([bbox[2] + 4, y + 4, bbox[2] + 18, y + 42], fill=col)
            y += 64

    # ─── 7.6–8.4s · HARD CUT FLASH + CASE FILE ───
    if 7.5 < t < 9.6:
        a_flash = fade(t, 7.5, 7.65, 7.85, 8.1)
        if a_flash > 0:
            flash = Image.new("RGBA", (W, H), CREAM + (int(255 * a_flash),))
            bg = Image.alpha_composite(bg, flash)
            d = ImageDraw.Draw(bg)
        a = fade(t, 7.9, 8.4, 9.0, 9.6)
        if a > 0:
            f_eb = ImageFont.truetype(F_MONO_B, 22)
            text_centered(bg, "CASE 03  ·  LESSON FILE OPEN", f_eb,
                          CRIMSON, W * 0.50, H * 0.36, a)
            f_t = ImageFont.truetype(F_DISP_BL, 144)
            text_centered(bg, "SURVIVING & THRIVING", f_t,
                          INK, W * 0.50, H * 0.50, a)
            f_b = ImageFont.truetype(F_IT, 34)
            text_centered(bg, "\"Nobody is coming to save you.\"", f_b,
                          MUTED, W * 0.50, H * 0.62, a)

    # ─── 9.5–20s · TWELVE-LESSON RAPID-FIRE ───
    if 9.4 < t < 20.5:
        # tile a wall: 3 cols × 4 rows
        a_wall = fade(t, 9.4, 10.2, 19.6, 20.5)
        if a_wall > 0:
            cw, ch = 520, 220
            gap = 24
            grid_w = cw * 3 + gap * 2
            grid_h = ch * 4 + gap * 3
            x0 = (W - grid_w) // 2
            y0 = (H - grid_h) // 2 + 10
            for i, (num, title, body) in enumerate(LESSONS):
                r = i // 3
                c = i % 3
                cx = x0 + c * (cw + gap)
                cy = y0 + r * (ch + gap)
                # stagger appearance
                t_in = 10.2 + i * 0.18
                a = fade(t, t_in, t_in + 0.55, 19.2, 20.0) * a_wall
                if a > 0:
                    # mini card
                    card = Image.new("RGBA", (cw, ch), (255, 255, 255, 255))
                    cd = ImageDraw.Draw(card)
                    cd.rectangle([0, 0, cw - 1, ch - 1], outline=(180, 175, 168), width=1)
                    # iris hairline
                    for x in range(cw):
                        u = (x / cw + t * 0.2) % 1.0
                        cd.line([(x, 0), (x, 3)], fill=iris_color(u))
                    f_n = ImageFont.truetype(F_DISP_BI, 58)
                    cd.text((20, 12), num, font=f_n, fill=INK)
                    f_eb = ImageFont.truetype(F_MONO, 14)
                    cd.text((20, 96), "LESSON", font=f_eb, fill=MUTED)
                    f_t = ImageFont.truetype(F_DISP_BI, 30)
                    cd.text((20, 120), title, font=f_t, fill=INK)
                    f_b = ImageFont.truetype(F_BODY, 16)
                    cd.text((20, 168), body[:54], font=f_b, fill=(100, 95, 88))
                    bg.alpha_composite(with_alpha(card, a), (cx, cy))

            # heading
            a_h = fade(t, 10.0, 11.0, 19.4, 20.2)
            f_eb = ImageFont.truetype(F_MONO, 16)
            text_centered(bg, "THE FULL FILE  ·  TWELVE LESSONS",
                          f_eb, MUTED, W * 0.50, 76, a_h)

    # ─── 20–28s · BANT EXERCISE LIVE ───
    if 20.0 < t < 28.5:
        a = fade(t, 20.0, 21.0, 27.4, 28.5)
        if a > 0:
            head = render_lesson_header(w=1700, t_phase=t * 0.18)
            paste_centered(bg, with_alpha(head, a), W * 0.50, H * 0.10)
            f_eb = ImageFont.truetype(F_MONO, 14)
            text_centered(bg, "SECTION 03  ·  SUBJECT-LINE VERDICTS",
                          f_eb, CRIMSON, W * 0.50, H * 0.20, a)
            f_h = ImageFont.truetype(F_DISP_BL, 64)
            text_centered(bg, "Which of these earns a reply?",
                          f_h, INK, W * 0.50, H * 0.28, a)
            # picker — flashing through choices: pick index 0, then 2
            picked = -1
            if t > 22.5:
                picked = 0
            if t > 24.5:
                picked = 2
            if t > 26.5:
                picked = 3
            bant = render_bant_pick(w=1500, picked_idx=picked)
            paste_centered(bg, with_alpha(bant, a), W * 0.50, H * 0.62)
            # commentary line
            f_c = ImageFont.truetype(F_IT, 26)
            if picked >= 0:
                msg = ["Tight. Specific. Persona-led.",
                       "Generic. Delete.",
                       "Trigger-led. Reads as personal.",
                       "Results-led. Wrong audience."][picked]
                text_centered(bg, f"— {msg}", f_c, MUTED,
                              W * 0.50, H * 0.92, a)

    # ─── 28–32s · CRIMSON SLAM TRANSITION → BRAND ───
    if 27.7 < t < 33.0:
        a = fade(t, 27.7, 27.9, 32.0, 33.0)
        # red wash
        if 27.8 < t < 28.6:
            wash = Image.new("RGBA", (W, H), CRIMSON + (int(255 * a), ))
            bg = Image.alpha_composite(bg, wash)
        # AESDR iris brand
        a_brand = fade(t, 28.4, 29.2, 32.0, 33.0)
        if a_brand > 0:
            f_brand = ImageFont.truetype(F_DISP_BI, 360)
            wm = iris_text("AESDR", f_brand, t * 0.22)
            paste_centered(bg, with_alpha(wm, a_brand), W * 0.50, H * 0.46)
            f_tag = ImageFont.truetype(F_MONO_B, 24)
            text_centered(bg, "/  THE FIELD MANUAL FOR SURVIVING SALES.  /",
                          f_tag, MUTED, W * 0.50, H * 0.66, a_brand)

    # ─── 33–40s · JOURNEY DASHBOARD CLOSE ───
    if 33.0 < t < 41.0:
        a = fade(t, 33.0, 34.0, 40.0, 40.8)
        if a > 0:
            # heading
            f_eb = ImageFont.truetype(F_MONO, 16)
            text_centered(bg, "THE JOURNEY", f_eb, MUTED, W * 0.5, H * 0.13, a)
            f_h = ImageFont.truetype(F_DISP_BL, 96)
            text_centered(bg, "6 down. 6 to go.", f_h, INK, W * 0.5, H * 0.21, a)
            # mascot left
            m = mascot("verdict", 240)
            paste_centered(bg, with_alpha(m, a), W * 0.18, H * 0.45)
            # 6 rows of journey
            for i, (num, title, body) in enumerate(LESSONS[2:8]):
                t_in = 34.0 + i * 0.18
                row_a = fade(t, t_in, t_in + 0.5, 39.4, 40.4) * a
                if row_a > 0:
                    row = render_dashboard_row(num, title, body,
                                               completed=i < 4, w=1100)
                    bg.alpha_composite(with_alpha(row, row_a),
                                       (int(W * 0.32), int(H * 0.32) + i * 80))

    # ─── 40–45s · CTA & VALIDATED-BY ───
    if t > 40.0:
        a = fade(t, 40.0, 41.0, 44.4, 45.0)
        if a > 0:
            f_cta_eb = ImageFont.truetype(F_MONO_B, 22)
            text_centered(bg, "READ THE FILE.", f_cta_eb, CRIMSON,
                          W * 0.5, H * 0.36, a)
            f_cta = ImageFont.truetype(F_DISP_BL, 96)
            text_centered(bg, "aesdr.com", f_cta, INK, W * 0.5, H * 0.50, a)
            strip = render_validated_strip(alpha=a, w=W - 200, t_phase=t * 0.3)
            paste_centered(bg, strip, W * 0.50, H * 0.80)

    # Scanlines on the terminal section
    if t < 7.6:
        bg = add_scanlines(bg, strength=0.06)
    bg = apply_cinema(bg, idx, t, leak=t > 7.7, leak_color=(220, 130, 100))
    return bg


def main():
    tmp = tempfile.mkdtemp(prefix="mockup-b45-")
    print(f"[B] rendering {N} frames → {tmp}")
    for i in range(N):
        if i % 60 == 0:
            print(f"  {i}/{N} ({i / N * 100:.0f}%)")
        f = render(i)
        f.convert("RGB").save(os.path.join(tmp, f"f-{i:05d}.png"), "PNG")
    out = ROOT / "scripts/demo/out/mockups/mockup-b.mp4"
    out.parent.mkdir(parents=True, exist_ok=True)
    print(f"[B] encoding → {out}")
    subprocess.check_call([
        "ffmpeg", "-y",
        "-framerate", str(FPS),
        "-i", os.path.join(tmp, "f-%05d.png"),
        "-c:v", "libx264", "-crf", "19", "-preset", "medium",
        "-pix_fmt", "yuv420p", "-movflags", "+faststart",
        str(out),
    ])
    print(f"[B] done → {out}")


if __name__ == "__main__":
    main()
