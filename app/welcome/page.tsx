import Link from "next/link";
import { redirect } from "next/navigation";

import AesdrBrand from "@/components/AesdrBrand";
import SignOutButton from "@/components/SignOutButton";
import PasswordOverlay from "@/components/PasswordOverlay";
import { Mascot } from "@/components/brand/Mascot";
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
        <AesdrBrand className={styles.brand} />
        <SignOutButton />
      </header>

      <div className={styles.hero}>
        <div className={styles.heroLeft}>
          <div className={styles.monoLabel}>AESDR &middot; 12 Courses &middot; A Better You</div>
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
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <Mascot pose="doctrine" size={280} priority />
          </div>
          <div className={styles.monoLabel} style={{ color: "var(--muted)" }}>
            The Unfiltered SaaS Sales Survival Guide
          </div>
          <h1 className={styles.heroH1}>
            Stop Surviving.<br />
            Start <span className={styles.heroAccent}>Owning</span> It.
          </h1>
          <p className={styles.heroP}>
            This isn&rsquo;t corporate-y but it will advance your career. 12
            interactive, field-tested lessons for AEs and SDRs serious about
            controlling chaos, managing toxic leadership, and protecting your
            commission &mdash; and your future.
          </p>
          <div>
            <Link href="/syllabus" className={styles.btnOutline}>
              Syllabus Peek
            </Link>
          </div>
          <div className={styles.ambientLine} />
        </div>
      </div>

      {needsPasswordChange && <PasswordOverlay />}
    </main>
  );
}
