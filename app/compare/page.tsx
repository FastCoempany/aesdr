import type { Metadata } from "next";
import Link from "next/link";

import AesdrBrand from "@/components/AesdrBrand";
import { Mascot, MASCOT_SIZE } from "@/components/brand/Mascot";

export const metadata: Metadata = {
  title: "How AESDR compares | AESDR",
  description:
    "Where AESDR sits next to Sales Assembly, Bravado, Aspireship, Sales Hacker, and the rest. Honest about what each one does well and what we do differently.",
};

/**
 * Page: /compare
 *
 * The audit's §J / §N #37 named the competitive landscape as a gap —
 * every buyer asks "how is this different from X?" early in evaluation,
 * and the landing page answered obliquely instead of by name. This page
 * names the five categories of alternatives that come up most, names
 * a few specific products in each, and writes the difference honestly.
 *
 * Editorial register applies: name what each one does well, name what
 * we do differently, end on the "if you want X, that one; if you want
 * Y, this one" frame so the buyer can self-route.
 *
 * The page does NOT trash competitors — they're each good at something.
 * The point is to make the differentiation specific enough that a buyer
 * who's already in another product knows whether to also buy AESDR.
 */

type Category = {
  eyebrow: string;
  headline: string;
  examples: string;
  theyDoWell: string;
  weDoDifferently: string;
  routing: string;
};

const CATEGORIES: Category[] = [
  {
    eyebrow: "Senior peer networks",
    headline: "If the room is what you're after — that's a different product.",
    examples: "Sales Assembly · Pavilion · Modern Sales Pros",
    theyDoWell:
      "Senior-AE and revenue-leader peer networks are excellent for what they are. The room is the value. You pay $3K–$5K/year for access to other senior operators who've actually carried bags, the Slack you can post a real question in at 11pm, the off-record conversations that happen in person twice a year. The network compounds — five years in, you have a thousand named people you can text.",
    weDoDifferently:
      "AESDR is a written operating manual you re-read in year three when the comp plan changes. It's a curriculum, not a peer network. The Discord exists but it's a supplement to the lessons, not the product. One-time purchase from $249, not annual membership. And the audience is AEs and SDRs in their first 18 months, not VPs running a region.",
    routing:
      "If you're already on a senior peer network and want the network, stay there. If you want a structured framework you can hand to a new SDR on Monday morning, this one.",
  },
  {
    eyebrow: "Peer Q&A communities",
    headline: "If you want the random thread — that's a different product.",
    examples: "Bravado · the War Room · r/sales",
    theyDoWell:
      "Peer Q&A communities are good for the moment you have a specific question — a discovery call going sideways, a comp letter you don't understand, a manager move you can't read. You post anonymously, three people who've been there answer in plain language within an hour. The signal-to-noise is high if you're willing to scroll.",
    weDoDifferently:
      "AESDR is structured. Lesson 8 is the 30% rule. Lesson 10 is the comp-plan teardown. Lesson 12 is the relationship graph. You don't have to phrase your problem correctly to find the answer — the curriculum sequences it for you. Plus role-conditional content (AE vs. SDR forks across 18 of the 36 sub-lessons), which a crowd-answered community can't deliver.",
    routing:
      "If you want the random thread for the live problem, those work. If you want the framework you can use across the next 18 months, this one.",
  },
  {
    eyebrow: "Pre-role bootcamps",
    headline: "If you're trying to break into sales — wrong audience.",
    examples: "Aspireship · Uvaro · Victory Lap · Vendition",
    theyDoWell:
      "Pre-role bootcamps are good at one specific thing: turning a person without a sales job into a person with one. They place you, they coach you through the first ramp, sometimes they share in your first-year commission. The model works because the buyer is committed to a career change.",
    weDoDifferently:
      "AESDR assumes the seat is already yours. The first lesson is about structuring your day-1 in role, not interviewing for one. If you're three months into your first SDR job, AESDR is the next thing; if you're three months from your first SDR interview, a bootcamp is the next thing.",
    routing:
      "If you're trying to land the seat, take a bootcamp. If you've landed it and the ramp is harder than anyone warned you about, this one.",
  },
  {
    eyebrow: "Free educational content",
    headline: "If free reading is enough — be honest about whether it's been working.",
    examples: "Sales Hacker · RepVue Academy · LinkedIn posts · YouTube",
    theyDoWell:
      "Free sales content is genuinely good now. Sales Hacker has a deep archive. RepVue Academy is professionally produced. Any of these will give you a hundred useful posts on prospecting, discovery, negotiation, comp. If you're a disciplined self-learner who reads one substantive article per week and applies it, you don't need to buy a course.",
    weDoDifferently:
      "Three differences. First — structure. AESDR sequences the material so what you learn in Lesson 3 sets up what compounds in Lesson 7. A reading list doesn't do that. Second — vendor independence. The free educational content is sponsored by tools (RepVue is funded by ZoomInfo-adjacent advertisers, Sales Hacker is owned by Outreach), so the tools lessons are quietly compromised. AESDR is one-time-purchase from buyers; no vendor has copy approval. Third — the artifacts. You don't take a Sales Hacker post into your 1:1 with a bad manager next week. You take the AE/SDR Alignment Contract.",
    routing:
      "If you've been reading free content for a year and it hasn't compounded, the gap is structure. That's what we sell.",
  },
  {
    eyebrow: "Employer LMS training",
    headline: "If your company already gives you one — also use this.",
    examples: "MindTickle · Lessonly · Highspot · in-house onboarding",
    theyDoWell:
      "Employer LMS training is product-specific and role-specific to your company. It teaches you how to demo YOUR product, qualify for YOUR ICP, work in YOUR CRM configuration. That's not what a generic curriculum can do. If your company has good enablement, it's an asset.",
    weDoDifferently:
      "AESDR teaches the part of the job that doesn't change when you change companies. Manager archetypes, comp-plan math, the survival patterns for a bad quarter, the relationships that pay off five years out — none of which your employer's LMS covers, because it's not the LMS's job. AESDR is portable; the LMS isn't.",
    routing:
      "If your company gives you good enablement, take it. AESDR is what you do alongside it — not instead of it.",
  },
];

export default function ComparePage() {
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
          <Mascot pose="diagnosis" size={MASCOT_SIZE.card} priority />
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
          AESDR · How it compares
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
          Five things that aren&rsquo;t AESDR.
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
          Every buyer asks &ldquo;how is this different from X?&rdquo; early. Naming each
          alternative respectfully is cheaper than letting you guess.
        </p>
      </section>

      <section
        style={{
          maxWidth: 880,
          margin: "0 auto",
          padding: "32px 24px 64px",
        }}
      >
        {CATEGORIES.map((c, i) => (
          <article
            key={i}
            style={{
              background: "#fff",
              border: "1px solid var(--light)",
              padding: "36px 40px",
              marginBottom: 24,
            }}
          >
            <p
              style={{
                fontFamily: "var(--mono)",
                fontSize: 10,
                letterSpacing: ".28em",
                textTransform: "uppercase",
                color: "var(--muted)",
                marginBottom: 10,
              }}
            >
              {String(i + 1).padStart(2, "0")} · {c.eyebrow}
            </p>
            <h2
              style={{
                fontFamily: "var(--display)",
                fontStyle: "italic",
                fontWeight: 700,
                fontSize: "clamp(22px, 3vw, 28px)",
                lineHeight: 1.25,
                color: "var(--ink)",
                margin: "0 0 8px",
              }}
            >
              {c.headline}
            </h2>
            <p
              style={{
                fontFamily: "var(--mono)",
                fontSize: 12,
                letterSpacing: ".05em",
                color: "var(--crimson)",
                margin: "0 0 24px",
              }}
            >
              e.g. {c.examples}
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
                gap: 32,
                marginBottom: 24,
              }}
            >
              <div>
                <p
                  style={{
                    fontFamily: "var(--cond)",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: ".18em",
                    textTransform: "uppercase",
                    color: "var(--muted)",
                    margin: "0 0 10px",
                  }}
                >
                  What they do well
                </p>
                <p
                  style={{
                    fontFamily: "var(--serif)",
                    fontSize: 15,
                    lineHeight: 1.7,
                    color: "var(--ink)",
                    margin: 0,
                  }}
                >
                  {c.theyDoWell}
                </p>
              </div>
              <div>
                <p
                  style={{
                    fontFamily: "var(--cond)",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: ".18em",
                    textTransform: "uppercase",
                    color: "var(--crimson)",
                    margin: "0 0 10px",
                  }}
                >
                  What we do differently
                </p>
                <p
                  style={{
                    fontFamily: "var(--serif)",
                    fontSize: 15,
                    lineHeight: 1.7,
                    color: "var(--ink)",
                    margin: 0,
                  }}
                >
                  {c.weDoDifferently}
                </p>
              </div>
            </div>

            <p
              style={{
                fontFamily: "var(--serif)",
                fontStyle: "italic",
                fontSize: 16,
                lineHeight: 1.6,
                color: "var(--ink)",
                paddingTop: 20,
                borderTop: "1px solid var(--light)",
                margin: 0,
              }}
            >
              <span
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 10,
                  fontStyle: "normal",
                  letterSpacing: ".22em",
                  textTransform: "uppercase",
                  color: "var(--muted)",
                  marginRight: 10,
                }}
              >
                The frame
              </span>
              {c.routing}
            </p>
          </article>
        ))}

        <div
          style={{
            background: "var(--ink)",
            color: "var(--cream)",
            padding: "36px 40px",
            marginTop: 24,
            textAlign: "center",
          }}
          data-surface="dark"
        >
          <p
            style={{
              fontFamily: "var(--mono)",
              fontSize: 10,
              letterSpacing: ".32em",
              textTransform: "uppercase",
              color: "rgba(250,247,242,0.65)",
              marginBottom: 12,
            }}
          >
            One more thing
          </p>
          <p
            style={{
              fontFamily: "var(--display)",
              fontStyle: "italic",
              fontWeight: 700,
              fontSize: "clamp(22px, 3vw, 28px)",
              lineHeight: 1.3,
              margin: "0 0 16px",
            }}
          >
            None of these are bad. Some of them are excellent.
          </p>
          <p
            style={{
              fontFamily: "var(--serif)",
              fontSize: 16,
              lineHeight: 1.7,
              color: "rgba(250,247,242,0.88)",
              margin: "0 auto 24px",
              maxWidth: 560,
            }}
          >
            The reason AESDR exists isn&rsquo;t that the alternatives are broken. It&rsquo;s
            that none of them sit at this specific intersection — written
            operating manual, role-forked between AE and SDR, anti-guru register,
            one-time purchase you don&rsquo;t renew. If that&rsquo;s the thing missing from
            your shelf, this is it.
          </p>
          <Link
            href="/#pricing"
            style={{
              display: "inline-block",
              fontFamily: "var(--cond)",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: ".22em",
              textTransform: "uppercase",
              color: "var(--ink)",
              background: "var(--cream)",
              padding: "14px 32px",
              textDecoration: "none",
            }}
          >
            See the pricing →
          </Link>
        </div>
      </section>
    </main>
  );
}
