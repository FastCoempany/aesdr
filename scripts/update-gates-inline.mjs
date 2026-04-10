#!/usr/bin/env node
/**
 * Replace the inlined gate CSS + JS in all lesson HTML files
 * with the latest versions from _gates.css and _gates.js.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.join(process.cwd(), 'content/lessons/html');
const newCSS = fs.readFileSync(path.join(ROOT, '_gates.css'), 'utf-8');
const newJS  = fs.readFileSync(path.join(ROOT, '_gates.js'),  'utf-8');

// Patterns to match inlined blocks. The CSS starts with the comment header,
// the JS starts with the comment header. Both end at the closing </style> or </script> tag.
const CSS_START = '/* ══════════════════════════════════════════\n   AESDR Accountability Gates — Styles v1';
const CSS_END = '\n</style>';
const JS_START = '/*  AESDR Accountability Gates v1';
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
