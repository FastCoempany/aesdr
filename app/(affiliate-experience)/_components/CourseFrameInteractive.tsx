"use client";

/**
 * Client wrapper for the live in-course preview. Owns:
 *   - the iframe element with the lesson HTML in srcDoc
 *   - the postMessage listener (the lesson HTML, after server-side
 *     transformation in CourseFramePreview.tsx, posts
 *     {type:"aesdr_silo_complete"} when all 5 strategies are matched)
 *   - the Leponeus reveal screen that animates in when completion fires
 *
 * The reveal boasts — the user explicitly wanted this. It's the moment
 * a prospect realizes they've only seen one widget of one section of one
 * course out of 36+ sections across 12 courses, and the rest of the
 * curriculum operates at this density everywhere.
 */
import { useEffect, useRef, useState } from "react";
import { Mascot, MASCOT_SIZE } from "@/components/brand/Mascot";
import {
  CornerBracket,
  GhostNumeral,
  Wordmark,
} from "@/components/brand/BrandAssets";

export default function CourseFrameInteractive({ html }: { html: string }) {
  const [completed, setCompleted] = useState(false);
  const frameRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e?.data?.type === "aesdr_silo_complete") {
        setCompleted(true);
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <figure
      style={{
        margin: "40px 0 0",
        background: "var(--cream, #FAF7F2)",
        position: "relative",
        // Break out of the kit doc's 1080px max-width and span the full
        // viewport so the preview reads as a real browser window, not a
        // narrow embed. Calc balances the centering so the figure stays
        // centered on the viewport.
        width: "100vw",
        left: "50%",
        right: "50%",
        marginLeft: "-50vw",
        marginRight: "-50vw",
        paddingLeft: "max(24px, calc((100vw - 1200px) / 2))",
        paddingRight: "max(24px, calc((100vw - 1200px) / 2))",
        paddingTop: 8,
        paddingBottom: 8,
      }}
    >
      {/* ── Browser chrome ── */}
      <div
        style={{
          background: "#1A1A1A",
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          borderRadius: "6px 6px 0 0",
        }}
      >
        <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f56" }} />
        <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#ffbd2e" }} />
        <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#27c93f" }} />
        <div
          style={{
            flex: 1,
            marginLeft: 12,
            background: "rgba(250, 247, 242, 0.10)",
            color: "rgba(250, 247, 242, 0.85)",
            fontFamily: "var(--mono, 'Space Mono', monospace)",
            fontSize: 12,
            padding: "6px 12px",
            borderRadius: 3,
            letterSpacing: ".04em",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ opacity: 0.55 }}>🔒</span>
          aesdr.com / course / 04 — manager madness / 1 / sort the survival strategies
        </div>
        <span
          style={{
            fontFamily: "var(--cond, 'Barlow Condensed', sans-serif)",
            fontSize: 10,
            letterSpacing: ".18em",
            textTransform: "uppercase",
            color: "#ffffff",
            background: "var(--crimson, #8B1A1A)",
            padding: "3px 10px",
            borderRadius: 2,
          }}
        >
          Live preview
        </span>
      </div>

      {/* ── The actual single-widget course page ── */}
      <div style={{ position: "relative" }}>
        <iframe
          ref={frameRef}
          title="Course 04 — Sort the Survival Strategies · live preview"
          srcDoc={html}
          loading="lazy"
          sandbox="allow-scripts allow-same-origin allow-forms"
          style={{
            width: "100%",
            height: "min(820px, 78vh)",
            border: "1px solid var(--ink, #1A1A1A)",
            borderTop: "none",
            borderRadius: "0 0 6px 6px",
            display: "block",
            background: "#ffffff",
            filter: completed ? "blur(6px) grayscale(0.5)" : "none",
            transition: "filter 600ms ease",
          }}
        />

        {/* ── Reveal overlay — fires when the widget reports completion ── */}
        {completed && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "0 0 6px 6px",
              background:
                "radial-gradient(ellipse at center, rgba(250,247,242,0.98) 0%, rgba(250,247,242,0.94) 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "32px",
              animation: "kit-reveal-pop 800ms cubic-bezier(.18,.89,.32,1.28)",
            }}
          >
            <style>{`
              @keyframes kit-reveal-pop {
                0%   { opacity: 0; transform: scale(0.96); }
                100% { opacity: 1; transform: scale(1); }
              }
              @keyframes kit-reveal-shimmer {
                0%   { background-position: 0% 0%; }
                100% { background-position: -200% 0%; }
              }
            `}</style>

            <div
              style={{
                position: "relative",
                maxWidth: 720,
                textAlign: "center",
                display: "grid",
                justifyItems: "center",
                gap: 20,
                padding: "24px",
              }}
            >
              {/* Editorial corner brackets frame the reveal — quiet, ink at
                  22% opacity, matches the kit hero treatment */}
              <CornerBracket
                position="tl"
                size={28}
                color="rgba(26,26,26,0.22)"
                style={{ position: "absolute", top: 0, left: 0 }}
              />
              <CornerBracket
                position="tr"
                size={28}
                color="rgba(26,26,26,0.22)"
                style={{ position: "absolute", top: 0, right: 0 }}
              />
              <CornerBracket
                position="bl"
                size={28}
                color="rgba(26,26,26,0.22)"
                style={{ position: "absolute", bottom: 0, left: 0 }}
              />
              <CornerBracket
                position="br"
                size={28}
                color="rgba(26,26,26,0.22)"
                style={{ position: "absolute", bottom: 0, right: 0 }}
              />

              {/* Ghost ✓ behind the mascot — quiet completion sigil */}
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  top: 6,
                  left: "50%",
                  transform: "translateX(-50%)",
                  zIndex: 0,
                  pointerEvents: "none",
                }}
              >
                <GhostNumeral numeral="✓" size={220} />
              </div>

              {/* iris stripe */}
              <div
                style={{
                  height: 3,
                  width: 120,
                  background:
                    "linear-gradient(90deg, var(--crimson, #8B1A1A), #b4455d, #8B5CF6)",
                  backgroundSize: "200% 100%",
                  animation: "kit-reveal-shimmer 4s linear infinite",
                  position: "relative",
                  zIndex: 1,
                }}
              />

              <div style={{ position: "relative", zIndex: 1 }}>
                <Mascot pose="doctrine" size={MASCOT_SIZE.card} />
              </div>

              <div
                style={{
                  fontFamily: "var(--cond, 'Barlow Condensed', sans-serif)",
                  textTransform: "uppercase",
                  letterSpacing: ".24em",
                  fontSize: 11,
                  color: "var(--crimson, #8B1A1A)",
                }}
              >
                Five for five.
              </div>

              <h3
                style={{
                  fontFamily:
                    "var(--display, 'Playfair Display', Georgia, serif)",
                  fontStyle: "italic",
                  fontWeight: 700,
                  fontSize: "clamp(28px, 4vw, 40px)",
                  lineHeight: 1.1,
                  margin: 0,
                  color: "var(--ink, #1A1A1A)",
                  letterSpacing: "-0.01em",
                }}
              >
                You haven&rsquo;t quite seen anything like this.
              </h3>

              <p
                style={{
                  fontFamily: "var(--serif, 'Source Serif 4', Georgia, serif)",
                  fontSize: 17,
                  lineHeight: 1.65,
                  color: "var(--ink, #1A1A1A)",
                  margin: 0,
                  maxWidth: 560,
                }}
              >
                That was{" "}
                <em>one widget</em>, in <em>one section</em>, of{" "}
                <em>one course</em> out of twelve. There are 36+ sections like
                it — drag-matches, gated reveals, redacted blocks that open
                only after you commit, role-conditional rewrites that swap
                between the AE and SDR cuts.
              </p>

              <p
                style={{
                  fontFamily: "var(--serif, 'Source Serif 4', Georgia, serif)",
                  fontStyle: "italic",
                  fontSize: 17,
                  lineHeight: 1.6,
                  color: "var(--ink, #1A1A1A)",
                  margin: 0,
                  maxWidth: 560,
                }}
              >
                As you can see — we are not AI slop. We are not some
                templatized &ldquo;built-in-3-days&rdquo; product. What you
                just saw is a peek into the care and sophistication we put
                into AESDR.
              </p>

              <p
                style={{
                  fontFamily: "var(--serif, 'Source Serif 4', Georgia, serif)",
                  fontSize: 15,
                  color: "var(--ink, #1A1A1A)",
                  margin: "8px 0 0",
                  maxWidth: 520,
                  lineHeight: 1.55,
                }}
              >
                Now imagine your audience sitting down to{" "}
                <strong>twelve more weeks of this</strong>, every section the
                same density, walking out with seven substantial assets they
                keep. That&rsquo;s what your link gets them into.
              </p>

              <button
                type="button"
                onClick={() => {
                  setCompleted(false);
                  // bounce the iframe so it re-renders fresh (props are unchanged
                  // so React won't remount otherwise)
                  if (frameRef.current) {
                    const src = frameRef.current.srcdoc;
                    frameRef.current.srcdoc = "";
                    requestAnimationFrame(() => {
                      if (frameRef.current) frameRef.current.srcdoc = src;
                    });
                  }
                }}
                style={{
                  marginTop: 4,
                  fontFamily: "var(--cond, 'Barlow Condensed', sans-serif)",
                  textTransform: "uppercase",
                  letterSpacing: ".16em",
                  fontSize: 12,
                  color: "var(--ink, #1A1A1A)",
                  background: "transparent",
                  border: "1px solid var(--ink, #1A1A1A)",
                  padding: "10px 18px",
                  cursor: "pointer",
                  borderRadius: 2,
                }}
              >
                Try the widget again ↻
              </button>
            </div>
          </div>
        )}
      </div>

      <figcaption
        style={{
          fontFamily: "var(--cond, 'Barlow Condensed', sans-serif)",
          textTransform: "uppercase",
          letterSpacing: ".18em",
          fontSize: 11,
          color: "var(--muted, #6B6B6B)",
          marginTop: 14,
          textAlign: "center",
        }}
      >
        Course 04 · Section 01 · Sort the Survival Strategies — match each
        one to the manager archetype it speaks to.
      </figcaption>
    </figure>
  );
}
