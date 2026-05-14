"""
Mockup C v2 — 45s atmospheric "Pilgrimage" cut, patched per user feedback.

Beats:
  0–2.5s   intro hook copy fades on as Leponeus zooms in; gone before he lands
  2.5–9s   mascot fully present; Caveat-style annotation appears
  6–22s    12-lesson constellation reveal around Leponeus
  22–24s   AESDR iris wordmark zoom-in as Leponeus zooms out; 11 other titles
           blur out; Surviving & Thriving pulls focus
  24–26s   transition into the lesson interior
  26–38s   actual-style lesson screen: SECTION 03 · SUBJECT-LINE RISKS;
           BANT picker; "Saw the Series B announcement — one question"
           is clicked HIGH, turns green, reasoning fades in
  38–41s   crossfade to big AESDR iris wordmark + course-line tagline
  41–45s   final card: iris "AESDR.com" + "Change your life." + scrolling
           validated-by marquee with actual portfolio names

No crimson screen flash. No "6 down. 6 to go." beat. Letterbox 2.39:1.
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
    render_lesson_header, render_validated_marquee,
    apply_cinema,
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
    out = []
    for i in range(12):
        angle = -math.pi / 2 + (i / 12) * 2 * math.pi
        r_x = 0.34 + 0.04 * math.sin(i * 1.7)
        r_y = 0.30 + 0.03 * math.cos(i * 1.3)
        out.append((angle, r_x, r_y))
    return out


# ─── Faux lesson interior — sized to match the actual /course/3 layout ──

def render_subject_line_risks_screen(w, h, t, click_t=4.0):
    """Mock of the real lesson page: header, section eyebrow, headline,
    BANT-style risk picker. At t >= click_t the third row (Series B
    trigger) is selected HIGH and turns solid green; reasoning fades in.
    """
    layer = Image.new("RGBA", (w, h), CREAM + (255,))
    d = ImageDraw.Draw(layer)

    # Lesson header band (cream)
    head = render_lesson_header(w=w, t_phase=t * 0.18)
    layer.alpha_composite(head, (0, 0))

    # Course/section eyebrow row
    f_chip = ImageFont.truetype(F_MONO_B, 13)
    d.rounded_rectangle([42, 100, 152, 130], radius=2, fill=CRIMSON)
    d.text((97, 115), "COURSE 3", font=f_chip, fill=CREAM, anchor="mm")

    f_eb = ImageFont.truetype(F_MONO, 13)
    d.text((170, 115), "SECTION 03  —  SUBJECT-LINE RISKS",
           font=f_eb, fill=MUTED, anchor="lm")

    # Big italic headline
    f_h = ImageFont.truetype(F_DISP_BI, 72)
    d.text((42, 160), "Which of these earns a reply?",
           font=f_h, fill=INK)
    f_sub = ImageFont.truetype(F_BODY, 22)
    d.text((42, 252), "Six subject lines. High or Low. The reasoning unlocks after each verdict.",
           font=f_sub, fill=(110, 105, 95))

    # Picker rows (matches the real lesson UI)
    rows = [
        ("COLD OUTREACH · REVOPS",   "\"Quick question about your SDR ramp time\""),
        ("GENERIC SAAS OUTREACH",    "\"Introducing [Company] — Transform Your Sales Process!\""),
        ("TIMELY TRIGGER",           "\"Saw the Series B announcement — one question\""),
        ("BENEFIT-FIRST EMAIL",      "\"How we helped [Company] increase revenue by 40%\""),
    ]
    row_y0 = 330
    row_h = 96
    f_re_eb = ImageFont.truetype(F_MONO, 12)
    f_re_t = ImageFont.truetype(F_BODY_B, 24)
    f_btn = ImageFont.truetype(F_MONO_B, 14)
    f_reason = ImageFont.truetype(F_BODY, 18)

    # cursor position — animates toward the Series B HIGH button
    cursor_alpha = 0.0
    cursor_x, cursor_y = 0, 0

    for i, (eb, line) in enumerate(rows):
        y = row_y0 + i * row_h
        # Active state for Series B (i=2) once t>=click_t
        is_picked = (i == 2 and t >= click_t)
        # Highlight focus on row 2 as the cursor approaches
        if i == 2 and t >= click_t - 1.0:
            border_a = clamp((t - (click_t - 1.0)) / 0.6)
            d.rectangle([42, y - 8, w - 42, y + row_h - 16],
                        outline=(180, 175, 168), width=1)
        d.text((58, y + 8), eb, font=f_re_eb, fill=MUTED)
        d.text((58, y + 30), line, font=f_re_t, fill=INK)
        # HIGH/LOW buttons
        for j, (label, col) in enumerate([("↑ HIGH", (90, 160, 110)),
                                          ("↓ LOW",  (190, 90, 80))]):
            bx = w - 360 + j * 130
            by = y + 18
            if is_picked and j == 0:
                d.rectangle([bx, by, bx + 116, by + 38], fill=col + (255,))
                d.text((bx + 58, by + 20), label, font=f_btn,
                       fill=CREAM, anchor="mm")
            else:
                d.rectangle([bx, by, bx + 116, by + 38],
                            outline=col + (220,), width=1)
                d.text((bx + 58, by + 20), label, font=f_btn,
                       fill=col, anchor="mm")
            # remember cursor target
            if i == 2 and j == 0:
                cursor_x = bx + 58
                cursor_y = by + 20
        # divider
        if i < len(rows) - 1:
            d.line([(42, y + row_h - 12), (w - 42, y + row_h - 12)],
                   fill=(220, 215, 208))

    # Reasoning text after click
    if t > click_t:
        reason_a = clamp((t - click_t) / 0.7)
        reason_lines = [
            "Why HIGH:",
            "References a real, recent event. Reads as personal — not a mass sequence.",
            "The trailing \"one question\" hints at curiosity without overpromising.",
        ]
        ry = row_y0 + 2 * row_h + 30
        for li, ln in enumerate(reason_lines):
            col = (90, 160, 110) if li == 0 else (90, 90, 90)
            f = f_re_eb if li == 0 else f_reason
            d.text((58, ry + li * 28), ln, font=f,
                   fill=col + (int(255 * reason_a),))

    # Animated cursor that lands on the Series B HIGH button
    if t >= click_t - 0.8 and t <= click_t + 1.4:
        # ease in toward cursor target
        k = clamp((t - (click_t - 0.8)) / 0.6)
        # start from below-right
        sx, sy = w - 250, row_y0 + 4 * row_h
        cx_now = int(lerp(sx, cursor_x, ease_out(k)))
        cy_now = int(lerp(sy, cursor_y, ease_out(k)))
        # cursor triangle
        d.polygon([(cx_now, cy_now),
                   (cx_now + 18, cy_now + 6),
                   (cx_now + 6, cy_now + 18)],
                  fill=INK)
        d.polygon([(cx_now, cy_now),
                   (cx_now + 18, cy_now + 6),
                   (cx_now + 6, cy_now + 18)],
                  outline=CREAM, width=2)
        # tiny ripple on click moment
        if t > click_t and t < click_t + 0.5:
            rk = (t - click_t) / 0.5
            ring_r = int(10 + rk * 60)
            ring_a = int((1 - rk) * 200)
            d.ellipse([cursor_x - ring_r, cursor_y - ring_r,
                       cursor_x + ring_r, cursor_y + ring_r],
                      outline=(90, 160, 110) + (ring_a,), width=2)

    return layer


# ─── Frame renderer ───────────────────────────────────────────────────

def render(idx: int) -> Image.Image:
    t = idx / FPS
    bg = gradient_bg(t)

    # ─── 0–9s · MASCOT REVEAL ───
    if t < 22.5:
        # mascot scale: 3.0 → 1.2 by 8s
        scale = 3.0 - 1.9 * ease_out(clamp(t / 8.0))
        m = mascot("sprint", int(660 * max(1.0, scale)))
        k = ease_out(clamp(t / 8.0))
        dx = int(lerp(-240, 0, k))
        dy = int(lerp(-200, 0, k))
        paste_centered(bg, m, W * 0.50 + dx, H * 0.50 + dy)
        # cream veil on entry
        if t < 1.2:
            veil = Image.new("RGBA", (W, H), CREAM + (int((1 - t / 1.2) * 110),))
            bg = Image.alpha_composite(bg, veil)

        # Intro hook copy — fades in fast, fades OUT before Leponeus settles
        a_hook = fade(t, 0.4, 1.2, 2.1, 2.8)
        if a_hook > 0:
            f_hook = ImageFont.truetype(F_DISP_BL, 86)
            text_centered(bg, "Five years selling.", f_hook,
                          INK, W * 0.50, H * 0.30, a_hook)
            f_hook2 = ImageFont.truetype(F_IT, 48)
            text_centered(bg, "No mentor. No map.", f_hook2,
                          MUTED, W * 0.50, H * 0.40, a_hook)

        # Caveat-style annotation about Leponeus — appears AFTER intro is gone
        a_ann = fade(t, 3.4, 4.4, 8.6, 9.6)
        if a_ann > 0:
            f_ann = ImageFont.truetype(F_IT, 30)
            lines = [
                "(this is Leponeus.",
                "he's your trusty sales career mascot.",
                "noone cares about you more than Leponeus does.)",
            ]
            for li, ln in enumerate(lines):
                text_centered(bg, ln, f_ann, MUTED,
                              W * 0.68, H * 0.70 + li * 38, a_ann)
            # squiggle arrow toward Leponeus
            for k_arrow in range(22):
                u = k_arrow / 22
                ax = int(W * 0.62 - u * (W * 0.10) + math.sin(u * 5) * 4)
                ay = int(H * 0.66 - u * (H * 0.08) + math.cos(u * 4) * 3)
                d = ImageDraw.Draw(bg)
                d.ellipse([ax - 2, ay - 2, ax + 2, ay + 2],
                          fill=MUTED + (int(180 * a_ann),))

    # ─── 6–22s · CONSTELLATION REVEAL ───
    if 6.0 < t < 23.5:
        positions = constellation_positions()
        for i, (angle, r_x, r_y) in enumerate(positions):
            t_in = 6.0 + i * 0.55
            a = fade(t, t_in, t_in + 0.9, 21.6, 22.8)
            if a > 0:
                num, title, body = LESSONS[i]
                f_eb = ImageFont.truetype(F_MONO, 13)
                f_t = ImageFont.truetype(F_DISP_BI, 32)
                x = int(W * 0.5 + math.cos(angle) * (W * r_x))
                y = int(H * 0.5 + math.sin(angle) * (H * r_y))
                fy = math.sin(t * 0.5 + i) * 4
                # eyebrow
                tl_eb = text_layer(f"{num}", f_eb, MUTED, a * 0.85)
                paste_centered(bg, tl_eb, x, y - 24 + int(fy))
                # title — Surviving & Thriving pulses + crimson once it's all in
                if i == 2 and t > 11.5:
                    pulse = 0.86 + 0.14 * math.sin((t - 11.5) * 4.0)
                    col = CRIMSON
                    aa = a * pulse
                else:
                    col = INK
                    aa = a * 0.90
                tl_t = text_layer(title, f_t, col, aa)
                paste_centered(bg, tl_t, x, y + 8 + int(fy))

    # ─── particles ───
    if 1.0 < t < 26.0:
        pa = fade(t, 1.0, 2.0, 24.0, 26.0)
        p = particles(t)
        bg.alpha_composite(with_alpha(p, pa))

    # ─── 22–24s · AESDR ZOOM IN as LEPONEUS ZOOMS OUT + BLUR-OUT OF 11 TITLES ───
    if 21.6 < t < 25.3:
        # Mascot zooms back out (shrinks) and drifts slightly down/right
        z_out = clamp((t - 21.6) / 1.4)
        scale = 1.2 * (1.0 - 0.8 * z_out)  # shrink to 0.24
        if scale > 0.1:
            m = mascot("sprint", max(40, int(660 * scale)))
            mx = int(W * 0.50 + 20 * z_out)
            my = int(H * 0.55 + 60 * z_out)
            paste_centered(bg, with_alpha(m, 1.0 - 0.8 * z_out), mx, my)

        # AESDR iris wordmark zooms in (small → big)
        z_in = clamp((t - 21.8) / 1.6)
        z_in_e = ease_out(z_in)
        f_size = max(20, int(40 + 360 * z_in_e))
        f_brand = ImageFont.truetype(F_DISP_BI, f_size)
        wm = iris_text("AESDR", f_brand, t * 0.20, alpha=clamp(z_in * 2.0))
        paste_centered(bg, wm, W * 0.50, H * 0.50)

        # Blur out 11 non-S&T titles, pulse S&T into focus
        positions = constellation_positions()
        for i, (angle, r_x, r_y) in enumerate(positions):
            num, title, body = LESSONS[i]
            x = int(W * 0.5 + math.cos(angle) * (W * r_x))
            y = int(H * 0.5 + math.sin(angle) * (H * r_y))
            if i == 2:
                # pull S&T toward center as we focus
                pull = ease_out(clamp((t - 22.5) / 1.5))
                x = int(lerp(x, W * 0.5, pull))
                y = int(lerp(y, H * 0.5 + 90, pull))
                f_t = ImageFont.truetype(F_DISP_BI, int(32 + 24 * pull))
                tl = text_layer(title, f_t, CRIMSON, 1.0)
                paste_centered(bg, tl, x, y)
            else:
                # blur + fade out
                blur_a = (1.0 - clamp((t - 22.0) / 1.3)) * 0.70
                if blur_a > 0:
                    f_t = ImageFont.truetype(F_DISP_BI, 32)
                    tl = text_layer(title, f_t, INK, blur_a)
                    tl = tl.filter(ImageFilter.GaussianBlur(radius=4))
                    paste_centered(bg, tl, x, y + 8)

    # ─── 24.5–38s · LESSON INTERIOR (Subject-Line Risks) ───
    if 24.0 < t < 38.6:
        # white card wash on top of bg (transition)
        wash_a = fade(t, 24.0, 25.0, 37.5, 38.4)
        if wash_a > 0:
            veil = Image.new("RGBA", (W, H), CREAM + (int(255 * wash_a),))
            bg = Image.alpha_composite(bg, veil)
        # Render the lesson interior centered, sized close to viewport
        lt = t - 25.0  # local time inside this beat
        click_t = 5.5  # cursor lands on Series B HIGH ~5.5s into the beat
        lesson_w = 1700
        lesson_h = 900
        screen = render_subject_line_risks_screen(lesson_w, lesson_h,
                                                  lt, click_t=click_t)
        # subtle zoom-in to settle
        z = 1.04 - 0.04 * ease_out(clamp(lt / 1.2))
        zw = int(lesson_w * z)
        zh = int(lesson_h * z)
        screen_z = screen.resize((zw, zh), Image.LANCZOS)
        paste_centered(bg, with_alpha(screen_z, wash_a),
                       W * 0.50, H * 0.50)

    # ─── 38–41s · BIG AESDR WORDMARK + TAGLINE ───
    if 38.0 < t < 41.5:
        wash_a = fade(t, 38.0, 38.8, 40.6, 41.5)
        if wash_a > 0:
            veil = Image.new("RGBA", (W, H), CREAM + (int(255 * wash_a),))
            bg = Image.alpha_composite(bg, veil)
        a = fade(t, 38.5, 39.4, 40.8, 41.5)
        if a > 0:
            f_brand = ImageFont.truetype(F_DISP_BI, 320)
            wm = iris_text("AESDR", f_brand, t * 0.20)
            paste_centered(bg, with_alpha(wm, a), W * 0.50, H * 0.42)
            f_tag = ImageFont.truetype(F_IT, 36)
            text_centered(bg,
                          "12-lesson sales survival course — for early-career AEs and SDRs.",
                          f_tag, MUTED, W * 0.50, H * 0.60, a)

    # ─── 41–45s · CLOSING CARD ───
    if t > 41.0:
        a = fade(t, 41.0, 41.7, 44.4, 45.0)
        if a > 0:
            # cream wash
            veil = Image.new("RGBA", (W, H), CREAM + (int(255 * a),))
            bg = Image.alpha_composite(bg, veil)
            # iris "AESDR.com" wordmark
            f_brand = ImageFont.truetype(F_DISP_BI, 260)
            wm = iris_text("AESDR.com", f_brand, t * 0.22)
            paste_centered(bg, with_alpha(wm, a), W * 0.50, H * 0.40)
            # Change your life. — italic serif, on its own line
            f_cta = ImageFont.truetype(F_IT, 56)
            text_centered(bg, "Change your life.", f_cta,
                          INK, W * 0.50, H * 0.56, a)
            # Validated-by carousel in motion
            marquee = render_validated_marquee(alpha=a, t=t, w=W - 40,
                                               scroll_px_per_s=70)
            paste_centered(bg, marquee, W * 0.50, H * 0.80)

    bg = apply_cinema(bg, idx, t, leak=True, leak_color=(255, 175, 110))
    return bg


def main():
    tmp = tempfile.mkdtemp(prefix="mockup-c45v2-")
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
