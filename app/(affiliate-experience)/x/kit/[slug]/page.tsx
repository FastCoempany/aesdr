/**
 * /x/kit/[slug] — one kit document inside the locked experience. Picks the
 * right render path:
 *   • Three priority docs (curriculum-overview, pilot-rhythm, what-you-earn)
 *     get fully custom branded layouts (KitDoc* components)
 *   • Everything else renders the markdown HTML through KitMarkdownBody
 *     inside KitShell so it inherits the editorial typography + chrome
 *
 * Kit-internal links (/affiliates/kit/<slug>) are rewritten to /x/kit/<slug>
 * so cross-links stay inside the experience; PreviewOnlyWrap intercepts any
 * remaining off-host link clicks.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  KIT_ENTRIES,
  getKitEntry,
  getKitEntryHtml,
  type KitEntry,
} from "@/lib/affiliate-kit";
import type { Pose } from "@/components/brand/Mascot";
import KitTracker from "../../../_components/KitTracker";
import KitCta from "../../../_components/KitCta";
import KitShell, {
  type KitCategory,
} from "../../../_components/KitShell";
import KitMarkdownBody from "../../../_components/KitMarkdownBody";
import KitDocCurriculumOverview from "../../../_components/KitDocCurriculumOverview";
import KitDocPilotRhythm from "../../../_components/KitDocPilotRhythm";
import KitDocWhatYouEarn from "../../../_components/KitDocWhatYouEarn";
import PreviewOnlyWrap from "../../../_components/PreviewOnlyWrap";

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

/** Pose mapped per doc so Leponeus matches the tone of the page. */
const POSE_FOR: Record<string, Pose> = {
  "positioning-brief": "doctrine",
  "curriculum-overview": "doctrine",
  "what-you-earn": "owner",
  "co-promoting-aesdr": "verdict",
  "approved-claims": "verdict",
  "disclosure-language-pack": "verdict",
  "banned-vocabulary": "diagnosis",
  "lockup-usage": "doctrine",
  "pilot-rhythm": "sprint",
  "sample-partnership-agreement": "verdict",
};

/** Editorial doc-level subtitles for the shell hero. Falls back to the
 * catalog description if a slug isn't listed here. */
const SUBTITLE_FOR: Record<string, string> = {
  "positioning-brief":
    "Who AESDR is for. Who it isn't. The three things we always say.",
  "curriculum-overview":
    "What's in it, what's not, what every license includes — readable without enrolling.",
  "what-you-earn":
    "The rate, the math, and when you're paid — in plain numbers, before you commit.",
  "co-promoting-aesdr":
    "Three bright-line rules. The buyer-refund line. What's pre-cleared and what needs review.",
  "approved-claims":
    "What partners can say verbatim. What gets walked back. What gets declined.",
  "disclosure-language-pack":
    "FTC-compliant disclosure language by surface. Lift verbatim.",
  "banned-vocabulary":
    "The words AESDR doesn't use, and asks partners not to use in copy bearing the mark.",
  "lockup-usage":
    "Where the AESDR × Partner mark goes. Color, spacing, the three things never to do.",
  "pilot-rhythm":
    "Week-by-week rhythm of an AESDR pilot. Operational detail ships post-signing.",
  "sample-partnership-agreement":
    "Plain-English read of the deal terms — commission, attribution, payments, IP, indemnification.",
};

function rewriteKitLinks(html: string): string {
  return html.replace(/href="\/affiliates\/kit\//g, 'href="/x/kit/');
}

function neighbors(entry: KitEntry) {
  const idx = KIT_ENTRIES.findIndex((e) => e.slug === entry.slug);
  const prev = idx > 0 ? KIT_ENTRIES[idx - 1] : undefined;
  const next = idx < KIT_ENTRIES.length - 1 ? KIT_ENTRIES[idx + 1] : undefined;
  return {
    prev: prev ? { slug: prev.slug, title: prev.title } : undefined,
    next: next ? { slug: next.slug, title: next.title } : undefined,
  };
}

function renderBody(slug: string, html: string) {
  switch (slug) {
    case "curriculum-overview":
      return <KitDocCurriculumOverview />;
    case "pilot-rhythm":
      return <KitDocPilotRhythm />;
    case "what-you-earn":
      return <KitDocWhatYouEarn />;
    default:
      return <KitMarkdownBody html={html} />;
  }
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
  const { prev, next } = neighbors(entry);

  // PreviewOnlyWrap intercepts *every* button click inside its tree (so the
  // pricing-section checkout buttons can't escape). The KitCta in the footer
  // is also a <button>, so it must sit OUTSIDE the wrap or the popup hijacks
  // the "Request affiliate conversation" click. Body goes inside the wrap so
  // any stray off-host link in the rendered markdown still gets intercepted.
  return (
    <>
      <KitTracker event="kit_viewed" props={{ view: "doc", slug }} />
      <KitShell
        title={entry.title}
        subtitle={SUBTITLE_FOR[slug] || entry.description}
        category={entry.category as KitCategory}
        pose={POSE_FOR[slug] || "doctrine"}
        prev={prev}
        next={next}
        footerSlot={
          <div
            style={{
              maxWidth: 1080,
              margin: "0 auto",
              padding: "8px 0 0",
              borderTop: "1px solid var(--light, #E8E4DF)",
              marginTop: 16,
              paddingTop: 32,
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontFamily:
                  "var(--display, 'Playfair Display', Georgia, serif)",
                fontStyle: "italic",
                fontSize: 22,
                margin: "0 0 18px",
              }}
            >
              Ready to talk?
            </p>
            <KitCta />
          </div>
        }
      >
        <PreviewOnlyWrap>{renderBody(slug, html)}</PreviewOnlyWrap>
      </KitShell>
    </>
  );
}
