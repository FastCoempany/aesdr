"use client";

import { useState, useEffect, useMemo } from "react";

import { IntensityToggle, type Intensity } from "./IntensityToggle";

/**
 * FieldGuideLayer — Thicket descendant. The naturalist's specimen sheet.
 *
 * The page becomes a 19th-century species manual. Tortoise-shell
 * sectional plates with hair-thin crimson lead-lines tagging anatomical
 * parts. Hare measurement diagrams with crimson arrow notations.
 * Latin binomials in italic mono. Crimson rubber-stamp marks
 * ("LIVING SPECIMEN", "PREDATOR · CAUTION"). Brass-pin silhouettes at
 * page corners pinning the sheet down. Faint graph-paper grid behind
 * the body copy. Predator silhouettes plotted at the edges with
 * tagged flight distances.
 *
 * Color: cream + ink dominate; crimson reserved for tags, stamps,
 * and alerts — semantic, never decorative.
 */

const OP: Record<Intensity, number> = {
  off: 0,
  subtle: 0.40,
  standard: 0.68,
  heavy: 0.95,
};

const FALLBACK_HEIGHT = 5200;

export function FieldGuideLayer() {
  const [intensity, setIntensity] = useState<Intensity>("standard");
  const [pageH, setPageH] = useState(FALLBACK_HEIGHT);

  useEffect(() => {
    function measure() {
      queueMicrotask(() => setPageH(Math.max(document.documentElement.scrollHeight, FALLBACK_HEIGHT)));
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

  const plates: Array<{ y: number; side: "left" | "right"; kind: "tortoise-shell" | "hare-anatomy" | "tortoise-scute" | "hare-form" | "predator-skull" | "track-key" }> = useMemo(() => {
    // Anchor positions for specimen plates (page-relative). Alternate left/right.
    return [
      { y: 0.06, side: "left", kind: "tortoise-shell" },
      { y: 0.22, side: "right", kind: "hare-anatomy" },
      { y: 0.40, side: "left", kind: "tortoise-scute" },
      { y: 0.56, side: "right", kind: "hare-form" },
      { y: 0.74, side: "left", kind: "predator-skull" },
      { y: 0.88, side: "right", kind: "track-key" },
    ];
  }, []);

  // Stamps scattered down the page
  const stamps: Array<{ y: number; side: "left" | "right"; kind: "verified" | "predator" | "noted"; rot: number }> = useMemo(
    () => [
      { y: 0.10, side: "right", kind: "verified", rot: -7 },
      { y: 0.34, side: "left", kind: "predator", rot: 6 },
      { y: 0.50, side: "right", kind: "noted", rot: -4 },
      { y: 0.68, side: "left", kind: "predator", rot: 9 },
      { y: 0.92, side: "right", kind: "verified", rot: -6 },
    ],
    [],
  );

  return (
    <>
      <IntensityToggle label="Field Guide" value={intensity} onChange={setIntensity} />

      {/* ─── Faint graph-paper grid wash ─── */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: pageH,
          pointerEvents: "none",
          zIndex: 4,
          opacity: op * 0.35,
          mixBlendMode: "multiply",
          backgroundImage: `
            linear-gradient(0deg, rgba(26,26,26,0.45) 1px, transparent 1px),
            linear-gradient(90deg, rgba(26,26,26,0.45) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          transition: "opacity 320ms",
        }}
      />

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
        {/* ─── Brass-pin silhouettes at four page corners ─── */}
        {[
          { x: 60, y: 60 },
          { x: 1380, y: 60 },
          { x: 60, y: pageH - 60 },
          { x: 1380, y: pageH - 60 },
        ].map((p, i) => (
          <g key={i} transform={`translate(${p.x} ${p.y})`} opacity="0.85">
            <circle cx="0" cy="0" r="9" fill="#1A1A1A" />
            <circle cx="-2" cy="-2" r="3" fill="#FAF7F2" opacity="0.55" />
            <circle cx="0" cy="0" r="9" fill="none" stroke="#1A1A1A" strokeWidth="0.7" />
            {/* Shadow */}
            <ellipse cx="3" cy="11" rx="9" ry="3" fill="#1A1A1A" opacity="0.25" />
          </g>
        ))}

        {/* ─── Top-of-page title block ─── */}
        <g transform="translate(72 132)" opacity="0.85">
          <text
            x="0"
            y="0"
            fontFamily="Playfair Display, Georgia, serif"
            fontStyle="italic"
            fontSize="22"
            fill="#1A1A1A"
          >
            Leponeus aesopianus
          </text>
          <text
            x="0"
            y="20"
            fontFamily="'Space Mono', monospace"
            fontSize="9"
            letterSpacing="0.24em"
            fill="#6B6B6B"
          >
            FIELD STUDIES · VOL. XII · PL. 1 — 6
          </text>
          <line x1="0" y1="30" x2="320" y2="30" stroke="#1A1A1A" strokeWidth="0.6" opacity="0.6" />
        </g>

        {/* ─── Specimen plates ─── */}
        {plates.map((plate, idx) => {
          const x = plate.side === "left" ? 96 : 1344;
          const y = pageH * plate.y;
          return (
            <g key={idx} transform={`translate(${x} ${y})`}>
              <Plate kind={plate.kind} flip={plate.side === "right"} />
            </g>
          );
        })}

        {/* ─── Latin binomial labels at section transitions ─── */}
        {[0.18, 0.36, 0.52, 0.70, 0.86].map((p, i) => (
          <g key={`bin${i}`} transform={`translate(${i % 2 === 0 ? 96 : 1344} ${pageH * p}) ${i % 2 === 1 ? "scale(-1 1)" : ""}`} opacity="0.7">
            <text
              x="0"
              y="0"
              fontFamily="Playfair Display, Georgia, serif"
              fontStyle="italic"
              fontSize="11"
              fill="#1A1A1A"
              transform={i % 2 === 1 ? "scale(-1 1)" : ""}
            >
              {["Testudo·sales", "Lepus·sales", "Predator·mgmt", "Forma·hare", "Trace·specimen"][i]}
            </text>
            <line x1="0" y1="4" x2={i % 2 === 0 ? 180 : -180} y2="4" stroke="#1A1A1A" strokeWidth="0.4" opacity="0.55" />
          </g>
        ))}
      </svg>

      {/* ─── Crimson stamps + lead-line tags layer (NOT multiplied) ─── */}
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
          zIndex: 6,
          opacity: op * 0.95,
          transition: "opacity 320ms",
        }}
      >
        {/* Crimson rubber stamps */}
        {stamps.map((s, i) => {
          const x = s.side === "left" ? 200 : 1180;
          const y = pageH * s.y;
          return (
            <g
              key={i}
              transform={`translate(${x} ${y}) rotate(${s.rot})`}
              opacity="0.78"
            >
              <Stamp kind={s.kind} />
            </g>
          );
        })}

        {/* Crimson lead-line tags pointing to plate features */}
        {plates.map((plate, idx) => {
          const x = plate.side === "left" ? 96 : 1344;
          const y = pageH * plate.y;
          const tagX = plate.side === "left" ? x + 160 : x - 160;
          return (
            <g key={`tag${idx}`} stroke="#8B1A1A" strokeWidth="0.6" fill="#8B1A1A">
              {/* Lead lines from plate features to tag positions */}
              {plate.kind === "tortoise-shell" && (
                <>
                  <line x1={x + 30} y1={y - 30} x2={tagX} y2={y - 50} />
                  <text x={tagX + (plate.side === "left" ? 4 : -4)} y={y - 46} fontFamily="'Space Mono', monospace" fontSize="9" letterSpacing="0.16em" textAnchor={plate.side === "left" ? "start" : "end"}>marginal scute</text>
                  <line x1={x + 12} y1={y + 12} x2={tagX} y2={y + 30} />
                  <text x={tagX + (plate.side === "left" ? 4 : -4)} y={y + 34} fontFamily="'Space Mono', monospace" fontSize="9" letterSpacing="0.16em" textAnchor={plate.side === "left" ? "start" : "end"}>growth ring · 7th</text>
                </>
              )}
              {plate.kind === "hare-anatomy" && (
                <>
                  <line x1={x - 40} y1={y - 50} x2={tagX} y2={y - 60} />
                  <text x={tagX + (plate.side === "left" ? 4 : -4)} y={y - 56} fontFamily="'Space Mono', monospace" fontSize="9" letterSpacing="0.16em" textAnchor={plate.side === "left" ? "start" : "end"}>ear · thermo-acoustic</text>
                  <line x1={x - 20} y1={y + 20} x2={tagX} y2={y + 40} />
                  <text x={tagX + (plate.side === "left" ? 4 : -4)} y={y + 44} fontFamily="'Space Mono', monospace" fontSize="9" letterSpacing="0.16em" textAnchor={plate.side === "left" ? "start" : "end"}>flight distance · 4.2m</text>
                </>
              )}
              {plate.kind === "tortoise-scute" && (
                <>
                  <line x1={x + 24} y1={y - 8} x2={tagX} y2={y - 24} />
                  <text x={tagX + (plate.side === "left" ? 4 : -4)} y={y - 20} fontFamily="'Space Mono', monospace" fontSize="9" letterSpacing="0.16em" textAnchor={plate.side === "left" ? "start" : "end"}>keratin · annual layer</text>
                </>
              )}
              {plate.kind === "hare-form" && (
                <>
                  <line x1={x - 30} y1={y + 4} x2={tagX} y2={y + 22} />
                  <text x={tagX + (plate.side === "left" ? 4 : -4)} y={y + 26} fontFamily="'Space Mono', monospace" fontSize="9" letterSpacing="0.16em" textAnchor={plate.side === "left" ? "start" : "end"}>resting depression</text>
                </>
              )}
              {plate.kind === "predator-skull" && (
                <>
                  <line x1={x + 18} y1={y - 18} x2={tagX} y2={y - 30} />
                  <text x={tagX + (plate.side === "left" ? 4 : -4)} y={y - 26} fontFamily="'Space Mono', monospace" fontSize="9" letterSpacing="0.16em" textAnchor={plate.side === "left" ? "start" : "end"} fontWeight="700">CAUTION · KNOWN</text>
                </>
              )}
              {plate.kind === "track-key" && (
                <>
                  <line x1={x - 20} y1={y + 12} x2={tagX} y2={y + 32} />
                  <text x={tagX + (plate.side === "left" ? 4 : -4)} y={y + 36} fontFamily="'Space Mono', monospace" fontSize="9" letterSpacing="0.16em" textAnchor={plate.side === "left" ? "start" : "end"}>4-print stagger · gait sig.</text>
                </>
              )}
            </g>
          );
        })}

        {/* Bottom-right colophon */}
        <g transform={`translate(1340 ${pageH - 64})`} opacity="0.85">
          <text
            x="0"
            y="0"
            fontFamily="'Space Mono', monospace"
            fontSize="9"
            letterSpacing="0.22em"
            fill="#8B1A1A"
            textAnchor="end"
            fontWeight="700"
          >
            READ THE DIAGRAM
          </text>
          <text
            x="0"
            y="14"
            fontFamily="'Space Mono', monospace"
            fontSize="8"
            letterSpacing="0.18em"
            fill="#6B6B6B"
            textAnchor="end"
          >
            know the animal · train accordingly
          </text>
        </g>
      </svg>
    </>
  );
}

/* ─────────────────────────────────────────── Specimen plates ─── */

function Plate({ kind, flip }: { kind: string; flip: boolean }) {
  const sw = 0.8;
  const stroke = "#1A1A1A";
  const scale = flip ? -1 : 1;
  return (
    <g transform={`scale(${scale} 1)`} stroke={stroke} fill="none" strokeWidth={sw}>
      {kind === "tortoise-shell" && (
        <>
          {/* Carapace dome top-view */}
          <ellipse cx="0" cy="0" rx="56" ry="42" />
          {/* Scute partition lines */}
          {Array.from({ length: 5 }).map((_, i) => {
            const a = (i / 5) * Math.PI - Math.PI / 2;
            return (
              <line
                key={i}
                x1={Math.cos(a) * 6}
                y1={Math.sin(a) * 6}
                x2={Math.cos(a) * 56}
                y2={Math.sin(a) * 42}
              />
            );
          })}
          {/* Central scute */}
          <ellipse cx="0" cy="0" rx="14" ry="10" />
          {/* Marginal scutes */}
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return (
              <ellipse
                key={i}
                cx={Math.cos(a) * 48}
                cy={Math.sin(a) * 36}
                rx="6"
                ry="5"
              />
            );
          })}
          {/* Plate caption */}
          <text x="-58" y="64" fontFamily="'Space Mono', monospace" fontSize="8" letterSpacing="0.18em" fill={stroke} stroke="none" transform={flip ? "scale(-1 1) translate(-116 0)" : ""}>
            FIG. 1 — CARAPACE, DORSAL
          </text>
        </>
      )}
      {kind === "hare-anatomy" && (
        <>
          {/* Hare body in profile */}
          <ellipse cx="0" cy="0" rx="48" ry="22" />
          {/* Long ears */}
          <ellipse cx="-12" cy="-32" rx="4" ry="22" transform="rotate(-12 -12 -32)" />
          <ellipse cx="0" cy="-34" rx="4" ry="22" transform="rotate(8 0 -34)" />
          {/* Head */}
          <ellipse cx="40" cy="-10" rx="14" ry="10" />
          <circle cx="46" cy="-12" r="1.2" fill={stroke} />
          {/* Hind leg */}
          <path d="M-32 16 Q-50 28 -10 32" />
          <line x1="-10" y1="32" x2="-18" y2="38" strokeWidth="0.6" />
          {/* Forefeet */}
          <line x1="26" y1="20" x2="30" y2="32" />
          <line x1="14" y1="18" x2="18" y2="30" />
          {/* Measurement arrows */}
          <line x1="-56" y1="-44" x2="56" y2="-44" />
          <line x1="-56" y1="-48" x2="-56" y2="-40" />
          <line x1="56" y1="-48" x2="56" y2="-40" />
          <text x="-12" y="-48" fontFamily="'Space Mono', monospace" fontSize="8" letterSpacing="0.18em" fill={stroke} stroke="none" transform={flip ? "scale(-1 1) translate(24 0)" : ""}>
            42cm
          </text>
          {/* Caption */}
          <text x="-58" y="46" fontFamily="'Space Mono', monospace" fontSize="8" letterSpacing="0.18em" fill={stroke} stroke="none" transform={flip ? "scale(-1 1) translate(-116 0)" : ""}>
            FIG. 2 — LEPUS, LATERAL
          </text>
        </>
      )}
      {kind === "tortoise-scute" && (
        <>
          {/* Single scute cross-section with growth rings */}
          <polygon points="-30,18 -42,0 -30,-18 30,-18 42,0 30,18" />
          {[0.78, 0.56, 0.34, 0.16].map((s, i) => (
            <polygon
              key={i}
              points={`${-30 * s},${18 * s} ${-42 * s},0 ${-30 * s},${-18 * s} ${30 * s},${-18 * s} ${42 * s},0 ${30 * s},${18 * s}`}
              opacity={0.55 - i * 0.08}
            />
          ))}
          <circle cx="0" cy="0" r="1.2" fill={stroke} />
          <text x="-58" y="40" fontFamily="'Space Mono', monospace" fontSize="8" letterSpacing="0.18em" fill={stroke} stroke="none" transform={flip ? "scale(-1 1) translate(-116 0)" : ""}>
            FIG. 3 — SCUTE, CROSS-SECTION
          </text>
        </>
      )}
      {kind === "hare-form" && (
        <>
          {/* Plan view: the form, a shallow grass depression */}
          <ellipse cx="0" cy="0" rx="44" ry="14" />
          <ellipse cx="0" cy="0" rx="32" ry="9" />
          {Array.from({ length: 14 }).map((_, i) => (
            <path key={i} d={`M${-40 + i * 6} -12 q1 -8 ${1 + (i % 3)} -10`} strokeWidth="0.5" />
          ))}
          <text x="-58" y="34" fontFamily="'Space Mono', monospace" fontSize="8" letterSpacing="0.18em" fill={stroke} stroke="none" transform={flip ? "scale(-1 1) translate(-116 0)" : ""}>
            FIG. 4 — FORM, PLAN
          </text>
        </>
      )}
      {kind === "predator-skull" && (
        <>
          {/* Canid/raptor skull silhouette */}
          <path d="M-32 0 Q-32 -22 -10 -28 Q22 -32 36 -18 Q44 -4 38 12 Q26 22 0 22 Q-22 22 -32 8 Z" />
          {/* Eye socket */}
          <circle cx="14" cy="-8" r="6" fill={stroke} />
          {/* Teeth */}
          <line x1="-10" y1="20" x2="-8" y2="28" />
          <line x1="-4" y1="22" x2="-2" y2="30" />
          <line x1="2" y1="22" x2="4" y2="30" />
          <line x1="8" y1="20" x2="10" y2="28" />
          {/* Sutures */}
          <path d="M-8 -22 L0 0 L8 -22" strokeWidth="0.5" />
          <text x="-58" y="42" fontFamily="'Space Mono', monospace" fontSize="8" letterSpacing="0.18em" fill={stroke} stroke="none" transform={flip ? "scale(-1 1) translate(-116 0)" : ""}>
            FIG. 5 — KNOWN PREDATOR
          </text>
        </>
      )}
      {kind === "track-key" && (
        <>
          {/* Track-key panel: hare stagger + tortoise drag */}
          <rect x="-44" y="-26" width="88" height="52" />
          {/* Hare 4-print */}
          <g transform="translate(-26 -10)" fill={stroke}>
            <ellipse cx="-4" cy="-6" rx="2" ry="4" />
            <ellipse cx="4" cy="-5" rx="2" ry="4" />
            <circle cx="-2" cy="3" r="1.2" />
            <circle cx="3" cy="4" r="1.2" />
          </g>
          {/* Tortoise drag */}
          <g transform="translate(16 -10)" fill={stroke}>
            <line x1="0" y1="-6" x2="0" y2="14" stroke={stroke} strokeWidth="0.6" />
            <line x1="-4" y1="-4" x2="0" y2="0" stroke={stroke} strokeWidth="0.6" />
            <line x1="0" y1="-6" x2="0" y2="0" stroke={stroke} strokeWidth="0.6" />
            <line x1="4" y1="-4" x2="0" y2="0" stroke={stroke} strokeWidth="0.6" />
            <circle cx="0" cy="2" r="1.2" />
            <line x1="-4" y1="6" x2="0" y2="10" stroke={stroke} strokeWidth="0.6" />
            <line x1="4" y1="6" x2="0" y2="10" stroke={stroke} strokeWidth="0.6" />
            <circle cx="0" cy="12" r="1.2" />
          </g>
          <text x="-58" y="42" fontFamily="'Space Mono', monospace" fontSize="8" letterSpacing="0.18em" fill={stroke} stroke="none" transform={flip ? "scale(-1 1) translate(-116 0)" : ""}>
            FIG. 6 — TRACK KEY
          </text>
        </>
      )}
    </g>
  );
}

/* ─────────────────────────────────────────── Stamps ─── */

function Stamp({ kind }: { kind: "verified" | "predator" | "noted" }) {
  const crimson = "#8B1A1A";
  if (kind === "verified") {
    return (
      <g stroke={crimson} fill="none" strokeWidth="1.4">
        <ellipse cx="0" cy="0" rx="64" ry="22" />
        <ellipse cx="0" cy="0" rx="58" ry="17" strokeWidth="0.8" />
        <text
          x="0"
          y="4"
          fontFamily="'Space Mono', monospace"
          fontSize="11"
          letterSpacing="0.32em"
          fill={crimson}
          stroke="none"
          textAnchor="middle"
          fontWeight="700"
        >
          LIVING SPECIMEN
        </text>
        <text
          x="0"
          y="-12"
          fontFamily="'Space Mono', monospace"
          fontSize="6"
          letterSpacing="0.30em"
          fill={crimson}
          stroke="none"
          textAnchor="middle"
        >
          · VERIFIED ·
        </text>
      </g>
    );
  }
  if (kind === "predator") {
    return (
      <g stroke={crimson} fill="none" strokeWidth="1.6">
        <rect x="-72" y="-16" width="144" height="32" />
        <rect x="-68" y="-12" width="136" height="24" strokeWidth="0.8" />
        <text
          x="0"
          y="5"
          fontFamily="'Space Mono', monospace"
          fontSize="12"
          letterSpacing="0.34em"
          fill={crimson}
          stroke="none"
          textAnchor="middle"
          fontWeight="700"
        >
          PREDATOR · CAUTION
        </text>
      </g>
    );
  }
  // noted
  return (
    <g stroke={crimson} fill="none" strokeWidth="1.2">
      <rect x="-46" y="-14" width="92" height="28" />
      <text
        x="0"
        y="4"
        fontFamily="'Space Mono', monospace"
        fontSize="10"
        letterSpacing="0.28em"
        fill={crimson}
        stroke="none"
        textAnchor="middle"
        fontWeight="700"
      >
        NOTED
      </text>
    </g>
  );
}
