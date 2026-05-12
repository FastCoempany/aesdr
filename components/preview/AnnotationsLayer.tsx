"use client";

import { useEffect, useState } from "react";

import { IntensityToggle, type Intensity } from "./IntensityToggle";
import { MICHAEL_NOTES, type Annotation } from "./annotations";

/**
 * AnnotationsLayer — overlays the landing mockup with Michael's marginalia.
 *
 * Each annotation in annotations.ts is anchored to a CSS selector and
 * positioned relative to that element's bounding box. Positions are
 * recomputed on every scroll + resize, so they ride along with the
 * underlying content layout.
 *
 * Intensity toggle dials note volume:
 *   - off       no notes
 *   - subtle    every 3rd note (5 of 15)
 *   - standard  every other note (8 of 15)
 *   - heavy     all 15 notes
 */

interface PositionedNote {
  index: number;
  note: Annotation;
  top: number;
  left: number;
}

const INTENSITY_KEEP: Record<Intensity, (i: number) => boolean> = {
  off: () => false,
  subtle: (i) => i % 3 === 0, // 5 of 15
  standard: (i) => i % 2 === 0, // 8 of 15
  heavy: () => true,
};

export function AnnotationsLayer() {
  const [positions, setPositions] = useState<PositionedNote[]>([]);
  const [intensity, setIntensity] = useState<Intensity>("standard");

  useEffect(() => {
    function computePositions() {
      const out: PositionedNote[] = [];
      const scrollY = window.scrollY;

      MICHAEL_NOTES.forEach((note, i) => {
        if (!INTENSITY_KEEP[intensity](i)) return;

        const anchor = document.querySelector(note.anchor) as HTMLElement | null;
        if (!anchor) return;

        const rect = anchor.getBoundingClientRect();
        const top = rect.top + scrollY + note.yOffset;
        let left: number;
        if (note.side === "left") {
          left = rect.left - note.xOffset - note.width;
        } else {
          left = rect.right + note.xOffset;
        }

        // Bound to viewport — if a note would land off-screen at narrow widths,
        // tuck it into the nearest margin instead of dropping it entirely.
        const minLeft = 8;
        const maxLeft = window.innerWidth - note.width - 8;
        if (left < minLeft) left = minLeft;
        if (left > maxLeft) left = maxLeft;

        out.push({ index: i, note, top, left });
      });
      setPositions(out);
    }

    computePositions();
    // Re-compute on scroll/resize, plus periodic recheck for late-mounting
    // sections (Testimonials + DeckStack are dynamic imports).
    const onScroll = () => requestAnimationFrame(computePositions);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", computePositions);
    const interval = setInterval(computePositions, 700);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", computePositions);
      clearInterval(interval);
    };
  }, [intensity]);

  return (
    <>
      <IntensityToggle label="Annotations" value={intensity} onChange={setIntensity} />

      {/* Absolute layer holding all marginalia */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          pointerEvents: "none",
          zIndex: 5,
        }}
      >
        {positions.map(({ index, note, top, left }) => (
          <span
            key={index}
            style={{
              position: "absolute",
              top,
              left,
              width: note.width,
              fontFamily: "var(--hand, 'Caveat', cursive)",
              fontSize: 18,
              lineHeight: 1.25,
              color: note.ink === "crimson" ? "var(--crimson)" : "rgba(26, 26, 26, 0.78)",
              transform: `rotate(${note.tilt ?? 0}deg)`,
              transformOrigin: note.side === "left" ? "top right" : "top left",
              userSelect: "none",
              opacity: 0,
              animation: `michael-fade-in 600ms ease-out forwards`,
              animationDelay: `${(index % 4) * 80}ms`,
            }}
          >
            {note.text}
          </span>
        ))}
      </div>

      <style>{`
        @keyframes michael-fade-in {
          from { opacity: 0; transform: translateY(4px) rotate(var(--note-tilt, 0deg)); }
          to   { opacity: 1; }
        }
      `}</style>
    </>
  );
}
