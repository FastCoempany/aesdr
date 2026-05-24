#!/usr/bin/env node
/**
 * Replace the inlined gate CSS + JS in all lesson HTML files
 * with the latest versions from _gates.css and _gates.js.
 *
 * ⚠️  SAFETY NOTE — read before running.
 *
 * The shared _gates.js / _gates.css at content/lessons/html/ are
 * "v1." Every lesson HTML inlines a "v2 — MVI Standards" copy that
 * has diverged: attestation checkboxes, localStorage persistence,
 * different postMessage shape, additional CSS classes. The shared
 * files have been dead code since the v2 inline migration.
 *
 * Running this script as-is would:
 *  • Skip JS replacement on every lesson (JS_START still says "v1",
 *    inlined JS says "v2" — indexOf returns -1)
 *  • Successfully overwrite the v2 CSS in every lesson with the v1
 *    shared CSS — DOWNGRADING attestation/homework styles to v1
 *
 * That's a one-command production-content regression. To prevent it,
 * the script now bails out unless the shared _gates files have been
 * brought back up to v2 parity AND the operator passes --i-have-
 * verified-shared-is-v2 to acknowledge they checked.
 *
 * Flagged 2026-05-23 from the lesson-interactive code review.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.join(process.cwd(), 'content/lessons/html');
const newCSS = fs.readFileSync(path.join(ROOT, '_gates.css'), 'utf-8');
const newJS  = fs.readFileSync(path.join(ROOT, '_gates.js'),  'utf-8');

// Safety check — if the shared files still say "v1" anywhere in their
// version markers, the operator hasn't reconciled the shared/inlined
// drift. Refuse to run.
const sharedCssIsV1 = newCSS.includes('AESDR Accountability Gates — Styles v1');
const sharedJsIsV1 = newJS.includes('AESDR Accountability Gates v1');
const force = process.argv.includes('--i-have-verified-shared-is-v2');
if ((sharedCssIsV1 || sharedJsIsV1) && !force) {
  console.error(`
ERROR: shared _gates files at content/lessons/html/ are still v1.

  _gates.css v1 marker present: ${sharedCssIsV1}
  _gates.js  v1 marker present: ${sharedJsIsV1}

Every lesson HTML in production runs the v2 inlined copy (attestation
checkboxes, localStorage persistence, different postMessage shape).
Propagating the v1 shared files would DOWNGRADE the lesson UX.

To run anyway (you've manually brought the shared files to v2 parity
and want to ship them out), pass: --i-have-verified-shared-is-v2

To fix this properly: bring _gates.css and _gates.js up to the v2
inline standard, change the version markers to "v2," then re-run.
`);
  process.exit(1);
}

// Patterns to match inlined blocks. The CSS starts with the comment header,
// the JS starts with the comment header. Both end at the closing </style> or </script> tag.
const CSS_START = '/* ══════════════════════════════════════════\n   AESDR Accountability Gates — Styles v1';
const CSS_END = '\n</style>';
const JS_START = '/*  AESDR Accountability Gates v2 — MVI Standards';
const JS_END = '\n})(window.AESDR);';

const lessonDirs = fs.readdirSync(ROOT).filter(d => d.startsWith('lesson-'));
let updated = 0;

for (const dir of lessonDirs) {
  const dirPath = path.join(ROOT, dir);
  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.html'));

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    let html = fs.readFileSync(filePath, 'utf-8');
    let changed = false;

    // Replace CSS block
    const cssStart = html.indexOf(CSS_START);
    if (cssStart !== -1) {
      const cssEnd = html.indexOf(CSS_END, cssStart);
      if (cssEnd !== -1) {
        const before = html.substring(0, cssStart);
        const after = html.substring(cssEnd + CSS_END.length);
        html = before + newCSS + '\n</style>' + after;
        changed = true;
      }
    }

    // Replace JS block
    const jsStart = html.indexOf(JS_START);
    if (jsStart !== -1) {
      const jsEnd = html.indexOf(JS_END, jsStart);
      if (jsEnd !== -1) {
        const before = html.substring(0, jsStart);
        const after = html.substring(jsEnd + JS_END.length);
        html = before + newJS + after;
        changed = true;
      }
    }

    if (changed) {
      fs.writeFileSync(filePath, html, 'utf-8');
      updated++;
      console.log(`✓ ${dir}/${file}`);
    } else {
      console.log(`⚠ ${dir}/${file} — no match found`);
    }
  }
}

console.log(`\nDone: ${updated} files updated.`);
