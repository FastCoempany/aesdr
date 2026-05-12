"use client";

import { useState, useEffect } from "react";

import { IntensityToggle, type Intensity } from "./IntensityToggle";

/**
 * NacreLayer — the cream itself becomes living iridescent material.
 *
 * Pure CSS, no Canvas. Three simultaneous layers:
 *
 * 1. Page-wide slow-shifting iridescent gradient — the cream is no longer
 *    flat. A nacre-like color drift cycles every ~36s across the viewport
 *    in the doctrine PNG's six iridescent shades.
 *
 * 2. Section-specific phases — each major scroll-section gets a different
 *    iridescent hue tint applied to its background. Pricing pulls pink,
 *    hero pulls pearl, FAQ pulls teal, final CTA pulls gold. The page
 *    has a chromatic narrative arc.
 *
 * 3. Iris seams — thin iris-gradient hairlines drawn at section boundaries,
 *    like opal seams running through stone.
 *
 * Plus chromatic aberration on display headings — a 1-2px pearlescent
 * fringe at the edges of Playfair italic type, like light refracting
 * through the page.
 */

const INTENSITY_OPACITY: Record<Intensity, { sheet: number; sections: number; seams: number; aberration: number }> = {
  off:      { sheet: 0,    sections: 0,    seams: 0,    aberration: 0   },
  subtle:   { sheet: 0.18, sections: 0.10, seams: 0.30, aberration: 0.5 },
  standard: { sheet: 0.32, sections: 0.20, seams: 0.55, aberration: 1.2 },
  heavy:    { sheet: 0.52, sections: 0.35, seams: 0.85, aberration: 2.0 },
};

export function NacreLayer() {
  const [intensity, setIntensity] = useState<Intensity>("standard");
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    queueMicrotask(() => setReducedMotion(mq.matches));
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const op = INTENSITY_OPACITY[intensity];
  const animations = !reducedMotion && intensity !== "off";

  return (
    <>
      <IntensityToggle label="Nacre" value={intensity} onChange={setIntensity} />

      {/* ─── Layer 1: page-wide nacre sheet ─── */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          opacity: op.sheet,
          mixBlendMode: "overlay",
          transition: "opacity 400ms",
          background: `
            linear-gradient(135deg,
              rgba(208, 224, 208, 0.6) 0%,
              rgba(176, 192, 208, 0.5) 18%,
              rgba(160, 192, 176, 0.4) 35%,
              rgba(228, 200, 220, 0.5) 52%,
              rgba(160, 144, 176, 0.4) 70%,
              rgba(200, 220, 240, 0.5) 88%,
              rgba(208, 224, 208, 0.6) 100%
            )
          `,
          backgroundSize: "400% 400%",
          animation: animations ? "nacre-shift 38s ease-in-out infinite" : undefined,
        }}
      />

      {/* ─── Layer 2: section-specific phases ─── */}
      <style>{`
        [data-mockup-section="hero"]::before,
        [data-mockup-section="deckstack"]::before,
        [data-mockup-section="testimonials"]::before,
        [data-mockup-section="validation"]::before,
        [data-mockup-section="pricing"]::before,
        [data-mockup-section="faq"]::before,
        [data-mockup-section="cta"]::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          opacity: ${op.sections};
          mix-blend-mode: overlay;
          transition: opacity 400ms;
        }
        [data-mockup-section]:not([data-mockup-section="hero"]):not([data-mockup-section="footer"]):not([data-mockup-section="warning"]) {
          position: relative;
        }
        [data-mockup-section="hero"] {
          position: relative;
        }
        [data-mockup-section="hero"]::before {
          background: radial-gradient(ellipse at 50% 30%, rgba(228, 220, 235, 0.85), transparent 60%);
        }
        [data-mockup-section="deckstack"]::before {
          background: radial-gradient(ellipse at 30% 40%, rgba(208, 224, 208, 0.8), transparent 55%);
        }
        [data-mockup-section="testimonials"]::before {
          background: radial-gradient(ellipse at 70% 50%, rgba(176, 192, 208, 0.8), transparent 55%);
        }
        [data-mockup-section="validation"]::before {
          background: linear-gradient(180deg, rgba(160, 192, 176, 0.65), transparent);
        }
        [data-mockup-section="pricing"]::before {
          background: radial-gradient(ellipse at 50% 30%, rgba(228, 180, 200, 0.9), transparent 55%);
        }
        [data-mockup-section="faq"]::before {
          background: radial-gradient(ellipse at 50% 50%, rgba(176, 200, 216, 0.8), transparent 60%);
        }
        [data-mockup-section="cta"]::before {
          background: radial-gradient(ellipse at 50% 50%, rgba(232, 212, 152, 0.85), transparent 60%);
        }

        @keyframes nacre-shift {
          0%   { background-position: 0% 50%;   filter: hue-rotate(0deg); }
          25%  { background-position: 50% 100%; filter: hue-rotate(8deg); }
          50%  { background-position: 100% 50%; filter: hue-rotate(-6deg); }
          75%  { background-position: 50% 0%;   filter: hue-rotate(4deg); }
          100% { background-position: 0% 50%;   filter: hue-rotate(0deg); }
        }

        ${op.aberration > 0 ? `
          [data-mockup="landing"] h1,
          [data-mockup="landing"] h2,
          [data-mockup="landing"] .${"heroBrand"} {
            text-shadow:
              ${(-op.aberration).toFixed(2)}px 0 rgba(255, 100, 180, 0.55),
              ${(op.aberration).toFixed(2)}px 0 rgba(100, 200, 240, 0.55);
          }
        ` : ""}
      `}</style>

      {/* ─── Layer 3: iris seams between sections ─── */}
      {intensity !== "off" && (
        <SeamsOverlay opacity={op.seams} animations={animations} />
      )}
    </>
  );
}

/** Iris-gradient hairlines drawn between section boundaries — opal-seam look. */
function SeamsOverlay({ opacity, animations }: { opacity: number; animations: boolean }) {
  const [seamYs, setSeamYs] = useState<number[]>([]);

  useEffect(() => {
    function recompute() {
      const sections = document.querySelectorAll<HTMLElement>("[data-mockup-section]");
      const ys: number[] = [];
      sections.forEach((s) => {
        const r = s.getBoundingClientRect();
        ys.push(r.top + window.scrollY);
      });
      setSeamYs(ys);
    }
    recompute();
    window.addEventListener("resize", recompute);
    const t = setInterval(recompute, 700);
    return () => {
      window.removeEventListener("resize", recompute);
      clearInterval(t);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        pointerEvents: "none",
        zIndex: 1,
        opacity,
        transition: "opacity 400ms",
      }}
    >
      {seamYs.map((y, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: y - 1,
            left: "8%",
            width: "84%",
            height: 1,
            background: "linear-gradient(90deg, transparent 0%, #FF006E 18%, #FF6B00 32%, #F59E0B 45%, #10B981 58%, #38BDF8 72%, #8B5CF6 85%, transparent 100%)",
            backgroundSize: "200% 100%",
            animation: animations ? `nacre-seam-shift ${10 + (i % 4) * 3}s linear infinite` : undefined,
            mixBlendMode: "screen",
          }}
        />
      ))}

      <style>{`
        @keyframes nacre-seam-shift {
          0%   { background-position: 0% 50%; }
          100% { background-position: -200% 50%; }
        }
      `}</style>
    </div>
  );
}
