"use client";

/**
 * Half-second flash of the validator-company names on the Step 1 gate. Sits
 * subtly under the gate copy and pulses once on mount so the prospect
 * registers, without thinking about it, the company shapes behind AESDR.
 *
 * Names come from components/ValidationMarquee.tsx — kept in sync by hand
 * (small list; updates are rare; importing the full marquee adds animation
 * weight we don't want on the gate).
 */
import { useEffect, useState } from "react";

const FLASH_NAMES = [
  "Harvey", "Pendo", "Job&Talent", "OpenGov", "Scribe", "Superhuman", "CADDi",
  "Filevine", "Aisera", "k-ID", "Lorikeet", "Craft", "Smokeball", "Rally UXR",
  "Parable", "Shapr3D", "Sybill", "HeyMilo", "Clearbrief", "Moonhub",
  "harpin AI", "Newscatcher", "Duckie",
];

export default function ValidatorFlash() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // start invisible, flash to fully visible at ~700ms (after the gate's
    // first paint settles), hold for ~500ms, fade back out.
    const t1 = setTimeout(() => setShow(true), 700);
    const t2 = setTimeout(() => setShow(false), 1300);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        bottom: 32,
        left: "50%",
        transform: "translateX(-50%)",
        maxWidth: "min(900px, 92vw)",
        textAlign: "center",
        opacity: show ? 1 : 0,
        transition: "opacity 320ms ease",
        pointerEvents: "none",
        fontFamily: "var(--mono, 'Space Mono', monospace)",
        fontSize: 11,
        letterSpacing: ".12em",
        textTransform: "uppercase",
        color: "var(--muted, #6B6B6B)",
        lineHeight: 1.9,
        userSelect: "none",
      }}
    >
      <div
        style={{
          fontFamily: "var(--cond, 'Barlow Condensed', sans-serif)",
          color: "var(--crimson, #8B1A1A)",
          marginBottom: 6,
          letterSpacing: ".22em",
        }}
      >
        VALIDATED BY
      </div>
      {FLASH_NAMES.join("  ·  ")}
    </div>
  );
}
