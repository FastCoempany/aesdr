'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function SuccessPage() {

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).rdt) {
      (window as any).rdt('track', 'Purchase');
    }
  }, []);

  return (
    <main
      className="min-h-screen px-6 py-20"
      style={{ background: "var(--bg-main)" }}
    >
      <div className="mx-auto max-w-2xl" style={{ color: "var(--text-main)" }}>

        <p
          style={{
            fontFamily: "var(--mono)",
            fontSize: "10px",
            letterSpacing: ".2em",
            textTransform: "uppercase",
            color: "var(--theme)",
            marginBottom: "12px",
          }}
        >
          Purchase confirmed
        </p>

        <h1
          style={{
            fontFamily: "var(--display)",
            fontSize: "clamp(32px, 5vw, 48px)",
            lineHeight: "1",
            marginBottom: "24px",
          }}
        >
          Welcome to AESDR.
        </h1>

        <p
          style={{
            fontFamily: "var(--serif)",
            fontSize: "18px",
            lineHeight: "1.8",
            color: "var(--text-muted)",
            marginBottom: "40px",
          }}
        >
          You&apos;re in. No orientation video. No onboarding checklist. Here&apos;s what to do next.
        </p>

        {/* Next steps */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "48px" }}>
          <div
            style={{
              padding: "20px 24px",
              background: "rgba(16,185,129,0.06)",
              border: "1px solid rgba(16,185,129,0.15)",
              display: "flex",
              gap: "16px",
              alignItems: "flex-start",
            }}
          >
            <span
              style={{
                fontFamily: "var(--mono)",
                fontSize: "14px",
                fontWeight: 700,
                color: "var(--theme)",
                flexShrink: 0,
              }}
            >
              01
            </span>
            <div>
              <p
                style={{
                  fontFamily: "var(--cond)",
                  fontSize: "16px",
                  fontWeight: 700,
                  letterSpacing: ".04em",
                  textTransform: "uppercase",
                  color: "var(--text-main)",
                  marginBottom: "4px",
                }}
              >
                Start Lesson 1
              </p>
              <p
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: "15px",
                  color: "var(--text-muted)",
                  lineHeight: "1.6",
                }}
              >
                The SDR Reality Check — what nobody tells you in your first 90 days.
              </p>
            </div>
          </div>

          <div
            style={{
              padding: "20px 24px",
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              gap: "16px",
              alignItems: "flex-start",
            }}
          >
            <span
              style={{
                fontFamily: "var(--mono)",
                fontSize: "14px",
                fontWeight: 700,
                color: "var(--theme)",
                flexShrink: 0,
              }}
            >
              02
            </span>
            <div>
              <p
                style={{
                  fontFamily: "var(--cond)",
                  fontSize: "16px",
                  fontWeight: 700,
                  letterSpacing: ".04em",
                  textTransform: "uppercase",
                  color: "var(--text-main)",
                  marginBottom: "4px",
                }}
              >
                <a href="https://discord.gg/uEpAz3yw" style={{ color: "inherit", textDecoration: "none" }}>Join the Discord</a>
              </p>
              <p
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: "15px",
                  color: "var(--text-muted)",
                  lineHeight: "1.6",
                }}
              >
                Real reps, real problems, real accountability. No guru energy.{" "}
                <a href="https://discord.gg/uEpAz3yw" style={{ color: "var(--theme)" }}>Join here &rarr;</a>
              </p>
            </div>
          </div>

          <div
            style={{
              padding: "20px 24px",
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              gap: "16px",
              alignItems: "flex-start",
            }}
          >
            <span
              style={{
                fontFamily: "var(--mono)",
                fontSize: "14px",
                fontWeight: 700,
                color: "var(--theme)",
                flexShrink: 0,
              }}
            >
              03
            </span>
            <div>
              <p
                style={{
                  fontFamily: "var(--cond)",
                  fontSize: "16px",
                  fontWeight: 700,
                  letterSpacing: ".04em",
                  textTransform: "uppercase",
                  color: "var(--text-main)",
                  marginBottom: "4px",
                }}
              >
                Check your email
              </p>
              <p
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: "15px",
                  color: "var(--text-muted)",
                  lineHeight: "1.6",
                }}
              >
                Your welcome email has everything you need to get started.
              </p>
            </div>
          </div>
        </div>

        <Link
          href="/dashboard"
          style={{
            display: "inline-block",
            fontFamily: "var(--cond)",
            fontSize: "16px",
            fontWeight: 700,
            letterSpacing: ".06em",
            textTransform: "uppercase",
            color: "var(--bg-main)",
            background: "var(--theme)",
            padding: "16px 36px",
            textDecoration: "none",
          }}
        >
          Go to Your Dashboard
        </Link>

        <footer
          style={{
            borderTop: "1px solid var(--line)",
            paddingTop: "24px",
            marginTop: "48px",
            fontFamily: "var(--mono)",
            fontSize: "9px",
            letterSpacing: ".1em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
          }}
        >
          <p style={{ opacity: 0.6 }}>
            Questions? <a href="mailto:support@aesdr.com" style={{ color: "var(--theme)", textDecoration: "none" }}>support@aesdr.com</a>
          </p>
        </footer>
      </div>
    </main>
  );
}
