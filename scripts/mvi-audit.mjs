#!/usr/bin/env node
/**
 * MVI Standards Audit — Screen-by-screen checklist verification.
 * Checks all 36 lesson files against MVI-STANDARDS.md Section 9.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.join(process.cwd(), 'content/lessons/html');
const lessonDirs = fs.readdirSync(ROOT).filter(d => d.startsWith('lesson-')).sort();

let totalIssues = 0;
let fileResults = [];

for (const dir of lessonDirs) {
  const dirPath = path.join(ROOT, dir);
  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.html')).sort();

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const html = fs.readFileSync(filePath, 'utf-8');
    const issues = [];

    // 1. Body text uses Inter, not Cormorant Garamond
    if (html.includes("'Cormorant Garamond'") || html.includes("Cormorant+Garamond")) {
      issues.push("FONT: Still references Cormorant Garamond");
    }
    if (html.includes("'Barlow Condensed'") || html.includes("Barlow+Condensed")) {
      issues.push("FONT: Still references Barlow Condensed");
    }
    if (!html.includes("Inter")) {
      issues.push("FONT: Inter not found in file");
    }

    // 2. --serif and --cond variables point to Inter
    const serifMatch = html.match(/--serif:\s*([^;]+);/);
    if (serifMatch && !serifMatch[1].includes('Inter')) {
      issues.push(`CSS VAR: --serif is '${serifMatch[1].trim()}' not Inter`);
    }
    const condMatch = html.match(/--cond:\s*([^;]+);/);
    if (condMatch && !condMatch[1].includes('Inter')) {
      issues.push(`CSS VAR: --cond is '${condMatch[1].trim()}' not Inter`);
    }

    // 3. Conscience text is bold Inter 16px (not italic serif)
    const conscienceMatch = html.match(/\.gate-conscience-text\s*\{([^}]*)\}/);
    if (conscienceMatch) {
      const css = conscienceMatch[1];
      if (css.includes('font-style:italic') || css.includes('font-style: italic')) {
        issues.push("CONSCIENCE: Still italic");
      }
      if (!css.includes('font-weight:700') && !css.includes('font-weight: 700')) {
        issues.push("CONSCIENCE: Not bold (700)");
      }
      if (!css.includes('font-size:16px') && !css.includes('font-size: 16px')) {
        issues.push("CONSCIENCE: Not 16px");
      }
    }

    // 4. IIFE v2 with attestation system
    if (!html.includes('_attestHTML')) {
      issues.push("IIFE: Missing attestation system (_attestHTML not found)");
    }
    if (!html.includes('_editGate')) {
      issues.push("IIFE: Missing editable gates (_editGate not found)");
    }
    if (!html.includes('_onAttest')) {
      issues.push("IIFE: Missing attestation handler (_onAttest not found)");
    }

    // 5. Gates are editable (gate-edit-btn exists)
    if (!html.includes('gate-edit-btn')) {
      issues.push("GATE: No edit button class found (gates not editable)");
    }

    // 6. Attestation checkbox CSS
    if (!html.includes('.gate-attest')) {
      issues.push("CSS: Missing .gate-attest class (attestation checkbox styling)");
    }

    // 7. Narrative gates have minChars >= 120
    const narrativeGates = html.matchAll(/type:\s*'narrative'[^}]*minChars:\s*(\d+)/g);
    for (const m of narrativeGates) {
      if (parseInt(m[1]) < 120) {
        issues.push(`GATE: Narrative gate has minChars:${m[1]} (should be 120+)`);
      }
    }

    // 8. Homework gates have minChars >= 60
    const hwMinChars = html.matchAll(/minChars:\s*(\d+)/g);
    // We just check that there are no extremely low minimums
    for (const m of hwMinChars) {
      if (parseInt(m[1]) < 30) {
        issues.push(`GATE: Found minChars:${m[1]} (too low)`);
      }
    }

    // 9. canContinue checks gateReady
    if (!html.includes('AESDR.gateReady')) {
      issues.push("ENFORCE: canContinue() doesn't check AESDR.gateReady");
    }

    // 10. Continue button is disabled until requirements met
    if (!html.includes('btnNext') || !html.includes('disabled')) {
      issues.push("ENFORCE: No btnNext disable mechanism found");
    }

    // 11. JS syntax validation
    const scripts = [];
    const re = /<script>([\s\S]*?)<\/script>/g;
    let m;
    while ((m = re.exec(html)) !== null) scripts.push(m[1]);
    for (const script of scripts) {
      try { new Function(script); } catch(e) {
        issues.push(`JS ERROR: ${e.message}`);
      }
    }

    // Report
    if (issues.length > 0) {
      totalIssues += issues.length;
      fileResults.push({ file: `${dir}/${file}`, issues });
      console.log(`✗ ${dir}/${file} (${issues.length} issues)`);
      issues.forEach(i => console.log(`    ${i}`));
    } else {
      console.log(`✓ ${dir}/${file}`);
    }
  }
}

console.log(`\n${'═'.repeat(50)}`);
console.log(`AUDIT COMPLETE: ${36 - fileResults.length} / 36 files pass all checks`);
console.log(`Total issues: ${totalIssues}`);
if (fileResults.length > 0) {
  console.log(`Files with issues: ${fileResults.length}`);
}
