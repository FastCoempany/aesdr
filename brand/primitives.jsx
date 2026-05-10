/* Shared primitives for the brand-systems doc.
   Editorial chrome. Tiny, reusable, brand-faithful. */

function Section({ id, children, kind = 'cream', style }) {
  // kind: 'cream' | 'paper' | 'ink' | 'crimson'
  const bgs = {
    cream: '#FAF7F2', paper: '#FFFFFF', ink: '#1A1A1A', crimson: '#8B1A1A',
  };
  const fgs = {
    cream: '#1A1A1A', paper: '#1A1A1A', ink: '#FAF7F2', crimson: '#FAF7F2',
  };
  return (
    <section id={id} data-screen-label={id} style={{
      background: bgs[kind], color: fgs[kind], padding: '96px 88px',
      position: 'relative', borderTop: '1px solid #E8E4DF', ...style,
    }}>
      {children}
    </section>
  );
}

function Eyebrow({ children, color = '#6B6B6B', style }) {
  return (
    <span style={{
      font: "11px/1 'Space Mono', monospace", letterSpacing: '0.30em',
      textTransform: 'uppercase', color, display: 'inline-block', ...style,
    }}>{children}</span>
  );
}

function H1({ children, color = '#1A1A1A', size = 88, style }) {
  return (
    <h1 style={{
      margin: 0,
      font: `italic 900 ${size}px/1.02 'Playfair Display', Georgia, serif`,
      color, letterSpacing: '-0.01em', textWrap: 'balance', ...style,
    }}>{children}</h1>
  );
}

function H2({ children, color = '#1A1A1A', size = 56, style }) {
  return (
    <h2 style={{
      margin: 0,
      font: `italic 900 ${size}px/1.05 'Playfair Display', Georgia, serif`,
      color, letterSpacing: '-0.005em', textWrap: 'balance', ...style,
    }}>{children}</h2>
  );
}

function H3({ children, color = '#1A1A1A', style }) {
  return (
    <h3 style={{
      margin: 0,
      font: "italic 900 28px/1.15 'Playfair Display', Georgia, serif",
      color, ...style,
    }}>{children}</h3>
  );
}

function Body({ children, color = '#1A1A1A', size = 16, style }) {
  return (
    <p style={{
      margin: 0,
      font: `${size}px/1.65 'Source Serif 4', Georgia, serif`,
      color, maxWidth: 640, ...style,
    }}>{children}</p>
  );
}

function Lead({ children, color = '#6B6B6B', style }) {
  return (
    <p style={{
      margin: 0,
      font: "20px/1.55 'Source Serif 4', Georgia, serif",
      color, maxWidth: 720, fontStyle: 'italic', ...style,
    }}>{children}</p>
  );
}

function Cap({ children, color = '#1A1A1A', size = 14, style }) {
  return (
    <span style={{
      font: `700 ${size}px/1.15 'Barlow Condensed', sans-serif`,
      letterSpacing: '0.04em', color, ...style,
    }}>{children}</span>
  );
}

function IrisRule({ width = '100%', height = 2, style }) {
  return (
    <span aria-hidden="true" style={{
      display: 'block', width, height,
      background: 'linear-gradient(90deg,#FF006E,#FF6B00,#F59E0B,#10B981,#38BDF8,#8B5CF6,#FF006E)',
      backgroundSize: '200% 100%', animation: 'iris-flow 8s linear infinite', ...style,
    }} />
  );
}

function HairRule({ color = '#E8E4DF', style }) {
  return <span aria-hidden="true" style={{ display: 'block', height: 1, background: color, ...style }} />;
}

function Stamp({ children, color = '#8B1A1A', rotate = -6, style }) {
  return (
    <span style={{
      border: `1px solid ${color}33`, color: `${color}88`,
      font: "700 11px/1 'Barlow Condensed', sans-serif", letterSpacing: '0.18em',
      textTransform: 'uppercase', padding: '6px 14px',
      transform: `rotate(${rotate}deg)`, display: 'inline-block', ...style,
    }}>{children}</span>
  );
}

function CornerBrackets({ color = '#1A1A1A', opacity = 0.4, inset = 8, size = 14 }) {
  const c = { position: 'absolute', width: size, height: size, pointerEvents: 'none', opacity };
  return (
    <>
      <span style={{ ...c, top: inset, left: inset, borderTop: `1px solid ${color}`, borderLeft: `1px solid ${color}` }} />
      <span style={{ ...c, top: inset, right: inset, borderTop: `1px solid ${color}`, borderRight: `1px solid ${color}` }} />
      <span style={{ ...c, bottom: inset, left: inset, borderBottom: `1px solid ${color}`, borderLeft: `1px solid ${color}` }} />
      <span style={{ ...c, bottom: inset, right: inset, borderBottom: `1px solid ${color}`, borderRight: `1px solid ${color}` }} />
    </>
  );
}

// Numbered marker like "01 / 12"
function Counter({ n, total, color = '#1A1A1A' }) {
  return (
    <span style={{
      font: "italic 900 56px/1 'Playfair Display', Georgia, serif", color,
      display: 'inline-flex', alignItems: 'baseline', gap: 4,
    }}>
      {n}
      <span style={{ color: '#E8E4DF', fontSize: '0.65em' }}> / {total}</span>
    </span>
  );
}

// Cell — labeled spec cell used everywhere in the doc
function Cell({ label, children, span = 1, style }) {
  return (
    <div style={{
      gridColumn: `span ${span}`, padding: '20px 22px',
      background: '#FFFFFF', border: '1px solid #E8E4DF',
      display: 'flex', flexDirection: 'column', gap: 12, ...style,
    }}>
      <Eyebrow>{label}</Eyebrow>
      {children}
    </div>
  );
}

// Spec table — for properties
function Spec({ rows, color = '#1A1A1A' }) {
  return (
    <table style={{
      width: '100%', borderCollapse: 'collapse', font: "13px/1.5 'Source Serif 4', serif",
      color,
    }}>
      <tbody>
        {rows.map(([k, v]) => (
          <tr key={k} style={{ borderBottom: '1px solid #E8E4DF' }}>
            <td style={{
              padding: '8px 0', font: "10px/1.4 'Space Mono', monospace",
              letterSpacing: '0.18em', color: '#6B6B6B', textTransform: 'uppercase',
              width: 140, verticalAlign: 'top',
            }}>{k}</td>
            <td style={{ padding: '8px 0', verticalAlign: 'top' }}>{v}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

Object.assign(window, {
  Section, Eyebrow, H1, H2, H3, Body, Lead, Cap, IrisRule, HairRule,
  Stamp, CornerBrackets, Counter, Cell, Spec,
});
