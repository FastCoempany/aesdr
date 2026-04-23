import type { Metadata } from "next";
import Link from "next/link";

import AesdrBrand from "@/components/AesdrBrand";
import styles from "./syllabus.module.css";

export const metadata: Metadata = {
  title: "The Syllabus | AESDR",
  description:
    "The full 12-lesson AESDR syllabus — filed under one call number. The question each lesson answers, on its own index card.",
};

type Lesson = {
  num: string;
  chapter: string;
  title: string;
  stylized?: boolean;
  question: string;
  annotation: string;
  stamp: string;
};

const LESSONS: Lesson[] = [
  { num: "L01", chapter: "ch. 01", title: "Building Real Camaraderie",           question: "“When’s the last time your team felt like an actual team?”",                                                   annotation: "— keep. read twice.",        stamp: "Mon 01" },
  { num: "L02", chapter: "ch. 02", title: "Breaking Down Silos",                  question: "“How many deals died in the handoff you never talked about?”",                                                  annotation: "— cc: solutions eng.",       stamp: "Tue 02" },
  { num: "L03", chapter: "ch. 03", title: "Performance Pitfalls",                 question: "“Are you getting better — or just getting by?”",                                                                annotation: "— mirror test.",             stamp: "Wed 03" },
  { num: "L04", chapter: "ch. 04", title: "Navigating Manager Madness",           question: "“Does your manager coach you… or just count your calls and faults?”",                                           annotation: "— send to Todd.",            stamp: "Thu 04" },
  { num: "L05", chapter: "ch. 05", title: "tHe SaLeS pLaYbOoK",    stylized: true, question: "“What’s your system? And if you don’t have one — what have you been doing?”",                                   annotation: "— LinkedIn isn’t one.",      stamp: "Fri 05" },
  { num: "L06", chapter: "ch. 06", title: "bEyOnD tHe SaLeS pLaYbOoK", stylized: true, question: "“What do you do when the script runs out and you’re live?”",                                               annotation: "— improvise w/ intent.",     stamp: "Sat 06" },
  { num: "L07", chapter: "ch. 07", title: "Prospecting & Pipeline",               question: "“If inbound dried up tomorrow, would you survive?”",                                                            annotation: "— build outbound muscle.",   stamp: "Sun 07" },
  { num: "L08", chapter: "ch. 08", title: "The 30% Rule",                         question: "“What’s your actual close rate? Not the one you told your VP.”",                                                annotation: "— do the math honestly.",    stamp: "Mon 08" },
  { num: "L09", chapter: "ch. 09", title: "CRM Survival Guide",                   question: "“Is your CRM protecting you — or building the case against you?”",                                              annotation: "— log before you forget.",   stamp: "Tue 09" },
  { num: "L10", chapter: "ch. 10", title: "Breaking Down the Commission Myth",    question: "“Can you survive three bad months in a row? Mentally? Financially?”",                                           annotation: "— 3 months runway min.",     stamp: "Wed 10" },
  { num: "L11", chapter: "ch. 11", title: "Sober Selling",                        question: "“What if the problem is bigger than your process — what if it’s what you’re doing when no one’s watching?”",   annotation: "— 21+. not metaphor.",       stamp: "Thu 11" },
  { num: "L12", chapter: "ch. 12", title: "Leveling Up SaaS Relationships",       question: "“Who would vouch for you if you changed companies tomorrow?”",                                                  annotation: "— name 5.",                  stamp: "Fri 12" },
];

export default function SyllabusPage() {
  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <AesdrBrand className={styles.brand}>
          <span className={styles.irisText}>AESDR</span>
          <span className={styles.badge}>Card Catalog</span>
        </AesdrBrand>
        <Link href="/" className={styles.backlink}>
          &larr; Back to home
        </Link>
      </header>
      <div className={styles.irisLine} />

      <section className={styles.hero}>
        <div className={styles.heroKicker}>Shelf 12 &middot; Drawer A &middot; Est. 2026</div>
        <h1 className={styles.heroTitle}>
          The <em>Syllabus.</em>
        </h1>
        <p className={styles.heroSub}>
          Twelve lessons filed under one call number. Check each one out.
          Return when you’re a different rep.
        </p>
        <p className={styles.deweyStack}>Dewey 658.85 &middot; AESDR/SAL &middot; Non-Fiction</p>
      </section>

      <div className={styles.drawerLabel}>
        <div className={styles.drawerTitle}>Drawer A — 12 Lessons</div>
        <div className={styles.drawerMeta}>Sorted by Chapter Order</div>
      </div>

      <section className={styles.catalogGrid}>
        {LESSONS.map((lesson) => (
          <article key={lesson.num} className={styles.card}>
            <div className={styles.callnum}>
              <span className={styles.lessonNum}>658.85 / {lesson.num}</span>
              <span>{lesson.chapter}</span>
            </div>
            <h3
              className={
                lesson.stylized
                  ? `${styles.lessonTitle} ${styles.stylized}`
                  : styles.lessonTitle
              }
            >
              {lesson.title}
            </h3>
            <p className={styles.lessonQuestion}>{lesson.question}</p>
            <span className={styles.annotation}>{lesson.annotation}</span>
            <div className={styles.stamp}>
              DUE<span className={styles.stampDate}>{lesson.stamp}</span>
            </div>
          </article>
        ))}
      </section>

      <section className={styles.cta}>
        <h2 className={styles.ctaHead}>Check out all 12.</h2>
        <p className={styles.ctaBody}>
          Lifetime shelf access. No late fees. The card catalog never closes —
          but the reps who read it get further.
        </p>
        <Link href="/#pricing" className={styles.ctaBtn}>
          Get Access
        </Link>
        <div className={styles.ctaFoot}>
          14-day refund &middot; 12 lessons &middot; 5 takeaway tools
        </div>
      </section>

      <footer className={styles.footer}>
        AESDR &copy; {new Date().getFullYear()} &middot;{" "}
        <Link href="/terms">Terms</Link> &middot;{" "}
        <Link href="/privacy">Privacy</Link> &middot;{" "}
        <Link href="/refund-policy">Refunds</Link> &middot;{" "}
        <Link href="/about">About</Link> &middot;{" "}
        <Link href="/contact">Contact</Link>
      </footer>
    </main>
  );
}
