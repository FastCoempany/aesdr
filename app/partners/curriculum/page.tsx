/**
 * Page: /partners/curriculum
 * Spec: AESDR-PARTNER-HUB-SPEC.md §"Page 1.3"
 * Canon: §3.3 (voice ratio 80/20), §6.3 (canonical patterns), §14 (taglines v1.2)
 * Copy sources: D31 (full 12-card library catalog) + production /tools/[slug]
 * Five-question check: PASS
 */

import type { Metadata } from "next";
import { HubPage } from "@/components/partners/HubChrome";
import { MonoEyebrow, HubCTA, CaveatLayer } from "@/components/partners/HubElements";
import {
  CatalogTeaserGrid,
  CATALOG_CARDS,
  ToolStrip,
} from "@/components/partners/CatalogTeaserGrid";

export const metadata: Metadata = {
  title: "Curriculum · AESDR Partners",
  description:
    "Twelve courses. Thirty-six lessons. Real questions on each card. The library catalog your audience would be enrolling into.",
};

export default function CurriculumPage() {
  return (
    <HubPage>
      <div style={{ padding: "64px 24px 0" }}>
        <MonoEyebrow>AESDR · WHAT YOUR AUDIENCE WOULD BE LEARNING</MonoEyebrow>
        <h1
          style={{
            fontFamily: "var(--display)",
            fontStyle: "italic",
            fontWeight: 700,
            fontSize: "clamp(36px, 5vw, 48px)",
            color: "var(--ink)",
            textAlign: "center",
            lineHeight: 1.15,
            marginBottom: 24,
            maxWidth: 880,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Twelve courses. Real questions on each card.
        </h1>
        <p
          style={{
            fontFamily: "var(--serif)",
            fontStyle: "italic",
            fontSize: 18,
            color: "var(--muted)",
            textAlign: "center",
            lineHeight: 1.7,
            marginBottom: 16,
            maxWidth: 720,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          This is what your audience enrolls into. It is what we will spend 60 minutes teasing — not teaching — at the workshop. The lessons are where the work is.
        </p>
        <p
          style={{
            fontFamily: "var(--mono)",
            fontSize: 11,
            color: "var(--muted)",
            textAlign: "center",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          12 courses · 36 lessons · ~144 sections · 12 lessons. 5 tools. 1 new you.
        </p>
      </div>

      <CatalogTeaserGrid cards={CATALOG_CARDS} columns={4} />

      <CaveatLayer>
        36 lessons total. Three sub-units per course. Role-conditional content on every lesson.
      </CaveatLayer>

      <ToolStrip />

      {/* Closing block — what curriculum is not + end-of-course artifacts */}
      <section
        style={{
          maxWidth: 720,
          margin: "96px auto 0",
          padding: "0 24px",
        }}
      >
        <div
          style={{
            background: "#fff",
            border: "1px solid var(--light)",
            padding: "40px 32px",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              fontFamily: "var(--cond)",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "var(--muted)",
              marginBottom: 24,
            }}
          >
            WHAT THIS CURRICULUM IS NOT
          </div>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {[
              "Not a sales-introduction course. AESDR assumes the seat is already yours.",
              "Not a sales-leadership curriculum. The arc is SDR → AE → first-year AE; manager content is partial, not the spine.",
              "Not industry-specific. Calibrated for early-career SaaS sales generally; not vertical-specific tactics.",
              "Not a credential program. No certificate, no badge, no hiring-weight credential. Honest answer per FAQ Q08.",
              "Not a coaching program. No live cohort sessions, no 1:1 calls, no scheduled office hours. Self-paced + asynchronous Untamed community.",
              "Not sanitized. Lessons titled \"Quotas Are Bullshit\" and \"Why SDRs Should Stay Single\" are not metaphor or marketing — they're the lesson titles. Unconventional in tone, conventional in shape.",
            ].map((b, i) => (
              <li
                key={i}
                style={{
                  fontFamily: "var(--serif)",
                  fontStyle: "italic",
                  fontSize: 16,
                  color: "var(--ink)",
                  lineHeight: 1.7,
                  paddingLeft: 18,
                  textIndent: -18,
                  marginBottom: 12,
                }}
              >
                — {b}
              </li>
            ))}
          </ul>
        </div>

        <div
          style={{
            background: "#fff",
            border: "1px solid var(--light)",
            padding: "40px 32px",
          }}
        >
          <div
            style={{
              fontFamily: "var(--cond)",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "var(--muted)",
              marginBottom: 24,
            }}
          >
            AT THE END OF THE CATALOG
          </div>
          <p
            style={{
              fontFamily: "var(--serif)",
              fontSize: 17,
              color: "var(--ink)",
              lineHeight: 1.7,
            }}
          >
            Two end-of-course artifacts. <strong>The Programme</strong> (a theatrical playbill self-portrait) and <strong>The Manuscript</strong> (an editorial manuscript-with-edits). Students pick one free at <code style={{ fontFamily: "var(--mono)", fontSize: 14 }}>/reveal</code>. The other unlocks for $40 from the dashboard at any time. Both are real, both are gated, both are part of the program shape.
          </p>
        </div>
      </section>

      <div style={{ padding: "96px 24px 0" }}>
        <HubCTA href="/partners/apply">Request a partner conversation →</HubCTA>
      </div>
    </HubPage>
  );
}
