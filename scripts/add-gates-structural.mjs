#!/usr/bin/env node
/**
 * Add structural gating to all 36 lesson HTML files:
 * 1. Add gate containers at the end of narrative screens (s1, s3)
 * 2. Add gate container on homework screen for homework gate
 * 3. No prompt content — that gets added per-lesson by agents
 *
 * This script only adds the DOM containers (div#gateN) if they don't exist.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.join(process.cwd(), 'content/lessons/html');
const lessonDirs = fs.readdirSync(ROOT).filter(d => d.startsWith('lesson-'));
let updated = 0;

for (const dir of lessonDirs) {
  const dirPath = path.join(ROOT, dir);
  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.html'));

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    let html = fs.readFileSync(filePath, 'utf-8');
    let changed = false;

    // Add gate1 container at end of screen s1 (before </div> that closes s1)
    if (!html.includes('id="gate1"')) {
      // Find the closing of s1 div — it's the </div> just before the s2 screen div
      const s2Start = html.indexOf('<div class="screen" id="s2">');
      if (s2Start !== -1) {
        // Find the </div> immediately before s2 (with possible whitespace)
        const beforeS2 = html.substring(0, s2Start);
        const lastClose = beforeS2.lastIndexOf('</div>');
        if (lastClose !== -1) {
          // Insert gate container before that last </div>
          html = beforeS2.substring(0, lastClose) +
            '    <!-- Narrative Gate -->\n      <div id="gate1" data-gate-screen="1"></div>\n  ' +
            beforeS2.substring(lastClose) +
            html.substring(s2Start);
          changed = true;
        }
      }
    }

    // Add gate3 container at end of screen s3 (before </div> that closes s3)
    if (!html.includes('id="gate3"')) {
      const s4Start = html.indexOf('<div class="screen" id="s4">');
      if (s4Start !== -1) {
        const beforeS4 = html.substring(0, s4Start);
        const lastClose = beforeS4.lastIndexOf('</div>');
        if (lastClose !== -1) {
          html = beforeS4.substring(0, lastClose) +
            '    <!-- Narrative Gate -->\n      <div id="gate3" data-gate-screen="3"></div>\n  ' +
            beforeS4.substring(lastClose) +
            html.substring(s4Start);
          changed = true;
        }
      }
    }

    if (changed) {
      fs.writeFileSync(filePath, html, 'utf-8');
      updated++;
      console.log(`✓ ${dir}/${file}`);
    } else {
      console.log(`– ${dir}/${file} (no changes needed or already has gates)`);
    }
  }
}

console.log(`\nDone: ${updated} files with structural gate containers added.`);
