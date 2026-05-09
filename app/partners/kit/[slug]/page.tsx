/**
 * Page: /partners/kit/[slug]
 * Spec: AESDR-PARTNER-HUB-SPEC.md §"Page 1.4 — /partners/kit"
 * Canon: §1.4 (borrowed trust = merciless mirror — kit is open, not gated)
 *
 * Renders one partner-kit document as an on-site page. Source markdown lives
 * in content/partner-kit/. The catalog (slug → file) is in lib/partner-kit.ts.
 *
 * Per founder direction 2026-05-07: kit content lives on-site, not as PDFs.
 * Per-partner items (lockup SVGs scoped to a partner mark, signed agreement,
 * tracking links scoped to a slug) arrive after signing and are not part
 * of this public surface.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HubPage } from "@/components/partners/HubChrome";
import { MonoEyebrow, HubCTA, CaveatLayer } from "@/components/partners/HubElements";
import {
  KIT_ENTRIES,
  getKitEntry,
  getKitEntryHtml,
} from "@/lib/partner-kit";
import "./kit-prose.css";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return KIT_ENTRIES.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<Params> },
): Promise<Metadata> {
  const { slug } = await params;
  const entry = getKitEntry(slug);
  if (!entry) return { title: "Not found · AESDR Partners" };
  return {
    title: `${entry.title} · AESDR Partner Kit`,
    description: entry.description,
  };
}

export default async function KitDocPage(
  { params }: { params: Promise<Params> },
) {
  const { slug } = await params;
  const entry = getKitEntry(slug);
  if (!entry) notFound();

  const html = getKitEntryHtml(entry);

  return (
    <HubPage>
      <div style={{ padding: "64px 24px 0", maxWidth: 880, margin: "0 auto" }}>
        <MonoEyebrow>AESDR · PARTNER KIT · {entry.category.toUpperCase()}</MonoEyebrow>
        <h1
          style={{
            fontFamily: "var(--display)",
            fontStyle: "italic",
            fontWeight: 700,
            fontSize: "clamp(32px, 4.5vw, 44px)",
            color: "var(--ink)",
            lineHeight: 1.15,
            marginTop: 16,
            marginBottom: 16,
          }}
        >
          {entry.title}
        </h1>
        <p
          style={{
            fontFamily: "var(--serif)",
            fontStyle: "italic",
            fontSize: 17,
            color: "var(--muted)",
            lineHeight: 1.7,
            marginBottom: 8,
          }}
        >
          {entry.description}
        </p>
        <p style={{ marginTop: 32, marginBottom: 0 }}>
          <Link
            href="/partners/kit"
            style={{
              fontFamily: "var(--mono)",
              fontSize: 11,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--muted)",
              textDecoration: "none",
            }}
          >
            ← Back to kit index
          </Link>
        </p>
      </div>

      <article
        className="aesdr-kit-prose"
        style={{ maxWidth: 760, margin: "48px auto 0", padding: "0 24px" }}
        dangerouslySetInnerHTML={{ __html: html }}
      />

      <div style={{ padding: "96px 24px 0" }}>
        <HubCTA href="/partners/apply">Request a partner conversation →</HubCTA>
      </div>

      <CaveatLayer>
        PS — This page is the kit document itself. Per-partner items (your tracking links, your AESDR × Partner lockup compositions, the partnership agreement) arrive after signing.
      </CaveatLayer>
    </HubPage>
  );
}
