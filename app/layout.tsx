import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://aesdr.com"),
  title: "AESDR",
  description: "A private launch hold page for AESDR.",
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
