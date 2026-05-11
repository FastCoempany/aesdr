'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function RedditPixel() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // This ensures the pixel fires a PageVisit event every time the route changes
  useEffect(() => {
    const w = window as unknown as { rdt?: (event: string, action: string) => void };
    if (typeof window !== 'undefined' && typeof w.rdt === 'function') {
      w.rdt('track', 'PageVisit');
    }
  }, [pathname, searchParams]);

  return (
    <Script
      id="reddit-pixel"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          !function(w,d){if(!w.rdt){var p=w.rdt=function(){p.sendEvent?p.sendEvent.apply(p,arguments):p.callQueue.push(arguments)};p.callQueue=[];var t=d.createElement("script");t.src="https://www.redditstatic.com/ads/pixel.js",t.async=!0;var s=d.getElementsByTagName("script")[0];s.parentNode.insertBefore(t,s)}}(window,document);
          rdt('init', 'a2_isyp2r509g3u');
          rdt('track', 'PageVisit');
        `,
      }}
    />
  );
}