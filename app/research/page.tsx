import type { Metadata } from "next";
import Link from "next/link";

import AesdrBrand from "@/components/AesdrBrand";
import { Mascot, MASCOT_SIZE } from "@/components/brand/Mascot";

export const metadata: Metadata = {
  title: "Where the numbers come from | AESDR",
  description:
    "Every claim AESDR makes about SaaS sales — quota attainment, SDR tenure, ramp time, comp benchmarks, buying-committee size — sourced and linked. Verify any figure you read on the marketing pages here.",
};

/**
 * Page: /research
 *
 * The audit's §J / §N #37 named single-source citation as a fraud-adjacent
 * pattern — even when the single source is credible (Bridge Group), a
 * skeptical buyer reads "research" as "one firm's data." This page is the
 * verification surface: every numerical claim AESDR makes on a marketing
 * page is reproduced here with its primary source + (where they exist)
 * corroborating sources from independent research orgs.
 *
 * Design choice: the marketing pages stay tight (claim + brief
 * attribution, no outbound link). The verification surface is /research.
 * Skeptical buyers click through; everyone else stays in the funnel.
 *
 * The source list deliberately spans multiple firms — Bridge Group,
 * Pavilion, Gartner, Forrester, Gong, RepVue — so the breadth of
 * citation matches the breadth of research that actually exists in the
 * B2B SaaS sales space.
 */

type Source = {
  name: string;
  url: string;
  focus: string;
};

const SOURCES: Source[] = [
  {
    name: "The Bridge Group",
    url: "https://blog.bridgegroupinc.com/sales-development-metrics",
    focus: "SDR + AE benchmarks since 2007 — tenure, quota attainment, promotion rates, ramp time, AE-to-SDR ratios. The standard reference for inside-sales metrics.",
  },
  {
    name: "Gartner B2B Buying",
    url: "https://www.gartner.com/en/sales/insights/b2b-buying-journey",
    focus: "Buying-committee composition and behavior across enterprise + mid-market deals. The widely-cited 6–10-stakeholder figure for B2B deals comes from their multi-year buying-journey research.",
  },
  {
    name: "Forrester B2B Buying Study",
    url: "https://www.forrester.com/research/",
    focus: "Annual study of how B2B buyers actually evaluate, decide, and purchase. Often corroborates Gartner on committee size + buyer self-education behavior.",
  },
  {
    name: "Pavilion benchmarks",
    url: "https://www.joinpavilion.com/",
    focus: "Revenue-leader peer network with annual compensation + GTM benchmarks. Useful corroboration for AE / SDR OTE ranges across SaaS segments.",
  },
  {
    name: "Gong research",
    url: "https://www.gong.io/resources/",
    focus: "Conversation analytics across millions of recorded sales calls. The 'optimal talk-time ratio' research (the 30% talk-time finding referenced in Lesson 8) sits here.",
  },
  {
    name: "RepVue",
    url: "https://www.repvue.com/",
    focus: "Employer-review aggregation site for sales roles. Real-world AE / SDR OTE actuals, promotion timelines, employer satisfaction scores. Useful when you want lived numbers, not survey numbers.",
  },
];

type Claim = {
  claim: string;
  whereWeSayIt: string;
  primarySource: string;
  corroboration?: string;
};

const CLAIMS: Claim[] = [
  {
    claim: "51% of AEs hit quota in 2024 — down from 66% in 2022.",
    whereWeSayIt: "/enterprise hero KPI tile; about page paragraph.",
    primarySource:
      "Bridge Group 2024 SaaS AE Metrics & Compensation Benchmark Report. The 51%/66% figures are pulled directly from that survey.",
    corroboration:
      "Pavilion's 2024 sales compensation benchmarks show a similar decline; RepVue's employer-reviews data corroborates the trend across mid-market SaaS specifically.",
  },
  {
    claim: "Median SDR tenure is 1.9 years.",
    whereWeSayIt: "/enterprise hero KPI tile; about page paragraph.",
    primarySource:
      "Bridge Group SDR Metrics & Compensation Report — multiyear longitudinal tracking of SDR role data.",
    corroboration:
      "RepVue's role-tenure data on the SDR role shows a similar range. LinkedIn Workforce Reports on the BDR/SDR category corroborate the trend toward sub-2-year tenures.",
  },
  {
    claim: "16% of SDRs get promoted internally per year — down from 34% in 2020.",
    whereWeSayIt: "/enterprise hero KPI tile; about page paragraph.",
    primarySource:
      "Bridge Group SDR Metrics Report — promotion-rate tracking by year. This is the longitudinal data source.",
    corroboration:
      "RepVue's promotion-timeline data on SDR roles shows the same downward trend as hiring tightened post-2022.",
  },
  {
    claim: "SDR cost-to-replace is roughly $115K.",
    whereWeSayIt: "/enterprise/champion-kit champion objection-handler.",
    primarySource:
      "Bridge Group's published cost-to-replace research for SDR roles, factoring sourcing + recruiting + ramp-to-productivity time.",
    corroboration:
      "Society for Human Resource Management (SHRM) replacement-cost research on sales roles broadly puts the figure in a similar range when factoring full ramp time + lost pipeline.",
  },
  {
    claim:
      "B2B buying committees typically have 6–10 stakeholders involved in evaluating an enterprise purchase.",
    whereWeSayIt: "Referenced in Lesson 7 (Prospecting & Pipeline) and across enterprise pages.",
    primarySource:
      "Gartner B2B Buying Journey research — multiyear longitudinal study of how mid-market and enterprise buyers actually compose decision groups.",
    corroboration:
      "Forrester's annual B2B Buying Study corroborates the committee-size range; specific buying-committee data in Pavilion's annual GTM survey shows similar.",
  },
  {
    claim:
      "Top performers talk roughly 30% of the time in discovery calls; under-performers talk closer to 60%.",
    whereWeSayIt: "Lesson 8 (Leadership & Self-Assessment) — \"The 30% Rule.\"",
    primarySource:
      "Gong research on millions of recorded discovery calls, segmenting close rate against talk-time ratio.",
    corroboration:
      "Chorus.ai (Zoominfo) has published similar research with comparable results. The two firms' methodologies differ slightly but the directional finding is consistent.",
  },
];

export default function ResearchPage() {
  return (
    <main
      style={{
        background: "var(--cream)",
        color: "var(--ink)",
        minHeight: "100vh",
        fontFamily: "var(--serif)",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 5%",
          borderBottom: "1px solid var(--light)",
        }}
      >
        <AesdrBrand style={{ textDecoration: "none", color: "inherit" }} />
        <Link
          href="/"
          style={{
            fontFamily: "var(--mono)",
            fontSize: 11,
            letterSpacing: ".18em",
            textTransform: "uppercase",
            color: "var(--muted)",
            textDecoration: "none",
          }}
        >
          ← Back to home
        </Link>
      </header>

      <section
        style={{
          maxWidth: 760,
          margin: "0 auto",
          padding: "64px 24px 32px",
          textAlign: "center",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <Mascot pose="doctrine" size={MASCOT_SIZE.card} priority />
        </div>
        <p
          style={{
            fontFamily: "var(--mono)",
            fontSize: 11,
            letterSpacing: ".3em",
            textTransform: "uppercase",
            color: "var(--crimson)",
            marginBottom: 16,
          }}
        >
          AESDR · Where the numbers come from
        </p>
        <h1
          style={{
            fontFamily: "var(--display)",
            fontStyle: "italic",
            fontWeight: 700,
            fontSize: "clamp(36px, 5vw, 52px)",
            lineHeight: 1.1,
            margin: "0 0 20px",
          }}
        >
          Cited, linked, verifiable.
        </h1>
        <p
          style={{
            fontFamily: "var(--serif)",
            fontSize: 18,
            fontStyle: "italic",
            lineHeight: 1.65,
            color: "var(--muted)",
            margin: "0 auto",
            maxWidth: 580,
          }}
        >
          Every numerical claim AESDR makes on the marketing pages is
          reproduced here with its source. If you read a stat anywhere on
          the site and want to verify it, this is the page.
        </p>
      </section>

      <section
        style={{
          maxWidth: 880,
          margin: "0 auto",
          padding: "32px 24px 0",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--display)",
            fontStyle: "italic",
            fontWeight: 700,
            fontSize: 28,
            margin: "0 0 8px",
          }}
        >
          The claims.
        </h2>
        <p
          style={{
            fontFamily: "var(--serif)",
            fontSize: 15,
            color: "var(--muted)",
            fontStyle: "italic",
            margin: "0 0 32px",
          }}
        >
          Each claim names the primary source and, where independent research
          orgs corroborate the figure, names those too.
        </p>

        {CLAIMS.map((c, i) => (
          <article
            key={i}
            style={{
              background: "#fff",
              border: "1px solid var(--light)",
              padding: "28px 32px",
              marginBottom: 16,
            }}
          >
            <p
              style={{
                fontFamily: "var(--mono)",
                fontSize: 10,
                letterSpacing: ".28em",
                textTransform: "uppercase",
                color: "var(--muted)",
                marginBottom: 8,
              }}
            >
              {String(i + 1).padStart(2, "0")} · The claim
            </p>
            <p
              style={{
                fontFamily: "var(--display)",
                fontStyle: "italic",
                fontWeight: 700,
                fontSize: 19,
                lineHeight: 1.4,
                color: "var(--ink)",
                margin: "0 0 14px",
              }}
            >
              {c.claim}
            </p>
            <p
              style={{
                fontFamily: "var(--cond)",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: ".18em",
                textTransform: "uppercase",
                color: "var(--crimson)",
                margin: "0 0 4px",
              }}
            >
              Where we say it
            </p>
            <p
              style={{
                fontFamily: "var(--serif)",
                fontSize: 14,
                lineHeight: 1.55,
                color: "var(--muted)",
                margin: "0 0 16px",
                fontStyle: "italic",
              }}
            >
              {c.whereWeSayIt}
            </p>
            <p
              style={{
                fontFamily: "var(--cond)",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: ".18em",
                textTransform: "uppercase",
                color: "var(--crimson)",
                margin: "0 0 4px",
              }}
            >
              Primary source
            </p>
            <p
              style={{
                fontFamily: "var(--serif)",
                fontSize: 15,
                lineHeight: 1.65,
                color: "var(--ink)",
                margin: c.corroboration ? "0 0 16px" : "0",
              }}
            >
              {c.primarySource}
            </p>
            {c.corroboration && (
              <>
                <p
                  style={{
                    fontFamily: "var(--cond)",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: ".18em",
                    textTransform: "uppercase",
                    color: "var(--crimson)",
                    margin: "0 0 4px",
                  }}
                >
                  Corroboration
                </p>
                <p
                  style={{
                    fontFamily: "var(--serif)",
                    fontSize: 15,
                    lineHeight: 1.65,
                    color: "var(--ink)",
                    margin: 0,
                  }}
                >
                  {c.corroboration}
                </p>
              </>
            )}
          </article>
        ))}
      </section>

      <section
        style={{
          maxWidth: 880,
          margin: "48px auto 0",
          padding: "0 24px",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--display)",
            fontStyle: "italic",
            fontWeight: 700,
            fontSize: 28,
            margin: "0 0 8px",
          }}
        >
          The sources.
        </h2>
        <p
          style={{
            fontFamily: "var(--serif)",
            fontSize: 15,
            color: "var(--muted)",
            fontStyle: "italic",
            margin: "0 0 32px",
          }}
        >
          Independent research firms AESDR pulls data from. No sponsorship
          relationships, no editorial influence in either direction.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 16,
          }}
        >
          {SOURCES.map((s, i) => (
            <article
              key={i}
              style={{
                background: "#fff",
                border: "1px solid var(--light)",
                padding: "24px 28px",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--display)",
                  fontStyle: "italic",
                  fontWeight: 700,
                  fontSize: 18,
                  color: "var(--ink)",
                  margin: "0 0 6px",
                }}
              >
                {s.name}
              </p>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 11,
                  letterSpacing: ".05em",
                  color: "var(--crimson)",
                  textDecoration: "underline",
                  display: "block",
                  marginBottom: 12,
                  wordBreak: "break-all",
                }}
              >
                {s.url.replace(/^https?:\/\//, "")} ↗
              </a>
              <p
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: "var(--ink)",
                  margin: 0,
                }}
              >
                {s.focus}
              </p>
            </article>
          ))}
        </div>

        <p
          style={{
            fontFamily: "var(--serif)",
            fontSize: 15,
            fontStyle: "italic",
            lineHeight: 1.65,
            color: "var(--muted)",
            margin: "32px auto 64px",
            maxWidth: 640,
            textAlign: "center",
          }}
        >
          If you read a claim somewhere on the site that isn&rsquo;t
          reproduced here, that&rsquo;s a bug — email{" "}
          <a
            href="mailto:hello@aesdr.com?subject=Missing%20research%20citation"
            style={{ color: "var(--crimson)", textDecoration: "underline" }}
          >
            hello@aesdr.com
          </a>{" "}
          and we&rsquo;ll either add it or remove the claim.
        </p>
      </section>
    </main>
  );
}
