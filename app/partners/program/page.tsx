/**
 * Page: /partners/program
 * Spec: AESDR-PARTNER-HUB-SPEC.md §"Page 1.2"
 * Canon: §1.3 (a handful of partners, not a marketplace), §3.3 (voice ratio 90/10),
 *        §10.1 (FTC), §13 (honesty discipline)
 * Copy sources: D40 README §2/§3/§4, D22 §3/§4/§5, D28 §2 (sanitized for never-discount)
 * Five-question check: PASS
 */

import type { Metadata } from "next";
import { HubPage } from "@/components/partners/HubChrome";
import { MonoEyebrow, HubCTA, CaveatLayer } from "@/components/partners/HubElements";

export const metadata: Metadata = {
  title: "Partner Program · AESDR",
  description:
    "Time-boxed. Non-exclusive. Workshop-first. Same pricing as everyone else gets. Commission is 30% of net.",
};

const SECTIONS = [
  {
    title: "What you'll be doing.",
    bullets: [
      "Signing the partnership agreement before you start promoting. We'll send it within 5 business days of approval.",
      "Sending two emails to your list, on dates we agree on together. We'll write the copy — you can rework it in your voice and send drafts back if you want eyes on it.",
      "Introducing the live workshop for about two minutes, using a short script we'll send you. We handle the pricing talk after.",
      "Including the standard FTC affiliate disclosure on every promotion — the one-line \"I earn a commission if you sign up\" note. Legal thing, not a brand thing.",
      "Running any paid placements, sponsored posts, or stories past us first. Usually a 48-hour turnaround.",
      "Sharing your open and click rate within a day of each email send. We share everything we're seeing on our side — clicks, signups, revenue, projected commission — every Friday.",
    ],
  },
  {
    title: "What we'll be doing.",
    bullets: [
      "Building a registration page just for your audience with tracking baked in. URL ready within 24 hours of signing.",
      "Running the live 60-minute workshop. We host, present, and handle Q&A. Replay stays live for 72 hours.",
      "Handling every email after registration — confirmations, reminders, replay link, the follow-ups, the soft DMs to people who clicked but didn't enroll. You don't lift a finger after the workshop ends.",
      "Paying 30% commission on net revenue. Net-45 from the close of the 30-day attribution window. ACH, Wise, or PayPal — your pick.",
      "Sending you a one-page Friday report every Friday during the pilot. Same numbers we're looking at. No surprises at the close.",
      "Cohort 1 partners we invite directly: a $500 sign-on bonus paid on agreement signing. Small money, real money — the point is skin in the game from day one.",
    ],
  },
  {
    title: "What we can't do.",
    bullets: [
      "Discount codes for your audience. We charge the same price to everyone — $249, $299, $1,499. The commission still works at list, and the trust does too.",
      "Category exclusivity or first-right-of-refusal. We may run pilots with similar partners; you're free to do the same.",
      "Share the AESDR email list, in either direction. Your audience belongs to you, ours to us.",
      "A founder appearance at the workshop itself. The host runs the workshop. The founder builds the curriculum and is around for everything else — emails, prep calls, post-pilot debriefs.",
    ],
  },
];

export default function ProgramPage() {
  return (
    <HubPage>
      <div style={{ padding: "64px 24px 0" }}>
        <MonoEyebrow>AESDR · PARTNER PROGRAM · STRUCTURE</MonoEyebrow>
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
          What the partnership actually is.
        </h1>
        <p
          style={{
            fontFamily: "var(--serif)",
            fontStyle: "italic",
            fontSize: 19,
            color: "var(--muted)",
            textAlign: "center",
            lineHeight: 1.6,
            marginBottom: 64,
            maxWidth: 720,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          What you&rsquo;ll be doing. What we&rsquo;ll be doing. What we can&rsquo;t do.
        </p>
      </div>

      <section
        style={{
          maxWidth: 920,
          margin: "0 auto",
          padding: "0 24px",
        }}
      >
        {SECTIONS.map((s, i) => (
          <article
            key={i}
            style={{
              background: "#fff",
              border: "1px solid var(--light)",
              padding: "40px 36px",
              marginBottom: 24,
            }}
          >
            <h2
              style={{
                fontFamily: "var(--display)",
                fontStyle: "italic",
                fontWeight: 700,
                fontSize: 28,
                color: "var(--ink)",
                marginBottom: 24,
              }}
            >
              {s.title}
            </h2>
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {s.bullets.map((b, j) => (
                <li
                  key={j}
                  style={{
                    fontFamily: "var(--serif)",
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
          </article>
        ))}
      </section>

      {/* Pricing & commission */}
      <section
        style={{
          maxWidth: 920,
          margin: "64px auto 0",
          padding: "0 24px",
        }}
      >
        <article
          style={{
            background: "var(--crimson)",
            color: "#fff",
            padding: "48px 40px",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--display)",
              fontStyle: "italic",
              fontWeight: 700,
              fontSize: 32,
              marginBottom: 16,
            }}
          >
            One price for everyone. 30% to you.
          </h2>
          <p
            style={{
              fontFamily: "var(--serif)",
              fontSize: 17,
              lineHeight: 1.7,
              color: "rgba(255,255,255,0.9)",
              marginBottom: 16,
            }}
          >
            Your audience pays the same price every other AESDR buyer pays: <strong>$249 SDR</strong>, <strong>$299 AE</strong>, <strong>$1,499 for a 10-seat team</strong>. No partner codes, no discount stacking, no pilot pricing. Your commission is 30% of net revenue on every sale you bring in, every time.
          </p>
          <p
            style={{
              fontFamily: "var(--serif)",
              fontStyle: "italic",
              fontSize: 16,
              lineHeight: 1.7,
              color: "rgba(255,255,255,0.85)",
            }}
          >
            At the end of the program, students can unlock a second end-of-course artifact for $40 from their dashboard. If they do that within your 30-day attribution window, it counts toward your commission too.
          </p>
        </article>
      </section>

      <div style={{ padding: "96px 24px 0" }}>
        <HubCTA
          href="/partners/apply"
          trail="we send the partnership agreement within 5 business days."
        >
          Request the partnership agreement →
        </HubCTA>
      </div>

      <CaveatLayer>
        PS &mdash; Same pricing is intentional. The reason your audience trusts you is that you sound like yourself. If we let you offer them a discount they couldn&rsquo;t get elsewhere, the recommendation starts feeling transactional. We&rsquo;d rather your audience see you recommending something you&rsquo;d recommend anyway.
      </CaveatLayer>
    </HubPage>
  );
}
