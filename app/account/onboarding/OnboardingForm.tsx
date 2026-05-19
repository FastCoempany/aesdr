"use client";

import { useState } from "react";
import { saveOnboarding, skipOnboarding } from "@/app/actions/onboarding";

const DAYS = [
  { id: "mon", label: "Mon" },
  { id: "tue", label: "Tue" },
  { id: "wed", label: "Wed" },
  { id: "thu", label: "Thu" },
  { id: "fri", label: "Fri" },
  { id: "sat", label: "Sat" },
  { id: "sun", label: "Sun" },
];

const PLACE_SUGGESTIONS = [
  "my desk at home",
  "the kitchen table",
  "my office",
  "the coffee shop on the way in",
  "the commute",
];

export default function OnboardingForm() {
  const [day, setDay] = useState("tue");
  const [time, setTime] = useState("07:30");
  const [place, setPlace] = useState("");
  const [stakeholder, setStakeholder] = useState("");
  const [weeklyNudge, setWeeklyNudge] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      action={async (formData) => {
        setSubmitting(true);
        setError(null);
        try {
          // Ensure the hidden day field carries the chosen value (react state,
          // not the unchecked native radios).
          formData.set("day", day);
          formData.set("weeklyNudge", weeklyNudge ? "on" : "off");
          await saveOnboarding(formData);
          // saveOnboarding redirects on success; if it returns we treat as no-op.
        } catch (err) {
          setError(err instanceof Error ? err.message : "Couldn't save.");
          setSubmitting(false);
        }
      }}
      style={{ display: "grid", gap: 28 }}
    >
      {/* ── Day picker ── */}
      <fieldset
        style={{ border: "none", padding: 0, margin: 0 }}
      >
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
          When
        </legend>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {DAYS.map((d) => {
            const selected = day === d.id;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => setDay(d.id)}
                aria-pressed={selected}
                style={{
                  fontFamily: "var(--cond)",
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: ".15em",
                  textTransform: "uppercase",
                  padding: "10px 16px",
                  background: selected ? "var(--ink)" : "transparent",
                  color: selected ? "var(--cream)" : "var(--ink)",
                  border: `1px solid ${selected ? "var(--ink)" : "#B5B0A8"}`,
                  cursor: "pointer",
                }}
              >
                {d.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* ── Time ── */}
      <div>
        <label
          htmlFor="time"
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
          At
        </label>
        <input
          id="time"
          name="time"
          type="time"
          required
          value={time}
          onChange={(e) => setTime(e.target.value)}
          style={{
            fontFamily: "var(--serif)",
            fontSize: 17,
            padding: "10px 14px",
            background: "#fff",
            color: "var(--ink)",
            border: "1px solid #B5B0A8",
            width: 200,
          }}
        />
      </div>

      {/* ── Place ── */}
      <div>
        <label
          htmlFor="place"
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
          Where
        </label>
        <input
          id="place"
          name="place"
          type="text"
          required
          maxLength={80}
          value={place}
          onChange={(e) => setPlace(e.target.value)}
          placeholder="my desk at home"
          list="place-suggestions"
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
        <datalist id="place-suggestions">
          {PLACE_SUGGESTIONS.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </div>

      {/* ── Stakeholder (optional social stake) ── */}
      <div>
        <label
          htmlFor="stakeholder"
          style={{
            display: "block",
            fontFamily: "var(--mono)",
            fontSize: 11,
            letterSpacing: ".25em",
            textTransform: "uppercase",
            color: "var(--muted)",
            marginBottom: 10,
          }}
        >
          One person you&rsquo;ll tell (optional)
        </label>
        <input
          id="stakeholder"
          name="stakeholder"
          type="text"
          maxLength={80}
          value={stakeholder}
          onChange={(e) => setStakeholder(e.target.value)}
          placeholder="manager / partner / friend"
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
        <p
          style={{
            marginTop: 8,
            fontSize: 13,
            color: "var(--muted)",
            lineHeight: 1.6,
          }}
        >
          People who tell one person they&rsquo;re starting are roughly twice as
          likely to actually start. We don&rsquo;t email them — that&rsquo;s on you.
        </p>
      </div>

      {/* ── Weekly nudge ── */}
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
          name="weeklyNudge"
          checked={weeklyNudge}
          onChange={(e) => setWeeklyNudge(e.target.checked)}
          style={{ marginTop: 4 }}
        />
        <span style={{ fontSize: 15, lineHeight: 1.55 }}>
          <strong>Email me a one-line Friday nudge</strong> tied to this window.
          No marketing. Reply STOP at any point and it dies.
        </span>
      </label>

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

      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
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
          }}
        >
          {submitting ? "Saving…" : "Lock it in"}
        </button>
        <button
          type="button"
          onClick={() => skipOnboarding()}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            fontFamily: "var(--mono)",
            fontSize: 11,
            letterSpacing: ".18em",
            textTransform: "uppercase",
            color: "var(--muted)",
            textDecoration: "underline",
            cursor: "pointer",
          }}
        >
          Skip for now
        </button>
      </div>
    </form>
  );
}
