#!/usr/bin/env node
/**
 * Inject unique content into all 36 lesson files:
 * 1. Propagate IIFE v2 from L1U1 prototype (collision-free _getAttest)
 * 2. Replace ATTEST array per file with unique phrases (zero repeats across app)
 * 3. Add conscience: property to every homework gate
 * 4. Replace sidebar conscience text with lesson-specific text
 * 5. Fix old time-slot references in SCHED arrays
 * 6. Update IIFE fallback conscience text
 *
 * Run: node scripts/inject-unique-content.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.join(process.cwd(), 'content/lessons/html');
const PROTOTYPE = path.join(ROOT, 'lesson-01', 'aesdr_course01_v1.html');

// ─── STEP 1: Extract IIFE from prototype ───
const protoHTML = fs.readFileSync(PROTOTYPE, 'utf-8');
const iifeStartMarker = '/*  AESDR Accountability Gates v2';
const iifeEndMarker = '})(window.AESDR);';
const iifeStart = protoHTML.indexOf(iifeStartMarker);
const iifeEnd = protoHTML.indexOf(iifeEndMarker, iifeStart) + iifeEndMarker.length;
if (iifeStart === -1 || iifeEnd === -1) { console.error('IIFE not found in prototype'); process.exit(1); }
const NEW_IIFE = protoHTML.substring(iifeStart, iifeEnd);

// ─── STEP 2: Generate 540+ unique attestation phrases ───
// All phrases follow "[prefix] because [reason]" — the "because " split drives iris shimmer
const PREFIXES = [
  "I did this",
  "I completed this",
  "I wrote this",
  "I showed up for this",
  "I pushed through this",
  "I committed to this",
  "I dug into this",
  "I faced this head on",
  "I told the truth here",
  "I took this seriously",
  "I went deep on this",
  "I stayed honest here",
  "I owned this moment",
  "I invested in this",
  "I put real thought into this",
  "I challenged myself here",
  "I refused to fake this",
  "I followed through on this",
  "I made this count",
  "I gave this my real attention",
  "I sat with the discomfort of this",
  "I built something real here",
  "I proved something to myself here",
  "I chose substance over shortcuts here",
  "I wrestled with this honestly",
  "I put my name on this",
  "I did the work that matters here",
  "I held myself accountable here",
  "I went all in on this",
  "I didn\u0027t phone this in",
  "I was real with myself here",
  "I earned this checkmark",
  "I put in the effort here",
  "I confronted the hard part here",
  "I kept it real here",
  "I treated this like it matters",
  "I honored the process here",
  "I brought my best here",
  "I leaned into the work here",
  "I respected my own time here",
];

const REASONS = [
  "growth doesn\u0027t happen by accident",
  "what I do when no one checks matters more than what I do when they\u0027re watching",
  "my reputation is built one honest action at a time",
  "shortcuts only cheat the person in the mirror",
  "real professionals do the uncomfortable work first",
  "this is how trust gets built \u2014 one kept promise at a time",
  "excellence isn\u0027t a single act, it\u0027s a habit I\u0027m building right now",
  "saying I care means nothing if I don\u0027t act like it",
  "the difference between good and great is follow-through",
  "I\u0027m investing in the version of me that wins",
  "no one successful ever half-assed the fundamentals",
  "my future self needs me to be honest right now",
  "talking about growth is easy \u2014 doing it is the point",
  "I refuse to be the person who shows up unprepared",
  "accountability starts with what I write when no one reads it",
  "the small moments define who I actually am",
  "I\u0027m building discipline, not just completing a task",
  "the people who make it do the work others skip",
  "being real with myself is the only way forward",
  "I don\u0027t want to be the person who clicks through and learns nothing",
  "my word matters even when it\u0027s just between me and this page",
  "effort compounds \u2014 every honest answer builds on the last",
  "the gap between knowing and doing is exactly this kind of work",
  "I\u0027m not here to perform productivity \u2014 I\u0027m here to actually grow",
  "this is where the real ones separate from the pretenders",
  "integrity is doing the right thing when it\u0027s easier not to",
  "I know the difference between completing a task and actually learning",
  "mediocrity is a choice I\u0027m actively refusing right now",
  "my career is built on what I do in moments like this",
  "I owe it to the people who bet on me to take this seriously",
  "half-effort produces half-results and I\u0027m done with half",
  "the best version of tomorrow starts with what I write today",
  "complacency kills careers faster than failure ever could",
  "I\u0027m choosing to be the person who does the hard thing",
  "this is the work that separates thinkers from doers",
  "I know that consistency is the only real competitive advantage",
];

// Generate all unique phrases by cross-product
const ALL_PHRASES = [];
for (const prefix of PREFIXES) {
  for (const reason of REASONS) {
    ALL_PHRASES.push(prefix + ' because ' + reason);
  }
}
// Deterministic shuffle using seed
function seededShuffle(arr, seed) {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const SHUFFLED = seededShuffle(ALL_PHRASES, 42);
console.log(`Generated ${SHUFFLED.length} unique attest phrases`);

// ─── STEP 3: Conscience texts per lesson (keyed by dir/file pattern) ───
// These appear in two places: (A) sidebar paragraph, (B) homework gate conscience: property
const CONSCIENCE = {
  'lesson-01/aesdr_course01_v1': 'Structure is the difference between surviving and flaming out. Every answer you write here is a promise to the person who hired you that you take Day 1 seriously.',
  'lesson-01/aesdr_course01_2_v1': 'Camaraderie isn\u0027t built by hoping it happens. Every answer here is a concrete step toward earning trust from the people you work with every single day.',
  'lesson-01/aesdr_course01_3_v1': 'Coaching defines whether your SDR thrives or quietly drowns. What you write here is the difference between being a manager and being a leader.',
  'lesson-02/aesdr_course02_1_v1': 'Silos don\u0027t announce themselves \u2014 they silently destroy pipeline. Every answer you write here exposes a gap you can actually fix this week.',
  'lesson-02/aesdr_course02_2_v1': 'Your workspace is either helping you sell or quietly sabotaging you. What you commit to here determines whether your environment works for you or against you.',
  'lesson-02/aesdr_course02_3_v1': 'Ego kills more deals than bad product ever will. Every honest answer here is a step toward the kind of partnership that actually produces revenue.',
  'lesson-03/aesdr_course03_1_v1': 'Performance pitfalls don\u0027t fix themselves \u2014 they compound. What you identify here is the first step to breaking a pattern before it breaks your pipeline.',
  'lesson-03/aesdr_course03_2_v1': 'Survival in SaaS sales isn\u0027t dramatic \u2014 it\u0027s daily. Every answer here builds the habits that keep you off the layoff list.',
  'lesson-03/aesdr_course03_3_v1': 'Managing up isn\u0027t optional \u2014 it\u0027s a survival skill. What you write here determines whether you control your career or let someone else control it for you.',
  'lesson-04/aesdr_course04_1_v1': 'SDR managers can make or break your trajectory. Every answer here is preparation for navigating the politics that nobody warns you about.',
  'lesson-04/aesdr_course04_2_v1': 'Culture isn\u0027t the ping pong table \u2014 it\u0027s how decisions get made when things get hard. What you write here reveals whether you actually understand the environment you\u0027re in.',
  'lesson-04/aesdr_course04_3_v1': 'Async work either sets you free or lets you disappear. Every answer here is a commitment to being visible and valuable without anyone watching over your shoulder.',
  'lesson-05/aesdr_course05_1_v1': 'A playbook is only as good as the person running it. What you write here proves you\u0027re not just reading plays \u2014 you\u0027re internalizing them.',
  'lesson-05/aesdr_course05_2_v1': 'Execution separates SDRs who get promoted from SDRs who get managed out. Every answer here is a rep that builds the muscle memory winners rely on.',
  'lesson-05/aesdr_course05_3_v1': 'Being irreplaceable isn\u0027t about working more hours \u2014 it\u0027s about being the person no one can afford to lose. What you write here defines your value.',
  'lesson-06/aesdr_course06_1_v1': 'The playbook gets you started \u2014 what you do beyond it is what gets you promoted. Every answer here pushes you past the safe and into the strategic.',
  'lesson-06/aesdr_course06_2_v1': 'Networking isn\u0027t collecting LinkedIn connections \u2014 it\u0027s building relationships that open doors you didn\u0027t know existed. Every answer here is a real connection plan.',
  'lesson-06/aesdr_course06_3_v1': 'Knowing just enough to be dangerous is the sweet spot between ignorance and analysis paralysis. What you write here proves you can operate in the gray.',
  'lesson-07/aesdr_course07_1_v1': 'Prospecting isn\u0027t just the SDR\u0027s job \u2014 and pretending it is will cost you pipeline. Every answer here confronts a comfortable lie.',
  'lesson-07/aesdr_course07_2_v1': 'Self-sourced meetings are the only meetings you fully control. What you commit to here determines whether you own your pipeline or rent someone else\u0027s.',
  'lesson-07/aesdr_course07_3_v1': 'The question isn\u0027t whether SaaS is worth it \u2014 it\u0027s whether you\u0027re building the version of yourself that makes it worth it. Every answer here matters.',
  'lesson-08/aesdr_course08_1_v1': 'The 30% Rule exposes the math most salespeople ignore. What you write here forces you to confront reality instead of hiding behind optimism.',
  'lesson-08/aesdr_course08_2_v1': 'Potential is the most expensive lie in sales. Every answer here strips away the story you\u0027ve been telling yourself and replaces it with what\u0027s actually happening.',
  'lesson-08/aesdr_course08_3_v1': 'The hardest question in sales is whether you\u0027re the problem. What you write here requires a level of honesty most people avoid their entire career.',
  'lesson-09/aesdr_course09_1_v1': 'Salesforce isn\u0027t the enemy \u2014 your relationship with it is. Every answer here builds the CRM discipline that separates professionals from amateurs.',
  'lesson-09/aesdr_course09_2_v1': 'Slack can be your greatest tool or your biggest distraction. What you commit to here determines which side you land on.',
  'lesson-09/aesdr_course09_3_v1': 'Tools don\u0027t close deals \u2014 people who master their tools do. Every answer here is a step toward fluency instead of fumbling.',
  'lesson-10/aesdr_course10_1_v1': 'Commission math is the math no one teaches you until it\u0027s too late. What you write here proves you understand the real economics of your paycheck.',
  'lesson-10/aesdr_course10_2_v1': 'Quotas are designed to push you \u2014 not define you. Every honest answer here separates your self-worth from a number someone else picked.',
  'lesson-10/aesdr_course10_3_v1': 'Feast-or-famine is the emotional rollercoaster nobody prepares you for. What you write here builds the emotional discipline to survive it.',
  'lesson-11/aesdr_course11_1_v1': 'Sober selling is about being present when everyone else is performing. Every answer here commits you to showing up as yourself, not a character.',
  'lesson-11/aesdr_course11_2_v1': 'Conference culture can accelerate your career or derail it in a single night. What you write here is your plan to make it count without losing yourself.',
  'lesson-11/aesdr_course11_3_v1': 'Professional presence isn\u0027t about looking the part \u2014 it\u0027s about being the part. Every answer here builds the reputation that follows you between companies.',
  'lesson-12/aesdr_course12_1_v1': 'Relationships in SaaS outlast every job, every quota, every company. What you write here invests in the network that will carry your entire career.',
  'lesson-12/aesdr_course12_2_v1': 'The home office is either your fortress or your prison. Every answer here is a concrete decision about which one you\u0027re building.',
  'lesson-12/aesdr_course12_3_v1': 'Staying single-threaded on your craft is the most counterintuitive career advice that actually works. What you write here proves you understand why focus wins.',
};

// ─── STEP 4: Process all files ───
const lessonDirs = fs.readdirSync(ROOT).filter(d => d.startsWith('lesson-')).sort();
let updated = 0;
let skipped = [];
let phraseIdx = 0; // Global index into SHUFFLED — ensures no repeats across files

for (const dir of lessonDirs) {
  const dirPath = path.join(ROOT, dir);
  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.html')).sort();

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    let html = fs.readFileSync(filePath, 'utf-8');
    let changes = 0;
    const fileKey = dir + '/' + file.replace('.html', '');
    const conscience = CONSCIENCE[fileKey];

    // ── 4a. Replace IIFE (propagate from prototype) ──
    if (filePath !== PROTOTYPE) {
      let oldStart = html.indexOf('/*  AESDR Accountability Gates v2');
      if (oldStart === -1) oldStart = html.indexOf('/*  AESDR Accountability Gates v1');
      if (oldStart !== -1) {
        const oldEnd = html.indexOf('})(window.AESDR);', oldStart);
        if (oldEnd !== -1) {
          html = html.substring(0, oldStart) + NEW_IIFE + html.substring(oldEnd + '})(window.AESDR);'.length);
          changes++;
        }
      }
    }

    // ── 4b. Replace ATTEST array with file-specific unique phrases ──
    const attestStart = html.indexOf('var ATTEST = [');
    if (attestStart !== -1) {
      // Find the matching ] by counting brackets from the opening [
      const bracketOpen = html.indexOf('[', attestStart);
      let depth = 0;
      let attestEnd = -1;
      for (let ci = bracketOpen; ci < html.length; ci++) {
        if (html[ci] === '[') depth++;
        if (html[ci] === ']') { depth--; if (depth === 0) { attestEnd = ci + 1; break; } }
      }
      // Include trailing semicolon if present
      if (attestEnd !== -1 && html[attestEnd] === ';') attestEnd++;

      if (attestEnd !== -1) {
        // Assign 15 unique phrases from the shuffled pool
        const fileAttest = SHUFFLED.slice(phraseIdx, phraseIdx + 15);
        phraseIdx += 15;

        const newAttest = 'var ATTEST = [\n' +
          fileAttest.map(p => '    "' + p.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"').join(',\n') +
          '\n  ];';
        html = html.substring(0, attestStart) + newAttest + html.substring(attestEnd);
        changes++;
      }
    }

    // ── 4c. Add conscience: to homework gates (if not already present) ──
    if (conscience && !html.includes("conscience:")) {
      const hwRe = /type:\s*'homework'\s*,/g;
      let hwMatch;
      while ((hwMatch = hwRe.exec(html)) !== null) {
        const insertPos = hwMatch.index + hwMatch[0].length;
        const conscienceStr = "\n    conscience: '" + conscience.replace(/'/g, "\\'") + "',";
        html = html.substring(0, insertPos) + conscienceStr + html.substring(insertPos);
        hwRe.lastIndex = insertPos + conscienceStr.length;
        changes++;
      }
    }

    // ── 4d. Replace sidebar conscience text ──
    // Old pattern: <p style="font-family:var(--serif);font-size:13px;font-style:italic;...iris...">You can treat this like just another course...
    // New pattern: <p style="font-family:'Inter',...;font-weight:700;...">lesson-specific text</p>
    if (conscience) {
      const sidebarRe = /<p style="[^"]*iris[^"]*">[^<]*You can treat this like just another course[^<]*<\/p>/;
      if (sidebarRe.test(html)) {
        html = html.replace(sidebarRe,
          `<p style="font-family:'Inter',-apple-system,sans-serif;font-size:13px;font-weight:700;line-height:1.65;background:var(--iris);background-size:200% 100%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:iris 3s linear infinite">${conscience}</p>`);
        changes++;
      }
    }

    // ── 4e. Fix old font-style:italic on sidebar text (if sidebar was already partially changed) ──
    // Also catch the old pattern with var(--serif) + italic
    const oldSidebarStyle = /(<p style="font-family:var\(--serif\);font-size:13px;)font-style:italic;(line-height)/;
    if (oldSidebarStyle.test(html)) {
      html = html.replace(oldSidebarStyle, "$1font-weight:700;$2");
      changes++;
    }

    // ── 4f. Add screen position save in go() if not already present ──
    if (!html.includes('aesdr_screen_')) {
      html = html.replace(
        /function go\(n\)\{\s*if\(window\.parent!==window\)/,
        'function go(n){\n  try{localStorage.setItem(\'aesdr_screen_\'+location.pathname.replace(/[^a-z0-9]/gi,\'_\'),n)}catch(e){}\n  if(window.parent!==window)'
      );
      changes++;
    }

    // ── 4g. Add AESDR.restoreState() before build calls in init() ──
    if (!html.includes('AESDR.restoreState()')) {
      html = html.replace(
        /(\s*\/\/ Build UI components[^\n]*\n)/,
        '\n  // Restore saved gate state from localStorage\n  AESDR.restoreState();\n\n$1'
      );
      changes++;
    }

    // ── 4h. Add screen position restore before render() at end of init ──
    if (!html.includes('_savedScreen')) {
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

    // ── 4f. Validate JS syntax ──
    const scripts = [];
    const re = /<script>([\s\S]*?)<\/script>/g;
    let m;
    while ((m = re.exec(html)) !== null) scripts.push(m[1]);
    let valid = true;
    for (const script of scripts) {
      try { new Function(script); } catch(e) {
        valid = false;
        console.log(`\u2717 ${dir}/${file} — JS error: ${e.message}`);
        break;
      }
    }
    if (!valid) { skipped.push(`${dir}/${file} — syntax error`); continue; }

    fs.writeFileSync(filePath, html, 'utf-8');
    updated++;
    console.log(`\u2713 ${dir}/${file} (${changes} changes)`);
  }
}

console.log(`\nDone: ${updated} files updated.`);
console.log(`Total unique attest phrases assigned: ${phraseIdx}`);
if (skipped.length) {
  console.log(`Skipped ${skipped.length}:`);
  skipped.forEach(s => console.log(`  ${s}`));
}

// Verify no duplicate phrases across files
const allAssigned = SHUFFLED.slice(0, phraseIdx);
const uniqueCheck = new Set(allAssigned);
if (uniqueCheck.size !== allAssigned.length) {
  console.error('WARNING: Duplicate phrases detected!');
} else {
  console.log(`\u2713 All ${allAssigned.length} assigned phrases are unique across entire app`);
}
