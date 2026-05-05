/**
 * Page: /partners/apply
 * Spec: AESDR-PARTNER-HUB-SPEC.md §"Page 1.6"
 * Canon: §1.6 (honesty), §3.3 (voice ratio 90/10), §13 (honest disqualification)
 * Copy sources: D27 §1 (sanitized for 5-field public form), partner-hub register
 * Five-question check: PASS
 */

import type { Metadata } from "next";
import { HubPage } from "@/components/partners/HubChrome";
import { MonoEyebrow, CaveatLayer } from "@/components/partners/HubElements";
import { ApplicationForm } from "@/components/partners/ApplicationForm";

export const metadata: Metadata = {
  title: "Apply · AESDR Partners",
  description:
    "Five fields. The first call is operator-to-operator, 30 minutes, no slide deck. AESDR replies within 5 business days, either direction.",
};

export default function ApplyPage() {
  return (
    <HubPage>
      <div style={{ padding: "64px 24px 0" }}>
        <MonoEyebrow>AESDR · PARTNERS · APPLY</MonoEyebrow>
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
          Tell us about your audience.
        </h1>
        <p
          style={{
            fontFamily: "var(--serif)",
            fontStyle: "italic",
            fontSize: 18,
            color: "var(--muted)",
            textAlign: "center",
            lineHeight: 1.7,
            maxWidth: 640,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Five fields. The first call is operator-to-operator, 30 minutes, no slide deck.
        </p>
      </div>

      <ApplicationForm />

      <section
        style={{
          maxWidth: 720,
          margin: "64px auto 0",
          padding: "0 24px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            background: "#fff",
            border: "1px solid var(--light)",
            padding: "32px 32px",
          }}
        >
          <div
            style={{
              fontFamily: "var(--cond)",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "var(--muted)",
              marginBottom: 16,
            }}
          >
            WHAT HAPPENS NEXT
          </div>
          <p
            style={{
              fontFamily: "var(--serif)",
              fontSize: 16,
              color: "var(--ink)",
              lineHeight: 1.7,
            }}
          >
            AESDR reviews applications weekly. If your audience matches, we send a 30-min Calendly link. If it doesn&rsquo;t, we tell you so directly within 5 business days. Either answer is fast.
          </p>
        </div>
      </section>

      <CaveatLayer>
        PS — If you&rsquo;re going to apply, apply because the brand makes sense, not because the commission does. We&rsquo;re not for everyone, and that&rsquo;s the point.
      </CaveatLayer>
    </HubPage>
  );
}
