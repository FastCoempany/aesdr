#!/usr/bin/env node
// AUDIT: one-shot systemic patch for the 36 lesson HTML engines.
// Addresses R4-LH-1/3/4/6/7. Idempotent: re-running is a no-op.
// This script is a development tool, not shipped runtime code.
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(process.cwd(), "content", "lessons", "html");

const files = [];
for (const dir of readdirSync(ROOT)) {
  const lessonDir = join(ROOT, dir);
  let entries;
  try { entries = readdirSync(lessonDir); } catch { continue; }
  for (const f of entries) {
    if (f.endsWith(".html")) files.push(join(lessonDir, f));
  }
}
files.sort();

const report = [];

for (const file of files) {
  let src = readFileSync(file, "utf-8");
  const original = src;
  const applied = [];

  // ── T1 (R4-LH-3): normalize ?role in the head detection script ──
  const T1_FROM =
    "  var role = p.get('role') || 'sdr';\n" +
    "  document.documentElement.setAttribute('data-role', role);";
  const T1_TO =
    "  var role = (p.get('role') || 'sdr').toLowerCase();\n" +
    "  if (role !== 'ae' && role !== 'sdr') role = 'sdr';\n" +
    "  document.documentElement.setAttribute('data-role', role);";
  if (src.includes(T1_FROM)) { src = src.replace(T1_FROM, T1_TO); applied.push("role-normalize"); }

  // ── T2 (R4-LH-4): role in the gate-state localStorage key ──
  const T2_FROM =
    "  var _storageKey = 'aesdr_gate_' + location.pathname.replace(/[^a-z0-9]/gi, '_');";
  const T2_TO =
    "  var _roleKey = (document.documentElement.getAttribute('data-role') || 'sdr');\n" +
    "  var _storageKey = 'aesdr_gate_' + _roleKey + '_' + location.pathname.replace(/[^a-z0-9]/gi, '_');";
  if (src.includes(T2_FROM)) { src = src.replace(T2_FROM, T2_TO); applied.push("gate-key-role"); }

  // ── T5 (R4-LH-6): merge (don't clobber) _lessonExtra in restoreFromParent ──
  const T5_FROM = "    if (data._extra) _lessonExtra = data._extra;";
  const T5_TO =
    "    if (data._extra) { for (var _ek in data._extra) { _lessonExtra[_ek] = data._extra[_ek]; } }";
  if (src.includes(T5_FROM)) { src = src.replace(T5_FROM, T5_TO); applied.push("extra-merge"); }

  // ── T6 (R4-LH-1): re-hydrate quiz/exercise on aesdr:restore, not just gate text.
  //    The IIFE listener can't see the per-file vars, so it calls a
  //    window-scoped hydrator defined in the main script (T7). ──
  const T6_FROM =
    "      A.restoreFromParent(e.data.stateData);\n" +
    "      if (typeof window.render === 'function') window.render();";
  const T6_TO =
    "      A.restoreFromParent(e.data.stateData);\n" +
    "      if (typeof window.__aesdrHydrate === 'function') window.__aesdrHydrate();\n" +
    "      else if (typeof window.render === 'function') window.render();";
  if (src.includes(T6_FROM)) { src = src.replace(T6_FROM, T6_TO); applied.push("restore-rehydrate-hook"); }

  // ── T3 (R4-LH-4): role in the bespoke exercise-state key (35 files) ──
  const T3_FROM =
    "function _exStateKey(){return 'aesdr_exercise_state_' + location.pathname.replace(/[^a-z0-9]/gi,'_');}";
  const T3_TO =
    "function _exStateKey(){return 'aesdr_exercise_state_' + (document.documentElement.getAttribute('data-role')||'sdr') + '_' + location.pathname.replace(/[^a-z0-9]/gi,'_');}";
  if (src.includes(T3_FROM)) { src = src.replace(T3_FROM, T3_TO); applied.push("exercise-key-role"); }

  // ── T4a (R4-LH-4): role in the screen key (init read) ──
  const T4A_FROM =
    "  try { _savedScreen = parseInt(localStorage.getItem('aesdr_screen_' + location.pathname.replace(/[^a-z0-9]/gi, '_'))) || 0; } catch(e) {}";
  const T4A_TO =
    "  try { _savedScreen = parseInt(localStorage.getItem('aesdr_screen_' + (document.documentElement.getAttribute('data-role')||'sdr') + '_' + location.pathname.replace(/[^a-z0-9]/gi, '_'))) || 0; } catch(e) {}";
  if (src.includes(T4A_FROM)) { src = src.replace(T4A_FROM, T4A_TO); applied.push("screen-key-role-read"); }

  // ── T4b (R4-LH-4): role in the screen key (go write) ──
  const T4B_FROM =
    "  try{localStorage.setItem('aesdr_screen_'+location.pathname.replace(/[^a-z0-9]/gi,'_'),n)}catch(e){}";
  const T4B_TO =
    "  try{localStorage.setItem('aesdr_screen_'+(document.documentElement.getAttribute('data-role')||'sdr')+'_'+location.pathname.replace(/[^a-z0-9]/gi,'_'),n)}catch(e){}";
  if (src.includes(T4B_FROM)) { src = src.replace(T4B_FROM, T4B_TO); applied.push("screen-key-role-write"); }

  // ── T7 (R4-LH-1 + R4-LH-7): in init(), (a) read ?screen as a fallback when
  //    localStorage has none, (b) fire aesdr:complete if resuming directly
  //    onto the completion screen, and (c) expose a window-scoped hydrator the
  //    restore listener (T6) re-invokes so cross-device restore re-applies
  //    quiz/exercise/screen state, not just gate text. ──
  const T7_FROM =
    "  try { _savedScreen = parseInt(localStorage.getItem('aesdr_screen_' + (document.documentElement.getAttribute('data-role')||'sdr') + '_' + location.pathname.replace(/[^a-z0-9]/gi, '_'))) || 0; } catch(e) {}\n" +
    "\n" +
    "\n" +
    "  if (_savedScreen > 0 && _savedScreen < TOTAL) { cur = _savedScreen; document.getElementById('s0').classList.remove('active'); document.getElementById('s'+cur).classList.add('active'); }\n" +
    "  if(_savedScreen>maxReached)maxReached=_savedScreen;";
  const T7_TO =
    "  try { _savedScreen = parseInt(localStorage.getItem('aesdr_screen_' + (document.documentElement.getAttribute('data-role')||'sdr') + '_' + location.pathname.replace(/[^a-z0-9]/gi, '_'))) || 0; } catch(e) {}\n" +
    "  // R4-LH-1: fall back to the ?screen the host sends (cross-device restore\n" +
    "  // lands the learner where they left off instead of on screen 0).\n" +
    "  if (_savedScreen <= 0) { try { var _qsScreen = parseInt(new URLSearchParams(location.search).get('screen')); if (_qsScreen > 0) _savedScreen = _qsScreen; } catch(e) {} }\n" +
    "\n" +
    "  if (_savedScreen > 0 && _savedScreen < TOTAL) { cur = _savedScreen; document.getElementById('s0').classList.remove('active'); document.getElementById('s'+cur).classList.add('active'); }\n" +
    "  if (_savedScreen >= TOTAL - 1) { cur = TOTAL - 1; document.getElementById('s0').classList.remove('active'); var _sc = document.getElementById('s'+cur); if (_sc) _sc.classList.add('active'); }\n" +
    "  if(_savedScreen>maxReached)maxReached=_savedScreen;\n" +
    "  // R4-LH-7: if we resumed directly onto the completion screen, the\n" +
    "  // host never saw aesdr:complete fire from go() — re-fire it now.\n" +
    "  if (cur === TOTAL - 1 && window.parent !== window) { try { window.parent.postMessage({type:'aesdr:complete'},'*'); } catch(e) {} }";
  if (src.includes(T7_FROM)) { src = src.replace(T7_FROM, T7_TO); applied.push("init-screen-fallback+complete"); }

  // ── T8 (R4-LH-1): define the window-scoped re-hydrator. Inserted right
  //    before the final `render();` in init(). Re-reads quiz from _lessonExtra,
  //    re-applies the chosen-option classes, re-runs the bespoke exercise
  //    restore, then renders. Only the 35 quiz-bearing files have the quiz
  //    vars; the outlier (lesson-01 unit 1) gets a render-only hydrator. ──
  const hasQuiz = src.includes("var _qExtra=AESDR.getExtra('quiz')");
  const T8_ANCHOR = "  render();\n}\nfunction goSafe(n)";
  if (src.includes(T8_ANCHOR) && !src.includes("window.__aesdrHydrate =")) {
    const hydrator = hasQuiz
      ? "  // R4-LH-1: re-hydrate quiz + exercise UI from restored state.\n" +
        "  window.__aesdrHydrate = function(){\n" +
        "    try {\n" +
        "      var _q = AESDR.getExtra('quiz') || {};\n" +
        "      if (_q.ans) qAns = _q.ans;\n" +
        "      if (_q.submitted) qSubmitted = _q.submitted;\n" +
        "      if (_q.passed) qPassed = _q.passed;\n" +
        "      if (Object.keys(qAns).length > 0) {\n" +
        "        var _ws = qSubmitted; qSubmitted = false;\n" +
        "        for (var _qi in qAns) { try { var _el = document.getElementById('qo'+_qi+'_'+qAns[_qi]); if (_el) _el.classList.add('chosen'); } catch(e) {} }\n" +
        "        if (_ws) { try { submitQuiz(); } catch(e) {} }\n" +
        "      }\n" +
        "      try { _restoreExerciseState(); } catch(e) {}\n" +
        "    } catch(e) {}\n" +
        "    try { render(); } catch(e) {}\n" +
        "  };\n"
      : "  // R4-LH-1: this unit has no quiz/exercise UI; re-render on restore.\n" +
        "  window.__aesdrHydrate = function(){ try { render(); } catch(e) {} };\n";
    src = src.replace(T8_ANCHOR, hydrator + T8_ANCHOR);
    applied.push("define-hydrator");
  }

  if (src !== original) {
    writeFileSync(file, src, "utf-8");
  }
  report.push({ file: file.replace(process.cwd() + "/", ""), applied });
}

let totalChanged = 0;
for (const r of report) {
  if (r.applied.length) totalChanged++;
  console.log(`${r.applied.length ? "✓" : "·"} ${r.file} [${r.applied.join(", ") || "no-op"}]`);
}
console.log(`\n${totalChanged}/${report.length} files modified.`);
