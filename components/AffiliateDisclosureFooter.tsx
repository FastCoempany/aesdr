/**
 * FTC public-side disclosure footer.
 *
 * Renders only when the `aesdr_attribution` cookie is present — i.e., the
 * visitor came in through an affiliate link. Discloses the commission
 * relationship in plain English per FTC 16 CFR § 255 (endorsement
 * disclosures).
 *
 * Rendered once at the root layout level so it appears on every public
 * page the affiliate-attributed visitor sees. Server-only — the cookie
 * read happens at render time, no JS ships.
 *
 * Per docs/canon-revisions/2026-05-22-affiliate-hub-plan.md (step 12).
 */

import { cookies } from "next/headers";

import { ATTRIBUTION_COOKIE } from "@/lib/affiliate";

export default async function AffiliateDisclosureFooter() {
  const store = await cookies();
  if (!store.get(ATTRIBUTION_COOKIE)) return null;

  return (
    <aside
      role="contentinfo"
      aria-label="Affiliate disclosure"
      style={{
        borderTop: "1px solid var(--light)",
        background: "var(--cream)",
        padding: "14px 5%",
        fontFamily: "var(--mono)",
        fontSize: 11,
        lineHeight: 1.55,
        letterSpacing: ".02em",
        color: "var(--muted)",
        textAlign: "center",
      }}
    >
      You arrived here through a creator&rsquo;s affiliate link. If you
      enroll within 30 days, that creator earns commission from AESDR. It
      doesn&rsquo;t change your price.
    </aside>
  );
}
