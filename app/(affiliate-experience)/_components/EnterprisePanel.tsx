"use client";

/**
 * The Enterprise sibling panel — sits beside the SDR/AE consumer-commission
 * math on /x/kit/what-you-earn. Visually + tonally distinct from the rest
 * of the kit (which is editorial cream/ink/crimson + serif). This panel
 * uses the AESDR / Enterprise sub-brand register per AESDR_ENTERPRISE_CANON
 * §2.4 + §3 — iris-shimmer wordmark, ink plate, Barlow Condensed body in
 * a more institutional B2B voice.
 *
 * Affiliates who can credibly carry an enterprise / multi-seat conversation
 * submit three short fields about their track record. The form fires
 * `kit_enterprise_intent_submitted` (PostHog + Supabase + founder email),
 * then the panel collapses to a success state with a link to the actual
 * /enterprise hub.
 *
 * Sample team pricing is illustrative — modest, matches the existing
 * "one-time purchase, quote per team" canon on /enterprise. No commission
 * is promised on enterprise deals here; that conversation happens via the
 * enterprise hub.
 */
import { useState } from "react";
import { EnterpriseLockup } from "@/components/brand/EnterpriseLockup";
import { trackProspect } from "../_lib/track";

export default function EnterprisePanel() {
  const [biggestDeal, setBiggestDeal] = useState("");
  const [cycle, setCycle] = useState("");
  const [verticals, setVerticals] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const canSubmit =
    biggestDeal.trim().length > 1 &&
    cycle.trim().length > 1 &&
    verticals.trim().length > 1;

  function handleSubmit() {
    if (!canSubmit) return;
    trackProspect("kit_enterprise_intent_submitted", {
      biggest_deal: biggestDeal.trim().slice(0, 300),
      sales_cycle: cycle.trim().slice(0, 300),
      verticals: verticals.trim().slice(0, 300),
    });
    setSubmitted(true);
  }

  return (
    <div
      style={{
        background: "var(--ink, #1A1A1A)",
        color: "#FAF7F2",
        padding: "32px 30px 30px",
        position: "relative",
        overflow: "hidden",
        borderLeft: "4px solid transparent",
        backgroundImage:
          "linear-gradient(var(--ink, #1A1A1A), var(--ink, #1A1A1A)), var(--iris)",
        backgroundOrigin: "border-box",
        backgroundClip: "padding-box, border-box",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Sub-brand lockup ── */}
      <div style={{ marginBottom: 18 }}>
        <EnterpriseLockup size="medium" />
      </div>

      {submitted ? (
        <SuccessState />
      ) : (
        <>
          {/* ── Headline ── */}
          <h3
            style={{
              fontFamily:
                "var(--cond, 'Barlow Condensed', sans-serif)",
              fontWeight: 600,
              fontSize: "clamp(22px, 2.3vw, 26px)",
              lineHeight: 1.2,
              margin: "0 0 14px",
              letterSpacing: ".005em",
              color: "#FAF7F2",
            }}
          >
            Sell to teams and enterprises?
            <br />
            We&rsquo;re wired for it.
          </h3>
          <p
            style={{
              fontFamily:
                "var(--cond, 'Barlow Condensed', sans-serif)",
              fontWeight: 400,
              fontSize: 15,
              lineHeight: 1.55,
              margin: "0 0 22px",
              color: "rgba(250, 247, 242, 0.78)",
            }}
          >
            Team licensing starts at 10 seats. One-time purchase per seat,
            quoted per team. The shape below is what a modest engagement
            actually looks like.
          </p>

          {/* ── Sample team tiers ── */}
          <div
            style={{
              borderTop: "1px solid rgba(250, 247, 242, 0.12)",
              borderBottom: "1px solid rgba(250, 247, 242, 0.12)",
              padding: "16px 0",
              marginBottom: 22,
              display: "grid",
              gap: 10,
            }}
          >
            {TIERS.map((tier) => (
              <div
                key={tier.range}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: 12,
                  alignItems: "baseline",
                }}
              >
                <span
                  style={{
                    fontFamily:
                      "var(--cond, 'Barlow Condensed', sans-serif)",
                    fontSize: 13,
                    letterSpacing: ".14em",
                    textTransform: "uppercase",
                    color: "rgba(250, 247, 242, 0.74)",
                  }}
                >
                  {tier.range}
                </span>
                <span
                  style={{
                    fontFamily: "var(--mono, 'Space Mono', monospace)",
                    fontSize: 13,
                    color: "#FAF7F2",
                    fontWeight: 700,
                  }}
                >
                  {tier.price}
                </span>
              </div>
            ))}
          </div>

          {/* ── Qualification form ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <p
              style={{
                fontFamily:
                  "var(--cond, 'Barlow Condensed', sans-serif)",
                fontSize: 11,
                letterSpacing: ".22em",
                textTransform: "uppercase",
                color: "rgba(250, 247, 242, 0.6)",
                margin: 0,
              }}
            >
              Show us the wiring
            </p>
            <Field
              label="Biggest team-license you&rsquo;ve placed"
              placeholder="e.g. 25 seats / $4K / mid-market SaaS"
              value={biggestDeal}
              onChange={setBiggestDeal}
            />
            <Field
              label="Typical enterprise sales cycle you operate in"
              placeholder="e.g. 3–6 months from intro to signed"
              value={cycle}
              onChange={setCycle}
            />
            <Field
              label="Sectors or functions you sell into regularly"
              placeholder="e.g. RevOps + enablement at Series B/C SaaS"
              value={verticals}
              onChange={setVerticals}
            />

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              data-preview-allow="1"
              style={{
                marginTop: 6,
                fontFamily:
                  "var(--cond, 'Barlow Condensed', sans-serif)",
                textTransform: "uppercase",
                letterSpacing: ".16em",
                fontSize: 13,
                color: canSubmit ? "#1A1A1A" : "rgba(26,26,26,0.5)",
                background: canSubmit ? "#FAF7F2" : "rgba(250,247,242,0.3)",
                border: "none",
                borderRadius: 2,
                padding: "13px 22px",
                cursor: canSubmit ? "pointer" : "not-allowed",
                alignSelf: "flex-start",
                fontWeight: 700,
                transition: "background 200ms ease, color 200ms ease",
              }}
            >
              Submit for the enterprise track →
            </button>
            <p
              style={{
                fontFamily:
                  "var(--cond, 'Barlow Condensed', sans-serif)",
                fontSize: 11,
                lineHeight: 1.5,
                color: "rgba(250, 247, 242, 0.55)",
                margin: "2px 0 0",
              }}
            >
              We read every submission. If the shape fits, we&rsquo;ll
              link you to the enterprise hub directly.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

function SuccessState() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        flex: 1,
        justifyContent: "center",
      }}
    >
      <p
        style={{
          fontFamily: "var(--cond, 'Barlow Condensed', sans-serif)",
          fontSize: 11,
          letterSpacing: ".24em",
          textTransform: "uppercase",
          color: "rgba(250, 247, 242, 0.65)",
          margin: 0,
        }}
      >
        Submission received
      </p>
      <p
        style={{
          fontFamily: "var(--display, 'Playfair Display', Georgia, serif)",
          fontStyle: "italic",
          fontSize: 22,
          lineHeight: 1.35,
          color: "#FAF7F2",
          margin: 0,
          letterSpacing: "-0.005em",
        }}
      >
        Noted. We&rsquo;ll review and reach back out — usually inside 48
        hours.
      </p>
      <p
        style={{
          fontFamily: "var(--cond, 'Barlow Condensed', sans-serif)",
          fontSize: 14,
          lineHeight: 1.55,
          color: "rgba(250, 247, 242, 0.78)",
          margin: 0,
        }}
      >
        While you wait, the enterprise hub is open for browsing. Same brand,
        different surface — built for sales-org buyers.
      </p>
      {/* Anchor with data-preview-allow lets PreviewOnlyWrap honor the
          off-host nav to the real /enterprise route. Opens in a new tab
          so the prospect's /x/ session stays preserved. */}
      <a
        href="/enterprise"
        target="_blank"
        rel="noopener noreferrer"
        data-preview-allow="1"
        style={{
          fontFamily: "var(--cond, 'Barlow Condensed', sans-serif)",
          textTransform: "uppercase",
          letterSpacing: ".16em",
          fontSize: 13,
          color: "#1A1A1A",
          background: "#FAF7F2",
          padding: "13px 22px",
          textDecoration: "none",
          borderRadius: 2,
          alignSelf: "flex-start",
          fontWeight: 700,
        }}
      >
        Open the enterprise hub ↗
      </a>
    </div>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 5,
        fontFamily: "var(--cond, 'Barlow Condensed', sans-serif)",
      }}
    >
      <span
        style={{
          fontSize: 12,
          color: "rgba(250, 247, 242, 0.78)",
          letterSpacing: ".05em",
        }}
        // Label may contain &rsquo; rendered as raw entity; dangerouslySetInnerHTML
        // keeps the typographic apostrophe intact.
        dangerouslySetInnerHTML={{ __html: label }}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={300}
        data-preview-allow="1"
        style={{
          fontFamily: "var(--cond, 'Barlow Condensed', sans-serif)",
          fontSize: 14,
          padding: "10px 12px",
          background: "rgba(250, 247, 242, 0.08)",
          border: "1px solid rgba(250, 247, 242, 0.20)",
          color: "#FAF7F2",
          borderRadius: 2,
          outline: "none",
          transition: "border-color 180ms ease, background 180ms ease",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "rgba(250, 247, 242, 0.55)";
          e.currentTarget.style.background = "rgba(250, 247, 242, 0.13)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "rgba(250, 247, 242, 0.20)";
          e.currentTarget.style.background = "rgba(250, 247, 242, 0.08)";
        }}
      />
    </label>
  );
}

const TIERS: ReadonlyArray<{ range: string; price: string }> = [
  { range: "10–25 seats", price: "from ~$2,250" },
  { range: "26–75 seats", price: "from ~$8,500" },
  { range: "75+ seats", price: "Quoted on call" },
];
