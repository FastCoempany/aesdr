"use client";

import { setAgentModel } from "./actions";

const MODELS = [
  { id: "claude-opus-4-6", label: "Opus 4.6 (newest)" },
  { id: "claude-opus-4-5", label: "Opus 4.5" },
  { id: "claude-opus-4-1", label: "Opus 4.1" },
  { id: "claude-sonnet-4-6", label: "Sonnet 4.6 (cheapest)" },
] as const;

/**
 * Per-agent model picker. Submits on change so there's no "Save" button —
 * the next cron tick (or next scout sweep) picks up the new value.
 * Only LLM-calling agents have one (scout + dossier-enrich); deterministic
 * agents don't render this.
 */
export default function ModelSelector({
  agent,
  current,
}: {
  agent: string;
  current: string;
}) {
  return (
    <form action={setAgentModel} style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
      <input type="hidden" name="agent" value={agent} />
      <label
        style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: "9px",
          letterSpacing: ".14em",
          textTransform: "uppercase",
          color: "#6B6B6B",
        }}
      >
        Model:
      </label>
      <select
        name="model"
        defaultValue={current}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: "11px",
          padding: "3px 6px",
          border: "1px solid #E8E4DF",
          background: "#fff",
          color: "#1A1A1A",
          cursor: "pointer",
        }}
      >
        {MODELS.map((m) => (
          <option key={m.id} value={m.id}>
            {m.label}
          </option>
        ))}
      </select>
    </form>
  );
}
