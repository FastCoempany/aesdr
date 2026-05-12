"use client";

import { useState, useEffect, useRef } from "react";

import { IntensityToggle, type Intensity } from "./IntensityToggle";

/**
 * HeliographLayer — the day's sun-arc across the page.
 *
 * Both tortoise and hare organize their lives around the sun. The
 * tortoise basks; the hare emerges crepuscular. This page is one day's
 * sun-traverse, read top-to-bottom.
 *
 * A single sun-disc rides from upper-left (dawn) through right-margin
 * (noon, high) to lower-left (dusk) as you scroll. Section headlines
 * cast LONG cast-shadows whose angle and length follow the sun's
 * position. Heat-haze ripples subtly at high noon. A gnomon tick at
 * lower-left shows the current shadow direction + time-of-day label.
 */

const OP: Record<Intensity, number> = {
  off: 0,
  subtle: 0.40,
  standard: 0.68,
  heavy: 0.95,
};

export function HeliographLayer() {
  const [intensity, setIntensity] = useState<Intensity>("standard");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mounted, setMounted] = useState(false);
  const rafRef = useRef<number | null>(null);
  const pending = useRef(false);

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
    function update() {
      pending.current = false;
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const p = h > 0 ? Math.max(0, Math.min(1, window.scrollY / h)) : 0;
      setScrollProgress(p);
    }
    function onScroll() {
      if (pending.current) return;
      pending.current = true;
      rafRef.current = requestAnimationFrame(update);
    }
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const op = OP[intensity];
  const ang = scrollProgress * Math.PI; // 0..π over the page

  // Sun position in viewBox space (0..1200 horizontal, 0..800 vertical)
  const sunVbX = 80 + Math.sin(ang) * 1040;
  const sunVbY = 100 + (1 - Math.sin(ang)) * 420;

  // Shadow vector for headlines (CSS px)
  const shadowDir = scrollProgress < 0.5 ? 1 : -1;
  const shadowLen = 6 + (1 - Math.sin(ang)) * 14;
  const sx = shadowDir * Math.cos(Math.PI * 0.18) * shadowLen;
  const sy = Math.sin(Math.PI * 0.18) * shadowLen + 3;

  const hazeStrength = Math.sin(ang);

  const timeLabel =
    scrollProgress < 0.16
      ? "DAWN"
      : scrollProgress < 0.42
        ? "MORNING"
        : scrollProgress < 0.58
          ? "NOON"
          : scrollProgress < 0.84
            ? "AFTERNOON"
            : "DUSK";

  return (
    <>
      <IntensityToggle label="Heliograph" value={intensity} onChange={setIntensity} />

      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 4,
          opacity: op * 0.5,
          background: `linear-gradient(180deg,
            rgba(160,176,184,0.30) 0%,
            rgba(232,200,140,0.0) 16%,
            rgba(232,200,140,0.32) 50%,
            rgba(232,200,140,0.0) 84%,
            rgba(120,96,80,0.32) 100%
          )`,
          mixBlendMode: "multiply",
          transition: "opacity 320ms",
        }}
      />

      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 4,
          opacity: op * hazeStrength * 0.4,
          background:
            "repeating-linear-gradient(90deg, rgba(232,200,140,0.0) 0px, rgba(232,200,140,0.20) 2px, rgba(232,200,140,0.0) 4px)",
          mixBlendMode: "multiply",
          filter: "blur(2px)",
        }}
      />

      {mounted && (
        <svg
          aria-hidden="true"
          viewBox="0 0 1200 800"
          preserveAspectRatio="xMidYMid slice"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 5,
            opacity: op,
            mixBlendMode: "multiply",
            transition: "opacity 320ms",
          }}
        >
          <defs>
            <radialGradient id="helio-sun" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FAF7F2" stopOpacity="0.95" />
              <stop offset="35%" stopColor="#E8D4A0" stopOpacity="0.85" />
              <stop offset="70%" stopColor="#D4A668" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#D4A668" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx={sunVbX} cy={sunVbY} r="200" fill="url(#helio-sun)" />
          <circle cx={sunVbX} cy={sunVbY} r="38" fill="#FAF7F2" opacity="0.9" />
          <circle cx={sunVbX} cy={sunVbY} r="38" fill="none" stroke="#1A1A1A" strokeWidth="0.7" opacity="0.45" />

          <g transform="translate(80 720)" opacity="0.72">
            <line x1="0" y1="0" x2="0" y2="-52" stroke="#1A1A1A" strokeWidth="1.4" />
            <circle cx="0" cy="-52" r="2.4" fill="#1A1A1A" />
            <line
              x1="0"
              y1="0"
              x2={sx * 1.6}
              y2={sy * 1.6}
              stroke="#1A1A1A"
              strokeWidth="0.8"
              strokeDasharray="2 2"
              opacity="0.65"
            />
            <text
              x="0"
              y="24"
              fontFamily="'Space Mono', monospace"
              fontSize="10"
              letterSpacing="0.22em"
              fill="#1A1A1A"
              opacity="0.7"
              textAnchor="middle"
            >
              {timeLabel}
            </text>
          </g>
        </svg>
      )}

      <style>{`
        [data-mockup="landing"] h1,
        [data-mockup="landing"] h2 {
          text-shadow: ${sx.toFixed(1)}px ${sy.toFixed(1)}px 0 rgba(26,26,26,${(0.18 + op * 0.4).toFixed(2)});
          transition: text-shadow 200ms linear;
        }
      `}</style>
    </>
  );
}
