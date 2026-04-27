/**
 * PostHog analytics — typed event surface for the conversion funnel.
 *
 * No-op when NEXT_PUBLIC_POSTHOG_KEY is unset (matches the env template).
 * The browser SDK is imported dynamically so server bundles stay clean and
 * a missing key short-circuits before any network work.
 */

import type { PostHog } from "posthog-js";

type Role = "ae" | "sdr";
type Tier = "ae" | "sdr" | "team";
type ForkVariant = "a-buttons" | "b-typewriter" | "c-identity";

type EventMap = {
  landing_fork_view: { variant: ForkVariant };
  landing_role_selected: { role: Role; variant: ForkVariant };
  pricing_cta_clicked: { tier: Tier; role?: Role };
  account_role_switched: { from: Role; to: Role };
};

type EventName = keyof EventMap;

let clientPromise: Promise<PostHog | null> | null = null;

function isEnabled() {
  return (
    typeof window !== "undefined" &&
    !!process.env.NEXT_PUBLIC_POSTHOG_KEY
  );
}

async function getClient(): Promise<PostHog | null> {
  if (!isEnabled()) return null;
  if (clientPromise) return clientPromise;
  clientPromise = import("posthog-js").then(({ default: posthog }) => {
    if (!posthog.__loaded) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
        api_host:
          process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
        capture_pageview: false, // we fire pageviews manually on route change
        capture_pageleave: true,
        person_profiles: "identified_only",
        loaded: (ph) => {
          if (process.env.NODE_ENV === "development") ph.debug(false);
        },
      });
    }
    return posthog;
  });
  return clientPromise;
}

export async function track<E extends EventName>(
  event: E,
  properties: EventMap[E],
): Promise<void> {
  const ph = await getClient();
  if (!ph) return;
  ph.capture(event, properties);
}

export async function identify(
  distinctId: string,
  traits?: Record<string, string | number | boolean | null>,
): Promise<void> {
  const ph = await getClient();
  if (!ph) return;
  ph.identify(distinctId, traits);
}

export async function reset(): Promise<void> {
  const ph = await getClient();
  if (!ph) return;
  ph.reset();
}

export async function capturePageview(url: string): Promise<void> {
  const ph = await getClient();
  if (!ph) return;
  ph.capture("$pageview", { $current_url: url });
}
