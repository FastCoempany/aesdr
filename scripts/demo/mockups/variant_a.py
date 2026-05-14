"""
Mockup A — 45s editorial commercial. "Field Manual" cut.

Visual vocabulary: cream + ink, Playfair italic, slow push-ins,
hand-annotated marginalia, lesson cards laid out like book chapters.
Letterboxed 2.39:1. Course teases: lesson card fan, journey/dashboard
view, in-lesson sort-into-silos interactive, validated logos strip.
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
    LESSONS, VALIDATED,
    clamp, ease_io, ease_in, ease_out, fade, lerp, iris_color,
    mascot, with_alpha,
    paste_centered, text_layer, text_centered, iris_text,
    render_lesson_card, render_dashboard_row, render_journey_header,
    render_lesson_header, render_silo_dragdrop, render_validated_strip,
    apply_cinema, letterbox,
)

ROOT = Path(__file__).resolve().parents[3]


def render(idx: int) -> Image.Image:
    t = idx / FPS
    bg = Image.new("RGBA", (W, H), CREAM + (255,))
    d = ImageDraw.Draw(bg)

    # ─── 0–8s · OPENER ─ Mascot at rest, push-in, voice ─
    if t < 9.0:
        a_m = fade(t, 0.2, 1.8, 6.6, 8.5)
        if a_m > 0:
            scale = 1.0 + 0.18 * ease_out(clamp((t - 0.2) / 8.0))
            m = mascot("rest", int(540 * scale))
            paste_centered(bg, with_alpha(m, a_m), W * 0.50, H * 0.46 - 40)

        f_lead = ImageFont.truetype(F_DISP_BI, 92)
        a1 = fade(t, 1.4, 2.4, 4.0, 4.8)
        if a1 > 0:
            text_centered(bg, "Five years selling.", f_lead, INK, W * 0.5, H * 0.78, a1)
        a2 = fade(t, 4.3, 5.2, 7.2, 8.0)
        if a2 > 0:
            text_centered(bg, "No mentor. No map.", f_lead, INK, W * 0.5, H * 0.78, a2)

        # tiny field-note annotation top right
        a_ann = fade(t, 2.2, 3.4, 7.0, 8.0)
        if a_ann > 0:
            f_ann = ImageFont.truetype(F_IT, 28)
            text_centered(bg, "— field notes, week 47", f_ann, MUTED,
                          W * 0.78, H * 0.20, a_ann * 0.85)

    # ─── 8–20s · LESSON CARD FAN ─ chapters laid out like a book ─
    if 8.0 < t < 21.0:
        # banner
        a_ban = fade(t, 8.0, 9.0, 19.5, 20.5)
        if a_ban > 0:
            f_eb = ImageFont.truetype(F_MONO, 16)
            text_centered(bg, "TWELVE LESSONS", f_eb,
                          MUTED, W * 0.50, H * 0.16, a_ban)
            f_ttl = ImageFont.truetype(F_DISP_BL, 64)
            text_centered(bg, "The field manual nobody handed you.", f_ttl,
                          INK, W * 0.50, H * 0.24, a_ban)

        # cards: 5 visible at staggered angles + positions
        showcase = [LESSONS[0], LESSONS[2], LESSONS[4], LESSONS[6], LESSONS[11]]
        positions = [(-0.34, 0.13, -6), (-0.17, 0.06, -2),
                     (0.00, 0.02, 0), (0.18, 0.06, 3), (0.34, 0.13, 7)]
        for i, ((num, title, body), (dx, dy, rot)) in enumerate(zip(showcase, positions)):
            t_in = 9.2 + i * 0.55
            a = fade(t, t_in, t_in + 0.8, 17.6, 19.2)
            if a > 0:
                # subtle float
                fl_y = math.sin((t - t_in) * 1.0) * 4
                card = render_lesson_card(num, title, body, w=400, h=300,
                                          iris_phase=t * 0.18)
                card = card.rotate(rot * (1.0 - (t - t_in - 1.0) * 0.05),
                                   resample=Image.BICUBIC, expand=True)
                cx = int(W * 0.50 + W * dx)
                cy = int(H * 0.58 + H * dy + fl_y)
                paste_centered(bg, with_alpha(card, a), cx, cy)

        # mascot perched on the center card
        a_m = fade(t, 11.0, 11.8, 17.6, 19.2)
        if a_m > 0:
            mm = mascot("rest", 170)
            paste_centered(bg, with_alpha(mm, a_m), W * 0.50, H * 0.40)

        # hand-annotation arrow pointing at lesson 03
        a_pt = fade(t, 13.5, 14.4, 17.6, 19.2)
        if a_pt > 0:
            f_h = ImageFont.truetype(F_IT, 32)
            text_centered(bg, "the one you'll dog-ear", f_h, CRIMSON,
                          W * 0.20, H * 0.84, a_pt)
            # squiggle arrow
            for k in range(28):
                u = k / 28
                ax = int(W * 0.22 + u * (W * 0.10) + math.sin(u * 5) * 4)
                ay = int(H * 0.81 - u * (H * 0.10) + math.cos(u * 4) * 3)
                d.ellipse([ax - 2, ay - 2, ax + 2, ay + 2],
                          fill=CRIMSON + (int(220 * a_pt),))

    # ─── 20–28s · JOURNEY VIEW ─ dashboard mock ─
    if 20.0 < t < 29.5:
        a_j = fade(t, 20.0, 21.2, 28.0, 29.5)
        if a_j > 0:
            # header
            head = render_journey_header()
            paste_centered(bg, with_alpha(head, a_j), W * 0.50, H * 0.22)
            # 6 completed rows + 6 pending fading in staggered
            for i, (num, title, body) in enumerate(LESSONS[:8]):
                t_in = 21.0 + i * 0.20
                row_a = fade(t, t_in, t_in + 0.5, 27.6, 28.8) * a_j
                if row_a > 0:
                    row = render_dashboard_row(num, title, body,
                                               completed=i < 6, w=1100)
                    bg.alpha_composite(with_alpha(row, row_a),
                                       (int(W * 0.5 - 550), int(H * 0.36) + i * 70))
            # column rule
            d.line([(int(W * 0.5 - 540), int(H * 0.34)),
                    (int(W * 0.5 - 540), int(H * 0.34) + 8 * 70)],
                   fill=(220, 215, 208), width=2)

    # ─── 28–36s · IN-LESSON SORT ─ silo drag/drop on lesson header ─
    if 28.0 < t < 37.0:
        a_l = fade(t, 28.0, 29.2, 35.6, 36.8)
        if a_l > 0:
            # lesson header at top
            head = render_lesson_header(w=1700, t_phase=t * 0.18)
            paste_centered(bg, with_alpha(head, a_l), W * 0.50, H * 0.13)
            # section eyebrow + headline
            f_eb = ImageFont.truetype(F_MONO, 14)
            f_h = ImageFont.truetype(F_DISP_BL, 64)
            text_centered(bg, "SECTION 02 · SORTING THE BACKLOG", f_eb,
                          CRIMSON, W * 0.50, H * 0.27, a_l)
            text_centered(bg, "Which playbooks survive contact?", f_h,
                          INK, W * 0.50, H * 0.36, a_l)
            # the interactive
            silo = render_silo_dragdrop(w=1400, t=t - 28.5)
            paste_centered(bg, with_alpha(silo, a_l), W * 0.50, H * 0.65)

    # ─── 36–42s · BRAND REVEAL ─ AESDR iris + validated by ─
    if 36.5 < t < 42.5:
        a = fade(t, 36.5, 37.6, 41.4, 42.5)
        if a > 0:
            f_brand = ImageFont.truetype(F_DISP_BI, 320)
            wm = iris_text("AESDR", f_brand, t * 0.18)
            paste_centered(bg, with_alpha(wm, a), W * 0.50, H * 0.45)
            f_tag = ImageFont.truetype(F_IT, 38)
            text_centered(bg, "The playbook nobody handed you.", f_tag,
                          MUTED, W * 0.50, H * 0.62, a)
            strip = render_validated_strip(alpha=a, w=W - 200, t_phase=t * 0.3)
            paste_centered(bg, strip, W * 0.50, H * 0.80)

    # ─── 42–45s · CTA ─
    if t > 42.0:
        a = fade(t, 42.0, 42.7, 44.4, 45.0)
        if a > 0:
            # cream-on-cream calm
            f_cta = ImageFont.truetype(F_DISP_BL, 64)
            text_centered(bg, "Twelve lessons.", f_cta, INK, W * 0.5, H * 0.40, a)
            text_centered(bg, "One field manual.", f_cta, CRIMSON, W * 0.5, H * 0.48, a)
            f_url = ImageFont.truetype(F_MONO, 24)
            text_centered(bg, "aesdr.com", f_url, MUTED, W * 0.5, H * 0.62, a)

    bg = apply_cinema(bg, idx, t, leak=True, leak_color=(255, 170, 100))
    return bg


def main():
    tmp = tempfile.mkdtemp(prefix="mockup-a45-")
    print(f"[A] rendering {N} frames → {tmp}")
    for i in range(N):
        if i % 60 == 0:
            print(f"  {i}/{N} ({i / N * 100:.0f}%)")
        f = render(i)
        f.convert("RGB").save(os.path.join(tmp, f"f-{i:05d}.png"), "PNG")
    out = ROOT / "scripts/demo/out/mockups/mockup-a.mp4"
    out.parent.mkdir(parents=True, exist_ok=True)
    print(f"[A] encoding → {out}")
    subprocess.check_call([
        "ffmpeg", "-y",
        "-framerate", str(FPS),
        "-i", os.path.join(tmp, "f-%05d.png"),
        "-c:v", "libx264", "-crf", "19", "-preset", "medium",
        "-pix_fmt", "yuv420p", "-movflags", "+faststart",
        str(out),
    ])
    print(f"[A] done → {out}")


if __name__ == "__main__":
    main()
