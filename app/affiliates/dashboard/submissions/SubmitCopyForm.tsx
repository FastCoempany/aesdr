"use client";

import { useState } from "react";

import { submitAffiliateCopy } from "@/app/actions/affiliate";

const CHANNELS = [
  { value: "newsletter", label: "Newsletter" },
  { value: "podcast", label: "Podcast" },
  { value: "twitter", label: "Twitter / X" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "youtube", label: "YouTube" },
  { value: "tiktok", label: "TikTok" },
  { value: "instagram", label: "Instagram" },
  { value: "community", label: "Community (Discord/Slack)" },
  { value: "course", label: "Course module" },
  { value: "blog", label: "Blog post" },
  { value: "other", label: "Other" },
];

const FORMATS = [
  { value: "post", label: "Post" },
  { value: "email", label: "Email" },
  { value: "script", label: "Script" },
  { value: "thread", label: "Thread" },
  { value: "video", label: "Video" },
  { value: "audio", label: "Audio" },
  { value: "long_form", label: "Long-form" },
  { value: "other", label: "Other" },
];

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--mono)",
  fontSize: 11,
  letterSpacing: ".25em",
  textTransform: "uppercase",
  color: "var(--crimson)",
  marginBottom: 10,
};

const inputStyle: React.CSSProperties = {
  fontFamily: "var(--serif)",
  fontSize: 16,
  padding: "10px 14px",
  background: "#fff",
  color: "var(--ink)",
  border: "1px solid #B5B0A8",
  width: "100%",
};

export default function SubmitCopyForm() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [channel, setChannel] = useState("newsletter");
  const [format, setFormat] = useState("post");
  const [draftBody, setDraftBody] = useState("");
  const [draftUrl, setDraftUrl] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");

  if (success) {
    return (
      <div
        data-surface="dark"
        style={{
          background: "var(--ink)",
          color: "var(--cream)",
          padding: "24px 28px",
          marginBottom: 24,
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
          Submitted
        </p>
        <p
          style={{
            margin: 0,
            fontFamily: "var(--display)",
            fontStyle: "italic",
            fontWeight: 700,
            fontSize: 22,
            marginBottom: 12,
          }}
        >
          A human reviews this within 48 hours.
        </p>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, opacity: 0.8 }}>
          You&rsquo;ll get an email with the verdict — approved, edit requests,
          or declined with a reason. Submission appears in your queue below.
        </p>
        <button
          type="button"
          onClick={() => {
            setSuccess(false);
            setDraftBody("");
            setDraftUrl("");
            setScheduledAt("");
          }}
          style={{
            marginTop: 16,
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
          Submit another
        </button>
      </div>
    );
  }

  return (
    <form
      action={async (formData) => {
        if (submitting) return;
        setSubmitting(true);
        setError(null);
        const res = await submitAffiliateCopy(formData);
        if (!res.ok) {
          setError(res.error);
          setSubmitting(false);
          return;
        }
        setSuccess(true);
        setSubmitting(false);
      }}
      style={{
        display: "grid",
        gap: 20,
        background: "#fff",
        border: "1px solid var(--light)",
        padding: "24px 24px 28px",
        marginBottom: 24,
      }}
    >
      <p
        style={{
          margin: 0,
          fontFamily: "var(--mono)",
          fontSize: 11,
          letterSpacing: ".25em",
          textTransform: "uppercase",
          color: "var(--crimson)",
        }}
      >
        Submit a draft
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <label htmlFor="channel" style={labelStyle}>Channel</label>
          <select
            id="channel"
            name="channel"
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            style={inputStyle}
            required
          >
            {CHANNELS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="format" style={labelStyle}>Format</label>
          <select
            id="format"
            name="format"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            style={inputStyle}
            required
          >
            {FORMATS.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="draft_body" style={labelStyle}>The draft</label>
        <textarea
          id="draft_body"
          name="draft_body"
          value={draftBody}
          onChange={(e) => setDraftBody(e.target.value)}
          rows={12}
          maxLength={20000}
          required
          placeholder="Paste the full draft. Include any disclosure language already in the piece."
          style={{
            ...inputStyle,
            fontFamily: "var(--mono)",
            fontSize: 14,
            lineHeight: 1.6,
            resize: "vertical",
            minHeight: 240,
          }}
        />
        <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--muted)" }}>
          {draftBody.length} / 20,000
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <label htmlFor="draft_url" style={labelStyle}>
            Draft URL (optional)
          </label>
          <input
            id="draft_url"
            name="draft_url"
            type="url"
            value={draftUrl}
            onChange={(e) => setDraftUrl(e.target.value)}
            placeholder="https://"
            style={inputStyle}
          />
        </div>
        <div>
          <label htmlFor="scheduled_publish_at" style={labelStyle}>
            Planned publish date (optional)
          </label>
          <input
            id="scheduled_publish_at"
            name="scheduled_publish_at"
            type="date"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            style={inputStyle}
          />
        </div>
      </div>

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
          justifySelf: "start",
        }}
      >
        {submitting ? "Submitting…" : "Submit for review"}
      </button>
    </form>
  );
}
