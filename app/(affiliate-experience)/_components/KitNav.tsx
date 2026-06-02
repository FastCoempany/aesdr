"use client";

/**
 * Floating bottom-right "knob" on every /x/kit page. Two destinations:
 *   - "Back to landing" → /x/landing (skip the gate, dive straight into the
 *     deck-stack landing, BottomTimer + pricing + everything)
 *   - "Back to animation" → /x/welcome (replay the Leponeus gate +
 *     cinematic from the top)
 *
 * The knob is a small rotary dial — single circular button with a pointer.
 * Click rotates the pointer subtly through three rest positions (closed,
 * landing-aligned, animation-aligned). Center click on a non-closed position
 * navigates to the matching destination. Closed = neutral / no action.
 *
 * Sits in the bottom-right slot where most sites put the accessibility
 * widget; we lift slightly so a future a11y widget can sit underneath us
 * without a stacking fight.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { trackProspect } from "../_lib/track";

type Position = "closed" | "landing" | "animation";

const POSITIONS: Position[] = ["closed", "landing", "animation"];

const ROTATION: Record<Position, number> = {
  closed: 0,
  landing: -60,
  animation: 60,
};

const LABEL: Record<Position, string> = {
  closed: "Where to next?",
  landing: "Back to landing →",
  animation: "Back to animation ↻",
};

const ROUTE: Record<Position, string | null> = {
  closed: null,
  landing: "/x/landing",
  animation: "/x/welcome",
};

export default function KitNav() {
  const router = useRouter();
  const [position, setPosition] = useState<Position>("closed");

  function advance() {
    const next =
      POSITIONS[(POSITIONS.indexOf(position) + 1) % POSITIONS.length];
    setPosition(next);
  }

  function commit() {
    const target = ROUTE[position];
    if (!target) return;
    trackProspect("kit_nav_used", { to: position });
    router.push(target);
  }

  const isArmed = position !== "closed";

  return (
    <div
      style={{
        position: "fixed",
        right: 24,
        bottom: 24,
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 10,
        fontFamily: "var(--cond, 'Barlow Condensed', sans-serif)",
      }}
    >
      {/* Floating label that appears when the knob is armed */}
      {isArmed && (
        <button
          type="button"
          onClick={commit}
          style={{
            background: "var(--ink, #1A1A1A)",
            color: "#FAF7F2",
            border: "none",
            borderRadius: 999,
            padding: "10px 18px",
            cursor: "pointer",
            fontFamily: "var(--cond, 'Barlow Condensed', sans-serif)",
            textTransform: "uppercase",
            letterSpacing: ".16em",
            fontSize: 11,
            boxShadow: "0 14px 30px rgba(26,26,26,0.22)",
            animation: "kit-nav-label-in 240ms ease-out",
          }}
        >
          <style>{`
            @keyframes kit-nav-label-in {
              0%   { opacity: 0; transform: translateY(6px); }
              100% { opacity: 1; transform: translateY(0); }
            }
          `}</style>
          {LABEL[position]}
        </button>
      )}

      {/* The knob itself */}
      <button
        type="button"
        onClick={advance}
        aria-label="Kit navigation — click to cycle destinations"
        title={LABEL[position]}
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "var(--cream, #FAF7F2)",
          border: "2px solid var(--ink, #1A1A1A)",
          cursor: "pointer",
          position: "relative",
          boxShadow: isArmed
            ? "0 18px 40px rgba(139,26,26,0.22), 0 0 0 4px rgba(139,26,26,0.10)"
            : "0 8px 22px rgba(26,26,26,0.14)",
          transition: "box-shadow 260ms ease",
          padding: 0,
        }}
      >
        {/* Dial — the rotating element */}
        <div
          style={{
            position: "absolute",
            inset: 6,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 50% 35%, #FAF7F2, var(--light, #E8E4DF) 70%)",
            transform: `rotate(${ROTATION[position]}deg)`,
            transition: "transform 380ms cubic-bezier(.22, 1.1, .35, 1)",
            border: "1px solid rgba(26,26,26,0.08)",
          }}
        >
          {/* Pointer — sits at 12 o'clock, rotates with the dial */}
          <span
            style={{
              position: "absolute",
              top: 4,
              left: "50%",
              transform: "translateX(-50%)",
              width: 3,
              height: 14,
              background: isArmed
                ? "var(--crimson, #8B1A1A)"
                : "var(--ink, #1A1A1A)",
              borderRadius: 2,
              transition: "background 200ms ease",
            }}
          />
          {/* Center dot — purely decorative, makes it read as a dial */}
          <span
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--ink, #1A1A1A)",
            }}
          />
        </div>
      </button>
    </div>
  );
}
