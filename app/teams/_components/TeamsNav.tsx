"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "../teams.module.css";
import { SubLogoCompact } from "./SubLogo";

/**
 * Subsidiary navigation bar.
 *
 * Sits on every page under /teams via the subsidiary layout. Holds the
 * compact sub-logo, primary section links, a "back to aesdr.com" exit,
 * and a single "book a walkthrough" CTA.
 *
 * Client component so it can read the current pathname via usePathname()
 * for the active-link iris-shimmer underline. The rest of the layout
 * remains server-rendered.
 */

const NAV_LINKS = [
  { href: "/teams", label: "Overview" },
  { href: "/teams/curriculum", label: "Curriculum" },
  { href: "/teams/implementation", label: "Implementation" },
  { href: "/teams/diagnostic", label: "Diagnostic" },
  { href: "/teams/integrations", label: "Integrations" },
  { href: "/teams/partners", label: "Partners" },
  { href: "/teams/pricing", label: "Pricing" },
] as const;

export default function TeamsNav() {
  const pathname = usePathname() ?? "/teams";

  return (
    <nav className={styles.nav} aria-label="Operating Layer navigation">
      <div className={styles.navInner}>
        <Link href="/teams" className={styles.navBrand} aria-label="AESDR / Operating Layer — home">
          <SubLogoCompact size={20} />
        </Link>

        <div className={styles.navLinks}>
          {NAV_LINKS.map((link) => {
            const isActive =
              link.href === "/teams"
                ? pathname === "/teams"
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

        <Link href="/teams/contact?source=nav" className={styles.navCta}>
          Book a walkthrough
        </Link>
      </div>
    </nav>
  );
}
