/**
 * Page: /partners/kit
 * Spec: AESDR-PARTNER-HUB-SPEC.md §"Page 1.4"
 * Canon: §1.4 (borrowed trust = merciless mirror — kit is open, not gated)
 * Copy sources: content/partner-kit/*.md (rendered on-site at /partners/kit/[slug])
 *
 * Per founder direction 2026-05-07: the kit lives on-site as rendered pages,
 * not downloadable PDFs. Per-partner items (lockup compositions, signed
 * agreement, tracking links scoped to a slug) are gated by signing.
 */

import type { Metadata } from "next";
import { HubPage } from "@/components/partners/HubChrome";
import { MonoEyebrow, HubCTA, CaveatLayer } from "@/components/partners/HubElements";
import { KitIndexList } from "@/components/partners/KitIndexList";

export const metadata: Metadata = {
  title: "Partner Kit · AESDR",
  description:
    "The kit, in advance. Most affiliate programs gate the kit behind an application. We don't.",
};

export default function KitPage() {
  return (
    <HubPage>
      <div style={{ padding: "64px 24px 0" }}>
        <MonoEyebrow>AESDR · PARTNER KIT · OPEN</MonoEyebrow>
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
          The full partner kit, readable before you apply. Positioning, claim limits, disclosure language, lockup rules &mdash; everything you&rsquo;d need to evaluate whether the partnership makes sense for your audience.
        </p>
      </div>

      <KitIndexList />

      <div style={{ padding: "96px 24px 0" }}>
        <HubCTA href="/partners/apply">Request a partner conversation →</HubCTA>
      </div>

      <CaveatLayer>
        PS &mdash; Read what catches your eye. We&rsquo;d rather you skim the kit before applying than discover something post-signing that changes your mind.
      </CaveatLayer>
    </HubPage>
  );
}
