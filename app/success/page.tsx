'use client';

import { Suspense, useEffect, useId, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface PurchaseInfo {
  confirmed: boolean;
  name?: string;
  plan?: string;
}

// Reserved iris shimmer token (app/globals.css). Using the CSS var instead of
// a hardcoded gradient keeps this on the active editorial palette and inherits
// the accessibility fallback (collapses to --crimson under prefers-contrast /
// forced-colors). Do not reintroduce the retired dark-palette hexes here.
const IRIS_GRADIENT = 'var(--iris)';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [purchase, setPurchase] = useState<PurchaseInfo | null>(null);
  const [polling, setPolling] = useState(true);
  // True once we've stopped polling WITHOUT a confirmation — drives the
  // reassuring terminal state instead of a frozen "processing" spinner.
  const [gaveUp, setGaveUp] = useState(false);

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

  // Returns true once the purchase is confirmed so the poll loop can stop.
  const checkPurchase = useCallback(async (): Promise<boolean> => {
    if (!sessionId) {
      setPolling(false);
      setGaveUp(true);
      return false;
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
        return true;
      }
    } catch {
      clearTimeout(timeoutId);
      // Swallow and let the loop try again on the next tick.
    }
    return false;
  }, [sessionId]);

  useEffect(() => {
    // Fire Reddit pixel
    const w = window as unknown as {
      rdt?: (event: string, action: string) => void;
    };
    if (typeof window !== 'undefined' && typeof w.rdt === 'function') {
      w.rdt('track', 'Purchase');
    }

    // The webhook that confirms a paid order can lag well past 30s (Stripe
    // retries, synchronous fee lookups). Poll for ~90s with light backoff so a
    // buyer who actually paid isn't dropped onto a dead screen, then settle
    // into an explicit, reassuring terminal state.
    const MAX_WINDOW_MS = 90_000;
    const startedAt = Date.now();
    let timerId: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;
    // 2s, 3s, 4s, 5s, then steady 6s — a gentle backoff that eases server load.
    let attempt = 0;
    const nextDelay = () => Math.min(2000 + attempt * 1000, 6000);

    const tick = async () => {
      const confirmed = await checkPurchase();
      if (cancelled || confirmed) return;
      attempt += 1;
      if (Date.now() - startedAt >= MAX_WINDOW_MS) {
        // Out of time without confirmation — show the terminal "you're set,
        // it's still finalizing" message rather than a frozen spinner.
        setPolling(false);
        setGaveUp(true);
        return;
      }
      timerId = setTimeout(tick, nextDelay());
    };

    // Initial check fires immediately; any setState happens after network IO.
    void tick();

    return () => {
      cancelled = true;
      if (timerId) clearTimeout(timerId);
    };
  }, [checkPurchase]);

  const displayName = purchase?.name || null;
  const confirmed = purchase?.confirmed ?? false;

  return (
    <main
      className="min-h-screen px-6 py-20"
      style={{ background: 'var(--cream)' }}
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
        style={{ color: 'var(--ink)', animation: 'aesdr-rise .7s ease-out both' }}
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
              color: confirmed ? 'var(--crimson)' : 'var(--crimson)',
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
                    background: 'var(--crimson)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  }}
                />
                Purchase confirmed
              </>
            ) : polling ? (
              <>
                <span
                  className="inline-block h-3 w-3 animate-spin rounded-full border"
                  style={{
                    borderColor: 'var(--light)',
                    borderTopColor: 'var(--crimson)',
                  }}
                />
                Confirming your purchase...
              </>
            ) : (
              <>
                <span
                  aria-hidden
                  style={{
                    display: 'inline-block',
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: 'var(--crimson)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  }}
                />
                Payment received
              </>
            )}
          </p>

          <p
            style={{
              fontFamily: 'var(--mono)',
              fontSize: '10px',
              letterSpacing: '.28em',
              textTransform: 'uppercase',
              color: 'var(--muted)',
              margin: 0,
              minHeight: '1em',
            }}
          >
            {memberNo ? `Member No. ${memberNo}` : ' '}
          </p>
        </div>

        {/* Charged-but-still-finalizing notice — shown only when polling has
            given up without a confirmation. Reassures the buyer their payment
            went through and tells them exactly what to do next, instead of
            leaving them on a frozen spinner. */}
        {gaveUp && !confirmed && (
          <div
            role="status"
            style={{
              padding: '18px 22px',
              background: '#fff',
              border: '1px solid var(--light)',
              borderLeft: '2px solid var(--crimson)',
              marginBottom: '32px',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--cond)',
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '.06em',
                textTransform: 'uppercase',
                color: 'var(--crimson)',
                margin: '0 0 8px',
              }}
            >
              You&apos;re all set
            </p>
            <p
              style={{
                fontFamily: 'var(--serif)',
                fontSize: '15px',
                lineHeight: 1.7,
                color: 'var(--ink)',
                margin: 0,
              }}
            >
              Your payment went through. Setting up your account can take a
              couple of minutes to finalize on our end &mdash; nothing more for
              you to do right now. Your receipt and login details are headed to
              the email you purchased with; check your inbox (and spam) in a few
              minutes, or refresh this page. If it still hasn&apos;t arrived,
              email{' '}
              <a
                href="mailto:hello@aesdr.com"
                style={{ color: 'var(--crimson)' }}
              >
                hello@aesdr.com
              </a>{' '}
              and we&apos;ll sort it out.
            </p>
          </div>
        )}

        {/* Editorial overline */}
        <p
          style={{
            fontFamily: 'var(--mono)',
            fontSize: '10px',
            letterSpacing: '.32em',
            textTransform: 'uppercase',
            color: 'var(--muted)',
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
            color: 'var(--ink)',
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
            color: 'var(--muted)',
            marginBottom: '56px',
            maxWidth: '54ch',
          }}
        >
          A couple of quick setup steps and you&apos;re in &mdash; no
          orientation video, no busywork. What follows is everything you
          genuinely need to begin, laid out in the order you&apos;ll
          actually use it.
        </p>

        {/* Steps — editorial ledger */}
        <section
          aria-label="Next steps"
          style={{
            borderTop: '1px solid var(--light)',
            borderBottom: '1px solid var(--light)',
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
            title="Open Course 1"
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
            title="Show up Tuesday morning"
            body={
              <>
                The course is yours now. The work that matters is what you do
                with it on a Tuesday morning when nobody&apos;s watching &mdash;
                not in a chat room, not in a webinar, in your calendar between
                the calls. Open Course 1.1, set a 25-minute timer, and go.
              </>
            }
            accent="var(--crimson)"
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
            color: 'var(--ink)',
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
            color: 'var(--muted)',
            margin: '0 0 40px',
          }}
        >
          &mdash; AESDR
        </p>

        {/* Email fallback notice */}
        <div
          style={{
            padding: '18px 22px',
            background: '#fff',
            border: '1px solid var(--light)',
            borderLeft: '2px solid var(--crimson)',
            marginBottom: '48px',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--serif)',
              fontSize: '14px',
              color: 'var(--muted)',
              lineHeight: 1.65,
              margin: 0,
            }}
          >
            Didn&apos;t get the email? Check spam, or{' '}
            <Link href="/signup" style={{ color: 'var(--crimson)' }}>
              create an account manually
            </Link>{' '}
            using the email you purchased with. Anything else &mdash;{' '}
            <a href="mailto:hello@aesdr.com" style={{ color: 'var(--crimson)' }}>
              hello@aesdr.com
            </a>
            .
          </p>
        </div>

        <footer
          style={{
            borderTop: '1px solid var(--light)',
            paddingTop: '20px',
            marginTop: '48px',
            fontFamily: 'var(--mono)',
            fontSize: '9px',
            letterSpacing: '.2em',
            textTransform: 'uppercase',
            color: 'var(--muted)',
            opacity: 0.6,
          }}
        >
          Questions?{' '}
          <a
            href="mailto:hello@aesdr.com"
            style={{ color: 'var(--crimson)', textDecoration: 'none' }}
          >
            hello@aesdr.com
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
        borderBottom: isLast ? 'none' : '1px solid var(--light)',
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
            color: accent || 'var(--muted)',
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
            color: accent || 'var(--ink)',
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
            color: 'var(--ink)',
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
            color: 'var(--muted)',
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
