import Link from "next/link";

import { Mascot } from "@/components/brand/Mascot";

/**
 * 404 page. Editorial palette (rebuilt off retired dark tokens) + canon
 * `fall` pose — the user fell off the path. Caption is a callback to the
 * "Long Mile" spot illustration: every mile looks the same.
 */
export default function NotFound() {
  return (
    <main
      style={{
        background: "var(--cream)",
        color: "var(--ink)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        textAlign: "center",
      }}
    >
      {/* Fall pose — the user is off the path */}
      <div
        style={{
          position: "relative",
          width: "clamp(220px, 36vw, 320px)",
          marginBottom: 32,
          filter: "saturate(1.1)",
        }}
      >
        <Mascot
          pose="fall"
          size={320}
          style={{ width: "100%", height: "auto" }}
        />
      </div>

      <p
        style={{
          fontFamily: "var(--mono)",
          fontSize: 11,
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          color: "var(--crimson)",
          marginBottom: 16,
        }}
      >
        404 · Off the path
      </p>

      <h1
        style={{
          fontFamily: "var(--display)",
          fontStyle: "italic",
          fontWeight: 700,
          fontSize: "clamp(36px, 5vw, 56px)",
          lineHeight: 1.1,
          color: "var(--ink)",
          margin: "0 0 16px",
        }}
      >
        This page doesn&apos;t exist.
      </h1>

      <p
        style={{
          fontFamily: "var(--serif)",
          fontStyle: "italic",
          fontSize: 17,
          lineHeight: 1.7,
          color: "var(--muted)",
          marginBottom: 28,
          maxWidth: 520,
        }}
      >
        Every mile looks the same. This one isn&apos;t here.
      </p>

      <Link
        href="/"
        style={{
          display: "inline-block",
          fontFamily: "var(--cond)",
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--ink)",
          background: "transparent",
          border: "1px solid var(--ink)",
          padding: "13px 26px",
          textDecoration: "none",
        }}
      >
        Back to home
      </Link>
    </main>
  );
}
