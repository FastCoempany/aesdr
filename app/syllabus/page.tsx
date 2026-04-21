import type { Metadata } from "next";
import Link from "next/link";
import dynamic from "next/dynamic";

import styles from "./syllabus.module.css";

const DeckStack = dynamic(() => import("@/components/DeckStack"));

export const metadata: Metadata = {
  title: "The Syllabus | AESDR",
  description:
    "The full 12-lesson AESDR syllabus. Peel through each lesson to preview the question it answers.",
};

export default function SyllabusPage() {
  return (
    <main className={styles.page}>
      <header className={styles.nav}>
        <Link href="/" className={styles.brand}>AESDR</Link>
        <Link href="/" className={styles.backLink}>
          &larr; Back to home
        </Link>
      </header>

      <section className={styles.hero}>
        <p className={styles.kicker}>The Syllabus &middot; 12 Lessons</p>
        <h1 className={styles.title}>
          Twelve <span className={styles.titleAccent}>lessons.</span>
          <br />One peel at a time.
        </h1>
        <p className={styles.sub}>
          Click the active card (or use the buttons) to peel each lesson
          off the stack. Each card holds the question the lesson answers.
        </p>
      </section>

      <DeckStack standalone />

      <section className={styles.cta}>
        <p className={styles.ctaKicker}>Ready?</p>
        <h2 className={styles.ctaHead}>
          All 12 lessons. 5 takeaway tools. Lifetime access.
        </h2>
        <div className={styles.ctaRow}>
          <Link href="/#pricing" className={styles.ctaBtn}>
            Get Access
          </Link>
          <Link href="/" className={styles.ctaGhost}>
            Back to landing
          </Link>
        </div>
      </section>

      <footer className={styles.footer}>
        <span style={{ opacity: 0.5 }}>
          AESDR &copy; {new Date().getFullYear()}
        </span>
        <Link href="/terms">Terms</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/refund-policy">Refunds</Link>
        <Link href="/about">About</Link>
        <Link href="/contact">Contact</Link>
      </footer>
    </main>
  );
}
