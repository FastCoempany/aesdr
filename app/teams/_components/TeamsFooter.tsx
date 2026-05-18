import Link from "next/link";
import styles from "../teams.module.css";
import { SubLogoTiny } from "./SubLogo";

/**
 * Subsidiary footer.
 *
 * Holds the tiny "A·OL" monogram, the "Powered by aesdr.com" truthful-
 * positioning line, and a small footer link cluster. The leponeus mascot
 * appears here only — as a 28px monogram, never larger — per canon §3.5.
 */

const FOOTER_LINKS = [
  { href: "/teams/contact", label: "Contact" },
  { href: "/teams/partners", label: "Partners" },
  { href: "/teams/pricing", label: "Pricing" },
  { href: "/teams/integrations", label: "Integrations" },
  { href: "/teams/downloads", label: "Downloads" },
  { href: "/", label: "← aesdr.com" },
] as const;

export default function TeamsFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerLeft}>
          <div className={styles.footerMark}>
            <SubLogoTiny size={13} />
          </div>
          <div className={styles.poweredBy}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/mascot/leponeus-doctrine.png"
              alt=""
              className={styles.poweredByMono}
              draggable={false}
            />
            <span>
              AESDR / Operating Layer is built on{" "}
              <Link href="/" style={{ color: "var(--ink)", textDecoration: "underline" }}>
                aesdr.com
              </Link>
              {" "}— the rep-direct course that 1st- and 2nd-year SDRs and AEs actually use.
              The same 12 lessons, packaged for sales orgs.
            </span>
          </div>
        </div>

        <div className={styles.footerRight}>
          <div className={styles.footerLinks}>
            {FOOTER_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className={styles.footerLink}>
                {link.label}
              </Link>
            ))}
          </div>
          <div className={styles.footerCopy}>
            AESDR © 2026 · hello@aesdr.com
          </div>
        </div>
      </div>
    </footer>
  );
}
