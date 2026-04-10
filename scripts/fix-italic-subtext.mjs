#!/usr/bin/env node
/**
 * Fix italic instruction/subtext CSS across all lesson files.
 * Per MVI standards, subtext should be Inter 400 14px (not italic).
 * Only actual quote text (.fd-quote, .bb-prev-body) keeps italic.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.join(process.cwd(), 'content/lessons/html');
const lessonDirs = fs.readdirSync(ROOT).filter(d => d.startsWith('lesson-'));

// CSS class patterns that should lose italic (instruction text, subtext, taglines)
// These match: .something-instr, .something-sub, .cv-tagline, .comp-sub, .blame-q-txt
// But NOT: .fd-quote, .bb-prev-body (actual quotes keep italic)
const KEEP_ITALIC = ['fd-quote', 'bb-prev-body', 'bb-slot'];

let totalFixes = 0;

for (const dir of lessonDirs) {
  const dirPath = path.join(ROOT, dir);
  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.html'));

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    let html = fs.readFileSync(filePath, 'utf-8');
    let fixes = 0;

    // Match CSS rules with font-style:italic that are instruction/subtext
    // Pattern: .class-name{...font-style:italic...}
    html = html.replace(/(\.[\w-]+)\{([^}]*font-style:\s*italic[^}]*)\}/g, (match, className, body) => {
      const cls = className.replace('.', '');
      // Skip classes that should keep italic
      if (KEEP_ITALIC.some(k => cls === k)) return match;
      // Only fix if it looks like subtext/instruction (has font-size:14px or similar small text)
      if (!/font-size:\s*1[2-5]px/.test(body)) return match;
      // Replace italic with normal
      const newBody = body.replace(/font-style:\s*italic/, 'font-style:normal');
      if (newBody !== body) {
        fixes++;
        return className + '{' + newBody + '}';
      }
      return match;
    });

    if (fixes > 0) {
      fs.writeFileSync(filePath, html, 'utf-8');
      totalFixes += fixes;
      console.log(`✓ ${dir}/${file} (${fixes} italic→normal)`);
    }
  }
}

console.log(`\nDone: ${totalFixes} CSS rules fixed.`);
