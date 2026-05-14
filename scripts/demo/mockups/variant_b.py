"""
Mockup B — 15s diagnostic / terminal teaser. Python → ffmpeg.

Visual vocabulary: ink black, mono caps, scanlines, sharp cuts.
Iris-shimmer payoff. Inspired by the AESDR landing's terminal beats
but reimagined as a 15s cinematic.
"""

import math
import os
import random
import subprocess
import tempfile
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H = 1920, 1080
FPS = 30
DURATION = 15
N = FPS * DURATION

CREAM = (250, 247, 242)
INK = (15, 15, 18)
CRIMSON = (139, 26, 26)
TERM_GREEN = (104, 168, 110)
MUTED = (140, 140, 140)
DUST = (200, 196, 188)

IRIS = [
    (0.00, (255, 0, 110)),
    (0.17, (255, 107, 0)),
    (0.34, (245, 158, 11)),
    (0.51, (16, 185, 129)),
    (0.68, (56, 189, 248)),
    (0.85, (139, 92, 246)),
    (1.00, (255, 0, 110)),
]

ROOT = Path(__file__).resolve().parents[3]
F_DISP = str(ROOT / "public/fonts/Playfair-BoldItalic-Static.ttf")
F_IT = str(ROOT / "public/fonts/Playfair-Italic.ttf")
F_MONO = "/usr/share/fonts/truetype/liberation/LiberationMono-Regular.ttf"
F_MONO_BOLD = "/usr/share/fonts/truetype/liberation/LiberationMono-Bold.ttf"
MASCOT_DIAG = ROOT / "public/mascot/leponeus-diagnosis.png"
MASCOT_DOCT = ROOT / "public/mascot/leponeus-doctrine.png"
MASCOT_VERD = ROOT / "public/mascot/leponeus-verdict.png"


def clamp(x, lo=0.0, hi=1.0):
    return max(lo, min(hi, x))


def ease_io(t):
    return 0.5 - 0.5 * math.cos(math.pi * clamp(t))


def fade(t, t_in, t_full_in, t_full_out, t_out):
    if t < t_in or t > t_out:
        return 0.0
    if t < t_full_in:
        return ease_io((t - t_in) / max(1e-3, t_full_in - t_in))
    if t < t_full_out:
        return 1.0
    return ease_io(1.0 - (t - t_full_out) / max(1e-3, t_out - t_full_out))


def iris_color(u):
    u = u % 1.0
    for i in range(len(IRIS) - 1):
        s0, c0 = IRIS[i]
        s1, c1 = IRIS[i + 1]
        if s0 <= u <= s1:
            k = (u - s0) / (s1 - s0)
            return tuple(int(c0[j] + (c1[j] - c0[j]) * k) for j in range(3))
    return IRIS[-1][1]


def add_scanlines(img, strength=0.10, seed=0):
    arr = np.array(img).astype(np.float32)
    h = arr.shape[0]
    rng = np.random.default_rng(seed)
    pattern = np.ones(h) - strength * (np.arange(h) % 2)
    pattern += rng.normal(0, 0.01, h)
    arr[..., :3] *= pattern[:, None, None]
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), "RGBA")


def add_chromatic(img, shift=2):
    arr = np.array(img)
    r = np.roll(arr[..., 0], shift, axis=1)
    b = np.roll(arr[..., 2], -shift, axis=1)
    out = arr.copy()
    out[..., 0] = r
    out[..., 2] = b
    return Image.fromarray(out, "RGBA")


def glitch_strip(img, rng):
    """Horizontal slice displacement for sharp-cut frames."""
    arr = np.array(img)
    n_slices = rng.integers(3, 7)
    for _ in range(int(n_slices)):
        y0 = rng.integers(0, H - 40)
        h_slice = rng.integers(2, 24)
        dx = rng.integers(-40, 40)
        arr[y0:y0 + h_slice] = np.roll(arr[y0:y0 + h_slice], dx, axis=1)
    return Image.fromarray(arr, "RGBA")


def type_progress(text, t, t_in, char_dur):
    if t < t_in:
        return ""
    n = int((t - t_in) / char_dur)
    return text[:max(0, n)]


def draw_caret(d, x, y, font, color, blink_phase):
    if blink_phase % 1.0 < 0.55:
        bbox = d.textbbox((x, y), "█", font=font, anchor="lt")
        d.text((x, y), "█", font=font, fill=color)


def make_mascot(path, target_h, mirror=False):
    im = Image.open(path).convert("RGBA")
    w0, h0 = im.size
    scale = target_h / h0
    im = im.resize((int(w0 * scale), target_h), Image.LANCZOS)
    if mirror:
        im = im.transpose(Image.FLIP_LEFT_RIGHT)
    return im


def darken_mascot(im, factor=0.65, tint=(220, 90, 90)):
    arr = np.array(im).astype(np.float32)
    arr[..., 0] = arr[..., 0] * factor + tint[0] * (1 - factor) * 0.5
    arr[..., 1] = arr[..., 1] * factor
    arr[..., 2] = arr[..., 2] * factor
    arr = np.clip(arr, 0, 255).astype(np.uint8)
    return Image.fromarray(arr, "RGBA")


def iris_wordmark(text, font, t_phase):
    layer = Image.new("RGBA", (1, 1))
    d = ImageDraw.Draw(layer)
    bbox = d.textbbox((0, 0), text, font=font, anchor="lt")
    pad = 40
    tw, th = bbox[2] - bbox[0] + pad * 2, bbox[3] - bbox[1] + pad * 2
    mask = Image.new("L", (tw, th), 0)
    md = ImageDraw.Draw(mask)
    md.text((pad - bbox[0], pad - bbox[1]), text, font=font, fill=255)
    g = np.zeros((th, tw, 3), dtype=np.uint8)
    for x in range(tw):
        u = (x / tw + t_phase) % 1.0
        g[:, x] = iris_color(u)
    grad = Image.fromarray(g, "RGB")
    out = Image.new("RGBA", (tw, th), (0, 0, 0, 0))
    out.paste(grad, (0, 0), mask)
    return out


def paste_centered(canvas, layer, cx, cy):
    canvas.alpha_composite(layer, (int(cx - layer.size[0] // 2), int(cy - layer.size[1] // 2)))


def render_frame(idx, mascots):
    t = idx / FPS
    bg_color = INK if t < 7.4 else CREAM
    img = Image.new("RGBA", (W, H), bg_color + (255,))
    d = ImageDraw.Draw(img)

    # ─── 0–7s · TERMINAL DIAGNOSTIC ───
    if t < 7.6:
        f_mono = ImageFont.truetype(F_MONO, 38)
        f_mono_b = ImageFont.truetype(F_MONO_BOLD, 38)
        f_mono_sm = ImageFont.truetype(F_MONO, 24)

        # Chrome
        chrome_col = (60, 60, 65, 255)
        d.rectangle([0, 0, W, 56], fill=chrome_col)
        d.text((24, 16), "you_already_knew.exe", font=f_mono_sm, fill=(180, 180, 180))
        d.text((W - 200, 16), "SCAN · 23:11:47", font=f_mono_sm, fill=(120, 120, 120))

        col_term = (220, 220, 215)
        col_dim = (135, 135, 130)
        col_warn = (210, 100, 100)

        lines = [
            (0.3, 0.05, "> diagnosing your week...", col_dim, f_mono),
            (1.4, 0.045, "> dials_made = 47", col_term, f_mono),
            (2.4, 0.045, "> connects = 3", col_term, f_mono),
            (3.4, 0.045, "> meetings_booked = 0", col_warn, f_mono_b),
            (4.6, 0.04, '> notes: "VM" "VM" "VM" "gatekeeper" "VM"', col_dim, f_mono),
            (5.8, 0.045, "> diagnosis: you need a map.", col_warn, f_mono_b),
        ]
        y = 130
        for t_in, cdur, raw, col, fnt in lines:
            shown = type_progress(raw, t, t_in, cdur)
            if shown:
                d.text((90, y), shown, font=fnt, fill=col)
                # caret on the live-typing line
                if len(shown) < len(raw):
                    bbox = d.textbbox((90, y), shown, font=fnt, anchor="lt")
                    cx = bbox[2] + 4
                    d.rectangle([cx, y + 6, cx + 16, y + 42], fill=col)
            y += 70

    # ─── 7.4–7.6s · CUT FLASH ───
    if 7.35 < t < 7.55:
        flash_alpha = 1.0 - abs(t - 7.45) / 0.10
        flash = Image.new("RGBA", (W, H), CREAM + (int(255 * flash_alpha),))
        img = Image.alpha_composite(img, flash)

    # ─── 7.6–11.5s · LESSON CARD REVEAL ───
    if 7.5 < t < 12.0:
        d = ImageDraw.Draw(img)
        a = fade(t, 7.5, 8.1, 11.0, 11.8)
        if a > 0:
            # Lesson card
            cw, ch = 760, 540
            cx, cy = int(W * 0.34), int(H * 0.55)
            box = Image.new("RGBA", (cw, ch), (255, 255, 255, int(255 * a)))
            bd = ImageDraw.Draw(box)
            bd.rectangle([0, 0, cw - 1, ch - 1], outline=(26, 26, 26, int(200 * a)), width=2)
            # iris hairline at top
            for x in range(cw):
                u = (x / cw + t * 0.2) % 1.0
                c = iris_color(u)
                bd.line([(x, 0), (x, 4)], fill=c + (int(200 * a),))
            # number
            f_num = ImageFont.truetype(F_DISP, 96)
            bd.text((40, 24), "03", font=f_num, fill=(26, 26, 26, int(255 * a)))
            # eyebrow
            f_eb = ImageFont.truetype(F_MONO, 18)
            bd.text((40, 150), "LESSON · SDR PLAYBOOK", font=f_eb, fill=(107, 107, 107, int(200 * a)))
            # title
            f_t = ImageFont.truetype(F_DISP, 64)
            bd.text((40, 200), "Surviving", font=f_t, fill=(26, 26, 26, int(255 * a)))
            bd.text((40, 270), "& Thriving.", font=f_t, fill=(139, 26, 26, int(255 * a)))
            # body
            f_body = ImageFont.truetype(F_IT, 26)
            bd.text((40, 380), "Nobody is coming to save you.", font=f_body, fill=(80, 80, 80, int(220 * a)))
            bd.text((40, 416), "Learn to save yourself.", font=f_body, fill=(80, 80, 80, int(220 * a)))
            img.alpha_composite(box, (cx - cw // 2, cy - ch // 2))

            # Mascot beside the card
            m = mascots["diag"]
            ma = np.array(m)
            ma[..., 3] = (ma[..., 3] * a).astype(np.uint8)
            m2 = Image.fromarray(ma, "RGBA")
            paste_centered(img, m2, W * 0.76, H * 0.55)

    # ─── 11.5–13.5s · AESDR iris flash ───
    if 11.3 < t < 13.6:
        a = fade(t, 11.3, 11.9, 13.0, 13.6)
        if a > 0:
            f_brand = ImageFont.truetype(F_DISP, 280)
            phase = t * 0.22
            wm = iris_wordmark("AESDR", f_brand, phase)
            wa = np.array(wm)
            wa[..., 3] = (wa[..., 3] * a).astype(np.uint8)
            wm = Image.fromarray(wa, "RGBA")
            paste_centered(img, wm, W * 0.5, H * 0.50)

    # ─── 13.5–15s · CTA: Michael & Rowan ───
    if t > 13.3:
        a = fade(t, 13.3, 13.9, 14.7, 15.0)
        if a > 0:
            f_mono = ImageFont.truetype(F_MONO_BOLD, 30)
            f_serif = ImageFont.truetype(F_DISP, 64)
            d = ImageDraw.Draw(img)
            # // Michael & Rowan made this.
            line1, _ = ("// Michael & Rowan made this.", "")
            tl = Image.new("RGBA", (W, 120), (0, 0, 0, 0))
            dl = ImageDraw.Draw(tl)
            dl.text((W // 2, 0), "// Michael & Rowan made this.",
                    font=f_mono, fill=MUTED + (int(255 * a),), anchor="mt")
            img.alpha_composite(tl, (0, int(H * 0.42)))
            # Big CTA
            tl2 = Image.new("RGBA", (W, 200), (0, 0, 0, 0))
            dl2 = ImageDraw.Draw(tl2)
            dl2.text((W // 2, 0), "Read it.", font=f_serif,
                     fill=CRIMSON + (int(255 * a),), anchor="mt")
            img.alpha_composite(tl2, (0, int(H * 0.50)))

    # Scanlines + slight chromatic on terminal section
    if t < 7.5:
        img = add_scanlines(img, strength=0.07, seed=idx % 17)
    # Occasional glitch on cut frame
    if 7.35 <= t <= 7.55:
        rng = np.random.default_rng(idx)
        img = glitch_strip(img, rng)
        img = add_chromatic(img, shift=4)
    return img


def main():
    print("[mockup-B] preloading assets…")
    mascots = {
        "diag": make_mascot(MASCOT_DIAG, 600),
        "doct": make_mascot(MASCOT_DOCT, 600),
    }
    tmp = tempfile.mkdtemp(prefix="mockup-b-")
    print(f"[mockup-B] rendering {N} frames → {tmp}")
    for i in range(N):
        if i % 30 == 0:
            print(f"  frame {i}/{N}")
        f = render_frame(i, mascots)
        f.convert("RGB").save(os.path.join(tmp, f"f-{i:04d}.png"), "PNG", optimize=False)
    out = ROOT / "scripts/demo/out/mockups/mockup-b.mp4"
    out.parent.mkdir(parents=True, exist_ok=True)
    print(f"[mockup-B] encoding → {out}")
    subprocess.check_call([
        "ffmpeg", "-y",
        "-framerate", str(FPS),
        "-i", os.path.join(tmp, "f-%04d.png"),
        "-c:v", "libx264", "-crf", "18", "-preset", "medium",
        "-pix_fmt", "yuv420p",
        str(out),
    ])
    print(f"[mockup-B] done → {out}")


if __name__ == "__main__":
    main()
