"use client";

/**
 * Static end-state of the landing cinematic — Leponeus + AESDR iris title +
 * tagline + Get Access CTA — rendered with NO typing animation. Used by the
 * three landing variants so the design review skips straight to the post-
 * cinematic hero state without the typing playback getting in the way.
 *
 * Visual register intentionally mirrors ExperienceLanding's landingHero
 * (same Mascot pose, same iris-gradient AESDR title, same tagline copy).
 */
import { Mascot, MASCOT_SIZE } from "@/components/brand/Mascot";

export default function StaticLeponeusHero() {
  return (
    <section
      style={{
        position: "relative",
        background: "var(--cream)",
        minHeight: "min(80vh, 720px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 5vw 64px",
        textAlign: "center",
        gap: 24,
      }}
    >
      <div style={{ marginBottom: 4 }}>
        <Mascot pose="doctrine" size={MASCOT_SIZE.landing} priority />
      </div>

      <div
        style={{
          fontFamily: "var(--mono)",
          fontSize: 11,
          letterSpacing: ".26em",
          textTransform: "uppercase",
          color: "var(--muted)",
        }}
      >
        12 Interactive Courses · Built by Operators · Not by Course-People
      </div>

      <h1
        style={{
          fontFamily: "var(--display)",
          fontSize: "min(clamp(80px, 18vw, 220px), 26vh)",
          fontWeight: 900,
          fontStyle: "italic",
          lineHeight: 0.85,
          letterSpacing: "0.02em",
          margin: 0,
          background: "var(--iris)",
          backgroundSize: "300% 100%",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitTextFillColor: "transparent",
          color: "transparent",
          animation: "shimmer 4s linear infinite",
        }}
      >
        AESDR
      </h1>

      <p
        style={{
          fontFamily: "var(--serif)",
          fontSize: "clamp(16px, 2vw, 22px)",
          fontStyle: "italic",
          color: "var(--muted)",
          margin: 0,
        }}
      >
        Become the same you, just way, way better.
      </p>

      <p
        style={{
          fontFamily: "var(--serif)",
          fontSize: "clamp(15px, 1.6vw, 18px)",
          color: "var(--ink)",
          margin: 0,
          maxWidth: 560,
          lineHeight: 1.55,
        }}
      >
        The 12-course survival program for SDRs who want out alive.
      </p>

      <a
        href="#pricing"
        style={{
          marginTop: 6,
          fontFamily: "var(--cond)",
          textTransform: "uppercase",
          letterSpacing: ".18em",
          fontSize: 13,
          color: "#FAF7F2",
          background: "var(--iris)",
          backgroundSize: "300% 100%",
          animation: "shimmer 6s linear infinite",
          padding: "14px 32px",
          textDecoration: "none",
          fontWeight: 700,
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        Get Access ↓
      </a>
    </section>
  );
}
