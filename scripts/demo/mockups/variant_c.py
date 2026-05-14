"""
Mockup C — 15s atmospheric / "Ascent" teaser. Python → ffmpeg.

Visual vocabulary: slow pull-back from extreme close-up on Leponeus,
constellation of lesson titles reveals around the mascot, iris sweep,
hushed CTA. Warm bone palette with a deep cream finish.
"""

import math
import os
import subprocess
import tempfile
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H = 1920, 1080
FPS = 30
DURATION = 15
N = FPS * DURATION

BONE = (232, 220, 196)  # warm bone
CREAM = (250, 247, 242)
INK = (26, 26, 26)
CRIMSON = (139, 26, 26)
MUTED = (140, 130, 120)
LIGHT = (216, 208, 192)

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

MASCOT_SPRINT = ROOT / "public/mascot/leponeus-sprint.png"
MASCOT_REST = ROOT / "public/mascot/leponeus-rest.png"
MASCOT_DOCTRINE = ROOT / "public/mascot/leponeus-doctrine.png"


def clamp(x, lo=0.0, hi=1.0):
    return max(lo, min(hi, x))


def ease_io(t):
    return 0.5 - 0.5 * math.cos(math.pi * clamp(t))


def ease_out_quad(t):
    t = clamp(t)
    return 1 - (1 - t) * (1 - t)


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


def gradient_bg(t):
    """Vignette + warm-to-cream wash that shifts across the 15s."""
    # mix factor: bone → cream over time
    k = ease_io(clamp(t / 15.0))
    base = tuple(int(BONE[i] * (1 - k) + CREAM[i] * k) for i in range(3))
    # subtle radial vignette
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    cx, cy = W / 2, H * 0.45
    rr = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2) / (H * 0.7)
    vign = np.clip(1.0 - rr * 0.18, 0.65, 1.0)
    arr = np.zeros((H, W, 3), dtype=np.float32)
    for c in range(3):
        arr[..., c] = base[c] * vign
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), "RGB").convert("RGBA")


def particles(t, count=80, seed=11):
    rng = np.random.default_rng(seed)
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    for i in range(count):
        # each particle drifts with own phase
        seed_i = rng.integers(0, 10_000)
        rr = np.random.default_rng(seed_i)
        x0 = rr.random() * W
        y0 = rr.random() * H
        vx = (rr.random() - 0.5) * 30
        vy = -10 - rr.random() * 25
        x = (x0 + vx * t) % W
        y = (y0 + vy * t) % H
        r = 1 + rr.random() * 2.5
        a = int(40 + rr.random() * 60)
        d.ellipse([x - r, y - r, x + r, y + r], fill=(140, 130, 120, a))
    return layer.filter(ImageFilter.GaussianBlur(radius=0.8))


def make_mascot(path, target_h, mirror=False):
    im = Image.open(path).convert("RGBA")
    w0, h0 = im.size
    scale = target_h / h0
    im = im.resize((max(1, int(w0 * scale)), target_h), Image.LANCZOS)
    if mirror:
        im = im.transpose(Image.FLIP_LEFT_RIGHT)
    return im


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


def iris_sweep(t):
    """Soft horizontal iris band that sweeps left→right over a couple of seconds."""
    band_w = int(W * 0.35)
    x_center = int(-band_w + (W + band_w * 2) * ease_io(clamp((t - 11.0) / 1.6)))
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    arr = np.zeros((H, W, 4), dtype=np.uint8)
    for x in range(max(0, x_center - band_w), min(W, x_center + band_w)):
        dist = (x - x_center) / band_w
        u = (x / W + t * 0.15) % 1.0
        c = iris_color(u)
        a = int(180 * (1 - dist * dist))
        arr[:, x, 0] = c[0]
        arr[:, x, 1] = c[1]
        arr[:, x, 2] = c[2]
        arr[:, x, 3] = a
    return Image.fromarray(arr, "RGBA")


def constellation_titles():
    return [
        ("01 · CREATING STRUCTURE",      (-0.32, -0.30)),
        ("03 · SURVIVING & THRIVING",    ( 0.34, -0.34)),
        ("05 · THE SDR PLAYBOOK",        (-0.40,  0.05)),
        ("07 · PROSPECTING & PIPELINE",  ( 0.38,  0.02)),
        ("09 · CALLED TO LEAD",          (-0.30,  0.32)),
        ("12 · RELATIONSHIPS & BALANCE", ( 0.32,  0.34)),
    ]


def render_frame(idx, mascot_full):
    t = idx / FPS
    img = gradient_bg(t)
    d = ImageDraw.Draw(img)

    # ─── Camera: extreme close-up of mascot at t=0, pulls back over 9s ───
    # scale goes from ~3.0x → 1.0x
    scale = 3.0 - 2.0 * ease_out_quad(clamp(t / 9.0))
    target_h = int(880 * scale)
    cur = mascot_full.copy()
    w0, h0 = cur.size
    new_h = target_h
    new_w = int(w0 * (new_h / h0))
    cur = cur.resize((new_w, new_h), Image.LANCZOS)
    # offset: when zoomed, look at the eye region (upper-left of mascot)
    eye_dx = int(-new_w * 0.08 + (new_w * 0.08) * ease_out_quad(clamp(t / 9.0)))
    eye_dy = int(-new_h * 0.18 + (new_h * 0.18) * ease_out_quad(clamp(t / 9.0)))
    cx = W // 2 + eye_dx
    cy = int(H * 0.50) + eye_dy
    paste_centered(img, cur, cx, cy)

    # Mascot opacity: hint at first, full presence by ~2s
    if t < 2.0:
        veil = Image.new("RGBA", (W, H), CREAM + (int((1 - t / 2.0) * 80),))
        img = Image.alpha_composite(img, veil)

    # Caveat-style annotation: "(this is Leponeus.)"
    if 3.5 < t < 8.5:
        a = fade(t, 3.5, 4.4, 7.6, 8.5)
        if a > 0:
            f_ann = ImageFont.truetype(F_IT, 36)
            note = "(this is Leponeus.)"
            layer = Image.new("RGBA", (700, 80), (0, 0, 0, 0))
            ld = ImageDraw.Draw(layer)
            ld.text((0, 0), note, font=f_ann, fill=MUTED + (int(220 * a),))
            img.alpha_composite(layer, (int(W * 0.62), int(H * 0.66)))
            # hand-drawn arrow
            x1, y1 = int(W * 0.60), int(H * 0.68)
            x2, y2 = int(W * 0.52), int(H * 0.55)
            for k in range(20):
                u = k / 20
                xa = int(x1 + (x2 - x1) * u + math.sin(u * 6) * 4)
                ya = int(y1 + (y2 - y1) * u + math.cos(u * 5) * 3)
                d.ellipse([xa - 2, ya - 2, xa + 2, ya + 2], fill=MUTED + (int(180 * a),))

    # ─── 5–11s · Constellation of lesson titles fade in ───
    if 5.0 < t < 12.5:
        f_const = ImageFont.truetype(F_IT, 32)
        for i, (title, (dx, dy)) in enumerate(constellation_titles()):
            t_in = 5.0 + i * 0.7
            a = fade(t, t_in, t_in + 1.0, 11.6, 12.4)
            if a > 0:
                # highlight Surviving & Thriving on its own beat
                is_focus = "SURVIVING" in title and t > 8.6
                if is_focus:
                    pulse = 0.85 + 0.15 * math.sin((t - 8.6) * 5.0)
                    col = CRIMSON
                    aa = a * pulse
                else:
                    col = INK
                    aa = a * 0.55
                # gentle floating offset
                fx = math.sin(t * 0.6 + i) * 6
                fy = math.cos(t * 0.5 + i) * 4
                x = int(W * 0.5 + W * dx + fx)
                y = int(H * 0.50 + H * dy + fy)
                tl = Image.new("RGBA", (700, 80), (0, 0, 0, 0))
                ld = ImageDraw.Draw(tl)
                ld.text((0, 0), title, font=f_const, fill=col + (int(255 * aa),))
                bbox = ld.textbbox((0, 0), title, font=f_const, anchor="lt")
                tw = bbox[2] - bbox[0]
                img.alpha_composite(tl, (x - tw // 2, y))

    # ─── Particles (atmospheric dust) ───
    if t < 13.0:
        a = fade(t, 0.5, 1.5, 11.5, 13.0)
        if a > 0:
            p = particles(t, count=70)
            pa = np.array(p)
            pa[..., 3] = (pa[..., 3] * a).astype(np.uint8)
            img.alpha_composite(Image.fromarray(pa, "RGBA"))

    # ─── 11–12.6s · Iris sweep wash ───
    if 11.0 < t < 12.8:
        sweep = iris_sweep(t)
        sa = np.array(sweep)
        # fade in/out
        a_sweep = fade(t, 11.0, 11.4, 12.2, 12.8) * 0.55
        sa[..., 3] = (sa[..., 3] * a_sweep).astype(np.uint8)
        img.alpha_composite(Image.fromarray(sa, "RGBA"))

    # ─── 12.5–15s · Final wordmark + CTA ───
    if t > 12.3:
        # wash to cream
        wash_a = fade(t, 12.3, 13.0, 14.9, 15.0)
        if wash_a > 0:
            veil = Image.new("RGBA", (W, H), CREAM + (int(255 * wash_a),))
            img = Image.alpha_composite(img, veil)
        # wordmark
        a = fade(t, 12.8, 13.4, 14.7, 15.0)
        if a > 0:
            f_brand = ImageFont.truetype(F_DISP, 200)
            phase = t * 0.18
            wm = iris_wordmark("AESDR", f_brand, phase)
            wa = np.array(wm)
            wa[..., 3] = (wa[..., 3] * a).astype(np.uint8)
            wm = Image.fromarray(wa, "RGBA")
            paste_centered(img, wm, W * 0.5, H * 0.36)
            # CTA
            f_cta = ImageFont.truetype(F_IT, 42)
            tl = Image.new("RGBA", (W, 100), (0, 0, 0, 0))
            ld = ImageDraw.Draw(tl)
            ld.text((W // 2, 0), "Read by Michael. Endorsed by Rowan.",
                    font=f_cta, fill=INK + (int(255 * a),), anchor="mt")
            img.alpha_composite(tl, (0, int(H * 0.52)))
            # url tag
            f_url = ImageFont.truetype(F_MONO, 22)
            tl2 = Image.new("RGBA", (W, 60), (0, 0, 0, 0))
            ld2 = ImageDraw.Draw(tl2)
            ld2.text((W // 2, 0), "aesdr.com", font=f_url,
                     fill=MUTED + (int(220 * a),), anchor="mt")
            img.alpha_composite(tl2, (0, int(H * 0.62)))

    return img


def main():
    print("[mockup-C] preloading assets…")
    mascot_full = make_mascot(MASCOT_SPRINT, 880)
    tmp = tempfile.mkdtemp(prefix="mockup-c-")
    print(f"[mockup-C] rendering {N} frames → {tmp}")
    for i in range(N):
        if i % 30 == 0:
            print(f"  frame {i}/{N}")
        f = render_frame(i, mascot_full)
        f.convert("RGB").save(os.path.join(tmp, f"f-{i:04d}.png"), "PNG", optimize=False)
    out = ROOT / "scripts/demo/out/mockups/mockup-c.mp4"
    out.parent.mkdir(parents=True, exist_ok=True)
    print(f"[mockup-C] encoding → {out}")
    subprocess.check_call([
        "ffmpeg", "-y",
        "-framerate", str(FPS),
        "-i", os.path.join(tmp, "f-%04d.png"),
        "-c:v", "libx264", "-crf", "18", "-preset", "medium",
        "-pix_fmt", "yuv420p",
        str(out),
    ])
    print(f"[mockup-C] done → {out}")


if __name__ == "__main__":
    main()
