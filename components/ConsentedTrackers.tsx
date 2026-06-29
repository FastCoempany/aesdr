"use client";

import { Suspense, useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/react";

import RedditPixel from "@/components/RedditPixel";

// R4-LEG-2: third-party trackers that aren't self-gating. Vercel Analytics and
// the Reddit Pixel fire on mount with no built-in consent check, so they must
// not render until the visitor accepts. (PostHog self-gates in lib/analytics —
// it's mounted separately and is intentionally NOT here.)
//
// Mirrors hasAnalyticsConsent() in lib/analytics.ts: the trackers turn on only
// when localStorage holds "granted". We also listen for the in-page
// "aesdr:consent-granted" event the banner dispatches on Accept, so the
// trackers mount immediately without waiting for a reload.
const CONSENT_KEY = "aesdr_analytics_consent";

export default function ConsentedTrackers() {
  const [granted, setGranted] = useState(false);

  useEffect(() => {
    function readConsent(): boolean {
      try {
        return window.localStorage.getItem(CONSENT_KEY) === "granted";
      } catch {
        // localStorage blocked (private mode) — treat as no consent, don't crash.
        return false;
      }
    }

    // Defer out of the synchronous effect body (avoids a cascading re-render,
    // matching ConsentBanner.tsx). rAF id is captured so we can cancel on unmount.
    let rafId = 0;
    if (readConsent()) {
      rafId = window.requestAnimationFrame(() => setGranted(true));
    }

    function onGranted() {
      setGranted(true);
    }
    window.addEventListener("aesdr:consent-granted", onGranted);

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener("aesdr:consent-granted", onGranted);
    };
  }, []);

  if (!granted) return null;

  return (
    <>
      <Analytics />
      <Suspense fallback={null}>
        <RedditPixel />
      </Suspense>
    </>
  );
}
