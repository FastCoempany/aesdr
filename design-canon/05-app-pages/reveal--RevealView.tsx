"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Artifact = "programme" | "manuscript";

interface RevealViewProps {
  studentName: string;
  role: string;
}

export default function RevealView({ studentName, role }: RevealViewProps) {
  const router = useRouter();
  const [active, setActive] = useState<Artifact>("programme");
  const [animating, setAnimating] = useState(false);
  const [picking, setPicking] = useState(false);
  const [exitClass, setExitClass] = useState<string | null>(null);
  const [enterClass, setEnterClass] = useState<string | null>(null);
  const incomingRef = useRef<HTMLDivElement>(null);

  const switchTab = useCallback(
    (target: Artifact) => {
      if (target === active || animating) return;
      setAnimating(true);

      setExitClass("exit-left");
      setEnterClass("enter-right");

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setEnterClass(null);
        });
      });

      setTimeout(() => {
        setActive(target);
        setExitClass(null);
        setAnimating(false);
      }, 480);
    },
    [active, animating]
  );

  const pick = useCallback(async () => {
    if (picking) return;
    setPicking(true);

    const chosen = active === "programme" ? "playbill" : "redline";

    try {
      const res = await fetch("/api/reveal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artifact: chosen }),
      });
      const data = await res.json();

      if (res.ok && data.redirect) {
        router.push(data.redirect);
      } else if (res.status === 409 && data.chosen) {
        router.push(
          data.chosen === "playbill"
            ? "/artifacts/playbill"
            : "/artifacts/redline"
        );
      } else {
        setPicking(false);
      }
    } catch {
      setPicking(false);
    }
  }, [active, picking, router]);

  const other: Artifact =
    active === "programme" ? "manuscript" : "programme";

  const frontPanel = active;
  const behindPanel = other;

  const frontClass = exitClass || "front";
  const behindClass = enterClass === null && exitClass === null ? "behind" : enterClass ? "enter-right" : "front";

  return (
    <main style={styles.main}>
      {/* FANFARE */}
      <div style={styles.fanfare}>
        <div style={styles.fEye}>The Course is Complete</div>
        <div style={styles.fTitle}>
          <span style={styles.fName}>{studentName}</span>
        </div>
        <div style={styles.fSub}>
          Twelve lessons. Thirty-six units. One finished record of who you
          were when you started and who you&rsquo;ve become since.
        </div>
        <div style={styles.fMeta}>
          {role} &middot; Cohort 01 &middot; April 19, 2026
        </div>
      </div>

      {/* PICK INSTRUCTION */}
      <div style={styles.pick}>
        <div style={styles.pickT}>Choose your keeper.</div>
        <div style={styles.pickS}>
          Two readings of the same story. Pick the one you want to take
          home.
        </div>
      </div>

      {/* TAB BAR */}
      <div style={styles.tabBar}>
        <button
          style={{
            ...styles.tab,
            ...(active === "programme" || (exitClass && other === "programme")
              ? styles.tabActive
              : {}),
          }}
          onClick={() => switchTab("programme")}
        >
          I &middot; The Programme
          {(active === "programme" || (exitClass && other === "programme")) && (
            <span style={styles.tabUnderline} />
          )}
        </button>
        <div style={styles.tabDivider}>
          <span style={styles.tabDot} />
        </div>
        <button
          style={{
            ...styles.tab,
            ...(active === "manuscript" || (exitClass && other === "manuscript")
              ? styles.tabActive
              : {}),
          }}
          onClick={() => switchTab("manuscript")}
        >
          II &middot; The Manuscript
          {(active === "manuscript" ||
            (exitClass && other === "manuscript")) && (
            <span style={styles.tabUnderline} />
          )}
        </button>
        <span style={styles.tabBarLine} />
      </div>

      {/* CARD STAGE */}
      <div style={styles.cardStage}>
        {/* Behind card */}
        <div
          style={{
            ...styles.cardPanel,
            ...(behindPanel === "programme"
              ? styles.panelProgramme
              : styles.panelManuscript),
            ...(behindClass === "behind"
              ? styles.behind
              : behindClass === "enter-right"
                ? styles.enterRight
                : styles.front),
          }}
        >
          <PanelContent type={behindPanel} />
        </div>

        {/* Front card */}
        <div
          ref={incomingRef}
          style={{
            ...styles.cardPanel,
            ...(frontPanel === "programme"
              ? styles.panelProgramme
              : styles.panelManuscript),
            ...(frontClass === "front"
              ? styles.front
              : styles.exitLeft),
          }}
        >
          <PanelContent type={frontPanel} />
        </div>
      </div>

      {/* CTA */}
      <div style={styles.ctaArea}>
        <button
          style={{
            ...styles.ctaBtn,
            ...(active === "programme"
              ? styles.ctaProgramme
              : styles.ctaManuscript),
            ...(picking ? { opacity: 0.6, pointerEvents: "none" as const } : {}),
          }}
          onClick={pick}
          disabled={picking}
        >
          {picking
            ? "Opening…"
            : active === "programme"
              ? "Take the Programme"
              : "Take the Manuscript"}
        </button>
      </div>

      {/* FOOTER */}
      <div style={styles.footerNote}>
        <div style={styles.fnLine} />
        <div style={styles.fnText}>
          The {active === "programme" ? "Manuscript" : "Programme"} stays
          sealed. It will be waiting on your dashboard whenever you want the
          other side of the story &mdash;{" "}
          <span style={styles.fnPrice}>$40</span>.
        </div>
      </div>

      <style>{globalStyles}</style>
    </main>
  );
}

function PanelContent({ type }: { type: Artifact }) {
  if (type === "programme") {
    return (
      <>
        <div style={styles.panelLabel}>I &middot; The Programme</div>
        <div style={styles.spotlightOverlay} />
        <div style={styles.vignetteOverlay} />
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="spark" style={sparkPositions[i]} />
        ))}
        <div style={styles.panelInner}>
          <Image
            src="/reveal/playbill.png"
            alt="The Programme — a playbill"
            width={300}
            height={420}
            style={styles.playbillImg}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <div style={{ ...styles.panelLabel, left: "auto", right: 20, color: "rgba(90,56,24,.7)" }}>
        II &middot; The Manuscript
      </div>
      <div style={styles.deskVignette} />
      <div style={styles.panelInner}>
        <Image
          src="/reveal/manuscript.png"
          alt="The Manuscript — draft returned with edits"
          width={380}
          height={490}
          style={styles.manuscriptImg}
        />
      </div>
    </>
  );
}

const sparkPositions: React.CSSProperties[] = [
  { position: "absolute", top: "15%", left: "42%", animationDelay: "0s" },
  { position: "absolute", top: "28%", left: "58%", animationDelay: ".9s" },
  { position: "absolute", top: "50%", left: "38%", animationDelay: "1.8s" },
  { position: "absolute", top: "22%", left: "52%", animationDelay: "2.5s" },
];

const globalStyles = `
  @keyframes iris {
    from { background-position: 0% 50%; }
    to { background-position: 200% 50%; }
  }
  @keyframes float {
    0%, 100% { opacity: 0; transform: translateY(0); }
    50% { opacity: .8; transform: translateY(-20px); }
  }
  .spark {
    width: 3px; height: 3px;
    background: rgba(255,220,180,.55);
    border-radius: 50%;
    opacity: 0;
    pointer-events: none;
    z-index: 3;
    animation: float 3.5s ease-in-out infinite;
  }
`;

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: "100vh",
    background: "#FAF7F2",
    color: "#1A1A1A",
    fontFamily: "'Source Serif 4', Georgia, serif",
    overflowX: "hidden",
  },

  // Fanfare
  fanfare: { textAlign: "center", padding: "56px 5% 28px", position: "relative", zIndex: 2 },
  fEye: {
    fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: ".35em",
    textTransform: "uppercase", color: "#8B1A1A", marginBottom: 14,
  },
  fTitle: {
    fontFamily: "'Playfair Display', Georgia, serif", fontSize: "clamp(40px, 6vw, 72px)",
    fontWeight: 900, fontStyle: "italic", lineHeight: 1, marginBottom: 12,
  },
  fName: {
    background: "linear-gradient(90deg, #FF006E 0%, #FF6B00 17%, #F59E0B 34%, #10B981 51%, #38BDF8 68%, #8B5CF6 85%, #FF006E 100%)",
    backgroundSize: "200% 100%",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    animation: "iris 3s linear infinite",
  },
  fSub: {
    fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 18, fontStyle: "italic",
    color: "#6B6B6B", maxWidth: 560, margin: "0 auto", lineHeight: 1.55,
  },
  fMeta: {
    fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: ".2em",
    textTransform: "uppercase", color: "#6B6B6B", marginTop: 16,
  },

  // Pick
  pick: { textAlign: "center", margin: "28px 0 0", position: "relative", zIndex: 3 },
  pickT: {
    fontFamily: "'Playfair Display', Georgia, serif", fontSize: 28,
    fontStyle: "italic", color: "#1A1A1A",
  },
  pickS: {
    fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 14,
    fontStyle: "italic", color: "#6B6B6B", marginTop: 6,
  },

  // Tab bar
  tabBar: {
    display: "flex", justifyContent: "center", gap: 0,
    margin: "32px auto 0", maxWidth: 520, position: "relative", zIndex: 10,
  },
  tabBarLine: {
    position: "absolute", bottom: 0, left: 0, right: 0, height: 1,
    background: "#E8E4DF",
  },
  tab: {
    flex: 1, maxWidth: 260, padding: "16px 24px 14px",
    fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, fontWeight: 600,
    letterSpacing: ".22em", textTransform: "uppercase", textAlign: "center",
    cursor: "pointer", border: "none", background: "transparent", color: "#6B6B6B",
    position: "relative", transition: "color .3s ease", userSelect: "none",
  },
  tabActive: { color: "#1A1A1A", fontWeight: 800 },
  tabUnderline: {
    position: "absolute", bottom: 0, left: "10%", right: "10%", height: 2.5,
    background: "#8B1A1A", zIndex: 2,
  },
  tabDivider: {
    width: 1, alignSelf: "stretch", margin: "10px 0",
    background: "#E8E4DF", position: "relative", zIndex: 3,
  },
  tabDot: {
    position: "absolute", top: "50%", left: "50%",
    transform: "translate(-50%, -50%)", width: 6, height: 6,
    borderRadius: "50%", background: "#B8943E",
    border: "1px solid #D4B96A", boxShadow: "0 0 6px rgba(184,148,62,.3)",
  },

  // Card stage
  cardStage: {
    position: "relative", width: "min(90vw, 680px)",
    height: "clamp(460px, 65vw, 620px)", margin: "36px auto 0",
    perspective: 1200,
  },
  cardPanel: {
    position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
    borderRadius: 6, overflow: "hidden", backgroundSize: "cover",
    backgroundPosition: "center", backgroundRepeat: "no-repeat",
    transition: "transform .45s cubic-bezier(.4,0,.2,1), opacity .45s cubic-bezier(.4,0,.2,1), filter .45s cubic-bezier(.4,0,.2,1), box-shadow .45s cubic-bezier(.4,0,.2,1)",
    display: "flex", alignItems: "center", justifyContent: "center",
    willChange: "transform, opacity",
  },
  behind: {
    transform: "translate(10px, 10px) scale(.97)", opacity: 0.35,
    filter: "brightness(.7) saturate(.5)", zIndex: 1,
    pointerEvents: "none", boxShadow: "0 8px 32px rgba(0,0,0,.15)",
  },
  front: {
    transform: "translate(0, 0) scale(1)", opacity: 1,
    filter: "brightness(1) saturate(1)", zIndex: 2,
    boxShadow: "0 16px 48px rgba(0,0,0,.25), 0 4px 12px rgba(0,0,0,.12)",
  },
  exitLeft: {
    transform: "translateX(-110%) scale(.95)", opacity: 0, zIndex: 3,
  },
  enterRight: {
    transform: "translateX(110%) scale(.95)", opacity: 0, zIndex: 3,
  },

  // Panels
  panelProgramme: { backgroundImage: "url('/reveal/stage.png')" },
  panelManuscript: { backgroundImage: "url('/reveal/desk.png')" },

  panelLabel: {
    position: "absolute", top: 18, left: 20,
    fontFamily: "'Space Mono', monospace", fontSize: 9,
    letterSpacing: ".3em", textTransform: "uppercase",
    color: "rgba(250,247,242,.6)", zIndex: 5, pointerEvents: "none",
  },

  spotlightOverlay: {
    position: "absolute", top: "-20%", left: "50%",
    transform: "translateX(-50%)", width: "80%", height: "70%",
    background: "radial-gradient(ellipse at center, rgba(255,220,180,.20) 0%, transparent 70%)",
    pointerEvents: "none", zIndex: 1,
  },
  vignetteOverlay: {
    position: "absolute", inset: 0,
    background: "radial-gradient(ellipse at 50% 30%, transparent 30%, rgba(0,0,0,.35) 100%)",
    pointerEvents: "none", zIndex: 1,
  },
  deskVignette: {
    position: "absolute", inset: 0,
    background: "radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,.18) 100%)",
    pointerEvents: "none", zIndex: 1,
  },

  panelInner: {
    display: "flex", alignItems: "center", justifyContent: "center",
    width: "100%", height: "100%", position: "relative", zIndex: 2,
  },
  playbillImg: {
    width: "clamp(180px, 40%, 300px)", height: "auto",
    transform: "rotate(-1deg)",
    filter: "drop-shadow(0 24px 36px rgba(0,0,0,.6)) drop-shadow(0 0 50px rgba(255,220,180,.15))",
  },
  manuscriptImg: {
    width: "clamp(220px, 48%, 380px)", height: "auto",
    transform: "rotate(-3deg)",
    filter: "drop-shadow(0 16px 28px rgba(0,0,0,.45)) drop-shadow(0 4px 8px rgba(0,0,0,.2))",
  },

  // CTA
  ctaArea: { textAlign: "center", margin: "32px auto 0", position: "relative", zIndex: 5 },
  ctaBtn: {
    display: "inline-block", padding: "16px 40px",
    fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, fontWeight: 800,
    letterSpacing: ".22em", textTransform: "uppercase", border: "none",
    cursor: "pointer", transition: "all .35s ease",
    boxShadow: "0 4px 20px rgba(0,0,0,.15)",
  },
  ctaProgramme: {
    background: "#FAF7F2", color: "#1A1A1A", border: "1px solid #E8E4DF",
  },
  ctaManuscript: {
    background: "#1A1A1A", color: "#FAF7F2",
  },

  // Footer
  footerNote: { textAlign: "center", padding: "48px 5% 72px", position: "relative", zIndex: 2 },
  fnLine: { width: 80, height: 1, background: "#E8E4DF", margin: "0 auto 20px" },
  fnText: {
    fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 14,
    fontStyle: "italic", color: "#6B6B6B", lineHeight: 1.6, maxWidth: 540,
    margin: "0 auto",
  },
  fnPrice: {
    fontFamily: "'Playfair Display', Georgia, serif", fontSize: 16,
    fontStyle: "italic", color: "#1A1A1A", display: "inline-block",
  },
};
