import Image from "next/image";

import GhostButton from "@/components/GhostButton";
import Testimonials from "@/components/Testimonials";
import styles from "./page.module.css";

const slogan = "AEs & SDRs rule this world";

export default function LandingPage() {
  return (
    <main className={styles.page}>
      <div aria-hidden="true" className={styles.atmosphere} />

      <header className={styles.header}>
        <span className={styles.brand}>AESDR</span>
      </header>

      <section className={styles.stage}>
        <div aria-hidden="true" className={styles.spotlight} />
        <div className={styles.bunnyWrap}>
          <div aria-hidden="true" className={styles.bunnyAura} />
          <Image
            alt="Ceramic humanoid bunny holding a mask"
            className={styles.bunny}
            height={1024}
            priority
            src="/ceramic-bunny-mask-cutout.png"
            width={858}
          />
        </div>

        <h1 className={styles.slogan}>
          <span className={styles.sloganText} data-text={slogan}>
            {slogan}
          </span>
        </h1>
      </section>

      <Testimonials />
      <GhostButton />

      <footer
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "20px 24px",
          display: "flex",
          justifyContent: "center",
          gap: "24px",
          flexWrap: "wrap",
          fontFamily: "var(--mono)",
          fontSize: "9px",
          letterSpacing: ".1em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
          zIndex: 2,
        }}
      >
        <span style={{ opacity: 0.5 }}>AESDR &copy; {new Date().getFullYear()}</span>
        <a href="/terms" style={{ color: "var(--text-muted)", textDecoration: "none", opacity: 0.7 }}>Terms</a>
        <a href="/privacy" style={{ color: "var(--text-muted)", textDecoration: "none", opacity: 0.7 }}>Privacy</a>
        <a href="/refund-policy" style={{ color: "var(--text-muted)", textDecoration: "none", opacity: 0.7 }}>Refunds</a>
        <a href="/about" style={{ color: "var(--text-muted)", textDecoration: "none", opacity: 0.7 }}>About</a>
        <a href="/contact" style={{ color: "var(--text-muted)", textDecoration: "none", opacity: 0.7 }}>Contact</a>
      </footer>
    </main>
  );
}
