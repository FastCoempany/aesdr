import styles from "../enterprise.module.css";
import InlineCTA from "../_components/InlineCTA";
import SpecSection from "../_components/SpecSection";

/**
 * /enterprise/champion-kit — what a champion sends up the chain.
 *
 * Solves the H.15.1 gap: the AE/SDR/manager who likes AESDR doesn't always
 * own the budget. They need forwardable materials to make the case to
 * whoever signs. Three things on this page:
 *   1. The two-paragraph forwardable email
 *   2. The 30-second pitch (talking points)
 *   3. The expected objections and the honest answers
 *
 * Pairs with /enterprise/procurement (security/legal/L&D) — that one's for
 * the reviewers, this one's for the buyer.
 */

export const metadata = {
  title: "Champion kit — AESDR / Enterprise",
  description:
    "Forwardable materials for the champion making the case for AESDR / Enterprise to whoever owns the budget. Two paragraphs, thirty seconds, and the objections you'll actually hear.",
  robots: { index: true, follow: true },
};

const OBJECTIONS: { number: string; objection: string; answer: string }[] = [
  {
    number: "01",
    objection: '"We already have a sales training platform."',
    answer:
      "Most orgs do — usually an LMS-embedded compliance course or a methodology vendor (MEDDIC, Sandler, etc.). AESDR doesn't compete with either; it covers the part those two skip — managing your manager, comp realities, the part of the job nobody writes a course on. It's a complement, not a replacement.",
  },
  {
    number: "02",
    objection: '"Can\'t we just record our own internal training?"',
    answer:
      "You can. We've seen orgs try; most stall after the first three lessons because building 12 hours of curated content is somebody's full-time job for six months. AESDR is the back catalogue. Your own training stays for the things specific to your product / motion.",
  },
  {
    number: "03",
    objection: '"How do we know they\'ll actually finish it?"',
    answer:
      "Honest answer: ~60-70% of self-paced courses get half-finished. We do four things that help — implementation-intention onboarding (study window saved at signup), spaced retention emails, in-product resume CTAs, manager-tier dashboard. Completion is a function of how much your manager looks at the dashboard.",
  },
  {
    number: "04",
    objection: '"What\'s the ROI on $1,499 for a team of 10?"',
    answer:
      "$150 / seat. One avoidable bad hire — or one AE who ramps two weeks faster — pays for the whole team plan. The Bridge Group 2024 number on SDR cost-to-replace is roughly $115K. If AESDR delays one departure on the cohort, the maths is uncontroversial.",
  },
  {
    number: "05",
    objection: '"Is this another founder running a thinly-veiled coaching upsell?"',
    answer:
      "No. AESDR is a one-time purchase. Lifetime access. There is no premium tier, no coaching call upsell, no community subscription. We make $249-$1,499 per seat and that's the entire commercial relationship. If you want our help on top, we charge for it explicitly under Custom Enterprise — but the course doesn't tee that up.",
  },
  {
    number: "06",
    objection: '"What if we hate it?"',
    answer:
      "30-day refund on the Team tier — full refund of unused seats. You hit your AEs and SDRs with one cohort in Lesson 1-3. If the feedback is bad, you tell us in week three and we refund. We'd rather lose this deal cleanly than win it on a fit we already knew was wrong.",
  },
];

export default function ChampionKitPage() {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.container}>
          <p className={styles.eyebrow}>Champion kit</p>
          <h1 className={styles.heroHeadline}>
            Make the case in two paragraphs.
          </h1>
          <p className={styles.heroSubhead}>
            If you like AESDR but you don&apos;t own the budget, this page is
            yours. Forwardable email, thirty-second pitch, the six objections
            you&apos;ll actually hear with the honest answers next to them.
            Send the whole page; or copy the chunks you need.
          </p>
        </div>
      </section>

      <section className={`${styles.sectionTight} ${styles.sectionDivider}`}>
        <div className={styles.containerNarrow}>
          <p className={styles.eyebrow}>The forwardable email</p>
          <h2 className={styles.h2}>Two paragraphs, no asks beyond a 10-minute reply.</h2>
          <hr className={styles.divider} />

          <div
            style={{
              background: "#fff",
              border: "1px solid var(--light)",
              padding: "24px 28px",
              fontFamily: "Georgia, 'Source Serif 4', serif",
              fontSize: 15,
              lineHeight: 1.7,
              color: "var(--ink)",
              marginBottom: 16,
            }}
          >
            <p style={{ margin: "0 0 14px", fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: ".2em", color: "var(--muted)" }}>
              SUBJECT: <strong>A $1,499 line item I&apos;d like to defend</strong>
            </p>
            <p style={{ margin: "0 0 14px" }}>Hi [name],</p>
            <p style={{ margin: "0 0 14px" }}>
              I want to pull AESDR / Enterprise in for our [SDRs / AEs / sales team].
              It&apos;s $1,499 one-time for 10 seats — lifetime access, no
              subscription. It covers the part of the sales role nobody trains
              on: managing your manager, the math of pipeline, comp realities,
              what to do when the script runs out. Twelve self-paced lessons,
              ~25 minutes each.
            </p>
            <p style={{ margin: "0 0 14px" }}>
              I&apos;m flagging it because the alternative is another six
              months of figure-it-out-yourself. Two pages back this up if
              you&apos;d like to read them — <a href="https://aesdr.com/enterprise/procurement" style={{ color: "var(--crimson)" }}>aesdr.com/enterprise/procurement</a> for
              security / legal / L&amp;D, <a href="https://aesdr.com/preview" style={{ color: "var(--crimson)" }}>aesdr.com/preview</a> for what
              a lesson actually looks like. 30-day refund of unused seats if
              we don&apos;t like it. Can I get a 10-minute window this week
              to walk through the math?
            </p>
            <p style={{ margin: 0 }}>Thanks,<br/>[your name]</p>
          </div>
          <p
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 11,
              letterSpacing: ".2em",
              textTransform: "uppercase",
              color: "var(--muted)",
            }}
          >
            Copy as-is or rewrite. Two rules: name the line item explicitly,
            offer the out-clause (refund) before they ask.
          </p>
        </div>
      </section>

      <section className={`${styles.sectionTight} ${styles.sectionDivider}`}>
        <div className={styles.containerNarrow}>
          <p className={styles.eyebrow}>The thirty-second pitch</p>
          <h2 className={styles.h2}>For when you bump into them in the kitchen.</h2>
          <hr className={styles.divider} />
          <ul
            style={{
              fontFamily: "Georgia, 'Source Serif 4', serif",
              fontSize: 16,
              lineHeight: 1.75,
              paddingLeft: 22,
            }}
          >
            <li>
              <strong>What:</strong> Twelve-lesson course for AEs and SDRs,
              built by AEs and SDRs. Self-paced, interactive, ~5 hours total.
            </li>
            <li>
              <strong>Who it&apos;s for:</strong> Our first-18-months people.
              Covers the part nobody trains on — managing up, pipeline math,
              comp, sober selling.
            </li>
            <li>
              <strong>Cost:</strong> $1,499 one-time, 10 seats, lifetime
              access. $150 per seat.
            </li>
            <li>
              <strong>Risk:</strong> 30-day refund on unused seats. Real
              refund, not store credit.
            </li>
            <li>
              <strong>Decision:</strong> Yes / no by end of week. I&apos;ll
              run the rollout if it&apos;s yes.
            </li>
          </ul>
        </div>
      </section>

      <section className={`${styles.sectionTight} ${styles.sectionDivider}`}>
        <div className={styles.container}>
          <p className={styles.eyebrow}>The objections</p>
          <h2 className={styles.h2}>Six questions you&apos;ll actually hear.</h2>
          <hr className={styles.divider} />
          {OBJECTIONS.map((o) => (
            <SpecSection key={o.number} number={o.number} title={o.objection}>
              <p className={styles.bodyDense}>{o.answer}</p>
            </SpecSection>
          ))}
        </div>
      </section>

      <section className={`${styles.sectionTight} ${styles.sectionDivider}`}>
        <div className={styles.containerNarrow}>
          <p className={styles.eyebrow}>If you want backup</p>
          <h2 className={styles.h2}>We&apos;ll co-author the case.</h2>
          <hr className={styles.divider} />
          <p className={styles.body}>
            If your buyer wants to talk to a human at AESDR before signing
            off, that&apos;s normal — and we&apos;ll do it. One call,
            twenty minutes, on your timeline. Loop us in via{" "}
            <a href="mailto:hello@aesdr.com" style={{ color: "var(--crimson)" }}>
              hello@aesdr.com
            </a>{" "}
            with your buyer&apos;s name and the meeting time.
          </p>
          <div style={{ marginTop: 24 }}>
            <InlineCTA href="/enterprise/contact?source=champion-kit">
              Ask for buyer-side backup
            </InlineCTA>
          </div>
        </div>
      </section>
    </>
  );
}
