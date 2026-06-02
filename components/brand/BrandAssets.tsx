import type { CSSProperties } from "react";

/**
 * Brand-asset components. Mirrors the parametric SVG assets from
 * `aesdr-design-system/assets/` — wordmark, ghost numerals, classified
 * stamp, corner brackets, terminal dots, warning circle.
 *
 * Rules:
 *  - All vector. Inline SVG so currentColor works for crimson/ink/cream
 *    contexts without shipping 8 variants per asset.
 *  - `aria-hidden` by default (decorative). Pass a `label` to make the
 *    asset semantic.
 *  - The PNG mascot remains in components/brand/Mascot.tsx — that file
 *    is for one specific kind of brand-bearer; this one's for the rest.
 */

type Common = {
  size?: number;
  className?: string;
  style?: CSSProperties;
  label?: string;
};

function a11y(label?: string) {
  return label
    ? { role: "img" as const, "aria-label": label }
    : { "aria-hidden": true as const };
}

/**
 * The AESDR wordmark — Playfair display bold caps with the trailing period
 * the brand uses everywhere. Ink on cream by default; `tone` flips the
 * pairing for dark surfaces.
 */
export function Wordmark({
  size = 160,
  tone = "ink-on-cream",
  className,
  style,
  label = "AESDR",
}: Common & { tone?: "ink-on-cream" | "cream-on-ink" }) {
  const bg = tone === "cream-on-ink" ? "#1A1A1A" : "transparent";
  const fg = tone === "cream-on-ink" ? "#FAF7F2" : "#1A1A1A";
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 600 220"
      width={size}
      height={(size / 600) * 220}
      className={className}
      style={style}
      {...a11y(label)}
    >
      {bg !== "transparent" && <rect width="600" height="220" fill={bg} />}
      <text
        x="40"
        y="160"
        fontFamily="'Playfair Display', Georgia, serif"
        fontWeight={700}
        fontSize={180}
        fill={fg}
        letterSpacing={-2}
      >
        AESDR.
      </text>
    </svg>
  );
}

/**
 * A ghostly Playfair italic numeral, ~6% opacity ink. Sits behind hero
 * blocks as a quiet section marker. Caller passes the numeral string
 * (`"01"`, `"02"`, `"04.1"`).
 */
export function GhostNumeral({
  numeral,
  size = 320,
  className,
  style,
  label,
}: Common & { numeral: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 320"
      width={size}
      height={(size / 400) * 320}
      className={className}
      style={style}
      {...a11y(label || `Numeral ${numeral}`)}
    >
      <text
        x="200"
        y="280"
        textAnchor="middle"
        fontFamily="'Playfair Display', Georgia, serif"
        fontWeight={700}
        fontStyle="italic"
        fontSize={320}
        fill="#000000"
        fillOpacity={0.06}
      >
        {numeral}
      </text>
    </svg>
  );
}

/**
 * A thin-rectangle "classified" stamp outline. Width-flexible — fills its
 * container. Color via currentColor (so callers can crimson it, ink it).
 * The text label is the caller's responsibility; this is just the frame.
 */
export function ClassifiedStamp({
  width = 200,
  height = 28,
  className,
  style,
  label = "Classified",
}: {
  width?: number;
  height?: number;
  className?: string;
  style?: CSSProperties;
  label?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      style={style}
      role="img"
      aria-label={label}
    >
      <rect
        x={1}
        y={1}
        width={width - 2}
        height={height - 2}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
      />
    </svg>
  );
}

/**
 * 20×20 corner bracket — a single corner you place by rotating. `position`
 * picks the corner; the SVG rotates accordingly. Stroke uses currentColor
 * but defaults to a 6% ink for the quiet editorial-frame look the canon
 * specifies.
 */
export function CornerBracket({
  position = "tl",
  size = 20,
  color = "rgba(26,26,26,0.18)",
  thickness = 1,
  className,
  style,
}: {
  position?: "tl" | "tr" | "bl" | "br";
  size?: number;
  color?: string;
  thickness?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const rotation = { tl: 0, tr: 90, br: 180, bl: 270 }[position];
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      width={size}
      height={size}
      className={className}
      style={{
        transform: `rotate(${rotation}deg)`,
        ...style,
      }}
      aria-hidden
    >
      <line
        x1={0}
        y1={0.5}
        x2={20}
        y2={0.5}
        stroke={color}
        strokeWidth={thickness}
      />
      <line
        x1={0.5}
        y1={0}
        x2={0.5}
        y2={20}
        stroke={color}
        strokeWidth={thickness}
      />
    </svg>
  );
}

/**
 * Three small terminal dots — the same indicators we use in the browser
 * chrome on the curriculum preview. Pulled out as a brand asset so the
 * mono/classified register reads consistently across surfaces.
 */
export function TerminalDots({
  size = 8,
  spacing = 4,
  color = "currentColor",
  className,
  style,
}: {
  size?: number;
  spacing?: number;
  color?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const positions = [0, size + spacing, 2 * (size + spacing)];
  const totalWidth = 3 * size + 2 * spacing;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${totalWidth} ${size}`}
      width={totalWidth}
      height={size}
      className={className}
      style={style}
      aria-hidden
    >
      {positions.map((cx, i) => (
        <circle
          key={i}
          cx={cx + size / 2}
          cy={size / 2}
          r={size / 2}
          fill={color}
        />
      ))}
    </svg>
  );
}

/**
 * A 24×24 warning-circle glyph — used for the BannedVocab register cards
 * and any "DON'T" callout where the canonical 64×64 1.6px monoline Icon
 * would be too restrained.
 */
export function WarningCircle({
  size = 24,
  className,
  style,
  label = "Warning",
}: Common) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      style={style}
      role="img"
      aria-label={label}
    >
      <circle
        cx={12}
        cy={12}
        r={10}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
      />
      <line
        x1={12}
        y1={7}
        x2={12}
        y2={13}
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
      />
      <circle cx={12} cy={16.5} r={1.1} fill="currentColor" />
    </svg>
  );
}

/**
 * Decorative frame wrapper — wraps `children` with the four CornerBracket
 * marks (TL/TR/BL/BR) at the corners + a transparent inner area. Use it
 * anywhere we want the editorial "framed" look: hero blocks, pull-quotes,
 * stamped artifacts.
 */
export function BracketedFrame({
  children,
  inset = 12,
  color = "rgba(26,26,26,0.22)",
  thickness = 1,
  className,
  style,
}: {
  children: React.ReactNode;
  inset?: number;
  color?: string;
  thickness?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={className}
      style={{ position: "relative", padding: inset, ...style }}
    >
      <CornerBracket
        position="tl"
        color={color}
        thickness={thickness}
        style={{ position: "absolute", top: 0, left: 0 }}
      />
      <CornerBracket
        position="tr"
        color={color}
        thickness={thickness}
        style={{ position: "absolute", top: 0, right: 0 }}
      />
      <CornerBracket
        position="bl"
        color={color}
        thickness={thickness}
        style={{ position: "absolute", bottom: 0, left: 0 }}
      />
      <CornerBracket
        position="br"
        color={color}
        thickness={thickness}
        style={{ position: "absolute", bottom: 0, right: 0 }}
      />
      {children}
    </div>
  );
}
