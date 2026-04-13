/**
 * Propagate exercise score persistence to all lesson HTML files.
 *
 * Each unit has interactive exercises (silo, blame, seq, cls) that track
 * correctness in JS variables but never persist them via AESDR.setExtra().
 *
 * This script adds a _saveExerciseScores() function after _saveQuizState()
 * in every lesson file, and calls it from the exercise completion handlers.
 *
 * Run: node scripts/propagate-exercise-scores.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_ROOT = path.join(__dirname, "..", "content", "lessons", "html");

// The function definition to inject after _saveQuizState
const EXERCISE_SAVE_FN = `
function _saveExerciseScores(){
  var scores = {};
  if(typeof siloCount!=='undefined'&&typeof SILO_CARDS!=='undefined') scores.silo={correct:siloCount,total:SILO_CARDS.length};
  if(typeof blameCount!=='undefined'&&typeof BLAME_ITEMS!=='undefined') scores.blame={correct:blameCount,total:BLAME_ITEMS.length};
  if(typeof seqDone!=='undefined'&&typeof SEQ_STEPS!=='undefined') scores.seq={correct:Object.keys(seqDone).length,total:SEQ_STEPS.length};
  if(typeof clsCount!=='undefined'&&typeof CLS_ITEMS!=='undefined') scores.cls={correct:clsCount,total:CLS_ITEMS.length};
  if(Object.keys(scores).length>0) AESDR.setExtra('exercises',scores);
}`;

let modified = 0;
let skipped = 0;

// Walk all lesson directories
const lessonDirs = fs.readdirSync(CONTENT_ROOT).filter((d) =>
  d.startsWith("lesson-") && fs.statSync(path.join(CONTENT_ROOT, d)).isDirectory()
);

for (const dir of lessonDirs) {
  const dirPath = path.join(CONTENT_ROOT, dir);
  const files = fs.readdirSync(dirPath).filter((f) => f.endsWith(".html"));

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    let content = fs.readFileSync(filePath, "utf-8");

    // Skip if already has _saveExerciseScores
    if (content.includes("_saveExerciseScores")) {
      skipped++;
      continue;
    }

    // Skip if no quiz save (unit 1 of lesson 1 doesn't have exercises)
    if (!content.includes("function _saveQuizState")) {
      skipped++;
      continue;
    }

    // 1. Inject the function definition after _saveQuizState definition
    const quizSaveRegex = /function _saveQuizState\(\)\{[^}]+\}/;
    const match = content.match(quizSaveRegex);
    if (!match) {
      console.warn(`  [WARN] Could not find _saveQuizState in ${dir}/${file}`);
      skipped++;
      continue;
    }

    content = content.replace(
      quizSaveRegex,
      match[0] + EXERCISE_SAVE_FN
    );

    // 2. Add _saveExerciseScores() calls alongside _saveQuizState() calls
    //    Also add it after exercise completion checks (when siloCount/blameCount etc. reach target)
    //    The simplest approach: call it from the handleNext/navigation function
    //    which already calls _saveQuizState when advancing screens.

    // Find the handleNext or nav function that calls _saveQuizState()
    // and add _saveExerciseScores() right after each _saveQuizState() call
    content = content.replace(
      /_saveQuizState\(\);?/g,
      (match) => match + "_saveExerciseScores();"
    );

    // 3. Also save exercise scores when exercises complete (the go() / gating checks)
    //    Add to the gating function that checks exercise completion
    //    Look for the pattern where siloCount is checked against target
    //    and add a save call there too

    // Add save call after silo completion
    content = content.replace(
      /(siloDone\[\w+\]=true;siloCount\+\+;)/g,
      "$1_saveExerciseScores();"
    );

    // Add save call after blame completion
    content = content.replace(
      /(blameState\[\w+\]='correct';blameCount\+\+;)/g,
      "$1_saveExerciseScores();"
    );

    // Add save call after seq completion
    content = content.replace(
      /(seqDone\[\w+\]=true;)/g,
      "$1_saveExerciseScores();"
    );

    // Add save call after cls completion
    content = content.replace(
      /(clsDone\[\w+\]=true;clsCount\+\+;)/g,
      "$1_saveExerciseScores();"
    );

    fs.writeFileSync(filePath, content, "utf-8");
    modified++;
    console.log(`  [OK] ${dir}/${file}`);
  }
}

console.log(`\nDone. Modified: ${modified}, Skipped: ${skipped}`);
