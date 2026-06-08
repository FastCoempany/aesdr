"use client";

import { setAgentSwitch } from "./actions";
import ModelSelector from "./ModelSelector";

/**
 * One agent's start/pause lever. Off by default. Starting an agent confirms
 * first (so nothing begins running by accident); pausing is immediate.
 * For LLM-calling agents (currently only dossier-enrich among levered ones),
 * pass `currentModel` and the model selector renders inline.
 */
export default function AgentLever({
  agent,
  label,
  cadence,
  desc,
  enabled,
  startConfirm,
  currentModel,
}: {
  agent: string;
  label: string;
  cadence: string;
  desc: string;
  enabled: boolean;
  startConfirm: string;
  currentModel?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        padding: "12px 0",
        borderBottom: "1px solid #E8E4DF",
      }}
    >
      <span
        style={{
          marginTop: "3px",
          width: "9px",
          height: "9px",
          borderRadius: "50%",
          background: enabled ? "#2E7D32" : "#C9C4BD",
          flexShrink: 0,
        }}
      />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "8px", flexWrap: "wrap" }}>
          <span style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: "15px", fontWeight: 600, color: "#1A1A1A" }}>
            {label}
          </span>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "10px", letterSpacing: ".1em", color: "#6B6B6B" }}>
            {cadence}
          </span>
          <span
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: "9px",
              letterSpacing: ".14em",
              textTransform: "uppercase",
              color: enabled ? "#2E7D32" : "#a14400",
            }}
          >
            {enabled ? "running" : "paused"}
          </span>
        </div>
        <div style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: "13px", color: "#6B6B6B", lineHeight: 1.5, marginTop: "3px" }}>
          {desc}
        </div>
        {currentModel && (
          <div style={{ marginTop: "8px" }}>
            <ModelSelector agent={agent} current={currentModel} />
          </div>
        )}
      </div>
      <form
        action={setAgentSwitch}
        onSubmit={(e) => {
          if (!enabled && !confirm(startConfirm)) e.preventDefault();
        }}
      >
        <input type="hidden" name="agent" value={agent} />
        <input type="hidden" name="enabled" value={enabled ? "false" : "true"} />
        <button
          type="submit"
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: ".14em",
            textTransform: "uppercase",
            color: enabled ? "#6B6B6B" : "#FFFFFF",
            background: enabled ? "transparent" : "#2E7D32",
            border: enabled ? "1px solid #E8E4DF" : "none",
            padding: "8px 16px",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {enabled ? "Pause" : "Start"}
        </button>
      </form>
    </div>
  );
}
