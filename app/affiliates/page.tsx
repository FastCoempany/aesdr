/**
 * Page: /affiliates (hub home)
 * Spec: AESDR-AFFILIATE-HUB-SPEC.md §"Page 1.1 — /affiliates (hub home)"
 * Canon: §1 (foundational doctrines), §3.3 (voice ratio 80/20),
 *        §6.3 (editorial-split hero pattern), §6.4 (iris reservation),
 *        §13 (honest disqualification), §14 (taglines v1.2)
 * Copy sources:
 *   - Editorial split hero left: canon §1.3 (a handful of affiliates, not a marketplace)
 *   - Three pillars: canon §1.1, §1.5, §1.6 verbatim
 *   - Catalog teaser: D31 (4-of-12 cards: L08, L10, L11, L12)
 *   - Tools: tools/standalone-html/ (5 production tools)
 *   - Disqualification panel: D27 sanitized for affiliate-facing register
 *   - Caveat layer: original (Michael register, affiliate-hub specific)
 * Five-question check: PASS
 *   1. Thumbnail: cream + crimson editorial-split + display italic + iris CTA = AESDR ✓
 *   2. Token: all colors/fonts via app/globals.css tokens ✓
 *   3. Iris reservation: 2 instances of same primary CTA ✓ (canon §6.4)
 *   4. Icon discipline: type-only, no emoji, no imported icons ✓
 *   5. Voice thumbnail: "Real partnerships, not affiliate links." — verdict-shaped Rowan ✓
 */

import type { Metadata } from "next";
import { HubPage } from "@/components/affiliates/HubChrome";
import {
  EditorialSplitHero,
  ThreePillarBlock,
  DisqualificationPanel,
  CaveatLayer,
  HubCTA,
  MonoEyebrow,
} from "@/components/affiliates/HubElements";
import {
  CatalogTeaserGrid,
  CATALOG_CARDS,
  TEASER_CALL_NUMBERS,
  ToolStrip,
} from "@/components/affiliates/CatalogTeaserGrid";

export const metadata: Metadata = {
  title: "AESDR · Affiliates",
  description:
    "Pilot Cohort 1 is open. We're looking for a small number of affiliates whose audiences are SaaS AEs and SDRs — first-year through ten-year veterans doing a fundamentals reset. One workshop, two emails, 40% commission, $500 sign-on for invited affiliates.",
};

export default function AffiliatesHomePage() {
  const teaserCards = CATALOG_CARDS.filter((c) =>
    TEASER_CALL_NUMBERS.includes(c.callNumber),
  );

  return (
    <HubPage>
      <MonoEyebrow>AESDR · AFFILIATES · COHORT 1 OPEN</MonoEyebrow>

      <EditorialSplitHero
        leftEyebrow="PILOT COHORT 1"
        leftHeadline={
          <>
            <em>Picky on purpose.</em>
            <br />
            <em>Open by invitation.</em>
          </>
        }
        leftBody={
          <>
            AESDR&rsquo;s first affiliate cohort is forming, and we&rsquo;re looking for a small number of affiliates &mdash; community operators, course creators, agency owners, coaches &mdash; whose audiences are SaaS AEs and SDRs across the career arc: first-year hires trying to ramp, third-year ramp veterans, and ten-year veterans doing a fundamentals reset. The shape of the pilot is deliberately simple &mdash; one live workshop into your audience, two emails over the attribution window, a 30-day attribution window, and a 40% commission rate &mdash; and there&rsquo;s nothing else hidden in the agreement beyond that.
          </>
        }
        rightLabel="WHERE WE ARE"
        rightHeadline={
          <em>
            Built with GTM teams. Ready for affiliates.
          </em>
        }
        rightBody={
          <>
            The curriculum was built with feedback from sales leaders, AEs, and SDRs at Harvey, Craft, Rally UXR, and ~20 more SaaS companies. The content&rsquo;s been pressure-tested. We&rsquo;re ready to put it in front of new audiences &mdash; and we&rsquo;d rather do that through people their audiences already trust than through ads. Cohort 1 affiliates we invite directly get a <strong>$500 sign-on bonus</strong> on agreement signing &mdash; small money but real money, and the point is we have skin in the game from day one.
          </>
        }
        ctaHref="/affiliates/apply"
        ctaText="Request an affiliate conversation →"
      />

      <ThreePillarBlock
        pillars={[
          {
            title: "We sell by teaching, not by linking.",
            body: (
              <>
                Every pilot kicks off with one live 60-minute workshop into your audience that we run ourselves &mdash; that workshop is the part that does the actual selling for the audience, and your affiliate link is the mechanism that simply tells us who came in from your side.
              </>
            ),
          },
          {
            title: "Practical, not motivational.",
            body: (
              <>
                The course is the part of the job nobody bothered to write down for the role &mdash; how to read your own pipeline honestly, what to do when the script runs out mid-call, what &ldquo;good&rdquo; actually looks like on a Monday morning. There are no motivational pep talks and no mindset workshops anywhere in the format, only the work itself: cold-calling included, dial blocks included, and gatekeepers included.
              </>
            ),
          },
          {
            title: "We say who shouldn't buy.",
            body: (
              <>
                We publish who the program isn&rsquo;t for &mdash; anyone hunting motivation, anyone wanting a LinkedIn-friendly credential, AEs and SDRs not currently in a seat. That&rsquo;s so the right people enroll and the wrong ones don&rsquo;t waste their money. It also makes your job easier &mdash; recommendations to your audience land harder when they trust you&rsquo;re not pitching everyone.
              </>
            ),
          },
        ]}
      />

      <CatalogTeaserGrid cards={teaserCards} columns={2} />

      <ToolStrip />

      <DisqualificationPanel
        header="WHO SHOULDN'T APPLY TO BE AN AESDR AFFILIATE"
        bullets={[
          "Your primary distribution is rise-and-grind energy, hustle culture, or motivational LinkedIn content.",
          "You expect category exclusivity, first-right-of-refusal, or long-term lockout from competing programs.",
          "You decline to use the FTC-required disclosure language verbatim.",
          "Your primary channel is paid LinkedIn placement.",
          "You expect promo codes, discount-stacking authority, or pricing variance for your audience. AESDR does not run discounts. Ever.",
        ]}
        closingLine="None of these are meant as insults — they're filters that work for both sides, and we'd rather decline an affiliate conversation now than end a pilot together in week 4 with both sides disappointed in the outcome."
      />

      <div style={{ padding: "96px 24px 0" }}>
        <HubCTA href="/affiliates/apply">Request an affiliate conversation →</HubCTA>
      </div>

      <CaveatLayer>
        PS &mdash; Apply because the brand makes sense to your audience, not just because the commission&rsquo;s good. The math works either way; the fit doesn&rsquo;t.
      </CaveatLayer>
    </HubPage>
  );
}
