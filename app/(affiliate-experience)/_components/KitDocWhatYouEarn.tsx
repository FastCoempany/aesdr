import Link from "next/link";
import { Mascot, MASCOT_SIZE } from "@/components/brand/Mascot";
import EnterprisePanel from "./EnterprisePanel";

/**
 * Custom branded view for /x/kit/what-you-earn. The standout numerical page —
 * 40% as a giant Playfair number, math worked out in a mono terminal-style
 * block, payment timing as a three-stop timeline. No whimsy.
 */
export default function KitDocWhatYouEarn() {
  return (
    <div style={{ color: "var(--ink, #1A1A1A)" }}>
      {/* ── The number ── */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          gap: 40,
          alignItems: "center",
          marginBottom: 64,
          padding: "32px 0 8px",
          borderBottom: "1px solid var(--light, #E8E4DF)",
        }}
      >
        <div style={{ position: "relative" }}>
          <div
            style={{
              fontFamily: "var(--display, 'Playfair Display', Georgia, serif)",
              fontWeight: 900,
              fontSize: "clamp(120px, 18vw, 200px)",
              lineHeight: 0.85,
              letterSpacing: "-0.04em",
              background:
                "linear-gradient(135deg, var(--crimson, #8B1A1A), #b4455d 60%, #8B5CF6)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
              backgroundSize: "200% 200%",
              animation: "kit-percent-shimmer 8s linear infinite",
            }}
            aria-label="40 percent"
          >
            40%
          </div>
          <style>{`
            @keyframes kit-percent-shimmer {
              0%   { background-position: 0% 50%; }
              50%  { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }
          `}</style>
        </div>
        <div>
          <div
            style={{
              fontFamily: "var(--cond, 'Barlow Condensed', sans-serif)",
              textTransform: "uppercase",
              letterSpacing: ".22em",
              fontSize: 12,
              color: "var(--crimson, #8B1A1A)",
              marginBottom: 12,
            }}
          >
            The rate
          </div>
          <h2
            style={{
              fontFamily: "var(--display, 'Playfair Display', Georgia, serif)",
              fontStyle: "italic",
              fontSize: "clamp(24px, 3vw, 34px)",
              lineHeight: 1.2,
              margin: 0,
              letterSpacing: "-0.005em",
            }}
          >
            of net revenue on every enrollment attributed to you.
          </h2>
          <p
            style={{
              fontFamily: "var(--serif, 'Source Serif 4', Georgia, serif)",
              fontSize: 17,
              lineHeight: 1.6,
              margin: "16px 0 0",
              color: "var(--muted, #6B6B6B)",
            }}
          >
            Inside a 30-day attribution window from the first click on your
            link. AESDR is a one-time product — <strong>$249 SDR</strong> /{" "}
            <strong>$299 AE</strong> — so it&rsquo;s a clean 40% per sale, not
            a recurring trickle you have to babysit.
          </p>
          <p
            style={{
              fontFamily: "var(--serif, 'Source Serif 4', Georgia, serif)",
              fontSize: 15,
              lineHeight: 1.6,
              margin: "12px 0 0",
              color: "var(--muted, #6B6B6B)",
            }}
          >
            That 40% is the consumer course — the $249 and $299 enrollments.
            Teams and enterprise run on a separate channel track with its own
            terms, worked out just below.
          </p>
        </div>
      </section>

      {/* ── Net math — two columns L-to-R: SDR/AE math + Enterprise teaser ──
              EnterprisePanel owns the whole subsystem: both columns of the
              grid AND the full-width expansion that reveals below when the
              affiliate clicks "Tell Us More" on the right. State lives in
              the component so the toggle in the right column drives the
              expansion below — keeps the two top columns the same height
              regardless of the expanded content's depth. */}
      <section style={{ marginBottom: 64 }}>
        <SectionLabel>What &ldquo;net&rdquo; means</SectionLabel>
        <p style={para}>
          Gross, minus refunds (14-day window), minus payment-processor fees.
          Net is what AESDR actually keeps; your 40% comes off that number.
        </p>
        <EnterprisePanel />
      </section>

      {/* ── A real send ── */}
      <section style={{ marginBottom: 64 }}>
        <SectionLabel>A real-shaped example</SectionLabel>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 14,
            marginTop: 18,
          }}
        >
          <Stat n="1,000" label="Recipients (one send)" />
          <Stat n="~80" label="Workshop registrations" />
          <Stat n="~10" label="Enrollments" emphasis />
          <Stat
            n="~$925"
            label="Commission, one send"
            highlight
          />
        </div>
        <p style={{ ...para, marginTop: 24 }}>
          Ten times the list, ten times the number. The math is linear;
          there&rsquo;s no threshold or tier that changes it.
        </p>
      </section>

      {/* ── Payment timing ── */}
      <section style={{ marginBottom: 56 }}>
        <SectionLabel>When you&rsquo;re paid</SectionLabel>
        <p style={para}>
          Net-45 from the close of the attribution window — commission settles{" "}
          <em>after</em> the refund window closes, so nothing gets clawed back
          mid-stream.
        </p>

        <div
          style={{
            marginTop: 28,
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 0,
            border: "1px solid var(--ink, #1A1A1A)",
          }}
        >
          {[
            { k: "Day 0", v: "Workshop registration starts the attribution clock." },
            {
              k: "Day 30",
              v: "Attribution window closes. Refund window also closes.",
            },
            {
              k: "Day 75",
              v: "Net-45 from close → commission lands. The number you saw is the number that hits.",
            },
          ].map((s, i, all) => (
            <div
              key={s.k}
              style={{
                padding: "24px 22px",
                borderRight:
                  i < all.length - 1
                    ? "1px solid var(--light, #E8E4DF)"
                    : "none",
                background:
                  i === all.length - 1
                    ? "var(--ink, #1A1A1A)"
                    : "var(--cream, #FAF7F2)",
                color: i === all.length - 1 ? "#FAF7F2" : "var(--ink, #1A1A1A)",
                position: "relative",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--mono, 'Space Mono', monospace)",
                  fontSize: 12,
                  letterSpacing: ".2em",
                  textTransform: "uppercase",
                  opacity: 0.75,
                  marginBottom: 10,
                }}
              >
                {s.k}
              </div>
              <p
                style={{
                  fontFamily:
                    "var(--serif, 'Source Serif 4', Georgia, serif)",
                  fontSize: 15,
                  lineHeight: 1.55,
                  margin: 0,
                }}
              >
                {s.v}
              </p>
            </div>
          ))}
        </div>

        <p style={{ ...para, marginTop: 22 }}>
          During a pilot you get a one-page report every Friday with the running
          math, so you&rsquo;re seeing the same numbers we are. No surprises at
          the close.
        </p>
      </section>

      {/* ── The kicker + Leponeus ── */}
      <section
        style={{
          marginTop: 40,
          padding: "32px 32px 30px",
          background: "var(--cream, #FAF7F2)",
          border: "1px solid var(--ink, #1A1A1A)",
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: 28,
          alignItems: "center",
        }}
      >
        <div>
          <p
            style={{
              fontFamily: "var(--display, 'Playfair Display', Georgia, serif)",
              fontStyle: "italic",
              fontSize: 24,
              lineHeight: 1.3,
              margin: 0,
            }}
          >
            That&rsquo;s the whole deal. No tiers to climb, no minimums, no
            games.
          </p>
          <p
            style={{
              fontFamily: "var(--serif, 'Source Serif 4', Georgia, serif)",
              fontSize: 16,
              color: "var(--muted, #6B6B6B)",
              marginTop: 14,
              marginBottom: 16,
            }}
          >
            When you&rsquo;re ready for the exact contractual terms, they&rsquo;re
            in the Sample Partnership Agreement.
          </p>
          <Link
            href="/x/kit/sample-partnership-agreement"
            style={{
              fontFamily: "var(--cond, 'Barlow Condensed', sans-serif)",
              textTransform: "uppercase",
              letterSpacing: ".18em",
              fontSize: 12,
              color: "var(--ink, #1A1A1A)",
              borderBottom: "2px solid var(--crimson, #8B1A1A)",
              textDecoration: "none",
              paddingBottom: 2,
            }}
          >
            Open the Sample Agreement →
          </Link>
        </div>
        <div style={{ flexShrink: 0 }}>
          <Mascot pose="owner" size={MASCOT_SIZE.card} />
        </div>
      </section>
    </div>
  );
}

const para: React.CSSProperties = {
  fontFamily: "var(--serif, 'Source Serif 4', Georgia, serif)",
  fontSize: 18,
  lineHeight: 1.7,
  margin: "0 0 14px",
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontFamily: "var(--cond, 'Barlow Condensed', sans-serif)",
        textTransform: "uppercase",
        letterSpacing: ".22em",
        fontSize: 13,
        color: "var(--crimson, #8B1A1A)",
        margin: "0 0 14px",
      }}
    >
      {children}
    </h2>
  );
}

function Stat({
  n,
  label,
  emphasis,
  highlight,
}: {
  n: string;
  label: string;
  emphasis?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      style={{
        padding: "22px 20px 24px",
        background: highlight ? "var(--ink, #1A1A1A)" : "var(--cream, #FAF7F2)",
        color: highlight ? "#FAF7F2" : "var(--ink, #1A1A1A)",
        border: "1px solid var(--ink, #1A1A1A)",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontFamily: emphasis || highlight
            ? "var(--display, 'Playfair Display', Georgia, serif)"
            : "var(--display, 'Playfair Display', Georgia, serif)",
          fontStyle: highlight ? "italic" : "normal",
          fontWeight: 800,
          fontSize: highlight ? 40 : 36,
          lineHeight: 1,
          letterSpacing: "-0.01em",
        }}
      >
        {n}
      </div>
      <div
        style={{
          fontFamily: "var(--cond, 'Barlow Condensed', sans-serif)",
          textTransform: "uppercase",
          letterSpacing: ".18em",
          fontSize: 11,
          marginTop: 10,
          color: highlight ? "rgba(250,247,242,0.78)" : "var(--muted, #6B6B6B)",
        }}
      >
        {label}
      </div>
    </div>
  );
}
