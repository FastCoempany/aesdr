"use client";

/**
 * Client-side prospect tracking for the affiliate-experience flow.
 *
 * Three destinations on every call:
 *  - our own DB (POST /x/track) — source of truth for the /x/ops dashboard
 *  - PostHog `capture()` — so the same event lands in the PostHog event
 *    feed / explorer / dashboards alongside session replay
 *  - PostHog `identify()` — runs once per session so replay + autocapture
 *    + the captured events are all attributed to the prospect slug
 *
 * The prospect slug rides in on the unique link as ?p=<slug>. We persist it in
 * sessionStorage so it survives in-flow navigation (welcome -> kit) after the
 * query param drops off the URL. No slug = no tracking (nothing to attribute).
 */
import { identify, captureRawEvent } from "@/lib/analytics";

const SLUG_KEY = "aesdr_prospect_slug";
const SESSION_KEY = "aesdr_prospect_session";

export function getProspectSlug(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const fromUrl = new URL(window.location.href).searchParams.get("p");
    if (fromUrl) {
      sessionStorage.setItem(SLUG_KEY, fromUrl);
      return fromUrl;
    }
    return sessionStorage.getItem(SLUG_KEY);
  } catch {
    return null;
  }
}

export function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  try {
    let s = sessionStorage.getItem(SESSION_KEY);
    if (!s) {
      s = crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, s);
    }
    return s;
  } catch {
    return "anon";
  }
}

export async function trackProspect(
  name: string,
  props: Record<string, unknown> = {},
): Promise<void> {
  const slug = getProspectSlug();
  if (!slug) return;

  // Fan out to both PostHog (event feed, dashboards) and our own DB
  // (founder-facing /x/ops). Both are best-effort; failures must never
  // break the prospect's UX.
  void captureRawEvent(name, {
    ...props,
    prospect_slug: slug,
    surface: "affiliate-experience",
    path:
      typeof window !== "undefined" ? window.location.pathname : undefined,
  }).catch(() => {
    /* no-op */
  });

  try {
    await fetch("/x/track", {
      method: "POST",
      headers: { "content-type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        slug,
        sessionId: getSessionId(),
        name,
        props,
        path: window.location.pathname,
        referrer: document.referrer || null,
      }),
    });
  } catch {
    // best-effort: tracking must never break the experience
  }
}

let identified = false;
export async function identifyProspect(): Promise<void> {
  const slug = getProspectSlug();
  if (!slug || identified) return;
  identified = true;
  try {
    await identify(`prospect:${slug}`, {
      prospect_slug: slug,
      surface: "affiliate-experience",
    });
  } catch {
    // no PostHog key configured / blocked — fine, DB tracking still runs
  }
}
