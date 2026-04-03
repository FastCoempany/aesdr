import Image from "next/image";

import styles from "./page.module.css";

export default function LandingPage() {
  return (
    <main className={styles.page}>
      <div aria-hidden="true" className={styles.orbA} />
      <div aria-hidden="true" className={styles.orbB} />

      <div className={styles.shell}>
        <header className={styles.header}>
          <div className={styles.brand}>
            <span className={styles.brandWord}>AESDR</span>
          </div>
          <div className={styles.badge}>Public access closed</div>
        </header>

        <section className={styles.hero}>
          <div className={styles.copy}>
            <p className={styles.eyebrow}>Private launch hold</p>
            <h1 className={styles.title}>The doors stay shut while we build.</h1>
            <div className={styles.slogan}>AEs &amp; SDRs rule this world</div>
            <p className={styles.subcopy}>
              aesdr.com is live, but the product is not open yet. The course,
              tools, and curriculum stay sealed until the first release is
              ready.
            </p>

            <div className={styles.chips}>
              <div className={styles.chip}>Ceramic bunny on watch</div>
              <div className={styles.chip}>Golden-mask energy only</div>
              <div className={styles.chip}>Launch window pending</div>
            </div>
          </div>

          <div className={styles.visualWrap}>
            <div aria-hidden="true" className={styles.visualHalo} />
            <div className={styles.visualFrame}>
              <div className={styles.visualInset}>
                <Image
                  alt="Ceramic humanoid bunny holding a mask"
                  className={styles.image}
                  height={768}
                  priority
                  src="/ceramic-bunny-mask.png"
                  width={768}
                />
                <div className={styles.caption}>
                  <span className={styles.captionLabel}>Guardian</span>
                  <span className={styles.captionValue}>
                    Ceramic bunny / golden mask
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className={styles.footer}>
          <span>AESDR 2026</span>
          <span>Site locked until release</span>
        </footer>
      </div>
    </main>
  );
}
