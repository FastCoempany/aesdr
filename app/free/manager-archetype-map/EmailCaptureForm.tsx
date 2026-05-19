"use client";

import { useState } from "react";
import { useRole } from "@/lib/role";

type State = "idle" | "submitting" | "done" | "error";

export default function EmailCaptureForm() {
  const role = useRole();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState<string | null>(null);

  if (state === "done") {
    return (
      <div
        style={{
          background: "rgba(250,247,242,0.08)",
          border: "1px solid rgba(250,247,242,0.18)",
          padding: "16px 20px",
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: "var(--mono)",
            fontSize: 10,
            letterSpacing: ".28em",
            textTransform: "uppercase",
            color: "rgba(250,247,242,0.6)",
            marginBottom: 6,
          }}
        >
          Sent
        </p>
        <p
          style={{
            margin: 0,
            fontFamily: "var(--serif)",
            fontSize: 15,
            lineHeight: 1.6,
            color: "var(--cream)",
          }}
        >
          Check your inbox for <strong>{email}</strong>. If it&rsquo;s not there in 5
          minutes, look in spam — and reply to it so future ones land in your
          inbox.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (state === "submitting") return;
        setState("submitting");
        setError(null);
        try {
          const res = await fetch("/api/free/manager-archetype-map", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, role }),
          });
          if (!res.ok) {
            const data = (await res.json().catch(() => ({}))) as {
              error?: string;
            };
            setError(data.error || "Something went wrong. Try again.");
            setState("error");
            return;
          }
          setState("done");
        } catch {
          setError("Network error. Try again.");
          setState("error");
        }
      }}
      style={{
        display: "flex",
        gap: 8,
        flexWrap: "wrap",
      }}
    >
      <input
        type="email"
        inputMode="email"
        required
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (state === "error") {
            setState("idle");
            setError(null);
          }
        }}
        placeholder="you@work.com"
        aria-label="Email address"
        style={{
          flex: "1 1 240px",
          minWidth: 0,
          fontFamily: "var(--serif)",
          fontSize: 16,
          padding: "12px 14px",
          background: "rgba(250,247,242,0.06)",
          color: "var(--cream)",
          border: "1px solid rgba(250,247,242,0.22)",
          outline: "none",
        }}
      />
      <button
        type="submit"
        disabled={state === "submitting"}
        style={{
          fontFamily: "var(--cond)",
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: ".15em",
          textTransform: "uppercase",
          color: "#fff",
          background: "var(--crimson)",
          border: "none",
          padding: "12px 22px",
          cursor: state === "submitting" ? "wait" : "pointer",
          opacity: state === "submitting" ? 0.7 : 1,
        }}
      >
        {state === "submitting" ? "Sending…" : "Email me the PDF"}
      </button>
      {error && (
        <p
          role="alert"
          style={{
            width: "100%",
            margin: "8px 0 0",
            fontFamily: "var(--mono)",
            fontSize: 11,
            letterSpacing: ".15em",
            color: "#FCA5A5",
          }}
        >
          {error}
        </p>
      )}
    </form>
  );
}
