/**
 * /x/kit — the isolated affiliate kit index. Editorial hero, an iris-shimmer
 * orientation banner (what the kit does for a first-time affiliate), category
 * bands, and branded doc cards. The three docs a newcomer should open first —
 * positioning-brief, what-you-earn, curriculum-overview — wear a "Start here"
 * chip. (Not the internal "standout" word, which means nothing to a prospect.)
 */
import type { Metadata } from "next";
import Link from "next/link";
import { KIT_ENTRIES, KIT_CATEGORIES } from "@/lib/affiliate-kit";
import { Mascot, MASCOT_SIZE } from "@/components/brand/Mascot";
import { Icon, type IconName } from "@/components/brand/Icon";
import {
  Wordmark,
  GhostNumeral,
  CornerBracket,
} from "@/components/brand/BrandAssets";
import KitTracker from "../../_components/KitTracker";
import KitNav from "../../_components/KitNav";

export const metadata: Metadata = {
  title: "Affiliate Kit · AESDR",
  robots: { index: false, follow: false },
};

// The three a first-time affiliate should open first — their first three
// questions: does this fit my audience (positioning), what do I make
// (what-you-earn), what am I actually promoting (curriculum). Pilot rhythm is a
// post-decision operational read, so it lives in the grid, not the priority set.
const PRIORITY_SLUGS = new Set([
  "positioning-brief",
  "what-you-earn",
  "curriculum-overview",
]);

const CATEGORY_ACCENT: Record<string, string> = {
  "About AESDR": "var(--crimson, #8B1A1A)",
  "How co-promotion works": "var(--ink, #1A1A1A)",
};

const CATEGORY_ICON: Record<string, IconName> = {
  "About AESDR": "ledger",
  "How co-promotion works": "weight",
};

const DOC_ICON: Record<string, IconName> = {
  "positioning-brief": "ear",
  "curriculum-overview": "mile",
  "what-you-earn": "refund",
  "pilot-rhythm": "hourglass",
  "co-promoting-aesdr": "weight",
  "approved-claims": "quill",
  "disclosure-language-pack": "eye",
  "banned-vocabulary": "warn",
  "lockup-usage": "mile",
  "sample-partnership-agreement": "ledger",
};

export default function KitIndexPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--cream, #FAF7F2)",
        color: "var(--ink, #1A1A1A)",
      }}
    >
      <KitTracker event="kit_viewed" props={{ view: "index" }} />
      <KitNav />

      {/* ── Sticky brand bar ── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 30,
          background: "rgba(250, 247, 242, 0.95)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid var(--light, #E8E4DF)",
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          fontFamily: "var(--cond, 'Barlow Condensed', sans-serif)",
          textTransform: "uppercase",
          letterSpacing: ".22em",
          fontSize: 11,
        }}
      >
        <Wordmark size={84} tone="iris" label="AESDR" />
        <span style={{ color: "var(--crimson, #8B1A1A)" }}>×</span>
        Affiliate Kit
      </header>

      {/* ── Hero ── */}
      <section
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          padding: "72px 32px 36px",
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: 36,
          alignItems: "center",
          position: "relative",
        }}
      >
        {/* Quiet editorial frame brackets on the hero — same registers as
            the kit doc hero so the system reads consistently */}
        <CornerBracket
          position="tl"
          size={32}
          color="rgba(26,26,26,0.22)"
          style={{ position: "absolute", top: 44, left: 24 }}
        />
        <CornerBracket
          position="tr"
          size={32}
          color="rgba(26,26,26,0.22)"
          style={{ position: "absolute", top: 44, right: 24 }}
        />
        {/* Ghost "AK" numeral as quiet background mark */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 32,
            right: 64,
            zIndex: 0,
            pointerEvents: "none",
          }}
        >
          <GhostNumeral numeral="AK" size={260} />
        </div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              fontFamily: "var(--cond, 'Barlow Condensed', sans-serif)",
              textTransform: "uppercase",
              letterSpacing: ".24em",
              fontSize: 12,
              color: "var(--crimson, #8B1A1A)",
              marginBottom: 14,
            }}
          >
            The kit, in advance.
          </div>
          <h1
            style={{
              fontFamily: "var(--display, 'Playfair Display', Georgia, serif)",
              fontStyle: "italic",
              fontWeight: 700,
              fontSize: "clamp(32px, 4.4vw, 52px)",
              lineHeight: 1.05,
              margin: 0,
              letterSpacing: "-0.015em",
              whiteSpace: "nowrap",
            }}
          >
            Most programs gate the kit. We don&rsquo;t.
          </h1>
          <p
            style={{
              fontFamily: "var(--serif, 'Source Serif 4', Georgia, serif)",
              fontSize: 19,
              color: "var(--muted, #6B6B6B)",
              lineHeight: 1.6,
              maxWidth: 640,
              marginTop: 22,
            }}
          >
            Positioning, what you earn, claim limits, disclosure language, the
            actual sample agreement — all readable before you decide to talk to
            us.
          </p>
        </div>
        <div style={{ flexShrink: 0, position: "relative", zIndex: 1 }}>
          <Mascot pose="doctrine" size={MASCOT_SIZE.panel} />
        </div>
      </section>

      {/* ── Plain ink rule (replaces the prior iris shimmer; user wants the
              hero quieter so the headline carries the page on its own). ── */}
      <div
        style={{
          maxWidth: 1080,
          margin: "0 auto 24px",
          padding: "0 32px",
        }}
      >
        <div
          style={{
            height: 1,
            background: "var(--ink, #1A1A1A)",
            opacity: 0.18,
          }}
        />
      </div>

      {/* ── Orientation banner ──
              Reimagined from the flat ink band into an iris-shimmer-framed
              ink plate: an animated iris gradient border + iris glow, with an
              iris text-clip eyebrow. Leads with what the kit DOES for a
              first-time affiliate (orient a confused prospect) rather than a
              row of tactical page links — the "which pages first" signal now
              lives on the "Start here" card chips below. Keyframes are scoped
              here; the global prefers-reduced-motion rule (app/globals.css)
              halts them for motion-sensitive users, and prefers-contrast
              collapses --iris to solid crimson. ── */}
      <section
        style={{
          maxWidth: 1080,
          margin: "0 auto 56px",
          padding: "0 32px",
        }}
      >
        <style>{`
          @keyframes kit-start-border {
            0%   { background-position:   0% 50%, 0% 0%; }
            100% { background-position: 300% 50%, 0% 0%; }
          }
          @keyframes kit-start-eyebrow {
            0%   { background-position:   0% 50%; }
            100% { background-position: 200% 50%; }
          }
          .kit-start-wrap {
            position: relative;
            border-radius: 6px;
            padding: 2px;
            background:
              var(--iris) border-box,
              linear-gradient(var(--ink, #1A1A1A), var(--ink, #1A1A1A)) padding-box;
            background-size: 300% 100%, 100% 100%;
            background-repeat: no-repeat, no-repeat;
            border: 1px solid transparent;
            animation: kit-start-border 8s linear infinite;
            box-shadow:
              0 0 20px rgba(255, 0, 110, 0.16),
              0 0 40px rgba(139, 92, 246, 0.14),
              0 24px 48px -22px rgba(26, 26, 26, 0.38);
          }
          .kit-start-inner {
            background: var(--ink, #1A1A1A);
            border-radius: 5px;
            padding: 30px clamp(24px, 4vw, 40px) 32px;
            color: #FAF7F2;
          }
          .kit-start-eyebrow {
            display: inline-block;
            font-family: var(--cond, 'Barlow Condensed', sans-serif);
            text-transform: uppercase;
            letter-spacing: .24em;
            font-size: 12px;
            font-weight: 700;
            margin-bottom: 12px;
            background: var(--iris);
            background-size: 200% 100%;
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            color: transparent;
            animation: kit-start-eyebrow 4s linear infinite;
          }
        `}</style>

        <div className="kit-start-wrap">
          <div className="kit-start-inner">
            <span className="kit-start-eyebrow">What this kit does for you</span>
            <h2
              style={{
                fontFamily:
                  "var(--display, 'Playfair Display', Georgia, serif)",
                fontStyle: "italic",
                fontWeight: 700,
                fontSize: "clamp(24px, 3vw, 32px)",
                lineHeight: 1.2,
                margin: 0,
                letterSpacing: "-0.01em",
                color: "#FAF7F2",
              }}
            >
              Read it like a buyer. Decide if AESDR is worth your
              audience&rsquo;s inbox.
            </h2>
            <p
              style={{
                fontFamily:
                  "var(--serif, 'Source Serif 4', Georgia, serif)",
                fontSize: 16.5,
                lineHeight: 1.6,
                margin: "14px 0 0",
                maxWidth: 720,
                color: "rgba(250, 247, 242, 0.74)",
              }}
            >
              If it is, everything you&rsquo;d need to promote it well — the
              numbers, the claim limits, the actual agreement — is already in
              here. No call first.
            </p>
          </div>
        </div>
      </section>

      {/* ── Category sections ── */}
      <section
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          padding: "0 32px 96px",
        }}
      >
        {KIT_CATEGORIES.map((cat) => (
          <div key={cat.name} style={{ marginBottom: 56 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
              <Icon
                name={CATEGORY_ICON[cat.name] || "ledger"}
                size={22}
                style={{ color: CATEGORY_ACCENT[cat.name] || "var(--ink, #1A1A1A)" }}
              />
              <h2
                style={{
                  fontFamily:
                    "var(--display, 'Playfair Display', Georgia, serif)",
                  fontStyle: "italic",
                  fontSize: 30,
                  margin: 0,
                  letterSpacing: "-0.005em",
                }}
              >
                {cat.name}
              </h2>
            </div>
            <p
              style={{
                fontFamily: "var(--serif, 'Source Serif 4', Georgia, serif)",
                fontSize: 16,
                color: "var(--muted, #6B6B6B)",
                marginBottom: 26,
                marginTop: 0,
                paddingLeft: 28,
              }}
            >
              {cat.blurb}
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: 16,
              }}
            >
              {KIT_ENTRIES.filter((e) => e.category === cat.name).map((e) => (
                <Link
                  key={e.slug}
                  href={`/x/kit/${e.slug}`}
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    background: "var(--cream, #FAF7F2)",
                    border: "1px solid var(--light, #E8E4DF)",
                    padding: "22px 22px 24px",
                    display: "block",
                    position: "relative",
                    transition: "transform 200ms ease, border-color 200ms ease",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 3,
                      background: CATEGORY_ACCENT[cat.name],
                    }}
                  />
                  {PRIORITY_SLUGS.has(e.slug) && (
                    <span
                      style={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        fontFamily:
                          "var(--cond, 'Barlow Condensed', sans-serif)",
                        textTransform: "uppercase",
                        letterSpacing: ".18em",
                        fontSize: 10,
                        color: "#FAF7F2",
                        background: "var(--crimson, #8B1A1A)",
                        padding: "3px 8px",
                        borderRadius: 2,
                      }}
                    >
                      Start here
                    </span>
                  )}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      margin: "6px 0 10px",
                    }}
                  >
                    <Icon
                      name={DOC_ICON[e.slug] || "ledger"}
                      size={18}
                      style={{ color: CATEGORY_ACCENT[cat.name], flexShrink: 0 }}
                    />
                    <h3
                      style={{
                        fontFamily:
                          "var(--display, 'Playfair Display', Georgia, serif)",
                        fontStyle: "italic",
                        fontSize: 21,
                        margin: 0,
                        letterSpacing: "-0.005em",
                      }}
                    >
                      {e.title}
                    </h3>
                  </div>
                  <p
                    style={{
                      fontFamily:
                        "var(--serif, 'Source Serif 4', Georgia, serif)",
                      fontSize: 14.5,
                      lineHeight: 1.55,
                      color: "var(--muted, #6B6B6B)",
                      margin: 0,
                    }}
                  >
                    {e.description}
                  </p>
                  <div
                    style={{
                      marginTop: 14,
                      fontFamily:
                        "var(--cond, 'Barlow Condensed', sans-serif)",
                      textTransform: "uppercase",
                      letterSpacing: ".18em",
                      fontSize: 11,
                      color: "var(--crimson, #8B1A1A)",
                    }}
                  >
                    Open →
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
