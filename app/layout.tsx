import type { Metadata } from "next";
import { Suspense } from "react";
import { Analytics } from "@vercel/analytics/react";
import MobileGate from "@/components/MobileGate";
import RedditPixel from "@/components/RedditPixel";
import "./globals.css";

const LAUNCHED = process.env.NEXT_PUBLIC_LAUNCH_MODE === "true";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://aesdr.com"),
  title: "AESDR",
  description: "AEs & SDRs rule this world.",
  robots: {
    index: LAUNCHED,
    follow: LAUNCHED,
    googleBot: {
      index: LAUNCHED,
      follow: LAUNCHED,
      noimageindex: !LAUNCHED,
    },
  },
  openGraph: {
    title: "AESDR",
    description: "AEs & SDRs rule this world.",
    siteName: "AESDR",
    url: "https://aesdr.com",
    images: [
      {
        url: "/ceramic-bunny-mask-cutout.png",
        width: 858,
        height: 1024,
        alt: "Ceramic humanoid bunny holding a mask",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AESDR",
    description: "AEs & SDRs rule this world.",
    images: ["/ceramic-bunny-mask-cutout.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700;1,900&family=Source+Serif+4:ital,wght@0,400;0,600;1,400&family=Space+Mono:wght@400;700&family=Barlow+Condensed:wght@400;500;600;700;800&family=Caveat:wght@400;600&display=swap" />
        
        {/* Favicon Tags */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className="min-h-screen flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2"
          style={{ background: "var(--theme)", color: "#000", fontFamily: "var(--mono)", fontSize: "12px", fontWeight: 700 }}
        >
          Skip to content
        </a>
        <div id="main-content">
          <MobileGate>{children}</MobileGate>
        </div>
        
        {/* Analytics & Tracking */}
        <Analytics />
        <Suspense fallback={null}>
          <RedditPixel />
        </Suspense>
      </body>
    </html>
  );
}