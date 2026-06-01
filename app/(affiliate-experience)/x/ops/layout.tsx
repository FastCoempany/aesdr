/**
 * Gate + chrome for the affiliate-experience admin (/x/ops).
 *
 * Founder-only, password-gated (no login). If AFFILIATE_OPS_PASSWORD isn't
 * set, the gate says so instead of silently locking you out.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { isOpsAuthed, opsPassword } from "../../_lib/ops-auth";

export const metadata: Metadata = {
  title: "Affiliate Ops · AESDR",
  robots: { index: false, follow: false },
};

const mono = "var(--mono, 'Space Mono', monospace)";
const cream = "var(--cream, #FAF7F2)";
const ink = "var(--ink, #1A1A1A)";
const crimson = "var(--crimson, #8B1A1A)";

function Gate({ configured }: { configured: boolean }) {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: cream,
        color: ink,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div style={{ width: "100%", maxWidth: 360, textAlign: "center" }}>
        <p
          style={{
            fontFamily: mono,
            textTransform: "uppercase",
            letterSpacing: ".2em",
            fontSize: 12,
            color: crimson,
          }}
        >
          AESDR · Affiliate Ops
        </p>
        {configured ? (
          <form action="/x/ops/login" method="post" style={{ marginTop: 24 }}>
            <input
              type="password"
              name="password"
              placeholder="password"
              autoFocus
              style={{
                width: "100%",
                padding: "12px 14px",
                fontFamily: mono,
                fontSize: 14,
                border: `1px solid ${ink}`,
                background: "transparent",
                color: ink,
              }}
            />
            <button
              type="submit"
              style={{
                marginTop: 12,
                width: "100%",
                padding: "12px",
                fontFamily: mono,
                textTransform: "uppercase",
                letterSpacing: ".12em",
                fontSize: 13,
                color: cream,
                background: crimson,
                border: "none",
                cursor: "pointer",
              }}
            >
              Enter
            </button>
          </form>
        ) : (
          <p
            style={{
              marginTop: 24,
              fontFamily: mono,
              fontSize: 13,
              lineHeight: 1.7,
              color: ink,
            }}
          >
            Not configured. Set the <code>AFFILIATE_OPS_PASSWORD</code> env var
            on this deployment, then reload.
          </p>
        )}
      </div>
    </main>
  );
}

export default async function OpsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isOpsAuthed())) {
    return <Gate configured={!!opsPassword()} />;
  }

  return (
    <main style={{ minHeight: "100vh", background: cream, color: ink }}>
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          gap: 28,
          padding: "16px 5%",
          borderBottom: "1px solid var(--light, #E8E4DF)",
        }}
      >
        <span
          style={{
            fontFamily: "var(--display, 'Playfair Display', Georgia, serif)",
            fontSize: 17,
            fontWeight: 900,
            fontStyle: "italic",
            color: crimson,
          }}
        >
          Affiliate Ops
        </span>
        <Link
          href="/x/ops"
          style={{
            fontFamily: mono,
            fontSize: 11,
            letterSpacing: ".15em",
            textTransform: "uppercase",
            textDecoration: "none",
            color: "var(--muted, #6B6B6B)",
          }}
        >
          Affiliate Analytics
        </Link>
      </nav>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 5%" }}>
        {children}
      </div>
    </main>
  );
}
