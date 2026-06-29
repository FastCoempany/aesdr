'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

// No-op when NEXT_PUBLIC_REDDIT_PIXEL_ID is unset (matches how PostHog/Sentry
// no-op without their key). Without an id there's nothing to initialise, so the
// component returns null and the script never loads.
const PIXEL_ID = process.env.NEXT_PUBLIC_REDDIT_PIXEL_ID;

export default function RedditPixel() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // This ensures the pixel fires a PageVisit event every time the route changes
  useEffect(() => {
    if (!PIXEL_ID) return;
    const w = window as unknown as { rdt?: (event: string, action: string) => void };
    if (typeof window !== 'undefined' && typeof w.rdt === 'function') {
      w.rdt('track', 'PageVisit');
    }
  }, [pathname, searchParams]);

  if (!PIXEL_ID) return null;

  return (
    <Script
      id="reddit-pixel"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          !function(w,d){if(!w.rdt){var p=w.rdt=function(){p.sendEvent?p.sendEvent.apply(p,arguments):p.callQueue.push(arguments)};p.callQueue=[];var t=d.createElement("script");t.src="https://www.redditstatic.com/ads/pixel.js",t.async=!0;var s=d.getElementsByTagName("script")[0];s.parentNode.insertBefore(t,s)}}(window,document);
          rdt('init', ${JSON.stringify(PIXEL_ID)});
          rdt('track', 'PageVisit');
        `,
      }}
    />
  );
}