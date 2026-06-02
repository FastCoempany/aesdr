/**
 * /x/kit — the isolated affiliate kit index. Editorial hero, category bands,
 * branded doc cards with category-tinted accents + "priority" badges on the
 * three standout docs (what-you-earn, pilot-rhythm, curriculum-overview).
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

const PRIORITY_SLUGS = new Set([
  "what-you-earn",
  "pilot-rhythm",
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
        <Wordmark size={72} label="AESDR" />
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

      {/* ── Start-here banner ── */}
      <section
        style={{
          maxWidth: 1080,
          margin: "0 auto 56px",
          padding: "0 32px",
        }}
      >
        <div
          style={{
            background: "var(--ink, #1A1A1A)",
            color: "#FAF7F2",
            padding: "24px 28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "var(--cond, 'Barlow Condensed', sans-serif)",
                textTransform: "uppercase",
                letterSpacing: ".22em",
                fontSize: 11,
                color: "#b4455d",
                marginBottom: 6,
              }}
            >
              Start here
            </div>
            <div
              style={{
                fontFamily:
                  "var(--display, 'Playfair Display', Georgia, serif)",
                fontStyle: "italic",
                fontSize: 22,
                lineHeight: 1.35,
              }}
            >
              The three pages most prospects open first.
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[
              { slug: "what-you-earn", label: "What you earn" },
              { slug: "pilot-rhythm", label: "Pilot rhythm" },
              { slug: "curriculum-overview", label: "Curriculum overview" },
            ].map((p) => (
              <Link
                key={p.slug}
                href={`/x/kit/${p.slug}`}
                style={{
                  fontFamily: "var(--cond, 'Barlow Condensed', sans-serif)",
                  textTransform: "uppercase",
                  letterSpacing: ".14em",
                  fontSize: 12,
                  background: "var(--crimson, #8B1A1A)",
                  color: "#FAF7F2",
                  padding: "10px 16px",
                  textDecoration: "none",
                  borderRadius: 2,
                }}
              >
                {p.label} →
              </Link>
            ))}
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
                      Standout
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
