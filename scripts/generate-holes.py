"""
Generate procedural rabbit-hole PNG sprites.

Approach: render the mound as a CLUSTER of hundreds of overlapping
irregular clods at varied sizes and shades — closer to how a real
pile of excavated dirt actually looks (granular, asymmetric, gritty)
than any smooth-heightfield approximation. Each clod has a directional
shade based on the sun, so the pile reads as 3D from the lighting
alone.

Output: 4 transparent PNGs at /public/holes/hole-{1..4}.png.
"""

import math
import random
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

SEED = 741407


def make_hole(size: int, variant: int) -> Image.Image:
    W = H = size
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    random.seed(SEED + variant * 73)
    rng = random.Random(SEED + variant * 137)

    cx, cy = W / 2.0, H / 2.0

    # ─── geometry ───
    hole_rx = size * 0.24
    hole_ry = hole_rx * 0.78  # slight 3/4 view
    mound_outer_rx = hole_rx * 2.1
    mound_outer_ry = hole_ry * 1.95

    # Sun direction (azimuth in radians). Per-variant rotation.
    sun_angle = math.radians(-130 + variant * 50)  # different sun per variant
    sun_x = math.cos(sun_angle)
    sun_y = math.sin(sun_angle)

    # ─── 1. CAST SHADOW (blurred ellipse, offset away from sun) ───
    shadow_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow_layer)
    off_x = int(size * 0.05 * -sun_x)
    off_y = int(size * 0.05 * -sun_y)
    sd.ellipse(
        (
            cx - mound_outer_rx * 1.05 + off_x,
            cy - mound_outer_ry * 1.05 + off_y,
            cx + mound_outer_rx * 1.05 + off_x,
            cy + mound_outer_ry * 1.05 + off_y,
        ),
        fill=(0, 0, 0, 140),
    )
    shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(radius=size * 0.025))
    img.alpha_composite(shadow_layer)

    # ─── 2. CLOD CLUSTER (the mound) ───
    # Render many overlapping clods inside the mound zone. Each clod's
    # colour depends on its angular position relative to the sun (lit
    # side bright, shadow side dark). Density and clod size are biased
    # by the dot-product of position with the mound asymmetry vector,
    # so one side of the hole gets a thicker pile than the other.
    pile_angle = math.radians(-90 + variant * 47)  # which side the pile sits on
    pile_x = math.cos(pile_angle)
    pile_y = math.sin(pile_angle)

    N_CLODS = 540 + variant * 80
    for _ in range(N_CLODS):
        # Sample a point in the mound annulus (hole rim → mound outer)
        t = rng.random()
        # Most points cluster near the rim, fewer toward outer
        t = t ** 0.7
        r_factor = 0.95 + t * 1.15  # 0.95 → 2.10 in hole-radius units
        a = rng.random() * 2 * math.pi

        # Asymmetry: if this clod is on the BACK side from the pile, often skip
        bias = math.cos(a - pile_angle)  # +1 on pile side, -1 on opposite side
        if bias < 0 and rng.random() > 0.3 + (bias + 1) * 0.6:
            continue

        # Position on the elliptical mound
        px = cx + math.cos(a) * hole_rx * r_factor * 1.05
        py = cy + math.sin(a) * hole_ry * r_factor * 1.05

        # Jitter
        px += rng.uniform(-2.5, 2.5)
        py += rng.uniform(-2.5, 2.5)

        # Clod size: bigger when closer to the rim and on the pile side
        size_base = 2.5 + (1.0 - (r_factor - 0.95) / 1.15) * 5.5
        size_jitter = rng.uniform(0.7, 1.5)
        size_pile_boost = 1.0 + max(0.0, bias) * 0.8
        cr = size_base * size_jitter * size_pile_boost
        cry = cr * rng.uniform(0.6, 0.95)

        # Shade by orientation to sun
        # Surface normal of clod roughly points outward from hole centre
        nx = math.cos(a)
        ny = math.sin(a)
        # Diffuse term
        dot = nx * sun_x + ny * sun_y
        diffuse = max(0.0, dot)
        shade = 0.22 + 0.78 * diffuse  # 0.22 .. 1.0

        # Colour ramp dark-brown → tan
        dirt = (
            int(48 + (196 - 48) * shade + rng.uniform(-12, 12)),
            int(32 + (158 - 32) * shade + rng.uniform(-10, 10)),
            int(22 + (108 - 22) * shade + rng.uniform(-8, 8)),
        )
        dirt = tuple(max(0, min(255, c)) for c in dirt)

        # Drop shadow under each clod (soft)
        sh_off = max(1, int(cr * 0.4))
        draw.ellipse(
            (px - cr * 1.05 + sh_off, py - cry * 0.7 + sh_off, px + cr * 1.05 + sh_off, py + cry * 0.7 + sh_off),
            fill=(0, 0, 0, 60),
        )
        # Clod body
        draw.ellipse(
            (px - cr, py - cry, px + cr, py + cry),
            fill=dirt + (245,),
        )

    # Soft blur to bind the clods slightly (not too much — keep grit)
    img = img.filter(ImageFilter.GaussianBlur(radius=0.7))
    draw = ImageDraw.Draw(img)

    # ─── 3. THE HOLE (dark ellipse on top, with depth gradient) ───
    # Build a small array for the hole interior to get a radial gradient
    hole_img = Image.new("RGBA", (int(hole_rx * 2.4), int(hole_ry * 2.4)), (0, 0, 0, 0))
    hyy, hxx = np.mgrid[0 : hole_img.size[1], 0 : hole_img.size[0]].astype(float)
    h_cx = hole_img.size[0] / 2
    h_cy = hole_img.size[1] / 2
    h_dx = hxx - h_cx
    h_dy = hyy - h_cy
    h_norm = np.sqrt((h_dx / hole_rx) ** 2 + (h_dy / hole_ry) ** 2)

    h_alpha = np.where(h_norm < 1.0, 255, 0)
    # Soft anti-alias on edge
    edge = (h_norm > 0.93) & (h_norm < 1.0)
    h_alpha = np.where(edge, ((1.0 - (h_norm - 0.93) / 0.07) * 255).clip(0, 255), h_alpha)
    # Depth: darker toward centre, slightly warmer at rim
    depth = np.power((1.0 - h_norm.clip(0, 1)), 1.4)
    h_r = (10 - depth * 8).clip(0, 255)
    h_g = (8 - depth * 7).clip(0, 255)
    h_b = (6 - depth * 5).clip(0, 255)
    hole_rgba = np.zeros((hole_img.size[1], hole_img.size[0], 4), dtype=np.uint8)
    hole_rgba[..., 0] = h_r
    hole_rgba[..., 1] = h_g
    hole_rgba[..., 2] = h_b
    hole_rgba[..., 3] = h_alpha
    hole_img = Image.fromarray(hole_rgba, "RGBA").filter(ImageFilter.GaussianBlur(radius=0.6))
    img.alpha_composite(hole_img, dest=(int(cx - hole_img.size[0] / 2), int(cy - hole_img.size[1] / 2)))

    # ─── 4. RIM HIGHLIGHT on sun-facing edge ───
    # A short bright arc along the hole rim where the sun strikes
    rim_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    rl = ImageDraw.Draw(rim_layer)
    rim_arc_centre = sun_angle + math.pi  # the EARTH points toward the sun, so rim lit on the sun-facing side
    # PIL ellipse arc — approximate with a series of small bright dots along the rim
    for k in range(28):
        a = rim_arc_centre + (k / 28.0 - 0.5) * math.pi * 0.6
        # Density falloff at edges
        center_dist = abs(k / 28.0 - 0.5) * 2
        if rng.random() < center_dist * 0.6:
            continue
        px = cx + math.cos(a) * hole_rx * 0.99
        py = cy + math.sin(a) * hole_ry * 0.99
        rl.ellipse((px - 2, py - 1.2, px + 2, py + 1.2), fill=(212, 168, 112, 220))
    rim_layer = rim_layer.filter(ImageFilter.GaussianBlur(radius=0.8))
    img.alpha_composite(rim_layer)

    # ─── 5. SCATTERED LOOSE CLODS OUTSIDE the mound (flying debris) ───
    for _ in range(60 + variant * 10):
        a = rng.random() * 2 * math.pi
        # Bias toward the pile side
        bias = math.cos(a - pile_angle)
        if bias < -0.2 and rng.random() > 0.3:
            continue
        dist_factor = 1.05 + rng.random() * 0.55
        px = cx + math.cos(a) * mound_outer_rx * dist_factor + rng.uniform(-3, 3)
        py = cy + math.sin(a) * mound_outer_ry * dist_factor + rng.uniform(-3, 3)
        if px < 0 or px > W or py < 0 or py > H:
            continue
        cr = rng.uniform(1.0, 2.6)
        nx = math.cos(a)
        ny = math.sin(a)
        diffuse = max(0.0, nx * sun_x + ny * sun_y)
        shade = 0.22 + 0.78 * diffuse
        dirt = (
            int(48 + (186 - 48) * shade),
            int(32 + (148 - 32) * shade),
            int(22 + (98 - 22) * shade),
        )
        # Drop shadow
        draw.ellipse(
            (px - cr + 1.5, py - cr * 0.6 + 1.5, px + cr + 1.5, py + cr * 0.6 + 1.5),
            fill=(0, 0, 0, 100),
        )
        draw.ellipse((px - cr, py - cr * 0.8, px + cr, py + cr * 0.8), fill=dirt + (240,))

    return img


def main():
    variants = [(360, 0), (300, 1), (260, 2), (220, 3)]
    for size, v in variants:
        img = make_hole(size, v)
        path = f"public/holes/hole-{v + 1}.png"
        img.save(path, "PNG", optimize=True)
        print(f"wrote {path} ({size}x{size})")


if __name__ == "__main__":
    main()
