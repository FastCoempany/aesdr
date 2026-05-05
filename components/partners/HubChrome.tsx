/**
 * Component: HubChrome (LockupHeader + Footer + page wrapper)
 * Spec: AESDR-PARTNER-HUB-SPEC.md §"Component library"
 * Canon: §6.1 (palette — cream override on retired-dark default), §6.4 (iris reservation), §6.6 (lockup placement)
 * Five-question check: PASS
 *
 * Per Q7 ratification 2026-05-04: per-page wrapper sets `background: var(--cream)`
 * to override `app/globals.css` body default of `var(--bg-main)` (retired dark
 * palette). Sibling routes outside /partners/* retain their existing defaults.
 */

import Link from "next/link";
import type { ReactNode } from "react";

const NAV_ITEMS = [
  { href: "/partners/program", label: "Program" },
  { href: "/partners/curriculum", label: "Curriculum" },
  { href: "/partners/kit", label: "Kit" },
  { href: "/partners/faq", label: "FAQ" },
  { href: "/partners/apply", label: "Apply" },
];

export function LockupHeader() {
  return (
    <header
      style={{
        padding: "20px 48px",
        background: "var(--cream)",
        borderBottom: "1px solid var(--light)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Link
        href="/partners"
        style={{
          fontFamily: "var(--display)",
          fontStyle: "italic",
          fontWeight: 900,
          fontSize: 28,
          color: "var(--ink)",
          textDecoration: "none",
          letterSpacing: "0.01em",
        }}
        aria-label="AESDR — back to partner hub"
      >
        AESDR
      </Link>
      <nav
        style={{
          display: "flex",
          gap: 24,
          alignItems: "center",
        }}
        aria-label="Partner hub navigation"
      >
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            style={{
              fontFamily: "var(--cond)",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "var(--ink)",
              textDecoration: "none",
            }}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer
      style={{
        background: "var(--cream)",
        borderTop: "1px solid var(--light)",
        padding: "48px 24px 64px",
        marginTop: 96,
      }}
    >
      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontFamily: "var(--serif)",
            fontSize: 13,
            color: "var(--muted)",
            lineHeight: 1.6,
            marginBottom: 20,
          }}
        >
          AESDR · The operating manual, not the motivation engine.
          <br />
          This is the partner hub. Buyers go to{" "}
          <Link href="/" style={{ color: "var(--muted)", textDecoration: "underline" }}>
            aesdr.com
          </Link>
          .
        </p>
        <div
          style={{
            fontFamily: "var(--mono)",
            fontSize: 10,
            color: "var(--muted)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          <Link
            href="/privacy"
            style={{ color: "var(--muted)", textDecoration: "none" }}
          >
            Privacy
          </Link>
          <span style={{ margin: "0 8px", color: "var(--light)" }}>·</span>
          <Link
            href="/terms"
            style={{ color: "var(--muted)", textDecoration: "none" }}
          >
            Terms
          </Link>
          <span style={{ margin: "0 8px", color: "var(--light)" }}>·</span>
          <Link
            href="/refund-policy"
            style={{ color: "var(--muted)", textDecoration: "none" }}
          >
            Refunds
          </Link>
          <span style={{ margin: "0 8px", color: "var(--light)" }}>·</span>
          <span>© AESDR 2026</span>
        </div>
      </div>
    </footer>
  );
}

export function HubPage({ children }: { children: ReactNode }) {
  return (
    <main
      style={{
        background: "var(--cream)",
        color: "var(--ink)",
        fontFamily: "var(--serif)",
        minHeight: "100vh",
      }}
    >
      <LockupHeader />
      {children}
      <Footer />
    </main>
  );
}
