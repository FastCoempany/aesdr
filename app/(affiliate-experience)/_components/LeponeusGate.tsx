"use client";

/**
 * Step 1 gate. The same scrolling validator ticker the buyer sees on the real
 * landing, a short subtext, then a slowly spinning Leponeus over three stacked
 * lines that send the prospect into the real landing experience. Editorial
 * palette only (cream / ink / crimson / iris) per AGENTS.md.
 *
 * Resets the prospect's persisted state on mount (role choice from a prior
 * visit, any cinematic progress markers) so every visit to /x/welcome is a
 * fresh first-time view — incognito and regular browser behave identically.
 */
import { useEffect } from "react";
import { Mascot, MASCOT_SIZE } from "@/components/brand/Mascot";
import { ValidatorTicker } from "@/components/ValidationMarquee";
import { clearRole } from "@/lib/role";

function clearProspectState() {
  if (typeof window === "undefined") return;
  // Role: clearRole already dispatches the change event so any listening
  // component (pricing tiers, cinematic) re-renders to the neutral default.
  try { clearRole(); } catch { /* ignore */ }
  // Belt-and-suspenders: drop every aesdr_* key from both storages so a
  // prospect never inherits the previous prospect's UI state.
  for (const storage of [window.localStorage, window.sessionStorage]) {
    try {
      const keys: string[] = [];
      for (let i = 0; i < storage.length; i++) {
        const k = storage.key(i);
        if (k && k.startsWith("aesdr_")) keys.push(k);
      }
      keys.forEach((k) => storage.removeItem(k));
    } catch { /* private mode etc. — accept */ }
  }
}

export default function LeponeusGate({ onBegin }: { onBegin: () => void }) {
  useEffect(() => {
    clearProspectState();
  }, []);

  return (
    <main
      style={{
        position: "relative",
        minHeight: "100vh",
        background: "var(--cream, #FAF7F2)",
        color: "var(--ink, #1A1A1A)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        textAlign: "center",
        padding: "32px 0 48px",
        gap: 28,
      }}
    >
      {/* Same scrolling ticker that runs on the real landing, full-bleed top */}
      <div style={{ width: "100%" }}>
        <ValidatorTicker />
        <p
          style={{
            fontFamily: "var(--cond, 'Barlow Condensed', sans-serif)",
            textTransform: "uppercase",
            letterSpacing: ".18em",
            fontSize: 12,
            color: "var(--muted, #6B6B6B)",
            margin: "14px auto 0",
            maxWidth: 720,
            padding: "0 24px",
            lineHeight: 1.6,
          }}
        >
          The GTM teams that vetted the lessons, the assets, and the voice. What
          you&rsquo;re about to preview is what their AEs and SDRs see.
        </p>
      </div>
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
            fontSize: "clamp(20px, 3vw, 26px)",
            lineHeight: 1.4,
            fontStyle: "italic",
          }}
        >
          <div style={{ whiteSpace: "nowrap" }}>
            First, see what your audience would see.
          </div>
          <div style={{ whiteSpace: "nowrap" }}>
            Sit through the landing exactly as a buyer does.
          </div>
          <div style={{ whiteSpace: "nowrap" }}>
            Then we&rsquo;ll walk you into the kit.
          </div>
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
