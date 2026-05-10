/* Shared bits used across all three one-pager variations. */

function Wordmark({ size = 48, dark = false, dotIris = true }) {
  // AESDR. wordmark — Playfair Black + iris dot or solid crimson dot.
  const color = dark ? '#FAF7F2' : '#1A1A1A';
  return (
    <span style={{
      font: `italic 900 ${size}px/1 'Playfair Display', Georgia, serif`,
      color, letterSpacing: '-0.01em', display: 'inline-flex', alignItems: 'baseline'
    }}>
      AESDR
      <span
        className={dotIris ? 'iris-text iris-shimmer-text' : ''}
        style={dotIris ? {} : { color: '#8B1A1A' }}
      >.</span>
    </span>
  );
}

function TerminalDots() {
  return (
    <svg width="36" height="10" viewBox="0 0 36 10" aria-hidden="true">
      <circle cx="5" cy="5" r="4" fill="#EF4444" fillOpacity=".5" />
      <circle cx="18" cy="5" r="4" fill="#F59E0B" fillOpacity=".5" />
      <circle cx="31" cy="5" r="4" fill="#10B981" fillOpacity=".5" />
    </svg>
  );
}

function CornerBrackets({ color = '#1A1A1A', opacity = 0.5, inset = 8, size = 14, weight = 1 }) {
  // Four 1px L-shaped brackets in the corners of the parent (parent must be position: relative)
  const common = {
    position: 'absolute', width: size, height: size,
    pointerEvents: 'none', opacity
  };
  return (
    <>
      <span style={{ ...common, top: inset, left: inset, borderTop: `${weight}px solid ${color}`, borderLeft: `${weight}px solid ${color}` }} />
      <span style={{ ...common, top: inset, right: inset, borderTop: `${weight}px solid ${color}`, borderRight: `${weight}px solid ${color}` }} />
      <span style={{ ...common, bottom: inset, left: inset, borderBottom: `${weight}px solid ${color}`, borderLeft: `${weight}px solid ${color}` }} />
      <span style={{ ...common, bottom: inset, right: inset, borderBottom: `${weight}px solid ${color}`, borderRight: `${weight}px solid ${color}` }} />
    </>
  );
}

function IrisRule({ height = 2, width = '100%', opacity = 1, style }) {
  return (
    <span
      className="iris-shimmer"
      style={{ display: 'block', height, width, opacity, ...style }}
    />
  );
}

function GhostNumeral({ n = '01', size = 320, color = 'rgba(0,0,0,0.06)', style }) {
  return (
    <span
      aria-hidden="true"
      style={{
        font: `italic 700 ${size}px/1 'Playfair Display', Georgia, serif`,
        color, pointerEvents: 'none', userSelect: 'none',
        letterSpacing: '-0.02em', position: 'absolute', ...style
      }}
    >{n}</span>
  );
}

function Eyebrow({ children, light = false, crimson = false, style }) {
  const color = crimson ? '#8B1A1A' : light ? 'rgba(255,255,255,0.65)' : '#6B6B6B';
  return (
    <span style={{
      font: "11px/1 'Space Mono', monospace",
      letterSpacing: '0.30em', textTransform: 'uppercase',
      color, ...style
    }}>{children}</span>
  );
}

const LESSONS = [
  ['01', 'The Diagnosis',                 'Stop pretending you don\'t already know what\'s wrong.'],
  ['02', 'Building Real Camaraderie',     'When\'s the last time your team felt like an actual team?'],
  ['03', 'When the Manager Lies',         '"So much potential." Six months ago. Same potential.'],
  ['04', 'The Commission Verdict',        'Your check is the verdict on how you lived 30 days.'],
  ['05', 'tHe SaLeS pLaYbOoK',            'Yes, the casing is a joke. The lesson is not.'],
  ['06', 'bEyOnD tHe SaLeS pLaYbOoK',     'What you do when the script runs out is the actual job.'],
  ['07', 'Controlling Chaos',             'You don\'t need 6am. You need to stop lying about 9am.'],
  ['08', 'A Pipeline You Can Read',       'Forecasts are wishes with deadlines. Stop wishing.'],
  ['09', 'Burn Without Burnout',          'Some weeks you sprint. Some weeks you survive. Tell them apart.'],
  ['10', 'Knowing When To Leave',         'Loyalty to a logo is the most expensive thing you own.'],
  ['11', 'The Money Conversation',        'Your comp plan was written by someone whose mortgage isn\'t yours.'],
  ['12', 'Owning It',                     'At some point the operating manual becomes yours, not ours.'],
];

const TOOLS = [
  ['01', 'Honest Pipeline Worksheet',  'A spreadsheet that refuses to flatter you.'],
  ['02', 'Manager-Lie Decoder',        'What "so much potential" actually means in 6 dialects.'],
  ['03', 'Commission-Math Calculator', 'Plug in your real numbers. See your real verdict.'],
  ['04', 'Cold-Script Kit (no LinkedIn)','17 openers nobody on LinkedIn will ever brag about.'],
  ['05', 'The 30-Day Audit',           'A weekly self-review you won\'t feel good after.'],
];

Object.assign(window, {
  Wordmark, TerminalDots, CornerBrackets, IrisRule, GhostNumeral, Eyebrow,
  LESSONS, TOOLS,
});
