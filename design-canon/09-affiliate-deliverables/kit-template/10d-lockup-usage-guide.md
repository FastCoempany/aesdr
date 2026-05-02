# 10d — AESDR × Partner Lockup Usage Guide

> **What this is:** The rules for using the AESDR × Partner co-brand lockup. Lifts canon §6.6 partner co-branding zone and adds the practical worked examples partners need. The lockup is the most-visible cross-pollination of AESDR's brand and yours; the lockup-usage discipline is what keeps the cross-pollination from becoming a brand collision.
>
> **Approval status:** Per canon §16 + D22 §8.3, every co-branded asset that ships externally requires AESDR pre-approval — including any first-instance use of the lockup on a new surface. This guide tells you what's pre-cleared (the 3 supplied lockup files used as supplied) and what isn't (anything else).

---

## The supplied files

Three files in this kit, in folder `10-co-brand-lockup/`:

| File | Format | Use |
|---|---|---|
| `10a-lockup-horizontal.svg` | SVG, vector | Web headers, email banners, podcast cover art, anywhere a horizontal lockup fits |
| `10b-lockup-stacked.svg` | SVG, vector | Square or near-square placements — Instagram tile, podcast app icon overlay, square ad placement |
| `10c-lockup-on-cream.png` | PNG, 1280×400 | When you need a raster fallback (e.g., older email clients, slide deck embed where SVG fails) |

All three carry the canonical lockup syntax: **`AESDR` in `--display` italic 900, `×` in `--mono` 12px, `[PARTNER_MARK]` at matched x-height** (canon §6.6).

---

## Color rules (canon §6.6)

- **AESDR text mark:** `--ink` (`#1A1A1A`). Always. No black, no off-black.
- **The `×` glyph:** `--ink` (`#1A1A1A`). Sized so the `×` is visually subordinate to both marks — never larger than the smallest letterform on either side.
- **Partner mark:** Your canonical color, in your canonical render. AESDR is not opinionated about your brand color.
- **Background:** `--cream` (`#FAF7F2`) preferred; white acceptable; any other color is **forbidden** without pre-approval per canon §16. Specifically:
  - Forbidden: `--ink` background (white-on-black inverse). The lockup is designed for cream/white only.
  - Forbidden: `--crimson` background. Crimson is reserved for AESDR's editorial split hero left panel; the lockup overlapping crimson reads as compositional confusion.
  - Forbidden: any color that fights either brand mark.

---

## Sizing

- **Minimum width:** 240px wide for `10a-lockup-horizontal.svg`. Below 240px the `×` glyph and the wordmark stop reading at a glance.
- **Minimum width:** 160px wide for `10b-lockup-stacked.svg`. Below 160px both marks blur.
- **Maximum width:** unbounded — the lockup scales to vector; render at any size that fits the surface.
- **Aspect ratio:** preserved exactly. Do not stretch, squish, or skew. Your design tool's "free transform" is forbidden on the lockup.

## Clearspace

- **Minimum 24px clearspace** around all four sides of the lockup at any size (canon §6.6). Clearspace is empty cream/white — no other type, no other graphics, no decorative elements.
- The clearspace requirement is non-negotiable even on tight social tiles. If you can't fit 24px of clear space, the lockup placement is wrong; pick a different surface.

---

## Where the lockup goes (per canon §6.6)

| Surface | Placement |
|---|---|
| Partner-specific landing page | Top-center, in the page's header band |
| Partner-specific deck | Top-left of every slide except the editorial-split title cards (where the AESDR wordmark alone carries) |
| Email | Footer-only |
| Podcast cover art | Top-left or centered, on cream background |
| Social tile (square) | Centered, with 24px clearspace minimum |

## Where the lockup does NOT go

- **In the body of an email.** Email body has the AESDR wordmark only; lockup is footer-only per canon §6.6.
- **On the offer slide of the workshop deck.** Offer slide is full-bleed crimson with single iris CTA per D09 slide 16; lockup would compete.
- **As a watermark across a video.** A persistent watermark reads as content-engine output; per canon §1.5, AESDR is not content-engine.
- **On any retired-palette surface.** AESDR's editorial palette is non-negotiable; lockup on a dark-mode background fails canon §6.1 and the §6.9.1 thumbnail test.
- **As an avatar / profile picture.** Your profile picture is your mark, not a co-brand. Profile-picture co-branding implies an entity that doesn't exist.

---

## What you may NOT do to the lockup

- **Modify proportions.** No stretching, squishing, rotating, or skewing.
- **Change the typography.** AESDR is `--display` italic 900; partner mark is yours-as-supplied. Do not re-typeset AESDR in a different face.
- **Change the `×` glyph.** It's a multiplication sign in `--mono`, not an em-dash, not a plus sign, not a slash.
- **Add a third mark.** The lockup is two-mark by canon. A third entity ("AESDR × `[PARTNER]` × [SUB-PARTNER]") is forbidden — that's a different relationship than the pilot.
- **Add a tagline below the lockup** ("Partners in early-career sales!"). Forbidden — taglines belong in body type per `00-canon-excerpt.md` §14.
- **Add a sun-burst, ribbon, banner, "Limited Edition" badge** or any decorative frame. Per canon §6.5, no decorative iconography. The lockup is type and clearspace.
- **Animate the lockup.** No fade-ins, no rotation, no pulse, no shimmer. The brand's visual register is type-led-and-still.
- **Embed the lockup in a third-party logo wall** (e.g., "as featured on [PUBLICATION] alongside [OTHER LOGO]") without AESDR pre-approval.

---

## Approval gates (canon §16)

- **First instance of the lockup on a new surface for your partnership** — pre-approval before publish. Submit the layout 48h pre-publish per D40 §3.
  - Exception: posts using `09d-social-pre-approved-posts.md` are pre-cleared.
- **Any deviation from this guide** — pre-approval, with a specific named reason for the deviation.
- **Co-branded recordings** (workshop replay clips, podcast-format recordings that show the lockup) — pre-approval per canon §16 + D22 §8.4.
- **Print collateral** — pre-approval. Print is one-shot; getting it wrong is expensive in both directions.

## What's pre-cleared (no approval needed beyond placeholder fills)

- Lockup as supplied in any of `10a / 10b / 10c` files, used at native or scaled size.
- Lockup on cream or white background, with 24px clearspace, on:
  - Email footer, your newsletter / member channel.
  - Podcast cover art and audio platform tiles.
  - Social-media posts using copy from `09d`.
- Lockup embedded in `09a` newsletter sends.

---

## Five-question check (per canon §6.9.1)

Before you publish a co-branded asset, confirm:

1. **Thumbnail test:** Does the lockup read as identifiably AESDR at 200×200px? If the lockup is mashed against another graphic at thumbnail size, the placement is wrong.
2. **Token test:** Are AESDR's marks rendered in the supplied color and type? Any local re-typesetting is forbidden.
3. **Iris reservation:** Is the lockup overlapping any iris-rendered element? Iris is reserved for primary CTAs; the lockup must not appear inside or directly adjacent to an iris button.
4. **Icon discipline:** Is the lockup the only graphical mark in its zone? No other icons or decorative graphics within the 24px clearspace.
5. **Voice thumbnail:** Read the body of the surface aloud — is it identifiably AESDR? A correctly-placed lockup on off-brand body copy is still off-brand.

If any of the five fail, the surface needs a fix before publish.

---

## When you're not sure

Email `[OPS_EMAIL]` with a screenshot of the proposed asset and a one-sentence description of where it'll publish. Per D40 §3, AESDR responds within 24 business hours with APPROVED / APPROVED WITH EDITS / DECLINED.

The most common AESDR-side edit: increasing clearspace and removing decorative elements adjacent to the lockup. The most common decline: cropping the lockup, recoloring the AESDR mark, or composing it on a forbidden background.

---

*Source: canon §6.6 (partner co-branding zone) + canon §6.9 (visual QA discipline). Pre-cleared examples are partner-friendly extensions of the canon, not departures from it.*
