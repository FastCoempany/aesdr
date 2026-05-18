import type { Metadata } from "next";
import TeamsNav from "./_components/TeamsNav";
import TeamsFooter from "./_components/TeamsFooter";
import styles from "./teams.module.css";

export const metadata: Metadata = {
  title: "AESDR / Operating Layer — for sales orgs",
  description:
    "The missing behavioral foundation for early-career sales orgs. Built on the rep-direct AESDR course — packaged for managers, enablement, RevOps, and channel partners.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "AESDR / Operating Layer",
    description: "The missing behavioral foundation for early-career sales orgs.",
    type: "website",
  },
};

/**
 * Subsidiary layout — wraps every page under /teams/*.
 *
 * Visual identity, accent-promotion (iris-shimmer), mascot demotion,
 * and type-system scoping live in teams.module.css. Nothing here leaks
 * back to the consumer brand.
 *
 * TeamsNav reads usePathname() client-side for active-link highlighting;
 * the rest of this layout stays server-rendered.
 */
export default function TeamsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.page}>
      <div className={styles.shellInner}>
        <TeamsNav />
        <main style={{ flex: 1 }}>{children}</main>
        <TeamsFooter />
      </div>
    </div>
  );
}
