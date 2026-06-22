"use client";

import { useState } from "react";

/**
 * Affiliate earnings calculator — a prospect enters their audience size and
 * sees the per-scenario monthly + annual commission. Numbers are estimates
 * built from the benchmark conversion scenarios, not promises. 40% commission
 * on the $249 one-time price (the floor; the AE course is $299).
 */

const PRICE = 249; // SDR course floor; AE is $299
const COMMISSION = 0.4;

const SCENARIOS = [
  { name: "Conservative", click: 0.01, conv: 0.01, note: "a quiet mention now and then" },
  { name: "Steady", click: 0.02, conv: 0.015, note: "the typical engaged operator" },
  { name: "Strong", click: 0.025, conv: 0.025, note: "a real, specific recommendation" },
  { name: "Endorsement", click: 0.035, conv: 0.03, note: "you genuinely vouch for it" },
];

const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default function Calculator() {
  const [audience, setAudience] = useState(5000);

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "56px 6% 100px" }}>
      <p
        style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 11,
          letterSpacing: ".3em",
          textTransform: "uppercase",
          color: "#8B1A1A",
          margin: "0 0 10px",
        }}
      >
        AESDR · Affiliate Program
      </p>
      <h1
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontStyle: "italic",
          fontWeight: 900,
          fontSize: "clamp(32px, 5vw, 52px)",
          lineHeight: 1.05,
          margin: "0 0 16px",
          color: "#1A1A1A",
        }}
      >
        What your audience could earn you.
      </h1>
      <p
        style={{
          fontFamily: "'Source Serif 4', Georgia, serif",
          fontSize: 18,
          lineHeight: 1.7,
          color: "#1A1A1A",
          margin: "0 0 32px",
        }}
      >
        40% commission on a one-time $249 course (the AE course is $299), with a
        30-day attribution window. Enter your audience size and see the range —
        these are estimates from real conversion benchmarks, not promises.
      </p>

      <label
        style={{
          display: "block",
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: ".14em",
          textTransform: "uppercase",
          color: "#6B6B6B",
          marginBottom: 8,
        }}
      >
        Your audience size
      </label>
      <input
        type="range"
        min={500}
        max={100000}
        step={500}
        value={audience}
        onChange={(e) => setAudience(Number(e.target.value))}
        style={{ width: "100%", accentColor: "#8B1A1A" }}
      />
      <div
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontStyle: "italic",
          fontWeight: 700,
          fontSize: 34,
          color: "#8B1A1A",
          margin: "8px 0 28px",
        }}
      >
        {audience.toLocaleString("en-US")} people
      </div>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "#fff",
          border: "1px solid #E8E4DF",
          fontFamily: "'Source Serif 4', Georgia, serif",
        }}
      >
        <thead>
          <tr>
            {["Scenario", "Sales / mo", "You earn / mo", "Per year"].map((h) => (
              <th
                key={h}
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 12,
                  letterSpacing: ".1em",
                  textTransform: "uppercase",
                  color: "#6B6B6B",
                  textAlign: h === "Scenario" ? "left" : "right",
                  padding: "12px 14px",
                  borderBottom: "2px solid #1A1A1A",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {SCENARIOS.map((s) => {
            const sales = audience * s.click * s.conv;
            const monthly = sales * PRICE * COMMISSION;
            // R5-EE-10: a fractional "0.5 sales → $50/mo" reads as nonsense.
            // Below one sale/mo, express it as a cadence ("~1 every N months")
            // and floor the dollars to that same whole sale so the row is
            // internally consistent rather than implying half a payout.
            const subOne = sales > 0 && sales < 1;
            const everyN = subOne ? Math.round(1 / sales) : 0;
            const salesLabel = subOne ? `~1 / ${everyN} mo` : Math.round(sales).toString();
            const monthlyShown = subOne ? (PRICE * COMMISSION) / everyN : monthly;
            return (
              <tr key={s.name}>
                <td style={{ padding: "12px 14px", borderBottom: "1px solid #E8E4DF" }}>
                  <div style={{ fontWeight: 600, color: "#1A1A1A" }}>{s.name}</div>
                  <div style={{ fontSize: 12.5, color: "#6B6B6B", fontStyle: "italic" }}>{s.note}</div>
                </td>
                <td style={{ padding: "12px 14px", borderBottom: "1px solid #E8E4DF", textAlign: "right", fontFamily: "'Space Mono', monospace", fontSize: 13, color: "#1A1A1A" }}>
                  {salesLabel}
                </td>
                <td style={{ padding: "12px 14px", borderBottom: "1px solid #E8E4DF", textAlign: "right", fontFamily: "'Space Mono', monospace", fontSize: 14, fontWeight: 700, color: "#8B1A1A" }}>
                  {fmt(monthlyShown)}{subOne ? " avg" : ""}
                </td>
                <td style={{ padding: "12px 14px", borderBottom: "1px solid #E8E4DF", textAlign: "right", fontFamily: "'Space Mono', monospace", fontSize: 13, color: "#1A1A1A" }}>
                  {fmt(monthlyShown * 12)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <p
        style={{
          fontFamily: "'Source Serif 4', Georgia, serif",
          fontSize: 13,
          lineHeight: 1.6,
          color: "#6B6B6B",
          fontStyle: "italic",
          margin: "16px 0 32px",
        }}
      >
        How it works: audience × click-through × purchase rate = sales; sales ×
        40% × $249 = your commission. Click-through and purchase rates come from
        the benchmark scenarios above. A more engaged, more specific
        recommendation moves you down the table.
      </p>

      <a
        href="/affiliates/apply"
        style={{
          display: "inline-block",
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: ".16em",
          textTransform: "uppercase",
          color: "#FFFFFF",
          background: "#8B1A1A",
          padding: "14px 28px",
          textDecoration: "none",
        }}
      >
        Apply to the program →
      </a>
    </div>
  );
}
