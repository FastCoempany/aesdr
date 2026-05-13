/**
 * Page: /partners/who-we-dont-work-with (PROMOTED to Phase 1 per Q5 ratification 2026-05-04)
 * Spec: AESDR-PARTNER-HUB-SPEC.md §"Phase 3 — /partners/who-we-don't-work-with" (promoted)
 * Canon: §1.4 (borrowed-trust merciless mirror), §1.6 (honesty differentiator),
 *        §13 (honesty discipline)
 * Copy sources: D27 partner vetting scorecard §"Red-flag list" — sanitized
 *               for partner-facing register.
 * Five-question check: PASS
 *
 * Per build-prompt §[8] item 7: "The disqualification panel placement is the
 * most-impactful single decision. Most affiliate hubs hide who shouldn't apply.
 * AESDR's hub puts it at hero-equal hierarchy — and as a dedicated page."
 */

import type { Metadata } from "next";
import { HubPage } from "@/components/partners/HubChrome";
import { MonoEyebrow, HubCTA, CaveatLayer } from "@/components/partners/HubElements";

export const metadata: Metadata = {
  title: "Who We Don't Work With · AESDR Partners",
  description:
    "Plain disqualification. We name who we decline, why, and on what signal.",
};

const RED_FLAGS = [
  {
    headline: "Primary distribution is rise-and-grind energy.",
    body: "If the bulk of your published content is hustle culture, motivational LinkedIn carousels, or 'crush it' / 'unleash your potential' register, AESDR is not a fit. The brand actively counter-positions against that voice. One pilot's worth of audience-mismatch costs both sides more than declining the conversation early.",
  },
  {
    headline: "Banned-vocab violations in your existing content.",
    body: "AESDR will not associate with these words — \"crush,\" \"game-changer,\" \"unlock,\" \"mindset,\" \"thought leader,\" \"lead with value,\" \"synergy,\" \"empower,\" \"rockstar,\" \"ninja,\" \"rise and grind,\" generic hype emojis. Sample 10 of your last posts; if 3+ feature these terms, the audience-fit signal is too weak.",
  },
  {
    headline: "Disclosure resistance.",
    body: "AESDR requires verbatim FTC material-connection disclosure on every partner-published surface. If you decline to use the disclosure language, the pilot ends — that's a contract term, not a negotiation. Saying so up front saves the conversation.",
  },
  {
    headline: "Category-exclusivity ask.",
    body: "AESDR pilots are non-exclusive in both directions. We may run pilots with comparable third parties; you may run pilots with comparable course-creators. Demanding lockout is a fit-signal red flag.",
  },
  {
    headline: "Discount-stacking authority ask.",
    body: "AESDR does not run promotional discounts. Ever. Asking for a partner-issued promo code, an audience-specific discount, or pricing-variance authority is something we won't accommodate.",
  },
  {
    headline: "Mostly bot engagement.",
    body: "If we sample 10 recent replies on your content and most of them are obvious bot accounts, the audience-quality signal won't hold up at workshop time. The workshop is a live event with live engagement; if the audience can't actually show up and ask questions, neither side comes out well.",
  },
  {
    headline: "Pre-role audience.",
    body: "If your audience is people trying to break into sales, AESDR is not a fit — the curriculum assumes the seat is already theirs. We'd rather decline than enroll buyers the program isn't built for.",
  },
  {
    headline: "Past compliance issue.",
    body: "Verified prior FTC, advertising-standards, or consumer-protection issues. We don't run pilots with partners with active compliance shadows over them. Resolved historical issues are case-by-case.",
  },
  {
    headline: "Recurring founder appearances as the pitch.",
    body: "The host runs the workshops, not the founder. If your partnership model relies on a recurring founder presence — joint webinars, podcast circuits, panel keynotes — that's not what we do. Rare exceptions exist for milestone events; they're not the default.",
  },
  {
    headline: "List co-promotion ask.",
    body: "AESDR does not share its email list, ever — and doesn't request yours. Co-promotion-via-list is not part of any AESDR partner agreement. Asking is a fit signal.",
  },
];

export default function WhoWeDontWorkWithPage() {
  return (
    <HubPage>
      <div style={{ padding: "64px 24px 0" }}>
        <MonoEyebrow>AESDR · PARTNERS · HONEST DISQUALIFICATION</MonoEyebrow>
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
          }}
        >
          Who we don&rsquo;t work with.
        </h1>
        <p
          style={{
            fontFamily: "var(--serif)",
            fontStyle: "italic",
            fontSize: 18,
            color: "var(--muted)",
            textAlign: "center",
            lineHeight: 1.7,
            maxWidth: 640,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Naming the bad fits up front saves both sides time. None of these are insults &mdash; they&rsquo;re filters.
        </p>
      </div>

      <section
        style={{
          maxWidth: 880,
          margin: "64px auto 0",
          padding: "0 24px",
        }}
      >
        {RED_FLAGS.map((rf, i) => (
          <article
            key={i}
            style={{
              background: "#fff",
              border: "1px solid var(--light)",
              padding: "32px 36px",
              marginBottom: 16,
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              gap: 24,
              alignItems: "start",
            }}
          >
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: 11,
                fontWeight: 700,
                color: "var(--muted)",
                letterSpacing: "0.15em",
                paddingTop: 4,
                whiteSpace: "nowrap",
              }}
            >
              0{i + 1}
            </div>
            <div>
              <h2
                style={{
                  fontFamily: "var(--display)",
                  fontStyle: "italic",
                  fontWeight: 700,
                  fontSize: 22,
                  color: "var(--ink)",
                  marginBottom: 12,
                  lineHeight: 1.3,
                }}
              >
                {rf.headline}
              </h2>
              <p
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: 16,
                  color: "var(--ink)",
                  lineHeight: 1.7,
                }}
              >
                {rf.body}
              </p>
            </div>
          </article>
        ))}
      </section>

      <section
        style={{
          maxWidth: 720,
          margin: "64px auto 0",
          padding: "0 24px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontFamily: "var(--serif)",
            fontStyle: "italic",
            fontSize: 18,
            color: "var(--ink)",
            lineHeight: 1.7,
          }}
        >
          If any of these describe you and you&rsquo;d still like to talk,
          <br />
          email the founder. Sometimes the answer changes.
        </p>
      </section>

      <div style={{ padding: "64px 24px 0" }}>
        <HubCTA href="/partners/apply">
          Apply if none of these apply →
        </HubCTA>
      </div>

      <CaveatLayer>
        PS &mdash; If you read this list and one of them describes you, that&rsquo;s useful information. Door stays open if your situation changes.
      </CaveatLayer>
    </HubPage>
  );
}
