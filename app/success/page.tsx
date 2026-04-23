'use client';

import { Suspense, useEffect, useId, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface PurchaseInfo {
  confirmed: boolean;
  name?: string;
  plan?: string;
}

const IRIS_GRADIENT =
  'linear-gradient(90deg, #FF006E 0%, #FF6B00 17%, #F59E0B 34%, #10B981 51%, #38BDF8 68%, #8B5CF6 85%, #FF006E 100%)';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [purchase, setPurchase] = useState<PurchaseInfo | null>(null);
  const [polling, setPolling] = useState(true);

  // Derive a stable 3-digit "member number" from useId — same value on
  // server and client, unique per page render, no Math.random impurity.
  const reactId = useId();
  const memberNo = (() => {
    let hash = 0;
    for (let i = 0; i < reactId.length; i++) {
      hash = (hash * 31 + reactId.charCodeAt(i)) >>> 0;
    }
    return String(100 + (hash % 900)).padStart(3, '0');
  })();

  const checkPurchase = useCallback(async () => {
    if (!sessionId) {
      setPolling(false);
      return;
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
      const res = await fetch(`/api/purchase-status?session_id=${sessionId}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data: PurchaseInfo = await res.json();
      if (data.confirmed) {
        setPurchase(data);
        setPolling(false);
      }
    } catch {
      clearTimeout(timeoutId);
      // Retry on next interval
    }
  }, [sessionId]);

  useEffect(() => {
    // Fire Reddit pixel
    const w = window as unknown as {
      rdt?: (event: string, action: string) => void;
    };
    if (typeof window !== 'undefined' && typeof w.rdt === 'function') {
      w.rdt('track', 'Purchase');
    }

    // Initial check (fire-and-forget; setState happens after network IO)
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async work; state set after await
    void checkPurchase();

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
  const confirmed = purchase?.confirmed ?? false;

  return (
    <main
      className="min-h-screen px-6 py-20"
      style={{ background: 'var(--bg-main)' }}
    >
      {/* Iris shimmer accent bar — the mark of entry */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: IRIS_GRADIENT,
          backgroundSize: '200% 100%',
          animation: 'aesdr-shimmer 14s linear infinite',
          zIndex: 40,
        }}
      />

      <style>{`
        @keyframes aesdr-shimmer {
          0% { background-position: 0% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes aesdr-rise {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div
        className="mx-auto max-w-2xl"
        style={{ color: 'var(--text-main)', animation: 'aesdr-rise .7s ease-out both' }}
      >
        {/* Status / member line */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
            marginBottom: 28,
            flexWrap: 'wrap',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--mono)',
              fontSize: '10px',
              letterSpacing: '.28em',
              textTransform: 'uppercase',
              color: confirmed ? 'var(--theme)' : 'var(--amber, #F59E0B)',
              margin: 0,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            {confirmed ? (
              <>
                <span
                  aria-hidden
                  style={{
                    display: 'inline-block',
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: 'var(--theme)',
                    boxShadow: '0 0 12px var(--theme-glow, rgba(16,185,129,.6))',
                  }}
                />
                Purchase confirmed
              </>
            ) : polling ? (
              <>
                <span
                  className="inline-block h-3 w-3 animate-spin rounded-full border"
                  style={{
                    borderColor: 'var(--line)',
                    borderTopColor: 'var(--amber, #F59E0B)',
                  }}
                />
                Confirming your purchase...
              </>
            ) : (
              'Purchase processing'
            )}
          </p>

          <p
            style={{
              fontFamily: 'var(--mono)',
              fontSize: '10px',
              letterSpacing: '.28em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              margin: 0,
              minHeight: '1em',
            }}
          >
            {memberNo ? `Member No. ${memberNo}` : ' '}
          </p>
        </div>

        {/* Editorial overline */}
        <p
          style={{
            fontFamily: 'var(--mono)',
            fontSize: '10px',
            letterSpacing: '.32em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            marginBottom: '18px',
          }}
        >
          AESDR &middot; Initiation
        </p>

        {/* Iris shimmer headline */}
        <h1
          style={{
            fontFamily: 'var(--display)',
            fontWeight: 400,
            fontSize: 'clamp(42px, 7vw, 72px)',
            lineHeight: 1,
            letterSpacing: '-0.02em',
            margin: 0,
            background: IRIS_GRADIENT,
            backgroundSize: '200% 100%',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            color: 'transparent',
            animation: 'aesdr-shimmer 10s linear infinite',
          }}
        >
          {displayName && displayName !== 'there'
            ? `Welcome, ${displayName}.`
            : 'Welcome to AESDR.'}
        </h1>

        {/* Sub-headline — editorial italic */}
        <p
          style={{
            fontFamily: 'var(--serif)',
            fontStyle: 'italic',
            fontSize: 'clamp(18px, 2.3vw, 22px)',
            lineHeight: 1.55,
            color: 'var(--text-main)',
            opacity: 0.92,
            marginTop: '28px',
            marginBottom: '18px',
            maxWidth: '38ch',
          }}
        >
          You&apos;re in.
        </p>

        <p
          style={{
            fontFamily: 'var(--serif)',
            fontSize: '17px',
            lineHeight: 1.8,
            color: 'var(--text-muted)',
            marginBottom: '56px',
            maxWidth: '54ch',
          }}
        >
          No orientation video. No onboarding checklist. What follows is
          everything you need to begin &mdash; in order.
        </p>

        {/* Steps — editorial ledger */}
        <section
          aria-label="Next steps"
          style={{
            borderTop: '1px solid var(--line)',
            borderBottom: '1px solid var(--line)',
            marginBottom: '48px',
          }}
        >
          {/* Step I */}
          <EditorialStep
            numeral="I"
            kicker="First"
            title="Check your inbox"
            body={
              <>
                Your credentials are on their way to the email you purchased
                with. Check your inbox &mdash; including spam &mdash; in the
                next few minutes.
              </>
            }
          />

          {/* Step II */}
          <EditorialStep
            numeral="II"
            kicker="Then"
            title="Open Lesson 1"
            body={
              <>
                <em>The Fundamentals.</em> Structure, camaraderie with your
                partner, and a first 90 days done the right way. That is where
                this begins.
              </>
            }
          />

          {/* Step III */}
          <EditorialStep
            numeral="III"
            kicker="Finally"
            title="Accept your invitation"
            body={
              <>
                The AESDR Discord is members only. Real reps, real deals, real
                accountability &mdash; no guru energy, no motivational noise.{' '}
                <a
                  href="https://discord.gg/uEpAz3yw"
                  style={{
                    color: '#8B9BFF',
                    textDecoration: 'underline',
                    textUnderlineOffset: '3px',
                    fontStyle: 'normal',
                    fontWeight: 600,
                  }}
                >
                  Enter the room &rarr;
                </a>
              </>
            }
            accent="#5865F2"
            isLast
          />
        </section>

        {/* Closing mark */}
        <p
          style={{
            fontFamily: 'var(--display)',
            fontStyle: 'italic',
            fontSize: '24px',
            lineHeight: 1.4,
            color: 'var(--text-main)',
            margin: '0 0 8px',
          }}
        >
          Begin.
        </p>
        <p
          style={{
            fontFamily: 'var(--mono)',
            fontSize: '10px',
            letterSpacing: '.28em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            margin: '0 0 40px',
          }}
        >
          &mdash; AESDR
        </p>

        {/* Email fallback notice */}
        <div
          style={{
            padding: '18px 22px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderLeft: '2px solid var(--theme)',
            marginBottom: '48px',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--serif)',
              fontSize: '14px',
              color: 'var(--text-muted)',
              lineHeight: 1.65,
              margin: 0,
            }}
          >
            Didn&apos;t get the email? Check spam, or{' '}
            <Link href="/signup" style={{ color: 'var(--theme)' }}>
              create an account manually
            </Link>{' '}
            using the email you purchased with. Anything else &mdash;{' '}
            <a href="mailto:support@aesdr.com" style={{ color: 'var(--theme)' }}>
              support@aesdr.com
            </a>
            .
          </p>
        </div>

        <footer
          style={{
            borderTop: '1px solid var(--line)',
            paddingTop: '20px',
            marginTop: '48px',
            fontFamily: 'var(--mono)',
            fontSize: '9px',
            letterSpacing: '.2em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            opacity: 0.6,
          }}
        >
          Questions?{' '}
          <a
            href="mailto:support@aesdr.com"
            style={{ color: 'var(--theme)', textDecoration: 'none' }}
          >
            support@aesdr.com
          </a>
        </footer>
      </div>
    </main>
  );
}

function EditorialStep({
  numeral,
  kicker,
  title,
  body,
  accent,
  isLast,
}: {
  numeral: string;
  kicker: string;
  title: string;
  body: React.ReactNode;
  accent?: string;
  isLast?: boolean;
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '88px 1fr',
        gap: '24px',
        padding: '28px 4px',
        borderBottom: isLast ? 'none' : '1px solid var(--line)',
        alignItems: 'baseline',
      }}
    >
      <div style={{ position: 'relative' }}>
        <p
          style={{
            fontFamily: 'var(--mono)',
            fontSize: '9px',
            letterSpacing: '.28em',
            textTransform: 'uppercase',
            color: accent || 'var(--text-muted)',
            margin: '0 0 6px',
          }}
        >
          {kicker}
        </p>
        <p
          style={{
            fontFamily: 'var(--display)',
            fontWeight: 400,
            fontStyle: 'italic',
            fontSize: '44px',
            lineHeight: 1,
            color: accent || 'var(--text-main)',
            margin: 0,
          }}
        >
          {numeral}
        </p>
      </div>

      <div style={{ paddingTop: '4px' }}>
        <h2
          style={{
            fontFamily: 'var(--cond)',
            fontSize: '18px',
            fontWeight: 700,
            letterSpacing: '.06em',
            textTransform: 'uppercase',
            color: 'var(--text-main)',
            margin: '0 0 10px',
          }}
        >
          {title}
        </h2>
        <p
          style={{
            fontFamily: 'var(--serif)',
            fontSize: '16px',
            lineHeight: 1.75,
            color: 'var(--text-muted)',
            margin: 0,
          }}
        >
          {body}
        </p>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
