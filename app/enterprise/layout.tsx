import type { Metadata } from "next";
import EnterpriseNav from "./_components/EnterpriseNav";
import EnterpriseFooter from "./_components/EnterpriseFooter";
import styles from "./enterprise.module.css";

export const metadata: Metadata = {
  title: "AESDR / Enterprise — sales onboarding for first- and second-year AEs and SDRs",
  description:
    "The training your first- and second-year SDRs and AEs should already have. The same AESDR course junior AEs and SDRs pay for themselves — packaged for the orgs that hire them.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "AESDR / Enterprise",
    description:
      "The training your first- and second-year SDRs and AEs should already have.",
    type: "website",
  },
};

/**
 * Subsidiary layout — wraps every page under /enterprise/*.
 *
 * Visual identity, accent-promotion (iris-shimmer), mascot demotion,
 * and type-system scoping live in enterprise.module.css. Nothing here leaks
 * back to the consumer brand.
 *
 * EnterpriseNav reads usePathname() client-side for active-link highlighting;
 * the rest of this layout stays server-rendered.
 */
export default function TeamsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.page}>
      <div className={styles.shellInner}>
        <EnterpriseNav />
        <main style={{ flex: 1 }}>{children}</main>
        <EnterpriseFooter />
      </div>
    </div>
  );
}
