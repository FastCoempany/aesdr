import type { Metadata } from "next";
import LegalShell, { Section } from "@/components/LegalShell";

export const metadata: Metadata = {
  title: "About | AESDR",
  description:
    "Who built AESDR, why it exists, and the philosophy behind the 12-course survival curriculum for early-career AEs and SDRs.",
};

export default function AboutPage() {
  return (
    <LegalShell eyebrow="About" title="About AESDR" current="about" ghostNumber="01">
      <Section title="Who built this">
        <p style={{ marginBottom: 14 }}>
          AESDR is the curriculum I wish someone had handed me on day one.
          Built by Antaeus Coe &mdash; ten-plus years carrying a bag in SaaS,
          mid-market through enterprise, on both sides of the desk: SDR,
          AE, and the manager who had to coach the next cohort through the
          same mistakes I&rsquo;d already made.
        </p>
        <p>
          Built with people who lived the same job. The validation set
          includes SDRs, AEs, and sales leaders from companies whose names
          you&rsquo;d recognize &mdash; their pushback shaped the curriculum more
          than anything I could have written alone.
        </p>
      </Section>

      <Section title="Why it exists">
        <p style={{ marginBottom: 14 }}>
          The first eighteen months of a SaaS sales career are an expensive
          accident. The 2024 Bridge Group state-of-the-SDR report puts
          tenure at <strong>1.9 years</strong>; only <strong>16%</strong> of
          SDRs get promoted in any given year; only <strong>51%</strong> of
          AEs hit quota. The training most orgs ship into that gap is
          generic, motivational, or pitched at the wrong altitude.
        </p>
        <p>
          AESDR covers the part of the job that
          actually gets you out of that statistic &mdash; pipeline math,
          managing up, comp realities, sober selling, prospecting that
          doesn&rsquo;t read like a confession letter.
        </p>
      </Section>

      <Section title="The philosophy">
        <p style={{ marginBottom: 14 }}>
          This teaches how the job works, not how to feel about it —
          no guru energy, no motivational performance, and no recycled
          LinkedIn wisdom anywhere in the format. 12 courses, plus seven
          things you keep and use, all interactive rather than video
          lectures, because the parts of the job that actually matter
          are decisions made in a quiet room rather than pep talks
          delivered to an audience.
        </p>
        <p>
          You buy it once and it&rsquo;s yours — no subscription, no renewal.
          14-day, no-questions-asked refund window — and if it doesn&rsquo;t
          deliver real value to you across that window, we genuinely don&rsquo;t want your
          money.
        </p>
      </Section>

      <Section title="Who it&rsquo;s for">
        <ul style={{ paddingLeft: 22 }}>
          <li>First-1-to-2-year SDRs and AEs in startup or mid-market SaaS</li>
          <li>Career-switchers in their first SaaS sales seat</li>
          <li>Sales managers buying for ramp acceleration on junior hires</li>
          <li>
            AEs and SDRs frustrated by broken tools, bloated CRMs, and
            shifting goalposts
          </li>
        </ul>
      </Section>

      <Section title="Who it&rsquo;s not for">
        <ul style={{ paddingLeft: 22 }}>
          <li>Anyone looking for motivation</li>
          <li>
            Anyone hunting LinkedIn-friendly badges, certifications, or
            recruiter clout
          </li>
          <li>
            AEs or SDRs with eight-plus years in the seat who aren&rsquo;t
            open to a re-look at fundamentals
          </li>
        </ul>
      </Section>

      <Section title="Contact">
        <p>
          Questions, feedback, or support reach us at{" "}
          <a
            href="mailto:hello@aesdr.com"
            style={{ color: "var(--crimson)", textDecoration: "underline" }}
          >
            hello@aesdr.com
          </a>
          {" "}— a real inbox monitored by a real human, with a 48-hour
          response window during the working week.
        </p>
      </Section>
    </LegalShell>
  );
}
