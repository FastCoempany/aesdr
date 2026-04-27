"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { capturePageview, identify, reset } from "@/lib/analytics";
import { createClient } from "@/utils/supabase/client";

export default function PostHogClient() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const url =
      window.location.origin +
      pathname +
      (searchParams?.toString() ? `?${searchParams.toString()}` : "");
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
