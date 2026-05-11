import type { Metadata } from "next";
import LegalShell, { Section } from "@/components/LegalShell";

export const metadata: Metadata = {
  title: "About | AESDR",
  description:
    "Who built AESDR, why it exists, and the philosophy behind the 12-course curriculum.",
};

export default function AboutPage() {
  return (
    <LegalShell eyebrow="About" title="About AESDR" current="about">
      <Section title="Who built this">
        <p>
          AESDR was built by sales operators with over a decade of combined
          experience closing complex deals in SaaS. This isn&rsquo;t a course
          from someone who read about sales &mdash; it&rsquo;s from people
          who carried bags, lived the quota pressure, learned what actually
          works when the playbooks are broken, and have managed AEs and SDRs
          on the other side.
        </p>
      </Section>

      <Section title="Philosophy">
        <p style={{ marginBottom: 14 }}>
          The operating manual, not the motivation engine. No guru energy,
          no &ldquo;crush it&rdquo; framing, no recycled LinkedIn wisdom.
          AESDR teaches the part of the role most reps figure out the hard
          way &mdash; what good actually looks like, how to read your own
          pipeline honestly, and the judgment moves that separate the rep
          who survives ramp from the rep who doesn&rsquo;t.
        </p>
        <p>
          12 modular courses. 5 takeaway tools. Interactive HTML format, not
          video lectures. Lifetime access. 14-day, no-questions-asked refund.
        </p>
      </Section>

      <Section title="Who it&rsquo;s for">
        <ul style={{ paddingLeft: 22 }}>
          <li>First-1-to-2-year SDRs and AEs in startup SaaS</li>
          <li>Career-switchers in their first SaaS sales role</li>
          <li>SDR managers buying for ramp acceleration on junior hires</li>
          <li>
            Reps frustrated by broken tools, bloated CRMs, and shifting
            goalposts
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
            Reps with 8+ years in the seat who aren&rsquo;t open to a
            re-look at fundamentals
          </li>
        </ul>
      </Section>

      <Section title="Contact">
        <p>
          Questions, feedback, or support requests:{" "}
          <a
            href="mailto:support@aesdr.com"
            style={{ color: "var(--crimson)", textDecoration: "underline" }}
          >
            support@aesdr.com
          </a>
          . We respond within 48 hours.
        </p>
      </Section>
    </LegalShell>
  );
}
