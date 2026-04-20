import sharp from "sharp";
import { readFileSync } from "fs";
import { join } from "path";

const TEMPLATE_PATH = join(process.cwd(), "public/reveal/playbill-template.png");
const FONT_PATH = join(
  process.cwd(),
  "public/fonts/Playfair-BlackItalic-Static.ttf"
);

const TEXT_COLOR = "rgb(50,45,44)";
const DOT_COLOR = "rgb(140,38,52)";

// Plate corners measured from the MJ template (perspective-distorted)
const PLATE_CORNERS = {
  tl: [541, 314],
  tr: [1834, 500],
  bl: [70, 1827],
  br: [1573, 2115],
} as const;

// Flat (dewarped) plate dimensions
const FLAT_W = 1530;
const FLAT_H = 1635;

// Name area in FLAT plate coordinates
const NAME_AREA = {
  top: 565,
  left: 100,
  width: 1330,
  height: 145,
};

let fontB64: string | null = null;

function getFontB64(): string {
  if (!fontB64) {
    fontB64 = readFileSync(FONT_PATH).toString("base64");
  }
  return fontB64;
}

function calculateFontSize(
  text: string,
  maxWidth: number,
  baseSize: number
): number {
  const avgCharWidth = 0.62;
  const neededWidth = text.length * avgCharWidth * baseSize;
  if (neededWidth > maxWidth) {
    return Math.floor((maxWidth / (text.length * avgCharWidth)) * 0.95);
  }
  return baseSize;
}

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function buildNameSvg(firstName: string, lastName: string): Buffer {
  const b64 = getFontB64();
  const maxTextWidth = NAME_AREA.width * 0.82;
  const firstSize = calculateFontSize(firstName, maxTextWidth, 100);
  const lastSize = calculateFontSize(lastName, maxTextWidth, 75);

  const svg = `<svg width="${NAME_AREA.width}" height="${NAME_AREA.height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      @font-face {
        font-family: 'PF';
        src: url('data:font/truetype;base64,${b64}') format('truetype');
      }
    </style>
    <filter id="etch" x="-10%" y="-10%" width="120%" height="120%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="1" result="blur"/>
      <feOffset in="blur" dx="0" dy="2" result="shadow"/>
      <feFlood flood-color="rgba(0,0,0,0.5)" result="sc"/>
      <feComposite in="sc" in2="shadow" operator="in" result="ds"/>
      <feOffset in="blur" dx="0" dy="-0.8" result="hl"/>
      <feFlood flood-color="rgba(255,255,255,0.12)" result="hc"/>
      <feComposite in="hc" in2="hl" operator="in" result="lh"/>
      <feMerge>
        <feMergeNode in="ds"/>
        <feMergeNode in="lh"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <text x="50%" y="36%"
        font-family="PF" font-size="${firstSize}" font-style="italic"
        fill="${TEXT_COLOR}" text-anchor="middle" dominant-baseline="central"
        filter="url(#etch)" letter-spacing="0.03em">
    ${escapeXml(firstName)}
  </text>
  <text y="80%" text-anchor="middle" dominant-baseline="central"
        filter="url(#etch)">
    <tspan x="50%" font-family="PF" font-size="${Math.round(lastSize * 0.5)}" font-style="italic"
           fill="${DOT_COLOR}">• </tspan>
    <tspan font-family="PF" font-size="${lastSize}" font-style="italic"
           fill="${TEXT_COLOR}" letter-spacing="0.06em">${escapeXml(lastName)}</tspan>
    <tspan font-family="PF" font-size="${Math.round(lastSize * 0.5)}" font-style="italic"
           fill="${DOT_COLOR}"> •</tspan>
  </text>
</svg>`;

  return Buffer.from(svg);
}

export async function generatePlaybillImage(
  studentName: string
): Promise<Buffer> {
  const parts = studentName.trim().split(/\s+/);
  const firstName = parts[0]?.toUpperCase() || "";
  const lastName = parts.slice(1).join(" ").toUpperCase() || "";

  // Render the name SVG to PNG
  const svgBuffer = buildNameSvg(firstName, lastName);
  const textPng = await sharp(svgBuffer).png().toBuffer();

  // The perspective pipeline is handled by the Python script
  // For the Node.js API, we use a simpler approach:
  // composite the text at the correct position in the original image space
  // by pre-computing the perspective-mapped coordinates

  // Use the pre-computed Python pipeline via child_process
  const { execSync } = await import("child_process");
  const fs = await import("fs");
  const tmpSvg = `/tmp/pb-${Date.now()}.svg`;
  const tmpOut = `/tmp/pb-${Date.now()}.png`;

  fs.writeFileSync(tmpSvg, svgBuffer);

  const pyScript = `
import cv2, numpy as np, subprocess, sys
from PIL import Image
import base64

TEMPLATE = '${TEMPLATE_PATH}'
SVG_PATH = '${tmpSvg}'
OUTPUT = '${tmpOut}'

original = np.array(Image.open(TEMPLATE))
img_h, img_w = original.shape[:2]

src_pts = np.float32([[541,314],[1834,500],[70,1827],[1573,2115]])
flat_w, flat_h = ${FLAT_W}, ${FLAT_H}
dst_pts = np.float32([[0,0],[flat_w,0],[0,flat_h],[flat_w,flat_h]])

M_fwd = cv2.getPerspectiveTransform(src_pts, dst_pts)
flat = cv2.warpPerspective(original, M_fwd, (flat_w, flat_h), flags=cv2.INTER_LANCZOS4)

subprocess.run(['node','-e',
  f"require('sharp')('{SVG_PATH}').png().toFile('/tmp/pb-text.png').then(()=>console.log('ok'))"],
  capture_output=True)

text_img = np.array(Image.open('/tmp/pb-text.png').convert('RGBA'))
tx, ty = ${NAME_AREA.left}, ${NAME_AREA.top}
th, tw = text_img.shape[:2]
for c in range(4):
    ta = text_img[:,:,3].astype(float)/255.0
    r = flat[ty:ty+th, tx:tx+tw, c].astype(float)
    flat[ty:ty+th, tx:tx+tw, c] = np.clip(r*(1-ta)+text_img[:,:,c].astype(float)*ta, 0, 255).astype(np.uint8)

M_inv = cv2.getPerspectiveTransform(dst_pts, src_pts)
warped = cv2.warpPerspective(flat, M_inv, (img_w, img_h), flags=cv2.INTER_LANCZOS4)

result = original.copy()
wa = warped[:,:,3].astype(float)/255.0
for c in range(3):
    result[:,:,c] = np.clip(original[:,:,c].astype(float)*(1-wa)+warped[:,:,c].astype(float)*wa,0,255).astype(np.uint8)
result[:,:,3] = original[:,:,3]
Image.fromarray(result, 'RGBA').save(OUTPUT)
`;

  execSync(`python3 -c ${JSON.stringify(pyScript)}`, { timeout: 30000 });

  const resultBuffer = fs.readFileSync(tmpOut);

  // Cleanup temp files
  try {
    fs.unlinkSync(tmpSvg);
    fs.unlinkSync(tmpOut);
    fs.unlinkSync("/tmp/pb-text.png");
  } catch {}

  return resultBuffer;
}
