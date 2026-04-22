import Link from "next/link";
import { redirect } from "next/navigation";

import SignOutButton from "@/components/SignOutButton";
import PasswordOverlay from "@/components/PasswordOverlay";
import { createClient } from "@/utils/supabase/server";
import styles from "./welcome.module.css";

export const metadata = {
  title: "Welcome | AESDR",
};

export default async function WelcomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const needsPasswordChange = !!user.user_metadata?.needs_password_change;

  return (
    <main className={styles.page}>
      <header className={styles.nav}>
        <Link href="/" className={styles.brand}>AESDR</Link>
        <SignOutButton />
      </header>

      <div className={styles.hero}>
        <div className={styles.heroLeft}>
          <div className={styles.monoLabel}>AESDR &middot; 12 Lessons &middot; A Better You</div>
          <div className={styles.warnBox}>
            <div className={styles.warnTitle}>
              <span className={styles.warnIcon}>!</span> Content Warning
            </div>
            <div className={styles.warnText}>
              This course contains uncomfortable truths about your{" "}
              <strong>pipeline</strong>, your <strong>apartment</strong>, your{" "}
              <strong>bar tab</strong>, your <strong>commission check</strong>,
              and your <strong>relationship status</strong>.
            </div>
          </div>
          <div style={{ marginTop: "24px" }}>
            <Link href="/dashboard" className={styles.btnIris}>
              Continue &rarr;
            </Link>
          </div>
        </div>

        <div className={styles.heroRight}>
          <div className={`${styles.corner} ${styles.cornerTL}`} />
          <div className={`${styles.corner} ${styles.cornerTR}`} />
          <div className={`${styles.corner} ${styles.cornerBL}`} />
          <div className={`${styles.corner} ${styles.cornerBR}`} />
          <div className={styles.monoLabel} style={{ color: "var(--muted)" }}>
            The Unfiltered SaaS Sales Survival Guide
          </div>
          <h1 className={styles.heroH1}>
            Stop Surviving.<br />
            Start <span className={styles.heroAccent}>Owning</span> It.
          </h1>
          <p className={styles.heroP}>
            This isn&rsquo;t corporate-y but it will advance your career. 12
            interactive, field-tested sessions for AEs and SDRs who&rsquo;re
            serious about controlling chaos, managing toxic leadership,
            protecting your commission - and your future.
          </p>
          <div className={styles.ambientLine} />
        </div>
      </div>

      {needsPasswordChange && <PasswordOverlay />}
    </main>
  );
}
