# BIMI setup — get the AESDR logo to show next to emails (R5-DV-7)

**Goal:** your brand mark appears next to AESDR emails in Gmail, Apple Mail, Yahoo,
and Fastmail. **Status:** not done — it needs a cert + DNS + a logo file that only
you can put in place. This is the checklist.

## What's already true (the hard prerequisite)
BIMI only works when your domain enforces DMARC at quarantine or reject. **You're
there** — the mxtoolbox check on 2026-06-29 shows DMARC published + quarantine/
reject enforced. That's the gate most people fail; you've cleared it.

## The three things still needed

### 1. A square logo mark in SVG-PS format
- BIMI requires **SVG Tiny 1.2 Portable/Secure (SVG-PS)** — a locked-down SVG
  profile: a **square** viewBox (1:1), a `baseProfile="tiny-ps"` attribute, a
  `<title>`, **no** scripts, no external references, no raster images, no
  animation, ≤ 32 KB.
- Our current `public/brand/asset-wordmark.svg` is a wide wordmark — **won't work**
  (BIMI needs a square mark, not a wordmark). The `ceramic-bunny-mask-cutout` is
  the natural candidate, redrawn as a square vector, or a simple "AE/SDR" monogram.
- **I can draft the SVG-PS file** from a square source mark you point me at (or
  approve a monogram), then you validate it at https://bimigroup.org/bimi-generator/
  before publishing. Producing it blind from the tall PNG would likely fail
  validation, so this needs a designer's square mark or your sign-off on a monogram.

### 2. A VMC (Verified Mark Certificate) — the paid/legal part
- **Gmail requires a VMC** to actually render the logo (Yahoo/Apple will show it
  with just the record, but Gmail is the one you care about).
- Issued by **DigiCert** or **Entrust**. ~**$1,000–1,500/year**.
- Requires a **registered trademark** of the exact mark (USPTO or equivalent). If
  AESDR's mark isn't trademarked yet, that's the long pole — trademark first, then
  the VMC. (Google is piloting a cheaper "CMC/Common Mark Certificate" that doesn't
  need a registered trademark but shows a generic indicator — worth checking if you
  don't want to trademark yet.)
- The VMC is a `.pem` file you host (e.g. at `https://aesdr.com/brand/vmc.pem`).

### 3. The DNS record (you add this in Cloudflare)
Once the SVG and VMC are hosted, add a TXT record:

```
Name:  default._bimi.aesdr.com
Type:  TXT
Value: v=BIMI1; l=https://aesdr.com/brand/bimi-logo.svg; a=https://aesdr.com/brand/vmc.pem
```

(`l` = logo URL, `a` = VMC URL. You can publish with `l` only and no `a` to get
Yahoo/Apple now, then add `a` once the VMC is issued for Gmail.)

## The realistic order
1. Decide the mark (square redraw of the bunny, or a monogram). → I draft the SVG-PS.
2. Trademark the mark if it isn't already (longest step).
3. Buy the VMC from DigiCert/Entrust against the trademark.
4. Host the SVG + the `.pem` under `public/brand/`.
5. Add the `default._bimi` TXT record in Cloudflare.
6. Re-run the mxtoolbox BIMI check — the warning flips green.

**What I can do now:** draft the SVG-PS logo file once you point me at a square
mark or approve a monogram, and wire it under `public/brand/`. **What's yours:** the
trademark, the VMC purchase, and the DNS record.
