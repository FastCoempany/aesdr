import sharp from "sharp";
import { join } from "path";

const TEMPLATE_PATH = join(process.cwd(), "public/reveal/playbill-template.png");

// Measured from the nameless MJ template (1968x2464 image)
// Plate: (68,302) to (1837,2117)
// Clean name area: between header text (~row 790) and three red dots (~row 1040)
const NAME_AREA = {
  top: 880,
  left: 300,
  width: 1368,
  height: 140,
};

const TEXT_COLOR = "rgb(50,45,44)";
const DOT_COLOR = "rgb(140,38,52)";

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

function buildNameSvg(firstName: string, lastName: string): Buffer {
  const svgW = NAME_AREA.width;
  const svgH = NAME_AREA.height;
  const maxTextWidth = svgW * 0.82;

  const firstSize = calculateFontSize(firstName, maxTextWidth, 135);
  const lastSize = calculateFontSize(lastName, maxTextWidth, 100);

  const svg = `<svg width="${svgW}" height="${svgH}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="etch" x="-10%" y="-10%" width="120%" height="120%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="1" result="blur"/>
      <feOffset in="blur" dx="0" dy="2" result="shadow"/>
      <feFlood flood-color="rgba(0,0,0,0.45)" result="shadowColor"/>
      <feComposite in="shadowColor" in2="shadow" operator="in" result="darkShadow"/>
      <feOffset in="blur" dx="0" dy="-0.8" result="highlight"/>
      <feFlood flood-color="rgba(255,255,255,0.12)" result="hlColor"/>
      <feComposite in="hlColor" in2="highlight" operator="in" result="lightHighlight"/>
      <feMerge>
        <feMergeNode in="darkShadow"/>
        <feMergeNode in="lightHighlight"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <text x="50%" y="38%"
        font-family="Playfair" font-size="${firstSize}" font-style="italic"
        fill="${TEXT_COLOR}" text-anchor="middle" dominant-baseline="central"
        filter="url(#etch)" letter-spacing="0.03em">
    ${escapeXml(firstName)}
  </text>
  <text y="78%" text-anchor="middle" dominant-baseline="central"
        filter="url(#etch)">
    <tspan x="50%" font-family="Playfair" font-size="${lastSize * 0.45}" font-style="italic"
           fill="${DOT_COLOR}" dy="-0.05em">• </tspan>
    <tspan font-family="Playfair" font-size="${lastSize}" font-style="italic"
           fill="${TEXT_COLOR}" letter-spacing="0.06em">${escapeXml(lastName)}</tspan>
    <tspan font-family="Playfair" font-size="${lastSize * 0.45}" font-style="italic"
           fill="${DOT_COLOR}" dy="-0.05em"> •</tspan>
  </text>
</svg>`;

  return Buffer.from(svg);
}

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function generatePlaybillImage(
  studentName: string
): Promise<Buffer> {
  const parts = studentName.trim().split(/\s+/);
  const firstName = parts[0]?.toUpperCase() || "";
  const lastName = parts.slice(1).join(" ").toUpperCase() || "";

  const svgBuffer = buildNameSvg(firstName, lastName);

  const result = await sharp(TEMPLATE_PATH)
    .composite([
      {
        input: svgBuffer,
        top: NAME_AREA.top,
        left: NAME_AREA.left,
      },
    ])
    .png()
    .toBuffer();

  return result;
}
