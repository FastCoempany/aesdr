import ComingSoonInteractive from "./ComingSoonInteractive";

/**
 * Coming-soon page.
 *
 * Server-rendered visual + a small client overlay for keyboard / click
 * bypass interaction. The split is deliberate: the mascot, wordmark, and
 * tagline are static HTML produced on the server, so the page renders
 * visibly no matter what happens with client JS — failed hydration,
 * CSP-blocked scripts, network blips, extension interference. The
 * previous all-client version could land on `setVisible(false) → return
 * null` and leave a dark blank; that path is now structurally impossible.
 *
 * Bypass mechanisms (in order of robustness):
 *
 *   1. URL `?bypass=<code>` — handled at the edge in proxy.ts. Zero JS.
 *   2. Keyboard buffer with 700ms debounce → `submitBypassAction()`.
 *   3. Click mascot → prompt → `submitBypassAction()`.
 *
 * Both (2) and (3) call a server action (not a fetch) so the cookie set
 * and the redirect happen atomically in a single server response. The
 * previous fetch-based approach split the two steps across HTTP round-
 * trips, creating a race where the cookie could fail to register before
 * the browser navigated.
 *
 * The bypass secret lives only in the server-side env var
 * `COMING_SOON_BYPASS_CODE`. Without it set, the bypass is uncrackable
 * (admins still get through via Supabase auth + the hardcoded
 * PERMANENT_ADMINS list in lib/admin.ts).
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
          {/* Client-only bypass overlay — keyboard + click handlers.
              Renders an invisible button on top of the mascot. If JS
              fails to hydrate, the mascot still shows but bypass falls
              back to the URL `?bypass=<code>` mechanism. */}
          <ComingSoonInteractive />
        </div>

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
