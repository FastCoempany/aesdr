import { Suspense } from "react";
import styles from "../teams.module.css";
import ContactForm from "./ContactForm";

/**
 * /teams/contact — single-purpose inquiry capture.
 *
 * Calm, low-friction. No "Schedule a meeting in 3 clicks" overlay,
 * no chatbot, no Calendly embed. Just the form. Responses route to
 * hello@aesdr.com with subject prefix [/teams inquiry].
 */

export const metadata = {
  title: "Contact — AESDR / Operating Layer",
  description: "Tell us what you're trying to solve. We respond within 24 business hours.",
};

export default function ContactPage() {
  return (
    <section className={styles.section}>
      <div className={styles.containerNarrow}>
        <p className={styles.eyebrow}>Contact</p>
        <h1 className={styles.heroHeadline} style={{ fontSize: "clamp(32px, 5vw, 56px)" }}>
          Tell us what you&apos;re trying to solve.
        </h1>
        <p className={styles.heroSubhead} style={{ marginBottom: 8 }}>
          We respond within 24 business hours from <strong style={{ color: "var(--ink)" }}>hello@aesdr.com</strong>.
          Most conversations start with a 30-minute walkthrough on Zoom.
        </p>
        <hr className={styles.divider} />

        <Suspense fallback={<div style={{ height: 600 }} />}>
          <ContactForm />
        </Suspense>

        <div className={styles.spacerLg} />

        <div style={{ borderTop: "1px solid var(--light)", paddingTop: 24 }}>
          <p className={styles.bodyMuted} style={{ marginBottom: 0 }}>
            Prefer email? Write directly to{" "}
            <a
              href="mailto:hello@aesdr.com?subject=%5B%2Fteams%5D"
              style={{ color: "var(--ink)", textDecoration: "underline" }}
            >
              hello@aesdr.com
            </a>
            {" "}with subject <code style={{ fontFamily: "var(--mono)", fontSize: 13, background: "var(--cream)", border: "1px solid var(--light)", padding: "1px 6px" }}>[/teams]</code>.
            Same inbox, same response window.
          </p>
        </div>
      </div>
    </section>
  );
}
