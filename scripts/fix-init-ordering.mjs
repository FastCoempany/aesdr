#!/usr/bin/env node
/**
 * Fix init() function ordering in all lesson HTML files.
 * Moves AESDR.gate() registrations BEFORE build function calls,
 * and wraps build function calls in try-catch blocks.
 *
 * This prevents a runtime error in any build function from
 * killing gate registration, which causes blank gate screens.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.join(process.cwd(), 'content/lessons/html');
const lessonDirs = fs.readdirSync(ROOT).filter(d => d.startsWith('lesson-'));

let totalFixed = 0;
let skipped = [];

for (const dir of lessonDirs) {
  const dirPath = path.join(ROOT, dir);
  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.html'));

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const html = fs.readFileSync(filePath, 'utf-8');
    const lines = html.split('\n');

    // Find init() function
    const initIdx = lines.findIndex(l => /^\s*function\s+init\s*\(\s*\)\s*\{/.test(l));
    if (initIdx === -1) {
      skipped.push(`${dir}/${file} — no init() found`);
      continue;
    }

    // Find the end of init() by tracking brace depth
    let depth = 0;
    let initEndIdx = -1;
    for (let i = initIdx; i < lines.length; i++) {
      for (const ch of lines[i]) {
        if (ch === '{') depth++;
        if (ch === '}') depth--;
      }
      if (depth === 0) {
        initEndIdx = i;
        break;
      }
    }
    if (initEndIdx === -1) {
      skipped.push(`${dir}/${file} — couldn't find init() closing brace`);
      continue;
    }

    // Extract init body lines (between opening { and closing })
    const bodyLines = lines.slice(initIdx + 1, initEndIdx);

    // Check if already fixed (gates come before build functions)
    const firstGateLine = bodyLines.findIndex(l => /AESDR\.gate\(/.test(l));
    const firstBuildLine = bodyLines.findIndex(l => /^\s*(build\w+|render\w+)\s*\(/.test(l) && !/render\(\)/.test(l) && !/renderGate/.test(l));
    const hasTryCatch = bodyLines.some(l => /try\s*\{.*build/.test(l) || /try\s*\{\s*build/.test(l));

    if (hasTryCatch) {
      console.log(`– ${dir}/${file} (already has try-catch, skipping)`);
      continue;
    }

    if (firstGateLine === -1) {
      skipped.push(`${dir}/${file} — no AESDR.gate() calls found`);
      continue;
    }

    // Categorize each body line
    const categories = bodyLines.map((line, i) => {
      const trimmed = line.trim();
      if (trimmed === '' || trimmed.startsWith('//')) return 'comment';
      if (trimmed === 'render();') return 'render';
      if (/^AESDR\.gate\(/.test(trimmed)) return 'gate';
      if (/^var\s+_role\s*=/.test(trimmed)) return 'gate-dep';
      if (/^var\s+_hw(AE|SDR)\s*=/.test(trimmed)) return 'gate-dep';
      if (/^(build\w+|render\w+)\s*\(/.test(trimmed) && !/^render\(\)/.test(trimmed)) return 'build';
      // Multi-line: continuation of previous category
      return null; // will be resolved below
    });

    // Resolve nulls: continuation lines inherit the previous non-null category
    let lastCat = 'comment';
    for (let i = 0; i < categories.length; i++) {
      if (categories[i] === null) {
        categories[i] = lastCat;
      } else {
        lastCat = categories[i];
      }
    }

    // Handle single-line pattern: "buildSilo(); buildBlame(); buildSeq(); buildCls(); buildQuiz();"
    // These have multiple calls on one line, categorized as 'build'
    const singleLineBuildIdx = bodyLines.findIndex((l, i) => {
      const trimmed = l.trim();
      return categories[i] === 'build' && (trimmed.match(/;/g) || []).length >= 3;
    });

    // Also handle comment lines between builds and gates
    // A comment right before a gate section should stay with gates
    for (let i = categories.length - 1; i >= 0; i--) {
      if (categories[i] === 'comment' && i + 1 < categories.length) {
        const nextNonComment = categories.slice(i + 1).find(c => c !== 'comment');
        if (nextNonComment === 'gate' || nextNonComment === 'gate-dep') {
          categories[i] = 'gate-comment';
        }
      }
    }

    // Collect gate section (gate-dep, gate-comment, gate lines)
    const gateSection = [];
    const buildSection = [];
    const renderSection = [];
    const otherSection = [];

    for (let i = 0; i < bodyLines.length; i++) {
      const cat = categories[i];
      if (cat === 'gate' || cat === 'gate-dep' || cat === 'gate-comment') {
        gateSection.push(bodyLines[i]);
      } else if (cat === 'build') {
        buildSection.push(bodyLines[i]);
      } else if (cat === 'render') {
        renderSection.push(bodyLines[i]);
      } else {
        // Comments at the top (before builds) are build-related
        if (buildSection.length === 0 && gateSection.length === 0) {
          buildSection.push(bodyLines[i]);
        } else {
          otherSection.push(bodyLines[i]);
        }
      }
    }

    // Wrap build calls in try-catch
    const wrappedBuildLines = [];
    for (const line of buildSection) {
      const trimmed = line.trim();
      if (trimmed === '' || trimmed.startsWith('//')) {
        // Keep comments as-is
        wrappedBuildLines.push(line);
        continue;
      }

      // Check if this is a multi-call single line: "buildX(); buildY(); buildZ();"
      const calls = trimmed.split(';').map(s => s.trim()).filter(s => s.length > 0);
      if (calls.length > 1) {
        // Wrap each call individually
        for (const call of calls) {
          const funcName = call.match(/^(\w+)\(/)?.[1] || 'fn';
          wrappedBuildLines.push(`  try { ${call}; } catch(e) { console.error('${funcName}:', e); }`);
        }
      } else if (calls.length === 1) {
        const funcName = calls[0].match(/^(\w+)\(/)?.[1] || 'fn';
        wrappedBuildLines.push(`  try { ${calls[0]}; } catch(e) { console.error('${funcName}:', e); }`);
      }
    }

    // Rebuild init() body: gates first, then try-catch builds, then render
    const newBody = [
      '  // Register gates FIRST so they\'re always available for rendering',
      ...gateSection,
      '',
      '  // Build UI components — wrapped so a failure can\'t prevent gate rendering',
      ...wrappedBuildLines,
      '',
      ...renderSection
    ];

    // Replace init body in the file
    const newLines = [
      ...lines.slice(0, initIdx + 1),
      ...newBody,
      ...lines.slice(initEndIdx)
    ];

    const newHtml = newLines.join('\n');

    // Validate JS syntax
    const scripts = [];
    const re = /<script>([\s\S]*?)<\/script>/g;
    let m;
    while ((m = re.exec(newHtml)) !== null) scripts.push(m[1]);

    let valid = true;
    for (const script of scripts) {
      try {
        new Function(script);
      } catch (e) {
        valid = false;
        console.log(`✗ ${dir}/${file} — JS syntax error after transform: ${e.message}`);
        break;
      }
    }

    if (!valid) {
      skipped.push(`${dir}/${file} — syntax error after transform`);
      continue;
    }

    fs.writeFileSync(filePath, newHtml, 'utf-8');
    totalFixed++;
    console.log(`✓ ${dir}/${file}`);
  }
}

console.log(`\nDone: ${totalFixed} files fixed.`);
if (skipped.length) {
  console.log(`Skipped ${skipped.length}:`);
  skipped.forEach(s => console.log(`  ${s}`));
}
