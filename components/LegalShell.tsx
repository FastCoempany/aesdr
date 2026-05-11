/**
 * LegalShell — shared chrome for the five info / legal pages:
 *   /terms, /privacy, /refund-policy, /about, /contact
 *
 * Editorial palette only (--cream, --ink, --crimson, --muted, --light).
 * No retired-dark tokens. Document-register layout: single 720px column,
 * Playfair italic title, Barlow Condensed section headers, Source Serif
 * body. Footer cross-links to the other four pages.
 */

import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  eyebrow: string;
  title: string;
  /** Optional ISO date string or readable string — rendered in mono under title. */
  lastUpdated?: string;
  /** Body of the page — typically `<Section>` blocks. */
  children: ReactNode;
  /** Slug of the current page (omit from footer cross-links). */
  current?: "terms" | "privacy" | "refund-policy" | "about" | "contact";
};

const CROSS_LINKS: { slug: NonNullable<Props["current"]>; label: string; href: string }[] = [
  { slug: "about", label: "About", href: "/about" },
  { slug: "contact", label: "Contact", href: "/contact" },
  { slug: "terms", label: "Terms", href: "/terms" },
  { slug: "privacy", label: "Privacy", href: "/privacy" },
  { slug: "refund-policy", label: "Refunds", href: "/refund-policy" },
];

export default function LegalShell({
  eyebrow,
  title,
  lastUpdated,
  children,
  current,
}: Props) {
  return (
    <main
      style={{
        background: "var(--cream)",
        color: "var(--ink)",
        minHeight: "100vh",
        padding: "80px 24px 96px",
      }}
    >
      <article
        style={{
          maxWidth: 720,
          margin: "0 auto",
        }}
      >
        {/* Back link */}
        <Link
          href="/"
          style={{
            fontFamily: "var(--mono)",
            fontSize: 10,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "var(--muted)",
            textDecoration: "none",
            display: "inline-block",
            marginBottom: 40,
          }}
        >
          &larr; Back
        </Link>

        {/* Header */}
        <header style={{ marginBottom: 48 }}>
          <p
            style={{
              fontFamily: "var(--mono)",
              fontSize: 11,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "var(--crimson)",
              marginBottom: 12,
            }}
          >
            {eyebrow}
          </p>
          <h1
            style={{
              fontFamily: "var(--display)",
              fontStyle: "italic",
              fontWeight: 700,
              fontSize: "clamp(36px, 5vw, 56px)",
              lineHeight: 1.1,
              color: "var(--ink)",
              margin: 0,
            }}
          >
            {title}
          </h1>
          {lastUpdated && (
            <p
              style={{
                fontFamily: "var(--mono)",
                fontSize: 11,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--muted)",
                marginTop: 16,
              }}
            >
              Last updated: {lastUpdated}
            </p>
          )}
        </header>

        {/* Body */}
        <div
          style={{
            fontFamily: "var(--serif)",
            fontSize: 17,
            lineHeight: 1.75,
            color: "var(--ink)",
          }}
        >
          {children}
        </div>

        {/* Footer cross-links */}
        <footer
          style={{
            marginTop: 64,
            paddingTop: 28,
            borderTop: "1px solid var(--light)",
            display: "flex",
            flexWrap: "wrap",
            gap: 24,
            fontFamily: "var(--mono)",
            fontSize: 10,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
          }}
        >
          {CROSS_LINKS.filter((l) => l.slug !== current).map((l) => (
            <Link
              key={l.slug}
              href={l.href}
              style={{ color: "var(--muted)", textDecoration: "none" }}
            >
              {l.label}
            </Link>
          ))}
        </footer>
      </article>
    </main>
  );
}

/** Standard body section with Barlow Condensed eyebrow header. */
export function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section style={{ marginBottom: 36 }}>
      <h2
        style={{
          fontFamily: "var(--cond)",
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--crimson)",
          marginBottom: 14,
        }}
      >
        {title}
      </h2>
      <div>{children}</div>
    </section>
  );
}

/** Inline link in document body — crimson, underlined. */
export function DocLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      style={{
        color: "var(--crimson)",
        textDecoration: "underline",
        textUnderlineOffset: 2,
      }}
    >
      {children}
    </Link>
  );
}
