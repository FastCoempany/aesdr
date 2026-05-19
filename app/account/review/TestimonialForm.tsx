"use client";

import { useState } from "react";

import { submitTestimonial } from "@/app/actions/testimonial";

type Status = "pending" | "approved" | "rejected" | null;

interface Props {
  initial: {
    rating: number | null;
    body: string;
    displayName: string;
    permitPublish: boolean;
    status: Status;
  };
}

export default function TestimonialForm({ initial }: Props) {
  const [rating, setRating] = useState<number | null>(initial.rating);
  const [body, setBody] = useState(initial.body);
  const [displayName, setDisplayName] = useState(initial.displayName);
  const [permitPublish, setPermitPublish] = useState(initial.permitPublish);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedOnce, setSubmittedOnce] = useState(false);

  // If the existing row is already approved/rejected, we still let them
  // re-submit — the upsert will reset it to pending and the founder will
  // re-approve. We surface the state above the form, not in here.

  if (submittedOnce) {
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
          Received
        </p>
        <p
          style={{
            margin: 0,
            fontFamily: "var(--display)",
            fontStyle: "italic",
            fontWeight: 700,
            fontSize: 24,
            lineHeight: 1.2,
            marginBottom: 12,
          }}
        >
          Thank you.
        </p>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: "rgba(250,247,242,0.85)" }}>
          {rating && rating <= 3
            ? "Reading this myself. If there's something specific to fix in the curriculum, expect a reply from hello@aesdr.com."
            : "If you opted in to publishing, your line goes through one editorial pass for typos / first-name only, then ships."}
        </p>
      </div>
    );
  }

  return (
    <form
      action={async (formData) => {
        if (submitting) return;
        setSubmitting(true);
        setError(null);
        if (rating != null) formData.set("rating", String(rating));
        formData.set("permitPublish", permitPublish ? "on" : "off");
        const res = await submitTestimonial(formData);
        if (!res.ok) {
          setError(res.error);
          setSubmitting(false);
          return;
        }
        setSubmittedOnce(true);
      }}
      style={{ display: "grid", gap: 28 }}
    >
      {/* ── Rating ── */}
      <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
        <legend
          style={{
            fontFamily: "var(--mono)",
            fontSize: 11,
            letterSpacing: ".25em",
            textTransform: "uppercase",
            color: "var(--crimson)",
            marginBottom: 12,
            padding: 0,
          }}
        >
          Rating
        </legend>
        <div style={{ display: "flex", gap: 8 }}>
          {[1, 2, 3, 4, 5].map((n) => {
            const selected = rating === n;
            return (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                aria-pressed={selected}
                aria-label={`${n} out of 5`}
                style={{
                  width: 48,
                  height: 48,
                  fontFamily: "var(--display)",
                  fontStyle: "italic",
                  fontWeight: 900,
                  fontSize: 22,
                  background: selected ? "var(--crimson)" : "transparent",
                  color: selected ? "#fff" : "var(--ink)",
                  border: `1px solid ${selected ? "var(--crimson)" : "#B5B0A8"}`,
                  cursor: "pointer",
                }}
              >
                {n}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* ── Body ── */}
      <div>
        <label
          htmlFor="body"
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
          One sentence{rating != null && rating <= 3 ? " — tell me what to fix" : ""}
        </label>
        <textarea
          id="body"
          name="body"
          required
          rows={4}
          maxLength={1000}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="The thing that landed for me was…"
          style={{
            width: "100%",
            fontFamily: "var(--serif)",
            fontSize: 17,
            padding: "12px 14px",
            background: "#fff",
            color: "var(--ink)",
            border: "1px solid #B5B0A8",
            resize: "vertical",
            lineHeight: 1.6,
          }}
        />
        <p style={{ marginTop: 4, fontSize: 12, color: "var(--muted)" }}>
          {body.length}/1000
        </p>
      </div>

      {/* ── Display name + permit (only if 4-5) ── */}
      {rating != null && rating >= 4 && (
        <>
          <div>
            <label
              htmlFor="displayName"
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
              First name to show
            </label>
            <input
              id="displayName"
              name="displayName"
              type="text"
              maxLength={80}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="First name only"
              style={{
                fontFamily: "var(--serif)",
                fontSize: 17,
                padding: "10px 14px",
                background: "#fff",
                color: "var(--ink)",
                border: "1px solid #B5B0A8",
                width: "100%",
              }}
            />
          </div>

          <label
            style={{
              display: "flex",
              gap: 12,
              cursor: "pointer",
              padding: "12px 14px",
              border: "1px solid var(--light)",
              background: "#fff",
              alignItems: "flex-start",
            }}
          >
            <input
              type="checkbox"
              name="permitPublish"
              checked={permitPublish}
              onChange={(e) => setPermitPublish(e.target.checked)}
              style={{ marginTop: 4 }}
            />
            <span style={{ fontSize: 15, lineHeight: 1.55 }}>
              <strong>Yes, you can publish this on the AESDR site.</strong> First
              name + role only. We&rsquo;ll do one editorial pass for typos, never
              change the meaning.
            </span>
          </label>
        </>
      )}

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
        disabled={submitting || rating == null}
        style={{
          fontFamily: "var(--cond)",
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: ".15em",
          textTransform: "uppercase",
          color: "#fff",
          background: rating == null ? "#B5B0A8" : "var(--crimson)",
          border: "none",
          padding: "14px 28px",
          cursor: rating == null ? "not-allowed" : submitting ? "wait" : "pointer",
          opacity: submitting ? 0.7 : 1,
          alignSelf: "flex-start",
        }}
      >
        {submitting ? "Sending…" : "Submit"}
      </button>
    </form>
  );
}
