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

type BgVariant = "registration" | "pressure" | "pressed";
const BG_OPTIONS: BgVariant[] = ["registration", "pressure", "pressed"];

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
  const [bg, setBg] = useState<BgVariant>("pressed");
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
      {bg === "registration" && <RegistrationBg pageH={pageH} opacity={op * 0.55} />}
      {bg === "pressure" && <PressureBg pageH={pageH} opacity={op * 0.50} />}
      {bg === "pressed" && <PressedBg pageH={pageH} opacity={op * 0.60} />}

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
            FIELD STUDIES · CABINET XII · SPECIMEN LOGGED
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
                  {["TRAIT CONFIRMED", "PATTERN OBSERVED", "EXPOSURE WINDOW", "SPECIMEN LOGGED", "MARKING NOTED"][i % 5]}
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
        <ellipse cx="0" cy="0" rx="72" ry="20" />
        <ellipse cx="0" cy="0" rx="66" ry="15" strokeWidth="0.7" />
        <text x="0" y="4" fontFamily="'Space Mono', monospace" fontSize="11" letterSpacing="0.30em" fill={c} stroke="none" textAnchor="middle" fontWeight="700">
          SPECIMEN VERIFIED
        </text>
        <text x="0" y="-12" fontFamily="'Space Mono', monospace" fontSize="6" letterSpacing="0.30em" fill={c} stroke="none" textAnchor="middle">
          · CASE XII ·
        </text>
      </g>
    );
  }
  if (kind === "stamp-caution") {
    return (
      <g stroke={c} fill="none" strokeWidth="1.5">
        <rect x="-72" y="-14" width="144" height="28" />
        <rect x="-68" y="-10" width="136" height="20" strokeWidth="0.7" />
        <text x="0" y="5" fontFamily="'Space Mono', monospace" fontSize="11" letterSpacing="0.32em" fill={c} stroke="none" textAnchor="middle" fontWeight="700">
          THREAT PROXIMAL
        </text>
      </g>
    );
  }
  return (
    <g stroke={c} fill="none" strokeWidth="1.2">
      <rect x="-88" y="-13" width="176" height="26" />
      <text x="0" y="4" fontFamily="'Space Mono', monospace" fontSize="10" letterSpacing="0.28em" fill={c} stroke="none" textAnchor="middle" fontWeight="700">
        REACTION DOCUMENTED
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

/**
 * Registration — plate-proof aesthetic.
 *
 * Tiny alignment crosses at regular grid intersections, calibration
 * density hashes along the left + right margins, and four crosshair
 * registration targets at the page corners. Reads as a printer's
 * proof sheet — the substrate of careful work, not a meadow.
 */
function RegistrationBg({ pageH, opacity }: { pageH: number; opacity: number }) {
  const layout = useMemo(() => {
    const crosses: { x: number; y: number }[] = [];
    for (let y = 260; y < pageH - 140; y += 180) {
      for (let x = 240; x < 1240; x += 220) {
        crosses.push({ x, y });
      }
    }
    const hashRows: number[] = [];
    for (let y = 200; y < pageH - 100; y += 36) hashRows.push(y);
    return { crosses, hashRows };
  }, [pageH]);
  const targets = [
    { x: 64, y: 96 },
    { x: 1376, y: 96 },
    { x: 64, y: pageH - 96 },
    { x: 1376, y: pageH - 96 },
  ];
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
      {/* Alignment crosses at grid intersections */}
      <g stroke="#1A1A1A" strokeWidth="0.5" opacity="0.65">
        {layout.crosses.map((p, i) => (
          <g key={i}>
            <line x1={p.x - 5} y1={p.y} x2={p.x + 5} y2={p.y} />
            <line x1={p.x} y1={p.y - 5} x2={p.x} y2={p.y + 5} />
          </g>
        ))}
      </g>
      {/* Registration crosshair targets in 4 corners */}
      {targets.map((t, i) => (
        <g key={i} stroke="#1A1A1A" fill="none" strokeWidth="0.8" opacity="0.62">
          <circle cx={t.x} cy={t.y} r="9" />
          <line x1={t.x - 14} y1={t.y} x2={t.x + 14} y2={t.y} />
          <line x1={t.x} y1={t.y - 14} x2={t.x} y2={t.y + 14} />
          <circle cx={t.x} cy={t.y} r="1.5" fill="#1A1A1A" />
        </g>
      ))}
      {/* Calibration density hashes — left + right margins, varying length */}
      <g stroke="#1A1A1A" strokeWidth="0.6" opacity="0.55">
        {layout.hashRows.map((y, i) => {
          const len = i % 5 === 0 ? 20 : i % 2 === 0 ? 12 : 6;
          return (
            <g key={i}>
              <line x1="12" y1={y} x2={12 + len} y2={y} />
              <line x1={1428 - len} y1={y} x2="1428" y2={y} />
            </g>
          );
        })}
      </g>
      {/* Crop ticks at section anchors — major page divisions */}
      {[0.18, 0.36, 0.54, 0.72].map((p, i) => {
        const y = pageH * p;
        return (
          <g key={`crop${i}`} stroke="#1A1A1A" strokeWidth="0.7" opacity="0.55">
            <line x1="40" y1={y} x2="60" y2={y} />
            <line x1="40" y1={y - 10} x2="40" y2={y + 10} />
            <line x1="1400" y1={y} x2="1380" y2={y} />
            <line x1="1400" y1={y - 10} x2="1400" y2={y + 10} />
          </g>
        );
      })}
    </svg>
  );
}

/**
 * Pressure — soft topographic stress lines.
 *
 * Larger overlapping contour fields than a simple topo, with small
 * directional flow ticks along the outermost contour of each field.
 * Implies environmental tension — the field has weather, not just
 * geometry. The specimen is under load.
 */
function PressureBg({ pageH, opacity }: { pageH: number; opacity: number }) {
  const fields = useMemo(() => {
    const rng = seededJitter(977);
    return Array.from({ length: 7 }).map(() => ({
      cx: 80 + rng() * 1280,
      cy: 160 + rng() * (pageH - 320),
      rx: 200 + rng() * 240,
      ry: 130 + rng() * 160,
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
      {fields.map((f, i) => (
        <g key={i} transform={`rotate(${f.rot} ${f.cx} ${f.cy})`} stroke="#1A1A1A" strokeWidth="0.45" fill="none">
          {[1.0, 0.86, 0.72, 0.58, 0.44, 0.30, 0.18].map((s, j) => (
            <ellipse key={j} cx={f.cx} cy={f.cy} rx={f.rx * s} ry={f.ry * s} opacity={0.26 + j * 0.04} />
          ))}
          {/* Directional flow ticks along the outermost contour */}
          {Array.from({ length: 8 }).map((_, k) => {
            const a = (k / 8) * Math.PI * 2;
            const x = f.cx + Math.cos(a) * f.rx;
            const y = f.cy + Math.sin(a) * f.ry;
            const tx = Math.cos(a + Math.PI / 2) * 5;
            const ty = Math.sin(a + Math.PI / 2) * 5;
            return (
              <line key={k} x1={x} y1={y} x2={x + tx} y2={y + ty} strokeWidth="0.35" opacity="0.7" />
            );
          })}
        </g>
      ))}
    </svg>
  );
}

/**
 * Pressed — premium ledger / cotton-fiber pressed-paper substrate
 * with watermark-style specimen seals embossed deep into the page.
 *
 * Three CSS layers:
 *  - tight horizontal fiber lines (cotton grain at ~3px)
 *  - wider ledger rulings (every 24px, very faint warm-ochre)
 *  - mottled radial-gradient warm patches (paper unevenness)
 * Plus an SVG layer of large circular watermark seals every
 * ~1200px scroll bearing the Latin binomial and a stylized
 * carapace seal.
 */
function PressedBg({ pageH, opacity }: { pageH: number; opacity: number }) {
  const seals = useMemo(() => {
    const count = Math.max(1, Math.floor(pageH / 1100));
    return Array.from({ length: count }).map((_, i) => ({
      x: i % 2 === 0 ? 380 : 1060,
      y: 540 + i * 1100,
    }));
  }, [pageH]);

  return (
    <>
      {/* Cotton fiber + ledger rulings + warm mottling */}
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
            repeating-linear-gradient(0deg, rgba(122,98,68,0.05) 0, rgba(122,98,68,0.05) 1px, transparent 1px, transparent 3px),
            repeating-linear-gradient(0deg, rgba(168,140,108,0.08) 0, rgba(168,140,108,0.08) 1px, transparent 1px, transparent 24px),
            repeating-linear-gradient(90deg, rgba(122,98,68,0.03) 0, rgba(122,98,68,0.03) 1px, transparent 1px, transparent 11px),
            radial-gradient(ellipse at 28% 22%, rgba(168,140,108,0.13), transparent 55%),
            radial-gradient(ellipse at 72% 75%, rgba(168,140,108,0.11), transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(168,140,108,0.05), transparent 80%)
          `,
        }}
      />
      {/* Watermark specimen seals, very faint */}
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
          opacity: opacity * 0.55,
          mixBlendMode: "multiply",
          transition: "opacity 320ms",
        }}
      >
        <defs>
          {seals.map((s, i) => (
            <path key={i} id={`pressed-seal-curve-${i}`} d={`M ${s.x - 150} ${s.y} A 150 150 0 1 1 ${s.x + 150} ${s.y}`} fill="none" />
          ))}
        </defs>
        {seals.map((s, i) => (
          <g key={i} stroke="#1A1A1A" fill="none" strokeWidth="0.5" opacity="0.4">
            <circle cx={s.x} cy={s.y} r="170" strokeWidth="0.6" />
            <circle cx={s.x} cy={s.y} r="160" strokeWidth="0.3" />
            <circle cx={s.x} cy={s.y} r="118" strokeWidth="0.3" opacity="0.7" />
            {/* Latin binomial wrapped around the top */}
            <text fontFamily="Playfair Display, Georgia, serif" fontStyle="italic" fontSize="20" fill="#1A1A1A" stroke="none" letterSpacing="0.18em" opacity="0.78">
              <textPath href={`#pressed-seal-curve-${i}`} startOffset="50%" textAnchor="middle">
                LEPONEUS · AESOPIANUS · NO. XII
              </textPath>
            </text>
            {/* Stylized carapace seal at center */}
            <g transform={`translate(${s.x} ${s.y})`}>
              <ellipse cx="0" cy="0" rx="80" ry="56" strokeWidth="0.5" />
              <ellipse cx="0" cy="0" rx="22" ry="16" strokeWidth="0.4" />
              {Array.from({ length: 5 }).map((_, j) => {
                const a = (j / 5) * Math.PI - Math.PI / 2;
                return (
                  <line
                    key={j}
                    x1={Math.cos(a) * 10}
                    y1={Math.sin(a) * 10}
                    x2={Math.cos(a) * 80}
                    y2={Math.sin(a) * 56}
                    strokeWidth="0.35"
                  />
                );
              })}
              <circle cx="0" cy="0" r="2" fill="#1A1A1A" />
            </g>
            {/* Bottom label */}
            <text x={s.x} y={s.y + 138} fontFamily="'Space Mono', monospace" fontSize="9" letterSpacing="0.30em" fill="#1A1A1A" stroke="none" textAnchor="middle" opacity="0.7">
              · SPECIMEN VERIFIED ·
            </text>
          </g>
        ))}
      </svg>
    </>
  );
}
