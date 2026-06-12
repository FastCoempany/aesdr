"use client";

import { runScoutSweepAction } from "./actions";
import TowerButton from "./TowerButton";

/**
 * One scout-sweep button. Confirms first (it spends API tokens); TowerButton
 * handles the pressed state and the disabled "Running…" pending state while
 * the action holds the function open through the Anthropic call.
 */
export default function ScoutSweepButton({
  sweep,
  label,
}: {
  sweep: string;
  label: string;
}) {
  return (
    <form action={runScoutSweepAction}>
      <input type="hidden" name="sweep" value={sweep} />
      <TowerButton
        variant="outline"
        pendingLabel="Running… (10–30s)"
        confirmMessage={`Run "${label}"? This calls the Anthropic API and may take 10–30 seconds. New candidates land at status='sourced' for you to review.`}
      >
        {label}
      </TowerButton>
    </form>
  );
}
