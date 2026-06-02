"use client";

/**
 * Universal branded shell for every /x/kit/* page. Editorial palette only —
 * cream/ink/crimson with iris gradient accents on the category stripe + key
 * marks. Each doc declares its category + pose + subtitle; KitShell handles
 * the chrome (sticky header, mascot, category bar, prev/next, footer).
 *
 * The body slot can be either the rendered-markdown HTML (default) for the
 * long-tail docs, or a fully custom JSX layout for the three priority docs.
 */
import Link from "next/link";
import type { ReactNode } from "react";
import { Mascot, type Pose, MASCOT_SIZE } from "@/components/brand/Mascot";

export type KitCategory =
  | "About AESDR"
  | "How co-promotion works";

export type KitShellProps = {
  /** Doc title (shown as h1) */
  title: string;
  /** One-line summary under the title */
  subtitle: string;
  /** Category badge — controls the color stripe + section group */
  category: KitCategory;
  /** Leponeus pose, picked per doc to fit the tone */
  pose: Pose;
  /** Prev/next doc, if any (links to /x/kit/<slug>) */
  prev?: { slug: string; title: string };
  next?: { slug: string; title: string };
  /** The doc body — either renderable HTML or custom JSX */
  children: ReactNode;
  /** Optional — replaces the default footer CTA */
  footerSlot?: ReactNode;
};

const CATEGORY_COLOR: Record<KitCategory, string> = {
  "About AESDR": "var(--crimson, #8B1A1A)",
  "How co-promotion works": "var(--ink, #1A1A1A)",
};

export default function KitShell({
  title,
  subtitle,
  category,
  pose,
  prev,
  next,
  children,
  footerSlot,
}: KitShellProps) {
  return (
    <main
      style={{
        background: "var(--cream, #FAF7F2)",
        color: "var(--ink, #1A1A1A)",
        minHeight: "100vh",
      }}
    >
      {/* ── Sticky header ── */}
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
          justifyContent: "space-between",
          gap: 20,
        }}
      >
        <Link
          href="/x/kit"
          style={{
            fontFamily: "var(--cond, 'Barlow Condensed', sans-serif)",
            textTransform: "uppercase",
            letterSpacing: ".18em",
            fontSize: 12,
            color: "var(--muted, #6B6B6B)",
            textDecoration: "none",
          }}
        >
          ← All of the kit
        </Link>
        <span
          style={{
            fontFamily: "var(--cond, 'Barlow Condensed', sans-serif)",
            textTransform: "uppercase",
            letterSpacing: ".22em",
            fontSize: 11,
            color: "var(--ink, #1A1A1A)",
          }}
        >
          AESDR <span style={{ color: "var(--crimson, #8B1A1A)" }}>×</span>{" "}
          Affiliate Kit
        </span>
      </header>

      {/* ── Doc hero ── */}
      <section
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          padding: "56px 32px 24px",
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: 32,
          alignItems: "start",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "var(--cond, 'Barlow Condensed', sans-serif)",
              textTransform: "uppercase",
              letterSpacing: ".24em",
              fontSize: 12,
              color: CATEGORY_COLOR[category],
              marginBottom: 14,
            }}
          >
            {category}
          </div>
          <h1
            style={{
              fontFamily: "var(--display, 'Playfair Display', Georgia, serif)",
              fontWeight: 700,
              fontSize: "clamp(36px, 5vw, 56px)",
              lineHeight: 1.08,
              margin: 0,
              letterSpacing: "-0.01em",
            }}
          >
            {title}
          </h1>
          <p
            style={{
              fontFamily: "var(--serif, 'Source Serif 4', Georgia, serif)",
              fontStyle: "italic",
              fontSize: 19,
              color: "var(--muted, #6B6B6B)",
              marginTop: 14,
              maxWidth: 640,
              lineHeight: 1.5,
            }}
          >
            {subtitle}
          </p>
        </div>
        <div
          style={{
            opacity: 0.94,
            flexShrink: 0,
          }}
        >
          <Mascot pose={pose} size={MASCOT_SIZE.card} />
        </div>
      </section>

      {/* ── Iris-gradient category stripe ── */}
      <div
        style={{
          maxWidth: 1080,
          margin: "0 auto 8px",
          padding: "0 32px",
        }}
      >
        <div
          style={{
            height: 4,
            width: "100%",
            background:
              "linear-gradient(90deg, var(--crimson, #8B1A1A) 0%, #b4455d 40%, #8B5CF6 100%)",
            backgroundSize: "200% 100%",
            animation: "kit-iris-shimmer 6s linear infinite",
          }}
        />
        <style>{`
          @keyframes kit-iris-shimmer {
            0%   { background-position: 0% 0%; }
            100% { background-position: -200% 0%; }
          }
        `}</style>
      </div>

      {/* ── Body slot ── */}
      <section
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          padding: "48px 32px 88px",
        }}
      >
        {children}
      </section>

      {/* ── Prev / next + footer CTA ── */}
      <footer
        style={{
          borderTop: "1px solid var(--light, #E8E4DF)",
          background: "var(--cream, #FAF7F2)",
          padding: "40px 32px 56px",
        }}
      >
        <div
          style={{
            maxWidth: 1080,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24,
            marginBottom: footerSlot ? 40 : 0,
          }}
        >
          {prev ? (
            <Link
              href={`/x/kit/${prev.slug}`}
              style={{
                textDecoration: "none",
                color: "var(--ink, #1A1A1A)",
                padding: "18px 22px",
                border: "1px solid var(--light, #E8E4DF)",
                background: "var(--cream, #FAF7F2)",
                display: "block",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--cond, 'Barlow Condensed', sans-serif)",
                  textTransform: "uppercase",
                  letterSpacing: ".18em",
                  fontSize: 11,
                  color: "var(--muted, #6B6B6B)",
                  marginBottom: 6,
                }}
              >
                ← Previous
              </div>
              <div
                style={{
                  fontFamily:
                    "var(--display, 'Playfair Display', Georgia, serif)",
                  fontStyle: "italic",
                  fontSize: 18,
                }}
              >
                {prev.title}
              </div>
            </Link>
          ) : (
            <div />
          )}
          {next ? (
            <Link
              href={`/x/kit/${next.slug}`}
              style={{
                textDecoration: "none",
                color: "var(--ink, #1A1A1A)",
                padding: "18px 22px",
                border: "1px solid var(--light, #E8E4DF)",
                background: "var(--cream, #FAF7F2)",
                display: "block",
                textAlign: "right",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--cond, 'Barlow Condensed', sans-serif)",
                  textTransform: "uppercase",
                  letterSpacing: ".18em",
                  fontSize: 11,
                  color: "var(--muted, #6B6B6B)",
                  marginBottom: 6,
                }}
              >
                Next →
              </div>
              <div
                style={{
                  fontFamily:
                    "var(--display, 'Playfair Display', Georgia, serif)",
                  fontStyle: "italic",
                  fontSize: 18,
                }}
              >
                {next.title}
              </div>
            </Link>
          ) : (
            <div />
          )}
        </div>

        {footerSlot}
      </footer>
    </main>
  );
}
