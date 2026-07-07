import { DAILY_WALL_USD } from "@/lib/partnerships/spend";

/**
 * The blaring signal (founder 2026-07-07): today's agent spend against the
 * $10/day wall, pinned to the top of the tower. Ink normally; full crimson
 * once the day crosses 80% of the wall. Server-rendered — the ledger is read
 * by the page and passed in.
 */
export default function SpendMeter({
  spentUsd,
  emailCredits,
  ledgerBroken = false,
}: {
  spentUsd: number;
  emailCredits: number;
  ledgerBroken?: boolean;
}) {
  const frac = Math.min(1, spentUsd / DAILY_WALL_USD);
  const hot = ledgerBroken || frac >= 0.8;
  const bg = hot ? "#8B1A1A" : "#1A1A1A";
  return (
    <div
      data-surface="dark"
      style={{
        background: bg,
        color: "#FAF7F2",
        padding: "10px 16px",
        display: "flex",
        alignItems: "center",
        gap: "14px",
        flexWrap: "wrap",
        marginBottom: "28px",
      }}
    >
      <span
        style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: "9.5px",
          letterSpacing: ".24em",
          textTransform: "uppercase",
        }}
      >
        agent spend · today
      </span>
      <span
        aria-hidden
        style={{
          flex: 1,
          minWidth: "120px",
          height: "8px",
          background: "rgba(250,247,242,0.18)",
          position: "relative",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            width: `${Math.round(frac * 100)}%`,
            background: hot
              ? "#FAF7F2"
              : "linear-gradient(90deg,#FF006E 0%,#FF6B00 17%,#F59E0B 34%,#10B981 51%,#38BDF8 68%,#8B5CF6 85%,#FF006E 100%)",
          }}
        />
      </span>
      <span
        style={{ fontFamily: "'Space Mono', monospace", fontSize: "12px", letterSpacing: ".04em" }}
      >
        {ledgerBroken
          ? "ledger unreadable — paid runs blocked (fail-closed)"
          : `$${spentUsd.toFixed(2)} / $${DAILY_WALL_USD.toFixed(2)}${frac >= 1 ? " · WALL HIT — resets midnight UTC" : hot ? " · wall close" : ""}`}
        {emailCredits > 0 && !ledgerBroken && ` · ${emailCredits} email credit${emailCredits === 1 ? "" : "s"}`}
      </span>
    </div>
  );
}
