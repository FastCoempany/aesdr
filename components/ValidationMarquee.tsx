/**
 * ValidationMarquee — auto-scrolling row of company names + valuations sits
 * between the testimonials section and the pricing section on the landing.
 *
 * Editorial palette only: cream background, ink names, crimson valuations,
 * light separators. Mono accents (valuations + separators). Playfair italic
 * for the company names. Hover pauses the scroll.
 *
 * Structure adapted from aesdr-design-system/marketing-landing-preview.html
 * (the Antaeus marketing preview that uses the same component pattern).
 * Same companies — these are the validators across the FastCoempany product
 * line, including AESDR.
 */

import styles from "./ValidationMarquee.module.css";

type Validator = {
  name: string;
  /** Valuation, fundraise, or acquisition tag. Optional — some are unbadged. */
  badge?: string;
};

const VALIDATORS: Validator[] = [
  { name: "Harvey", badge: "$8B" },
  { name: "Pendo", badge: "$2.6B" },
  { name: "Job&Talent", badge: "$2.35B" },
  { name: "OpenGov", badge: "$1.8B acq." },
  { name: "Scribe", badge: "$1.3B" },
  { name: "Superhuman", badge: "acq. by Grammarly" },
  { name: "CADDi", badge: "$470M" },
  { name: "Filevine", badge: "$400M raised" },
  { name: "Aisera", badge: "acq. by Automation Anywhere" },
  { name: "k-ID", badge: "$51M · a16z" },
  { name: "Lorikeet", badge: "$51M raised" },
  { name: "Craft", badge: "$42M raised" },
  { name: "Smokeball", badge: "$30M" },
  { name: "Rally UXR", badge: "$20M raised" },
  { name: "Parable", badge: "$16.5M seed" },
  { name: "Shapr3D" },
  { name: "Sybill" },
  { name: "HeyMilo" },
  { name: "Clearbrief" },
  { name: "Moonhub" },
  { name: "harpin AI" },
  { name: "Newscatcher" },
  { name: "Duckie" },
];

const SECTORS =
  "Seed to Series E · Legal AI · SaaS · HealthTech · Fintech · Staffing · Manufacturing · DevTools";

function MarqueeRow({ ariaHidden = false }: { ariaHidden?: boolean }) {
  return (
    <>
      {VALIDATORS.map((v, i) => (
        <span key={`${v.name}-${i}-${ariaHidden ? "d" : "o"}`} className={styles.row}>
          <span className={styles.item} aria-hidden={ariaHidden}>
            <span className={styles.name}>{v.name}</span>
            {v.badge && <span className={styles.badge}>{v.badge}</span>}
          </span>
          <span className={styles.sep} aria-hidden="true">
            |
          </span>
        </span>
      ))}
    </>
  );
}

export default function ValidationMarquee() {
  return (
    <section className={styles.section} aria-label="Validation">
      <header className={styles.header}>
        <p className={styles.eyebrow}>Validation</p>
        <h2 className={styles.headline}>
          Validated by GTM teams at companies worth $20B+ combined
        </h2>
        <p className={styles.sub}>
          {VALIDATORS.length}+ companies. Seed to Series E. Built with feedback
          from the founders, sales leaders, and reps at every one.
        </p>
      </header>

      <div className={styles.marqueeWrap}>
        <div className={styles.marquee}>
          <MarqueeRow />
          <MarqueeRow ariaHidden />
        </div>
      </div>

      <p className={styles.sectors}>{SECTORS}</p>
    </section>
  );
}
