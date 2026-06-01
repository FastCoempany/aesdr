/**
 * Page: /affiliates/kit
 * Spec: AESDR-AFFILIATE-HUB-SPEC.md §"Page 1.4"
 * Canon: §1.4 (borrowed trust = merciless mirror — kit is open, not gated)
 * Copy sources: content/affiliate-kit/*.md (rendered on-site at /affiliates/kit/[slug])
 *
 * Per founder direction 2026-05-07: the kit lives on-site as rendered pages,
 * not downloadable PDFs. Per-affiliate items (lockup compositions, signed
 * agreement, tracking links scoped to a slug) are gated by signing.
 */

import type { Metadata } from "next";
import { HubPage } from "@/components/affiliates/HubChrome";
import { MonoEyebrow, HubCTA, CaveatLayer } from "@/components/affiliates/HubElements";
import { KitIndexList } from "@/components/affiliates/KitIndexList";

export const metadata: Metadata = {
  title: "Affiliate Kit · AESDR",
  description:
    "The kit, in advance. Most affiliate programs gate the kit behind an application. We don't.",
};

export default function KitPage() {
  return (
    <HubPage>
      <div style={{ padding: "64px 24px 0" }}>
        <MonoEyebrow>AESDR · AFFILIATE KIT · OPEN</MonoEyebrow>
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
          The kit, in advance.
        </h1>
        <p
          style={{
            fontFamily: "var(--serif)",
            fontStyle: "italic",
            fontSize: 18,
            color: "var(--muted)",
            textAlign: "center",
            lineHeight: 1.7,
            marginBottom: 16,
            maxWidth: 720,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Most affiliate programs gate the kit behind an application. We don&rsquo;t. Positioning, what you earn, claim limits, disclosure language, the actual agreement &mdash; all of it readable before you ever talk to us, so you can decide whether the partnership fits your audience on your own terms.
        </p>
      </div>

      <KitIndexList />

      <div style={{ padding: "96px 24px 0" }}>
        <HubCTA href="/affiliates/apply">Request an affiliate conversation →</HubCTA>
      </div>

      <CaveatLayer>
        PS &mdash; Read what catches your eye. We&rsquo;d rather you skim the kit before applying than discover something post-signing that changes your mind.
      </CaveatLayer>
    </HubPage>
  );
}
