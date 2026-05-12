"use client";

import { useState, useEffect, useMemo } from "react";

import { IntensityToggle, type Intensity } from "./IntensityToggle";

/**
 * TaxonomyLayer — Field Guide descendant #3.
 *
 * "Taxonomy of Pressure" — classification system for two animals
 * under pressure. Tortoise = durable position. Hare = acceleration.
 *
 * Visual logic: ASYMMETRIC composition (one gutter dense, the other
 * sparse, alternating per section). Plates BLEED OFF-SCREEN at left
 * and right edges so the world feels larger than the viewport. Strict
 * hierarchy enforced:
 *   70% clean cream space
 *   20% faint ink diagramming
 *   7% warm-bone card depth
 *   3% crimson semantic marks
 * Slightly ominous: more predator silhouettes peeking from edges, a
 * faint vignette pulling at the corners.
 *
 * Tone: authoritative, observational, the animal is alive, the
 * predator is near.
 */

const OP: Record<Intensity, number> = {
  off: 0,
  subtle: 0.42,
  standard: 0.72,
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

const WARM_BONE = "rgba(232, 220, 196, 0.78)";

export function TaxonomyLayer() {
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

  const layout = useMemo(() => {
    const rng = seededJitter(617);

    // Asymmetric anchors — each section has ONE dominant gutter.
    // The dominant gutter holds a half-bleed plate; the opposite gutter is mostly empty.
    type PlateAnchor = { y: number; side: "left" | "right"; kind: "shell-bleed" | "hare-bleed" | "scute-bleed" | "predator-bleed" };
    const plates: PlateAnchor[] = [];
    const kinds: PlateAnchor["kind"][] = ["shell-bleed", "hare-bleed", "scute-bleed", "predator-bleed"];
    const plateRows = 6;
    // Alternate but not strictly — feel "assembled by a field researcher"
    const sidePattern: PlateAnchor["side"][] = ["left", "right", "right", "left", "right", "left"];
    for (let i = 0; i < plateRows; i++) {
      plates.push({
        y: 320 + i * (pageH / plateRows) + (rng() - 0.5) * 40,
        side: sidePattern[i % sidePattern.length],
        kind: kinds[i % kinds.length],
      });
    }

    // Warm-bone classification cards — small, asymmetric, behind plates
    type Card = { x: number; y: number; w: number; h: number; rot: number };
    const cards: Card[] = plates.map((p, i) => ({
      x: p.side === "left" ? -40 + (i % 2) * 20 : 1240 - (i % 2) * 20,
      y: p.y - 80,
      w: 240,
      h: 180,
      rot: (rng() - 0.5) * 1.8,
    }));

    // Predator silhouettes at edges — denser than Archival
    type Pred = { x: number; y: number; species: string; arc: number };
    const predators: Pred[] = [
      { x: 4, y: 0.18 * pageH, species: "Corvus", arc: 0 },
      { x: 1436, y: 0.32 * pageH, species: "Vulpes", arc: 0 },
      { x: 4, y: 0.50 * pageH, species: "Buteo", arc: 0 },
      { x: 1436, y: 0.62 * pageH, species: "Canis", arc: 0 },
      { x: 4, y: 0.78 * pageH, species: "Mustela", arc: 0 },
      { x: 1436, y: 0.90 * pageH, species: "Strix", arc: 0 },
    ];

    // Sidebar/gutter classification ribbon
    const classNames = [
      "ORDO · TESTUDINES",
      "ORDO · LAGOMORPHA",
      "FAMILIA · TESTUDINIDAE",
      "FAMILIA · LEPORIDAE",
      "SPECIES · sub.aesopianus",
      "FIELD · sub.pressure",
    ];

    return { plates, cards, predators, classNames };
  }, [pageH]);

  return (
    <>
      <IntensityToggle label="Taxonomy" value={intensity} onChange={setIntensity} />

      {/* ─── 1mm graph grid — very faint ─── */}
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
          opacity: op * 0.16,
          mixBlendMode: "multiply",
          backgroundImage: `
            linear-gradient(0deg, rgba(26,26,26,0.45) 1px, transparent 1px),
            linear-gradient(90deg, rgba(26,26,26,0.45) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          transition: "opacity 320ms",
        }}
      />

      {/* ─── Edge vignette — slightly ominous ─── */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 4,
          opacity: op * 0.5,
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 38%, rgba(26,26,26,0.18) 75%, rgba(26,26,26,0.32) 100%)",
          transition: "opacity 320ms",
        }}
      />

      {/* ─── Warm-bone cards (drift behind plates, asymmetric) ─── */}
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
          opacity: op * 0.78,
          transition: "opacity 320ms",
        }}
      >
        {layout.cards.map((c, i) => (
          <g key={i} transform={`translate(${c.x} ${c.y}) rotate(${c.rot})`}>
            <rect x="3" y="5" width={c.w} height={c.h} fill="rgba(26,26,26,0.10)" />
            <rect x="0" y="0" width={c.w} height={c.h} fill={WARM_BONE} />
            <rect x="0" y="0" width={c.w} height={c.h} fill="none" stroke="rgba(26,26,26,0.32)" strokeWidth="0.6" />
            <rect x="6" y="6" width={c.w - 12} height={c.h - 12} fill="none" stroke="rgba(26,26,26,0.16)" strokeWidth="0.4" />
          </g>
        ))}
      </svg>

      {/* ─── Ink layer: bleed-off plates + classification ribbon ─── */}
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
        {/* Header — asymmetric (left-justified, weighty) */}
        <g transform="translate(72 124)" opacity="0.88">
          <text
            x="0"
            y="0"
            fontFamily="Playfair Display, Georgia, serif"
            fontWeight="700"
            fontSize="26"
            fill="#1A1A1A"
          >
            Taxonomy of Pressure
          </text>
          <text
            x="0"
            y="22"
            fontFamily="'Space Mono', monospace"
            fontSize="9"
            letterSpacing="0.28em"
            fill="#6B6B6B"
          >
            CLASS LEPONEUS · CABINET XII · UNDER PRESSURE
          </text>
          <line x1="0" y1="32" x2="280" y2="32" stroke="#1A1A1A" strokeWidth="0.6" opacity="0.55" />
        </g>

        {/* Classification ribbon — right gutter, vertical text */}
        {layout.classNames.map((name, i) => {
          const y = 400 + i * (pageH * 0.12);
          return (
            <g key={i} transform={`translate(1410 ${y}) rotate(-90)`} opacity="0.65">
              <text
                x="0"
                y="0"
                fontFamily="'Space Mono', monospace"
                fontSize="9"
                letterSpacing="0.28em"
                fill="#1A1A1A"
              >
                {name}
              </text>
            </g>
          );
        })}

        {/* Bleed-off plates — half-visible at the edge */}
        {layout.plates.map((p, i) => {
          const isLeft = p.side === "left";
          const x = isLeft ? -60 : 1500;
          return (
            <g key={i} transform={`translate(${x} ${p.y}) scale(${isLeft ? 1 : -1} 1)`}>
              <BleedPlate kind={p.kind} />
            </g>
          );
        })}

        {/* Predator silhouettes — peeking from edges */}
        {layout.predators.map((p, i) => {
          const onLeft = p.x < 720;
          return (
            <g key={i} transform={`translate(${p.x} ${p.y})`} opacity="0.65">
              <PredatorEdgeSilhouette species={p.species} flip={!onLeft} />
              <text
                x={onLeft ? 30 : -30}
                y="-2"
                fontFamily="Playfair Display, Georgia, serif"
                fontStyle="italic"
                fontSize="10"
                fill="#1A1A1A"
                textAnchor={onLeft ? "start" : "end"}
              >
                {p.species}
              </text>
            </g>
          );
        })}
      </svg>

      {/* ─── Crimson layer — strict 3% budget (~3-4 marks per viewport) ─── */}
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
        {layout.plates.map((p, i) => {
          // ~3-4 crimson marks per viewport. Place sparingly: every other plate.
          if (i % 2 !== 0) return null;
          const isLeft = p.side === "left";
          const tagX = isLeft ? 200 : 1240;
          const tagY = p.y + 20;
          return (
            <g key={i} stroke="#8B1A1A" strokeWidth="0.6">
              <line x1={isLeft ? 60 : 1380} y1={p.y - 10} x2={tagX} y2={tagY} />
              <circle cx={isLeft ? 60 : 1380} cy={p.y - 10} r="2" fill="#8B1A1A" />
              <text
                x={tagX + (isLeft ? 6 : -6)}
                y={tagY + 3}
                fontFamily="'Space Mono', monospace"
                fontSize="9"
                letterSpacing="0.18em"
                fill="#8B1A1A"
                textAnchor={isLeft ? "start" : "end"}
                stroke="none"
              >
                {["growth ring · VII", "flight distance · 4.2m", "alert · 12s", "predator edge"][i % 4]}
              </text>
            </g>
          );
        })}

        {/* One predator-caution stamp */}
        <g transform={`translate(720 ${pageH * 0.42}) rotate(-6)`}>
          <g stroke="#8B1A1A" fill="none" strokeWidth="1.4">
            <rect x="-78" y="-14" width="156" height="28" />
            <rect x="-74" y="-10" width="148" height="20" strokeWidth="0.7" />
            <text x="0" y="5" fontFamily="'Space Mono', monospace" fontSize="11" letterSpacing="0.32em" fill="#8B1A1A" stroke="none" textAnchor="middle" fontWeight="700">
              PREDATOR · CAUTION
            </text>
          </g>
        </g>

        {/* Bottom-right colophon — single mark */}
        <g transform={`translate(1340 ${pageH - 60})`} opacity="0.88">
          <text x="0" y="0" fontFamily="'Space Mono', monospace" fontSize="10" letterSpacing="0.28em" fill="#8B1A1A" textAnchor="end" fontWeight="700">
            THE ANIMAL IS ALIVE
          </text>
          <text x="0" y="14" fontFamily="'Space Mono', monospace" fontSize="8" letterSpacing="0.20em" fill="#6B6B6B" textAnchor="end">
            the predator is near · the lesson is behavioral
          </text>
        </g>
      </svg>
    </>
  );
}

function BleedPlate({ kind }: { kind: "shell-bleed" | "hare-bleed" | "scute-bleed" | "predator-bleed" }) {
  const s = "#1A1A1A";
  // All bleed plates start at x=0 (the edge) and extend inward
  if (kind === "shell-bleed") {
    return (
      <g stroke={s} fill="none" strokeWidth="0.9">
        <ellipse cx="0" cy="0" rx="90" ry="60" />
        {Array.from({ length: 6 }).map((_, i) => {
          const a = (i / 6) * Math.PI - Math.PI / 2;
          return <line key={i} x1={Math.cos(a) * 10} y1={Math.sin(a) * 10} x2={Math.cos(a) * 90} y2={Math.sin(a) * 60} />;
        })}
        <ellipse cx="0" cy="0" rx="22" ry="16" />
        {Array.from({ length: 14 }).map((_, i) => {
          const a = (i / 14) * Math.PI - Math.PI / 2 + 0.1;
          return <ellipse key={i} cx={Math.cos(a) * 76} cy={Math.sin(a) * 52} rx="7" ry="6" />;
        })}
        <text x="100" y="80" fontFamily="'Space Mono', monospace" fontSize="9" letterSpacing="0.22em" fill={s} stroke="none">
          FIG. — CARAPACE (CONTINUED →)
        </text>
      </g>
    );
  }
  if (kind === "hare-bleed") {
    return (
      <g stroke={s} fill="none" strokeWidth="0.9">
        <ellipse cx="20" cy="0" rx="78" ry="34" />
        <ellipse cx="-2" cy="-46" rx="6" ry="32" transform="rotate(-12 -2 -46)" />
        <ellipse cx="16" cy="-50" rx="6" ry="32" transform="rotate(8 16 -50)" />
        <ellipse cx="84" cy="-18" rx="22" ry="15" />
        <circle cx="92" cy="-22" r="2" fill={s} />
        <path d="M-46 22 Q-76 38 -8 46" />
        {/* Measurement bar */}
        <line x1="-50" y1="-66" x2="100" y2="-66" />
        <line x1="-50" y1="-72" x2="-50" y2="-60" />
        <line x1="100" y1="-72" x2="100" y2="-60" />
        <text x="22" y="-70" fontFamily="'Space Mono', monospace" fontSize="9" letterSpacing="0.20em" fill={s} stroke="none" textAnchor="middle">
          42 cm
        </text>
        <text x="120" y="64" fontFamily="'Space Mono', monospace" fontSize="9" letterSpacing="0.22em" fill={s} stroke="none">
          FIG. — LEPUS (CONTINUED →)
        </text>
      </g>
    );
  }
  if (kind === "scute-bleed") {
    return (
      <g stroke={s} fill="none" strokeWidth="0.9">
        {[1.0, 0.82, 0.66, 0.50, 0.36, 0.22].map((sc, i) => (
          <polygon
            key={i}
            points={`${-40 * sc},${22 * sc} ${-56 * sc},0 ${-40 * sc},${-22 * sc} ${40 * sc},${-22 * sc} ${56 * sc},0 ${40 * sc},${22 * sc}`}
            opacity={0.7 - i * 0.08}
            strokeWidth={1 - i * 0.1}
          />
        ))}
        <circle cx="0" cy="0" r="1.5" fill={s} />
        <text x="80" y="40" fontFamily="'Space Mono', monospace" fontSize="9" letterSpacing="0.22em" fill={s} stroke="none">
          FIG. — SCUTE / RING (→)
        </text>
      </g>
    );
  }
  // predator-bleed
  return (
    <g stroke={s} fill="none" strokeWidth="0.9">
      <path d="M0 0 Q4 -32 36 -38 L52 -50 L60 -36 L100 -28 L100 14 L0 14 Z" />
      <circle cx="46" cy="-26" r="6" fill={s} />
      <line x1="-8" y1="14" x2="-4" y2="28" />
      <line x1="6" y1="14" x2="10" y2="28" />
      <line x1="20" y1="14" x2="22" y2="28" />
      <text x="116" y="-12" fontFamily="'Space Mono', monospace" fontSize="9" letterSpacing="0.22em" fill={s} stroke="none">
        FIG. — KNOWN PREDATOR
      </text>
    </g>
  );
}

function PredatorEdgeSilhouette({ species, flip }: { species: string; flip: boolean }) {
  const s = "#1A1A1A";
  const sx = flip ? -1 : 1;
  if (species === "Corvus") {
    return <g transform={`scale(${sx} 1)`} fill={s}><path d="M0 0 L28 -4 L20 0 L28 4 Z" /></g>;
  }
  if (species === "Vulpes") {
    return <g transform={`scale(${sx} 1)`} fill={s}><path d="M0 0 Q6 -12 18 -10 L26 -16 L28 -8 L42 -4 L42 6 L0 6 Z" /></g>;
  }
  if (species === "Buteo") {
    return <g transform={`scale(${sx} 1)`} fill={s}><path d="M0 0 L24 -10 L16 0 L24 10 Z" /></g>;
  }
  if (species === "Canis") {
    return <g transform={`scale(${sx} 1)`} fill={s}><path d="M0 0 Q4 -10 14 -8 L22 -14 L24 -4 L36 -2 L36 6 L0 6 Z" /></g>;
  }
  if (species === "Mustela") {
    return <g transform={`scale(${sx} 1)`} fill={s}><path d="M0 2 Q14 -2 26 0 L34 -2 L36 4 L0 4 Z" /></g>;
  }
  // Strix — owl
  return <g transform={`scale(${sx} 1)`} fill={s}><ellipse cx="14" cy="0" rx="14" ry="10" /><circle cx="8" cy="-2" r="2" fill="#FAF7F2" /><circle cx="18" cy="-2" r="2" fill="#FAF7F2" /></g>;
}
