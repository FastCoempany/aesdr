"use client";

import { useState, useEffect, useMemo, type CSSProperties } from "react";

import { IntensityToggle, type Intensity } from "./IntensityToggle";

/**
 * ArchivalLayer — Field Guide descendant #1.
 *
 * "Archival Specimen Interface" — museum-grade restraint, modern SaaS UI.
 *
 * Visual logic: push diagram density to the gutters, corners, and lower
 * edges. Center stays pristine for copy. Warm-bone specimen cards drift
 * as soft depth behind plate fragments. Brass-pin marks anchor diagram
 * cards and page corners. Predator silhouettes plotted at the extreme
 * edges with measurement labels. Crimson is hard-capped at ≤6
 * meaningful marks per viewport: verification stamps, predator
 * warnings, lead-line tags only.
 *
 * Tone: "know the animal, read the field, train accordingly."
 *
 * Backgrounds (swappable via floating toggle):
 *  - parchment  warm cream with subtle paper-fiber texture
 *  - dots       calibration-sheet dot matrix at grid intersections
 *  - topo       very faint contour-line ghost wash
 */

type BgVariant = "parchment" | "dots" | "topo";
const BG_OPTIONS: BgVariant[] = ["parchment", "dots", "topo"];

const OP: Record<Intensity, number> = {
  off: 0,
  subtle: 0.45,
  standard: 0.74,
  heavy: 1.0,
};

const FALLBACK_HEIGHT = 5200;

function seededJitter(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const WARM_BONE = "rgba(232, 220, 196, 0.85)";

export function ArchivalLayer() {
  const [intensity, setIntensity] = useState<Intensity>("standard");
  const [bg, setBg] = useState<BgVariant>("parchment");
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

  const layout = useMemo(() => {
    const rng = seededJitter(401);

    // Specimen cards — warm-bone rectangles in gutters/corners only (never center)
    type Card = { x: number; y: number; w: number; h: number; rot: number };
    const cards: Card[] = [];
    const rows = Math.ceil(pageH / 760);
    for (let i = 0; i < rows; i++) {
      const onLeft = i % 2 === 0;
      cards.push({
        x: onLeft ? 32 : 1148,
        y: 200 + i * 760 + (rng() - 0.5) * 40,
        w: 260,
        h: 200,
        rot: (rng() - 0.5) * 2.5,
      });
    }

    // Plate anchors — alternating left/right gutter, one per ~520px
    type Plate = { x: number; y: number; kind: "shell" | "anatomy" | "scute" | "form" | "skull" | "track"; flip: boolean };
    const kinds: Plate["kind"][] = ["shell", "anatomy", "scute", "form", "skull", "track"];
    const plates: Plate[] = [];
    const plateRows = Math.ceil(pageH / 520);
    for (let i = 0; i < plateRows; i++) {
      const onLeft = i % 2 === 0;
      plates.push({
        x: onLeft ? 160 : 1280,
        y: 280 + i * 520,
        kind: kinds[i % kinds.length],
        flip: !onLeft,
      });
    }

    // Predator silhouettes at extreme edges (corners), with distance labels
    type Pred = { x: number; y: number; species: string; dist: string };
    const predators: Pred[] = [
      { x: 12, y: 0.28 * pageH, species: "Corvus · sentinel", dist: "18m" },
      { x: 1424, y: 0.46 * pageH, species: "Vulpes · ranging", dist: "31m" },
      { x: 14, y: 0.64 * pageH, species: "Buteo · circling", dist: "44m" },
      { x: 1424, y: 0.82 * pageH, species: "Canis · scouting", dist: "22m" },
    ];

    // Brass pins at corners + at 4 evenly-spaced page interior corners
    const pins = [
      { x: 60, y: 60 },
      { x: 1380, y: 60 },
      { x: 60, y: pageH - 60 },
      { x: 1380, y: pageH - 60 },
      { x: 60, y: pageH * 0.5 },
      { x: 1380, y: pageH * 0.5 },
    ];

    // Crimson semantic marks — strictly capped, ~6 per viewport (so ~6 per ~900px scroll)
    type Mark = { x: number; y: number; kind: "stamp-verified" | "stamp-caution" | "stamp-observed" | "tag" };
    const marks: Mark[] = [];
    const stampKinds: Mark["kind"][] = ["stamp-verified", "stamp-caution", "stamp-observed"];
    const cap = Math.floor(pageH / 160); // ~6 per 900-1000px viewport
    for (let i = 0; i < cap; i++) {
      const onLeft = i % 2 === 0;
      marks.push({
        x: onLeft ? 240 : 1200,
        y: 320 + i * (pageH / cap),
        kind: i % 4 === 3 ? "tag" : stampKinds[i % stampKinds.length],
      });
    }

    return { cards, plates, predators, pins, marks };
  }, [pageH]);

  return (
    <>
      <IntensityToggle label="Archival" value={intensity} onChange={setIntensity} />
      <BgToggle value={bg} onChange={setBg} />

      {/* ─── Swappable background substrate ─── */}
      {bg === "parchment" && <ParchmentBg pageH={pageH} opacity={op * 0.55} />}
      {bg === "dots" && <DotsBg pageH={pageH} opacity={op * 0.32} />}
      {bg === "topo" && <TopoBg pageH={pageH} opacity={op * 0.45} />}

      {/* ─── Warm-bone specimen cards (soft depth, NOT multiplied) ─── */}
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
          zIndex: 4,
          opacity: op * 0.85,
          transition: "opacity 320ms",
        }}
      >
        {layout.cards.map((c, i) => (
          <g key={i} transform={`translate(${c.x} ${c.y}) rotate(${c.rot})`}>
            {/* Card shadow */}
            <rect x="3" y="5" width={c.w} height={c.h} fill="rgba(26,26,26,0.10)" />
            {/* Card body — warm bone */}
            <rect x="0" y="0" width={c.w} height={c.h} fill={WARM_BONE} />
            {/* Hairline border */}
            <rect x="0" y="0" width={c.w} height={c.h} fill="none" stroke="rgba(26,26,26,0.32)" strokeWidth="0.6" />
            {/* Inner faint border */}
            <rect x="6" y="6" width={c.w - 12} height={c.h - 12} fill="none" stroke="rgba(26,26,26,0.18)" strokeWidth="0.4" />
            {/* Plate caption stripe at bottom */}
            <line x1="12" y1={c.h - 22} x2={c.w - 12} y2={c.h - 22} stroke="rgba(26,26,26,0.45)" strokeWidth="0.4" />
            <text
              x="12"
              y={c.h - 8}
              fontFamily="'Space Mono', monospace"
              fontSize="8"
              letterSpacing="0.22em"
              fill="rgba(26,26,26,0.6)"
            >
              {`PL. ${(i + 1).toString().padStart(2, "0")} · LIVING`}
            </text>
          </g>
        ))}
      </svg>

      {/* ─── Ink plate diagrams + brass pins + predator silhouettes ─── */}
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
        {/* Brass pins */}
        {layout.pins.map((p, i) => (
          <g key={i} transform={`translate(${p.x} ${p.y})`} opacity="0.9">
            <ellipse cx="3" cy="11" rx="9" ry="3" fill="#1A1A1A" opacity="0.25" />
            <circle cx="0" cy="0" r="9" fill="#1A1A1A" />
            <circle cx="-2" cy="-2" r="3" fill="#FAF7F2" opacity="0.55" />
            <circle cx="0" cy="0" r="9" fill="none" stroke="#1A1A1A" strokeWidth="0.7" />
          </g>
        ))}

        {/* Top-of-page archive header */}
        <g transform="translate(72 124)" opacity="0.88">
          <text
            x="0"
            y="0"
            fontFamily="Playfair Display, Georgia, serif"
            fontStyle="italic"
            fontSize="22"
            fill="#1A1A1A"
          >
            ARCHIVE · Leponeus aesopianus
          </text>
          <text
            x="0"
            y="18"
            fontFamily="'Space Mono', monospace"
            fontSize="9"
            letterSpacing="0.26em"
            fill="#6B6B6B"
          >
            FIELD STUDIES · CABINET XII · LIVING SPECIMEN
          </text>
          <line x1="0" y1="28" x2="420" y2="28" stroke="#1A1A1A" strokeWidth="0.6" opacity="0.5" />
        </g>

        {/* Specimen plates */}
        {layout.plates.map((p, i) => (
          <g key={i} transform={`translate(${p.x} ${p.y})`}>
            <PlateGlyph kind={p.kind} flip={p.flip} />
          </g>
        ))}

        {/* Predator silhouettes at extreme edges */}
        {layout.predators.map((p, i) => (
          <g key={i} transform={`translate(${p.x} ${p.y})`} opacity="0.7">
            <PredatorSilhouette species={p.species} />
            <text
              x={p.x < 720 ? 30 : -30}
              y="-6"
              fontFamily="Playfair Display, Georgia, serif"
              fontStyle="italic"
              fontSize="10"
              fill="#1A1A1A"
              textAnchor={p.x < 720 ? "start" : "end"}
            >
              {p.species}
            </text>
            <text
              x={p.x < 720 ? 30 : -30}
              y="8"
              fontFamily="'Space Mono', monospace"
              fontSize="8"
              letterSpacing="0.22em"
              fill="#6B6B6B"
              textAnchor={p.x < 720 ? "start" : "end"}
            >
              {`distance · ${p.dist}`}
            </text>
          </g>
        ))}
      </svg>

      {/* ─── Crimson semantic layer (NOT multiplied) ─── */}
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
        {layout.marks.map((m, i) => {
          if (m.kind === "tag") {
            return (
              <g key={i} transform={`translate(${m.x} ${m.y})`} stroke="#8B1A1A" strokeWidth="0.6">
                <line x1="0" y1="0" x2={m.x < 720 ? -40 : 40} y2="-12" />
                <circle cx="0" cy="0" r="2" fill="#8B1A1A" />
                <text
                  x={m.x < 720 ? -46 : 46}
                  y="-9"
                  fontFamily="'Space Mono', monospace"
                  fontSize="9"
                  letterSpacing="0.18em"
                  fill="#8B1A1A"
                  textAnchor={m.x < 720 ? "end" : "start"}
                  stroke="none"
                >
                  {["dorsal scute", "marginal scute", "growth ring · VII", "flight distance · 4.2m", "alert posture · 12s"][i % 5]}
                </text>
              </g>
            );
          }
          const rot = (i * 17) % 11 - 5;
          return (
            <g key={i} transform={`translate(${m.x} ${m.y}) rotate(${rot})`}>
              <StampMark kind={m.kind} />
            </g>
          );
        })}

        {/* Footer colophon */}
        <g transform={`translate(1340 ${pageH - 64})`} opacity="0.88">
          <text
            x="0"
            y="0"
            fontFamily="'Space Mono', monospace"
            fontSize="10"
            letterSpacing="0.28em"
            fill="#8B1A1A"
            textAnchor="end"
            fontWeight="700"
          >
            KNOW THE ANIMAL
          </text>
          <text
            x="0"
            y="14"
            fontFamily="'Space Mono', monospace"
            fontSize="8"
            letterSpacing="0.20em"
            fill="#6B6B6B"
            textAnchor="end"
          >
            read the field · train accordingly
          </text>
        </g>
      </svg>
    </>
  );
}

/* ─── Plate diagrams (gutter-only — narrow, vertical) ─── */
function PlateGlyph({ kind, flip }: { kind: "shell" | "anatomy" | "scute" | "form" | "skull" | "track"; flip: boolean }) {
  const s = "#1A1A1A";
  const sx = flip ? -1 : 1;
  return (
    <g transform={`scale(${sx} 1)`} stroke={s} fill="none" strokeWidth="0.8">
      {kind === "shell" && (
        <>
          <ellipse cx="0" cy="0" rx="44" ry="34" />
          {Array.from({ length: 5 }).map((_, i) => {
            const a = (i / 5) * Math.PI - Math.PI / 2;
            return <line key={i} x1={Math.cos(a) * 6} y1={Math.sin(a) * 6} x2={Math.cos(a) * 44} y2={Math.sin(a) * 34} />;
          })}
          <ellipse cx="0" cy="0" rx="10" ry="8" />
          {Array.from({ length: 10 }).map((_, i) => {
            const a = (i / 10) * Math.PI * 2;
            return <ellipse key={i} cx={Math.cos(a) * 38} cy={Math.sin(a) * 28} rx="5" ry="4" />;
          })}
        </>
      )}
      {kind === "anatomy" && (
        <>
          <ellipse cx="0" cy="0" rx="38" ry="18" />
          <ellipse cx="-10" cy="-22" rx="3" ry="18" transform="rotate(-12 -10 -22)" />
          <ellipse cx="0" cy="-24" rx="3" ry="18" transform="rotate(8 0 -24)" />
          <ellipse cx="30" cy="-6" rx="11" ry="8" />
          <circle cx="34" cy="-8" r="1" fill={s} />
          <path d="M-24 12 Q-40 22 -8 26" />
        </>
      )}
      {kind === "scute" && (
        <>
          <polygon points="-26,14 -36,0 -26,-14 26,-14 36,0 26,14" />
          {[0.78, 0.56, 0.34, 0.16].map((sc, i) => (
            <polygon
              key={i}
              points={`${-26 * sc},${14 * sc} ${-36 * sc},0 ${-26 * sc},${-14 * sc} ${26 * sc},${-14 * sc} ${36 * sc},0 ${26 * sc},${14 * sc}`}
              opacity={0.55 - i * 0.08}
            />
          ))}
          <circle cx="0" cy="0" r="1.1" fill={s} />
        </>
      )}
      {kind === "form" && (
        <>
          <ellipse cx="0" cy="0" rx="36" ry="11" />
          <ellipse cx="0" cy="0" rx="26" ry="7" />
          {Array.from({ length: 11 }).map((_, i) => (
            <path key={i} d={`M${-32 + i * 6} -10 q1 -7 ${1 + (i % 3)} -9`} strokeWidth="0.5" />
          ))}
        </>
      )}
      {kind === "skull" && (
        <>
          <path d="M-26 0 Q-26 -18 -8 -22 Q18 -26 30 -14 Q38 -2 32 10 Q22 18 0 18 Q-18 18 -26 6 Z" />
          <circle cx="12" cy="-6" r="5" fill={s} />
          <line x1="-8" y1="16" x2="-6" y2="22" />
          <line x1="-2" y1="18" x2="0" y2="24" />
          <line x1="4" y1="18" x2="6" y2="24" />
          <line x1="10" y1="16" x2="12" y2="22" />
        </>
      )}
      {kind === "track" && (
        <>
          <rect x="-36" y="-22" width="72" height="44" />
          <g transform="translate(-20 -8)" fill={s}>
            <ellipse cx="-3" cy="-5" rx="1.6" ry="3.4" />
            <ellipse cx="3" cy="-4" rx="1.6" ry="3.4" />
            <circle cx="-1" cy="2" r="1" />
            <circle cx="2" cy="3" r="1" />
          </g>
          <g transform="translate(14 -8)" fill={s}>
            <line x1="-3" y1="-3" x2="0" y2="0" strokeWidth="0.6" />
            <line x1="0" y1="-4" x2="0" y2="0" strokeWidth="0.6" />
            <line x1="3" y1="-3" x2="0" y2="0" strokeWidth="0.6" />
            <circle cx="0" cy="1.5" r="1" />
            <line x1="0" y1="6" x2="0" y2="12" strokeWidth="0.6" stroke={s} />
            <circle cx="0" cy="14" r="1" />
          </g>
        </>
      )}
    </g>
  );
}

function PredatorSilhouette({ species }: { species: string }) {
  const s = "#1A1A1A";
  // Single silhouette type per genus
  if (species.startsWith("Corvus")) {
    return (
      <g fill={s}>
        <path d="M0 0 L24 -4 L20 0 L24 4 Z" />
        <circle cx="6" cy="-2" r="1" fill="#FAF7F2" />
      </g>
    );
  }
  if (species.startsWith("Vulpes")) {
    return (
      <g fill={s}>
        <path d="M0 0 Q4 -10 14 -8 L20 -12 L22 -6 L34 -2 L34 4 L0 4 Z" />
      </g>
    );
  }
  if (species.startsWith("Buteo")) {
    return (
      <g fill={s}>
        <path d="M0 0 L20 -8 L14 0 L20 8 Z" />
      </g>
    );
  }
  // Canis (default)
  return (
    <g fill={s}>
      <path d="M0 0 Q4 -8 12 -6 L18 -10 L20 -4 L30 -2 L30 4 L0 4 Z" />
    </g>
  );
}

function StampMark({ kind }: { kind: "stamp-verified" | "stamp-caution" | "stamp-observed" }) {
  const c = "#8B1A1A";
  if (kind === "stamp-verified") {
    return (
      <g stroke={c} fill="none" strokeWidth="1.3">
        <ellipse cx="0" cy="0" rx="68" ry="20" />
        <ellipse cx="0" cy="0" rx="62" ry="15" strokeWidth="0.7" />
        <text x="0" y="4" fontFamily="'Space Mono', monospace" fontSize="11" letterSpacing="0.30em" fill={c} stroke="none" textAnchor="middle" fontWeight="700">
          LIVING SPECIMEN
        </text>
        <text x="0" y="-12" fontFamily="'Space Mono', monospace" fontSize="6" letterSpacing="0.30em" fill={c} stroke="none" textAnchor="middle">
          · VERIFIED ·
        </text>
      </g>
    );
  }
  if (kind === "stamp-caution") {
    return (
      <g stroke={c} fill="none" strokeWidth="1.5">
        <rect x="-76" y="-14" width="152" height="28" />
        <rect x="-72" y="-10" width="144" height="20" strokeWidth="0.7" />
        <text x="0" y="5" fontFamily="'Space Mono', monospace" fontSize="11" letterSpacing="0.32em" fill={c} stroke="none" textAnchor="middle" fontWeight="700">
          PREDATOR · CAUTION
        </text>
      </g>
    );
  }
  return (
    <g stroke={c} fill="none" strokeWidth="1.2">
      <rect x="-60" y="-13" width="120" height="26" />
      <text x="0" y="4" fontFamily="'Space Mono', monospace" fontSize="10" letterSpacing="0.28em" fill={c} stroke="none" textAnchor="middle" fontWeight="700">
        FIELD OBSERVED
      </text>
    </g>
  );
}

/* ─────────────────────────────────────────── Background variants ─── */

function BgToggle({ value, onChange }: { value: BgVariant; onChange: (v: BgVariant) => void }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 96,
        right: 16,
        zIndex: 9999,
        background: "rgba(26, 26, 26, 0.92)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        color: "var(--cream)",
        padding: "10px 12px",
        fontFamily: "var(--mono, 'Space Mono', monospace)",
        fontSize: 10,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        border: "1px solid rgba(255,255,255,0.12)",
        pointerEvents: "auto",
      }}
    >
      <div style={{ opacity: 0.55, fontSize: 9 }}>Background</div>
      <div style={{ display: "flex", gap: 4 }}>
        {BG_OPTIONS.map((opt) => {
          const active = value === opt;
          const btn: CSSProperties = {
            padding: "5px 8px",
            background: active ? "var(--cream)" : "transparent",
            color: active ? "var(--ink)" : "var(--cream)",
            border: "1px solid rgba(255,255,255,0.25)",
            fontFamily: "inherit",
            fontSize: 9,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            cursor: "pointer",
            fontWeight: active ? 700 : 400,
          };
          return (
            <button key={opt} style={btn} onClick={() => onChange(opt)}>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Parchment — warm cream with subtle paper-fiber texture. Felt, not measured. */
function ParchmentBg({ pageH, opacity }: { pageH: number; opacity: number }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: pageH,
        pointerEvents: "none",
        zIndex: 3,
        opacity,
        mixBlendMode: "multiply",
        transition: "opacity 320ms",
        backgroundImage: `
          repeating-linear-gradient(0deg, rgba(122,98,68,0.07) 0, rgba(122,98,68,0.07) 1px, transparent 1px, transparent 5px),
          repeating-linear-gradient(90deg, rgba(122,98,68,0.04) 0, rgba(122,98,68,0.04) 1px, transparent 1px, transparent 9px),
          radial-gradient(ellipse at 22% 18%, rgba(168,140,108,0.14), transparent 55%),
          radial-gradient(ellipse at 78% 78%, rgba(168,140,108,0.11), transparent 55%),
          radial-gradient(ellipse at 50% 50%, rgba(168,140,108,0.06), transparent 80%)
        `,
      }}
    />
  );
}

/** Dot matrix — small ink dots at grid intersections only. Calibration sheet. */
function DotsBg({ pageH, opacity }: { pageH: number; opacity: number }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: pageH,
        pointerEvents: "none",
        zIndex: 3,
        opacity,
        mixBlendMode: "multiply",
        transition: "opacity 320ms",
        backgroundImage: "radial-gradient(circle, rgba(26,26,26,0.62) 1px, transparent 1.6px)",
        backgroundSize: "32px 32px",
      }}
    />
  );
}

/** Topo ghosts — very faint contour ellipses drifting across the page. */
function TopoBg({ pageH, opacity }: { pageH: number; opacity: number }) {
  const groups = useMemo(() => {
    const rng = seededJitter(811);
    return Array.from({ length: 9 }).map(() => ({
      cx: 80 + rng() * 1280,
      cy: 160 + rng() * (pageH - 320),
      rx: 140 + rng() * 200,
      ry: 90 + rng() * 130,
      rot: rng() * 60 - 30,
    }));
  }, [pageH]);
  return (
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
        zIndex: 3,
        opacity,
        mixBlendMode: "multiply",
        transition: "opacity 320ms",
      }}
    >
      {groups.map((c, i) => (
        <g key={i} transform={`rotate(${c.rot} ${c.cx} ${c.cy})`} stroke="#1A1A1A" strokeWidth="0.5" fill="none">
          {[1.0, 0.82, 0.66, 0.50, 0.34, 0.20].map((s, j) => (
            <ellipse key={j} cx={c.cx} cy={c.cy} rx={c.rx * s} ry={c.ry * s} opacity={0.32 + j * 0.05} />
          ))}
        </g>
      ))}
    </svg>
  );
}
