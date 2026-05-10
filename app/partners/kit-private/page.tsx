/**
 * Page: /partners/kit-private (gated index)
 * Spec: AESDR-PARTNER-HUB-SPEC.md §"Page 1.4 — kit (partner-only)"
 *
 * Renders the index of 13 private kit docs, but only after a valid session
 * cookie is present. Without a cookie:
 *   - If ?t=<token> is in the URL, the kit-private/auth API route handles
 *     verification + cookie-set + redirect back here.
 *   - Otherwise, we render a "you need an access link" stub.
 *
 * Per founder direction 2026-05-09: full operating manual ships post-signing
 * via per-partner signed URL with audit trail.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { HubPage } from "@/components/partners/HubChrome";
import { MonoEyebrow, CaveatLayer } from "@/components/partners/HubElements";
import {
  PRIVATE_KIT_CATEGORIES,
  PRIVATE_KIT_ENTRIES,
} from "@/lib/partner-kit-private";
import { readKitSession } from "@/lib/partner-kit-session";
import { logAccess } from "@/lib/partner-kit-tokens";
import { readRequestMeta } from "@/lib/req-meta";

export const metadata: Metadata = {
  title: "Partner Kit (Private) · AESDR",
  description: "Partner-only operating manual.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type Search = { t?: string; e?: string };

export default async function PrivateKitIndex(
  { searchParams }: { searchParams: Promise<Search> },
) {
  const params = await searchParams;

  // If a token is present, hand off to the auth route (sets cookie + redirects).
  if (params.t) {
    const next = "/partners/kit-private";
    redirect(`/api/partners/kit-private/auth?t=${encodeURIComponent(params.t)}&next=${encodeURIComponent(next)}`);
  }

  const session = await readKitSession();

  if (!session) {
    return <PrivateKitDenied error={params.e} />;
  }

  // Log the index view.
  const meta = readRequestMeta(await headers());
  await logAccess({
    tokenId: session.tid,
    partnerSlug: session.partner_slug,
    event: "view",
    docSlug: null,
    ipHash: meta.ipHash,
    userAgent: meta.userAgent,
    referrer: meta.referrer,
  });

  return (
    <HubPage>
      <div style={{ padding: "64px 24px 0" }}>
        <MonoEyebrow>AESDR · PARTNER KIT · PRIVATE</MonoEyebrow>
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
          The full kit.
        </h1>
        <p
          style={{
            fontFamily: "var(--serif)",
            fontStyle: "italic",
            fontSize: 18,
            color: "var(--muted)",
            textAlign: "center",
            lineHeight: 1.7,
            marginBottom: 8,
            maxWidth: 720,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Partner-only. {session.partner_label || session.partner_slug} &middot; access expires {new Date(session.expires_at).toLocaleDateString()}.
        </p>
      </div>

      <section style={{ maxWidth: 1080, margin: "0 auto", padding: "64px 24px 0" }}>
        {PRIVATE_KIT_CATEGORIES.map((cat) => {
          const items = PRIVATE_KIT_ENTRIES.filter((e) => e.category === cat.name);
          if (items.length === 0) return null;
          return (
            <div key={cat.name} style={{ marginBottom: 56 }}>
              <div
                style={{
                  fontFamily: "var(--cond)",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "var(--muted)",
                  marginBottom: 8,
                }}
              >
                {cat.name}
              </div>
              <p
                style={{
                  fontFamily: "var(--serif)",
                  fontStyle: "italic",
                  fontSize: 16,
                  color: "var(--muted)",
                  marginBottom: 24,
                }}
              >
                {cat.blurb}
              </p>
              <div style={{ borderTop: "1px solid var(--light)" }}>
                {items.map((it) => (
                  <Link
                    key={it.slug}
                    href={`/partners/kit-private/${it.slug}`}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr auto",
                      gap: 24,
                      padding: "20px 0",
                      borderBottom: "1px solid var(--light)",
                      alignItems: "center",
                      textDecoration: "none",
                      color: "inherit",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontFamily: "var(--display)",
                          fontStyle: "italic",
                          fontWeight: 700,
                          fontSize: 19,
                          color: "var(--ink)",
                          marginBottom: 6,
                        }}
                      >
                        {it.title}
                      </div>
                      <div
                        style={{
                          fontFamily: "var(--serif)",
                          fontSize: 14,
                          color: "var(--muted)",
                          lineHeight: 1.6,
                        }}
                      >
                        {it.description}
                      </div>
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: 11,
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        color: "var(--ink)",
                      }}
                    >
                      Read →
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      <CaveatLayer>
        PS &mdash; This page tracks views (which doc, when, from where). That&rsquo;s by design &mdash; not surveillance, but a record we both can refer to. The public partner kit lives at <Link href="/partners/kit" style={{ color: "var(--ink)", textDecoration: "underline" }}>/partners/kit</Link>; this private kit is for you.
      </CaveatLayer>
    </HubPage>
  );
}

function PrivateKitDenied({ error }: { error?: string }) {
  const message = errorMessage(error);
  return (
    <HubPage>
      <div style={{ padding: "120px 24px 80px", maxWidth: 640, margin: "0 auto" }}>
        <MonoEyebrow>AESDR · PARTNER KIT · PRIVATE</MonoEyebrow>
        <h1
          style={{
            fontFamily: "var(--display)",
            fontStyle: "italic",
            fontWeight: 700,
            fontSize: 36,
            color: "var(--ink)",
            lineHeight: 1.15,
            marginTop: 16,
            marginBottom: 24,
          }}
        >
          Access link required.
        </h1>
        <p
          style={{
            fontFamily: "var(--serif)",
            fontSize: 17,
            color: "var(--ink)",
            lineHeight: 1.7,
            marginBottom: 16,
          }}
        >
          The private partner kit is gated. Approved partners receive a personal access link by email after the partnership agreement is signed.
        </p>
        {message && (
          <p
            style={{
              fontFamily: "var(--mono)",
              fontSize: 13,
              color: "var(--crimson)",
              marginBottom: 24,
            }}
          >
            {message}
          </p>
        )}
        <p
          style={{
            fontFamily: "var(--serif)",
            fontSize: 16,
            color: "var(--muted)",
            lineHeight: 1.7,
          }}
        >
          The public partner kit is at{" "}
          <Link href="/partners/kit" style={{ color: "var(--ink)", textDecoration: "underline" }}>
            /partners/kit
          </Link>
          . If you need a fresh access link, email{" "}
          <a href="mailto:partner@aesdr.com" style={{ color: "var(--ink)", textDecoration: "underline" }}>
            partner@aesdr.com
          </a>
          .
        </p>
      </div>
    </HubPage>
  );
}

function errorMessage(e?: string): string | null {
  switch (e) {
    case "missing":
      return "No access token in the URL.";
    case "malformed":
      return "Access token is malformed.";
    case "bad_sig":
      return "Access token signature didn't verify.";
    case "expired":
      return "Access token has expired.";
    case "revoked":
      return "Access has been revoked or expired.";
    default:
      return null;
  }
}
