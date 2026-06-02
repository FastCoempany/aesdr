"use client";

/**
 * The Net-math section of /x/kit/what-you-earn — owns both the consumer
 * commission shape (LEFT) and the Enterprise sibling track (RIGHT), plus
 * the floating expansion that opens BELOW the 2-column grid when the
 * affiliate clicks "Tell Us More".
 *
 * Architecture:
 *   - LEFT column: the canonical SDR / AE commission math, ink terminal
 *     block, mono. Unchanged content; just one column of a 2-col grid now.
 *   - RIGHT column: the teaser — header ("Sell to teams and/or
 *     enterprises?") + subhead + "Tell Us More" button. Stays the height
 *     of the left column, no stretching.
 *   - BELOW the grid (full-width): the iris-shimmer-glow cream panel
 *     reveals when the teaser button fires. Floats subtly (translateY 3px
 *     loop), iris-gradient animated border, illuminated drop shadow stack.
 *
 * Lift state to this component so the toggle in the right column controls
 * the full-width expansion below — keeps the grid heights balanced no
 * matter the expansion's actual content height.
 *
 * Submit fires kit_enterprise_intent_submitted (PostHog + Supabase +
 * founder email; see /x/track route).
 */
import { useState } from "react";
import Image from "next/image";
import { EnterpriseLockup } from "@/components/brand/EnterpriseLockup";
import { trackProspect } from "../_lib/track";

export default function EnterprisePanel() {
  const [open, setOpen] = useState(false);
  const [biggestDeal, setBiggestDeal] = useState("");
  const [dealDate1, setDealDate1] = useState("");
  const [dealDate2, setDealDate2] = useState("");
  const [cycle, setCycle] = useState("");
  const [verticals, setVerticals] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const canSubmit =
    biggestDeal.trim().length > 1 &&
    (dealDate1.length > 0 || dealDate2.length > 0) &&
    cycle.trim().length > 1 &&
    verticals.trim().length > 1;

  function handleSubmit() {
    if (!canSubmit) return;
    trackProspect("kit_enterprise_intent_submitted", {
      biggest_deal: biggestDeal.trim().slice(0, 300),
      deal_date_1: dealDate1 || null,
      deal_date_2: dealDate2 || null,
      sales_cycle: cycle.trim().slice(0, 300),
      verticals: verticals.trim().slice(0, 300),
    });
    setSubmitted(true);
  }

  function handleToggle() {
    setOpen((v) => {
      const next = !v;
      if (next) trackProspect("kit_enterprise_panel_opened");
      return next;
    });
  }

  return (
    <>
      {/* Local keyframes (scoped via the .ent-* class prefix below) */}
      <style>{`
        @keyframes ent-glow-shimmer {
          0%   { background-position:   0% 50%, 0% 0%; }
          100% { background-position: 300% 50%, 0% 0%; }
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
          border-radius: 12px;
          padding: 2px;
          background:
            var(--iris) border-box,
            linear-gradient(var(--cream, #FAF7F2), var(--cream, #FAF7F2)) padding-box;
          background-size: 300% 100%, 100% 100%;
          background-repeat: no-repeat, no-repeat;
          animation:
            ent-glow-shimmer 8s linear infinite,
            ent-float 7s ease-in-out infinite;
          border: 1px solid transparent;
          box-shadow:
            0 0 18px rgba(255, 0, 110, 0.16),
            0 0 36px rgba(139, 92, 246, 0.14),
            0 24px 48px -20px rgba(26, 26, 26, 0.28),
            0 10px 18px -8px rgba(139, 26, 26, 0.16);
        }
        .ent-glow-inner {
          background: var(--cream, #FAF7F2);
          border-radius: 10px;
          padding: 32px clamp(22px, 4vw, 36px) 28px;
          color: var(--ink, #1A1A1A);
          position: relative;
        }
      `}</style>

      {/* ── 2-column grid: SDR/AE math (left) + Enterprise track (right) ──
              alignItems: start so columns don't stretch. The right column
              is position:relative so the expansion panel can absolute-
              position inside it — that way the expansion FLOATS over
              content below on scroll instead of pushing the section
              taller (which would create a white band beside the left
              column). overflow: visible so the absolute child isn't
              clipped at the section boundary. */}
      <div
        style={{
          marginTop: 28,
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
          gap: 16,
          alignItems: "start",
          position: "relative",
          overflow: "visible",
        }}
      >
        <ConsumerMathBlock />

        <div style={{ position: "relative", overflow: "visible" }}>
          <EnterpriseTeaser open={open} onToggle={handleToggle} />

          {/* Expansion lives INSIDE the right column, absolute-positioned
              just below the teaser so it floats over content beneath on
              scroll. Width tracks the right column (left:0, right:0). */}
          {open && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                marginTop: 14,
                zIndex: 20,
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
                      dealDate1={dealDate1}
                      setDealDate1={setDealDate1}
                      dealDate2={dealDate2}
                      setDealDate2={setDealDate2}
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
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────
   LEFT column — the consumer SDR/AE commission math
   ───────────────────────────────────────────────── */
function ConsumerMathBlock() {
  return (
    <div
      style={{
        background: "var(--ink, #1A1A1A)",
        color: "#FAF7F2",
        padding: "26px 28px 28px",
        fontFamily: "var(--mono, 'Space Mono', monospace)",
        fontSize: 14,
        lineHeight: 1.85,
        borderLeft: "4px solid var(--crimson, #8B1A1A)",
        overflowX: "auto",
      }}
    >
      <div style={{ opacity: 0.55, marginBottom: 10 }}># SDR plan — $249</div>
      <div>$249.00 gross enrollment</div>
      <div>&nbsp;&nbsp;− $&nbsp;&nbsp;7.47 processing fee (~3%)</div>
      <div>&nbsp;&nbsp;− $&nbsp;&nbsp;0.00 refunds</div>
      <div>&nbsp;&nbsp;= $241.53 net</div>
      <div style={{ color: "#8B5CF6", marginTop: 6 }}>
        &nbsp;&nbsp;×&nbsp;&nbsp;&nbsp;40% =
        <strong>&nbsp;&nbsp;~$96.61 to you</strong>
      </div>

      <div style={{ opacity: 0.55, margin: "22px 0 10px" }}># AE plan — $299</div>
      <div>$299.00 gross enrollment</div>
      <div>&nbsp;&nbsp;− $&nbsp;&nbsp;8.97 processing fee (~3%)</div>
      <div>&nbsp;&nbsp;− $&nbsp;&nbsp;0.00 refunds</div>
      <div>&nbsp;&nbsp;= $290.03 net</div>
      <div style={{ color: "#8B5CF6", marginTop: 6 }}>
        &nbsp;&nbsp;×&nbsp;&nbsp;&nbsp;40% =
        <strong>&nbsp;&nbsp;~$116.01 to you</strong>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   RIGHT column — the Enterprise teaser
   Cream panel with crimson rail, A · E tiny mark in the corner,
   subhead, and the "Tell Us More" CTA. Kept tight so the column
   roughly matches the consumer math block's height.
   ───────────────────────────────────────────────── */
function EnterpriseTeaser({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      style={{
        background: "var(--cream, #FAF7F2)",
        border: "1px solid var(--crimson, #8B1A1A)",
        borderLeft: "4px solid var(--crimson, #8B1A1A)",
        padding: "26px 28px 28px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        justifyContent: "space-between",
      }}
    >
      <div>
        <div style={{ marginBottom: 14 }}>
          {/* Full AESDR / Enterprise lockup here — this is the teaser's
              brand introduction, so we lead with the wordmark, not the
              abbreviated A · E mark. The A · E tiny variant stays
              reserved for the bridge footer in the expanded panel
              below, where the full lockup already appears upstairs and
              would otherwise duplicate. */}
          <EnterpriseLockup size="small" />
        </div>
        <h3
          style={{
            fontFamily: "var(--display, 'Playfair Display', Georgia, serif)",
            fontStyle: "italic",
            fontWeight: 700,
            fontSize: "clamp(22px, 2.6vw, 28px)",
            lineHeight: 1.18,
            margin: "0 0 10px",
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
            fontSize: 16,
            lineHeight: 1.6,
            color: "var(--muted, #6B6B6B)",
            margin: 0,
          }}
        >
          We&rsquo;re wired for it. Different track, different conversation.
          A modest team plan starts at 10 seats.
        </p>
      </div>

      <button
        type="button"
        onClick={onToggle}
        data-preview-allow="1"
        aria-expanded={open}
        style={{
          fontFamily: "var(--cond, 'Barlow Condensed', sans-serif)",
          textTransform: "uppercase",
          letterSpacing: ".16em",
          fontSize: 13,
          color: "#FAF7F2",
          background: "var(--crimson, #8B1A1A)",
          border: "none",
          borderRadius: 2,
          padding: "13px 22px",
          cursor: "pointer",
          fontWeight: 700,
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          alignSelf: "flex-start",
          transition: "background 200ms ease",
        }}
      >
        {open ? "Close" : "Tell Us More"}
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
    </div>
  );
}

/* ─────────────────────────────────────────────────
   Expanded panel content (form)
   ───────────────────────────────────────────────── */
function PanelContent({
  biggestDeal,
  setBiggestDeal,
  dealDate1,
  setDealDate1,
  dealDate2,
  setDealDate2,
  cycle,
  setCycle,
  verticals,
  setVerticals,
  canSubmit,
  onSubmit,
}: {
  biggestDeal: string;
  setBiggestDeal: (v: string) => void;
  dealDate1: string;
  setDealDate1: (v: string) => void;
  dealDate2: string;
  setDealDate2: (v: string) => void;
  cycle: string;
  setCycle: (v: string) => void;
  verticals: string;
  setVerticals: (v: string) => void;
  canSubmit: boolean;
  onSubmit: () => void;
}) {
  return (
    <>
      {/* Lockup at the top of the expanded panel — full wordmark here, the
          A·E tiny mark sat upstairs in the teaser column. */}
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
          Give us a few highlights for a quick fit-check
        </p>

        {/* Partnership field — text description + 2 date inputs (≥1 required) */}
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
          >
            Last 1&ndash;2 partnership-size licenses/partnerships you placed
          </span>
          <input
            type="text"
            value={biggestDeal}
            onChange={(e) => setBiggestDeal(e.target.value)}
            placeholder="e.g. 25 seats / $4K / mid-market SaaS"
            maxLength={300}
            data-preview-allow="1"
            style={fieldInputStyle}
            onFocus={fieldFocus}
            onBlur={fieldBlur}
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              marginTop: 6,
            }}
          >
            <DateSubField
              label="Date #1 (required)"
              value={dealDate1}
              onChange={setDealDate1}
            />
            <DateSubField
              label="Date #2 (optional)"
              value={dealDate2}
              onChange={setDealDate2}
            />
          </div>
        </label>

        <Field
          label="Typical time you sign teams/enterprise affiliate partnerships"
          placeholder="e.g. 3&ndash;6 months from intro to signed"
          value={cycle}
          onChange={setCycle}
        />
        <Field
          label="Sectors or functions you sold into in the last 6 months"
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
          Submit and Grab Calendar Time →
        </button>
        <p
          style={{
            fontFamily: "var(--serif, 'Source Serif 4', Georgia, serif)",
            fontStyle: "italic",
            fontSize: 13,
            lineHeight: 1.55,
            color: "var(--muted, #6B6B6B)",
            margin: "2px 0 0",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "baseline",
            gap: 4,
          }}
        >
          <span>
            We read every submission. If it makes sense, we&rsquo;ll link you to
            the
          </span>
          <EnterpriseLockup
            size="small"
            style={{ transform: "translateY(2px)" }}
          />
          <span>hub directly.</span>
        </p>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────
   Inline field helpers — re-used by the partnership field so its
   text input matches the visual register of the generic Field.
   ───────────────────────────────────────────────── */
const fieldInputStyle: React.CSSProperties = {
  fontFamily: "var(--serif, 'Source Serif 4', Georgia, serif)",
  fontSize: 15,
  padding: "11px 13px",
  background: "rgba(139, 26, 26, 0.04)",
  border: "1px solid rgba(139, 26, 26, 0.25)",
  color: "var(--ink, #1A1A1A)",
  borderRadius: 2,
  outline: "none",
  transition: "border-color 180ms ease, background 180ms ease",
};

function fieldFocus(e: React.FocusEvent<HTMLInputElement>) {
  e.currentTarget.style.borderColor = "var(--crimson, #8B1A1A)";
  e.currentTarget.style.background = "rgba(139, 26, 26, 0.07)";
}
function fieldBlur(e: React.FocusEvent<HTMLInputElement>) {
  e.currentTarget.style.borderColor = "rgba(139, 26, 26, 0.25)";
  e.currentTarget.style.background = "rgba(139, 26, 26, 0.04)";
}

function DateSubField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span
        style={{
          fontFamily: "var(--cond, 'Barlow Condensed', sans-serif)",
          textTransform: "uppercase",
          letterSpacing: ".14em",
          fontSize: 10,
          color: "var(--muted, #6B6B6B)",
        }}
      >
        {label}
      </span>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        data-preview-allow="1"
        style={{
          ...fieldInputStyle,
          fontSize: 14,
          padding: "9px 12px",
          fontFamily: "var(--mono, 'Space Mono', monospace)",
        }}
        onFocus={fieldFocus}
        onBlur={fieldBlur}
      />
    </label>
  );
}

/* ─────────────────────────────────────────────────
   Success state
   ───────────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────────
   Bridge footer — sits at the bottom of the expanded panel.
   Diagnosis-pose Leponeus rendered large + the A·E tiny mark
   (not the full wordmark — that's already up top in the panel)
   + the canonical AESDR_ENTERPRISE_CANON §1.3 bridge line.
   ───────────────────────────────────────────────── */
function BridgeFooter() {
  return (
    <div
      style={{
        marginTop: 30,
        paddingTop: 22,
        borderTop: "1px solid rgba(139, 26, 26, 0.18)",
        display: "flex",
        gap: 22,
        alignItems: "center",
      }}
    >
      <div style={{ flexShrink: 0 }}>
        <Image
          src="/mascot/leponeus-diagnosis.png"
          alt=""
          width={104}
          height={104}
          style={{ display: "block", opacity: 0.95 }}
        />
      </div>
      <div>
        <div style={{ marginBottom: 8 }}>
          <EnterpriseLockup size="tiny" />
        </div>
        <p
          style={{
            fontFamily: "var(--serif, 'Source Serif 4', Georgia, serif)",
            fontSize: 14.5,
            lineHeight: 1.65,
            margin: 0,
            color: "var(--muted, #6B6B6B)",
          }}
        >
          AESDR / Enterprise is built on{" "}
          {/* No data-preview-allow — PreviewOnlyWrap intercepts this and
              shows the "no no no" popup. Prospects don't get to leave the
              experience for the real site mid-evaluation. */}
          <a
            href="https://aesdr.com"
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

/* ─────────────────────────────────────────────────
   Field (text input)
   ───────────────────────────────────────────────── */
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
