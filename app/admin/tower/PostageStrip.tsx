import twr from "./tower.module.css";

/**
 * Postage — the $10/day agent-spend wall rendered as a strip of ten stamps in
 * the warren's masthead (founder pick from "the desk", 2026-07-15). Whole
 * stamps fill with the iris as dollars burn; the partial stamp goes solid.
 * When the ledger can't be read, paid runs fail closed — so say that, loudly,
 * instead of showing a clean strip.
 */
export default function PostageStrip({
  spentUsd,
  wallUsd,
  emailCredits,
  ledgerBroken,
}: {
  spentUsd: number;
  wallUsd: number;
  emailCredits: number;
  ledgerBroken: boolean;
}) {
  const whole = Math.min(wallUsd, Math.floor(spentUsd));
  const partial = !ledgerBroken && spentUsd > whole && whole < wallUsd;
  const hit = spentUsd >= wallUsd;

  return (
    <div className={twr.postage}>
      <span>the warren · partnerships · live</span>
      <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 8 }}>
        {ledgerBroken ? (
          <span className={twr.postageWarn}>
            spend ledger unreadable — paid runs are refusing (fail closed)
          </span>
        ) : (
          <>
            <span>
              postage — ${spentUsd.toFixed(2)} of ${wallUsd}/day
              {hit && <span className={twr.postageWarn}> · WALL HIT — resets midnight UTC</span>}
            </span>
            <span className={twr.stampRow} aria-hidden>
              {Array.from({ length: wallUsd }, (_, i) => (
                <span
                  key={i}
                  className={`${twr.stamp} ${i < whole ? twr.stampUsed : ""} ${i === whole && partial ? twr.stampPart : ""}`}
                />
              ))}
            </span>
            <span>· ✉ credits today: {emailCredits}</span>
          </>
        )}
      </span>
    </div>
  );
}
