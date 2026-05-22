"use client";

/**
 * Component: ApplicationForm (CLIENT)
 * Spec: AESDR-PARTNER-HUB-SPEC.md §"Page 1.6 — /partners/apply"
 * Canon: §1.6 (honesty), §10.5 (TCPA — N/A on hub), §13 (honest disqualification)
 * Five-question check: PASS — type-led, single iris CTA, no decorative icons.
 *
 * Posts to /api/partners/apply. Persists to partner_applications Supabase
 * table; optional email send when EMAIL_RECIPIENT env var is set on server.
 * Per Q6: graceful degradation if ESP not wired.
 */

import { useState } from "react";

type Channel = "newsletter" | "podcast" | "community" | "course";

const CHANNELS: { value: Channel; label: string }[] = [
  { value: "newsletter", label: "Newsletter — over 1,000 subscribers" },
  { value: "podcast", label: "Podcast — over 500 monthly listeners (past 6 months)" },
  { value: "community", label: "Community — over 5,000 unique non-bot members" },
  { value: "course", label: "Course — this content fills a major gap in my programming" },
];

export function ApplicationForm() {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const fd = new FormData(e.currentTarget);
    const payload = {
      applicantName: String(fd.get("applicantName") || ""),
      audienceDescriptor: String(fd.get("audienceDescriptor") || ""),
      primaryChannel: String(fd.get("primaryChannel") || ""),
      audienceSize: String(fd.get("audienceSize") || ""),
      linkUrl: String(fd.get("linkUrl") || ""),
      utmSource: "partners-page",
      utmMedium: "application-form",
    };

    try {
      const res = await fetch("/api/partners/apply", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Submission failed.");
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <section style={formZoneStyle}>
        <div style={formPanelStyle}>
          <h2 style={formHeadStyle}>Application received.</h2>
          <p
            style={{
              fontFamily: "var(--serif)",
              fontSize: 17,
              color: "var(--ink)",
              lineHeight: 1.7,
              textAlign: "center",
            }}
          >
            We&rsquo;ll be in touch within 5 business days. If your audience matches, we send a 30-min Calendly link. If it doesn&rsquo;t, we tell you so directly. Either answer is fast.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section style={formZoneStyle}>
      <div style={formPanelStyle}>
        <h2 style={formHeadStyle}>Tell us about your audience.</h2>
        <form onSubmit={onSubmit} noValidate>
          <Field label="Your name" name="applicantName" required />
          <Field
            label="Who is your audience"
            name="audienceDescriptor"
            required
            as="textarea"
            placeholder="One or two sentences. Who are they? What role? What stage?"
          />
          <FieldRadio label="Primary channel" name="primaryChannel" options={CHANNELS} required />
          <Field
            label="Approximate size"
            name="audienceSize"
            required
            placeholder='e.g. "3,400 newsletter subscribers" or "8,200 community members"'
          />
          <Field
            label="Link to your work"
            name="linkUrl"
            required
            placeholder="https://"
            type="url"
          />

          {error ? (
            <div
              style={{
                fontFamily: "var(--serif)",
                fontStyle: "italic",
                fontSize: 14,
                color: "var(--crimson)",
                marginTop: 12,
                textAlign: "center",
              }}
              role="alert"
            >
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            style={{
              display: "block",
              width: "100%",
              fontFamily: "var(--cond)",
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "#fff",
              background: "var(--iris)",
              backgroundSize: "300% 100%",
              animation: "iris 4s linear infinite",
              padding: 18,
              border: "none",
              cursor: submitting ? "not-allowed" : "pointer",
              marginTop: 24,
              opacity: submitting ? 0.6 : 1,
            }}
          >
            {submitting ? "Submitting…" : "Submit application →"}
          </button>
          <p
            style={{
              fontFamily: "var(--serif)",
              fontStyle: "italic",
              fontSize: 13,
              color: "var(--muted)",
              textAlign: "center",
              lineHeight: 1.6,
              marginTop: 16,
            }}
          >
            We review applications weekly. You&rsquo;ll get a yes-or-no within 5 business days.
          </p>
        </form>
      </div>
    </section>
  );
}

function Field({
  label,
  name,
  required,
  type = "text",
  placeholder,
  as,
}: {
  label: string;
  name: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  as?: "textarea";
}) {
  return (
    <div style={{ marginBottom: 24 }}>
      <label
        htmlFor={name}
        style={{
          fontFamily: "var(--cond)",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "var(--muted)",
          marginBottom: 8,
          display: "block",
        }}
      >
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      {as === "textarea" ? (
        <textarea
          id={name}
          name={name}
          required={required}
          placeholder={placeholder}
          rows={3}
          style={inputStyle}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          required={required}
          placeholder={placeholder}
          style={inputStyle}
        />
      )}
    </div>
  );
}

function FieldRadio({
  label,
  name,
  options,
  required,
}: {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  required?: boolean;
}) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div
        style={{
          fontFamily: "var(--cond)",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "var(--muted)",
          marginBottom: 8,
        }}
      >
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {options.map((o) => (
          <label
            key={o.value}
            style={{
              fontFamily: "var(--serif)",
              fontSize: 15,
              color: "var(--ink)",
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              cursor: "pointer",
              padding: "10px 12px",
              border: "1px solid var(--light)",
              background: "var(--cream)",
              lineHeight: 1.45,
            }}
          >
            <input
              type="radio"
              name={name}
              value={o.value}
              required={required}
              style={{ accentColor: "var(--ink)", marginTop: 4, flexShrink: 0 }}
            />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

const formZoneStyle: React.CSSProperties = {
  maxWidth: 480,
  margin: "0 auto",
  padding: "96px 24px 0",
};

const formPanelStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid var(--light)",
  padding: "48px 36px",
};

const formHeadStyle: React.CSSProperties = {
  fontFamily: "var(--display)",
  fontStyle: "italic",
  fontWeight: 700,
  fontSize: 32,
  color: "var(--ink)",
  marginBottom: 32,
  textAlign: "center",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  fontFamily: "var(--serif)",
  fontSize: 16,
  color: "var(--ink)",
  background: "var(--cream)",
  border: "1px solid var(--light)",
  outline: "none",
  resize: "vertical",
};
