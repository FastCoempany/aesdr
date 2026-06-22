"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { capturePageview, identify, reset } from "@/lib/analytics";
import { createClient } from "@/utils/supabase/client";

export default function PostHogClient() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Strip identifying / attribution query params before the pageview leaves
    // for PostHog: the prospect slug (?p=) and the UTM + attribution params
    // are PII / tracking metadata that shouldn't be persisted on $current_url
    // (R5-PI-7). Everything else (e.g. ?unit=) is kept for funnel context.
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    for (const key of [...params.keys()]) {
      const k = key.toLowerCase();
      if (k === "p" || k.startsWith("utm_") || k === "ref" || k === "via") {
        params.delete(key);
      }
    }
    const qs = params.toString();
    const url = window.location.origin + pathname + (qs ? `?${qs}` : "");
    capturePageview(url);
  }, [pathname, searchParams]);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        identify(user.id, {
          email: user.email ?? null,
          role: (user.user_metadata?.role as string | undefined) ?? null,
        });
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        reset();
        return;
      }
      if (session?.user) {
        identify(session.user.id, {
          email: session.user.email ?? null,
          role:
            (session.user.user_metadata?.role as string | undefined) ?? null,
        });
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  return null;
}
