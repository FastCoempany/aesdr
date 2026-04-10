#!/usr/bin/env node
/**
 * Propagate localStorage persistence + "Continue" → "Submit" fix to all lesson files.
 *
 * Changes:
 * 1. Replace IIFE (has _persistState, _restoreState, restoreState)
 * 2. Add screen position save in go() function
 * 3. Add restoreState() + screen restore in init() before render()
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.join(process.cwd(), 'content/lessons/html');
const PROTOTYPE = path.join(ROOT, 'lesson-01', 'aesdr_course01_v1.html');

const protoHTML = fs.readFileSync(PROTOTYPE, 'utf-8');

// Extract new IIFE
const iifeStartMarker = '/*  AESDR Accountability Gates v2';
const iifeEndMarker = '})(window.AESDR);';
const iifeStart = protoHTML.indexOf(iifeStartMarker);
const iifeEnd = protoHTML.indexOf(iifeEndMarker, iifeStart) + iifeEndMarker.length;
const NEW_IIFE = protoHTML.substring(iifeStart, iifeEnd);

const lessonDirs = fs.readdirSync(ROOT).filter(d => d.startsWith('lesson-'));
let updated = 0;
let skipped = [];

for (const dir of lessonDirs) {
  const dirPath = path.join(ROOT, dir);
  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.html'));

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    if (filePath === PROTOTYPE) continue;

    let html = fs.readFileSync(filePath, 'utf-8');
    let changes = 0;

    // 1. Replace IIFE
    const oldIIFEStart = html.indexOf('/*  AESDR Accountability Gates v2');
    if (oldIIFEStart !== -1) {
      const oldIIFEEnd = html.indexOf('})(window.AESDR);', oldIIFEStart);
      if (oldIIFEEnd !== -1) {
        const endPos = oldIIFEEnd + '})(window.AESDR);'.length;
        html = html.substring(0, oldIIFEStart) + NEW_IIFE + html.substring(endPos);
        changes++;
      }
    }

    // 2. Add screen save in go() if not already present
    if (!html.includes('aesdr_screen_')) {
      html = html.replace(
        /function go\(n\)\{\s*if\(window\.parent!==window\)\{try\{window\.parent\.postMessage/,
        'function go(n){\n  try{localStorage.setItem(\'aesdr_screen_\'+location.pathname.replace(/[^a-z0-9]/gi,\'_\'),n)}catch(e){}\n  if(window.parent!==window){try{window.parent.postMessage'
      );
      changes++;
    }

    // 3. Add AESDR.restoreState() + screen restore before render() in init()
    // Find the pattern: gates registered, then build calls, then render()
    if (!html.includes('AESDR.restoreState()')) {
      // Add restoreState before build calls
      html = html.replace(
        /(\s*\/\/ Build UI components[^\n]*\n)/,
        '\n  // Restore saved gate state from localStorage\n  AESDR.restoreState();\n\n$1'
      );
      changes++;

      // Add screen restore before render() at end of init
      // Find the render() call at end of init — it's the one right before the closing }
      // Pattern: build calls ... then render();
      html = html.replace(
        /(\s*)(render\(\);\s*\n\})/,
        '$1// Restore saved screen position\n$1var _savedScreen = 0;\n$1try { _savedScreen = parseInt(localStorage.getItem(\'aesdr_screen_\' + location.pathname.replace(/[^a-z0-9]/gi, \'_\'))) || 0; } catch(e) {}\n$1if (_savedScreen > 0 && _savedScreen < TOTAL) { cur = _savedScreen; document.getElementById(\'s0\').classList.remove(\'active\'); document.getElementById(\'s\'+cur).classList.add(\'active\'); }\n\n$1$2'
      );
      changes++;
    }

    if (changes === 0) {
      skipped.push(`${dir}/${file} — no changes needed`);
      continue;
    }

    // Validate JS syntax
    const scripts = [];
    const re = /<script>([\s\S]*?)<\/script>/g;
    let m;
    while ((m = re.exec(html)) !== null) scripts.push(m[1]);
    let valid = true;
    for (const script of scripts) {
      try { new Function(script); } catch(e) {
        valid = false;
        console.log(`✗ ${dir}/${file} — JS error: ${e.message}`);
        break;
      }
    }
    if (!valid) { skipped.push(`${dir}/${file} — syntax error`); continue; }

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
