"use client";

/**
 * EconomicsCalculator — interactive commission projector for /partners/economics.
 *
 * Inputs: audience size, registration rate %, conversion rate %, plan mix.
 * Outputs: projected commission with the math shown.
 *
 * Defaults match the worked-example numbers on the page.
 */

import { useMemo, useState } from "react";

const STRIPE_RATE = 0.029;
const STRIPE_FIXED = 0.30;
const REFUND_RATE = 0.10; // 10% refund within the 14-day window
const COMMISSION = 0.30;

const PLAN_SDR = 249;
const PLAN_AE = 299;

export function EconomicsCalculator() {
  const [audience, setAudience] = useState(1000);
  const [regRate, setRegRate] = useState(8); // %
  const [convRate, setConvRate] = useState(12); // %
  const [sdrPct, setSdrPct] = useState(70); // % of enrollments that are SDR plan

  const results = useMemo(() => {
    const registrants = Math.round(audience * (regRate / 100));
    const enrollments = Math.round(registrants * (convRate / 100));
    const sdr = Math.round(enrollments * (sdrPct / 100));
    const ae = enrollments - sdr;
    const gross = sdr * PLAN_SDR + ae * PLAN_AE;
    const refundLoss = Math.round(gross * REFUND_RATE);
    const grossAfterRefunds = gross - refundLoss;
    const txns = Math.max(0, enrollments - Math.round(enrollments * REFUND_RATE));
    const stripeFees = Math.round(grossAfterRefunds * STRIPE_RATE + txns * STRIPE_FIXED);
    const net = grossAfterRefunds - stripeFees;
    const commission = Math.round(net * COMMISSION);
    return { registrants, enrollments, sdr, ae, gross, refundLoss, stripeFees, net, commission };
  }, [audience, regRate, convRate, sdrPct]);

  return (
    <div
      style={{
        border: "1px solid var(--light)",
        background: "#fff",
        padding: 32,
        marginBottom: 16,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 24,
          marginBottom: 32,
        }}
      >
        <Field label="Audience size">
          <input
            type="number"
            min={50}
            max={500000}
            step={50}
            value={audience}
            onChange={(e) => setAudience(Math.max(0, Number(e.target.value) || 0))}
            style={inputStyle}
          />
        </Field>
        <Field label={`Registration rate · ${regRate}%`}>
          <input
            type="range"
            min={1}
            max={20}
            step={0.5}
            value={regRate}
            onChange={(e) => setRegRate(Number(e.target.value))}
            style={rangeStyle}
          />
          <Hint>Workshop signups as % of audience. Pilot-shaped audiences: 5–12%.</Hint>
        </Field>
        <Field label={`Enrollment conversion · ${convRate}%`}>
          <input
            type="range"
            min={2}
            max={30}
            step={0.5}
            value={convRate}
            onChange={(e) => setConvRate(Number(e.target.value))}
            style={rangeStyle}
          />
          <Hint>Buyers as % of registrants. Live + replay combined: 8–15% is typical.</Hint>
        </Field>
        <Field label={`Plan mix · ${sdrPct}% SDR / ${100 - sdrPct}% AE`}>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={sdrPct}
            onChange={(e) => setSdrPct(Number(e.target.value))}
            style={rangeStyle}
          />
          <Hint>SaaS AE/SDR audiences tilt SDR ($249). AE-heavy audiences shift to $299.</Hint>
        </Field>
      </div>

      {/* Result table */}
      <div
        style={{
          borderTop: "1px solid var(--light)",
          paddingTop: 24,
        }}
      >
        <Line k="Workshop registrants" v={`${results.registrants.toLocaleString()}`} />
        <Line k="Enrollments" v={`${results.enrollments.toLocaleString()} (${results.sdr} SDR + ${results.ae} AE)`} />
        <Line k="Gross revenue" v={`$${results.gross.toLocaleString()}`} />
        <Line k={`Less refunds (${(REFUND_RATE * 100).toFixed(0)}%)`} v={`−$${results.refundLoss.toLocaleString()}`} />
        <Line k="Less Stripe fees" v={`−$${results.stripeFees.toLocaleString()}`} />
        <Line k="Net revenue" v={`$${results.net.toLocaleString()}`} />
        <Line
          k="Your 30% commission"
          v={`$${results.commission.toLocaleString()}`}
          highlight
        />
      </div>

      <p
        style={{
          fontFamily: "var(--serif)",
          fontStyle: "italic",
          fontSize: 14,
          color: "var(--muted)",
          lineHeight: 1.6,
          marginTop: 16,
        }}
      >
        Cohort 1 partners we invite directly add a one-time $500 sign-on bonus on top of the projected commission.
      </p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span
        style={{
          fontFamily: "var(--mono)",
          fontSize: 10,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--muted)",
        }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontFamily: "var(--serif)",
        fontStyle: "italic",
        fontSize: 12,
        color: "var(--muted)",
        lineHeight: 1.5,
      }}
    >
      {children}
    </span>
  );
}

function Line({ k, v, highlight = false }: { k: string; v: string; highlight?: boolean }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto",
        padding: "10px 0",
        borderBottom: "1px solid var(--light)",
        fontFamily: "var(--serif)",
        fontSize: 16,
        color: "var(--ink)",
        gap: 12,
        fontWeight: highlight ? 700 : 400,
        background: highlight ? "var(--light)" : "transparent",
        paddingLeft: highlight ? 12 : 0,
        paddingRight: highlight ? 12 : 0,
        marginTop: highlight ? 4 : 0,
      }}
    >
      <span>{k}</span>
      <span style={{ fontFamily: "var(--mono)", fontSize: 14 }}>{v}</span>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  fontFamily: "var(--mono)",
  fontSize: 16,
  padding: "10px 12px",
  border: "1px solid var(--ink)",
  background: "#fff",
  color: "var(--ink)",
};

const rangeStyle: React.CSSProperties = {
  width: "100%",
  accentColor: "var(--crimson)",
};
