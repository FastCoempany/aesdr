/**
 * /x/kit — the isolated affiliate kit index. Editorial hero, category bands,
 * branded doc cards with category-tinted accents + "priority" badges on the
 * three standout docs (what-you-earn, pilot-rhythm, curriculum-overview).
 */
import type { Metadata } from "next";
import Link from "next/link";
import { KIT_ENTRIES, KIT_CATEGORIES } from "@/lib/affiliate-kit";
import { Mascot, MASCOT_SIZE } from "@/components/brand/Mascot";
import KitTracker from "../../_components/KitTracker";

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
          fontFamily: "var(--cond, 'Barlow Condensed', sans-serif)",
          textTransform: "uppercase",
          letterSpacing: ".22em",
          fontSize: 11,
        }}
      >
        AESDR <span style={{ color: "var(--crimson, #8B1A1A)", margin: "0 6px" }}>×</span>{" "}
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
        }}
      >
        <div>
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
              fontSize: "clamp(40px, 6vw, 64px)",
              lineHeight: 1.05,
              margin: 0,
              letterSpacing: "-0.015em",
            }}
          >
            Most programs gate the kit.
            <br />
            We don&rsquo;t.
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
            actual sample agreement — readable before you ever talk to us.
          </p>
        </div>
        <div style={{ flexShrink: 0 }}>
          <Mascot pose="doctrine" size={MASCOT_SIZE.panel} />
        </div>
      </section>

      {/* ── Iris stripe ── */}
      <div
        style={{
          maxWidth: 1080,
          margin: "0 auto 24px",
          padding: "0 32px",
        }}
      >
        <div
          style={{
            height: 4,
            background:
              "linear-gradient(90deg, var(--crimson, #8B1A1A), #b4455d, #8B5CF6)",
            backgroundSize: "200% 100%",
            animation: "kit-hero-shimmer 6s linear infinite",
          }}
        />
        <style>{`
          @keyframes kit-hero-shimmer {
            0%   { background-position: 0% 0%; }
            100% { background-position: -200% 0%; }
          }
        `}</style>
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
            <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 6 }}>
              <span
                style={{
                  display: "inline-block",
                  width: 14,
                  height: 14,
                  background: CATEGORY_ACCENT[cat.name] || "var(--ink, #1A1A1A)",
                }}
                aria-hidden
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
                  <h3
                    style={{
                      fontFamily:
                        "var(--display, 'Playfair Display', Georgia, serif)",
                      fontStyle: "italic",
                      fontSize: 21,
                      margin: "6px 0 10px",
                      letterSpacing: "-0.005em",
                    }}
                  >
                    {e.title}
                  </h3>
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
