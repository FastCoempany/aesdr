import Image from "next/image";

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
    </main>
  );
}
