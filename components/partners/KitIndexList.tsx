/**
 * Component: KitIndexList
 * Spec: AESDR-PARTNER-HUB-SPEC.md §"Page 1.4 — /partners/kit"
 * Canon: §6.5 (no decorative icons), §13 (honesty — kit is open, not gated)
 *
 * On-site index of the partner kit. Each entry links to the rendered page
 * at /partners/kit/[slug]. Supersedes the prior PDF-download model.
 */

import Link from "next/link";
import { KIT_CATEGORIES, KIT_ENTRIES } from "@/lib/partner-kit";

export function KitIndexList() {
  return (
    <section
      style={{
        maxWidth: 1080,
        margin: "0 auto",
        padding: "64px 24px 0",
      }}
    >
      {KIT_CATEGORIES.map((cat) => {
        const items = KIT_ENTRIES.filter((e) => e.category === cat.name);
        if (items.length === 0) return null;
        return (
          <div key={cat.name} style={{ marginBottom: 64 }}>
            <div
              style={{
                fontFamily: "var(--cond)",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "var(--muted)",
                marginBottom: 8,
              }}
            >
              {cat.name}
            </div>
            <p
              style={{
                fontFamily: "var(--serif)",
                fontStyle: "italic",
                fontSize: 16,
                color: "var(--muted)",
                marginBottom: 24,
              }}
            >
              {cat.blurb}
            </p>
            <div style={{ borderTop: "1px solid var(--light)" }}>
              {items.map((it) => (
                <Link
                  key={it.slug}
                  href={`/partners/kit/${it.slug}`}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: 24,
                    padding: "20px 0",
                    borderBottom: "1px solid var(--light)",
                    alignItems: "center",
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontFamily: "var(--display)",
                        fontStyle: "italic",
                        fontWeight: 700,
                        fontSize: 19,
                        color: "var(--ink)",
                        marginBottom: 6,
                      }}
                    >
                      {it.title}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--serif)",
                        fontSize: 14,
                        color: "var(--muted)",
                        lineHeight: 1.6,
                      }}
                    >
                      {it.description}
                    </div>
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: 11,
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      color: "var(--ink)",
                    }}
                  >
                    Read →
                  </div>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
      <p
        style={{
          fontFamily: "var(--serif)",
          fontStyle: "italic",
          fontSize: 15,
          color: "var(--muted)",
          textAlign: "center",
          padding: "32px 0 0",
          maxWidth: 720,
          margin: "0 auto",
          lineHeight: 1.7,
        }}
      >
        Three things you&rsquo;ll receive after we sign the partnership agreement &mdash; not before: your partner-specific tracking links, your AESDR &times; Partner co-branded lockup compositions, and the partnership agreement itself. Those three are specific to your pilot, so we generate them for you once we have a yes from both sides.
      </p>
    </section>
  );
}
