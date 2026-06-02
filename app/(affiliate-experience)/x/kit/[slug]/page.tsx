/**
 * /x/kit/[slug] — one kit document, rendered inside the isolated environment.
 * Reuses the kit markdown catalog read-only. The only navigation offered is
 * back to the kit index and the single tracked CTA — no escape to the rest of
 * the site.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { KIT_ENTRIES, getKitEntry, getKitEntryHtml } from "@/lib/affiliate-kit";
import KitTracker from "../../../_components/KitTracker";
import KitCta from "../../../_components/KitCta";
import PreviewOnlyWrap from "../../../_components/PreviewOnlyWrap";

/**
 * Rewrites kit-internal links so they stay inside the locked experience:
 *   /affiliates/kit/<slug>  -> /x/kit/<slug>     (kit cross-links work)
 *   /affiliates/apply       -> #                 (handled by PreviewOnlyWrap as the popup)
 * Other off-host links (mailto, http, /research, etc.) are left as-is for
 * PreviewOnlyWrap's onClickCapture to intercept.
 */
function rewriteKitLinks(html: string): string {
  return html
    .replace(/href="\/affiliates\/kit\//g, 'href="/x/kit/')
    .replace(/href="\/affiliates\/apply"/g, 'href="/affiliates/apply"');
}

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return KIT_ENTRIES.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = getKitEntry(slug);
  return {
    title: entry ? `${entry.title} · AESDR Affiliate Kit` : "Not found · AESDR",
    robots: { index: false, follow: false },
  };
}

export default async function KitDocPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const entry = getKitEntry(slug);
  if (!entry) notFound();

  const html = rewriteKitLinks(getKitEntryHtml(entry));

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--cream, #FAF7F2)",
        color: "var(--ink, #1A1A1A)",
        padding: "56px 24px 120px",
      }}
    >
      <KitTracker event="kit_viewed" props={{ view: "doc", slug }} />
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <Link
          href="/x/kit"
          style={{
            fontFamily: "var(--cond, 'Barlow Condensed', sans-serif)",
            textTransform: "uppercase",
            letterSpacing: ".16em",
            fontSize: 12,
            color: "var(--muted, #6B6B6B)",
            textDecoration: "none",
          }}
        >
          ← All of the kit
        </Link>
        <PreviewOnlyWrap>
          <article
            style={{
              fontFamily: "var(--serif, 'Source Serif 4', Georgia, serif)",
              fontSize: 17,
              lineHeight: 1.75,
              marginTop: 24,
            }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </PreviewOnlyWrap>
        <div
          style={{
            marginTop: 56,
            paddingTop: 32,
            borderTop: "1px solid var(--light, #E8E4DF)",
          }}
        >
          <KitCta />
        </div>
      </div>
    </main>
  );
}
