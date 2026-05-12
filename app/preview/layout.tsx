import type { Metadata } from "next";
import type { ReactNode } from "react";

/**
 * /preview/* — sandbox mockups for atmospheric / decorative concepts.
 * Gated via ?key=741407 URL param on each child page. Never linked from
 * the production site; never indexed.
 */

export const metadata: Metadata = {
  title: "Preview · AESDR",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

export default function PreviewLayout({ children }: { children: ReactNode }) {
  return children;
}
