#!/usr/bin/env node
/**
 * Propagate MVI Standards changes from L1U1 prototype to all other lesson files.
 *
 * Changes:
 * 1. Google Fonts link: Add Inter, drop Cormorant Garamond & Barlow Condensed
 * 2. CSS variables: --serif and --cond → Inter
 * 3. .gate-conscience-text CSS: bold 16px Inter, not italic serif
 * 4. Add new CSS: attestation checkbox, editable gate-done, edit button
 * 5. Replace entire AESDR IIFE with v2 (attestation, editable gates)
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.join(process.cwd(), 'content/lessons/html');
const PROTOTYPE = path.join(ROOT, 'lesson-01', 'aesdr_course01_v1.html');

// Extract the new IIFE from the prototype
const protoHTML = fs.readFileSync(PROTOTYPE, 'utf-8');

// Extract new IIFE: from "/*  AESDR Accountability Gates v2" to "})(window.AESDR);"
const iifeStartMarker = '/*  AESDR Accountability Gates v2';
const iifeEndMarker = '})(window.AESDR);';
const iifeStart = protoHTML.indexOf(iifeStartMarker);
const iifeEnd = protoHTML.indexOf(iifeEndMarker, iifeStart) + iifeEndMarker.length;
if (iifeStart === -1 || iifeEnd === -1) {
  console.error('Could not find IIFE in prototype');
  process.exit(1);
}
const NEW_IIFE = protoHTML.substring(iifeStart, iifeEnd);

// Extract new CSS blocks added after .gate-conscience-text
const attestCSSStart = protoHTML.indexOf('/* ── Attestation checkbox ── */');
const attestCSSEnd = protoHTML.indexOf('.gate-edit-btn:hover {', attestCSSStart);
// Go to end of .gate-edit-btn:hover block
const attestCSSEndFull = protoHTML.indexOf('}', attestCSSEnd + 20) + 1;
const NEW_CSS = protoHTML.substring(attestCSSStart, attestCSSEndFull);

// New Google Fonts link
const NEW_FONTS = `https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Inter:wght@400;500;600;700&family=DM+Mono:ital,wght@0,300;0,400;1,300&display=swap`;

// Process all lesson files except the prototype
const lessonDirs = fs.readdirSync(ROOT).filter(d => d.startsWith('lesson-'));
let updated = 0;
let skipped = [];

for (const dir of lessonDirs) {
  const dirPath = path.join(ROOT, dir);
  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.html'));

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    if (filePath === PROTOTYPE) continue; // skip prototype

    let html = fs.readFileSync(filePath, 'utf-8');
    let changes = 0;

    // 1. Google Fonts link — replace old with new
    const oldFontsRe = /https:\/\/fonts\.googleapis\.com\/css2\?family=Abril\+Fatface&family=Cormorant\+Garamond[^"]+/;
    if (oldFontsRe.test(html)) {
      html = html.replace(oldFontsRe, NEW_FONTS);
      changes++;
    }

    // 2. CSS variables
    const oldSerif = /--serif:\s*'Cormorant Garamond',\s*Georgia,\s*serif;/;
    if (oldSerif.test(html)) {
      html = html.replace(oldSerif, "--serif:   'Inter', -apple-system, sans-serif;");
      changes++;
    }
    const oldCond = /--cond:\s*'Barlow Condensed',\s*sans-serif;/;
    if (oldCond.test(html)) {
      html = html.replace(oldCond, "--cond:    'Inter', -apple-system, sans-serif;");
      changes++;
    }

    // 3. .gate-conscience-text CSS — replace old with new
    const oldConscienceCSS = /\.gate-conscience-text\s*\{[^}]*font-style:\s*italic[^}]*\}/;
    if (oldConscienceCSS.test(html)) {
      html = html.replace(oldConscienceCSS,
`.gate-conscience-text {
  font-family: 'Inter', -apple-system, sans-serif;
  font-size: 16px;
  font-weight: 700;
  font-style: normal;
  line-height: 1.55;
  background: var(--iris);
  background-size: 200% 100%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: iris 3s linear infinite;
}`);
      changes++;
    }

    // 4. Add new CSS blocks (attestation checkbox, edit button) before closing </style> of gate CSS
    // Insert after .gate-conscience-text block, before the </style> that follows it
    if (!html.includes('gate-attest')) {
      // Find the </style> that follows .gate-conscience-text
      const conscIdx = html.indexOf('.gate-conscience-text');
      if (conscIdx !== -1) {
        const styleCloseAfterConsc = html.indexOf('</style>', conscIdx);
        if (styleCloseAfterConsc !== -1) {
          html = html.substring(0, styleCloseAfterConsc) +
            '\n' + NEW_CSS + '\n\n' +
            html.substring(styleCloseAfterConsc);
          changes++;
        }
      }
    }

    // 5. Replace entire IIFE
    const oldIIFEStart = html.indexOf('/*  AESDR Accountability Gates v1');
    if (oldIIFEStart !== -1) {
      const oldIIFEEnd = html.indexOf('})(window.AESDR);', oldIIFEStart);
      if (oldIIFEEnd !== -1) {
        const endPos = oldIIFEEnd + '})(window.AESDR);'.length;
        html = html.substring(0, oldIIFEStart) + NEW_IIFE + html.substring(endPos);
        changes++;
      }
    }

    if (changes === 0) {
      skipped.push(`${dir}/${file} — no matching patterns found`);
      continue;
    }

    // Validate JS syntax before writing
    const scripts = [];
    const re = /<script>([\s\S]*?)<\/script>/g;
    let m;
    while ((m = re.exec(html)) !== null) scripts.push(m[1]);

    let valid = true;
    for (const script of scripts) {
      try {
        new Function(script);
      } catch (e) {
        valid = false;
        console.log(`✗ ${dir}/${file} — JS syntax error: ${e.message}`);
        break;
      }
    }

    if (!valid) {
      skipped.push(`${dir}/${file} — syntax error after transform`);
      continue;
    }

    fs.writeFileSync(filePath, html, 'utf-8');
    updated++;
    console.log(`✓ ${dir}/${file} (${changes} changes)`);
  }
}

console.log(`\nDone: ${updated} files updated.`);
if (skipped.length) {
  console.log(`Skipped ${skipped.length}:`);
  skipped.forEach(s => console.log(`  ${s}`));
}
