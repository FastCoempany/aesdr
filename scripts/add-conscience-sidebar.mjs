#!/usr/bin/env node
/**
 * Add the iris shimmer conscience text to the sidebar of every lesson HTML file.
 * Inserts just before </aside> if not already present.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.join(process.cwd(), 'content/lessons/html');
const lessonDirs = fs.readdirSync(ROOT).filter(d => d.startsWith('lesson-'));

const CONSCIENCE_HTML = `
  <div style="margin-top:32px;padding:16px 0;border-top:1px solid var(--line)">
    <p style="font-family:var(--serif);font-size:13px;font-style:italic;line-height:1.65;background:var(--iris);background-size:200% 100%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:iris 3s linear infinite">You can treat this like just another course if you want. Or you can not lie and complete this survival checklist legitimately. What you do when no one is watching makes all the difference in the end.</p>
  </div>
`;

const MARKER = 'What you do when no one is watching makes all the difference';
let updated = 0;

for (const dir of lessonDirs) {
  const dirPath = path.join(ROOT, dir);
  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.html'));

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    let html = fs.readFileSync(filePath, 'utf-8');

    // Skip if sidebar already has the conscience text (check in the sidebar HTML, not JS)
    const sidebarStart = html.indexOf('<aside class="sidebar">');
    const sidebarEnd = html.indexOf('</aside>', sidebarStart);
    if (sidebarStart === -1 || sidebarEnd === -1) {
      console.log(`⚠ ${dir}/${file} — no sidebar found`);
      continue;
    }

    const sidebarContent = html.substring(sidebarStart, sidebarEnd);
    if (sidebarContent.includes(MARKER)) {
      console.log(`– ${dir}/${file} (already has conscience text)`);
      continue;
    }

    // Insert conscience HTML just before </aside>
    html = html.substring(0, sidebarEnd) + CONSCIENCE_HTML + html.substring(sidebarEnd);
    fs.writeFileSync(filePath, html, 'utf-8');
    updated++;
    console.log(`✓ ${dir}/${file}`);
  }
}

console.log(`\nDone: ${updated} files updated with sidebar conscience text.`);
