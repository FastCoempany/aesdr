/**
 * Page: /partners/timeline
 * Anatomy of a pilot — week-by-week from agreement signing through
 * end of attribution window. Phase 2 build.
 */

import type { Metadata } from "next";
import { HubPage } from "@/components/partners/HubChrome";
import { MonoEyebrow, HubCTA, CaveatLayer } from "@/components/partners/HubElements";

export const metadata: Metadata = {
  title: "Pilot Timeline · AESDR Partners",
  description:
    "Week-by-week from agreement signing through end of attribution window. About 11 weeks end to end.",
};

const STEPS = [
  {
    when: "Week 0",
    title: "Agreement signed.",
    you: "Sign the partnership agreement. Send us your preferred payment method, tax form (W-9 or W-8BEN), and audience description.",
    us: "Send the full private partner kit. Send a $500 sign-on within 5 business days (Cohort 1 invited partners only). Schedule a 30-min prep call.",
  },
  {
    when: "Week 1",
    title: "Setup + kit review.",
    you: "Read the full private kit. Pick a workshop date with us. Confirm your audience list size and segments.",
    us: "Build your partner-attributed registration page. Generate your tracking URL and UTM scheme. Lock the workshop date on calendar.",
  },
  {
    when: "Week 2",
    title: "Promotion drafts.",
    you: "Review the launch email draft we send you. Tweak it in your voice. Send back for sign-off.",
    us: "Send launch + reminder email drafts pre-filled with your details. 48-hour turnaround on any rewrites you propose.",
  },
  {
    when: "Week 3 — Launch send",
    title: "Email 1.",
    you: "Send the launch email to your full list. Share open rate + click rate within 24 hours.",
    us: "Confirmation emails fire on every registration. Friday report includes day-by-day signups.",
  },
  {
    when: "Week 3-4",
    title: "Mid-window soft-touches.",
    you: "Nothing required. Optional: a single social post or DM nudge if it fits your audience norms.",
    us: "Reminder emails on auto-schedule. Soft DMs to clicked-but-didn't-register handles where signals warrant.",
  },
  {
    when: "Week 4 — Reminder send",
    title: "Email 2.",
    you: "Send the reminder email. Share open + click within 24 hours.",
    us: "Final-day reminder + workshop confirmation emails fire automatically.",
  },
  {
    when: "Week 4 — Workshop day",
    title: "Live workshop.",
    you: "Open the workshop with a 2-minute intro using the supplied script. Stay on for Q&A if you want — totally optional.",
    us: "Host runs the 60-minute live + 10-15 min Q&A. Founder is in the back of the room. Replay link goes out within 10 minutes of close.",
  },
  {
    when: "Week 4-5",
    title: "Post-workshop follow-up.",
    you: "Nothing required.",
    us: "72-hour replay window. Same-day attendee follow-up, no-show replay nudge, free-vs-paid objection sequence, deadline reminder, checkout-abandon DM. Eight touches over 4 days.",
  },
  {
    when: "Week 5 — Pilot debrief",
    title: "Kill-or-keep memo.",
    you: "Nothing required.",
    us: "Within 72 hours of pilot close: a written continue-or-end memo. If keep, terms for the next pilot. If end, a close-out note signed by the founder by name.",
  },
  {
    when: "Weeks 5-8 — Attribution window",
    title: "Long-tail enrollments.",
    you: "Nothing required. Friday reports keep coming.",
    us: "30-day attribution window keeps tracking. Refunds settle. Late enrollments via your link still count.",
  },
  {
    when: "Week 8",
    title: "Attribution window closes.",
    you: "Nothing required.",
    us: "Final net revenue calculated. Commission computed at 30% of net. Net-45 payment clock starts.",
  },
  {
    when: "Week ~13",
    title: "Payment.",
    you: "Receive payment via ACH, Wise, or PayPal — whichever you specified at signing.",
    us: "Wire commission within net-45 of attribution window close. 1099 / equivalent at year end.",
  },
];

export default function TimelinePage() {
  return (
    <HubPage>
      <div style={{ padding: "64px 24px 0" }}>
        <MonoEyebrow>AESDR · PARTNERS · PILOT TIMELINE</MonoEyebrow>
        <h1
          style={{
            fontFamily: "var(--display)",
            fontStyle: "italic",
            fontWeight: 700,
            fontSize: "clamp(36px, 5vw, 48px)",
            color: "var(--ink)",
            textAlign: "center",
            lineHeight: 1.15,
            marginBottom: 24,
          }}
        >
          Anatomy of a pilot.
        </h1>
        <p
          style={{
            fontFamily: "var(--serif)",
            fontStyle: "italic",
            fontSize: 18,
            color: "var(--muted)",
            textAlign: "center",
            lineHeight: 1.7,
            maxWidth: 720,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          About 11 weeks end-to-end, agreement signing through payment. Two sends from you, one workshop, one debrief. Everything else happens on our end.
        </p>
      </div>

      <section
        style={{
          maxWidth: 920,
          margin: "64px auto 0",
          padding: "0 24px",
        }}
      >
        {STEPS.map((s, i) => (
          <article
            key={i}
            style={{
              background: "#fff",
              border: "1px solid var(--light)",
              padding: "28px 32px",
              marginBottom: 12,
              display: "grid",
              gridTemplateColumns: "160px 1fr",
              gap: 24,
              alignItems: "start",
            }}
          >
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: 11,
                fontWeight: 700,
                color: "var(--crimson)",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                paddingTop: 4,
              }}
            >
              {s.when}
            </div>
            <div>
              <h2
                style={{
                  fontFamily: "var(--display)",
                  fontStyle: "italic",
                  fontWeight: 700,
                  fontSize: 22,
                  color: "var(--ink)",
                  marginBottom: 14,
                  lineHeight: 1.3,
                }}
              >
                {s.title}
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div>
                  <div style={lblStyle}>You</div>
                  <p style={bodyStyle}>{s.you}</p>
                </div>
                <div>
                  <div style={lblStyle}>Us</div>
                  <p style={bodyStyle}>{s.us}</p>
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>

      <div style={{ padding: "96px 24px 0" }}>
        <HubCTA href="/partners/apply">Request a partner conversation →</HubCTA>
      </div>

      <CaveatLayer>
        PS &mdash; The whole pilot ends or extends after Week 5. If we extend, we re-run the same shape with refinements. If we don&rsquo;t, you still see attribution through Week 8 and payment around Week 13.
      </CaveatLayer>
    </HubPage>
  );
}

const lblStyle: React.CSSProperties = {
  fontFamily: "var(--mono)",
  fontSize: 10,
  fontWeight: 700,
  color: "var(--muted)",
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  marginBottom: 6,
};
const bodyStyle: React.CSSProperties = {
  fontFamily: "var(--serif)",
  fontSize: 15,
  color: "var(--ink)",
  lineHeight: 1.65,
};
