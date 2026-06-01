/**
 * /x/kit — the isolated affiliate kit index (end of the prospect flow).
 *
 * Reuses the kit catalog (lib/affiliate-kit) read-only, but renders inside the
 * isolated environment with NO links out to the rest of the site — the prospect
 * only ever sees the kit. kit_viewed is recorded on mount.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { KIT_ENTRIES, KIT_CATEGORIES } from "@/lib/affiliate-kit";
import KitTracker from "../../_components/KitTracker";

export const metadata: Metadata = {
  title: "Affiliate Kit · AESDR",
  robots: { index: false, follow: false },
};

export default function KitIndexPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--cream, #FAF7F2)",
        color: "var(--ink, #1A1A1A)",
        padding: "72px 24px 120px",
      }}
    >
      <KitTracker event="kit_viewed" props={{ view: "index" }} />
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <p
          style={{
            fontFamily: "var(--cond, 'Barlow Condensed', sans-serif)",
            textTransform: "uppercase",
            letterSpacing: ".22em",
            fontSize: 12,
            color: "var(--crimson, #8B1A1A)",
            margin: 0,
          }}
        >
          AESDR · Affiliate Kit
        </p>
        <h1
          style={{
            fontFamily: "var(--display, 'Playfair Display', Georgia, serif)",
            fontStyle: "italic",
            fontWeight: 700,
            fontSize: "clamp(34px, 5vw, 46px)",
            lineHeight: 1.15,
            margin: "14px 0 14px",
          }}
        >
          The kit, in advance.
        </h1>
        <p
          style={{
            fontFamily: "var(--serif, 'Source Serif 4', Georgia, serif)",
            fontStyle: "italic",
            fontSize: 18,
            color: "var(--muted, #6B6B6B)",
            lineHeight: 1.7,
            maxWidth: 680,
            marginBottom: 56,
          }}
        >
          Positioning, what you earn, claim limits, disclosure language, the
          actual agreement — readable before you ever talk to us.
        </p>

        {KIT_CATEGORIES.map((cat) => (
          <section key={cat.name} style={{ marginBottom: 56 }}>
            <h2
              style={{
                fontFamily: "var(--display, 'Playfair Display', Georgia, serif)",
                fontStyle: "italic",
                fontSize: 24,
                margin: "0 0 6px",
              }}
            >
              {cat.name}
            </h2>
            <p
              style={{
                fontFamily: "var(--serif, 'Source Serif 4', Georgia, serif)",
                fontSize: 15,
                color: "var(--muted, #6B6B6B)",
                marginBottom: 22,
              }}
            >
              {cat.blurb}
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {KIT_ENTRIES.filter((e) => e.category === cat.name).map((e) => (
                <li
                  key={e.slug}
                  style={{
                    borderTop: "1px solid var(--light, #E8E4DF)",
                    padding: "18px 0",
                  }}
                >
                  <Link
                    href={`/x/kit/${e.slug}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <span
                      style={{
                        fontFamily:
                          "var(--display, 'Playfair Display', Georgia, serif)",
                        fontSize: 19,
                        color: "var(--crimson, #8B1A1A)",
                      }}
                    >
                      {e.title} →
                    </span>
                    <span
                      style={{
                        display: "block",
                        fontFamily:
                          "var(--serif, 'Source Serif 4', Georgia, serif)",
                        fontSize: 15,
                        color: "var(--muted, #6B6B6B)",
                        marginTop: 4,
                      }}
                    >
                      {e.description}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
