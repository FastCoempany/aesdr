"""
Shared helpers for the 45s commercial-grade motion mockups.

Each variant_{a,b,c}.py is the storyboard. This module is the cinematography
toolkit — palette, fonts, eased fades, mascot caching, scene fragments
(lesson card, journey row, lesson header, interactive mocks, logo strip,
validated-by colophon), and the post-passes that make raw frames feel
like film: letterbox bars, film grain, vignette, light leaks.
"""

from __future__ import annotations

import math
import random
from functools import lru_cache
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H = 1920, 1080
FPS = 30
DURATION = 45
N = FPS * DURATION

# 2.39:1 letterbox: visible band height
LETTER_H = 803
LETTER_TOP = (H - LETTER_H) // 2  # 138

CREAM = (250, 247, 242)
INK = (26, 26, 26)
CRIMSON = (139, 26, 26)
MUTED = (107, 107, 107)
LIGHT = (232, 228, 223)
WARM_BONE = (232, 220, 196)
PARCHMENT = (244, 238, 226)

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
F_DISP_BI = str(ROOT / "public/fonts/Playfair-BoldItalic-Static.ttf")
F_DISP_BL = str(ROOT / "public/fonts/Playfair-BlackItalic-Static.ttf")
F_IT = str(ROOT / "public/fonts/Playfair-Italic.ttf")
F_REG = str(ROOT / "public/fonts/Playfair.ttf")
F_BODY = str(ROOT / "public/fonts/LibreBaskerville-Italic.ttf")
F_BODY_B = str(ROOT / "public/fonts/LibreBaskerville-Bold.ttf")
F_MONO = "/usr/share/fonts/truetype/liberation/LiberationMono-Regular.ttf"
F_MONO_B = "/usr/share/fonts/truetype/liberation/LiberationMono-Bold.ttf"
F_SANS = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"
F_SANS_B = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"

MASCOT_PATHS = {
    "rest":     ROOT / "public/mascot/leponeus-rest.png",
    "sprint":   ROOT / "public/mascot/leponeus-sprint.png",
    "verdict":  ROOT / "public/mascot/leponeus-verdict.png",
    "doctrine": ROOT / "public/mascot/leponeus-doctrine.png",
    "diagnosis":ROOT / "public/mascot/leponeus-diagnosis.png",
    "owner":    ROOT / "public/mascot/leponeus-owner.png",
    "fall":     ROOT / "public/mascot/leponeus-fall.png",
    "recovery": ROOT / "public/mascot/leponeus-recovery.png",
}

LESSONS = [
    ("01", "Creating Structure",       "You think you're ready. You're not."),
    ("02", "Breaking Down Silos",      "Your team is working against you."),
    ("03", "Surviving & Thriving",     "Nobody is coming to save you."),
    ("04", "Navigating the Workplace", "Fear is a choice. A poor one."),
    ("05", "The SDR Playbook",         "Your outreach is a confession letter."),
    ("06", "Building Real Camaraderie","When did your team last feel like one?"),
    ("07", "Prospecting & Pipeline",   "If inbound dried up tomorrow."),
    ("08", "The Discovery Reset",      "You don't have a deal. You have a hope."),
    ("09", "Called to Lead",           "You manage what they did. Lead what they could."),
    ("10", "Compensation Realities",   "The only question is whether you're ready."),
    ("11", "Sober Selling",            "One thread. One champion. One prayer."),
    ("12", "Relationships & Balance",  "This is where you stop reading. No mercy."),
]

VALIDATED = [
    ("Harvey",       "$8B"),
    ("Pendo",        "$2.6B"),
    ("Job&Talent",   "$2.35B"),
    ("OpenGov",      "$1.8B acq."),
    ("Scribe",       "$1.3B"),
    ("Superhuman",   "acq. by Grammarly"),
    ("CADDi",        "$470M"),
    ("Filevine",     "$400M raised"),
    ("Aisera",       "acq. Automation Anywhere"),
    ("k-ID",         "$51M · a16z"),
    ("Lorikeet",     "$51M raised"),
    ("Craft",        "$42M raised"),
    ("Smokeball",    "$30M"),
    ("Rally UXR",    "$20M raised"),
    ("Parable",      "$16.5M seed"),
    ("Shapr3D",      ""),
    ("Sybill",       ""),
    ("HeyMilo",      ""),
    ("Clearbrief",   ""),
    ("Moonhub",      ""),
    ("harpin AI",    ""),
    ("Newscatcher",  ""),
    ("Duckie",       ""),
]


# ─── Math + ease helpers ──────────────────────────────────────────────

def clamp(x, lo=0.0, hi=1.0):
    return max(lo, min(hi, x))


def ease_io(t):
    return 0.5 - 0.5 * math.cos(math.pi * clamp(t))


def ease_in(t):
    t = clamp(t)
    return t * t * t


def ease_out(t):
    t = clamp(t)
    return 1 - (1 - t) ** 3


def fade(t, t_in, t_full_in, t_full_out, t_out):
    if t < t_in or t > t_out:
        return 0.0
    if t < t_full_in:
        return ease_io((t - t_in) / max(1e-6, t_full_in - t_in))
    if t < t_full_out:
        return 1.0
    return ease_io(1.0 - (t - t_full_out) / max(1e-6, t_out - t_full_out))


def lerp(a, b, k):
    return a + (b - a) * k


def iris_color(u):
    u = u % 1.0
    for i in range(len(IRIS) - 1):
        s0, c0 = IRIS[i]
        s1, c1 = IRIS[i + 1]
        if s0 <= u <= s1:
            k = (u - s0) / (s1 - s0)
            return tuple(int(c0[j] + (c1[j] - c0[j]) * k) for j in range(3))
    return IRIS[-1][1]


# ─── Mascot caching ───────────────────────────────────────────────────

@lru_cache(maxsize=None)
def _load_mascot_raw(pose: str) -> Image.Image:
    return Image.open(str(MASCOT_PATHS[pose])).convert("RGBA")


def mascot(pose: str, h: int, mirror: bool = False) -> Image.Image:
    im = _load_mascot_raw(pose)
    scale = h / im.size[1]
    im = im.resize((max(1, int(im.size[0] * scale)), h), Image.LANCZOS)
    if mirror:
        im = im.transpose(Image.FLIP_LEFT_RIGHT)
    return im


def with_alpha(img: Image.Image, alpha: float) -> Image.Image:
    arr = np.array(img)
    arr[..., 3] = (arr[..., 3] * clamp(alpha)).astype(np.uint8)
    return Image.fromarray(arr, "RGBA")


# ─── Compositing helpers ──────────────────────────────────────────────

def paste_centered(canvas: Image.Image, layer: Image.Image, cx, cy):
    canvas.alpha_composite(layer, (int(cx - layer.size[0] // 2), int(cy - layer.size[1] // 2)))


def text_layer(text: str, font: ImageFont.FreeTypeFont, color, alpha=1.0):
    """Render text on a snug transparent canvas at the given alpha."""
    probe = Image.new("RGBA", (1, 1))
    bbox = ImageDraw.Draw(probe).textbbox((0, 0), text, font=font, anchor="lt")
    pad = 24
    tw = bbox[2] - bbox[0] + pad * 2
    th = bbox[3] - bbox[1] + pad * 2
    layer = Image.new("RGBA", (tw, th), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    d.text((pad - bbox[0], pad - bbox[1]), text, font=font,
           fill=color + (int(255 * clamp(alpha)),))
    return layer


def text_centered(canvas, text, font, color, cx, cy, alpha=1.0):
    layer = text_layer(text, font, color, alpha)
    paste_centered(canvas, layer, cx, cy)


def iris_text(text: str, font: ImageFont.FreeTypeFont, t_phase: float, alpha=1.0):
    """Text masked by a horizontally scrolling iris gradient.

    Returns RGBA layer. Direct alpha assembly (no PIL paste-with-mask)
    so anti-aliased edges don't drop the bottom half of glyphs.
    """
    probe = Image.new("RGBA", (1, 1))
    bbox = ImageDraw.Draw(probe).textbbox((0, 0), text, font=font, anchor="lt")
    pad = 80
    tw = max(2, bbox[2] - bbox[0] + pad * 2)
    th = max(2, bbox[3] - bbox[1] + pad * 2)

    # Build text mask
    mask = Image.new("L", (tw, th), 0)
    ImageDraw.Draw(mask).text(
        (pad - bbox[0], pad - bbox[1]),
        text, font=font, fill=int(255 * clamp(alpha)),
    )

    # Build RGBA gradient with alpha taken directly from the mask
    grad = np.zeros((th, tw, 4), dtype=np.uint8)
    for x in range(tw):
        u = (x / tw + t_phase) % 1.0
        c = iris_color(u)
        grad[:, x, 0] = c[0]
        grad[:, x, 1] = c[1]
        grad[:, x, 2] = c[2]
    grad[..., 3] = np.array(mask)
    return Image.fromarray(grad, "RGBA")


# ─── Scene fragments — the course teases ──────────────────────────────

def render_lesson_card(num: str, title: str, body: str, w=640, h=420, iris_phase=0.0):
    """Lesson preview card — cream paper, iris hairline, number + title + body."""
    layer = Image.new("RGBA", (w, h), (255, 255, 255, 255))
    d = ImageDraw.Draw(layer)
    # iris hairline at top
    for x in range(w):
        u = (x / w + iris_phase) % 1.0
        d.line([(x, 0), (x, 4)], fill=iris_color(u))
    # subtle shadow on right + bottom (drawn after)
    # number
    f_num = ImageFont.truetype(F_DISP_BI, 96)
    d.text((36, 22), num, font=f_num, fill=INK)
    # eyebrow
    f_eb = ImageFont.truetype(F_MONO, 16)
    d.text((36, 132), "LESSON", font=f_eb, fill=MUTED)
    # title (Playfair italic)
    f_t = ImageFont.truetype(F_DISP_BI, 52)
    # break title onto two lines if too wide
    if d.textbbox((0, 0), title, font=f_t)[2] > w - 64:
        words = title.split()
        mid = len(words) // 2
        l1 = " ".join(words[:mid])
        l2 = " ".join(words[mid:])
        d.text((36, 170), l1, font=f_t, fill=INK)
        d.text((36, 230), l2, font=f_t, fill=INK)
    else:
        d.text((36, 188), title, font=f_t, fill=INK)
    # body
    f_b = ImageFont.truetype(F_BODY, 22)
    d.text((36, 320), body, font=f_b, fill=(80, 80, 80))
    # corner peel-cue
    f_cue = ImageFont.truetype(F_MONO, 13)
    d.text((w - 36, h - 30), "PEEL →", font=f_cue, fill=MUTED, anchor="rm")

    # outline
    d.rectangle([0, 0, w - 1, h - 1], outline=(180, 175, 168), width=1)
    return layer


def render_dashboard_row(num: str, title: str, body: str, completed: bool, w=900):
    """Single journey-page row: completed checkmark or lock, italic title, body."""
    h = 110
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    # checkmark or muted dot
    if completed:
        d.ellipse([0, 12, 28, 40], fill=CRIMSON)
        d.line([(7, 26), (12, 32), (22, 20)], fill=CREAM, width=3)
    else:
        d.ellipse([0, 12, 28, 40], outline=(200, 195, 188), width=2)
    # eyebrow
    f_eb = ImageFont.truetype(F_MONO, 13)
    d.text((48, 4), "COMPLETED" if completed else f"LESSON {num}",
           font=f_eb, fill=MUTED)
    # title
    f_t = ImageFont.truetype(F_DISP_BI, 32)
    col = INK if completed else (130, 125, 115)
    d.text((48, 24), title, font=f_t, fill=col)
    # body
    f_b = ImageFont.truetype(F_BODY, 18)
    d.text((48, 68), body, font=f_b, fill=(100, 95, 88))
    return layer


def render_journey_header(t_phase=0.0, w=1100):
    """Mascot + 'The Journey · 6 down. 6 to go.' heading like dashboard."""
    h = 200
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    # mascot left
    m = mascot("rest", 160)
    layer.alpha_composite(m, (10, 20))
    # eyebrow
    d = ImageDraw.Draw(layer)
    f_eb = ImageFont.truetype(F_MONO, 16)
    d.text((220, 56), "THE JOURNEY", font=f_eb, fill=MUTED)
    # headline
    f_h = ImageFont.truetype(F_DISP_BI, 84)
    d.text((220, 80), "6 down. 6 to go.", font=f_h, fill=INK)
    return layer


def render_lesson_header(w=1500, t_phase=0.0):
    """Top of an in-lesson page: Save & Exit pill (left), iris AESDR + Leponeus (center), progress (right)."""
    h = 72
    layer = Image.new("RGBA", (w, h), CREAM + (255,))
    d = ImageDraw.Draw(layer)
    # save & exit pill
    f_pill = ImageFont.truetype(F_MONO, 11)
    d.rectangle([20, 24, 158, 56], outline=(160, 155, 150), width=1)
    d.text((30, 36), "← SAVE & EXIT", font=f_pill, fill=(99, 96, 96), anchor="lm")
    # leponeus mascot + AESDR center
    mm = mascot("rest", 56)
    layer.alpha_composite(mm, (w // 2 - 90, 10))
    # AESDR iris
    f_brand = ImageFont.truetype(F_DISP_BI, 38)
    iris_wm = iris_text("AESDR", f_brand, t_phase)
    paste_centered(layer, iris_wm, w // 2 + 30, 36)
    # section progress right
    f_sec = ImageFont.truetype(F_MONO, 11)
    d.text((w - 200, 36), "SECTION 02", font=f_sec, fill=(99, 96, 96), anchor="lm")
    # tiny iris progress bar
    bar_x = w - 80
    bar_y = 36
    for k in range(60):
        u = (k / 60 + t_phase) % 1.0
        c = iris_color(u)
        d.line([(bar_x + k, bar_y - 2), (bar_x + k, bar_y + 2)], fill=c)
    # bottom hairline
    d.line([(0, h - 1), (w, h - 1)], fill=(210, 205, 198))
    return layer


def render_silo_dragdrop(w=1200, t=0.0):
    """3-zone categorisation mock — silo cards animating into bins."""
    h = 360
    layer = Image.new("RGBA", (w, h), (255, 255, 255, 255))
    d = ImageDraw.Draw(layer)
    f_eb = ImageFont.truetype(F_MONO, 13)
    f_t = ImageFont.truetype(F_DISP_BI, 26)
    f_b = ImageFont.truetype(F_BODY, 16)
    bins = ["LEGACY", "LOOP", "EXPERIMENT"]
    bin_w = (w - 40) // 3
    for i, label in enumerate(bins):
        x0 = 20 + i * bin_w + 10
        x1 = x0 + bin_w - 20
        # bin border
        d.rectangle([x0, 70, x1, h - 20], outline=(180, 175, 168), width=2)
        d.text((x0 + 16, 20), label, font=f_eb, fill=MUTED)
        # dropped cards (animated drop-in)
        drop_t = clamp((t - i * 0.25) / 0.6)
        if drop_t > 0:
            y_offset = int(120 * (1 - ease_out(drop_t)))
            card_top = 90 - y_offset
            card_h = 56
            d.rectangle([x0 + 8, card_top, x1 - 8, card_top + card_h],
                        fill=(218, 240, 196, int(255 * drop_t)))
            d.text((x0 + 16, card_top + 8), "Outbound playbook 2.0", font=f_b, fill=INK)
            d.text((x0 + 16, card_top + 28), "Built last quarter", font=f_b, fill=(110, 105, 95))
    d.rectangle([0, 0, w - 1, h - 1], outline=(180, 175, 168), width=1)
    return layer


def render_bant_pick(w=1100, picked_idx: int = -1):
    """A 4-option lead-qualification picker — 'HIGH/LOW' style."""
    h = 280
    layer = Image.new("RGBA", (w, h), (255, 255, 255, 255))
    d = ImageDraw.Draw(layer)
    f_eb = ImageFont.truetype(F_MONO, 12)
    f_t = ImageFont.truetype(F_BODY_B, 22)
    f_btn = ImageFont.truetype(F_MONO_B, 14)
    rows = [
        ("COLD OUTREACH · REVOPS",  "\"Quick question about your SDR ramp time\""),
        ("GENERIC SAAS OUTREACH",   "\"Introducing [Company] — Transform Your Sales\""),
        ("TIMELY TRIGGER",          "\"Saw the Series B announcement — one question\""),
        ("BENEFIT-FIRST EMAIL",     "\"How we helped [Company] increase revenue 40%\""),
    ]
    for i, (eb, t) in enumerate(rows):
        y = 16 + i * 60
        d.text((24, y + 4), eb, font=f_eb, fill=MUTED)
        d.text((24, y + 22), t, font=f_t, fill=INK)
        # H/L buttons right side
        for j, (label, col) in enumerate([("↑ HIGH", (90, 160, 110)), ("↓ LOW", (190, 90, 80))]):
            bx = w - 240 + j * 110
            by = y + 12
            if i == picked_idx and j == 0:
                d.rectangle([bx, by, bx + 96, by + 30], fill=col + (255,))
                d.text((bx + 48, by + 15), label, font=f_btn, fill=CREAM, anchor="mm")
            else:
                d.rectangle([bx, by, bx + 96, by + 30], outline=col + (200,), width=1)
                d.text((bx + 48, by + 15), label, font=f_btn, fill=col, anchor="mm")
        # divider
        if i < len(rows) - 1:
            d.line([(20, y + 56), (w - 20, y + 56)], fill=(220, 215, 208))
    d.rectangle([0, 0, w - 1, h - 1], outline=(180, 175, 168), width=1)
    return layer


def render_validated_strip(alpha=1.0, w=1600, t_phase=0.0):
    """Static colophon. Kept for back-compat — use render_validated_marquee
    for the scrolling in-motion version."""
    h = 80
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    f_eb = ImageFont.truetype(F_MONO, 12)
    d.text((w // 2, 0), "VALIDATED BY", font=f_eb,
           fill=MUTED + (int(180 * alpha),), anchor="mt")
    names = [v[0] for v in VALIDATED[:6]]
    f_n = ImageFont.truetype(F_BODY_B, 17)
    spacing = w // (len(names) + 1)
    for i, n in enumerate(names):
        x = spacing * (i + 1)
        wobble = math.sin(t_phase * 2 + i) * 2
        d.text((x, 40 + wobble), n, font=f_n,
               fill=INK + (int(180 * alpha),), anchor="mm")
    return layer


def render_validated_marquee(alpha=1.0, t: float = 0.0, w=1920, scroll_px_per_s=60):
    """Scrolling validator marquee — Playfair italic names, mono badges,
    cycles continuously. Used in the closing card.
    """
    h = 110
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)

    # Eyebrow centered above the marquee row
    f_eb = ImageFont.truetype(F_MONO, 13)
    d.text((w // 2, 0), "VALIDATED ACROSS THE FASTCOEMPANY PORTFOLIO",
           font=f_eb, fill=MUTED + (int(200 * alpha),), anchor="mt")

    f_n = ImageFont.truetype(F_DISP_BI, 26)
    f_b = ImageFont.truetype(F_MONO, 14)

    # Pre-measure each name+badge segment width
    probe = Image.new("RGBA", (1, 1))
    pd = ImageDraw.Draw(probe)
    GAP = 64
    SEP_W = 26
    segments = []
    for name, badge in VALIDATED:
        name_w = pd.textbbox((0, 0), name, font=f_n)[2]
        badge_w = pd.textbbox((0, 0), badge, font=f_b)[2] if badge else 0
        seg_w = name_w + (12 + badge_w if badge else 0)
        segments.append((name, badge, name_w, badge_w, seg_w))

    total_w = sum(s[4] + GAP + SEP_W for s in segments)

    # Scroll offset: cycles through total_w
    offset = (t * scroll_px_per_s) % total_w

    # Render twice (offset and offset + total_w) so the wrap is seamless
    y_baseline = 56
    for pass_idx in range(2):
        x = -offset + pass_idx * total_w
        for name, badge, name_w, badge_w, seg_w in segments:
            if x + seg_w < 0:
                x += seg_w + GAP + SEP_W
                continue
            if x > w:
                break
            d.text((x, y_baseline), name, font=f_n,
                   fill=INK + (int(220 * alpha),))
            if badge:
                d.text((x + name_w + 12, y_baseline + 8), badge, font=f_b,
                       fill=CRIMSON + (int(220 * alpha),))
            x += seg_w + GAP
            # subtle dot separator
            d.ellipse([x + SEP_W // 2 - 3, y_baseline + 14,
                       x + SEP_W // 2 + 3, y_baseline + 20],
                      fill=MUTED + (int(160 * alpha),))
            x += SEP_W

    # Edge fades so the marquee dissolves at the canvas edges
    fade_w = 220
    arr = np.array(layer)
    for x in range(fade_w):
        k = x / fade_w
        arr[:, x, 3] = (arr[:, x, 3] * k).astype(np.uint8)
        arr[:, w - 1 - x, 3] = (arr[:, w - 1 - x, 3] * k).astype(np.uint8)
    return Image.fromarray(arr, "RGBA")


# ─── Post-passes (cinematic look) ─────────────────────────────────────

def letterbox(img: Image.Image) -> Image.Image:
    """Black bars top/bottom for 2.39:1 widescreen feel."""
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, W, LETTER_TOP], fill=(0, 0, 0, 255))
    d.rectangle([0, H - LETTER_TOP, W, H], fill=(0, 0, 0, 255))
    return img


def vignette(img: Image.Image, strength=0.30) -> Image.Image:
    arr = np.array(img).astype(np.float32)
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    cx, cy = W / 2, H / 2
    rr = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2) / (math.hypot(W, H) / 2)
    v = np.clip(1.0 - rr * strength, 1.0 - strength, 1.0)
    arr[..., :3] *= v[..., None]
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), "RGBA")


def film_grain(img: Image.Image, seed: int, strength=4) -> Image.Image:
    rng = np.random.default_rng(seed)
    g = rng.integers(-strength, strength + 1, size=(H, W), dtype=np.int16)
    arr = np.array(img).astype(np.int16)
    for c in range(3):
        arr[..., c] = np.clip(arr[..., c] + g, 0, 255)
    return Image.fromarray(arr.astype(np.uint8), "RGBA")


def light_leak(img: Image.Image, t: float, color=(255, 160, 80), strength=70):
    """Soft warm bloom drifting across the frame."""
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    cx = int(-200 + (W + 400) * ((t * 0.05) % 1.0))
    cy = int(H * 0.4 + math.sin(t * 0.3) * 80)
    rmax = 700
    for r in range(rmax, 0, -40):
        k = 1.0 - r / rmax
        a = int(strength * k * k)
        d.ellipse([cx - r, cy - r, cx + r, cy + r],
                  fill=color + (a,))
    layer = layer.filter(ImageFilter.GaussianBlur(radius=40))
    return Image.alpha_composite(img, layer)


def apply_cinema(img: Image.Image, idx: int, t: float,
                 leak=True, leak_color=(255, 160, 80)) -> Image.Image:
    img = vignette(img, 0.28)
    if leak:
        img = light_leak(img, t, color=leak_color, strength=55)
    img = film_grain(img, idx, strength=4)
    img = letterbox(img)
    return img
