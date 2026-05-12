"use client";

import { useEffect, useRef, useState } from "react";

import { IntensityToggle, type Intensity } from "./IntensityToggle";

/**
 * DepthLayer — the page stops being a flat surface and becomes a space.
 *
 * Five simultaneous effects:
 *
 * 1. Cream back-wall — vertical gradient suggesting the cream is a
 *    surface in a deep room, not a flat sheet. Darker at viewport bottom
 *    (further away), lighter at top (closer).
 *
 * 2. Volumetric light shafts — diagonal soft beams emanating from a
 *    corner of the viewport. Like sun through clouds.
 *
 * 3. Multi-depth particle planes — particles rendered at three Z-depths.
 *    Foreground big and fast, mid medium, background tiny and slow.
 *    Parallax effect against scroll.
 *
 * 4. Cursor-tracked ambient light — a soft radial glow that follows the
 *    cursor, suggesting the page is reactive to attention.
 *
 * 5. Edge vignette — corners of viewport slightly darkened, suggesting
 *    you're looking *into* something rather than *at* something.
 *
 * Plus mascot drop-shadows applied globally so the figures look like
 * they float forward of the substrate.
 */

interface DepthParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  depth: "near" | "mid" | "far";
  color: readonly [number, number, number];
  opacity: number;
  phase: number;
}

const PALETTE = [
  [208, 224, 208],
  [176, 192, 208],
  [160, 192, 176],
  [228, 200, 220],
  [200, 220, 240],
] as const;

const COUNT_BY_INTENSITY: Record<Intensity, number> = {
  off: 0,
  subtle: 60,
  standard: 140,
  heavy: 240,
};

const SHAFT_OPACITY: Record<Intensity, number> = {
  off: 0,
  subtle: 0.08,
  standard: 0.18,
  heavy: 0.32,
};

const VIGNETTE_OPACITY: Record<Intensity, number> = {
  off: 0,
  subtle: 0.10,
  standard: 0.20,
  heavy: 0.34,
};

const CURSOR_OPACITY: Record<Intensity, number> = {
  off: 0,
  subtle: 0.12,
  standard: 0.20,
  heavy: 0.32,
};

export function DepthLayer() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<DepthParticle[]>([]);
  const rafRef = useRef<number | null>(null);
  const dprRef = useRef(1);
  const lastTimeRef = useRef(0);
  const cursorRef = useRef({ x: -1000, y: -1000 });
  const scrollYRef = useRef(0);
  const [intensity, setIntensity] = useState<Intensity>("standard");
  const [reducedMotion, setReducedMotion] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    queueMicrotask(() => setReducedMotion(mq.matches));
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Particle init
  useEffect(() => {
    const count = reducedMotion ? Math.floor(COUNT_BY_INTENSITY[intensity] / 3) : COUNT_BY_INTENSITY[intensity];
    const w = window.innerWidth;
    const h = window.innerHeight;
    particlesRef.current = Array.from({ length: count }, () => makeDepthParticle(w, h));
  }, [intensity, reducedMotion]);

  // Canvas sizing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    function resize() {
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      dprRef.current = dpr;
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(dpr, dpr);
    }
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // Cursor tracking
  useEffect(() => {
    let rafId: number | null = null;
    function onMove(e: MouseEvent) {
      cursorRef.current = { x: e.clientX, y: e.clientY };
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        setCursorPos({ ...cursorRef.current });
        rafId = null;
      });
    }
    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  // Scroll tracking for parallax
  useEffect(() => {
    function onScroll() {
      scrollYRef.current = window.scrollY;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Animation loop
  useEffect(() => {
    if (intensity === "off") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let paused = false;
    function onVis() {
      paused = document.visibilityState === "hidden";
      if (!paused) {
        lastTimeRef.current = performance.now();
        loop(lastTimeRef.current);
      }
    }
    document.addEventListener("visibilitychange", onVis);

    function loop(now: number) {
      if (paused || !canvas || !ctx) return;
      const dt = Math.min(50, now - (lastTimeRef.current || now));
      lastTimeRef.current = now;
      const w = canvas.width / dprRef.current;
      const h = canvas.height / dprRef.current;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "screen";
      const speedMul = reducedMotion ? 0.25 : 1;

      for (const p of particlesRef.current) {
        const depthSpeedMul = p.depth === "near" ? 1.4 : p.depth === "mid" ? 1.0 : 0.55;
        p.x += p.vx * dt * 0.05 * speedMul * depthSpeedMul;
        p.y += p.vy * dt * 0.05 * speedMul * depthSpeedMul;
        p.phase += dt * 0.0015;

        if (p.y > h + 30) { p.y = -30; p.x = Math.random() * w; }
        if (p.x < -30) p.x = w + 30;
        if (p.x > w + 30) p.x = -30;

        const shimmer = 0.5 + 0.5 * Math.sin(p.phase * 1.4);
        const a = p.opacity * (0.55 + 0.45 * shimmer);
        const [r, g, b] = p.color;
        const glowR = p.r * (p.depth === "near" ? 3.6 : p.depth === "mid" ? 3.0 : 2.4);
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowR);
        grad.addColorStop(0, `rgba(${r},${g},${b},${a})`);
        grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, glowR, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(loop);
    }
    lastTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [intensity, reducedMotion]);

  const shaftOp = SHAFT_OPACITY[intensity];
  const vigOp = VIGNETTE_OPACITY[intensity];
  const cursorOp = CURSOR_OPACITY[intensity];

  return (
    <>
      <IntensityToggle label="Depth" value={intensity} onChange={setIntensity} />

      {/* ─── Layer 1: cream back-wall vertical gradient ─── */}
      {intensity !== "off" && (
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
            zIndex: 0,
            background: `linear-gradient(180deg, rgba(255,255,255,${intensity === "heavy" ? 0.22 : intensity === "standard" ? 0.14 : 0.08}) 0%, transparent 30%, transparent 70%, rgba(26,26,26,${intensity === "heavy" ? 0.10 : intensity === "standard" ? 0.06 : 0.03}) 100%)`,
          }}
        />
      )}

      {/* ─── Layer 2: volumetric light shafts (diagonal from top-left corner) ─── */}
      {intensity !== "off" && (
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
            zIndex: 1,
            background: `
              linear-gradient(115deg,
                rgba(228, 220, 235, ${shaftOp}) 0%,
                rgba(228, 220, 235, ${shaftOp * 0.75}) 12%,
                transparent 24%,
                transparent 38%,
                rgba(208, 224, 240, ${shaftOp * 0.6}) 44%,
                transparent 52%,
                transparent 68%,
                rgba(228, 200, 220, ${shaftOp * 0.4}) 74%,
                transparent 82%
              )
            `,
            mixBlendMode: "screen",
            animation: reducedMotion ? undefined : "depth-shaft-drift 24s ease-in-out infinite alternate",
          }}
        />
      )}

      {/* ─── Layer 3: multi-depth particles (Canvas) ─── */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          width: "100vw",
          height: "100vh",
          pointerEvents: "none",
          zIndex: 2,
          opacity: intensity === "off" ? 0 : 1,
          transition: "opacity 400ms",
        }}
      />

      {/* ─── Layer 4: cursor-tracked ambient light ─── */}
      {intensity !== "off" && cursorPos.x > -500 && (
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            top: cursorPos.y - 250,
            left: cursorPos.x - 250,
            width: 500,
            height: 500,
            pointerEvents: "none",
            zIndex: 1,
            background: `radial-gradient(circle, rgba(255, 247, 230, ${cursorOp}) 0%, rgba(228, 220, 235, ${cursorOp * 0.5}) 30%, transparent 60%)`,
            borderRadius: "50%",
            mixBlendMode: "screen",
            filter: "blur(40px)",
            transition: "opacity 300ms",
          }}
        />
      )}

      {/* ─── Layer 5: edge vignette ─── */}
      {intensity !== "off" && (
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
            zIndex: 3,
            background: `radial-gradient(ellipse at center, transparent 40%, rgba(26, 26, 26, ${vigOp * 0.4}) 75%, rgba(26, 26, 26, ${vigOp}) 100%)`,
          }}
        />
      )}

      {/* Mascot drop shadow + slight forward float — applied globally to
          all Leponeus images so they read as floating in the depth space */}
      {intensity !== "off" && (
        <style>{`
          img[alt^="Leponeus"] {
            filter: drop-shadow(0 12px 28px rgba(26, 26, 26, ${intensity === "heavy" ? 0.22 : intensity === "standard" ? 0.16 : 0.10}))
                    drop-shadow(0 4px 8px rgba(26, 26, 26, ${intensity === "heavy" ? 0.14 : intensity === "standard" ? 0.10 : 0.06}));
            transition: filter 400ms;
          }
          @keyframes depth-shaft-drift {
            0%   { transform: translate(0, 0); }
            100% { transform: translate(-40px, 20px); }
          }
        `}</style>
      )}
    </>
  );
}

function makeDepthParticle(w: number, h: number): DepthParticle {
  const color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
  const r = Math.random();
  // 25% near (large/fast), 50% mid, 25% far (small/slow)
  const depth: DepthParticle["depth"] = r < 0.25 ? "near" : r < 0.75 ? "mid" : "far";
  const radius =
    depth === "near" ? 6 + Math.random() * 6 :
    depth === "mid" ? 3 + Math.random() * 3 :
    1.2 + Math.random() * 1.6;
  const opacity =
    depth === "near" ? 0.35 + Math.random() * 0.25 :
    depth === "mid" ? 0.22 + Math.random() * 0.20 :
    0.12 + Math.random() * 0.14;
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.5,
    vy: 0.15 + Math.random() * 0.4,
    r: radius,
    depth,
    color,
    opacity,
    phase: Math.random() * Math.PI * 2,
  };
}
