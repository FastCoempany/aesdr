import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Design system · AESDR Admin",
  robots: { index: false, follow: false },
};

const ACTIVE_TOKENS: Array<{ token: string; value: string; use: string }> = [
  { token: "--cream", value: "#FAF7F2", use: "Default page background" },
  { token: "--ink", value: "#1A1A1A", use: "Default body text" },
  { token: "--crimson", value: "#8B1A1A", use: "Primary brand accent (CTAs, emphasis, hero left panel)" },
  { token: "--muted", value: "#6B6B6B", use: "Secondary text" },
  { token: "--light", value: "#E8E4DF", use: "Subtle dividers, low-emphasis surfaces" },
];

const LEGACY_TOKENS: Array<{ token: string; value: string; note: string }> = [
  { token: "--bg-main", value: "#020617", note: "Legacy dark page background" },
  { token: "--bg-panel", value: "#0F172A", note: "Legacy panel surface" },
  { token: "--bg-card", value: "#1E293B", note: "Legacy card surface" },
  { token: "--theme", value: "#10B981", note: "Legacy green accent" },
  { token: "--coral", value: "#EF4444", note: "Legacy error accent" },
  { token: "--cobalt", value: "#38BDF8", note: "Legacy info accent" },
  { token: "--amber", value: "#F59E0B", note: "Legacy warning accent" },
  { token: "--violet", value: "#8B5CF6", note: "Legacy secondary accent" },
];

const FONTS: Array<{ token: string; stack: string; use: string; sample: string; sampleStyle: React.CSSProperties }> = [
  {
    token: "--display",
    stack: "'Playfair Display', Georgia, serif",
    use: "Headlines, role labels",
    sample: "What good actually looks like",
    sampleStyle: { fontFamily: "var(--display)", fontStyle: "italic", fontWeight: 700, fontSize: 32 },
  },
  {
    token: "--serif",
    stack: "'Source Serif 4', Georgia, serif",
    use: "Body text",
    sample: "Body copy is set in Source Serif 4. It reads cleanly at 16-18px on cream.",
    sampleStyle: { fontFamily: "var(--serif)", fontSize: 17, lineHeight: 1.6 },
  },
  {
    token: "--cond",
    stack: "'Barlow Condensed', sans-serif",
    use: "UI labels, buttons, eyebrows",
    sample: "AESDR · AFFILIATES · STRUCTURE",
    sampleStyle: { fontFamily: "var(--cond)", fontSize: 13, letterSpacing: ".15em", textTransform: "uppercase", fontWeight: 500 },
  },
  {
    token: "--mono",
    stack: "'Space Mono', monospace",
    use: "Terminal, classified blocks, taxonomic labels",
    sample: "PROGRAM v1.3 / COHORT 1 / 2026-Q2",
    sampleStyle: { fontFamily: "var(--mono)", fontSize: 12, letterSpacing: ".15em", textTransform: "uppercase" },
  },
  {
    token: "--hand",
    stack: "'Caveat', cursive",
    use: "Michael's voice / margin annotations only",
    sample: "— keep. read twice.",
    sampleStyle: { fontFamily: "var(--hand)", fontSize: 22, color: "var(--crimson)" },
  },
];

const TYPE_RAMP: Array<{ role: string; size: string; weight: string; sample: string; style: React.CSSProperties }> = [
  {
    role: "Hero headline",
    size: "clamp(36px, 5vw, 48px)",
    weight: "700 italic",
    sample: "What the partnership actually is.",
    style: { fontFamily: "var(--display)", fontStyle: "italic", fontWeight: 700, fontSize: "clamp(36px, 5vw, 48px)", lineHeight: 1.15 },
  },
  {
    role: "Section h2",
    size: "28-32px",
    weight: "700 italic",
    sample: "What we'll be doing.",
    style: { fontFamily: "var(--display)", fontStyle: "italic", fontWeight: 700, fontSize: 28 },
  },
  {
    role: "Card title",
    size: "18px",
    weight: "700 italic",
    sample: "See the math →",
    style: { fontFamily: "var(--display)", fontStyle: "italic", fontWeight: 700, fontSize: 18, lineHeight: 1.3 },
  },
  {
    role: "Body",
    size: "16-17px",
    weight: "400",
    sample: "Body copy that scales cleanly across the editorial register.",
    style: { fontFamily: "var(--serif)", fontSize: 17, lineHeight: 1.6 },
  },
  {
    role: "Eyebrow",
    size: "11-13px",
    weight: "500 / 700, uppercase, .15em tracking",
    sample: "AESDR · AFFILIATES",
    style: { fontFamily: "var(--cond)", fontSize: 13, letterSpacing: ".15em", textTransform: "uppercase", fontWeight: 700 },
  },
  {
    role: "Caption / footnote",
    size: "13-14px",
    weight: "400 italic",
    sample: "Same pricing across every audience and every affiliate.",
    style: { fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 14, color: "var(--muted)" },
  },
];

const BUTTON_VARIANTS = [
  {
    label: "Primary CTA (crimson)",
    note: "Use for the single most important action on a page. Max one per surface.",
    style: {
      background: "var(--crimson)",
      color: "#fff",
      padding: "14px 28px",
      fontFamily: "var(--cond)",
      fontSize: 14,
      letterSpacing: ".1em",
      textTransform: "uppercase" as const,
      fontWeight: 600,
      border: "none",
      cursor: "pointer",
    },
    text: "Request the partnership agreement →",
  },
  {
    label: "Secondary (outline ink)",
    note: "For supporting actions. Lower weight than crimson CTAs.",
    style: {
      background: "transparent",
      color: "var(--ink)",
      padding: "13px 27px",
      fontFamily: "var(--cond)",
      fontSize: 14,
      letterSpacing: ".1em",
      textTransform: "uppercase" as const,
      fontWeight: 600,
      border: "1px solid var(--ink)",
      cursor: "pointer",
    },
    text: "See the math →",
  },
  {
    label: "Tertiary (text link with arrow)",
    note: "Inline navigation; no enclosure. Pairs with arrow glyph.",
    style: {
      background: "transparent",
      color: "var(--ink)",
      padding: 0,
      fontFamily: "var(--serif)",
      fontSize: 17,
      fontStyle: "italic" as const,
      textDecoration: "underline",
      border: "none",
      cursor: "pointer",
    },
    text: "Specimen agreement →",
  },
];

const h2Style: React.CSSProperties = {
  fontFamily: "var(--display)",
  fontStyle: "italic",
  fontWeight: 700,
  fontSize: 28,
  color: "var(--ink)",
  marginTop: 56,
  marginBottom: 24,
  borderBottom: "1px solid var(--light)",
  paddingBottom: 12,
};

const monoLabel: React.CSSProperties = {
  fontFamily: "var(--mono)",
  fontSize: 11,
  letterSpacing: ".15em",
  textTransform: "uppercase",
  color: "var(--muted)",
};

export default function DesignSystemPage() {
  return (
    <div style={{ fontFamily: "var(--serif)" }}>
      <h1
        style={{
          fontFamily: "var(--display)",
          fontStyle: "italic",
          fontWeight: 700,
          fontSize: 40,
          color: "var(--ink)",
          marginBottom: 12,
        }}
      >
        Design system.
      </h1>
      <p style={{ fontFamily: "var(--serif)", fontSize: 17, color: "var(--muted)", lineHeight: 1.6, marginBottom: 12 }}>
        Tokens, fonts, type ramp, and button variants. Ground-truth reference
        for contributors. See <code style={{ fontFamily: "var(--mono)", fontSize: 14 }}>AGENTS.md</code> for the
        full canon.
      </p>
      <p style={{ fontFamily: "var(--serif)", fontSize: 15, fontStyle: "italic", color: "var(--muted)", lineHeight: 1.6 }}>
        Active palette is editorial (cream/ink/crimson with iris-shimmer
        accent). The retired dark palette is documented below for backwards
        compatibility — don&apos;t use it in new work.
      </p>

      <h2 style={h2Style}>Active palette</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
        {ACTIVE_TOKENS.map((t) => (
          <div key={t.token} style={{ border: "1px solid var(--light)", background: "#fff" }}>
            <div
              style={{
                height: 80,
                background: t.value,
                borderBottom: "1px solid var(--light)",
              }}
              aria-hidden
            />
            <div style={{ padding: "14px 16px" }}>
              <div style={{ ...monoLabel, marginBottom: 4 }}>{t.token}</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--ink)", marginBottom: 8 }}>{t.value}</div>
              <div style={{ fontFamily: "var(--serif)", fontSize: 14, color: "var(--ink)", lineHeight: 1.5 }}>{t.use}</div>
            </div>
          </div>
        ))}
      </div>

      <h2 style={h2Style}>Iris-shimmer accent</h2>
      <div style={{ border: "1px solid var(--light)", background: "#fff", padding: "14px 16px" }}>
        <div
          style={{
            height: 60,
            background: "var(--iris)",
            marginBottom: 12,
            borderRadius: 2,
          }}
          aria-hidden
        />
        <div style={monoLabel}>--iris</div>
        <div style={{ fontFamily: "var(--serif)", fontSize: 14, color: "var(--ink)", marginTop: 6, lineHeight: 1.5 }}>
          Reserved shimmer accent — role tokens (AE/SDR), key CTA, brand
          wordmark only. Never as a primary surface color.
        </div>
      </div>

      <h2 style={h2Style}>Retired dark palette (legacy only)</h2>
      <p style={{ fontFamily: "var(--serif)", fontSize: 15, color: "var(--muted)", marginBottom: 16, fontStyle: "italic" }}>
        Kept in <code style={{ fontFamily: "var(--mono)", fontSize: 13 }}>app/globals.css</code> for backwards
        compatibility with course HTML built against the old palette. Don&apos;t reach for these in new components — render terminal blocks as <code style={{ fontFamily: "var(--mono)", fontSize: 13 }}>--ink</code> text on <code style={{ fontFamily: "var(--mono)", fontSize: 13 }}>--cream</code> with <code style={{ fontFamily: "var(--mono)", fontSize: 13 }}>--mono</code> instead.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
        {LEGACY_TOKENS.map((t) => (
          <div key={t.token} style={{ border: "1px dashed var(--light)", opacity: 0.85 }}>
            <div style={{ height: 48, background: t.value }} aria-hidden />
            <div style={{ padding: "10px 12px" }}>
              <div style={{ ...monoLabel, marginBottom: 2 }}>{t.token}</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)", marginBottom: 4 }}>{t.value}</div>
              <div style={{ fontFamily: "var(--serif)", fontSize: 13, color: "var(--muted)", fontStyle: "italic" }}>{t.note}</div>
            </div>
          </div>
        ))}
      </div>

      <h2 style={h2Style}>Font stacks</h2>
      <div style={{ display: "grid", gap: 16 }}>
        {FONTS.map((f) => (
          <div key={f.token} style={{ border: "1px solid var(--light)", background: "#fff", padding: "20px 24px" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 12 }}>
              <div style={monoLabel}>{f.token}</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--ink)" }}>{f.stack}</div>
            </div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 14, color: "var(--muted)", marginBottom: 16, fontStyle: "italic" }}>
              {f.use}
            </div>
            <div style={f.sampleStyle}>{f.sample}</div>
          </div>
        ))}
      </div>

      <h2 style={h2Style}>Type ramp</h2>
      <div style={{ border: "1px solid var(--light)", background: "#fff" }}>
        {TYPE_RAMP.map((r, i) => (
          <div
            key={r.role}
            style={{
              padding: "20px 24px",
              borderBottom: i === TYPE_RAMP.length - 1 ? undefined : "1px solid var(--light)",
              display: "grid",
              gridTemplateColumns: "180px 1fr",
              gap: 24,
              alignItems: "baseline",
            }}
          >
            <div>
              <div style={monoLabel}>{r.role}</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)", marginTop: 4 }}>{r.size}</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)" }}>{r.weight}</div>
            </div>
            <div style={r.style}>{r.sample}</div>
          </div>
        ))}
      </div>

      <h2 style={h2Style}>Button variants</h2>
      <div style={{ display: "grid", gap: 20 }}>
        {BUTTON_VARIANTS.map((b) => (
          <div key={b.label} style={{ border: "1px solid var(--light)", background: "#fff", padding: "24px 28px" }}>
            <div style={monoLabel}>{b.label}</div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 14, color: "var(--muted)", marginTop: 6, marginBottom: 18, fontStyle: "italic", lineHeight: 1.5 }}>
              {b.note}
            </div>
            <button style={b.style}>{b.text}</button>
          </div>
        ))}
      </div>

      <h2 style={h2Style}>Spacing + layout</h2>
      <ul style={{ fontFamily: "var(--serif)", fontSize: 16, color: "var(--ink)", lineHeight: 1.7, paddingLeft: 20 }}>
        <li>Page container: <code style={{ fontFamily: "var(--mono)", fontSize: 13 }}>max-width: 920px</code> for narrow editorial; <code style={{ fontFamily: "var(--mono)", fontSize: 13 }}>1100px</code> for admin / data-dense.</li>
        <li>Section spacing: <code style={{ fontFamily: "var(--mono)", fontSize: 13 }}>margin: 64px auto 0</code> between major sections. <code style={{ fontFamily: "var(--mono)", fontSize: 13 }}>0 24px</code> horizontal padding.</li>
        <li>Card padding: <code style={{ fontFamily: "var(--mono)", fontSize: 13 }}>40px 36px</code> for content cards. <code style={{ fontFamily: "var(--mono)", fontSize: 13 }}>14-24px</code> for tight panels.</li>
        <li>Card borders: <code style={{ fontFamily: "var(--mono)", fontSize: 13 }}>1px solid var(--light)</code> on <code style={{ fontFamily: "var(--mono)", fontSize: 13 }}>#fff</code> backgrounds.</li>
        <li>Line-height: <code style={{ fontFamily: "var(--mono)", fontSize: 13 }}>1.6-1.7</code> for body, <code style={{ fontFamily: "var(--mono)", fontSize: 13 }}>1.15-1.3</code> for display headlines.</li>
      </ul>

      <p style={{ fontFamily: "var(--serif)", fontSize: 14, color: "var(--muted)", marginTop: 48, marginBottom: 32, fontStyle: "italic" }}>
        Ground-truth files when in doubt: <code style={{ fontFamily: "var(--mono)", fontSize: 13 }}>app/globals.css</code> (tokens),{" "}
        <code style={{ fontFamily: "var(--mono)", fontSize: 13 }}>components/LandingSequence.module.css</code> (editorial palette in production),{" "}
        <code style={{ fontFamily: "var(--mono)", fontSize: 13 }}>variants/variant-a-editorial-split.html</code> (canonical editorial layout).
      </p>
    </div>
  );
}
