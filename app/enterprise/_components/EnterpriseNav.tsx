"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "../enterprise.module.css";
import { SubLogoCompact } from "./SubLogo";

/**
 * Subsidiary navigation bar.
 *
 * Sits on every page under /enterprise via the subsidiary layout. Holds the
 * compact sub-logo, primary section links, a "back to aesdr.com" exit,
 * and a single "book a walkthrough" CTA.
 *
 * Client component so it can read the current pathname via usePathname()
 * for the active-link iris-shimmer underline. The rest of the layout
 * remains server-rendered.
 */

const NAV_LINKS = [
  { href: "/enterprise", label: "Overview" },
  { href: "/enterprise/curriculum", label: "Curriculum" },
  { href: "/enterprise/implementation", label: "Implementation" },
  { href: "/enterprise/diagnostic", label: "Diagnostic" },
  { href: "/enterprise/integrations", label: "Integrations" },
  { href: "/enterprise/channel", label: "Partners" },
  { href: "/enterprise/pricing", label: "Pricing" },
] as const;

export default function EnterpriseNav() {
  const pathname = usePathname() ?? "/enterprise";

  return (
    <nav className={styles.nav} aria-label="Enterprise navigation">
      <div className={styles.navInner}>
        <Link href="/enterprise" className={styles.navBrand} aria-label="AESDR / Enterprise — home">
          <SubLogoCompact size={20} />
        </Link>

        <div className={styles.navLinks}>
          {NAV_LINKS.map((link) => {
            const isActive =
              link.href === "/enterprise"
                ? pathname === "/enterprise"
                : pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
                aria-current={isActive ? "page" : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <Link href="/" className={styles.navBackLink} aria-label="Back to aesdr.com consumer site">
          ← aesdr.com
        </Link>

        <Link href="/enterprise/contact?source=nav" className={styles.navCta}>
          Book a walkthrough
        </Link>
      </div>
    </nav>
  );
}
