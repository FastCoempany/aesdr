/**
 * Canonical site-origin resolver (audit P1-12).
 *
 * Replaces the `process.env.NEXT_PUBLIC_SITE_URL || "https://aesdr.com"`
 * pattern that silently defaulted to the production host at ~15 call sites.
 * A silent default means a misconfigured preview/branch deploy would mint
 * links, set cookies, and build redirect/return URLs pointing at PROD —
 * a subtle, hard-to-notice failure. This refuses that: in production a
 * missing var throws; in dev/test it warns once and keeps local dev working.
 */

import { isProduction } from "@/lib/env";

let warnedOnce = false;

/**
 * The canonical site origin (no trailing slash), e.g. "https://aesdr.com".
 *
 *  - If `NEXT_PUBLIC_SITE_URL` is set and non-empty, return it (behavior
 *    identical to the old default whenever the var is present).
 *  - Else in production, THROW — refuse to silently fall back to a hardcoded
 *    host on a genuine misconfiguration.
 *  - Else (dev/test), warn once and return the prod host so local dev runs.
 */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;
  if (fromEnv != null && fromEnv !== "") {
    return fromEnv;
  }

  // Fail fast on a real deployment (Vercel sets VERCEL=1 in build + runtime) so a
  // misconfigured prod/preview can't silently mint prod-pointing links. A local
  // or CI `next build` without the var (no VERCEL) falls through to the dev
  // default below instead of breaking the build — the var is injected by Vercel
  // on every environment, so the throw only ever fires on a genuine misconfig.
  if (isProduction() && process.env.VERCEL) {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL is not set on this deployment — refusing to silently fall back to a hardcoded host.",
    );
  }

  if (!warnedOnce) {
    warnedOnce = true;
    console.warn(
      "[site-url] NEXT_PUBLIC_SITE_URL is not set; falling back to https://aesdr.com for local dev.",
    );
  }
  return "https://aesdr.com";
}
