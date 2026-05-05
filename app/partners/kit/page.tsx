/**
 * Page: /partners/kit
 * Spec: AESDR-PARTNER-HUB-SPEC.md §"Page 1.4"
 * Canon: §1.4 (borrowed trust = merciless mirror — kit is open, not gated)
 * Copy sources: D40 README + kit-template files (downloadable as PDFs once
 *               the rendering pipeline runs)
 * Five-question check: PASS
 *
 * NOTE: PDF rendering pipeline is operationally pending. Components render
 * the table structure today; download targets are placeholders ("PDF pending")
 * for items requiring the pipeline. Files already in non-markdown formats
 * (SVG, MD-as-customizable-template) link to real downloads.
 */

import type { Metadata } from "next";
import { HubPage } from "@/components/partners/HubChrome";
import { MonoEyebrow, HubCTA, CaveatLayer } from "@/components/partners/HubElements";
import { KitDownloadTable } from "@/components/partners/KitDownloadTable";

export const metadata: Metadata = {
  title: "Partner Kit · AESDR",
  description:
    "The kit, in advance. Most affiliate programs gate the kit behind an application. We don't.",
};

export default function KitPage() {
  return (
    <HubPage>
      <div style={{ padding: "64px 24px 0" }}>
        <MonoEyebrow>AESDR · PARTNER KIT · DOWNLOADS</MonoEyebrow>
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
          Most affiliate programs gate the kit behind an application. We don&rsquo;t. The kit is the merciless mirror — if it doesn&rsquo;t survive your read, the partnership wouldn&rsquo;t either.
        </p>
        <p
          style={{
            fontFamily: "var(--mono)",
            fontSize: 10,
            color: "var(--muted)",
            textAlign: "center",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          per AFFILIATE_BRAND_CANON.md §1.4
        </p>
      </div>

      <KitDownloadTable />

      <div style={{ padding: "96px 24px 0" }}>
        <HubCTA href="/partners/apply">Request a partner conversation →</HubCTA>
      </div>

      <CaveatLayer>
        PS — The PDF render pipeline is mid-build. Files marked &ldquo;PDF pending&rdquo; will swap to real download links once the pipeline ships. Markdown copy templates download today.
      </CaveatLayer>
    </HubPage>
  );
}
