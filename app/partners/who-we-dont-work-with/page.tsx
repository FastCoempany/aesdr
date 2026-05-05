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
    headline: "Audience-bot signal.",
    body: "If a sample of 10 recent replies to your audience-published content surfaces 3+ obvious engagement-bot accounts, the audience-quality signal won't hold up under workshop conditions. Borrowed trust is a merciless mirror — your audience will surface our weaknesses in 60 minutes, and ours will surface yours.",
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
    headline: "Founder-on-demand expectations.",
    body: "AESDR is founder-backstage, host-fronted. If your conversion model assumes a recurring founder appearance — podcast guests, panel keynotes, joint webinar circuit — your model and ours are incompatible. Rare exceptions exist for named-milestone events; they're not the default.",
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
          Most affiliate hubs hide this. AESDR doesn&rsquo;t. Naming what&rsquo;s true is how the right partners self-select.
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
          None of these are insults. They&rsquo;re filters.
          <br />
          We&rsquo;d rather decline now than end a pilot in week 4.
        </p>
      </section>

      <div style={{ padding: "64px 24px 0" }}>
        <HubCTA href="/partners/apply">
          Apply if none of these apply →
        </HubCTA>
      </div>

      <CaveatLayer>
        PS — If you read this list and one of them describes you, that&rsquo;s information. Decline cleanly; we part as adults. Door stays open if your model changes.
      </CaveatLayer>
    </HubPage>
  );
}
