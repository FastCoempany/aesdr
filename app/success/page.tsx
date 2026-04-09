'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface PurchaseInfo {
  confirmed: boolean;
  email?: string;
  name?: string;
  plan?: string;
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [purchase, setPurchase] = useState<PurchaseInfo | null>(null);
  const [polling, setPolling] = useState(true);

  const checkPurchase = useCallback(async () => {
    if (!sessionId) {
      setPolling(false);
      return;
    }
    try {
      const res = await fetch(`/api/purchase-status?session_id=${sessionId}`);
      const data: PurchaseInfo = await res.json();
      if (data.confirmed) {
        setPurchase(data);
        setPolling(false);
      }
    } catch {
      // Retry on next interval
    }
  }, [sessionId]);

  useEffect(() => {
    // Fire Reddit pixel
    if (typeof window !== 'undefined' && (window as any).rdt) {
      (window as any).rdt('track', 'Purchase');
    }

    // Initial check
    checkPurchase();

    // Poll every 2s until confirmed (max 30s)
    const interval = setInterval(() => {
      if (polling) checkPurchase();
    }, 2000);

    const timeout = setTimeout(() => {
      setPolling(false);
      clearInterval(interval);
    }, 30000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [checkPurchase, polling]);

  const displayName = purchase?.name || null;
  const displayEmail = purchase?.email || null;
  const confirmed = purchase?.confirmed ?? false;

  return (
    <main
      className="min-h-screen px-6 py-20"
      style={{ background: "var(--bg-main)" }}
    >
      <div className="mx-auto max-w-2xl" style={{ color: "var(--text-main)" }}>

        {/* Status badge */}
        <p
          style={{
            fontFamily: "var(--mono)",
            fontSize: "10px",
            letterSpacing: ".2em",
            textTransform: "uppercase",
            color: confirmed ? "var(--theme)" : "var(--amber, #F59E0B)",
            marginBottom: "12px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {confirmed ? (
            "Purchase confirmed"
          ) : polling ? (
            <>
              <span
                className="inline-block h-3 w-3 animate-spin rounded-full border"
                style={{ borderColor: "var(--line)", borderTopColor: "var(--amber, #F59E0B)" }}
              />
              Confirming your purchase...
            </>
          ) : (
            "Purchase processing"
          )}
        </p>

        <h1
          style={{
            fontFamily: "var(--display)",
            fontSize: "clamp(32px, 5vw, 48px)",
            lineHeight: "1",
            marginBottom: "24px",
          }}
        >
          {displayName && displayName !== 'there'
            ? `Welcome, ${displayName}.`
            : "Welcome to AESDR."}
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

          {/* Step 1: Check email */}
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
                {displayEmail ? (
                  <>
                    We sent your login credentials to <strong style={{ color: "var(--text-main)" }}>{displayEmail}</strong>.
                    Use them to sign in and start your courses.
                  </>
                ) : (
                  "We're sending your login credentials now. Check your inbox to sign in."
                )}
              </p>
            </div>
          </div>

          {/* Step 2: Start Lesson 1 */}
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
                Start with the fundamentals — what actually matters in your first 90 days.
              </p>
            </div>
          </div>

          {/* Step 3: Discord */}
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
        </div>

        {/* Didn't get email fallback */}
        <div
          style={{
            padding: "16px 20px",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.04)",
            marginBottom: "48px",
          }}
        >
          <p
            style={{
              fontFamily: "var(--serif)",
              fontSize: "14px",
              color: "var(--text-muted)",
              lineHeight: "1.6",
              margin: 0,
            }}
          >
            Didn&apos;t get the email? Check spam, or{" "}
            <Link href="/signup" style={{ color: "var(--theme)" }}>create an account manually</Link>{" "}
            using the same email you purchased with. Need help?{" "}
            <a href="mailto:support@aesdr.com" style={{ color: "var(--theme)" }}>support@aesdr.com</a>
          </p>
        </div>

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

export default function SuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
