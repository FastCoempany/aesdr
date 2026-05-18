"use client";

import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import styles from "../teams.module.css";
import { submitTeamsInquiry, type TeamsInquiryResult } from "./actions";

/**
 * Inquiry form for /teams/contact.
 *
 * Submits via the submitTeamsInquiry server action — cookie/redirect race
 * avoided by keeping state-of-form on the client and replacing the form
 * with a success card when the action returns { ok: true }.
 *
 * Pre-populates the hidden `source` field from `?source=` query param so
 * we can attribute which CTA path sent them.
 */

const ROLES = [
  "Sales leader",
  "Sales enablement / training",
  "RevOps / Sales Ops",
  "L&D / People Ops",
  "HR / Talent",
  "Fractional / agency",
  "Channel partner",
  "Other",
];

const TEAM_SIZES = ["1–9 reps", "10–24 reps", "25–49 reps", "50–99 reps", "100+ reps"];

export default function ContactForm() {
  const searchParams = useSearchParams();
  const source = searchParams?.get("source") || "direct";

  const [result, setResult] = useState<TeamsInquiryResult | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    formData.set("source", source);
    startTransition(async () => {
      const r = await submitTeamsInquiry(formData);
      setResult(r);
    });
  }

  if (result?.ok) {
    return (
      <div className={styles.formSuccess}>
        <p style={{ margin: 0, fontWeight: 700, fontFamily: "var(--cond)", letterSpacing: ".1em", textTransform: "uppercase", fontSize: 13, color: "var(--ink)" }}>
          Inquiry sent
        </p>
        <p style={{ margin: "10px 0 0" }}>
          Got it. We&apos;ll respond within 24 business hours from{" "}
          <strong style={{ color: "var(--ink)" }}>hello@aesdr.com</strong>. If urgent,
          reply to that email and flag it.
        </p>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className={styles.form} noValidate>
      <input type="hidden" name="source" defaultValue={source} />

      <div className={styles.formGroup}>
        <label className={styles.formLabel} htmlFor="ti-name">Name</label>
        <input
          id="ti-name"
          name="name"
          type="text"
          required
          autoComplete="name"
          className={styles.formInput}
          placeholder="Your full name"
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel} htmlFor="ti-email">Work email</label>
        <input
          id="ti-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          className={styles.formInput}
          placeholder="you@company.com"
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel} htmlFor="ti-company">Company</label>
        <input
          id="ti-company"
          name="company"
          type="text"
          required
          autoComplete="organization"
          className={styles.formInput}
          placeholder="Company or org name"
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel} htmlFor="ti-role">Your role</label>
        <select id="ti-role" name="role" required defaultValue="" className={styles.formSelect}>
          <option value="" disabled>Pick one…</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel} htmlFor="ti-teamsize">Team size</label>
        <select id="ti-teamsize" name="teamSize" required defaultValue="" className={styles.formSelect}>
          <option value="" disabled>Pick one…</option>
          {TEAM_SIZES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel} htmlFor="ti-message">
          What brought you here? <span style={{ textTransform: "none", letterSpacing: 0, fontWeight: 400, color: "var(--muted)" }}>(optional)</span>
        </label>
        <textarea
          id="ti-message"
          name="message"
          rows={5}
          maxLength={2000}
          className={styles.formTextarea}
          placeholder="A sentence or two about what you're trying to solve. Whatever's useful — short is fine."
        />
      </div>

      {result && !result.ok && (
        <p className={styles.formError} role="alert">
          {result.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className={`${styles.ctaPrimary} ${styles.formSubmit}`}
        style={{ opacity: isPending ? 0.6 : 1, cursor: isPending ? "wait" : "pointer" }}
      >
        {isPending ? "Sending…" : "Send inquiry"}
      </button>
    </form>
  );
}
