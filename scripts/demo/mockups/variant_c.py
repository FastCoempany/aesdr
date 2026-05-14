"""
Mockup C — 45s atmospheric commercial. "Pilgrimage" cut.

Visual vocabulary: extreme close-up of the mascot, slow constellation
reveal of all 12 lessons orbiting it, dolly through a faux lesson
interior with section progress + sequence puzzle interactive, iris
sweep, hushed CTA. Letterboxed 2.39:1 with warm light leaks.
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
    LESSONS, VALIDATED, IRIS,
    clamp, ease_io, ease_in, ease_out, fade, lerp, iris_color,
    mascot, with_alpha,
    paste_centered, text_layer, text_centered, iris_text,
    render_lesson_card, render_dashboard_row, render_lesson_header,
    render_silo_dragdrop, render_validated_strip,
    apply_cinema, vignette, film_grain,
)

ROOT = Path(__file__).resolve().parents[3]


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


def constellation_positions():
    """12 lesson titles arranged in a loose orbit around the mascot."""
    # angles + radii relative to center
    out = []
    for i in range(12):
        angle = -math.pi / 2 + (i / 12) * 2 * math.pi
        r_x = 0.34 + 0.04 * math.sin(i * 1.7)
        r_y = 0.30 + 0.03 * math.cos(i * 1.3)
        out.append((angle, r_x, r_y))
    return out


def iris_sweep(t, t0, t1):
    band_w = int(W * 0.42)
    k = clamp((t - t0) / max(1e-3, t1 - t0))
    x_center = int(-band_w + (W + band_w * 2) * ease_io(k))
    arr = np.zeros((H, W, 4), dtype=np.uint8)
    for x in range(max(0, x_center - band_w), min(W, x_center + band_w)):
        dist = (x - x_center) / band_w
        u = (x / W + t * 0.15) % 1.0
        c = iris_color(u)
        a = int(170 * (1 - dist * dist))
        arr[:, x, 0] = c[0]
        arr[:, x, 1] = c[1]
        arr[:, x, 2] = c[2]
        arr[:, x, 3] = a
    return Image.fromarray(arr, "RGBA")


def render(idx: int) -> Image.Image:
    t = idx / FPS
    bg = gradient_bg(t)

    # ─── 0–9s · CLOSE-UP, SLOW PULLBACK ───
    if t < 12.0:
        # mascot scale: 3.2x → 1.2x by 9s, holds
        scale = 3.2 - 2.0 * ease_out(clamp(t / 9.0))
        m = mascot("sprint", int(680 * max(1.0, scale)))
        # eye-level offset that drifts back to center
        k = ease_out(clamp(t / 9.0))
        dx = int(lerp(-260, 0, k))
        dy = int(lerp(-220, 0, k))
        paste_centered(bg, m, W * 0.50 + dx, H * 0.50 + dy)
        # opacity hint at t=0
        if t < 1.5:
            veil = Image.new("RGBA", (W, H), CREAM + (int((1 - t / 1.5) * 100),))
            bg = Image.alpha_composite(bg, veil)
        # Caveat-style annotation
        a_ann = fade(t, 4.0, 5.0, 9.0, 10.0)
        if a_ann > 0:
            f = ImageFont.truetype(F_IT, 36)
            text_centered(bg, "(this is Leponeus.)", f,
                          MUTED, W * 0.68, H * 0.72, a_ann)

    # ─── 6–22s · CONSTELLATION REVEAL ───
    if 6.0 < t < 23.5:
        positions = constellation_positions()
        for i, (angle, r_x, r_y) in enumerate(positions):
            t_in = 6.0 + i * 0.6
            a = fade(t, t_in, t_in + 0.9, 22.0, 23.5)
            if a > 0:
                num, title, body = LESSONS[i]
                f_eb = ImageFont.truetype(F_MONO, 13)
                f_t = ImageFont.truetype(F_DISP_BI, 32)
                x = int(W * 0.5 + math.cos(angle) * (W * r_x))
                y = int(H * 0.5 + math.sin(angle) * (H * r_y))
                # tiny floating offset
                fy = math.sin(t * 0.5 + i) * 4
                # eyebrow
                tl_eb = text_layer(f"{num}", f_eb, MUTED, a * 0.85)
                paste_centered(bg, tl_eb, x, y - 24 + int(fy))
                # title
                # pulse on lesson 3
                if i == 2 and t > 12.0:
                    pulse = 0.86 + 0.14 * math.sin((t - 12.0) * 4.0)
                    col = CRIMSON
                    aa = a * pulse
                else:
                    col = INK
                    aa = a * 0.92
                tl_t = text_layer(title, f_t, col, aa)
                paste_centered(bg, tl_t, x, y + 8 + int(fy))

    # ─── particles always ───
    if 1.0 < t < 32.0:
        pa = fade(t, 1.0, 2.0, 30.0, 32.0)
        p = particles(t)
        bg.alpha_composite(with_alpha(p, pa))

    # ─── 23–34s · DOLLY INTO A LESSON ───
    if 22.5 < t < 35.0:
        a = fade(t, 22.5, 23.6, 33.6, 35.0)
        if a > 0:
            # wash to cream
            wash_a = fade(t, 22.5, 23.4, 34.0, 35.0)
            if wash_a > 0:
                veil = Image.new("RGBA", (W, H), CREAM + (int(255 * wash_a),))
                bg = Image.alpha_composite(bg, veil)
            # lesson header
            head = render_lesson_header(w=1700, t_phase=t * 0.18)
            paste_centered(bg, with_alpha(head, a), W * 0.50, H * 0.11)
            # eyebrow + headline
            f_eb = ImageFont.truetype(F_MONO, 14)
            text_centered(bg, "LESSON 03  ·  SECTION 02  ·  SEQUENCE",
                          f_eb, CRIMSON, W * 0.50, H * 0.20, a)
            f_h = ImageFont.truetype(F_DISP_BL, 64)
            text_centered(bg, "Order them. Then defend it.",
                          f_h, INK, W * 0.50, H * 0.28, a)
            # sequence puzzle mock — three steps reveal as t advances
            steps = [
                ("01", "Ground the trigger.",        "What signal earns the call."),
                ("02", "Map the persona's stake.",   "What they lose if they ignore you."),
                ("03", "Make the ask tiny.",         "One question. One outcome."),
            ]
            for i, (n, title, sub) in enumerate(steps):
                t_in = 25.5 + i * 1.5
                row_a = fade(t, t_in, t_in + 0.7, 33.4, 34.6) * a
                if row_a > 0:
                    row = Image.new("RGBA", (1300, 110), (255, 255, 255, 255))
                    rd = ImageDraw.Draw(row)
                    rd.rectangle([0, 0, 1299, 109], outline=(180, 175, 168), width=1)
                    # iris hairline
                    for x in range(1300):
                        u = (x / 1300 + t * 0.2) % 1.0
                        rd.line([(x, 0), (x, 2)], fill=iris_color(u))
                    f_n = ImageFont.truetype(F_DISP_BI, 44)
                    rd.text((28, 16), n, font=f_n, fill=INK)
                    f_t = ImageFont.truetype(F_DISP_BI, 30)
                    rd.text((108, 24), title, font=f_t, fill=INK)
                    f_s = ImageFont.truetype(F_BODY, 18)
                    rd.text((108, 66), sub, font=f_s, fill=(110, 105, 95))
                    # done badge for first two
                    if i < 2 and t > t_in + 1.2:
                        ba = clamp((t - (t_in + 1.2)) / 0.5)
                        rd.rectangle([1180, 32, 1260, 76], fill=CRIMSON + (int(255 * ba),))
                        f_bb = ImageFont.truetype(F_MONO_B, 14)
                        rd.text((1220, 54), "DONE ✓", font=f_bb,
                                fill=CREAM, anchor="mm")
                    bg.alpha_composite(with_alpha(row, row_a),
                                       (int(W * 0.5 - 650), int(H * 0.42) + i * 130))

    # ─── 34–38s · PULL BACK TO JOURNEY ───
    if 34.5 < t < 39.2:
        a = fade(t, 34.5, 35.4, 38.4, 39.2)
        if a > 0:
            # cream wash
            wash = Image.new("RGBA", (W, H), CREAM + (int(255 * a),))
            bg = Image.alpha_composite(bg, wash)
            # mascot left
            m = mascot("rest", 230)
            paste_centered(bg, with_alpha(m, a), W * 0.17, H * 0.42)
            # journey heading
            f_eb = ImageFont.truetype(F_MONO, 16)
            text_centered(bg, "THE JOURNEY", f_eb, MUTED,
                          W * 0.45, H * 0.30, a)
            f_h = ImageFont.truetype(F_DISP_BL, 96)
            text_centered(bg, "Twelve lessons.", f_h, INK,
                          W * 0.45, H * 0.42, a)
            text_centered(bg, "One you'll keep.", f_h, CRIMSON,
                          W * 0.45, H * 0.54, a)
            # peripheral rows blurred (faux blur via tiny offsets)
            for i, (num, title, body) in enumerate(LESSONS[3:8]):
                row_a = a * 0.40
                row = render_dashboard_row(num, title, body,
                                           completed=i < 2, w=900)
                # blur effect
                row = row.filter(ImageFilter.GaussianBlur(radius=2))
                bg.alpha_composite(with_alpha(row, row_a),
                                   (int(W * 0.62), int(H * 0.34) + i * 70))

    # ─── 38–42s · IRIS SWEEP + AESDR ───
    if 38.5 < t < 43.0:
        sweep = iris_sweep(t, 38.5, 40.5)
        sa = np.array(sweep)
        s_alpha = fade(t, 38.5, 39.0, 40.0, 40.6) * 0.6
        sa[..., 3] = (sa[..., 3] * s_alpha).astype(np.uint8)
        bg.alpha_composite(Image.fromarray(sa, "RGBA"))
        # wash to cream
        wash_a = fade(t, 39.5, 40.2, 42.4, 43.0)
        if wash_a > 0:
            veil = Image.new("RGBA", (W, H), CREAM + (int(255 * wash_a),))
            bg = Image.alpha_composite(bg, veil)
        # AESDR wordmark
        a_brand = fade(t, 40.0, 40.8, 42.4, 43.0)
        if a_brand > 0:
            f_brand = ImageFont.truetype(F_DISP_BI, 320)
            wm = iris_text("AESDR", f_brand, t * 0.20)
            paste_centered(bg, with_alpha(wm, a_brand), W * 0.50, H * 0.44)

    # ─── 42.5–45s · HUSHED CTA ───
    if t > 42.0:
        a = fade(t, 42.0, 42.7, 44.4, 45.0)
        if a > 0:
            f_cta = ImageFont.truetype(F_IT, 56)
            text_centered(bg, "For the ones still trying.", f_cta,
                          INK, W * 0.5, H * 0.62, a)
            f_url = ImageFont.truetype(F_MONO, 26)
            text_centered(bg, "aesdr.com", f_url, MUTED, W * 0.5, H * 0.74, a)

    bg = apply_cinema(bg, idx, t, leak=True, leak_color=(255, 175, 110))
    return bg


def main():
    tmp = tempfile.mkdtemp(prefix="mockup-c45-")
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
