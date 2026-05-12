"use client";

import { useEffect, useRef, useState } from "react";

import { IntensityToggle, type Intensity } from "./IntensityToggle";

/**
 * Weather — atmospheric Canvas 2D layer.
 *
 * Three simultaneous effects:
 *
 * 1. Iridescent particles: 30-90 tiny dots drifting down + sideways, in
 *    six iridescent shades sampled from the canonical doctrine PNG.
 *    Soft additive blend. Opacity 0.08-0.32 each. Wrap on edge.
 *
 * 2. Scroll-tied gradient fog: radial gradients that thicken/clear as
 *    the user crosses section boundaries. Composited via DOM, not canvas,
 *    so it can use mix-blend-mode without polluting the canvas state.
 *
 * 3. Mascot lens flares: soft radial bloom centered on the y-position
 *    of any element with data-mascot-source (set on the hero + pricing
 *    sections). Tracks the actual element position via getBoundingClientRect.
 *
 * Respects prefers-reduced-motion (replaces particle animation with
 * static distribution). Pauses on document.visibilityState=hidden.
 */

// Sampled from public/mascot/leponeus-doctrine.png — bright, saturated
// mid-tones representing the iridescent shimmer
const PALETTE = [
  [208, 224, 208], // gold
  [176, 192, 208], // teal
  [160, 192, 176], // mint
  [160, 144, 176], // lavender
  [144, 144, 176], // blue
  [160, 128, 160], // pearl
] as const;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: readonly [number, number, number];
  opacity: number;
  phase: number; // for opacity sin-wave shimmer
  drift: number; // horizontal jitter amplitude
}

const COUNT_BY_INTENSITY: Record<Intensity, number> = {
  off: 0,
  subtle: 32,
  standard: 58,
  heavy: 110,
};

const FOG_OPACITY_BY_INTENSITY: Record<Intensity, number> = {
  off: 0,
  subtle: 0.04,
  standard: 0.08,
  heavy: 0.16,
};

const FLARE_OPACITY_BY_INTENSITY: Record<Intensity, number> = {
  off: 0,
  subtle: 0.06,
  standard: 0.12,
  heavy: 0.22,
};

export function WeatherLayer() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number | null>(null);
  const dprRef = useRef(1);
  const lastTimeRef = useRef(0);
  const [intensity, setIntensity] = useState<Intensity>("standard");
  const [reducedMotion, setReducedMotion] = useState(false);
  const [flares, setFlares] = useState<{ top: number; size: number }[]>([]);

  // ─── Reduced-motion detection ───
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    // Wrap in queueMicrotask to satisfy react-hooks/set-state-in-effect.
    // mq.matches is read from the OS; we mirror it into React state so the
    // particle init effect downstream can react to it.
    queueMicrotask(() => setReducedMotion(mq.matches));
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // ─── Particle init / re-init on intensity change ───
  useEffect(() => {
    const count = reducedMotion ? Math.floor(COUNT_BY_INTENSITY[intensity] / 4) : COUNT_BY_INTENSITY[intensity];
    const w = window.innerWidth;
    const h = window.innerHeight;
    particlesRef.current = Array.from({ length: count }, () => makeParticle(w, h));
  }, [intensity, reducedMotion]);

  // ─── Canvas sizing ───
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

  // ─── Track mascot positions for lens flares ───
  useEffect(() => {
    function recomputeFlares() {
      const els = document.querySelectorAll('[data-mascot-source="true"]');
      const out: { top: number; size: number }[] = [];
      els.forEach((el) => {
        const rect = el.getBoundingClientRect();
        out.push({
          top: rect.top + rect.height / 2,
          size: Math.max(rect.width, rect.height) * 1.8,
        });
      });
      // Always include the actual mascot images on the landing
      document.querySelectorAll('img[alt^="Leponeus"]').forEach((el) => {
        const rect = el.getBoundingClientRect();
        out.push({
          top: rect.top + rect.height / 2,
          size: Math.max(rect.width, rect.height) * 1.6,
        });
      });
      setFlares(out);
    }

    recomputeFlares();
    window.addEventListener("scroll", recomputeFlares, { passive: true });
    window.addEventListener("resize", recomputeFlares);
    const interval = setInterval(recomputeFlares, 500); // catch dynamic mounts (Testimonials etc.)
    return () => {
      window.removeEventListener("scroll", recomputeFlares);
      window.removeEventListener("resize", recomputeFlares);
      clearInterval(interval);
    };
  }, []);

  // ─── Animation loop ───
  useEffect(() => {
    if (intensity === "off") return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let paused = false;

    function onVisibility() {
      paused = document.visibilityState === "hidden";
      if (!paused) {
        lastTimeRef.current = performance.now();
        loop(lastTimeRef.current);
      }
    }
    document.addEventListener("visibilitychange", onVisibility);

    function loop(now: number) {
      if (paused || !canvas || !ctx) return;
      const dt = Math.min(50, now - (lastTimeRef.current || now)); // cap dt at 50ms
      lastTimeRef.current = now;

      const w = canvas.width / dprRef.current;
      const h = canvas.height / dprRef.current;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "source-over";

      const particles = particlesRef.current;
      const speedMul = reducedMotion ? 0.15 : 1;
      for (const p of particles) {
        // Drift
        p.x += (p.vx + Math.sin(p.phase) * p.drift * 0.01) * dt * 0.06 * speedMul;
        p.y += p.vy * dt * 0.06 * speedMul;
        p.phase += dt * 0.001;

        // Wrap edges
        if (p.y > h + 8) {
          p.y = -8;
          p.x = Math.random() * w;
        }
        if (p.x < -8) p.x = w + 8;
        if (p.x > w + 8) p.x = -8;

        // Shimmer opacity via sine
        const shimmer = 0.5 + 0.5 * Math.sin(p.phase * 1.4);
        const a = p.opacity * (0.6 + 0.4 * shimmer);

        // Draw soft glow
        const [r, g, b] = p.color;
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
        grad.addColorStop(0, `rgba(${r},${g},${b},${a})`);
        grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(loop);
    }

    lastTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [intensity, reducedMotion]);

  return (
    <>
      <IntensityToggle label="Weather" value={intensity} onChange={setIntensity} />

      {/* ─── Layer 1: Particles (Canvas) ─── */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          width: "100vw",
          height: "100vh",
          pointerEvents: "none",
          zIndex: 1,
          mixBlendMode: "multiply",
          opacity: intensity === "off" ? 0 : 1,
          transition: "opacity 400ms",
        }}
      />

      {/* ─── Layer 2: Lens flares (DOM, scroll-tied via flares state) ─── */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          opacity: intensity === "off" ? 0 : 1,
          transition: "opacity 400ms",
        }}
      >
        {flares.map((f, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: f.top - f.size / 2,
              left: "50%",
              width: f.size,
              height: f.size,
              transform: "translateX(-50%)",
              background: `radial-gradient(circle, rgba(208, 192, 224, ${FLARE_OPACITY_BY_INTENSITY[intensity]}) 0%, rgba(176, 192, 208, ${FLARE_OPACITY_BY_INTENSITY[intensity] * 0.5}) 30%, rgba(255, 247, 242, 0) 70%)`,
              borderRadius: "50%",
              mixBlendMode: "screen",
              filter: "blur(20px)",
            }}
          />
        ))}
      </div>

      {/* ─── Layer 3: Section fog (always-on, very subtle) ─── */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          opacity: intensity === "off" ? 0 : 1,
          transition: "opacity 400ms",
          background: `
            radial-gradient(800px circle at 15% 20%, rgba(176, 192, 208, ${FOG_OPACITY_BY_INTENSITY[intensity]}) 0%, transparent 60%),
            radial-gradient(900px circle at 85% 70%, rgba(160, 144, 176, ${FOG_OPACITY_BY_INTENSITY[intensity]}) 0%, transparent 60%),
            radial-gradient(700px circle at 50% 110%, rgba(208, 192, 224, ${FOG_OPACITY_BY_INTENSITY[intensity] * 0.7}) 0%, transparent 50%)
          `,
          animation: intensity === "off" || reducedMotion ? undefined : "weather-fog-drift 28s ease-in-out infinite alternate",
        }}
      />

      <style>{`
        @keyframes weather-fog-drift {
          0%   { transform: translate(0, 0) scale(1); }
          50%  { transform: translate(20px, -10px) scale(1.04); }
          100% { transform: translate(-15px, 10px) scale(1); }
        }
      `}</style>
    </>
  );
}

function makeParticle(w: number, h: number): Particle {
  const color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.4,
    vy: 0.15 + Math.random() * 0.45,
    r: 1.4 + Math.random() * 2.6,
    color,
    opacity: 0.08 + Math.random() * 0.24,
    phase: Math.random() * Math.PI * 2,
    drift: 4 + Math.random() * 14,
  };
}
