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
    title: "What we ask of you.",
    bullets: [
      "Pass our partner vetting and sign the partnership agreement before any audience-facing work.",
      "Two named promotion sends to your audience, on agreed dates, using copy from the partner kit (or submitted for approval).",
      "Two-minute live-workshop intro using the supplied script. No pitching the offer; no discussing pricing on the live.",
      "Use the FTC disclosure language verbatim. Non-negotiable.",
      "Submit any ad-hoc paid placement or ephemeral content for pre-approval.",
      "Cooperate with the weekly reporting cadence. You receive a Friday report; you share promotion-side metrics within 24 hours of each send.",
    ],
  },
  {
    title: "What we do for you.",
    bullets: [
      "Build a partner-specific registration page with attribution baked in.",
      "Deliver one live workshop hosted by AESDR, plus a 72-hour replay window.",
      "Run the entire follow-up sequence — confirmation, reminders, optional SMS, same-day attendee, no-show replay, free-vs-structured objection, deadline-window, checkout-abandon — plus high-intent DM from Admissions where the signals warrant.",
      "Pay commission of 30% on net revenue, on a net-45 schedule from close of the attribution window.",
      "Send the weekly pilot report every Friday during the pilot window.",
      "Deliver the partner kit folder within 3 business days of signing.",
    ],
  },
  {
    title: "What you cannot ask for.",
    bullets: [
      "Discount codes for your audience. Never. Ever. AESDR does not run promotional pricing — buyers pay list price every time.",
      "Category exclusivity, first-right-of-refusal, or long-term lockouts.",
      "Access to the AESDR email list, or any list co-promotion.",
      "Founder appearance on demand. The founder is visible to you in the partner conversation but does not appear on audience-facing surfaces except for named-milestone events.",
      "List-share co-promotion in either direction.",
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
          Time-boxed. Non-exclusive. Workshop-first. Same pricing as everyone else gets.
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
            Pricing is list. Commission is 30% of net. No exceptions.
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
            Buyers see the same price every other AESDR buyer sees: <strong>$249 SDR</strong>, <strong>$299 AE</strong>, <strong>$1,499 Team</strong>. AESDR does not run promotional discounts, pilot codes, or partner-stack discounts. Partners earn commission off list price; that&rsquo;s the deal.
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
            At the end of the program, students unlock a second on-brand artifact for $40 from their dashboard. Within your 30-day attribution window, that $40 unlock counts toward your commission too.
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
        PS — &ldquo;Same pricing&rdquo; is the load-bearing line on this page. Most affiliate programs offer your audience a discount as their value prop to you. AESDR doesn&rsquo;t. Your value prop is the program itself.
      </CaveatLayer>
    </HubPage>
  );
}
