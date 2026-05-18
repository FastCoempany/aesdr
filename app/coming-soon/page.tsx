import ComingSoonInteractive from "./ComingSoonInteractive";

/**
 * Coming-soon page.
 *
 * Server-rendered visual + a small client overlay for the keyboard / click
 * bypass interaction. The split is deliberate: the mascot, wordmark, and
 * tagline are static HTML produced on the server, so the page renders
 * visibly **no matter what** happens with client JS — failed hydration,
 * CSP-blocked scripts, network blips, extension interference, all benign
 * to the visual. Previously the whole page was a `"use client"` component
 * whose state machine could land on `return null` and leave a dark blank.
 * That failure mode is now structurally impossible.
 *
 * Bypass mechanisms:
 *
 *   1. URL `?bypass=<code>` — handled at the edge in proxy.ts (no JS needed)
 *   2. Keyboard buffer — debounced POST to /api/coming-soon-bypass
 *   3. Click mascot → prompt → POST
 *
 * The secret lives only in the server-side env var `COMING_SOON_BYPASS_CODE`.
 */
export default function ComingSoonPage() {
  return (
    <main
      style={{
        background: "var(--cream, #FAF7F2)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Mascot + logo container */}
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "clamp(300px, 55vw, 560px)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/mascot/leponeus-doctrine.png"
            alt=""
            draggable={false}
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              userSelect: "none",
            }}
          />
          {/* Client-only bypass overlay — only adds interaction;
              renders no visible UI of its own. */}
          <ComingSoonInteractive />
        </div>

        {/* Iris shimmer AESDR logo — stacked on the mascot's foot */}
        <h1
          style={{
            fontFamily: "var(--display, 'Playfair Display', Georgia, serif)",
            fontSize: "clamp(72px, 16vw, 180px)",
            fontWeight: 900,
            fontStyle: "italic",
            background: "var(--iris)",
            backgroundSize: "300% 100%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            animation: "iris 4s linear infinite",
            letterSpacing: "-0.02em",
            marginTop: "-100px",
            marginBottom: 0,
            lineHeight: 1,
            position: "relative",
            zIndex: 2,
            userSelect: "none",
            textAlign: "center",
          }}
        >
          AESDR
        </h1>

        {/* Tagline in iris shimmer */}
        <p
          style={{
            fontFamily: "var(--display, 'Playfair Display', Georgia, serif)",
            fontSize: "clamp(16px, 2.8vw, 28px)",
            fontWeight: 600,
            fontStyle: "italic",
            background: "var(--iris)",
            backgroundSize: "300% 100%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            animation: "iris 4s linear infinite",
            letterSpacing: "0.02em",
            marginTop: 12,
            textAlign: "center",
            userSelect: "none",
          }}
        >
          AEs &amp; SDRs Rule This World
        </p>
      </div>
    </main>
  );
}
