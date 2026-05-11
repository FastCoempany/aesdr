/* AESDR Final Synthesized Visual System.
   Decision: Tortoise-Hare Doctrine as spine, Marble's medallion gravitas
   for badges, Neon Operator's UI symbols for product surfaces.
   Iris stays scarce. Crimson stays the only chromatic accent in editorial. */

/* ============================================================
   SYNTHESIS DECISION
   ============================================================ */
function SynthesisDecision() {
  return (
    <Section id="decision" kind="ink">
      <Eyebrow color="rgba(255,255,255,0.55)" style={{ display: 'block', marginBottom: 18 }}>
        SYNTHESIS · 04 / DECISION
      </Eyebrow>
      <H1 color="#FAF7F2" size={84}>
        The doctrine wins<br />
        <em style={{ color: 'rgba(255,255,255,0.6)' }}>— with the marble's gravity<br/>and the operator's UI.</em>
      </H1>
      <IrisRule width={140} style={{ marginTop: 36 }} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24, marginTop: 48 }}>
        <DecisionCard verdict="SPINE" pick="03 · Tortoise-Hare" rationale="Carries the two-voice DNA of the brand into a single owned figure. Anti-corny because the fable is honest, not mascot-cute. Scales from app to billboard." />
        <DecisionCard verdict="WEIGHT" pick="01 · Marble (badges only)" rationale="The medallion language gives achievements gravitas. Roman-numeral chapters keep the gamification literary, not arcade." />
        <DecisionCard verdict="PRODUCT" pick="02 · Neon Operator (UI only)" rationale="Inside the LMS, dashboards, and terminal moments — black ground + iris signals stay tactical. Editorial surfaces stay cream." />
      </div>

      <Body color="rgba(255,255,255,0.7)" size={16} style={{ marginTop: 36, maxWidth: 720 }}>
        The synthesized system has <strong style={{ color: '#FAF7F2' }}>three surfaces</strong>:
        <em> editorial cream</em> (lessons, marketing, books),
        <em> medallion stone</em> (badges, certificates, milestones), and
        <em> operator black</em> (product UI, terminals, signals).
        One mascot. One typographic system. Three rooms.
      </Body>
    </Section>
  );
}
function DecisionCard({ verdict, pick, rationale }) {
  return (
    <div style={{ padding: '24px 24px 28px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.18)' }}>
      <Eyebrow color="rgba(255,255,255,0.55)">{verdict}</Eyebrow>
      <h3 style={{ margin: '12px 0 12px', font: "italic 900 24px/1.1 'Playfair Display', Georgia, serif", color: '#FAF7F2' }}>{pick}</h3>
      <Body color="rgba(255,255,255,0.7)" size={14} style={{ margin: 0 }}>{rationale}</Body>
    </div>
  );
}

/* ============================================================
   1 · MASCOT SYSTEM (construction + lockups)
   ============================================================ */
// PNG-first render. The 8 transparent-background iridescent PNGs in
// brand/canon/mascot/png/ are the single source of truth for the mascot
// at every size — hero, expression sheet, badges, lockups, inline. They
// drop onto any surface (cream, crimson, dark) without fighting it.
//
// Source PNGs (with the original cloud backdrop, before background removal)
// are kept at brand/canon/mascot/png/source/ for reference and re-cutting.
//
// The flat SVG is used only when forceSvg is set — for single-color
// reproduction (App Mark, print plates, swag, favicon ≤32px) and as the
// onError fallback if the PNG fails to load.
const PNG_BASE = './canon/mascot/png';
function pngPath(expression) {
  // Standalone-build hook: if window.__MASCOT_PNG[expression] is a data URI,
  // use it. Lets the single-file shareable HTML inline the PNGs as base64
  // without touching this file or breaking the normal server-served flow.
  if (typeof window !== 'undefined' && window.__MASCOT_PNG && window.__MASCOT_PNG[expression]) {
    return window.__MASCOT_PNG[expression];
  }
  return `${PNG_BASE}/leponeus-${expression}.png`;
}

function MascotLeponeus({ size = 220, expression = 'doctrine', forceSvg = false }) {
  if (forceSvg) return <MascotLeponeusSvg size={size} expression={expression} />;
  return (
    <img
      src={pngPath(expression)}
      width={size}
      height={size}
      alt={`Leponeus ${expression}`}
      style={{ display: 'block', objectFit: 'contain' }}
      onError={(ev) => {
        const img = ev.currentTarget;
        if (img.dataset.fallback === '1') return;
        img.dataset.fallback = '1';
        img.outerHTML = MascotLeponeusSvgString(size, expression);
      }}
    />
  );
}

function MascotLeponeusSvg({ size = 220, expression = 'doctrine' }) {
  const s = { fill: 'none', stroke: '#1A1A1A', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const e = expressionMap[expression] || expressionMap.doctrine;
  return (
    <svg viewBox="0 0 300 240" width={size} height={size * (240/300)} aria-label={`Leponeus ${expression}`}>
      <g {...s}>
        {/* shell */}
        <ellipse cx="120" cy="160" rx="68" ry="36" fill="#F1ECE3" />
        <path d="M 60 160 Q 120 110 180 160" />
        {e.shellMarks}
        {/* legs */}
        <ellipse cx="68" cy="194" rx="10" ry="6" fill="#F1ECE3" />
        <ellipse cx="172" cy="194" rx="10" ry="6" fill="#F1ECE3" />
        {e.legs}
        {/* head */}
        <ellipse cx="200" cy="146" rx="16" ry="12" fill="#F1ECE3" />
        {/* eye */}
        {e.eye}
        {/* mouth (subtle) */}
        {e.mouth}
        {/* ears (variable per expression) */}
        {e.ears}
        {/* strap */}
        <line x1="186" y1="134" x2="216" y2="134" stroke="#8B1A1A" strokeWidth="1.4" />
      </g>
    </svg>
  );
}

// Plain HTML string version of the SVG, for the onError DOM-replace path.
// Mirrors MascotLeponeusSvg but without React — the fallback fires after the
// img is already in the DOM so we can't return JSX from it.
function MascotLeponeusSvgString(size, expression) {
  const e = expressionMap[expression] || expressionMap.doctrine;
  const ears = ({
    doctrine:  '<path d="M 192 130 Q 188 92 178 80 Q 192 86 200 122" fill="#F1ECE3"/><path d="M 208 130 Q 216 92 226 80 Q 218 92 216 122" fill="#F1ECE3"/>',
    diagnosis: '<path d="M 192 130 Q 190 100 184 88 Q 196 96 200 122" fill="#F1ECE3"/><path d="M 208 130 Q 214 100 222 88 Q 218 100 216 122" fill="#F1ECE3"/>',
    sprint:    '<path d="M 188 128 Q 168 100 154 92 Q 178 102 196 122" fill="#F1ECE3"/><path d="M 210 130 Q 232 102 246 94 Q 222 104 216 122" fill="#F1ECE3"/>',
    fall:      '<path d="M 192 132 Q 184 124 176 130 Q 186 130 198 124" fill="#F1ECE3"/><path d="M 210 130 Q 220 138 226 132 Q 218 130 216 124" fill="#F1ECE3"/>',
    recovery:  '<path d="M 192 130 Q 188 92 178 80 Q 192 86 200 122" fill="#F1ECE3"/><path d="M 208 130 Q 216 92 226 80 Q 218 92 216 122" fill="#F1ECE3"/>',
    rest:      '<path d="M 192 130 Q 196 110 200 102 Q 200 116 200 122" fill="#F1ECE3"/><path d="M 208 130 Q 212 110 216 102 Q 216 116 216 122" fill="#F1ECE3"/>',
    verdict:   '<path d="M 196 130 Q 196 96 192 84 Q 202 92 200 122" fill="#F1ECE3"/><path d="M 208 130 Q 208 96 212 84 Q 214 92 216 122" fill="#F1ECE3"/><path d="M 200 80 q 4 -2 4 0" fill="#8B1A1A" stroke="#8B1A1A"/>',
    owner:     '<path d="M 192 130 Q 188 92 178 80 Q 192 86 200 122" fill="#F1ECE3"/><path d="M 208 130 Q 216 92 226 80 Q 218 92 216 122" fill="#F1ECE3"/>',
  })[expression] || '';
  return `<svg viewBox="0 0 300 240" width="${size}" height="${size * (240/300)}" aria-label="Leponeus ${expression}"><g fill="none" stroke="#1A1A1A" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="120" cy="160" rx="68" ry="36" fill="#F1ECE3"/><path d="M 60 160 Q 120 110 180 160"/><ellipse cx="68" cy="194" rx="10" ry="6" fill="#F1ECE3"/><ellipse cx="172" cy="194" rx="10" ry="6" fill="#F1ECE3"/><ellipse cx="200" cy="146" rx="16" ry="12" fill="#F1ECE3"/>${ears}<line x1="186" y1="134" x2="216" y2="134" stroke="#8B1A1A" stroke-width="1.4"/></g></svg>`;
}
const expressionMap = {
  doctrine: {
    shellMarks: <g strokeOpacity=".45">
      <path d="M 108 133 L 114.1 136.5 L 114.1 143.5 L 108 147 L 101.9 143.5 L 101.9 136.5 Z" />
      <path d="M 120 133 L 126.1 136.5 L 126.1 143.5 L 120 147 L 113.9 143.5 L 113.9 136.5 Z" />
      <path d="M 132 133 L 138.1 136.5 L 138.1 143.5 L 132 147 L 125.9 143.5 L 125.9 136.5 Z" />
      <path d="M 114 143.5 L 120.1 147 L 120.1 154 L 114 157.5 L 107.9 154 L 107.9 147 Z" />
      <path d="M 126 143.5 L 132.1 147 L 132.1 154 L 126 157.5 L 119.9 154 L 119.9 147 Z" />
    </g>,
    eye: <>
      <path d="M 205 142 q 3 -2.5 6 0 q -3 2.5 -6 0 Z" fill="#1A1A1A" stroke="none" />
      <circle cx="215" cy="148" r="0.7" fill="#1A1A1A" stroke="none" />
    </>,
    mouth: <path d="M 188 148 q 6 5 14 4" strokeOpacity=".3" />,
    ears: <>
      <path d="M 192 130 Q 188 92 178 80 Q 192 86 200 122" fill="#F1ECE3" />
      <path d="M 189 122 Q 186 100 182 88" strokeOpacity=".4" />
      <path d="M 208 130 Q 216 92 226 80 Q 218 92 216 122" fill="#F1ECE3" />
      <path d="M 211 122 Q 214 100 218 88" strokeOpacity=".4" />
    </>,
    legs: <>
      <path d="M 63 199 l 0 2 M 68 200 l 0 2 M 73 199 l 0 2" strokeOpacity=".5" />
      <path d="M 167 199 l 0 2 M 172 200 l 0 2 M 177 199 l 0 2" strokeOpacity=".5" />
    </>,
  },
  diagnosis: {
    shellMarks: <g strokeOpacity=".45">
      <path d="M 108 133 L 114.1 136.5 L 114.1 143.5 L 108 147 L 101.9 143.5 L 101.9 136.5 Z" />
      <path d="M 120 133 L 126.1 136.5 L 126.1 143.5 L 120 147 L 113.9 143.5 L 113.9 136.5 Z" />
      <path d="M 132 133 L 138.1 136.5 L 138.1 143.5 L 132 147 L 125.9 143.5 L 125.9 136.5 Z" />
      <path d="M 114 143.5 L 120.1 147 L 120.1 154 L 114 157.5 L 107.9 154 L 107.9 147 Z" />
      <path d="M 126 143.5 L 132.1 147 L 132.1 154 L 126 157.5 L 119.9 154 L 119.9 147 Z" />
    </g>,
    eye: <>
      <line x1="204" y1="142" x2="212" y2="142" />
      <circle cx="215" cy="148" r="0.7" fill="#1A1A1A" stroke="none" />
    </>,
    mouth: <>
      <line x1="200" y1="152" x2="208" y2="152" />
      <path d="M 188 148 q 6 5 14 4" strokeOpacity=".25" />
    </>,
    ears: <>
      <path d="M 192 130 Q 190 100 184 88 Q 196 96 200 122" fill="#F1ECE3" />
      <path d="M 192 124 Q 192 104 188 92" strokeOpacity=".4" />
      <path d="M 208 130 Q 214 100 222 88 Q 218 100 216 122" fill="#F1ECE3" />
      <path d="M 211 124 Q 213 104 217 92" strokeOpacity=".4" />
    </>,
    legs: <>
      <path d="M 63 199 l 0 2 M 68 200 l 0 2 M 73 199 l 0 2" strokeOpacity=".5" />
      <path d="M 167 199 l 0 2 M 172 200 l 0 2 M 177 199 l 0 2" strokeOpacity=".5" />
    </>,
  },
  sprint: {
    shellMarks: <g strokeOpacity=".45">
      <path d="M 108 133 L 114.1 136.5 L 114.1 143.5 L 108 147 L 101.9 143.5 L 101.9 136.5 Z" />
      <path d="M 120 133 L 126.1 136.5 L 126.1 143.5 L 120 147 L 113.9 143.5 L 113.9 136.5 Z" />
      <path d="M 132 133 L 138.1 136.5 L 138.1 143.5 L 132 147 L 125.9 143.5 L 125.9 136.5 Z" />
      <path d="M 114 143.5 L 120.1 147 L 120.1 154 L 114 157.5 L 107.9 154 L 107.9 147 Z" />
      <path d="M 126 143.5 L 132.1 147 L 132.1 154 L 126 157.5 L 119.9 154 L 119.9 147 Z" />
    </g>,
    eye: <>
      <path d="M 205 140 q 3 -2.5 6 0 q -3 2.5 -6 0 Z" fill="#1A1A1A" stroke="none" />
      <circle cx="215" cy="146" r="0.7" fill="#1A1A1A" stroke="none" />
    </>,
    mouth: null,
    ears: <>
      <path d="M 188 128 Q 168 100 154 92 Q 178 102 196 122" fill="#F1ECE3" />
      <path d="M 188 124 Q 174 104 162 96" strokeOpacity=".4" />
      <path d="M 210 130 Q 232 102 246 94 Q 222 104 216 122" fill="#F1ECE3" />
      <path d="M 212 124 Q 226 104 238 98" strokeOpacity=".4" />
      {/* speed ticks */}
      <line x1="20" y1="146" x2="38" y2="146" strokeOpacity=".5" />
      <line x1="22" y1="160" x2="34" y2="160" strokeOpacity=".4" />
    </>,
    legs: <>
      <path d="M 63 199 l 0 2 M 68 200 l 0 2 M 73 199 l 0 2" strokeOpacity=".5" />
      <path d="M 167 199 l 0 2 M 172 200 l 0 2 M 177 199 l 0 2" strokeOpacity=".5" />
    </>,
  },
  fall: {
    shellMarks: <>
      <g strokeOpacity=".25">
        <path d="M 108 133 L 114.1 136.5 L 114.1 143.5 L 108 147 L 101.9 143.5 L 101.9 136.5 Z" />
        <path d="M 132 133 L 138.1 136.5 L 138.1 143.5 L 132 147 L 125.9 143.5 L 125.9 136.5 Z" />
        <path d="M 126 143.5 L 132.1 147 L 132.1 154 L 126 157.5 L 119.9 154 L 119.9 147 Z" />
      </g>
      <path d="M 100 152 L 96 132 L 110 138 L 102 122" stroke="#8B1A1A" />
    </>,
    eye: <>
      <path d="M 204 140 L 212 144 M 212 140 L 204 144" />
      <circle cx="215" cy="148" r="0.7" fill="#1A1A1A" stroke="none" />
    </>,
    mouth: <path d="M 200 154 q 4 -3 8 0" />,
    ears: <>
      <path d="M 192 132 Q 184 124 176 130 Q 186 130 198 124" fill="#F1ECE3" />
      <path d="M 188 128 Q 184 126 180 128" strokeOpacity=".3" />
      <path d="M 210 130 Q 220 138 226 132 Q 218 130 216 124" fill="#F1ECE3" />
      <path d="M 214 128 Q 218 126 222 128" strokeOpacity=".3" />
    </>,
    legs: <>
      <path d="M 63 199 l 0 2 M 68 200 l 0 2 M 73 199 l 0 2" strokeOpacity=".5" />
      <path d="M 167 199 l 0 2 M 172 200 l 0 2 M 177 199 l 0 2" strokeOpacity=".5" />
    </>,
  },
  recovery: {
    shellMarks: <>
      <g strokeOpacity=".45">
        <path d="M 108 133 L 114.1 136.5 L 114.1 143.5 L 108 147 L 101.9 143.5 L 101.9 136.5 Z" />
        <path d="M 132 133 L 138.1 136.5 L 138.1 143.5 L 132 147 L 125.9 143.5 L 125.9 136.5 Z" />
        <path d="M 114 143.5 L 120.1 147 L 120.1 154 L 114 157.5 L 107.9 154 L 107.9 147 Z" />
        <path d="M 126 143.5 L 132.1 147 L 132.1 154 L 126 157.5 L 119.9 154 L 119.9 147 Z" />
      </g>
      {/* sprout: stem + 2 crimson leaves emerging from healed center scute */}
      <path d="M 120 133 Q 118 122 120 110" />
      <path d="M 120 118 q -8 -4 -10 -12 q 8 4 10 8" fill="#8B1A1A" stroke="#8B1A1A" />
      <path d="M 120 112 q 8 -4 10 -12 q -8 4 -10 8" fill="#8B1A1A" stroke="#8B1A1A" />
    </>,
    eye: <>
      <path d="M 205 141 q 3 -2.5 6 0 q -3 2.5 -6 0 Z" fill="#1A1A1A" stroke="none" />
      <circle cx="215" cy="148" r="0.7" fill="#1A1A1A" stroke="none" />
    </>,
    mouth: <path d="M 188 148 q 6 5 14 4" strokeOpacity=".3" />,
    ears: <>
      <path d="M 192 130 Q 188 92 178 80 Q 192 86 200 122" fill="#F1ECE3" />
      <path d="M 189 122 Q 186 100 182 88" strokeOpacity=".4" />
      <path d="M 208 130 Q 216 92 226 80 Q 218 92 216 122" fill="#F1ECE3" />
      <path d="M 211 122 Q 214 100 218 88" strokeOpacity=".4" />
    </>,
    legs: <>
      <path d="M 63 199 l 0 2 M 68 200 l 0 2 M 73 199 l 0 2" strokeOpacity=".5" />
      <path d="M 167 199 l 0 2 M 172 200 l 0 2 M 177 199 l 0 2" strokeOpacity=".5" />
    </>,
  },
  verdict: {
    shellMarks: <g strokeOpacity=".45">
      <path d="M 108 133 L 114.1 136.5 L 114.1 143.5 L 108 147 L 101.9 143.5 L 101.9 136.5 Z" />
      <path d="M 120 133 L 126.1 136.5 L 126.1 143.5 L 120 147 L 113.9 143.5 L 113.9 136.5 Z" />
      <path d="M 132 133 L 138.1 136.5 L 138.1 143.5 L 132 147 L 125.9 143.5 L 125.9 136.5 Z" />
      <path d="M 114 143.5 L 120.1 147 L 120.1 154 L 114 157.5 L 107.9 154 L 107.9 147 Z" />
      <path d="M 126 143.5 L 132.1 147 L 132.1 154 L 126 157.5 L 119.9 154 L 119.9 147 Z" />
    </g>,
    eye: <>
      <path d="M 205 142 q 3 -2.5 6 0 q -3 2.5 -6 0 Z" fill="#1A1A1A" stroke="none" />
      <circle cx="215" cy="148" r="0.7" fill="#1A1A1A" stroke="none" />
    </>,
    mouth: <path d="M 188 148 q 6 5 14 4" strokeOpacity=".3" />,
    ears: <>
      <path d="M 196 130 Q 196 96 192 84 Q 202 92 200 122" fill="#F1ECE3" />
      <path d="M 196 122 Q 195 100 194 88" strokeOpacity=".4" />
      <path d="M 208 130 Q 208 96 212 84 Q 214 92 216 122" fill="#F1ECE3" />
      <path d="M 209 122 Q 210 100 211 88" strokeOpacity=".4" />
      <path d="M 200 80 q 4 -2 4 0" fill="#8B1A1A" stroke="#8B1A1A" />
    </>,
    legs: <>
      <path d="M 63 199 l 0 2 M 68 200 l 0 2 M 73 199 l 0 2" strokeOpacity=".5" />
      <path d="M 167 199 l 0 2 M 172 200 l 0 2 M 177 199 l 0 2" strokeOpacity=".5" />
    </>,
  },
  rest: {
    shellMarks: <g strokeOpacity=".25">
      <path d="M 108 133 L 114.1 136.5 L 114.1 143.5 L 108 147 L 101.9 143.5 L 101.9 136.5 Z" />
      <path d="M 120 133 L 126.1 136.5 L 126.1 143.5 L 120 147 L 113.9 143.5 L 113.9 136.5 Z" />
      <path d="M 132 133 L 138.1 136.5 L 138.1 143.5 L 132 147 L 125.9 143.5 L 125.9 136.5 Z" />
      <path d="M 114 143.5 L 120.1 147 L 120.1 154 L 114 157.5 L 107.9 154 L 107.9 147 Z" />
      <path d="M 126 143.5 L 132.1 147 L 132.1 154 L 126 157.5 L 119.9 154 L 119.9 147 Z" />
    </g>,
    eye: <path d="M 204 142 q 4 0 8 0" />,
    mouth: null,
    ears: <>
      <path d="M 192 130 Q 196 110 200 102 Q 200 116 200 122" fill="#F1ECE3" />
      <path d="M 194 122 Q 196 114 198 108" strokeOpacity=".4" />
      <path d="M 208 130 Q 212 110 216 102 Q 216 116 216 122" fill="#F1ECE3" />
      <path d="M 210 122 Q 212 114 214 108" strokeOpacity=".4" />
    </>,
    legs: null,
  },
  owner: {
    shellMarks: <>
      <g strokeOpacity=".55">
        <path d="M 108 133 L 114.1 136.5 L 114.1 143.5 L 108 147 L 101.9 143.5 L 101.9 136.5 Z" />
        <path d="M 132 133 L 138.1 136.5 L 138.1 143.5 L 132 147 L 125.9 143.5 L 125.9 136.5 Z" />
        <path d="M 114 143.5 L 120.1 147 L 120.1 154 L 114 157.5 L 107.9 154 L 107.9 147 Z" />
        <path d="M 126 143.5 L 132.1 147 L 132.1 154 L 126 157.5 L 119.9 154 L 119.9 147 Z" />
      </g>
      <text x="120" y="148" textAnchor="middle" fontFamily="Playfair Display, serif" fontStyle="italic" fontWeight="900" fontSize="22" fill="#8B1A1A" stroke="none">A</text>
    </>,
    eye: <>
      <path d="M 205 142 q 3 -2.5 6 0 q -3 2.5 -6 0 Z" fill="#1A1A1A" stroke="none" />
      <circle cx="215" cy="148" r="0.7" fill="#1A1A1A" stroke="none" />
    </>,
    mouth: <path d="M 188 148 q 6 5 14 4" strokeOpacity=".3" />,
    ears: <>
      <path d="M 192 130 Q 188 92 178 80 Q 192 86 200 122" fill="#F1ECE3" />
      <path d="M 189 122 Q 186 100 182 88" strokeOpacity=".4" />
      <path d="M 208 130 Q 216 92 226 80 Q 218 92 216 122" fill="#F1ECE3" />
      <path d="M 211 122 Q 214 100 218 88" strokeOpacity=".4" />
    </>,
    legs: <>
      <path d="M 63 199 l 0 2 M 68 200 l 0 2 M 73 199 l 0 2" strokeOpacity=".5" />
      <path d="M 167 199 l 0 2 M 172 200 l 0 2 M 177 199 l 0 2" strokeOpacity=".5" />
    </>,
  },
};

function MascotSystem() {
  return (
    <Section id="mascot-system" kind="cream">
      <SpreadHeader2 n="01" name="Mascot System" sub="Leponeus · Construction, lockups, and use · Canon owner: Antaeus · github.com/FastCoempany/aesdr" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginTop: 32 }}>
        <div style={{ background: '#FFFFFF', border: '1px solid #E8E4DF', padding: '32px', position: 'relative' }}>
          <CornerBrackets />
          <Eyebrow style={{ display: 'block', marginBottom: 14 }}>CANONICAL · TH-01</Eyebrow>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
            <MascotLeponeus size={300} expression="doctrine" />
          </div>
          <H3>The doctrine pose.</H3>
          <Body size={14} color="#6B6B6B" style={{ marginTop: 10 }}>
            Default. Used in wordmark lockups, certificates, and any moment where the
            mascot speaks for the brand. Eyes forward. Ears upright. Strap visible.
          </Body>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #E8E4DF', padding: '32px' }}>
          <Eyebrow style={{ display: 'block', marginBottom: 14 }}>CONSTRUCTION GRID</Eyebrow>
          <ConstructionGrid />
          <Spec rows={[
            ['SHELL', 'ellipse 68×36, dome arc anchored at base'],
            ['EARS', 'lift 50–58px above shell crown'],
            ['STRAP', 'crimson #8B1A1A · 1.4px, eye-level'],
            ['LINE', '1.6px round-cap monoline; never variable'],
            ['NEGATIVE SPACE', '12px clear-zone all sides'],
          ]} />
        </div>
      </div>

      <div style={{ marginTop: 32, padding: '32px', background: '#FFFFFF', border: '1px solid #E8E4DF' }}>
        <Eyebrow style={{ display: 'block', marginBottom: 18 }}>LOCKUPS</Eyebrow>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 32, alignItems: 'flex-end' }}>
          <Lockup variant="primary">
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <MascotLeponeus size={64} expression="doctrine" />
              <span style={{ font: "italic 900 36px/1 'Playfair Display', Georgia, serif" }}>
                AESDR<span className="iris-shimmer-text">.</span>
              </span>
            </div>
            <Cap style={{ marginTop: 8, color: '#6B6B6B' }}>PRIMARY · HORIZONTAL</Cap>
          </Lockup>
          <Lockup>
            <div style={{ textAlign: 'center' }}>
              <MascotLeponeus size={80} expression="doctrine" />
              <div style={{ marginTop: 8, font: "italic 900 28px/1 'Playfair Display', Georgia, serif" }}>
                AESDR<span className="iris-shimmer-text">.</span>
              </div>
            </div>
            <Cap style={{ marginTop: 8, color: '#6B6B6B' }}>STACKED · CERT/SOCIAL</Cap>
          </Lockup>
          <Lockup>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 72, height: 72, background: '#1A1A1A' }}>
              <svg viewBox="0 0 300 240" width="56" height="56">
                <g fill="none" stroke="#FAF7F2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <ellipse cx="120" cy="160" rx="68" ry="36" />
                  <path d="M 60 160 Q 120 110 180 160" />
                  <path d="M 192 130 Q 188 92 178 80 Q 192 86 200 122" />
                  <path d="M 208 130 Q 216 92 226 80 Q 218 92 216 122" />
                  <ellipse cx="200" cy="146" rx="16" ry="12" />
                  <line x1="186" y1="134" x2="216" y2="134" stroke="#FF006E" strokeWidth="2" />
                </g>
              </svg>
            </div>
            <Cap style={{ marginTop: 8, color: '#6B6B6B' }}>APP MARK · 72px</Cap>
          </Lockup>
        </div>
      </div>
    </Section>
  );
}
function ConstructionGrid() {
  return (
    <div style={{ position: 'relative', padding: 12, background: '#F1ECE3' }}>
      <svg viewBox="0 0 300 240" width="100%" style={{ display: 'block' }}>
        {[...Array(13)].map((_, i) => <line key={'gv' + i} x1={i * 24} y1="0" x2={i * 24} y2="240" stroke="#1A1A1A" strokeOpacity=".07" />)}
        {[...Array(11)].map((_, i) => <line key={'gh' + i} x1="0" y1={i * 24} x2="300" y2={i * 24} stroke="#1A1A1A" strokeOpacity=".07" />)}
        <line x1="0" y1="120" x2="300" y2="120" stroke="#8B1A1A" strokeOpacity=".4" strokeDasharray="2 4" />
        <line x1="150" y1="0" x2="150" y2="240" stroke="#8B1A1A" strokeOpacity=".4" strokeDasharray="2 4" />
        <g fill="none" stroke="#1A1A1A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="120" cy="160" rx="68" ry="36" fill="#FFFFFF" />
          <path d="M 60 160 Q 120 110 180 160" />
          <path d="M 192 130 Q 188 92 178 80 Q 192 86 200 122" fill="#FFFFFF" />
          <path d="M 208 130 Q 216 92 226 80 Q 218 92 216 122" fill="#FFFFFF" />
          <ellipse cx="200" cy="146" rx="16" ry="12" fill="#FFFFFF" />
          <ellipse cx="68" cy="194" rx="10" ry="6" fill="#FFFFFF" />
          <ellipse cx="172" cy="194" rx="10" ry="6" fill="#FFFFFF" />
          <line x1="186" y1="134" x2="216" y2="134" stroke="#8B1A1A" />
          <circle cx="208" cy="142" r="1.6" fill="#1A1A1A" />
        </g>
      </svg>
    </div>
  );
}
function Lockup({ children }) {
  return <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>{children}</div>;
}
function SpreadHeader2({ n, name, sub }) {
  return (
    <header style={{ display: 'flex', gap: 36, alignItems: 'flex-end', marginBottom: 20 }}>
      <Counter n={n} total="09" />
      <div style={{ flex: 1 }}>
        <Eyebrow style={{ display: 'block', marginBottom: 10 }}>FINAL SYSTEM · {n}</Eyebrow>
        <H2 size={48}>{name}</H2>
        <Body color="#6B6B6B" size={16} style={{ marginTop: 10 }}>{sub}</Body>
      </div>
    </header>
  );
}

/* ============================================================
   2 · EXPRESSION SHEET
   ============================================================ */
function ExpressionSheet() {
  const expressions = [
    ['doctrine',  'The Doctrine',  'Default. Eyes forward. Brand voice.'],
    ['diagnosis', 'The Diagnosis', 'Flat eye, half-open mouth. Lesson 01.'],
    ['sprint',    'The Sprint',    'Ears back, speed ticks. Bursts.'],
    ['fall',      'The Fall',      'Cracked shell, X eyes. The dip.'],
    ['recovery',  'The Recovery',  'Sprout from shell. Lesson 09.'],
    ['rest',      'The Rest',      'Eyes closed. Sundays only.'],
    ['verdict',   'The Verdict',   'Crimson tip. Rowan moments.'],
    ['owner',     'The Owner',     'A on shell. Lesson 12.'],
  ];
  return (
    <Section id="expression-sheet" kind="cream">
      <SpreadHeader2 n="02" name="Mascot Expression Sheet" sub="Eight states. Used as a finite vocabulary — never invent a ninth without writing it down here." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: 24 }}>
        {expressions.map(([key, title, blurb]) => (
          <div key={key} style={{ background: '#FFFFFF', border: '1px solid #E8E4DF', padding: '20px 18px 22px', position: 'relative' }}>
            <Eyebrow>TH·{key.slice(0, 3).toUpperCase()}</Eyebrow>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0' }}>
              <MascotLeponeus size={140} expression={key} />
            </div>
            <H3 style={{ fontSize: 20 }}>{title}</H3>
            <Body size={13} color="#6B6B6B" style={{ marginTop: 6 }}>{blurb}</Body>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ============================================================
   3 · ICONOGRAPHY
   ============================================================ */
const ICON_SET = [
  // [key, label, paths] — 64×64 canvas, 4px clear-zone, 1.6px round-cap monoline.
  // Crimson reserved for change/loss/money (fall, recovery sprout, warn, refund).
  // Solid fills reserved for signal-mass icons (cursor, quill).
  ['shell',   'Shell',     <>
    <path d="M 6 50 Q 32 12 58 50 Z" />
    <path d="M 28 22 L 32 18 L 36 22 L 36 28 L 32 32 L 28 28 Z" strokeOpacity=".45" />
    <path d="M 18 48 V 38 M 46 48 V 38" strokeOpacity=".45" />
    <path d="M 12 46 Q 32 50 52 46" strokeOpacity=".25" />
  </>],
  ['ear',     'Ear',       <>
    <path d="M 24 60 Q 18 16 36 4 Q 32 32 36 60 Z" />
    <path d="M 30 56 Q 24 22 32 12" strokeOpacity=".4" />
  </>],
  ['mile',    'Mile',      <>
    <path d="M 6 52 Q 32 22 58 52" />
    <circle cx="6" cy="52" r="2" fill="#1A1A1A" stroke="none" />
    <line x1="32" y1="34" x2="32" y2="40" strokeOpacity=".5" />
    <path d="M 58 52 l -6 -3 m 6 3 l -3 -6" />
  </>],
  ['rep',     'Repetition',<>
    <path d="M 50 14 a 22 22 0 1 0 -4 38" />
    <path d="M 50 14 l -6 -2 m 6 2 l -2 6" />
    <path d="M 46 52 l -6 2 m 6 -2 l 2 6" />
  </>],
  ['fall',    'Fall',      <>
    <path d="M 6 50 Q 32 14 58 50 Z" />
    <path d="M 28 50 L 24 36 L 34 38 L 26 22" stroke="#8B1A1A" />
  </>],
  ['rec',     'Recovery',  <>
    <path d="M 6 54 Q 32 18 58 54 Z" />
    <path d="M 32 24 Q 30 14 32 4" />
    <path d="M 32 18 q -8 -2 -10 -10 q 8 4 10 8" fill="#8B1A1A" stroke="#8B1A1A" />
    <path d="M 32 10 q 8 -2 10 -10 q -8 4 -10 8" fill="#8B1A1A" stroke="#8B1A1A" />
  </>],
  ['weight',  'Weight',    <>
    <line x1="6" y1="34" x2="58" y2="34" />
    <line x1="32" y1="34" x2="32" y2="14" />
    <rect x="16" y="10" width="32" height="6" />
    <path d="M 4 38 a 8 8 0 0 0 16 0 Z" />
    <path d="M 44 38 a 8 8 0 0 0 16 0 Z" />
  </>],
  ['ledger',  'Ledger',    <>
    <rect x="10" y="6" width="44" height="52" />
    <line x1="14" y1="6" x2="14" y2="58" />
    <line x1="20" y1="18" x2="48" y2="18" />
    <line x1="20" y1="28" x2="48" y2="28" />
    <line x1="20" y1="38" x2="40" y2="38" />
    <line x1="20" y1="48" x2="48" y2="48" />
  </>],
  ['hourglass','Hourglass',<>
    <path d="M 14 6 H 50 V 14 Q 50 24 32 32 Q 50 40 50 50 V 58 H 14 V 50 Q 14 40 32 32 Q 14 24 14 14 Z" />
    <circle cx="30" cy="40" r="1" fill="#1A1A1A" stroke="none" />
    <circle cx="34" cy="44" r="1" fill="#1A1A1A" stroke="none" />
  </>],
  ['signal',  'Signal',    <>
    <rect x="8" y="42" width="6" height="14" />
    <rect x="20" y="32" width="6" height="24" />
    <rect x="32" y="22" width="6" height="34" />
    <rect x="44" y="12" width="6" height="44" />
  </>],
  ['eye',     'Eye',       <>
    <path d="M 4 32 Q 32 8 60 32 Q 32 56 4 32 Z" />
    <circle cx="32" cy="32" r="7" />
    <circle cx="32" cy="32" r="2" fill="#1A1A1A" stroke="none" />
    <path d="M 10 22 Q 32 18 54 22" strokeOpacity=".35" />
  </>],
  ['lock',    'Lock',      <>
    <rect x="12" y="28" width="40" height="28" rx="2" />
    <path d="M 18 28 V 18 a 14 14 0 0 1 28 0 V 28" />
    <circle cx="32" cy="40" r="2" fill="#1A1A1A" stroke="none" />
    <line x1="32" y1="42" x2="32" y2="48" />
  </>],
  ['cursor',  'Cursor',    <path d="M 14 8 L 52 36 L 34 40 L 44 58 L 38 62 L 28 44 L 16 50 Z" fill="#1A1A1A" />],
  ['warn',    'Warn',      <>
    <path d="M 32 6 L 58 54 L 6 54 Z" />
    <line x1="32" y1="24" x2="32" y2="38" stroke="#8B1A1A" />
    <circle cx="32" cy="46" r="1.8" fill="#8B1A1A" stroke="none" />
  </>],
  ['refund',  'Refund',    <>
    <circle cx="32" cy="32" r="20" />
    <path d="M 32 16 a 16 16 0 1 1 -16 16" stroke="#8B1A1A" />
    <path d="M 16 32 l 6 -5 m -6 5 l 6 5" stroke="#8B1A1A" />
  </>],
  ['discord', 'Discord',   <>
    <path d="M 12 18 Q 32 6 52 18 L 56 50 Q 46 56 40 50 L 24 50 Q 18 56 8 50 Z" />
    <ellipse cx="22" cy="34" rx="2.5" ry="3.5" fill="#1A1A1A" stroke="none" />
    <ellipse cx="42" cy="34" rx="2.5" ry="3.5" fill="#1A1A1A" stroke="none" />
  </>],
  ['team',    'Team',      <>
    <circle cx="22" cy="24" r="7" />
    <circle cx="42" cy="24" r="7" />
    <path d="M 8 56 Q 22 38 32 48 Q 42 38 56 56" />
  </>],
  ['quill',   'Quill',     <>
    <path d="M 8 56 L 50 14 Q 60 4 56 22 L 18 60 Z" fill="#1A1A1A" />
    <line x1="20" y1="46" x2="36" y2="30" stroke="#FAF7F2" strokeOpacity=".4" />
    <line x1="26" y1="52" x2="42" y2="36" stroke="#FAF7F2" strokeOpacity=".4" />
  </>],
];
function IconographySystem() {
  return (
    <Section id="iconography" kind="cream">
      <SpreadHeader2 n="03" name="Custom Iconography" sub="18-glyph core. 1.6px round-cap monoline. Crimson reserved for change/loss/money — never decorative." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 1, background: '#E8E4DF', border: '1px solid #E8E4DF', marginTop: 24 }}>
        {ICON_SET.map(([k, label, paths], i) => (
          <div key={k} style={{ background: '#FFFFFF', padding: '22px 14px 18px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <svg viewBox="0 0 64 64" width="48" height="48"><g fill="none" stroke="#1A1A1A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{paths}</g></svg>
            <div style={{ font: "700 12px/1 'Barlow Condensed', sans-serif", letterSpacing: '0.06em', color: '#1A1A1A', textTransform: 'uppercase' }}>{label}</div>
            <div style={{ font: "9px/1 'Space Mono', monospace", letterSpacing: '0.20em', color: '#6B6B6B' }}>ic-{String(i + 1).padStart(2, '0')}-{k}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <Cell label="GRID & STROKE">
          <Spec rows={[
            ['CANVAS', '64 × 64'],
            ['PADDING', '4px clear-zone all sides'],
            ['STROKE', '1.6px round-cap, round-join'],
            ['DEFAULT', '#1A1A1A on #FAF7F2'],
            ['CRIMSON USE', 'Loss, change, money — never default'],
            ['SOLID FILLS', 'Cursor + Quill only (signal mass)'],
          ]} />
        </Cell>
        <Cell label="COMPOSITION RULE">
          <Body size={14} color="#1A1A1A">
            New icons compose from the six core glyphs (shell · ear · mile · rep · fall · recovery).
            <em> "Burnout"</em> = shell + fall. <em>"Streak"</em> = mile + rep. The rule keeps the family
            owned — and prevents drift when contractors draw new ones.
          </Body>
          <div style={{ marginTop: 12, display: 'flex', gap: 10, alignItems: 'center', font: "9px/1 'Space Mono', monospace", color: '#6B6B6B', letterSpacing: '0.20em' }}>
            EX: SHELL <span>+</span> FALL <span>=</span> BURNOUT
          </div>
        </Cell>
      </div>
    </Section>
  );
}

/* ============================================================
   4 · BADGE / ACHIEVEMENT SYSTEM
   ============================================================ */
const BADGES = [
  { numeral: 'I',    title: 'The First Crawl',   meta: 'LESSON 01 · DIAGNOSIS',  expr: 'doctrine' },
  { numeral: 'II',   title: 'The Camaraderie',   meta: 'LESSON 02 · TEAM',       expr: 'doctrine' },
  { numeral: 'III',  title: 'The Lie Decoded',   meta: 'LESSON 03 · MANAGER',    expr: 'verdict'  },
  { numeral: 'IV',   title: 'The Verdict',       meta: 'LESSON 04 · COMMISSION', expr: 'verdict'  },
  { numeral: 'V',    title: 'The Fall',          meta: 'LESSON 05 · PLAYBOOK',   expr: 'fall'     },
  { numeral: 'VI',   title: 'Beyond the Script', meta: 'LESSON 06 · BEYOND',     expr: 'sprint'   },
  { numeral: 'VII',  title: 'The Chaos Bridled', meta: 'LESSON 07 · CHAOS',      expr: 'doctrine' },
  { numeral: 'VIII', title: 'A Pipeline Read',   meta: 'LESSON 08 · PIPELINE',   expr: 'doctrine' },
  { numeral: 'IX',   title: 'The Recovery',      meta: 'LESSON 09 · BURN',       expr: 'recovery' },
  { numeral: 'X',    title: 'The Long Mile',     meta: 'LESSON 10 · EXIT',       expr: 'doctrine' },
  { numeral: 'XI',   title: 'The Money Spoken',  meta: 'LESSON 11 · MONEY',      expr: 'verdict'  },
  { numeral: 'XII',  title: 'The Owner',         meta: 'LESSON 12 · OWN IT',     expr: 'owner'    },
];
function BadgeSystem() {
  return (
    <Section id="badges" kind="cream">
      <SpreadHeader2 n="04" name="Badge / Achievement System" sub="Twelve chapter-medallions. Roman numerals, narrative names — never points or levels. Inherited from Marble Discipline; expression-mapped to the mascot." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginTop: 24 }}>
        {BADGES.map((b, i) => (
          <Badge key={b.numeral} {...b} idx={i} />
        ))}
      </div>
      <div style={{ marginTop: 32, padding: '24px 28px', background: '#FFFFFF', border: '1px solid #E8E4DF' }}>
        <Eyebrow style={{ display: 'block', marginBottom: 12 }}>STATES</Eyebrow>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
          <BadgeMini state="locked" />
          <BadgeMini state="earned" />
          <BadgeMini state="awarded" />
          <Body size={14} color="#6B6B6B" style={{ flex: 1, marginLeft: 16 }}>
            <strong>Locked</strong> — outline-only on cream, mascot ghosted.&nbsp;
            <strong>Earned</strong> — full mark, ink + crimson laurel.&nbsp;
            <strong>Awarded</strong> (final 3 only) — embossed on stone with iris hairline.
          </Body>
        </div>
      </div>
    </Section>
  );
}
function Badge({ numeral, title, meta, expr, idx }) {
  return (
    <div style={{ background: '#F1ECE3', border: '1px solid #1A1A1A', padding: '20px 18px 22px', position: 'relative', textAlign: 'center' }}>
      {/* medallion */}
      <div style={{ width: 100, height: 100, margin: '0 auto', position: 'relative' }}>
        <svg viewBox="0 0 100 100" width="100" height="100" style={{ position: 'absolute', inset: 0 }}>
          <circle cx="50" cy="50" r="46" fill="#FAF7F2" stroke="#1A1A1A" strokeWidth="1" />
          <circle cx="50" cy="50" r="40" fill="none" stroke="#1A1A1A" strokeOpacity=".25" strokeWidth="1" />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <MascotLeponeus size={70} expression={expr} />
        </div>
      </div>
      <div style={{ marginTop: 8, font: "italic 900 18px/1 'Playfair Display', Georgia, serif", color: '#8B1A1A' }}>{numeral}</div>
      <div style={{ marginTop: 8, font: "700 14px/1.2 'Barlow Condensed', sans-serif", letterSpacing: '0.04em', color: '#1A1A1A', textTransform: 'uppercase' }}>{title}</div>
      <div style={{ marginTop: 6, font: "9px/1.2 'Space Mono', monospace", letterSpacing: '0.20em', color: '#6B6B6B' }}>{meta}</div>
      <div style={{ marginTop: 6, font: "9px/1 'Space Mono', monospace", letterSpacing: '0.20em', color: '#C9C4BD' }}>bdg-{String(idx + 1).padStart(2, '0')}-{numeral.toLowerCase()}</div>
    </div>
  );
}
function BadgeMini({ state }) {
  const opacity = state === 'locked' ? 0.25 : 1;
  const ring = state === 'awarded';
  return (
    <div style={{ width: 96, textAlign: 'center' }}>
      <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto', opacity }}>
        <svg viewBox="0 0 80 80" width="80" height="80" style={{ position: 'absolute', inset: 0 }}>
          <circle cx="40" cy="40" r="36" fill={state === 'awarded' ? '#F1ECE3' : '#FAF7F2'} stroke="#1A1A1A" />
          {ring && <circle cx="40" cy="40" r="38" fill="none" stroke="url(#irisR)" strokeWidth="1.2" />}
          <defs>
            <linearGradient id="irisR" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF006E" /><stop offset="50%" stopColor="#38BDF8" /><stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <MascotLeponeus size={56} expression="doctrine" />
        </div>
      </div>
      <div style={{ marginTop: 6, font: "9px/1 'Space Mono', monospace", letterSpacing: '0.20em', color: '#6B6B6B', textTransform: 'uppercase' }}>{state}</div>
    </div>
  );
}

/* ============================================================
   5 · SPOT ILLUSTRATION SYSTEM
   ============================================================ */
function SpotSystem() {
  return (
    <Section id="spots" kind="cream">
      <SpreadHeader2 n="05" name="Spot Illustration System" sub="Five composable scenes. Single 1.6px line. Caveat caption in crimson. Illustrations are scenes from a long-running fable — not standalone art." />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 24 }}>
        <SpotCard id="sp-01" title="Mile 6" caption='"He sprinted. He slept. The shell did not."' draw={spotMile} />
        <SpotCard id="sp-02" title="The Diagnosis" caption='"You set the alarm for 6am. It is Saturday again."' draw={spotDiagnosis} />
        <SpotCard id="sp-03" title="The Verdict" caption='"Your check is the verdict on 30 days."' draw={spotVerdict} />
        <SpotCard id="sp-04" title="The Recovery" caption='"The shell cracks. The shell grows back."' draw={spotRecovery} />
        <SpotCard id="sp-05" title="The Long Mile" caption='"Every mile looks the same. That is the lesson."' draw={spotLongMile} full />
      </div>
    </Section>
  );
}
function SpotCard({ id, title, caption, draw, full }) {
  return (
    <div style={{ gridColumn: full ? 'span 2' : 'auto', background: '#FFFFFF', border: '1px solid #E8E4DF', padding: 28 }}>
      <Eyebrow>{id.toUpperCase()}</Eyebrow>
      <div style={{ marginTop: 14, padding: '14px 0', background: '#FAF7F2' }}>{draw()}</div>
      <H3 style={{ fontSize: 22, marginTop: 14 }}>{title}</H3>
      <p style={{ margin: '6px 0 0', font: "italic 18px/1.4 'Caveat', cursive", color: '#8B1A1A' }}>{caption}</p>
    </div>
  );
}
// Spots are scaffolding (road, terminal, scale) drawn in canon line-art,
// with the iridescent PNG creature(s) embedded inline via <image>. The
// scaffolding stays strict 1.6px monoline; the creature carries the brand.
const spotS = { fill: 'none', stroke: '#1A1A1A', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };
// Centered <image> helper: places a square PNG of side `size` at (cx, cy).
function SpotMascot({ expression, cx, cy, size }) {
  return (
    <image
      href={pngPath(expression)}
      x={cx - size / 2}
      y={cy - size / 2}
      width={size}
      height={size}
      preserveAspectRatio="xMidYMid meet"
    />
  );
}
function spotMile() {
  return (
    <svg viewBox="0 0 480 200" width="100%" style={{ display: 'block' }}>
      <g {...spotS}>
        <path d="M 20 140 Q 240 100 460 140" strokeDasharray="2 6" />
        {[120, 240, 360].map(x => <line key={x} x1={x} y1="128" x2={x} y2="146" />)}
      </g>
      {/* foreground: the patient one (doctrine), close to viewer */}
      <SpotMascot expression="doctrine" cx={80} cy={130} size={140} />
      {/* background: the racer (sprint), already passed up the road */}
      <SpotMascot expression="sprint" cx={370} cy={120} size={70} />
    </svg>
  );
}
function spotDiagnosis() {
  return (
    <svg viewBox="0 0 480 200" width="100%" style={{ display: 'block' }}>
      <g {...spotS}>
        <rect x="160" y="40" width="160" height="120" />
        <line x1="160" y1="60" x2="320" y2="60" />
        <text x="170" y="56" fontFamily="Space Mono, monospace" fontSize="10" fill="#6B6B6B">DIAGNOSE.SH</text>
        <text x="170" y="82" fontFamily="Space Mono, monospace" fontSize="11" fill="#1A1A1A">$ ./run --honest</text>
        <text x="170" y="100" fontFamily="Space Mono, monospace" fontSize="11" fill="#6B6B6B">&gt; scanning…</text>
        <text x="170" y="118" fontFamily="Space Mono, monospace" fontSize="11" fill="#6B6B6B">&gt; calendar…</text>
        <text x="170" y="138" fontFamily="Space Mono, monospace" fontSize="11" fill="#8B1A1A">&gt; verdict ▮</text>
      </g>
      <SpotMascot expression="diagnosis" cx={80} cy={120} size={160} />
    </svg>
  );
}
function spotVerdict() {
  return (
    <svg viewBox="0 0 480 200" width="100%" style={{ display: 'block' }}>
      <g {...spotS}>
        <line x1="60" y1="100" x2="420" y2="100" />
        <line x1="240" y1="100" x2="240" y2="40" />
        <rect x="180" y="40" width="120" height="14" />
        <circle cx="60" cy="120" r="14" />
        <circle cx="420" cy="120" r="14" />
        <text x="240" y="50" textAnchor="middle" fontFamily="Playfair Display, serif" fontStyle="italic" fontWeight="900" fontSize="16" fill="#8B1A1A" stroke="none">VERDICT</text>
      </g>
      {/* the verdict pose observing its own balance */}
      <SpotMascot expression="verdict" cx={240} cy={155} size={70} />
    </svg>
  );
}
function spotRecovery() {
  return (
    <svg viewBox="0 0 480 200" width="100%" style={{ display: 'block' }}>
      {/* recovery PNG already carries the sprout — no scaffolding needed */}
      <SpotMascot expression="recovery" cx={240} cy={100} size={200} />
    </svg>
  );
}
function spotLongMile() {
  const stops = [60, 240, 420, 600, 780, 940];
  return (
    <svg viewBox="0 0 980 200" width="100%" style={{ display: 'block' }}>
      <g {...spotS}>
        <line x1="20" y1="140" x2="960" y2="140" strokeDasharray="2 6" />
        {[140, 280, 420, 560, 700, 840].map(x => <line key={x} x1={x} y1="128" x2={x} y2="148" />)}
      </g>
      {/* every mile looks the same — six identical doctrine poses */}
      {stops.map(cx => <SpotMascot key={cx} expression="doctrine" cx={cx} cy={120} size={70} />)}
    </svg>
  );
}

/* ============================================================
   6 · UI SYMBOL SYSTEM
   ============================================================ */
function UISymbols() {
  return (
    <Section id="ui-symbols" kind="cream">
      <SpreadHeader2 n="06" name="UI Symbol System" sub="The marks that live inside the product. Cursor, stamps, dividers, terminal chrome, status pips. Operator-room, not editorial." />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 24 }}>
        <Cell label="THE CURSOR (CRIMSON BAR)">
          <div style={{ background: '#F1ECE3', padding: 24 }}>
            <div style={{ font: "20px/1.6 'Space Mono', monospace", color: '#1A1A1A' }}>
              diagnosis: <span style={{ display: 'inline-block', width: 12, height: 22, background: '#8B1A1A', verticalAlign: -3, animation: 'blink 1s steps(2) infinite' }} />
            </div>
          </div>
          <Spec rows={[['SIZE', '12 × 22 px (default)'], ['COLOR', '#8B1A1A'], ['BLINK', '1s steps(2) infinite']]} />
        </Cell>

        <Cell label="STATUS PIPS">
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', padding: 16, background: '#0B0B0B' }}>
            <Pip color="#10B981" label="HONEST" />
            <Pip color="#F59E0B" label="DRIFT" />
            <Pip color="#FF006E" label="LYING" />
          </div>
          <Body size={13} color="#6B6B6B">Three states. Used in dashboards, terminal headers, and lesson progress.</Body>
        </Cell>

        <Cell label="TERMINAL CHROME">
          <div style={{ background: '#FFFFFF', border: '1px solid #E8E4DF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid #E8E4DF' }}>
              <svg width="36" height="10" viewBox="0 0 36 10"><circle cx="5" cy="5" r="4" fill="#EF4444" fillOpacity=".5"/><circle cx="18" cy="5" r="4" fill="#F59E0B" fillOpacity=".5"/><circle cx="31" cy="5" r="4" fill="#10B981" fillOpacity=".5"/></svg>
              <span style={{ font: "9px/1 'Space Mono', monospace", letterSpacing: '0.20em', color: '#6B6B6B' }}>FILE · DIAGNOSE.SH</span>
            </div>
            <div style={{ padding: 16, font: "13px/1.85 'Space Mono', monospace", color: '#1A1A1A' }}>
              <div><span style={{ color: '#6B6B6B' }}>$</span>&nbsp; ./run --honest</div>
              <div><span style={{ color: '#6B6B6B' }}>&gt;</span>&nbsp; verdict pending</div>
            </div>
          </div>
        </Cell>

        <Cell label="DIVIDERS">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <DividerPath />
            <IrisRule />
            <DividerHair />
            <DividerMeander />
          </div>
          <Body size={13} color="#6B6B6B">Dotted-path (lessons), iris (sections), hair (rows), meander (chapter ends).</Body>
        </Cell>

        <Cell label="STAMPS">
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', padding: 16 }}>
            <Stamp>Classified</Stamp>
            <Stamp color="#1A1A1A">Operator</Stamp>
            <Stamp>Refundable</Stamp>
            <Stamp color="#1A1A1A" rotate={6}>v1.1 Canon</Stamp>
          </div>
          <Body size={13} color="#6B6B6B">Slight rotation, hairline border, low-opacity fill. Used sparingly — one per page.</Body>
        </Cell>

        <Cell label="CORNER BRACKETS">
          <div style={{ position: 'relative', padding: 24, height: 120, background: '#FFFFFF' }}>
            <CornerBrackets color="#1A1A1A" opacity={0.6} inset={6} size={14} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', font: "italic 18px/1 'Playfair Display', Georgia, serif" }}>
              [ field card ]
            </div>
          </div>
          <Body size={13} color="#6B6B6B">Always 6px inset, 14px arms, 1px stroke. Optional on cards; required on classified docs.</Body>
        </Cell>
      </div>
    </Section>
  );
}
function Pip({ color, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ width: 10, height: 10, borderRadius: 9999, background: color, boxShadow: `0 0 12px ${color}` }} />
      <span style={{ font: "10px/1 'Space Mono', monospace", letterSpacing: '0.25em', color: '#FAF7F2' }}>{label}</span>
    </div>
  );
}
function DividerPath() {
  return <svg viewBox="0 0 480 8" width="100%" height="8"><path d="M 0 4 Q 240 0 480 4" stroke="#1A1A1A" strokeWidth="1.2" strokeDasharray="2 6" fill="none" /></svg>;
}
function DividerHair() { return <span style={{ display: 'block', height: 1, background: '#E8E4DF' }} />; }
function DividerMeander() {
  return (
    <svg viewBox="0 0 480 12" width="100%" height="12">
      <path d="M 0 6 L 6 6 L 6 2 L 12 2 L 12 10 L 18 10 L 18 2 L 24 2 L 24 10 L 30 10 L 30 2 L 36 2 L 36 10 L 42 10 L 42 2 L 48 2 L 48 10 L 54 10 L 54 6 L 480 6" fill="none" stroke="#1A1A1A" strokeWidth="1" />
    </svg>
  );
}

/* ============================================================
   7 · STYLE GUIDE
   ============================================================ */
function StyleGuide() {
  return (
    <Section id="guide" kind="cream">
      <SpreadHeader2 n="07" name="Visual Style Guide" sub="Three rooms. One mascot. Strict scarcity rules on iris, mascot, and crimson." />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginTop: 24 }}>
        <Room kind="EDITORIAL" bg="#FAF7F2" fg="#1A1A1A" rules={[
          'Default room. Cream + ink + crimson.',
          'Iris reserved for rules + CTA + AESDR dot.',
          'Mascot at most once per spread.',
          'Caveat (Michael) only in margin notes.',
        ]} />
        <Room kind="MEDALLION" bg="#F1ECE3" fg="#1A1A1A" rules={[
          'Stone-cream substrate. Used for badges + certificates.',
          'Roman numerals always italic Playfair black.',
          'Iris hairline only on the top three awards.',
          'Mascot expression-mapped to the chapter.',
        ]} />
        <Room kind="OPERATOR" bg="#0B0B0B" fg="#FAF7F2" rules={[
          'Black ground. Used inside the product UI only.',
          'Iris signals only — alerts, unlocks, money.',
          'Mascot rendered in 2.5px stroke for legibility.',
          'Type stays Space Mono + Barlow Condensed.',
        ]} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 32 }}>
        <Cell label="SCARCITY TABLE">
          <Spec rows={[
            ['MASCOT', 'Max 1 per spread (editorial), 1 per badge, 1 per onboarding screen'],
            ['IRIS GRADIENT', 'Rules · CTAs · the AESDR dot · top-3 awards. Never a fill.'],
            ['CRIMSON', 'Strap, change/loss/money icons, Caveat (Michael) only.'],
            ['CAVEAT FONT', 'Michael only. Margin notes ≤ 3 lines.'],
            ['BACKGROUND', 'Cream → Stone → Black. No other surface colors.'],
          ]} />
        </Cell>
        <Cell label="DON'T">
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, font: "14px/1.65 'Source Serif 4', serif", color: '#1A1A1A', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li>Don't anthropomorphize the mascot — no waving, no thumbs up.</li>
            <li>Don't fill with iris. It's a rule, a signal, a dot. Never a wash.</li>
            <li>Don't use Caveat as body. Ever.</li>
            <li>Don't add a 9th expression without writing the rule first.</li>
            <li>Don't use Roman numerals outside the badge system.</li>
          </ul>
        </Cell>
      </div>
    </Section>
  );
}
function Room({ kind, bg, fg, rules }) {
  return (
    <div style={{ background: bg, color: fg, border: '1px solid #E8E4DF', padding: '24px 24px 28px', minHeight: 240 }}>
      <Eyebrow color={fg === '#FAF7F2' ? 'rgba(255,255,255,0.55)' : '#6B6B6B'}>ROOM · {kind}</Eyebrow>
      <div style={{ marginTop: 14, padding: '12px 0' }}><MascotLeponeus size={120} expression="doctrine" forceSvg /></div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, font: `14px/1.6 'Source Serif 4', serif`, color: fg, opacity: 0.85, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {rules.map(r => <li key={r}>— {r}</li>)}
      </ul>
    </div>
  );
}

/* ============================================================
   8 · NAMING TAXONOMY
   ============================================================ */
function NamingTaxonomy() {
  const rows = [
    ['MASCOT',   'msct-{expr}-{size}',          'msct-doctrine-300, msct-fall-72'],
    ['ICON',     'ic-{nn}-{key}',                'ic-01-shell, ic-15-refund'],
    ['BADGE',    'bdg-{nn}-{numeral}',           'bdg-01-i, bdg-12-xii'],
    ['SPOT',     'sp-{nn}-{slug}',               'sp-01-mile-6, sp-04-recovery'],
    ['UI MARK',  'ui-{kind}-{key}',              'ui-pip-honest, ui-rule-iris'],
    ['LOCKUP',   'lk-{layout}-{room}',           'lk-horiz-cream, lk-stack-stone, lk-app-ink'],
    ['STAMP',    'st-{label}-{rot}',             'st-classified-n6, st-canon-p6'],
    ['CHAPTER',  'ch-{nn}-{slug}',               'ch-01-diagnosis, ch-12-own-it'],
  ];
  return (
    <Section id="taxonomy" kind="cream">
      <SpreadHeader2 n="08" name="Production Naming Taxonomy" sub="One scheme across SVG / PNG / Figma / web / LMS. Lowercase, hyphenated, zero-padded." />

      <div style={{ marginTop: 24, background: '#FFFFFF', border: '1px solid #E8E4DF', padding: '24px 28px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1A1A1A' }}>
              {['ASSET CLASS', 'PATTERN', 'EXAMPLES'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '12px 0', font: "10px/1 'Space Mono', monospace", letterSpacing: '0.25em', color: '#1A1A1A', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(([cls, pat, ex]) => (
              <tr key={cls} style={{ borderBottom: '1px solid #E8E4DF' }}>
                <td style={{ padding: '14px 0', width: 160, font: "700 14px/1.2 'Barlow Condensed', sans-serif", letterSpacing: '0.04em', color: '#1A1A1A', textTransform: 'uppercase' }}>{cls}</td>
                <td style={{ padding: '14px 12px', width: 280, font: "13px/1.5 'Space Mono', monospace", color: '#8B1A1A' }}>{pat}</td>
                <td style={{ padding: '14px 0', font: "italic 14px/1.5 'Source Serif 4', serif", color: '#6B6B6B' }}>{ex}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <Cell label="VARIANT SUFFIXES">
          <Spec rows={[
            ['SIZE',  '@xs 24 · @sm 48 · @md 96 · @lg 192 · @xl 384'],
            ['STATE', 'state-locked · state-earned · state-awarded'],
            ['ROOM',  'room-cream · room-stone · room-ink'],
            ['MOTION','motion-still · motion-blink · motion-shimmer'],
          ]} />
        </Cell>
        <Cell label="VERSIONING">
          <Spec rows={[
            ['MAJOR', 'v1, v2 — breaks compatibility (mascot pose changes)'],
            ['MINOR', 'v1.1 — additive (new expression, new icon)'],
            ['PATCH', 'v1.1.1 — fixes (path simplification, alignment)'],
            ['CANON', 'v1.1 is the locked canon. Mark assets with `-canon` suffix when frozen.'],
          ]} />
        </Cell>
      </div>
    </Section>
  );
}

/* ============================================================
   9 · EXPORT RECOMMENDATIONS
   ============================================================ */
function ExportSpec() {
  const rows = [
    ['SVG (component)',    'web · LMS · Figma',        '64×64 viewBox · stroke 1.6 · no inline styles · `currentColor` for ink',                'ic-01-shell.svg'],
    ['SVG (illustration)', 'editorial · spots',        'fixed canvas · 1.6 stroke · `vector-effect:non-scaling-stroke`',                         'sp-01-mile-6.svg'],
    ['PNG @1×',            'LMS thumb · email',        '128 px · transparent · sRGB · 24-bit',                                                     'bdg-01-i@1x.png'],
    ['PNG @2×',            'LMS hero · social',        '256 px · transparent · sRGB · 24-bit',                                                     'bdg-01-i@2x.png'],
    ['PNG @3×',            'iOS app icon · billboard', '384–1024 px · sRGB · 24-bit',                                                              'msct-doctrine@3x.png'],
    ['Figma library',      'design',                   'one page per system (Mascot / Icons / Badges / Spots / UI). Components, no instances.',  'aesdr-canon-v1.1.fig'],
    ['Web sprite',         'site · LMS UI',            'single SVG sprite · `<symbol id="ic-…">` · gzipped',                                       'aesdr-icons.svg'],
    ['LMS package',        'SCORM / Canvas',           'PNG @2× + SVG fallback · ZIP per chapter · manifest.json with names',                     'aesdr-lesson-01.zip'],
    ['Variable mascot',    'animated states',          'Lottie JSON · 60fps · 8 named states matching expression sheet',                          'msct-canon.lottie.json'],
  ];
  return (
    <Section id="exports" kind="ink">
      <SpreadHeader3 n="09" name="Export Recommendations" sub="One asset, many surfaces. Same name everywhere. Ship the canon as a Figma library + a web sprite + an LMS zip per chapter." />

      <div style={{ marginTop: 24, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.18)', padding: '24px 28px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.4)' }}>
              {['FORMAT', 'USE', 'SPEC', 'EXAMPLE'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '12px 0', font: "10px/1 'Space Mono', monospace", letterSpacing: '0.25em', color: '#FAF7F2', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(([fmt, use, spec, ex]) => (
              <tr key={fmt} style={{ borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
                <td style={{ padding: '14px 12px 14px 0', width: 180, font: "700 14px/1.2 'Barlow Condensed', sans-serif", letterSpacing: '0.04em', color: '#FAF7F2', textTransform: 'uppercase' }}>{fmt}</td>
                <td style={{ padding: '14px 12px', width: 180, font: "13px/1.5 'Space Mono', monospace", color: 'rgba(255,255,255,0.6)' }}>{use}</td>
                <td style={{ padding: '14px 12px', font: "italic 14px/1.55 'Source Serif 4', serif", color: 'rgba(255,255,255,0.8)' }}>{spec}</td>
                <td style={{ padding: '14px 0', width: 220, font: "13px/1.5 'Space Mono', monospace", color: '#FF6B00' }}>{ex}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <CellDark label="DELIVERY BUNDLE">
          <SpecDark rows={[
            ['PRIMARY',  'aesdr-canon-v1.1.fig (Figma library)'],
            ['WEB',      'aesdr-icons.svg + aesdr-mascot.svg (sprites)'],
            ['LMS',      'aesdr-lessons-01..12.zip (per-chapter PNG/SVG/JSON)'],
            ['MOTION',   'msct-canon.lottie.json (8 states)'],
            ['BRAND',    'aesdr-style-guide.pdf (this document, exportable)'],
          ]} />
        </CellDark>
        <CellDark label="GOVERNANCE">
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, font: `14px/1.65 'Source Serif 4', serif`, color: 'rgba(255,255,255,0.85)', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li>One owner of the canon. Adds require an entry in this guide first.</li>
            <li>External illustration is forbidden — every spot is hand-drawn here.</li>
            <li>Every commit to the asset library tags `canon-vX.Y` once frozen.</li>
            <li>LMS exports regenerate from canon — never hand-edit the zip.</li>
          </ul>
        </CellDark>
      </div>

      <div style={{ marginTop: 48, textAlign: 'center' }}>
        <IrisRule width={120} style={{ margin: '0 auto' }} />
        <Body color="rgba(255,255,255,0.5)" size={14} style={{ margin: '24px auto 0', maxWidth: 480 }}>
          <em>End of file · AESDR Brand Systems v1.1 · Canon</em>
        </Body>
      </div>
    </Section>
  );
}
function SpreadHeader3({ n, name, sub }) {
  return (
    <header style={{ display: 'flex', gap: 36, alignItems: 'flex-end', marginBottom: 20 }}>
      <span style={{ font: "italic 900 56px/1 'Playfair Display', Georgia, serif", color: '#FAF7F2', display: 'inline-flex', alignItems: 'baseline', gap: 4 }}>
        {n}<span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.65em' }}> / 09</span>
      </span>
      <div style={{ flex: 1 }}>
        <Eyebrow color="rgba(255,255,255,0.5)" style={{ display: 'block', marginBottom: 10 }}>FINAL SYSTEM · {n}</Eyebrow>
        <H2 color="#FAF7F2" size={48}>{name}</H2>
        <Body color="rgba(255,255,255,0.7)" size={16} style={{ marginTop: 10 }}>{sub}</Body>
      </div>
    </header>
  );
}
function CellDark({ label, children }) {
  return (
    <div style={{ padding: '20px 22px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.18)', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Eyebrow color="rgba(255,255,255,0.55)">{label}</Eyebrow>
      {children}
    </div>
  );
}
function SpecDark({ rows }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', font: "13px/1.5 'Source Serif 4', serif", color: '#FAF7F2' }}>
      <tbody>
        {rows.map(([k, v]) => (
          <tr key={k} style={{ borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
            <td style={{ padding: '8px 0', font: "10px/1.4 'Space Mono', monospace", letterSpacing: '0.18em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', width: 120, verticalAlign: 'top' }}>{k}</td>
            <td style={{ padding: '8px 0', verticalAlign: 'top' }}>{v}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

Object.assign(window, {
  SynthesisDecision, MascotSystem, ExpressionSheet, IconographySystem,
  BadgeSystem, SpotSystem, UISymbols, StyleGuide, NamingTaxonomy, ExportSpec,
});
