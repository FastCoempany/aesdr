"use client";

import Link from "next/link";
import { useState } from "react";

import { createAffiliateLink } from "@/app/actions/affiliate";

const DESTINATIONS = [
  { value: "https://aesdr.com/", label: "Landing page (aesdr.com)" },
  { value: "https://aesdr.com/preview", label: "Sample lesson preview" },
  { value: "https://aesdr.com/free/manager-archetype-map", label: "Free Manager Archetype Map" },
  { value: "https://aesdr.com/about", label: "About page" },
  { value: "https://aesdr.com/syllabus", label: "Syllabus" },
];

export default function LinkForm() {
  const [destination, setDestination] = useState(DESTINATIONS[0].value);
  const [label, setLabel] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slug, setSlug] = useState<string | null>(null);

  const siteUrl =
    (typeof window !== "undefined" && window.location.origin) ||
    "https://aesdr.com";

  if (slug) {
    const url = `${siteUrl}/r/${slug}`;
    return (
      <div
        data-surface="dark"
        style={{
          background: "var(--ink)",
          color: "var(--cream)",
          padding: "24px 28px",
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: "var(--mono)",
            fontSize: 10,
            letterSpacing: ".32em",
            textTransform: "uppercase",
            color: "rgba(250,247,242,0.6)",
            marginBottom: 8,
          }}
        >
          Created
        </p>
        <p
          style={{
            margin: 0,
            fontFamily: "var(--display)",
            fontStyle: "italic",
            fontWeight: 700,
            fontSize: 22,
            lineHeight: 1.2,
            marginBottom: 16,
          }}
        >
          Your short URL is live.
        </p>
        <code
          style={{
            display: "block",
            fontFamily: "var(--mono)",
            fontSize: 16,
            padding: "12px 14px",
            background: "rgba(250,247,242,0.08)",
            color: "var(--cream)",
            wordBreak: "break-all",
            marginBottom: 16,
          }}
        >
          {url}
        </code>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(url)}
            style={{
              fontFamily: "var(--cond)",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: ".15em",
              textTransform: "uppercase",
              color: "var(--ink)",
              background: "var(--cream)",
              border: "none",
              padding: "12px 22px",
              cursor: "pointer",
            }}
          >
            Copy URL
          </button>
          <Link
            href="/partners/dashboard"
            style={{
              fontFamily: "var(--cond)",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: ".15em",
              textTransform: "uppercase",
              color: "var(--cream)",
              border: "1px solid rgba(250,247,242,0.4)",
              padding: "12px 22px",
              textDecoration: "none",
            }}
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      action={async (formData) => {
        if (submitting) return;
        setSubmitting(true);
        setError(null);
        const res = await createAffiliateLink(formData);
        if (!res.ok) {
          setError(res.error);
          setSubmitting(false);
          return;
        }
        setSlug((res.data?.slug as string) ?? null);
        setSubmitting(false);
      }}
      style={{ display: "grid", gap: 24 }}
    >
      <div>
        <label
          htmlFor="destination"
          style={{
            display: "block",
            fontFamily: "var(--mono)",
            fontSize: 11,
            letterSpacing: ".25em",
            textTransform: "uppercase",
            color: "var(--crimson)",
            marginBottom: 10,
          }}
        >
          Where the click lands
        </label>
        <select
          id="destination"
          name="destination"
          required
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          style={{
            fontFamily: "var(--serif)",
            fontSize: 16,
            padding: "10px 14px",
            background: "#fff",
            color: "var(--ink)",
            border: "1px solid #B5B0A8",
            width: "100%",
          }}
        >
          {DESTINATIONS.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="label"
          style={{
            display: "block",
            fontFamily: "var(--mono)",
            fontSize: 11,
            letterSpacing: ".25em",
            textTransform: "uppercase",
            color: "var(--crimson)",
            marginBottom: 10,
          }}
        >
          Label for your records
        </label>
        <input
          id="label"
          name="label"
          type="text"
          maxLength={80}
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g. June newsletter — workshop intro"
          style={{
            fontFamily: "var(--serif)",
            fontSize: 16,
            padding: "10px 14px",
            background: "#fff",
            color: "var(--ink)",
            border: "1px solid #B5B0A8",
            width: "100%",
          }}
        />
        <p style={{ marginTop: 6, fontSize: 13, color: "var(--muted)" }}>
          Only you see this. Optional but it helps you tell links apart later.
        </p>
      </div>

      <details
        style={{
          background: "#fff",
          border: "1px solid var(--light)",
          padding: "14px 18px",
        }}
      >
        <summary
          style={{
            cursor: "pointer",
            fontFamily: "var(--mono)",
            fontSize: 11,
            letterSpacing: ".25em",
            textTransform: "uppercase",
            color: "var(--muted)",
          }}
        >
          UTM overrides (optional)
        </summary>
        <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
          {(["utm_source", "utm_medium", "utm_campaign", "utm_content"] as const).map((field) => (
            <div key={field}>
              <label
                htmlFor={field}
                style={{
                  display: "block",
                  fontFamily: "var(--mono)",
                  fontSize: 10,
                  letterSpacing: ".22em",
                  textTransform: "uppercase",
                  color: "var(--muted)",
                  marginBottom: 6,
                }}
              >
                {field}
              </label>
              <input
                id={field}
                name={field}
                type="text"
                maxLength={100}
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 14,
                  padding: "8px 12px",
                  background: "#fff",
                  color: "var(--ink)",
                  border: "1px solid #B5B0A8",
                  width: "100%",
                }}
              />
            </div>
          ))}
        </div>
      </details>

      {error && (
        <p
          role="alert"
          style={{
            margin: 0,
            fontFamily: "var(--mono)",
            fontSize: 12,
            letterSpacing: ".12em",
            color: "var(--crimson)",
          }}
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        style={{
          fontFamily: "var(--cond)",
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: ".15em",
          textTransform: "uppercase",
          color: "#fff",
          background: "var(--crimson)",
          border: "none",
          padding: "14px 28px",
          cursor: submitting ? "wait" : "pointer",
          opacity: submitting ? 0.7 : 1,
          alignSelf: "flex-start",
        }}
      >
        {submitting ? "Creating…" : "Create link"}
      </button>
    </form>
  );
}
