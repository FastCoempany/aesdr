"use client";

import { useFormStatus } from "react-dom";

import { setAgentModel } from "./actions";
import styles from "./tower.module.css";

const MODELS = [
  { id: "claude-opus-4-6", label: "Opus 4.6 (newest)" },
  { id: "claude-opus-4-5", label: "Opus 4.5" },
  { id: "claude-opus-4-1", label: "Opus 4.1" },
  { id: "claude-sonnet-4-6", label: "Sonnet 4.6 (cheapest)" },
] as const;

/**
 * Per-agent model picker. Submits on change so there's no "Save" button —
 * the next run of that agent's button picks up the new value.
 * Only LLM-calling work has one (scout sweeps + dossier briefs); deterministic
 * agents don't render this.
 */
export default function ModelSelector({
  agent,
  current,
  label = "Model:",
}: {
  agent: string;
  current: string;
  label?: string;
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
        {label}
      </label>
      <ModelSelect current={current} />
    </form>
  );
}

/* Separate child so useFormStatus can read the parent form's in-flight state:
   the select locks while the change is saving, with a "saving…" tell. */
function ModelSelect({ current }: { current: string }) {
  const { pending } = useFormStatus();
  return (
    <>
      <select
        name="model"
        defaultValue={current}
        disabled={pending}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className={styles.select}
      >
        {MODELS.map((m) => (
          <option key={m.id} value={m.id}>
            {m.label}
          </option>
        ))}
      </select>
      {pending && <span className={styles.saving}>saving…</span>}
    </>
  );
}
