/* Three exploratory directions for the AESDR symbolic system.
   Each direction is a full editorial spread.
   Same eight specs across all three so they're directly comparable:
     1 Mascot treatment    5 UI ornament language
     2 Icon style          6 Color/material
     3 Badge style         7 Where it works
     4 Spot illo style     8 Where it fails
*/

/* ============================================================
   1 · MARBLE DISCIPLINE
   Carved-stone, archaic, restraint. Plinth + chisel marks.
   ============================================================ */

function MarbleMascot() {
  // Faceless laureled bust silhouette — "the operator as classical figure"
  return (
    <svg viewBox="0 0 200 240" width="160" height="192" aria-label="Marble bust">
      <rect width="200" height="240" fill="#F1ECE3" />
      <rect x="20" y="20" width="160" height="200" fill="none" stroke="#1A1A1A" strokeOpacity=".25" />
      {/* plinth */}
      <rect x="50" y="200" width="100" height="14" fill="#1A1A1A" fillOpacity=".82" />
      <rect x="58" y="190" width="84" height="10" fill="#1A1A1A" fillOpacity=".68" />
      {/* shoulders */}
      <path d="M 38 200 C 38 162 60 144 100 144 C 140 144 162 162 162 200 Z" fill="#1A1A1A" fillOpacity=".85" />
      {/* neck */}
      <rect x="86" y="120" width="28" height="32" fill="#1A1A1A" fillOpacity=".85" />
      {/* head */}
      <ellipse cx="100" cy="92" rx="38" ry="44" fill="#1A1A1A" fillOpacity=".85" />
      {/* laurel hint — two leaves */}
      <path d="M 64 78 q -10 -8 -16 4 q 8 6 18 -2 Z" fill="#8B1A1A" fillOpacity=".85" />
      <path d="M 136 78 q 10 -8 16 4 q -8 6 -18 -2 Z" fill="#8B1A1A" fillOpacity=".85" />
      {/* chisel-mark stamp */}
      <text x="30" y="234" font-family="Space Mono, monospace" font-size="8" fill="#6B6B6B" letter-spacing="1.2">AESDR · M-01</text>
    </svg>
  );
}

function MarbleIcons() {
  // Geometric chiseled marks. 1.5px stroke, sharp termini.
  const stroke = { fill: 'none', stroke: '#1A1A1A', strokeWidth: 1.5, strokeLinecap: 'square', strokeLinejoin: 'miter' };
  return (
    <svg viewBox="0 0 480 80" width="480" height="80" aria-label="Marble icon set">
      {/* column */}
      <g transform="translate(0,8)" {...stroke}>
        <rect x="14" y="6" width="36" height="6" />
        <rect x="20" y="12" width="24" height="48" />
        <rect x="14" y="60" width="36" height="6" />
        <line x1="24" y1="14" x2="24" y2="60" />
        <line x1="32" y1="14" x2="32" y2="60" />
        <line x1="40" y1="14" x2="40" y2="60" />
      </g>
      {/* laurel */}
      <g transform="translate(72,12)" {...stroke}>
        <path d="M 32 4 L 32 60" />
        <path d="M 32 14 q -14 -2 -18 8 q 12 4 18 -2" />
        <path d="M 32 14 q 14 -2 18 8 q -12 4 -18 -2" />
        <path d="M 32 30 q -14 -2 -18 8 q 12 4 18 -2" />
        <path d="M 32 30 q 14 -2 18 8 q -12 4 -18 -2" />
      </g>
      {/* chisel */}
      <g transform="translate(144,12)" {...stroke}>
        <path d="M 12 4 L 44 4 L 52 12 L 52 56 L 12 56 Z" />
        <line x1="20" y1="18" x2="44" y2="18" />
        <line x1="20" y1="28" x2="44" y2="28" />
        <line x1="20" y1="38" x2="36" y2="38" />
      </g>
      {/* hourglass */}
      <g transform="translate(216,12)" {...stroke}>
        <path d="M 14 4 L 50 4 L 50 14 L 32 32 L 50 50 L 50 60 L 14 60 L 14 50 L 32 32 L 14 14 Z" />
      </g>
      {/* coin / weighing */}
      <g transform="translate(288,12)" {...stroke}>
        <circle cx="32" cy="32" r="22" />
        <line x1="10" y1="32" x2="54" y2="32" />
        <text x="32" y="36" textAnchor="middle" fontFamily="Playfair Display, serif" fontStyle="italic" fontWeight="900" fontSize="14" fill="#1A1A1A" stroke="none">A</text>
      </g>
      {/* wedge */}
      <g transform="translate(360,12)" {...stroke}>
        <path d="M 12 56 L 32 4 L 52 56 Z" />
        <line x1="22" y1="40" x2="42" y2="40" />
      </g>
    </svg>
  );
}

function MarbleBadges() {
  return (
    <svg viewBox="0 0 480 140" width="480" height="140" aria-label="Marble badge style">
      {[0, 1, 2].map((i) => {
        const cx = 80 + i * 160;
        const stamps = ['I', 'V', 'X'][i];
        const labels = ['THE FIRST CRAWL', 'FIVE WEEKS CLEAN', 'TENTH MILE'][i];
        return (
          <g key={i}>
            <circle cx={cx} cy={56} r={48} fill="#F1ECE3" stroke="#1A1A1A" strokeWidth="1" />
            <circle cx={cx} cy={56} r={42} fill="none" stroke="#1A1A1A" strokeOpacity=".25" strokeWidth="1" />
            <text x={cx} y={64} textAnchor="middle" fontFamily="Playfair Display, serif" fontStyle="italic" fontWeight="900" fontSize="36" fill="#1A1A1A">{stamps}</text>
            <text x={cx} y={124} textAnchor="middle" fontFamily="Space Mono, monospace" fontSize="9" fill="#6B6B6B" letterSpacing="1.6">{labels}</text>
          </g>
        );
      })}
    </svg>
  );
}

function MarbleSpot() {
  // Single-line carved drawing — an outstretched arm holding a scroll
  const s = { fill: 'none', stroke: '#1A1A1A', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' };
  return (
    <svg viewBox="0 0 320 200" width="320" height="200" aria-label="Marble spot illustration">
      <rect x="0" y="0" width="320" height="200" fill="#F1ECE3" />
      <g {...s}>
        <path d="M 40 160 Q 80 110 130 100 L 200 90 Q 250 88 280 110" />
        <ellipse cx="200" cy="92" rx="22" ry="6" />
        <path d="M 178 92 L 178 120 L 222 120 L 222 92" />
        <line x1="184" y1="100" x2="216" y2="100" strokeOpacity=".35" />
        <line x1="184" y1="106" x2="210" y2="106" strokeOpacity=".35" />
        <line x1="184" y1="112" x2="216" y2="112" strokeOpacity=".35" />
        <path d="M 40 160 L 40 175 M 280 110 L 280 175" />
        <line x1="20" y1="175" x2="300" y2="175" />
      </g>
      <text x="20" y="194" fontFamily="Space Mono, monospace" fontSize="8" fill="#6B6B6B" letterSpacing="1.2">SPOT · M-04 · "THE RECORD"</text>
    </svg>
  );
}

function MarbleOrnament() {
  return (
    <svg viewBox="0 0 480 40" width="480" height="40" aria-label="Marble UI ornament">
      <g stroke="#1A1A1A" strokeWidth="1">
        {/* meander / Greek-key divider */}
        <path d="M 0 20 L 12 20 L 12 12 L 24 12 L 24 28 L 36 28 L 36 12 L 48 12 L 48 28 L 60 28 L 60 12 L 72 12 L 72 28 L 84 28 L 84 12 L 96 12 L 96 28 L 108 28 L 108 12 L 120 12 L 120 28 L 132 28 L 132 12 L 144 12 L 144 28 L 156 28 L 156 12 L 168 12 L 168 28 L 180 28 L 180 12 L 192 12 L 192 28 L 204 28 L 204 12 L 216 12 L 216 28 L 228 28 L 228 12 L 240 12" fill="none" />
        <line x1="0" y1="20" x2="0" y2="20" />
      </g>
      <line x1="240" y1="20" x2="480" y2="20" stroke="#1A1A1A" />
    </svg>
  );
}

function DirectionMarble() {
  return (
    <Section id="dir-marble" kind="cream" style={{ paddingTop: 80 }}>
      <SpreadHeader n="01" name="Marble Discipline" thesis="Ancient Greek training ground. Carved stone. Restraint, silence, pressure, mastery. The operator as classical figure. The check as verdict, etched." />

      <div style={mk_layout.row}>
        {/* Left: mascot + spot illo */}
        <div style={mk_layout.col}>
          <SpecBlock label="01 · MASCOT TREATMENT">
            <MarbleMascot />
            <Body size={14} color="#6B6B6B" style={{ marginTop: 14 }}>
              A faceless laureled bust on a plinth. Never smiles, never speaks. Classical
              silhouette in Playfair-black. Crimson laurel as the only chromatic accent. The
              mascot doesn't have moods; it has <em>postures</em>.
            </Body>
          </SpecBlock>

          <SpecBlock label="04 · SPOT ILLUSTRATION">
            <MarbleSpot />
            <Body size={14} color="#6B6B6B" style={{ marginTop: 14 }}>
              Single-line carved drawings — arms, scrolls, columns, weights. No fills, no
              gradients, no shading. Editorial as a coin engraving.
            </Body>
          </SpecBlock>
        </div>

        {/* Right: icons + badges + ornament */}
        <div style={mk_layout.col}>
          <SpecBlock label="02 · ICON STYLE">
            <div style={{ background: '#F1ECE3', padding: '12px 16px' }}>
              <MarbleIcons />
            </div>
            <Body size={14} color="#6B6B6B" style={{ marginTop: 14 }}>
              1.5px chiseled monoline, square caps, mitered joins. Geometry only — no rounded
              tips, no inner fills. Each icon reads as a stamped seal.
            </Body>
          </SpecBlock>

          <SpecBlock label="03 · BADGE STYLE">
            <MarbleBadges />
            <Body size={14} color="#6B6B6B" style={{ marginTop: 14 }}>
              Roman-numeraled medallions on stone-cream ground. The badge isn't celebratory —
              it's <em>chiseled</em>. Earned, not awarded.
            </Body>
          </SpecBlock>

          <SpecBlock label="05 · UI ORNAMENT">
            <MarbleOrnament />
            <Body size={14} color="#6B6B6B" style={{ marginTop: 14 }}>
              Greek-key meanders as section dividers. Column flutes as background hatching.
              Stamped corners (◧ ◨ ◣ ◢) on cards.
            </Body>
          </SpecBlock>
        </div>
      </div>

      {/* Bottom strip — color, fits, fails */}
      <div style={{ ...mk_layout.row, marginTop: 32 }}>
        <SpecBlock label="06 · COLOR / MATERIAL" full>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <Swatch hex="#F1ECE3" name="Limestone"  meta="Page" />
            <Swatch hex="#1A1A1A" name="Carved Ink" meta="Glyph" />
            <Swatch hex="#8B1A1A" name="Oxblood"    meta="Laurel" />
            <Swatch hex="#C9B89A" name="Patina"     meta="Aged ground" />
            <Swatch hex="#6B6B6B" name="Cool Stone" meta="Caption" />
          </div>
          <Body size={14} color="#6B6B6B" style={{ marginTop: 14 }}>
            Limestone substrate (warmer than cream). Oxblood holds the iris's accent role
            without the rainbow. Iris is <em>retired</em> in this direction — too modern for
            the material.
          </Body>
        </SpecBlock>

        <SpecBlock label="07 · WHERE IT WORKS" green>
          <ul style={mk_layout.ul}>
            <li>Premium pricing pages, founder letters, certificates of completion.</li>
            <li>Long-form lessons where reading is the point.</li>
            <li>Print collateral, framed wall pieces, books-as-products.</li>
          </ul>
        </SpecBlock>
        <SpecBlock label="08 · WHERE IT FAILS" red>
          <ul style={mk_layout.ul}>
            <li>Tactical UI: dashboards, terminals, anything that needs a status light.</li>
            <li>Anything Michael says — Caveat hand and laurels collide.</li>
            <li>Younger audiences who read marble as <em>fancy</em>, not <em>serious</em>.</li>
          </ul>
        </SpecBlock>
      </div>
    </Section>
  );
}


/* ============================================================
   2 · NEON OPERATOR
   Black-and-white SaaS command center. Status lights as art.
   ============================================================ */

function NeonMascot() {
  // Abstract operator: a cursor block + scan-line "blip"
  return (
    <svg viewBox="0 0 200 240" width="160" height="192" aria-label="Neon operator mark">
      <rect width="200" height="240" fill="#0B0B0B" />
      <rect x="16" y="16" width="168" height="208" fill="none" stroke="#FAF7F2" strokeOpacity=".3" />
      {/* scan-line backdrop */}
      {[...Array(20)].map((_, i) => (
        <line key={i} x1="20" y1={26 + i * 9} x2="180" y2={26 + i * 9} stroke="#FAF7F2" strokeOpacity=".05" />
      ))}
      {/* targeting reticule */}
      <circle cx="100" cy="120" r="46" fill="none" stroke="#FAF7F2" strokeOpacity=".5" />
      <circle cx="100" cy="120" r="22" fill="none" stroke="#FAF7F2" strokeOpacity=".7" />
      <line x1="40" y1="120" x2="80" y2="120" stroke="#FAF7F2" />
      <line x1="120" y1="120" x2="160" y2="120" stroke="#FAF7F2" />
      <line x1="100" y1="60" x2="100" y2="100" stroke="#FAF7F2" />
      <line x1="100" y1="140" x2="100" y2="180" stroke="#FAF7F2" />
      {/* neon blip — iris color */}
      <circle cx="100" cy="120" r="6" fill="url(#neonG)" />
      <circle cx="100" cy="120" r="14" fill="none" stroke="url(#neonG)" />
      <defs>
        <linearGradient id="neonG" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FF006E" />
          <stop offset="50%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      <text x="22" y="216" fontFamily="Space Mono, monospace" fontSize="8" fill="#FAF7F2" fillOpacity=".6" letterSpacing="1.2">OPERATOR · N-01 · STATUS: HONEST</text>
    </svg>
  );
}

function NeonIcons() {
  const s = { fill: 'none', stroke: '#FAF7F2', strokeWidth: 1, strokeLinecap: 'square' };
  return (
    <svg viewBox="0 0 480 80" width="480" height="80" aria-label="Neon icon set" style={{ background: '#0B0B0B' }}>
      {/* terminal cursor */}
      <g transform="translate(8,16)" {...s}>
        <rect x="2" y="0" width="56" height="48" />
        <text x="10" y="32" fontFamily="Space Mono, monospace" fontSize="18" fill="#FAF7F2">$_</text>
      </g>
      {/* signal */}
      <g transform="translate(80,16)" {...s}>
        <rect x="6" y="36" width="6" height="12" />
        <rect x="18" y="28" width="6" height="20" />
        <rect x="30" y="20" width="6" height="28" />
        <rect x="42" y="6" width="6" height="42" />
      </g>
      {/* arrow up-right */}
      <g transform="translate(152,16)" {...s}>
        <line x1="6" y1="42" x2="48" y2="6" stroke="#FF006E" strokeWidth="1.5"/>
        <polyline points="32,6 48,6 48,22" stroke="#FF006E" strokeWidth="1.5"/>
      </g>
      {/* warn */}
      <g transform="translate(224,16)" {...s}>
        <path d="M 28 4 L 52 48 L 4 48 Z" />
        <line x1="28" y1="20" x2="28" y2="34" />
        <circle cx="28" cy="42" r="1.5" fill="#FAF7F2" stroke="none"/>
      </g>
      {/* eye */}
      <g transform="translate(296,16)" {...s}>
        <path d="M 4 28 Q 28 4 52 28 Q 28 52 4 28 Z" />
        <circle cx="28" cy="28" r="6" />
        <circle cx="28" cy="28" r="2" fill="#FAF7F2" stroke="none"/>
      </g>
      {/* lock */}
      <g transform="translate(368,16)" {...s}>
        <rect x="10" y="22" width="36" height="28" />
        <path d="M 16 22 V 16 a 12 12 0 0 1 24 0 V 22" />
      </g>
    </svg>
  );
}

function NeonBadges() {
  return (
    <svg viewBox="0 0 480 140" width="480" height="140" aria-label="Neon badge style" style={{ background: '#0B0B0B' }}>
      {[0, 1, 2].map((i) => {
        const cx = 80 + i * 160;
        const labels = ['LV.01', 'LV.05', 'LV.10'][i];
        const sub = ['FIRST DEPLOY', 'STREAK · 5', 'OWNER'][i];
        return (
          <g key={i}>
            <rect x={cx - 48} y={16} width={96} height={80} fill="#0B0B0B" stroke="#FAF7F2" strokeWidth="1" />
            <rect x={cx - 44} y={20} width={88} height={72} fill="none" stroke="#FAF7F2" strokeOpacity=".25" />
            <text x={cx} y={56} textAnchor="middle" fontFamily="Space Mono, monospace" fontWeight="700" fontSize="20" fill="url(#neonG2)">{labels}</text>
            <text x={cx} y={78} textAnchor="middle" fontFamily="Space Mono, monospace" fontSize="9" fill="#FAF7F2" fillOpacity=".75" letterSpacing="1.6">{sub}</text>
            <line x1={cx - 36} y1={64} x2={cx + 36} y2={64} stroke="url(#neonG2)" strokeWidth="1.5" />
            <text x={cx} y={124} textAnchor="middle" fontFamily="Space Mono, monospace" fontSize="9" fill="#FAF7F2" fillOpacity=".5" letterSpacing="1.6">UNLOCK · {labels}</text>
          </g>
        );
      })}
      <defs>
        <linearGradient id="neonG2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FF006E" />
          <stop offset="50%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function NeonSpot() {
  // Wireframe pipeline diagram
  const s = { fill: 'none', stroke: '#FAF7F2', strokeWidth: 1, strokeOpacity: 0.7 };
  return (
    <svg viewBox="0 0 320 200" width="320" height="200" aria-label="Neon spot illustration" style={{ background: '#0B0B0B' }}>
      <g {...s}>
        {[...Array(8)].map((_, i) => <line key={'h' + i} x1="10" y1={20 + i * 22} x2="310" y2={20 + i * 22} strokeOpacity=".08" />)}
        {[...Array(12)].map((_, i) => <line key={'v' + i} x1={20 + i * 26} y1="10" x2={20 + i * 26} y2="190" strokeOpacity=".08" />)}
        <rect x="20" y="40" width="60" height="36" />
        <text x="50" y="62" textAnchor="middle" fontFamily="Space Mono, monospace" fontSize="9" fill="#FAF7F2">DISCOVERY</text>
        <rect x="120" y="40" width="60" height="36" />
        <text x="150" y="62" textAnchor="middle" fontFamily="Space Mono, monospace" fontSize="9" fill="#FAF7F2">DEMO</text>
        <rect x="220" y="40" width="60" height="36" />
        <text x="250" y="62" textAnchor="middle" fontFamily="Space Mono, monospace" fontSize="9" fill="#FAF7F2">CLOSE</text>
        <line x1="80" y1="58" x2="120" y2="58" stroke="#FF006E" strokeWidth="1.5"/>
        <line x1="180" y1="58" x2="220" y2="58" stroke="#FF006E" strokeWidth="1.5"/>
        <circle cx="50" cy="120" r="6" fill="#FF006E" stroke="none"/>
        <circle cx="50" cy="120" r="14" stroke="#FF006E" />
        <text x="50" y="156" textAnchor="middle" fontFamily="Space Mono, monospace" fontSize="9" fill="#FAF7F2" fillOpacity=".7">YOU ARE HERE</text>
      </g>
      <text x="14" y="194" fontFamily="Space Mono, monospace" fontSize="8" fill="#FAF7F2" fillOpacity=".5" letterSpacing="1.2">SPOT · N-04 · "PIPELINE"</text>
    </svg>
  );
}

function NeonOrnament() {
  return (
    <svg viewBox="0 0 480 40" width="480" height="40" aria-label="Neon UI ornament" style={{ background: '#0B0B0B' }}>
      <line x1="0" y1="20" x2="480" y2="20" stroke="#FAF7F2" strokeOpacity=".25" />
      <rect x="0" y="16" width="240" height="8" fill="url(#neonOrn)" />
      <defs>
        <linearGradient id="neonOrn" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FF006E" />
          <stop offset="50%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      {[0, 80, 160, 240, 320, 400].map((x) => (
        <rect key={x} x={x} y="26" width="2" height="8" fill="#FAF7F2" fillOpacity=".4" />
      ))}
    </svg>
  );
}

function DirectionNeon() {
  return (
    <Section id="dir-neon" kind="cream">
      <SpreadHeader n="02" name="Neon Operator" thesis="Modern SaaS command center. Black ground, white type, sharp neon signals. UI as art object — terminals, status lights, scan lines. High velocity, low decoration." />

      <div style={mk_layout.row}>
        <div style={mk_layout.col}>
          <SpecBlock label="01 · MASCOT TREATMENT" dark>
            <NeonMascot />
            <Body size={14} color="#6B6B6B" style={{ marginTop: 14 }}>
              No mascot — a <em>signal</em>. The operator is a blip on a reticule. Has
              two states: HONEST · LYING. Iris is the only color it ever wears.
            </Body>
          </SpecBlock>

          <SpecBlock label="04 · SPOT ILLUSTRATION" dark>
            <NeonSpot />
            <Body size={14} color="#6B6B6B" style={{ marginTop: 14 }}>
              Schematic wireframes on a faint grid — pipelines, comp plans, decision trees.
              The illustration <em>is</em> the diagram you'd actually use.
            </Body>
          </SpecBlock>
        </div>

        <div style={mk_layout.col}>
          <SpecBlock label="02 · ICON STYLE" dark>
            <NeonIcons />
            <Body size={14} color="#6B6B6B" style={{ marginTop: 14 }}>
              1px monoline, square caps. White on black by default; iris-tinted only when the
              icon represents a <em>signal</em> (alert, change, money). Never both.
            </Body>
          </SpecBlock>

          <SpecBlock label="03 · BADGE STYLE" dark>
            <NeonBadges />
            <Body size={14} color="#6B6B6B" style={{ marginTop: 14 }}>
              Tactical patches — square frames, monospace level codes, iris foil text.
              Reads like inventory, not flair.
            </Body>
          </SpecBlock>

          <SpecBlock label="05 · UI ORNAMENT" dark>
            <NeonOrnament />
            <Body size={14} color="#6B6B6B" style={{ marginTop: 14 }}>
              Iris meter bars, tick marks, blinking cursors. Section heads use [BRACKET]
              labels. Every divider has a job.
            </Body>
          </SpecBlock>
        </div>
      </div>

      <div style={{ ...mk_layout.row, marginTop: 32 }}>
        <SpecBlock label="06 · COLOR / MATERIAL" full>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <Swatch hex="#0B0B0B" name="Operator Black" meta="Ground" />
            <Swatch hex="#FAF7F2" name="Console Cream" meta="Type" />
            <Swatch hex="#FF006E" name="Signal Pink"   meta="Alert" />
            <Swatch hex="#38BDF8" name="Signal Cyan"   meta="Status" />
            <Swatch iris name="Iris (full)" meta="Earned moments" />
          </div>
          <Body size={14} color="#6B6B6B" style={{ marginTop: 14 }}>
            The iris gradient is unleashed here — but only on signals (CTA, unlocks,
            money-changes). Type stays cream-on-black. Mathematical, not glitter.
          </Body>
        </SpecBlock>

        <SpecBlock label="07 · WHERE IT WORKS" green>
          <ul style={mk_layout.ul}>
            <li>Product UI, dashboards, the LMS itself.</li>
            <li>Demos, screen-recordings, onboarding states.</li>
            <li>Pricing CTAs and "deploy" moments.</li>
          </ul>
        </SpecBlock>
        <SpecBlock label="08 · WHERE IT FAILS" red>
          <ul style={mk_layout.ul}>
            <li>Long-form reading — black ground exhausts at 1,200 words.</li>
            <li>Anything emotional. Michael's confessions die in monospace.</li>
            <li>Print. The neon is a screen-only conceit.</li>
          </ul>
        </SpecBlock>
      </div>
    </Section>
  );
}


/* ============================================================
   3 · TORTOISE-HARE DOCTRINE
   Mascot-led fable system. Disciplined velocity.
   ============================================================ */

function TortoiseHareMascot() {
  // Tortoise + hare composite — "The Two Become One"
  const s = { fill: 'none', stroke: '#1A1A1A', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' };
  return (
    <svg viewBox="0 0 300 240" width="240" height="192" aria-label="Tortoise-Hare composite">
      <rect width="300" height="240" fill="#FAF7F2" />
      <rect x="20" y="20" width="260" height="200" fill="none" stroke="#1A1A1A" strokeOpacity=".25" />
      <g {...s}>
        {/* tortoise body */}
        <ellipse cx="120" cy="160" rx="68" ry="36" fill="#F1ECE3" />
        <path d="M 60 160 Q 120 110 180 160" />
        <path d="M 80 158 L 80 132 M 100 156 L 100 124 M 120 156 L 120 122 M 140 156 L 140 124 M 160 158 L 160 132" strokeOpacity=".45" />
        {/* tortoise legs */}
        <ellipse cx="68" cy="194" rx="10" ry="6" fill="#F1ECE3" />
        <ellipse cx="172" cy="194" rx="10" ry="6" fill="#F1ECE3" />
        {/* tortoise head */}
        <ellipse cx="200" cy="146" rx="16" ry="12" fill="#F1ECE3" />
        <circle cx="208" cy="142" r="1.6" fill="#1A1A1A" stroke="none" />
        {/* hare ears strapped to tortoise's head — the doctrine */}
        <path d="M 192 130 Q 188 92 178 80 Q 192 86 200 122" fill="#F1ECE3" />
        <path d="M 208 130 Q 216 92 226 80 Q 218 92 216 122" fill="#F1ECE3" />
        <line x1="186" y1="134" x2="216" y2="134" stroke="#8B1A1A" strokeWidth="1.2" />
      </g>
      <text x="30" y="234" fontFamily="Space Mono, monospace" fontSize="8" fill="#6B6B6B" letterSpacing="1.2">LEPONEUS · TH-01 · "THE DOCTRINE"</text>
    </svg>
  );
}

function THIcons() {
  const s = { fill: 'none', stroke: '#1A1A1A', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' };
  return (
    <svg viewBox="0 0 480 80" width="480" height="80" aria-label="Tortoise-Hare icon set">
      {/* shell */}
      <g transform="translate(8,12)" {...s}>
        <path d="M 8 40 Q 32 12 56 40 Z" fill="#F1ECE3" />
        <path d="M 18 38 L 18 28 M 32 36 L 32 22 M 46 38 L 46 28" />
      </g>
      {/* hare ear */}
      <g transform="translate(80,12)" {...s}>
        <path d="M 24 56 Q 22 16 36 8 Q 32 30 32 56 Z" fill="#F1ECE3" />
      </g>
      {/* path / mile */}
      <g transform="translate(152,12)" {...s}>
        <path d="M 4 52 Q 28 28 56 56" />
        <circle cx="4" cy="52" r="2" fill="#1A1A1A" stroke="none" />
        <path d="M 56 56 l -8 -2 m 8 2 l -2 -8" />
      </g>
      {/* repetition */}
      <g transform="translate(224,12)" {...s}>
        <path d="M 8 16 a 24 18 0 1 0 0 32" />
        <path d="M 8 16 l 6 -6 m -6 6 l 6 6" />
      </g>
      {/* failure (cracked shell) */}
      <g transform="translate(296,12)" {...s}>
        <path d="M 8 44 Q 32 16 56 44 Z" fill="#F1ECE3" />
        <path d="M 26 44 L 22 30 L 30 32 L 24 22" stroke="#8B1A1A" />
      </g>
      {/* recovery (sprout from shell) */}
      <g transform="translate(368,12)" {...s}>
        <path d="M 8 48 Q 32 20 56 48 Z" fill="#F1ECE3" />
        <path d="M 32 22 L 32 6" />
        <path d="M 32 14 q -8 -4 -10 -12 q 8 4 10 8" fill="#8B1A1A" stroke="#8B1A1A" />
      </g>
    </svg>
  );
}

function THBadges() {
  return (
    <svg viewBox="0 0 480 140" width="480" height="140" aria-label="Tortoise-Hare badge style">
      {[0, 1, 2].map((i) => {
        const cx = 80 + i * 160;
        const titles = ['THE FIRST CRAWL', 'THE FALL', 'THE LONG MILE'][i];
        const meta = ['LESSON 01', 'LESSON 05', 'LESSON 10'][i];
        const glyph = i;
        return (
          <g key={i}>
            <rect x={cx - 56} y={10} width={112} height={88} fill="#FAF7F2" stroke="#1A1A1A" strokeWidth="1" />
            <rect x={cx - 52} y={14} width={104} height={80} fill="none" stroke="#1A1A1A" strokeOpacity=".25" />
            {/* glyph */}
            <g transform={`translate(${cx - 24}, 22)`}>
              {glyph === 0 && (
                <g fill="none" stroke="#1A1A1A" strokeWidth="1.5">
                  <path d="M 4 36 Q 24 12 44 36 Z" fill="#F1ECE3" />
                  <path d="M 14 34 L 14 26 M 24 32 L 24 22 M 34 34 L 34 26" />
                </g>
              )}
              {glyph === 1 && (
                <g fill="none" stroke="#1A1A1A" strokeWidth="1.5">
                  <path d="M 4 36 Q 24 12 44 36 Z" fill="#F1ECE3" />
                  <path d="M 18 36 L 14 22 L 22 24 L 16 14" stroke="#8B1A1A" />
                </g>
              )}
              {glyph === 2 && (
                <g fill="none" stroke="#1A1A1A" strokeWidth="1.5">
                  <path d="M 6 32 Q 24 16 42 32" />
                  <circle cx="6" cy="32" r="2" fill="#1A1A1A" stroke="none" />
                  <path d="M 42 32 l -6 -2 m 6 2 l -2 -6" />
                </g>
              )}
            </g>
            <text x={cx} y={78} textAnchor="middle" fontFamily="Barlow Condensed, sans-serif" fontWeight="700" fontSize="13" fill="#1A1A1A" letterSpacing="1.4">{titles}</text>
            <text x={cx} y={120} textAnchor="middle" fontFamily="Space Mono, monospace" fontSize="9" fill="#6B6B6B" letterSpacing="1.6">{meta}</text>
          </g>
        );
      })}
    </svg>
  );
}

function THSpot() {
  // The race scene — one mile of dotted track, tortoise mid-step, hare ahead
  const s = { fill: 'none', stroke: '#1A1A1A', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' };
  return (
    <svg viewBox="0 0 320 200" width="320" height="200" aria-label="Tortoise-Hare spot illustration">
      <rect x="0" y="0" width="320" height="200" fill="#FAF7F2" />
      <g {...s}>
        {/* track — dotted path */}
        <path d="M 20 130 Q 160 100 300 130" strokeDasharray="2 6" />
        {/* mile markers */}
        <line x1="80" y1="124" x2="80" y2="138" />
        <line x1="160" y1="118" x2="160" y2="132" />
        <line x1="240" y1="120" x2="240" y2="134" />
        {/* tortoise — back */}
        <ellipse cx="60" cy="138" rx="20" ry="10" fill="#F1ECE3" />
        <path d="M 40 138 Q 60 122 80 138" />
        <ellipse cx="86" cy="134" rx="6" ry="4" fill="#F1ECE3" />
        {/* hare — front, exhausted, lying down */}
        <ellipse cx="240" cy="138" rx="22" ry="6" fill="#F1ECE3" />
        <path d="M 232 134 Q 244 110 256 132" />
        <path d="M 218 138 q -6 -2 -8 -6" />
      </g>
      <text x="20" y="180" fontFamily="Caveat, cursive" fontSize="20" fill="#8B1A1A">"He sprinted. He slept. The shell did not."</text>
      <text x="20" y="194" fontFamily="Space Mono, monospace" fontSize="8" fill="#6B6B6B" letterSpacing="1.2">SPOT · TH-04 · "MILE 6"</text>
    </svg>
  );
}

function THOrnament() {
  return (
    <svg viewBox="0 0 480 40" width="480" height="40" aria-label="TH UI ornament">
      {/* dotted path divider */}
      <path d="M 0 20 Q 240 4 480 20" stroke="#1A1A1A" strokeWidth="1.5" strokeDasharray="2 6" fill="none" />
      <circle cx="0" cy="20" r="3" fill="#1A1A1A" />
      <path d="M 470 20 l -8 -3 m 8 3 l -8 3" stroke="#1A1A1A" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

function DirectionTH() {
  return (
    <Section id="dir-th" kind="cream">
      <SpreadHeader n="03" name="The Tortoise-Hare Doctrine" thesis="A character-led mythos. Two voices made literal as two animals — one fast, one durable — fused into one operator. Repetition, failure, recovery as the doctrine. Anti-corny because the mascot is honest, not cute." />

      <div style={mk_layout.row}>
        <div style={mk_layout.col}>
          <SpecBlock label="01 · MASCOT TREATMENT">
            <TortoiseHareMascot />
            <Body size={14} color="#6B6B6B" style={{ marginTop: 14 }}>
              <strong>Leponeus</strong> — a tortoise wearing strapped hare-ears.
              Single line-art figure. Never anthropomorphized. The strap is crimson.
              The animal is the operator: shell = pipeline, ears = ambition.
            </Body>
          </SpecBlock>

          <SpecBlock label="04 · SPOT ILLUSTRATION">
            <THSpot />
            <Body size={14} color="#6B6B6B" style={{ marginTop: 14 }}>
              Scenes from "the long mile" — track, mile markers, the slumped hare.
              Caveat-quoted captions in crimson tie back to Michael's voice.
            </Body>
          </SpecBlock>
        </div>

        <div style={mk_layout.col}>
          <SpecBlock label="02 · ICON STYLE">
            <THIcons />
            <Body size={14} color="#6B6B6B" style={{ marginTop: 14 }}>
              Hand-cut woodblock monoline — 1.5px round caps, slight imperfection.
              Six core glyphs (shell, ear, mile, repetition, failure, recovery)
              compose into every other icon by combination.
            </Body>
          </SpecBlock>

          <SpecBlock label="03 · BADGE STYLE">
            <THBadges />
            <Body size={14} color="#6B6B6B" style={{ marginTop: 14 }}>
              Story-named — "The First Crawl," "The Fall," "The Long Mile." The badge
              isn't level-based; it's narrative. Each one is a chapter you survived.
            </Body>
          </SpecBlock>

          <SpecBlock label="05 · UI ORNAMENT">
            <THOrnament />
            <Body size={14} color="#6B6B6B" style={{ marginTop: 14 }}>
              Dotted-track dividers with mile-arrow termini. Margin notes in Caveat
              (Michael's hand). Dog-eared corners on key cards.
            </Body>
          </SpecBlock>
        </div>
      </div>

      <div style={{ ...mk_layout.row, marginTop: 32 }}>
        <SpecBlock label="06 · COLOR / MATERIAL" full>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <Swatch hex="#FAF7F2" name="Cream"      meta="Page" />
            <Swatch hex="#F1ECE3" name="Shell"      meta="Mascot ground" />
            <Swatch hex="#1A1A1A" name="Ink"        meta="Line" />
            <Swatch hex="#8B1A1A" name="Strap"      meta="Crimson accent" />
            <Swatch iris name="Iris (rule only)" meta="Section seams" />
          </div>
          <Body size={14} color="#6B6B6B" style={{ marginTop: 14 }}>
            Inherits the canonical AESDR palette wholesale. Iris stays reserved (rules,
            CTAs, wordmark dot). The mascot adds <em>shell</em> as a single new tint —
            warmer than cream — used only for the animal's body.
          </Body>
        </SpecBlock>

        <SpecBlock label="07 · WHERE IT WORKS" green>
          <ul style={mk_layout.ul}>
            <li>The whole brand spine: lessons, badges, marketing, social.</li>
            <li>Anywhere Michael speaks — the fable holds his voice.</li>
            <li>Owning the meme — "the doctrine" becomes shorthand.</li>
          </ul>
        </SpecBlock>
        <SpecBlock label="08 · WHERE IT FAILS" red>
          <ul style={mk_layout.ul}>
            <li>Enterprise procurement decks — animals read as cute.</li>
            <li>If drawn too much. The mascot must be <em>scarce</em>.</li>
            <li>If illustrated by anyone but a single hand. Style drift kills it.</li>
          </ul>
        </SpecBlock>
      </div>
    </Section>
  );
}

/* ============================================================
   Helpers used by all three direction blocks
   ============================================================ */

function SpreadHeader({ n, name, thesis }) {
  return (
    <header style={{ marginBottom: 48, display: 'flex', gap: 36, alignItems: 'flex-end' }}>
      <Counter n={n} total="03" />
      <div style={{ flex: 1 }}>
        <Eyebrow style={{ display: 'block', marginBottom: 10 }}>EXPLORATION · DIRECTION {n}</Eyebrow>
        <H2>{name}</H2>
        <Body color="#6B6B6B" size={17} style={{ marginTop: 14, maxWidth: 720 }}>{thesis}</Body>
      </div>
    </header>
  );
}

function SpecBlock({ label, children, full = false, dark = false, green = false, red = false }) {
  const bg = dark ? '#0B0B0B' : '#FFFFFF';
  const border = dark ? '#0B0B0B' : '#E8E4DF';
  const accent = green ? '#1A1A1A' : red ? '#8B1A1A' : '#1A1A1A';
  return (
    <div style={{
      flex: full ? 2 : 1, padding: '20px 22px 24px',
      background: bg, border: `1px solid ${border}`, position: 'relative',
      display: 'flex', flexDirection: 'column', gap: 14,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Eyebrow color={accent}>{label}</Eyebrow>
        {(green || red) && (
          <span style={{
            font: "9px/1 'Space Mono', monospace", letterSpacing: '0.20em',
            textTransform: 'uppercase', color: '#FAF7F2',
            background: green ? '#1A1A1A' : '#8B1A1A',
            padding: '4px 8px',
          }}>{green ? '✓ STRONG' : '✗ WEAK'}</span>
        )}
      </div>
      {children}
    </div>
  );
}

function Swatch({ hex, iris, name, meta }) {
  return (
    <div style={{ minWidth: 96 }}>
      <div style={{
        width: 96, height: 64,
        background: iris
          ? 'linear-gradient(90deg,#FF006E,#FF6B00,#F59E0B,#10B981,#38BDF8,#8B5CF6,#FF006E)'
          : hex,
        border: '1px solid #E8E4DF',
      }} />
      <div style={{ marginTop: 8 }}>
        <div style={{ font: "700 12px/1.2 'Barlow Condensed', sans-serif", letterSpacing: '0.05em', color: '#1A1A1A', textTransform: 'uppercase' }}>{name}</div>
        <div style={{ font: "9px/1.2 'Space Mono', monospace", letterSpacing: '0.20em', color: '#6B6B6B', textTransform: 'uppercase', marginTop: 4 }}>{meta}{hex ? ' · ' + hex : ''}</div>
      </div>
    </div>
  );
}

const mk_layout = {
  row: { display: 'flex', gap: 24, alignItems: 'stretch', flexWrap: 'wrap' },
  col: { display: 'flex', flexDirection: 'column', gap: 24, flex: 1, minWidth: 460 },
  ul: { listStyle: 'none', padding: 0, margin: 0, font: "14px/1.65 'Source Serif 4', serif", color: '#1A1A1A', display: 'flex', flexDirection: 'column', gap: 8 },
};

Object.assign(window, { DirectionMarble, DirectionNeon, DirectionTH });
