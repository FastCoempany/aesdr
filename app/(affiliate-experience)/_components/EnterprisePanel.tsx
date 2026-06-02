"use client";

/**
 * The Enterprise sibling track — sits below the consumer SDR/AE math on
 * /x/kit/what-you-earn, collapsed by default.
 *
 * Structure:
 *   1. Always-visible header: "Sell to teams and/or enterprises?"
 *   2. Always-visible toggle button — opens the panel
 *   3. On open: a floating, cream-on-crimson-accent panel with an iris
 *      shimmer glow around the perimeter (no black plate anymore). The
 *      panel subtly translates Y in place so it reads as detached from
 *      the page surface — institutional + premium, distinct from the
 *      consumer-side mono terminal.
 *
 * Inside the panel:
 *   - AESDR / Enterprise lockup
 *   - Sample team tiers (modest)
 *   - Qualifier form (three short text fields, no "proof points" word)
 *   - Bridge footer per AESDR_ENTERPRISE_CANON §1.3 — the canonical
 *     "built on aesdr.com" line + small Leponeus diagnosis mark
 *
 * Submit fires kit_enterprise_intent_submitted (PostHog + Supabase +
 * email; see /x/track route).
 */
import { useState } from "react";
import Image from "next/image";
import { EnterpriseLockup } from "@/components/brand/EnterpriseLockup";
import { trackProspect } from "../_lib/track";

export default function EnterprisePanel() {
  const [open, setOpen] = useState(false);
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

  function handleToggle() {
    setOpen((v) => {
      const next = !v;
      if (next) {
        // Fire once when expanded for the first time so /x/ops can see who
        // is actually opening the enterprise track vs scrolling past it.
        trackProspect("kit_enterprise_panel_opened");
      }
      return next;
    });
  }

  return (
    <div style={{ marginTop: 8 }}>
      {/* ── Local keyframes — float + glow shimmer + collapse reveal ── */}
      <style>{`
        @keyframes ent-glow-shimmer {
          0%   { background-position:   0% 50%; }
          100% { background-position: 300% 50%; }
        }
        @keyframes ent-float {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-3px); }
        }
        @keyframes ent-reveal {
          0%   { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .ent-glow-wrap {
          position: relative;
          border-radius: 14px;
          padding: 6px;
          background:
            linear-gradient(var(--cream, #FAF7F2), var(--cream, #FAF7F2))
            padding-box,
            var(--iris) border-box;
          background-size: 100% 100%, 300% 100%;
          background-repeat: no-repeat;
          animation:
            ent-glow-shimmer 8s linear infinite,
            ent-float 7s ease-in-out infinite;
          border: 2px solid transparent;
          box-shadow:
            0 0 22px rgba(255, 0, 110, 0.18),
            0 0 44px rgba(139, 92, 246, 0.16),
            0 28px 56px -22px rgba(26, 26, 26, 0.30),
            0 12px 22px -10px rgba(139, 26, 26, 0.18);
        }
        .ent-glow-inner {
          background: var(--cream, #FAF7F2);
          border-radius: 9px;
          padding: 32px clamp(22px, 4vw, 36px) 28px;
          color: var(--ink, #1A1A1A);
          position: relative;
        }
      `}</style>

      {/* ── Always-visible header above the toggle ── */}
      <h3
        style={{
          fontFamily: "var(--display, 'Playfair Display', Georgia, serif)",
          fontStyle: "italic",
          fontWeight: 700,
          fontSize: "clamp(24px, 3vw, 32px)",
          lineHeight: 1.18,
          margin: "0 0 8px",
          letterSpacing: "-0.005em",
          color: "var(--ink, #1A1A1A)",
        }}
      >
        Sell to teams and/or enterprises?
      </h3>
      <p
        style={{
          fontFamily: "var(--serif, 'Source Serif 4', Georgia, serif)",
          fontStyle: "italic",
          fontSize: 17,
          lineHeight: 1.6,
          color: "var(--muted, #6B6B6B)",
          margin: "0 0 18px",
          maxWidth: 640,
        }}
      >
        We&rsquo;re wired for it. Different track, different conversation.
      </p>

      {/* ── Toggle button ── */}
      <button
        type="button"
        onClick={handleToggle}
        data-preview-allow="1"
        aria-expanded={open}
        style={{
          fontFamily: "var(--cond, 'Barlow Condensed', sans-serif)",
          textTransform: "uppercase",
          letterSpacing: ".16em",
          fontSize: 13,
          color: open ? "var(--ink, #1A1A1A)" : "#FAF7F2",
          background: open ? "transparent" : "var(--ink, #1A1A1A)",
          border: open
            ? "1.5px solid var(--ink, #1A1A1A)"
            : "1.5px solid var(--ink, #1A1A1A)",
          borderRadius: 2,
          padding: "12px 22px",
          cursor: "pointer",
          fontWeight: 700,
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          transition: "background 200ms ease, color 200ms ease",
        }}
      >
        {open ? "Hide the team track" : "Open the team track"}
        <span
          aria-hidden
          style={{
            display: "inline-block",
            transition: "transform 260ms cubic-bezier(.22,1.1,.35,1)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            fontSize: 14,
          }}
        >
          ▾
        </span>
      </button>

      {/* ── The floating glow panel ── */}
      {open && (
        <div
          style={{
            marginTop: 28,
            animation: "ent-reveal 420ms cubic-bezier(.22,1.1,.35,1)",
          }}
        >
          <div className="ent-glow-wrap">
            <div className="ent-glow-inner">
              {submitted ? (
                <SuccessState />
              ) : (
                <PanelContent
                  biggestDeal={biggestDeal}
                  setBiggestDeal={setBiggestDeal}
                  cycle={cycle}
                  setCycle={setCycle}
                  verticals={verticals}
                  setVerticals={setVerticals}
                  canSubmit={canSubmit}
                  onSubmit={handleSubmit}
                />
              )}

              <BridgeFooter />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────────────────────────────
   Inner content of the floating panel (form state)
   ─────────────────────────────────────────────── */
function PanelContent({
  biggestDeal,
  setBiggestDeal,
  cycle,
  setCycle,
  verticals,
  setVerticals,
  canSubmit,
  onSubmit,
}: {
  biggestDeal: string;
  setBiggestDeal: (v: string) => void;
  cycle: string;
  setCycle: (v: string) => void;
  verticals: string;
  setVerticals: (v: string) => void;
  canSubmit: boolean;
  onSubmit: () => void;
}) {
  return (
    <>
      {/* Sub-brand lockup */}
      <div style={{ marginBottom: 22 }}>
        <EnterpriseLockup size="medium" />
      </div>

      {/* Pitch */}
      <p
        style={{
          fontFamily: "var(--serif, 'Source Serif 4', Georgia, serif)",
          fontSize: 17,
          lineHeight: 1.65,
          margin: "0 0 24px",
          color: "var(--ink, #1A1A1A)",
        }}
      >
        Team licensing starts at <strong>10 seats</strong>. One-time
        purchase per seat, quoted per team. The shape below is what a
        modest engagement actually looks like.
      </p>

      {/* Sample tiers */}
      <div
        style={{
          borderTop: "1px solid rgba(139, 26, 26, 0.18)",
          borderBottom: "1px solid rgba(139, 26, 26, 0.18)",
          padding: "16px 0",
          marginBottom: 26,
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
                fontFamily: "var(--cond, 'Barlow Condensed', sans-serif)",
                fontSize: 13,
                letterSpacing: ".14em",
                textTransform: "uppercase",
                color: "var(--muted, #6B6B6B)",
              }}
            >
              {tier.range}
            </span>
            <span
              style={{
                fontFamily: "var(--mono, 'Space Mono', monospace)",
                fontSize: 13,
                color: "var(--crimson, #8B1A1A)",
                fontWeight: 700,
              }}
            >
              {tier.price}
            </span>
          </div>
        ))}
      </div>

      {/* Qualification form */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <p
          style={{
            fontFamily: "var(--cond, 'Barlow Condensed', sans-serif)",
            fontSize: 11,
            letterSpacing: ".22em",
            textTransform: "uppercase",
            color: "var(--crimson, #8B1A1A)",
            margin: 0,
            fontWeight: 700,
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
          onClick={onSubmit}
          disabled={!canSubmit}
          data-preview-allow="1"
          style={{
            marginTop: 8,
            fontFamily: "var(--cond, 'Barlow Condensed', sans-serif)",
            textTransform: "uppercase",
            letterSpacing: ".16em",
            fontSize: 13,
            color: "#FAF7F2",
            background: canSubmit
              ? "var(--crimson, #8B1A1A)"
              : "rgba(139, 26, 26, 0.35)",
            border: "none",
            borderRadius: 2,
            padding: "13px 22px",
            cursor: canSubmit ? "pointer" : "not-allowed",
            alignSelf: "flex-start",
            fontWeight: 700,
            transition: "background 200ms ease",
          }}
        >
          Submit for the enterprise track →
        </button>
        <p
          style={{
            fontFamily: "var(--serif, 'Source Serif 4', Georgia, serif)",
            fontStyle: "italic",
            fontSize: 13,
            lineHeight: 1.55,
            color: "var(--muted, #6B6B6B)",
            margin: "2px 0 0",
          }}
        >
          We read every submission. If the shape fits, we&rsquo;ll link
          you to the enterprise hub directly.
        </p>
      </div>
    </>
  );
}

/* ───────────────────────────────────────────────
   Success state
   ─────────────────────────────────────────────── */
function SuccessState() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ marginBottom: 8 }}>
        <EnterpriseLockup size="medium" />
      </div>
      <p
        style={{
          fontFamily: "var(--cond, 'Barlow Condensed', sans-serif)",
          fontSize: 11,
          letterSpacing: ".24em",
          textTransform: "uppercase",
          color: "var(--crimson, #8B1A1A)",
          margin: 0,
          fontWeight: 700,
        }}
      >
        Submission received
      </p>
      <p
        style={{
          fontFamily: "var(--display, 'Playfair Display', Georgia, serif)",
          fontStyle: "italic",
          fontSize: 24,
          lineHeight: 1.3,
          color: "var(--ink, #1A1A1A)",
          margin: 0,
          letterSpacing: "-0.005em",
        }}
      >
        Noted. We&rsquo;ll review and reach back out — usually inside 48
        hours.
      </p>
      <p
        style={{
          fontFamily: "var(--serif, 'Source Serif 4', Georgia, serif)",
          fontSize: 16,
          lineHeight: 1.6,
          color: "var(--muted, #6B6B6B)",
          margin: 0,
        }}
      >
        While you wait, the enterprise hub is open for browsing. Same
        brand, different surface — built for sales-org buyers.
      </p>
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
          color: "#FAF7F2",
          background: "var(--crimson, #8B1A1A)",
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

/* ───────────────────────────────────────────────
   Bridge footer — the canonical AESDR_ENTERPRISE_CANON §1.3 line.
   Small diagnosis-pose Leponeus paired with the bridge copy so the
   panel closes on its sub-brand register, not the affiliate kit's
   editorial register.
   ─────────────────────────────────────────────── */
function BridgeFooter() {
  return (
    <div
      style={{
        marginTop: 30,
        paddingTop: 22,
        borderTop: "1px solid rgba(139, 26, 26, 0.18)",
        display: "flex",
        gap: 16,
        alignItems: "flex-start",
      }}
    >
      <div style={{ flexShrink: 0, marginTop: 2 }}>
        <Image
          src="/mascot/leponeus-diagnosis.png"
          alt=""
          width={40}
          height={40}
          style={{ display: "block", opacity: 0.92 }}
        />
      </div>
      <div>
        <div style={{ marginBottom: 6 }}>
          <EnterpriseLockup size="small" />
        </div>
        <p
          style={{
            fontFamily: "var(--serif, 'Source Serif 4', Georgia, serif)",
            fontSize: 14,
            lineHeight: 1.6,
            margin: 0,
            color: "var(--muted, #6B6B6B)",
          }}
        >
          AESDR / Enterprise is built on{" "}
          <a
            href="https://aesdr.com"
            target="_blank"
            rel="noopener noreferrer"
            data-preview-allow="1"
            style={{
              color: "var(--crimson, #8B1A1A)",
              textDecoration: "underline",
              textDecorationThickness: 1,
              textUnderlineOffset: 3,
            }}
          >
            aesdr.com
          </a>{" "}
          — the AE/SDR-direct course that 1st- and 2nd-year SDRs and AEs
          actually use. The same 12 courses, packaged for sales orgs.
        </p>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────
   Field (text input)
   ─────────────────────────────────────────────── */
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
        fontFamily: "var(--serif, 'Source Serif 4', Georgia, serif)",
      }}
    >
      <span
        style={{
          fontFamily: "var(--cond, 'Barlow Condensed', sans-serif)",
          textTransform: "uppercase",
          letterSpacing: ".14em",
          fontSize: 11,
          color: "var(--ink, #1A1A1A)",
          fontWeight: 700,
        }}
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
          fontFamily: "var(--serif, 'Source Serif 4', Georgia, serif)",
          fontSize: 15,
          padding: "11px 13px",
          background: "rgba(139, 26, 26, 0.04)",
          border: "1px solid rgba(139, 26, 26, 0.25)",
          color: "var(--ink, #1A1A1A)",
          borderRadius: 2,
          outline: "none",
          transition: "border-color 180ms ease, background 180ms ease",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "var(--crimson, #8B1A1A)";
          e.currentTarget.style.background = "rgba(139, 26, 26, 0.07)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "rgba(139, 26, 26, 0.25)";
          e.currentTarget.style.background = "rgba(139, 26, 26, 0.04)";
        }}
      />
    </label>
  );
}

const TIERS: ReadonlyArray<{ range: string; price: string }> = [
  { range: "10–25 seats", price: "from ~$2,250" },
  { range: "26–75 seats", price: "from ~$8,500" },
  { range: "75+ seats", price: "We'll figure it out together" },
];
