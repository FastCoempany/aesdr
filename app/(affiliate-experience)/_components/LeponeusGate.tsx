"use client";

/**
 * Step 1 gate. A slowly spinning Leponeus over three stacked lines that send
 * the prospect into the real landing experience. Editorial palette only
 * (cream / ink / crimson / iris) per AGENTS.md.
 */
import { Mascot, MASCOT_SIZE } from "@/components/brand/Mascot";

export default function LeponeusGate({ onBegin }: { onBegin: () => void }) {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--cream, #FAF7F2)",
        color: "var(--ink, #1A1A1A)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "48px 24px",
        gap: 36,
      }}
    >
      <style>{`
        @keyframes leponeus-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .leponeus-gate-spin { animation: leponeus-spin 6s linear infinite; will-change: transform; }
        @media (prefers-reduced-motion: reduce) { .leponeus-gate-spin { animation: none; } }
      `}</style>

      <div className="leponeus-gate-spin" aria-hidden>
        <Mascot pose="doctrine" size={MASCOT_SIZE.landing} priority />
      </div>

      <div style={{ maxWidth: 560, display: "flex", flexDirection: "column", gap: 18 }}>
        <p
          style={{
            fontFamily: "var(--cond, 'Barlow Condensed', sans-serif)",
            textTransform: "uppercase",
            letterSpacing: ".22em",
            fontSize: 13,
            color: "var(--crimson, #8B1A1A)",
            margin: 0,
          }}
        >
          Affiliate · Step 1
        </p>

        <div
          style={{
            fontFamily: "var(--display, 'Playfair Display', Georgia, serif)",
            fontSize: "clamp(22px, 3.4vw, 30px)",
            lineHeight: 1.4,
            fontStyle: "italic",
          }}
        >
          <div>First, see what your audience would see.</div>
          <div>Sit through the landing exactly as a buyer does.</div>
          <div>Then we&rsquo;ll walk you into the kit.</div>
        </div>

        <button
          type="button"
          onClick={onBegin}
          style={{
            marginTop: 14,
            alignSelf: "center",
            fontFamily: "var(--cond, 'Barlow Condensed', sans-serif)",
            textTransform: "uppercase",
            letterSpacing: ".16em",
            fontSize: 15,
            color: "#FAF7F2",
            background: "var(--crimson, #8B1A1A)",
            border: "none",
            borderRadius: 2,
            padding: "14px 34px",
            cursor: "pointer",
          }}
        >
          Begin the experience →
        </button>
      </div>
    </main>
  );
}
