import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || "https://aesdr.com"),
  title: "AESDR",
  description: "AEs & SDRs rule this world.",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
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
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2"
          style={{ background: "var(--theme)", color: "#000", fontFamily: "var(--mono)", fontSize: "12px", fontWeight: 700 }}
        >
          Skip to content
        </a>
        <div id="main-content">{children}</div>
      </body>
    </html>
  );
}
