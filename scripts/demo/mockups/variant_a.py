"""
Mockup A — 15s editorial teaser. Pure Python frame generator → ffmpeg.

Visual vocabulary: cream + ink, Playfair italic, slow paper-grain motion,
mascot drifts. Inspired by AESDR brand canon, not the live site.
"""

import math
import os
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H = 1920, 1080
FPS = 30
DURATION = 15
N = FPS * DURATION  # 450 frames

CREAM = (250, 247, 242)
INK = (26, 26, 26)
CRIMSON = (139, 26, 26)
MUTED = (107, 107, 107)
LIGHT = (232, 228, 223)

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
F_REG = str(ROOT / "public/fonts/Playfair.ttf")
F_BODY = str(ROOT / "public/fonts/LibreBaskerville-Italic.ttf")
F_MONO = "/usr/share/fonts/truetype/liberation/LiberationMono-Regular.ttf"
MASCOT_REST = ROOT / "public/mascot/leponeus-rest.png"
MASCOT_OWNER = ROOT / "public/mascot/leponeus-owner.png"
MASCOT_VERDICT = ROOT / "public/mascot/leponeus-verdict.png"
MASCOT_DOCTRINE = ROOT / "public/mascot/leponeus-doctrine.png"


def clamp(x, lo=0.0, hi=1.0):
    return max(lo, min(hi, x))


def ease_io(t):
    return 0.5 - 0.5 * math.cos(math.pi * clamp(t))


def fade(t, t_in, t_full_in, t_full_out, t_out):
    if t < t_in or t > t_out:
        return 0.0
    if t < t_full_in:
        return ease_io((t - t_in) / (t_full_in - t_in))
    if t < t_full_out:
        return 1.0
    return ease_io(1.0 - (t - t_full_out) / (t_out - t_full_out))


def iris_color(u):
    u = u % 1.0
    for i in range(len(IRIS) - 1):
        s0, c0 = IRIS[i]
        s1, c1 = IRIS[i + 1]
        if s0 <= u <= s1:
            k = (u - s0) / (s1 - s0)
            return tuple(int(c0[j] + (c1[j] - c0[j]) * k) for j in range(3))
    return IRIS[-1][1]


def paper_grain(img, seed=0, strength=8):
    rng = np.random.default_rng(seed)
    grain = rng.integers(-strength, strength, size=(img.size[1], img.size[0]), dtype=np.int16)
    arr = np.array(img).astype(np.int16)
    for c in range(3):
        arr[..., c] = np.clip(arr[..., c] + grain, 0, 255)
    return Image.fromarray(arr.astype(np.uint8), "RGBA")


def text_alpha(text, font, color, alpha, anchor="mm"):
    """Render text on a fresh transparent canvas at given alpha."""
    bbox_img = Image.new("RGBA", (1, 1))
    d = ImageDraw.Draw(bbox_img)
    bbox = d.textbbox((0, 0), text, font=font, anchor="lt")
    pad = 20
    tw, th = bbox[2] - bbox[0] + pad * 2, bbox[3] - bbox[1] + pad * 2
    layer = Image.new("RGBA", (tw, th), (0, 0, 0, 0))
    dd = ImageDraw.Draw(layer)
    dd.text((pad - bbox[0], pad - bbox[1]), text, font=font, fill=color + (int(255 * alpha),))
    return layer, anchor


def paste_centered(canvas, layer, cx, cy):
    canvas.alpha_composite(layer, (int(cx - layer.size[0] // 2), int(cy - layer.size[1] // 2)))


def make_mascot(path, target_h, mirror=False, tint=None):
    im = Image.open(path).convert("RGBA")
    w0, h0 = im.size
    scale = target_h / h0
    im = im.resize((int(w0 * scale), target_h), Image.LANCZOS)
    if mirror:
        im = im.transpose(Image.FLIP_LEFT_RIGHT)
    if tint is not None:
        arr = np.array(im).astype(np.float32)
        rgb = arr[..., :3]
        gray = (0.299 * rgb[..., 0] + 0.587 * rgb[..., 1] + 0.114 * rgb[..., 2])[..., None]
        tint_arr = np.array(tint).astype(np.float32)
        arr[..., :3] = gray * 0.4 + tint_arr * (1.0 - 0.4) * (gray / 255.0)
        arr = np.clip(arr, 0, 255).astype(np.uint8)
        im = Image.fromarray(arr, "RGBA")
    return im


def iris_wordmark(text, font, t_phase):
    """Render text masked by an animated iris gradient."""
    layer = Image.new("RGBA", (1, 1))
    d = ImageDraw.Draw(layer)
    bbox = d.textbbox((0, 0), text, font=font, anchor="lt")
    pad = 40
    tw, th = bbox[2] - bbox[0] + pad * 2, bbox[3] - bbox[1] + pad * 2
    mask = Image.new("L", (tw, th), 0)
    md = ImageDraw.Draw(mask)
    md.text((pad - bbox[0], pad - bbox[1]), text, font=font, fill=255)
    grad = Image.new("RGB", (tw, th))
    g = np.zeros((th, tw, 3), dtype=np.uint8)
    for x in range(tw):
        u = (x / tw + t_phase) % 1.0
        g[:, x] = iris_color(u)
    grad = Image.fromarray(g, "RGB")
    out = Image.new("RGBA", (tw, th), (0, 0, 0, 0))
    out.paste(grad, (0, 0), mask)
    return out


def draw_logo_glyph(d, x, y, label, alpha):
    """Etched-style monogram logo: thin rect + Mono caps inside."""
    f = ImageFont.truetype(F_MONO, 22)
    w = 220
    h = 64
    col = MUTED + (int(150 * alpha),)
    d.rectangle([x - w // 2, y - h // 2, x + w // 2, y + h // 2], outline=col, width=1)
    bbox = d.textbbox((0, 0), label, font=f, anchor="lt")
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    d.text((x - tw // 2, y - th // 2 - bbox[1]), label, font=f, fill=col)


def render_frame(idx, mascots):
    t = idx / FPS
    img = Image.new("RGBA", (W, H), CREAM + (255,))

    # ─── 0–3s · Mascot drift in ───
    if t < 5.5:
        a = fade(t, 0.2, 1.4, 4.6, 5.5)
        if a > 0:
            mascot = mascots["rest"]
            x = int(W * 0.18 + ease_io((t - 0.2) / 5.3) * 60)
            y = int(H * 0.20 + math.sin(t * 0.9) * 6)
            m = mascot.copy()
            ma = np.array(m)
            ma[..., 3] = (ma[..., 3] * a).astype(np.uint8)
            m = Image.fromarray(ma, "RGBA")
            img.alpha_composite(m, (x, y))

    # ─── 2–10s · Text builds, replacing each beat ───
    f_disp = ImageFont.truetype(F_DISP, 116)
    f_sub = ImageFont.truetype(F_BODY, 36)
    lines = [
        # (start, in, out, full_out, text, font, color, x_frac, y_frac)
        (1.6, 2.5, 4.6, 5.4, "Five years selling.", f_disp, INK, 0.50, 0.62),
        (4.6, 5.5, 7.4, 8.0, "No map. No mentor.", f_disp, INK, 0.50, 0.62),
        (7.4, 8.1, 9.6, 10.2, "Then someone wrote one.", f_disp, CRIMSON, 0.50, 0.62),
    ]
    for start, t_in, t_out, t_full_out, txt, font, col, xf, yf in lines:
        a = fade(t, start, t_in, t_out, t_full_out)
        if a > 0:
            layer, _ = text_alpha(txt, font, col, a)
            paste_centered(img, layer, W * xf, H * yf)

    # ─── 9.5–13s · AESDR iris wordmark + mascot swap ───
    if 9.5 < t < 13.2:
        a = fade(t, 9.5, 10.4, 12.6, 13.2)
        if a > 0:
            f_brand = ImageFont.truetype(F_DISP, 240)
            phase = t * 0.18
            wm = iris_wordmark("AESDR", f_brand, phase)
            wa = np.array(wm)
            wa[..., 3] = (wa[..., 3] * a).astype(np.uint8)
            wm = Image.fromarray(wa, "RGBA")
            paste_centered(img, wm, W * 0.5, H * 0.42)
        a2 = fade(t, 10.2, 10.9, 12.6, 13.2)
        if a2 > 0:
            mascot = mascots["verdict"]
            m = mascot.copy()
            ma = np.array(m)
            ma[..., 3] = (ma[..., 3] * a2).astype(np.uint8)
            m = Image.fromarray(ma, "RGBA")
            paste_centered(img, m, W * 0.5, H * 0.74)

    # ─── 11.5–13.5s · Validated logos strip (etched) ───
    if 11.5 < t < 13.8:
        a = fade(t, 11.5, 12.2, 13.4, 13.8)
        if a > 0:
            d = ImageDraw.Draw(img)
            labels = ["NORTHFIELD", "OLIVE & CRANE", "PRESTON YIELD", "AVERY ROW"]
            spacing = W / (len(labels) + 1)
            for i, lab in enumerate(labels):
                lx = int(spacing * (i + 1))
                draw_logo_glyph(d, lx, int(H * 0.92), lab, a * 0.7)

    # ─── 13–15s · CTA voice line ───
    if t > 12.8:
        a = fade(t, 12.8, 13.5, 14.7, 15.0)
        if a > 0:
            f_cta = ImageFont.truetype(F_IT, 44)
            f_who = ImageFont.truetype(F_DISP, 50)
            # Re-clear lower third to ink-text feel
            d = ImageDraw.Draw(img)
            line_y = H * 0.55
            l1, _ = text_alpha("Read by", f_cta, MUTED, a, "mm")
            paste_centered(img, l1, W * 0.5 - 200, line_y)
            l2, _ = text_alpha("Michael.", f_who, INK, a, "mm")
            paste_centered(img, l2, W * 0.5 - 40, line_y)
            a2 = fade(t, 13.4, 14.0, 14.7, 15.0)
            if a2 > 0:
                l3, _ = text_alpha("Endorsed by", f_cta, MUTED, a2, "mm")
                paste_centered(img, l3, W * 0.5 + 140, line_y)
                l4, _ = text_alpha("Rowan.", f_who, CRIMSON, a2, "mm")
                paste_centered(img, l4, W * 0.5 + 320, line_y)
            # Wipe wordmark + mascot when CTA shows by overlaying cream
            # (handled by ordering above — CTA paints on top at this point)

    # Paper grain (seed varies for live feel)
    img = paper_grain(img, seed=idx % 23, strength=5)
    return img


def main():
    print("[mockup-A] preloading assets…")
    mascots = {
        "rest": make_mascot(MASCOT_REST, 540),
        "verdict": make_mascot(MASCOT_VERDICT, 360),
    }
    tmp = tempfile.mkdtemp(prefix="mockup-a-")
    print(f"[mockup-A] rendering {N} frames → {tmp}")
    for i in range(N):
        if i % 30 == 0:
            print(f"  frame {i}/{N}")
        f = render_frame(i, mascots)
        f.convert("RGB").save(os.path.join(tmp, f"f-{i:04d}.png"), "PNG", optimize=False)
    out = ROOT / "scripts/demo/out/mockups/mockup-a.mp4"
    out.parent.mkdir(parents=True, exist_ok=True)
    print(f"[mockup-A] encoding → {out}")
    subprocess.check_call([
        "ffmpeg", "-y",
        "-framerate", str(FPS),
        "-i", os.path.join(tmp, "f-%04d.png"),
        "-c:v", "libx264", "-crf", "18", "-preset", "medium",
        "-pix_fmt", "yuv420p",
        str(out),
    ])
    print(f"[mockup-A] done → {out}")


if __name__ == "__main__":
    main()
