"use client";

import { useState, useEffect } from "react";

import { IntensityToggle, type Intensity } from "./IntensityToggle";

/**
 * PlateLayer — 1880s illustrated-fable engraving.
 *
 * The page is a leaf torn from a Doré-era bound Aesop. Cross-hatched
 * line-engraving is the dominant visual language: hatched marginal
 * borders, register marks at corners, plate-number in the lower gutter,
 * spot illustrations anchored to each section, Roman section ordinals
 * stone-cut. Cream is the page of the actual book.
 */

const OP: Record<Intensity, number> = {
  off: 0,
  subtle: 0.40,
  standard: 0.70,
  heavy: 1.0,
};

export function PlateLayer() {
  const [intensity, setIntensity] = useState<Intensity>("standard");
  const [pageH, setPageH] = useState(5200);

  useEffect(() => {
    function measure() {
      queueMicrotask(() => setPageH(Math.max(document.documentElement.scrollHeight, 5200)));
    }
    measure();
    window.addEventListener("resize", measure);
    const t = setInterval(measure, 800);
    return () => {
      window.removeEventListener("resize", measure);
      clearInterval(t);
    };
  }, []);

  const op = OP[intensity];

  // Hatch pattern shared across vignettes
  const hatchPattern = (
    <pattern id="plate-hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <line x1="0" y1="0" x2="0" y2="4" stroke="#1A1A1A" strokeWidth="0.6" />
    </pattern>
  );

  // Anchor positions for spot illustrations (page-relative)
  const spots = [
    { y: 0.08, kind: "tortoise" },
    { y: 0.26, kind: "hare" },
    { y: 0.44, kind: "olive" },
    { y: 0.62, kind: "milestone" },
    { y: 0.80, kind: "finish" },
  ] as const;

  return (
    <>
      <IntensityToggle label="Plate" value={intensity} onChange={setIntensity} />

      <svg
        aria-hidden="true"
        viewBox={`0 0 1440 ${pageH}`}
        preserveAspectRatio="xMidYMin slice"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: pageH,
          pointerEvents: "none",
          zIndex: 5,
          opacity: op,
          mixBlendMode: "multiply",
          transition: "opacity 320ms",
        }}
      >
        <defs>{hatchPattern}</defs>

        {/* ─── Hatched marginal borders — left + right gutter ─── */}
        <g opacity="0.55">
          <rect x="14" y="40" width="20" height={pageH - 80} fill="url(#plate-hatch)" />
          <rect x="1406" y="40" width="20" height={pageH - 80} fill="url(#plate-hatch)" />
          {/* Inner frame line */}
          <line x1="40" y1="40" x2="40" y2={pageH - 40} stroke="#1A1A1A" strokeWidth="0.5" />
          <line x1="1400" y1="40" x2="1400" y2={pageH - 40} stroke="#1A1A1A" strokeWidth="0.5" />
        </g>

        {/* ─── Register marks at all four extreme corners + intermediate ─── */}
        {[
          [40, 40],
          [1400, 40],
          [40, pageH - 40],
          [1400, pageH - 40],
        ].map(([x, y], i) => (
          <g key={i} stroke="#1A1A1A" strokeWidth="0.8" opacity="0.6">
            <line x1={x - 8} y1={y} x2={x + 8} y2={y} />
            <line x1={x} y1={y - 8} x2={x} y2={y + 8} />
            <circle cx={x} cy={y} r="3" fill="none" />
          </g>
        ))}

        {/* ─── Plate number in lower right gutter ─── */}
        <g
          transform={`translate(720 ${pageH - 22})`}
          fontFamily="Playfair Display, Georgia, serif"
          fontStyle="italic"
          fontSize="11"
          fill="#1A1A1A"
          opacity="0.6"
          textAnchor="middle"
        >
          <text>— Plate XII · The Race —</text>
        </g>

        {/* ─── Roman section ordinals down left margin ─── */}
        {["I", "II", "III", "IV", "V", "VI", "VII"].map((roman, i) => {
          const y = 240 + i * (pageH * 0.12);
          return (
            <g key={roman}>
              <text
                x="20"
                y={y}
                fontFamily="Playfair Display, Georgia, serif"
                fontWeight="700"
                fontSize="22"
                fill="#1A1A1A"
                opacity="0.7"
                textAnchor="middle"
                transform={`rotate(-90 20 ${y})`}
              >
                {roman}
              </text>
            </g>
          );
        })}

        {/* ─── Spot illustrations at each anchor ─── */}
        {spots.map((s, idx) => {
          const cx = idx % 2 === 0 ? 92 : 1348;
          const cy = pageH * s.y;
          return (
            <g key={idx} transform={`translate(${cx} ${cy})`} opacity="0.78">
              <Vignette kind={s.kind} />
            </g>
          );
        })}
      </svg>
    </>
  );
}

/** Tiny line-engraved vignettes — Doré flavour, in pure ink hatching. */
function Vignette({ kind }: { kind: "tortoise" | "hare" | "olive" | "milestone" | "finish" }) {
  const stroke = "#1A1A1A";
  const sw = 0.7;

  if (kind === "tortoise") {
    return (
      <g stroke={stroke} fill="none" strokeWidth={sw}>
        {/* Shell dome */}
        <path d="M-26 6 Q-30 -16 0 -22 Q30 -16 26 6" />
        {/* Shell scute lines */}
        <path d="M-22 4 Q0 -2 22 4" />
        <path d="M-22 -4 Q0 -10 22 -4" />
        <path d="M-22 -12 Q0 -16 22 -12" />
        <line x1="0" y1="-22" x2="0" y2="6" />
        {/* Belly line */}
        <path d="M-26 6 Q0 12 26 6" />
        {/* Legs */}
        <line x1="-18" y1="6" x2="-22" y2="14" />
        <line x1="18" y1="6" x2="22" y2="14" />
        {/* Head */}
        <ellipse cx="32" cy="2" rx="6" ry="4" />
        <circle cx="34" cy="0" r="0.8" fill={stroke} />
        {/* Hatch shadow under */}
        {Array.from({ length: 8 }).map((_, i) => (
          <line key={i} x1={-20 + i * 5} y1="14" x2={-22 + i * 5} y2="18" />
        ))}
      </g>
    );
  }
  if (kind === "hare") {
    return (
      <g stroke={stroke} fill="none" strokeWidth={sw}>
        {/* Body */}
        <ellipse cx="0" cy="0" rx="18" ry="10" />
        {/* Long ears */}
        <ellipse cx="-2" cy="-18" rx="2.5" ry="11" transform="rotate(-10 -2 -18)" />
        <ellipse cx="6" cy="-19" rx="2.5" ry="11" transform="rotate(12 6 -19)" />
        {/* Head */}
        <ellipse cx="14" cy="-4" rx="7" ry="5" />
        <circle cx="18" cy="-5" r="0.8" fill={stroke} />
        {/* Hind leg coiled */}
        <path d="M-14 6 Q-20 16 -6 18" />
        <line x1="-6" y1="18" x2="-12" y2="20" />
        {/* Forefeet */}
        <line x1="10" y1="8" x2="12" y2="14" />
        <line x1="6" y1="8" x2="8" y2="14" />
        {/* Hatch shadow */}
        {Array.from({ length: 6 }).map((_, i) => (
          <line key={i} x1={-14 + i * 5} y1="14" x2={-16 + i * 5} y2="18" />
        ))}
      </g>
    );
  }
  if (kind === "olive") {
    return (
      <g stroke={stroke} fill="none" strokeWidth={sw}>
        {/* Trunk */}
        <path d="M0 20 Q-4 0 0 -20 Q4 -10 -2 -30" />
        {/* Branches */}
        <path d="M0 -10 q-12 -4 -18 -2" />
        <path d="M0 -2 q14 -6 22 -8" />
        <path d="M0 8 q-10 6 -16 14" />
        {/* Leaves */}
        {[
          [-18, -2],
          [-14, -8],
          [22, -8],
          [18, -4],
          [-16, 14],
          [-10, 18],
        ].map(([x, y], i) => (
          <ellipse key={i} cx={x} cy={y} rx="6" ry="2" transform={`rotate(${i * 18 - 30} ${x} ${y})`} />
        ))}
      </g>
    );
  }
  if (kind === "milestone") {
    return (
      <g stroke={stroke} fill="none" strokeWidth={sw}>
        {/* Stone */}
        <path d="M-14 16 L-14 -10 Q-14 -20 0 -22 Q14 -20 14 -10 L14 16 Z" />
        {/* Roman ordinal */}
        <text
          x="0"
          y="0"
          fontFamily="Playfair Display, Georgia, serif"
          fontSize="13"
          fontWeight="700"
          fill={stroke}
          textAnchor="middle"
        >
          MILE
        </text>
        <text
          x="0"
          y="12"
          fontFamily="Playfair Display, Georgia, serif"
          fontSize="11"
          fontStyle="italic"
          fill={stroke}
          textAnchor="middle"
        >
          VI
        </text>
        {/* Ground hatching */}
        {Array.from({ length: 6 }).map((_, i) => (
          <line key={i} x1={-16 + i * 6} y1="20" x2={-18 + i * 6} y2="24" />
        ))}
      </g>
    );
  }
  // finish — laurel + banner
  return (
    <g stroke={stroke} fill="none" strokeWidth={sw}>
      {/* Laurel wreath */}
      <ellipse cx="0" cy="0" rx="22" ry="18" />
      {Array.from({ length: 14 }).map((_, i) => {
        const a = (i / 14) * Math.PI * 2;
        const x1 = Math.cos(a) * 22;
        const y1 = Math.sin(a) * 18;
        const x2 = Math.cos(a) * 28;
        const y2 = Math.sin(a) * 23;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
      })}
      {/* Center text */}
      <text
        x="0"
        y="4"
        fontFamily="Playfair Display, Georgia, serif"
        fontStyle="italic"
        fontSize="11"
        fill={stroke}
        textAnchor="middle"
      >
        Finis
      </text>
    </g>
  );
}
