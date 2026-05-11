/**
 * Component: CatalogTeaserGrid + ToolStrip
 * Spec: AESDR-PARTNER-HUB-SPEC.md §"Page 1.1" item 5, §"Page 1.3"
 * Canon: §6.3 (white-panel-on-cream pattern), §3.2 (Caveat = Michael only)
 * Copy sources: docs/partner/D31-curriculum-map.md (catalog cards verbatim);
 *               app/syllabus/page.tsx (call numbers, questions, annotations, stamps)
 * Five-question check: PASS
 */

import Link from "next/link";

export type CatalogCard = {
  callNumber: string;
  title: string;
  stylized?: boolean;
  question: string;
  annotation: string;
  stamp: string;
};

// All 12 cards lifted verbatim from D31 + app/syllabus/page.tsx.
// Per canon v1.2 + Q2 ratification: lessons → courses; call numbers
// retain L01-L12 to match production syllabus until that surface is
// updated separately.
export const CATALOG_CARDS: CatalogCard[] = [
  {
    callNumber: "658.85 / L01",
    title: "Building Real Camaraderie",
    question: "When's the last time your team felt like an actual team?",
    annotation: "— keep. read twice.",
    stamp: "Mon 01",
  },
  {
    callNumber: "658.85 / L02",
    title: "Breaking Down Silos",
    question: "How many deals died in the handoff you never talked about?",
    annotation: "— cc: solutions eng.",
    stamp: "Tue 02",
  },
  {
    callNumber: "658.85 / L03",
    title: "Performance Pitfalls",
    question: "Are you getting better — or just getting by?",
    annotation: "— mirror test.",
    stamp: "Wed 03",
  },
  {
    callNumber: "658.85 / L04",
    title: "Navigating Manager Madness",
    question:
      "Does your manager coach you… or just count your calls and faults?",
    annotation: "— send to Todd.",
    stamp: "Thu 04",
  },
  {
    callNumber: "658.85 / L05",
    title: "tHe SaLeS pLaYbOoK",
    stylized: true,
    question: "What's your system? And if you don't have one — what have you been doing?",
    annotation: "— LinkedIn isn't one.",
    stamp: "Fri 05",
  },
  {
    callNumber: "658.85 / L06",
    title: "bEyOnD tHe SaLeS pLaYbOoK",
    stylized: true,
    question: "What do you do when the script runs out and you're live?",
    annotation: "— improvise w/ intent.",
    stamp: "Sat 06",
  },
  {
    callNumber: "658.85 / L07",
    title: "Prospecting & Pipeline",
    question: "If inbound dried up tomorrow, would you survive?",
    annotation: "— build outbound muscle.",
    stamp: "Sun 07",
  },
  {
    callNumber: "658.85 / L08",
    title: "The 30% Rule",
    question: "What's your actual close rate? Not the one you told your VP.",
    annotation: "— do the math honestly.",
    stamp: "Mon 08",
  },
  {
    callNumber: "658.85 / L09",
    title: "CRM Survival Guide",
    question: "Is your CRM protecting you — or building the case against you?",
    annotation: "— log before you forget.",
    stamp: "Tue 09",
  },
  {
    callNumber: "658.85 / L10",
    title: "Breaking Down the Commission Myth",
    question: "Can you survive three bad months in a row? Mentally? Financially?",
    annotation: "— 3 months runway min.",
    stamp: "Wed 10",
  },
  {
    callNumber: "658.85 / L11",
    title: "Sober Selling",
    question:
      "What if the problem is bigger than your process — what if it's what you're doing when no one's watching?",
    annotation: "— 21+. not metaphor.",
    stamp: "Thu 11",
  },
  {
    callNumber: "658.85 / L12",
    title: "Leveling Up SaaS Relationships",
    question: "Who would vouch for you if you changed companies tomorrow?",
    annotation: "— name 5.",
    stamp: "Fri 12",
  },
];

// Cards selected for the 4-of-12 teaser per spec §"Page 1.1" item 5
// + §"Page 1.3" 4-of-12 grid: spans the curriculum's tonal range —
// close-rate honesty (L08), financial reality (L10), the alcohol
// question (L11), the relationships question (L12).
export const TEASER_CALL_NUMBERS = [
  "658.85 / L08",
  "658.85 / L10",
  "658.85 / L11",
  "658.85 / L12",
];

export function CatalogTeaserGrid({
  cards,
  columns = 2,
}: {
  cards: CatalogCard[];
  columns?: 2 | 4;
}) {
  return (
    <section
      style={{
        maxWidth: columns === 2 ? 1080 : 1200,
        margin: "0 auto",
        padding: "96px 24px 0",
      }}
    >
      <div
        style={{
          fontFamily: "var(--mono)",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          color: "var(--muted)",
          textAlign: "center",
          marginBottom: 24,
        }}
      >
        Card Catalog · Shelf 12 · Drawer A · Est. 2026
      </div>
      <h2
        style={{
          fontFamily: "var(--display)",
          fontStyle: "italic",
          fontWeight: 700,
          fontSize: 32,
          color: "var(--ink)",
          marginBottom: 32,
          textAlign: "center",
        }}
      >
        Twelve courses. Real questions on each card.
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: columns === 2 ? "1fr 1fr" : "1fr 1fr 1fr 1fr",
          gap: 20,
        }}
        className={columns === 2 ? "aesdr-cat-2" : "aesdr-cat-4"}
      >
        {cards.map((c) => (
          <article
            key={c.callNumber}
            style={{
              padding: 28,
              background: "#fff",
              border: "1px solid var(--light)",
              position: "relative",
            }}
          >
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: 12,
                color: "var(--muted)",
                marginBottom: 8,
              }}
            >
              {c.callNumber}
            </div>
            <h3
              style={{
                fontFamily: "var(--display)",
                fontStyle: "italic",
                fontWeight: 700,
                fontSize: 22,
                color: "var(--ink)",
                marginBottom: 12,
              }}
            >
              {c.title}
            </h3>
            <p
              style={{
                fontFamily: "var(--display)",
                fontStyle: "italic",
                fontSize: 17,
                color: "var(--ink)",
                lineHeight: 1.4,
                marginBottom: 14,
              }}
            >
              &ldquo;{c.question}&rdquo;
            </p>
            <p
              style={{
                fontFamily: "var(--hand)",
                fontSize: 20,
                color: "var(--crimson)",
                transform: "rotate(-1deg)",
                marginTop: 14,
                lineHeight: 1,
              }}
            >
              {c.annotation}
            </p>
            <div
              style={{
                position: "absolute",
                top: 24,
                right: 24,
                fontFamily: "var(--mono)",
                fontSize: 10,
                letterSpacing: "0.1em",
                color: "var(--ink)",
                padding: "3px 7px",
                border: "1px solid var(--ink)",
                textTransform: "uppercase",
              }}
            >
              {c.stamp}
            </div>
          </article>
        ))}
      </div>
      <div
        style={{
          textAlign: "center",
          marginTop: 32,
          fontFamily: "var(--mono)",
          fontSize: 13,
          color: "var(--muted)",
          letterSpacing: "0.05em",
        }}
      >
        {cards.length} of 12 courses shown · 36 lessons total · check one out
      </div>
    </section>
  );
}

// The 5 takeaway tools — production-live at /tools/[slug]
export const TOOLS = [
  {
    slug: "3.3-aesdr-alignment-contract",
    name: "The SLA Builder",
    tagline: "AE-SDR alignment, written down.",
  },
  {
    slug: "6.3-idk-framework",
    name: "The “I Don’t Know” Framework",
    tagline: "What to say when the script runs out.",
  },
  {
    slug: "9.2-time-reclaimed-calculator",
    name: "Time Reclaimed Calculator",
    tagline: "Slack as productivity theater. Quantified.",
  },
  {
    slug: "10.1-ROI-commission-defense-tracker",
    name: "Commission Defense Tracker",
    tagline: "OTE is a fantasy until you read the comp plan.",
  },
  {
    slug: "12.3-72-hr-strike-plan",
    name: "The 72-Hour Strike Plan",
    tagline: "When ramp is wrong and the next 72 hours matter.",
  },
];

export function ToolStrip({
  eyebrow = "The five tools that ship with enrollment",
}: {
  eyebrow?: string;
}) {
  return (
    <section
      style={{
        maxWidth: 1280,
        margin: "0 auto",
        padding: "96px 24px 0",
      }}
    >
      <div
        style={{
          fontFamily: "var(--mono)",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "var(--muted)",
          textAlign: "center",
          marginBottom: 24,
        }}
      >
        {eyebrow}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 16,
        }}
        className="aesdr-tools"
      >
        {TOOLS.map((t, i) => (
          <Link
            key={t.slug}
            href={`/tools/${t.slug}`}
            style={{
              padding: 24,
              background: "#fff",
              border: "1px solid var(--light)",
              textDecoration: "none",
              color: "inherit",
              display: "block",
              transition: "border-color 0.2s",
            }}
            aria-label={`Open ${t.name}`}
          >
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: 10,
                color: "var(--muted)",
                marginBottom: 12,
                letterSpacing: "0.1em",
              }}
            >
              0{i + 1}
            </div>
            <h4
              style={{
                fontFamily: "var(--display)",
                fontStyle: "italic",
                fontWeight: 700,
                fontSize: 18,
                color: "var(--ink)",
                marginBottom: 10,
                lineHeight: 1.25,
              }}
            >
              {t.name}
            </h4>
            <p
              style={{
                fontFamily: "var(--serif)",
                fontStyle: "italic",
                fontSize: 13,
                color: "var(--muted)",
                lineHeight: 1.5,
              }}
            >
              {t.tagline}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
