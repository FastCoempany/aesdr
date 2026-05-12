"use client";

import { useEffect, useRef, useState } from "react";

import { IntensityToggle, type Intensity } from "./IntensityToggle";

/**
 * StormLayer — visible iridescent weather. Pronounced version of the
 * original WeatherLayer concept.
 *
 * Differences from Weather:
 *   - 4-5× particle count
 *   - Larger particles (up to 14px), more variety in size
 *   - "screen" blend mode so particles glow on cream instead of disappear
 *   - Wind direction responds to scroll velocity (faster scroll = stronger
 *     drift, tilt picks up)
 *   - Gravity wells around mascot positions — particles get pulled toward
 *     any mascot/badge on screen
 *   - Stronger fog (3× opacity)
 *   - Glowing halo around mascot positions, not subtle lens flares
 */

const PALETTE = [
  [208, 224, 208], // gold
  [176, 192, 208], // teal
  [160, 192, 176], // mint
  [160, 144, 176], // lavender
  [144, 144, 176], // blue
  [160, 128, 160], // pearl
  [228, 200, 220], // warm pearl (brighter)
  [200, 220, 240], // ice blue (brighter)
] as const;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: readonly [number, number, number];
  opacity: number;
  phase: number;
  size: "tiny" | "small" | "medium" | "large";
}

const COUNT_BY_INTENSITY: Record<Intensity, number> = {
  off: 0,
  subtle: 140,
  standard: 280,
  heavy: 520,
};

const FOG_OPACITY: Record<Intensity, number> = {
  off: 0,
  subtle: 0.12,
  standard: 0.24,
  heavy: 0.38,
};

const HALO_OPACITY: Record<Intensity, number> = {
  off: 0,
  subtle: 0.18,
  standard: 0.32,
  heavy: 0.5,
};

export function StormLayer() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number | null>(null);
  const dprRef = useRef(1);
  const lastTimeRef = useRef(0);
  const lastScrollYRef = useRef(0);
  const scrollVelocityRef = useRef(0);
  const mascotPositionsRef = useRef<{ x: number; y: number; r: number }[]>([]);
  const [intensity, setIntensity] = useState<Intensity>("standard");
  const [reducedMotion, setReducedMotion] = useState(false);
  const [flares, setFlares] = useState<{ top: number; size: number }[]>([]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    queueMicrotask(() => setReducedMotion(mq.matches));
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const count = reducedMotion ? Math.floor(COUNT_BY_INTENSITY[intensity] / 3) : COUNT_BY_INTENSITY[intensity];
    const w = window.innerWidth;
    const h = window.innerHeight;
    particlesRef.current = Array.from({ length: count }, () => makeParticle(w, h));
  }, [intensity, reducedMotion]);

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

  // Scroll velocity tracking
  useEffect(() => {
    let frame: number | null = null;
    function onScroll() {
      const y = window.scrollY;
      const dy = y - lastScrollYRef.current;
      lastScrollYRef.current = y;
      scrollVelocityRef.current = dy;
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        // Decay velocity each frame
        scrollVelocityRef.current *= 0.92;
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  // Track mascot positions for gravity wells + halos
  useEffect(() => {
    function recompute() {
      const positions: { x: number; y: number; r: number }[] = [];
      const haloOut: { top: number; size: number }[] = [];
      document.querySelectorAll('img[alt^="Leponeus"]').forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.bottom < -200 || rect.top > window.innerHeight + 200) return;
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const radius = Math.max(rect.width, rect.height) * 1.1;
        positions.push({ x: cx, y: cy, r: radius });
        haloOut.push({ top: cy, size: radius * 2.2 });
      });
      mascotPositionsRef.current = positions;
      setFlares(haloOut);
    }

    recompute();
    window.addEventListener("scroll", recompute, { passive: true });
    window.addEventListener("resize", recompute);
    const interval = setInterval(recompute, 400);
    return () => {
      window.removeEventListener("scroll", recompute);
      window.removeEventListener("resize", recompute);
      clearInterval(interval);
    };
  }, []);

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
      const dt = Math.min(50, now - (lastTimeRef.current || now));
      lastTimeRef.current = now;

      const w = canvas.width / dprRef.current;
      const h = canvas.height / dprRef.current;
      ctx.clearRect(0, 0, w, h);

      const speedMul = reducedMotion ? 0.2 : 1;
      const scrollWind = scrollVelocityRef.current * 0.04; // scroll velocity → wind
      const wells = mascotPositionsRef.current;

      ctx.globalCompositeOperation = "screen";

      for (const p of particles(particlesRef.current)) {
        // Wind
        p.vx += scrollWind * 0.02;
        p.vy += Math.abs(scrollWind) * 0.005; // scrolling also accelerates downward drift

        // Gravity wells around mascots
        for (const well of wells) {
          const dx = well.x - p.x;
          const dy = well.y - p.y;
          const dist2 = dx * dx + dy * dy;
          const r2 = well.r * well.r;
          if (dist2 < r2 && dist2 > 100) {
            const f = 0.0008 * (1 - dist2 / r2);
            p.vx += dx * f * dt;
            p.vy += dy * f * dt;
          }
        }

        // Drift damping (so wind doesn't stack infinitely)
        p.vx *= 0.985;
        p.vy = p.vy * 0.992 + 0.18; // gravity-ish drift back to slow downward

        // Apply
        p.x += p.vx * dt * 0.04 * speedMul;
        p.y += p.vy * dt * 0.04 * speedMul;
        p.phase += dt * 0.0012;

        // Wrap edges
        if (p.y > h + 40) { p.y = -40; p.x = Math.random() * w; p.vx = 0; p.vy = 0.2 + Math.random() * 0.6; }
        if (p.x < -40) p.x = w + 40;
        if (p.x > w + 40) p.x = -40;

        // Shimmer
        const shimmer = 0.55 + 0.45 * Math.sin(p.phase * 1.6);
        const a = p.opacity * shimmer;
        const [r, g, b] = p.color;

        // Motion-blur trail if fast
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > 3 && p.size !== "tiny") {
          ctx.strokeStyle = `rgba(${r},${g},${b},${a * 0.5})`;
          ctx.lineWidth = p.r * 0.6;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(p.x - p.vx * 2, p.y - p.vy * 2);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        }

        // Soft glow disc
        const glowR = p.r * (p.size === "large" ? 4 : p.size === "medium" ? 3.4 : 3);
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowR);
        grad.addColorStop(0, `rgba(${r},${g},${b},${a})`);
        grad.addColorStop(0.4, `rgba(${r},${g},${b},${a * 0.5})`);
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
      document.removeEventListener("visibilitychange", onVisibility);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [intensity, reducedMotion]);

  const fogIntensity = FOG_OPACITY[intensity];
  const haloIntensity = HALO_OPACITY[intensity];

  return (
    <>
      <IntensityToggle label="Storm" value={intensity} onChange={setIntensity} />

      {/* Particles */}
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
          opacity: intensity === "off" ? 0 : 1,
          transition: "opacity 300ms",
        }}
      />

      {/* Glowing mascot halos */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          opacity: intensity === "off" ? 0 : 1,
          transition: "opacity 300ms",
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
              background: `radial-gradient(circle, rgba(208, 192, 224, ${haloIntensity}) 0%, rgba(176, 192, 208, ${haloIntensity * 0.6}) 25%, rgba(160, 144, 176, ${haloIntensity * 0.3}) 45%, rgba(255, 247, 242, 0) 70%)`,
              borderRadius: "50%",
              mixBlendMode: "screen",
              filter: "blur(24px)",
            }}
          />
        ))}
      </div>

      {/* Bigger drifting cloud gradients */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          opacity: intensity === "off" ? 0 : 1,
          transition: "opacity 300ms",
          background: `
            radial-gradient(900px circle at 12% 18%, rgba(176, 192, 208, ${fogIntensity}) 0%, transparent 55%),
            radial-gradient(1100px circle at 88% 60%, rgba(160, 144, 176, ${fogIntensity * 0.9}) 0%, transparent 55%),
            radial-gradient(800px circle at 50% 110%, rgba(208, 192, 224, ${fogIntensity * 0.8}) 0%, transparent 50%),
            radial-gradient(700px circle at 30% 85%, rgba(160, 192, 176, ${fogIntensity * 0.6}) 0%, transparent 55%)
          `,
          animation: intensity === "off" || reducedMotion ? undefined : "storm-cloud-drift 18s ease-in-out infinite alternate",
          mixBlendMode: "screen",
        }}
      />

      <style>{`
        @keyframes storm-cloud-drift {
          0%   { transform: translate(0, 0) scale(1); }
          33%  { transform: translate(40px, -20px) scale(1.06); }
          66%  { transform: translate(-30px, 25px) scale(1.02); }
          100% { transform: translate(20px, -10px) scale(1.04); }
        }
      `}</style>
    </>
  );
}

function particles(arr: Particle[]) {
  return arr;
}

function makeParticle(w: number, h: number): Particle {
  const color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
  // Size distribution: 50% tiny, 30% small, 15% medium, 5% large
  const r = Math.random();
  const size: Particle["size"] = r < 0.5 ? "tiny" : r < 0.8 ? "small" : r < 0.95 ? "medium" : "large";
  const radius =
    size === "tiny" ? 1.2 + Math.random() * 1.8 :
    size === "small" ? 2.5 + Math.random() * 2.5 :
    size === "medium" ? 5 + Math.random() * 4 :
    9 + Math.random() * 5;
  const opacity =
    size === "tiny" ? 0.18 + Math.random() * 0.18 :
    size === "small" ? 0.24 + Math.random() * 0.22 :
    size === "medium" ? 0.3 + Math.random() * 0.25 :
    0.38 + Math.random() * 0.28;
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.6,
    vy: 0.15 + Math.random() * 0.55,
    r: radius,
    color,
    opacity,
    phase: Math.random() * Math.PI * 2,
    size,
  };
}
