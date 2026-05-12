"use client";

import { useState, useEffect, useMemo } from "react";

import { IntensityToggle, type Intensity } from "./IntensityToggle";

/**
 * EthologyLayer — Field Guide descendant #2.
 *
 * "Ethology Lab Notebook" — part field science, part behavioral
 * operating manual.
 *
 * Visual logic: the page is a stack of notebook sheets (top + bottom
 * of viewport show faint paper-edge shadows). Behavioral measurements
 * dominate over pure anatomy. Hero gets the richest specimen detail,
 * mid-page only fragments (partial scutes, cropped hare motion arcs,
 * small tags), cards get micro-grid internal texture, CTA simplifies
 * to ONE specimen-card silhouette + ONE crimson stamp.
 *
 * Tone: premium interface design built from biological observation.
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

const BEHAVIOR_LABELS = [
  "alert posture · 12 sec",
  "flight distance · 4.2m",
  "defensive stillness",
  "shell position",
  "predator edge",
  "escape vector",
  "growth ring · VII",
  "freeze response · 0.4s",
  "scan arc · 220°",
  "burrow approach · slow",
];

export function EthologyLayer() {
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
    const rng = seededJitter(509);

    // Hero region: 0..0.18 of pageH — RICHEST density
    // Mid-page: 0.18..0.78 — fragments only
    // CTA region: 0.78..0.95 — one card + one stamp
    const heroY = pageH * 0.10;
    const ctaY = pageH * 0.86;

    // Mid-page partial plate fragments — half-scutes, motion arcs, small tags
    type Fragment = { x: number; y: number; kind: "half-scute" | "motion-arc" | "ear-arc" | "vector"; flip: boolean };
    const fragments: Fragment[] = [];
    const fragKinds: Fragment["kind"][] = ["half-scute", "motion-arc", "ear-arc", "vector"];
    const midStart = pageH * 0.22;
    const midEnd = pageH * 0.78;
    const fragRows = Math.floor((midEnd - midStart) / 380);
    for (let i = 0; i < fragRows; i++) {
      const onLeft = i % 2 === 0;
      fragments.push({
        x: onLeft ? 70 + rng() * 40 : 1310 - rng() * 40,
        y: midStart + i * 380 + rng() * 60,
        kind: fragKinds[i % fragKinds.length],
        flip: !onLeft,
      });
    }

    // Behavioral measurement tags scattered through mid-page
    type Tag = { x: number; y: number; text: string; arrowLen: number };
    const tags: Tag[] = [];
    for (let i = 0; i < fragRows * 2; i++) {
      const onLeft = i % 2 === 0;
      tags.push({
        x: onLeft ? 180 : 1260,
        y: midStart + i * 220 + rng() * 80,
        text: BEHAVIOR_LABELS[i % BEHAVIOR_LABELS.length],
        arrowLen: 40 + rng() * 30,
      });
    }

    // Notebook page-edge offsets (stacked sheets visible at top + bottom)
    const sheetEdges = [
      { y: 14, offset: 8 },
      { y: 22, offset: 4 },
      { y: pageH - 22, offset: 4 },
      { y: pageH - 14, offset: 8 },
    ];

    return { heroY, ctaY, fragments, tags, sheetEdges };
  }, [pageH]);

  return (
    <>
      <IntensityToggle label="Ethology" value={intensity} onChange={setIntensity} />

      {/* ─── Faint graph grid (smaller, denser than Archival) ─── */}
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
          opacity: op * 0.22,
          mixBlendMode: "multiply",
          backgroundImage: `
            linear-gradient(0deg, rgba(26,26,26,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(26,26,26,0.5) 1px, transparent 1px)
          `,
          backgroundSize: "24px 24px",
          transition: "opacity 320ms",
        }}
      />

      {/* ─── Stacked notebook-page edges (top + bottom paper shadows) ─── */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: 18,
          pointerEvents: "none",
          zIndex: 4,
          opacity: op,
          background:
            "linear-gradient(180deg, rgba(26,26,26,0.18) 0%, rgba(26,26,26,0.08) 30%, transparent 100%)",
          transition: "opacity 320ms",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 6,
          left: 12,
          right: 12,
          height: 1,
          pointerEvents: "none",
          zIndex: 4,
          opacity: op * 0.6,
          background: "rgba(26,26,26,0.35)",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 12,
          left: 24,
          right: 24,
          height: 1,
          pointerEvents: "none",
          zIndex: 4,
          opacity: op * 0.4,
          background: "rgba(26,26,26,0.28)",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100%",
          height: 18,
          pointerEvents: "none",
          zIndex: 4,
          opacity: op,
          background:
            "linear-gradient(0deg, rgba(26,26,26,0.18) 0%, rgba(26,26,26,0.08) 30%, transparent 100%)",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          bottom: 6,
          left: 12,
          right: 12,
          height: 1,
          pointerEvents: "none",
          zIndex: 4,
          opacity: op * 0.6,
          background: "rgba(26,26,26,0.35)",
        }}
      />

      {/* ─── Ink diagrams (hero rich, mid fragments, CTA simple) ─── */}
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
        {/* ─── HERO: rich behavioral plate at upper-left + measured study at upper-right ─── */}
        <g transform={`translate(160 ${layout.heroY + 200})`}>
          <FullBehavioralPlate />
        </g>
        <g transform={`translate(1280 ${layout.heroY + 260})`}>
          <MeasuredHareStudy flip />
        </g>

        {/* Header */}
        <g transform="translate(72 124)" opacity="0.88">
          <text
            x="0"
            y="0"
            fontFamily="Playfair Display, Georgia, serif"
            fontStyle="italic"
            fontSize="22"
            fill="#1A1A1A"
          >
            Ethology · Behavioral Studies
          </text>
          <text
            x="0"
            y="18"
            fontFamily="'Space Mono', monospace"
            fontSize="9"
            letterSpacing="0.26em"
            fill="#6B6B6B"
          >
            LAB NOTEBOOK · UNDER PRESSURE · v.12
          </text>
          <line x1="0" y1="28" x2="380" y2="28" stroke="#1A1A1A" strokeWidth="0.6" opacity="0.5" />
        </g>

        {/* ─── MID-PAGE: fragments only ─── */}
        {layout.fragments.map((f, i) => (
          <g key={i} transform={`translate(${f.x} ${f.y}) scale(${f.flip ? -1 : 1} 1)`}>
            <FragmentGlyph kind={f.kind} />
          </g>
        ))}

        {/* ─── CTA region: ONE strong specimen-card silhouette ─── */}
        <g transform={`translate(720 ${layout.ctaY}) translate(-180 0)`}>
          {/* card body */}
          <rect x="0" y="0" width="360" height="240" fill="none" stroke="#1A1A1A" strokeWidth="1.2" />
          <rect x="6" y="6" width="348" height="228" fill="none" stroke="#1A1A1A" strokeWidth="0.4" opacity="0.55" />
          {/* central plate: tortoise top view */}
          <g transform="translate(180 120)">
            <ellipse cx="0" cy="0" rx="64" ry="48" fill="none" stroke="#1A1A1A" strokeWidth="1" />
            {Array.from({ length: 5 }).map((_, i) => {
              const a = (i / 5) * Math.PI - Math.PI / 2;
              return <line key={i} x1={Math.cos(a) * 8} y1={Math.sin(a) * 8} x2={Math.cos(a) * 64} y2={Math.sin(a) * 48} stroke="#1A1A1A" strokeWidth="0.7" />;
            })}
            <ellipse cx="0" cy="0" rx="14" ry="10" fill="none" stroke="#1A1A1A" strokeWidth="0.7" />
            {Array.from({ length: 12 }).map((_, i) => {
              const a = (i / 12) * Math.PI * 2;
              return <ellipse key={i} cx={Math.cos(a) * 54} cy={Math.sin(a) * 40} rx="6" ry="5" fill="none" stroke="#1A1A1A" strokeWidth="0.6" />;
            })}
          </g>
          <text x="180" y="232" fontFamily="'Space Mono', monospace" fontSize="9" letterSpacing="0.22em" fill="#6B6B6B" textAnchor="middle">
            FIG. XII — UNDER PRESSURE
          </text>
        </g>
      </svg>

      {/* ─── Crimson layer (semantic, sparse) ─── */}
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
        {/* Behavioral tags with crimson lead-lines */}
        {layout.tags.map((t, i) => {
          const onLeft = t.x < 720;
          const dir = onLeft ? -1 : 1;
          return (
            <g key={i} stroke="#8B1A1A" strokeWidth="0.6">
              <line x1={t.x} y1={t.y} x2={t.x + dir * t.arrowLen} y2={t.y - 14} />
              <circle cx={t.x} cy={t.y} r="2" fill="#8B1A1A" />
              <text
                x={t.x + dir * (t.arrowLen + 6)}
                y={t.y - 10}
                fontFamily="'Space Mono', monospace"
                fontSize="9"
                letterSpacing="0.18em"
                fill="#8B1A1A"
                textAnchor={onLeft ? "end" : "start"}
                stroke="none"
              >
                {t.text}
              </text>
            </g>
          );
        })}

        {/* Hero crimson stamp — top-right */}
        <g transform="translate(1180 220) rotate(-6)">
          <g stroke="#8B1A1A" fill="none" strokeWidth="1.4">
            <ellipse cx="0" cy="0" rx="76" ry="22" />
            <ellipse cx="0" cy="0" rx="70" ry="17" strokeWidth="0.7" />
            <text x="0" y="4" fontFamily="'Space Mono', monospace" fontSize="11" letterSpacing="0.30em" fill="#8B1A1A" stroke="none" textAnchor="middle" fontWeight="700">
              LIVING SPECIMEN
            </text>
            <text x="0" y="-12" fontFamily="'Space Mono', monospace" fontSize="6" letterSpacing="0.30em" fill="#8B1A1A" stroke="none" textAnchor="middle">
              · VERIFIED · NOTEBOOK XII ·
            </text>
          </g>
        </g>

        {/* CTA: ONE crimson stamp */}
        <g transform={`translate(720 ${pageH * 0.92}) rotate(-4)`}>
          <g stroke="#8B1A1A" fill="none" strokeWidth="1.5">
            <rect x="-86" y="-15" width="172" height="30" />
            <rect x="-82" y="-11" width="164" height="22" strokeWidth="0.7" />
            <text x="0" y="5" fontFamily="'Space Mono', monospace" fontSize="11" letterSpacing="0.32em" fill="#8B1A1A" stroke="none" textAnchor="middle" fontWeight="700">
              BEHAVIOR RECORDED
            </text>
          </g>
        </g>

        {/* Footer colophon */}
        <g transform={`translate(72 ${pageH - 64})`} opacity="0.85">
          <text x="0" y="0" fontFamily="'Space Mono', monospace" fontSize="10" letterSpacing="0.26em" fill="#8B1A1A" fontWeight="700">
            OBSERVE · MEASURE · TRAIN
          </text>
          <text x="0" y="14" fontFamily="'Space Mono', monospace" fontSize="8" letterSpacing="0.20em" fill="#6B6B6B">
            biology under pressure · the page is the lab
          </text>
        </g>
      </svg>
    </>
  );
}

function FullBehavioralPlate() {
  const s = "#1A1A1A";
  return (
    <g stroke={s} fill="none" strokeWidth="0.8">
      {/* Tortoise top + behavioral arcs around it */}
      <ellipse cx="0" cy="0" rx="56" ry="42" />
      {Array.from({ length: 5 }).map((_, i) => {
        const a = (i / 5) * Math.PI - Math.PI / 2;
        return <line key={i} x1={Math.cos(a) * 8} y1={Math.sin(a) * 8} x2={Math.cos(a) * 56} y2={Math.sin(a) * 42} />;
      })}
      <ellipse cx="0" cy="0" rx="14" ry="10" />
      {Array.from({ length: 10 }).map((_, i) => {
        const a = (i / 10) * Math.PI * 2;
        return <ellipse key={i} cx={Math.cos(a) * 48} cy={Math.sin(a) * 36} rx="6" ry="5" />;
      })}
      {/* Defensive arc — withdrawal radius */}
      <circle cx="0" cy="0" r="84" strokeDasharray="3 4" opacity="0.5" />
      <text x="0" y="-90" fontFamily="'Space Mono', monospace" fontSize="8" letterSpacing="0.20em" fill={s} stroke="none" textAnchor="middle">
        withdrawal · 0.6s
      </text>
      {/* Scan arc 220° */}
      <path d="M-90 30 A 96 96 0 1 1 90 30" strokeDasharray="2 3" opacity="0.5" />
      <text x="-90" y="48" fontFamily="'Space Mono', monospace" fontSize="8" letterSpacing="0.20em" fill={s} stroke="none">
        scan · 220°
      </text>
      <text x="-72" y="86" fontFamily="'Space Mono', monospace" fontSize="8" letterSpacing="0.22em" fill={s} stroke="none">
        FIG. 1 — TORTOISE · BEHAVIORAL
      </text>
    </g>
  );
}

function MeasuredHareStudy({ flip }: { flip: boolean }) {
  const s = "#1A1A1A";
  const sx = flip ? -1 : 1;
  return (
    <g transform={`scale(${sx} 1)`} stroke={s} fill="none" strokeWidth="0.8">
      <ellipse cx="0" cy="0" rx="48" ry="22" />
      <ellipse cx="-12" cy="-32" rx="4" ry="22" transform="rotate(-12 -12 -32)" />
      <ellipse cx="0" cy="-34" rx="4" ry="22" transform="rotate(8 0 -34)" />
      <ellipse cx="40" cy="-10" rx="14" ry="10" />
      <circle cx="46" cy="-12" r="1.2" fill={s} />
      <path d="M-32 16 Q-50 28 -10 32" />
      <line x1="-56" y1="-44" x2="56" y2="-44" />
      <line x1="-56" y1="-48" x2="-56" y2="-40" />
      <line x1="56" y1="-48" x2="56" y2="-40" />
      <text x="-12" y="-48" fontFamily="'Space Mono', monospace" fontSize="8" letterSpacing="0.18em" fill={s} stroke="none" transform={flip ? "scale(-1 1) translate(24 0)" : ""}>
        body · 42cm
      </text>
      {/* Flight arc */}
      <path d="M40 0 q120 -40 200 -20" strokeDasharray="4 5" opacity="0.55" />
      <text x="170" y="-20" fontFamily="'Space Mono', monospace" fontSize="8" letterSpacing="0.20em" fill={s} stroke="none" transform={flip ? "scale(-1 1) translate(-340 0)" : ""}>
        flight vector
      </text>
      <text x="-58" y="46" fontFamily="'Space Mono', monospace" fontSize="8" letterSpacing="0.22em" fill={s} stroke="none" transform={flip ? "scale(-1 1) translate(-116 0)" : ""}>
        FIG. 2 — HARE · MEASURED
      </text>
    </g>
  );
}

function FragmentGlyph({ kind }: { kind: "half-scute" | "motion-arc" | "ear-arc" | "vector" }) {
  const s = "#1A1A1A";
  if (kind === "half-scute") {
    return (
      <g stroke={s} fill="none" strokeWidth="0.7" opacity="0.75">
        <path d="M0 22 L-14 0 L0 -22 L36 -22 L36 22 Z" />
        <path d="M0 16 L-10 0 L0 -16" opacity="0.7" />
        <path d="M0 10 L-6 0 L0 -10" opacity="0.55" />
        <circle cx="0" cy="0" r="1" fill={s} />
        <text x="-30" y="38" fontFamily="'Space Mono', monospace" fontSize="7" letterSpacing="0.20em" fill={s} stroke="none">
          scute · partial
        </text>
      </g>
    );
  }
  if (kind === "motion-arc") {
    return (
      <g stroke={s} fill="none" strokeWidth="0.7" opacity="0.7">
        <path d="M0 0 q40 -60 90 -40" strokeDasharray="4 3" />
        <circle cx="0" cy="0" r="2" fill={s} />
        <path d="M82 -52 l 10 12 l -14 4 z" fill={s} />
        <text x="20" y="-46" fontFamily="'Space Mono', monospace" fontSize="7" letterSpacing="0.20em" fill={s} stroke="none">
          escape vector
        </text>
      </g>
    );
  }
  if (kind === "ear-arc") {
    return (
      <g stroke={s} fill="none" strokeWidth="0.7" opacity="0.7">
        <ellipse cx="0" cy="0" rx="4" ry="22" transform="rotate(-10 0 0)" />
        <path d="M-20 -20 q 20 -10 40 0" strokeDasharray="2 2" />
        <text x="0" y="32" fontFamily="'Space Mono', monospace" fontSize="7" letterSpacing="0.20em" fill={s} stroke="none">
          alert · 12s
        </text>
      </g>
    );
  }
  // vector
  return (
    <g stroke={s} fill={s} strokeWidth="0.8" opacity="0.7">
      <line x1="0" y1="0" x2="60" y2="-20" />
      <path d="M55 -22 l8 4 l -6 6 z" />
      <text x="0" y="14" fontFamily="'Space Mono', monospace" fontSize="7" letterSpacing="0.20em" stroke="none">
        flight · 4.2m
      </text>
    </g>
  );
}
