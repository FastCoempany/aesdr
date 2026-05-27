"use client";

import { useState } from "react";

import { submitLessonFeedback } from "@/app/actions/lesson-feedback";

type Kind = "stuck" | "disagree" | "didnt_land" | "other";

const KINDS: { value: Kind; label: string }[] = [
  { value: "stuck", label: "I'm stuck" },
  { value: "disagree", label: "I disagree" },
  { value: "didnt_land", label: "Didn't land" },
  { value: "other", label: "Something else" },
];

interface Props {
  lessonId: string;
  lessonTitle: string;
  lastScreen?: number;
}

export default function LessonFeedbackForm({
  lessonId,
  lessonTitle,
  lastScreen,
}: Props) {
  const [kind, setKind] = useState<Kind | null>(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const noteRequired = kind === "stuck" || kind === "disagree";

  if (done) {
    return (
      <div
        data-surface="dark"
        style={{ background: "var(--ink)", color: "var(--cream)", padding: "24px 28px" }}
      >
        <p
          style={{
            margin: "0 0 8px",
            fontFamily: "var(--mono)",
            fontSize: 10,
            letterSpacing: ".32em",
            textTransform: "uppercase",
            color: "rgba(250,247,242,0.6)",
          }}
        >
          Logged
        </p>
        <p
          style={{
            margin: "0 0 12px",
            fontFamily: "var(--display)",
            fontStyle: "italic",
            fontWeight: 700,
            fontSize: 24,
            lineHeight: 1.2,
          }}
        >
          Got it.
        </p>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: "rgba(250,247,242,0.85)" }}>
          This goes straight to the people who write the lessons. If it&rsquo;s
          something we can fix, it changes the lesson — not just the reply.
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
        if (kind) formData.set("kind", kind);
        formData.set("lessonId", lessonId);
        if (lastScreen != null) formData.set("lastScreen", String(lastScreen));
        const res = await submitLessonFeedback(formData);
        if (!res.ok) {
          setError(res.error);
          setSubmitting(false);
          return;
        }
        setDone(true);
      }}
      style={{ display: "grid", gap: 24 }}
    >
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
          On {lessonTitle}
        </legend>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {KINDS.map((k) => {
            const selected = kind === k.value;
            return (
              <button
                key={k.value}
                type="button"
                onClick={() => setKind(k.value)}
                aria-pressed={selected}
                style={{
                  fontFamily: "var(--cond)",
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: ".1em",
                  textTransform: "uppercase",
                  padding: "10px 18px",
                  background: selected ? "var(--crimson)" : "transparent",
                  color: selected ? "#fff" : "var(--ink)",
                  border: `1px solid ${selected ? "var(--crimson)" : "#928C84"}`,
                  cursor: "pointer",
                }}
              >
                {k.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div>
        <label
          htmlFor="note"
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
          What&rsquo;s going on{noteRequired ? "" : " (optional)"}
        </label>
        <textarea
          id="note"
          name="note"
          rows={4}
          maxLength={2000}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={
            kind === "disagree"
              ? "What did we get wrong, and what's your read?"
              : "Where it broke down for you — one or two sentences is plenty."
          }
          style={{
            width: "100%",
            fontFamily: "var(--serif)",
            fontSize: 17,
            padding: "12px 14px",
            background: "#fff",
            color: "var(--ink)",
            border: "1px solid #928C84",
            resize: "vertical",
            lineHeight: 1.6,
          }}
        />
        <p style={{ marginTop: 4, fontSize: 12, color: "var(--muted)" }}>
          {note.length}/2000
        </p>
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
        disabled={submitting || kind == null}
        style={{
          fontFamily: "var(--cond)",
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: ".15em",
          textTransform: "uppercase",
          color: "#fff",
          background: kind == null ? "#B5B0A8" : "var(--crimson)",
          border: "none",
          padding: "14px 28px",
          cursor: kind == null ? "not-allowed" : submitting ? "wait" : "pointer",
          opacity: submitting ? 0.7 : 1,
          justifySelf: "start",
        }}
      >
        {submitting ? "Sending…" : "Send it"}
      </button>
    </form>
  );
}
