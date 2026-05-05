/**
 * Page: /partners (hub home)
 * Spec: AESDR-PARTNER-HUB-SPEC.md §"Page 1.1 — /partners (hub home)"
 * Canon: §1 (foundational doctrines), §3.3 (voice ratio 80/20),
 *        §6.3 (editorial-split hero pattern), §6.4 (iris reservation),
 *        §13 (honest disqualification), §14 (taglines v1.2)
 * Copy sources:
 *   - Editorial split hero left: canon §1.3 (founding vineyard) + §14 v1.2 tagline
 *   - Three pillars: canon §1.1, §1.5, §1.6 verbatim
 *   - Catalog teaser: D31 (4-of-12 cards: L08, L10, L11, L12)
 *   - Tools: tools/standalone-html/ (5 production tools)
 *   - Disqualification panel: D27 sanitized for partner-facing register
 *   - Caveat layer: original (Michael register, partner-hub specific)
 * Five-question check: PASS
 *   1. Thumbnail: cream + crimson editorial-split + display italic + iris CTA = AESDR ✓
 *   2. Token: all colors/fonts via app/globals.css tokens ✓
 *   3. Iris reservation: 2 instances of same primary CTA ✓ (canon §6.4)
 *   4. Icon discipline: type-only, no emoji, no imported icons ✓
 *   5. Voice thumbnail: "Less affiliate empire. More founding vineyard." — canonical §14 ✓
 */

import type { Metadata } from "next";
import { HubPage } from "@/components/partners/HubChrome";
import {
  EditorialSplitHero,
  ThreePillarBlock,
  DisqualificationPanel,
  CaveatLayer,
  HubCTA,
  MonoEyebrow,
} from "@/components/partners/HubElements";
import {
  CatalogTeaserGrid,
  CATALOG_CARDS,
  TEASER_CALL_NUMBERS,
  ToolStrip,
} from "@/components/partners/CatalogTeaserGrid";

export const metadata: Metadata = {
  title: "AESDR · Partners",
  description:
    "Less affiliate empire. More founding vineyard. AESDR partners with a small number of operators whose audiences match the early-career SaaS-sales role we serve.",
};

export default function PartnersHomePage() {
  const teaserCards = CATALOG_CARDS.filter((c) =>
    TEASER_CALL_NUMBERS.includes(c.callNumber),
  );

  return (
    <HubPage>
      <MonoEyebrow>AESDR · PARTNERS · EST. 2026</MonoEyebrow>

      <EditorialSplitHero
        leftEyebrow="WARNING · NOT A MARKETPLACE"
        leftHeadline={
          <>
            <em>Real partnerships,</em>
            <br />
            <em>not affiliate links.</em>
          </>
        }
        leftBody={
          <>
            AESDR doesn&rsquo;t run a marketplace. We work with a small group of operators whose audiences are early-career SaaS reps. Workshop-first. Time-boxed. Non-exclusive. Operator-to-operator.
          </>
        }
        rightLabel="WHAT THIS PAGE DOES"
        rightHeadline={
          <em>
            You can already feel it. You have to be a part of this.
          </em>
        }
        rightBody={
          <>
            AESDR runs pilot partnerships with community operators, bootcamp coaches, alumni networks, and creators. Workshop-first, time-boxed, non-exclusive. Real Operator. Never guru.
          </>
        }
        ctaHref="/partners/apply"
        ctaText="Request a partner conversation →"
      />

      <ThreePillarBlock
        pillars={[
          {
            title: "Workshop-first.",
            body: (
              <>
                Every pilot leads with one live 60-minute workshop into the partner&rsquo;s audience, run by AESDR. The workshop earns the sale. The link merely attributes it.
              </>
            ),
          },
          {
            title: "Real Operator. Never guru.",
            body: (
              <>
                We are the operating manual, not the motivation engine. If a piece of copy could be lifted onto a LinkedIn carousel without anyone noticing, it is wrong.
              </>
            ),
          },
          {
            title: "Honesty is the differentiator.",
            body: (
              <>
                We say out loud what competitors won&rsquo;t: who should not buy, where the math breaks, what happens when the script runs out. Honesty is not a tone. It is a competitive position.
              </>
            ),
          },
        ]}
      />

      <CatalogTeaserGrid cards={teaserCards} columns={2} />

      <ToolStrip />

      <DisqualificationPanel
        header="WHO SHOULDN'T APPLY TO BE AN AESDR PARTNER"
        bullets={[
          "Your primary distribution is rise-and-grind energy, hustle culture, or motivational LinkedIn content.",
          "You expect category exclusivity, first-right-of-refusal, or long-term lockout from competing programs.",
          "You decline to use the FTC-required disclosure language verbatim.",
          "Your primary channel is paid LinkedIn placement.",
          "You expect promo codes, discount-stacking authority, or pricing variance for your audience. AESDR does not run discounts. Ever.",
        ]}
        closingLine="None of these are insults. They're filters. We'd rather decline now than end a pilot in week 4."
      />

      <div style={{ padding: "96px 24px 0" }}>
        <HubCTA href="/partners/apply">Request a partner conversation →</HubCTA>
      </div>

      <CaveatLayer>
        PS — If you&rsquo;re going to apply, apply because the brand makes sense, not because the commission does. The latter is what every other affiliate program optimizes for. We&rsquo;re not that.
      </CaveatLayer>
    </HubPage>
  );
}
