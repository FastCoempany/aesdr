/**
 * Page: /partners/kit-private/[slug] (gated kit doc renderer)
 *
 * Same render path as /partners/kit/[slug] but pulls from the PRIVATE catalog
 * and requires a valid session cookie. Logs a page view per render.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { HubPage } from "@/components/partners/HubChrome";
import { MonoEyebrow, CaveatLayer } from "@/components/partners/HubElements";
import {
  getPrivateKitEntry,
  getPrivateKitEntryHtml,
} from "@/lib/partner-kit-private";
import { readKitSession } from "@/lib/partner-kit-session";
import { logAccess } from "@/lib/partner-kit-tokens";
import { readRequestMeta } from "@/lib/req-meta";
import "../../kit/[slug]/kit-prose.css";

type Params = { slug: string };

export const dynamic = "force-dynamic";

export async function generateMetadata(
  { params }: { params: Promise<Params> },
): Promise<Metadata> {
  const { slug } = await params;
  const entry = getPrivateKitEntry(slug);
  return {
    title: entry ? `${entry.title} · AESDR Partner Kit (Private)` : "Not found",
    robots: { index: false, follow: false },
  };
}

export default async function PrivateKitDocPage(
  { params }: { params: Promise<Params> },
) {
  const { slug } = await params;
  const entry = getPrivateKitEntry(slug);
  if (!entry) notFound();

  const session = await readKitSession();
  if (!session) {
    redirect(`/partners/kit-private?next=${encodeURIComponent(`/partners/kit-private/${slug}`)}`);
  }

  // Log this page view. Skip for admin to keep audit log clean.
  if (!session.isAdmin) {
    const meta = readRequestMeta(await headers());
    await logAccess({
      tokenId: session.tid,
      partnerSlug: session.partner_slug,
      event: "view",
      docSlug: slug,
      ipHash: meta.ipHash,
      userAgent: meta.userAgent,
      referrer: meta.referrer,
    });
  }

  const html = getPrivateKitEntryHtml(entry);

  return (
    <HubPage>
      <div style={{ padding: "64px 24px 0", maxWidth: 880, margin: "0 auto" }}>
        <MonoEyebrow>
          AESDR · PARTNER KIT · PRIVATE · {entry.category.toUpperCase()}
        </MonoEyebrow>
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
            href="/partners/kit-private"
            style={{
              fontFamily: "var(--mono)",
              fontSize: 11,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--muted)",
              textDecoration: "none",
            }}
          >
            ← Back to private kit index
          </Link>
        </p>
      </div>

      <article
        className="aesdr-kit-prose"
        style={{ maxWidth: 760, margin: "48px auto 0", padding: "0 24px" }}
        dangerouslySetInnerHTML={{ __html: html }}
      />

      <CaveatLayer>
        PS &mdash; {session.partner_label || session.partner_slug} &middot; access expires {new Date(session.expires_at).toLocaleDateString()}.
      </CaveatLayer>
    </HubPage>
  );
}
