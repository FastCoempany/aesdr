#!/usr/bin/env node
/**
 * Demo recorder — 90s capture, tightened pacing per user feedback:
 *
 *   Act I    (0–10s)   landing opener typing
 *   Act II   (10–22s)  SDR clicked the instant the fork is ready;
 *                      branched confession types out ("9 months",
 *                      "Sunday", "degree")
 *   Act III  (22–26s)  /dashboard — non-lesson-3 cards blurred so the
 *                      eye lands on Surviving & Thriving
 *   Act IV   (26–32s)  click Lesson 3, iframe loads, brief hold on
 *                      home/Begin screen, then Begin clicked
 *   Act V    (32–90s)  jump to screen 3 — the BANT qualification
 *                      interactive — viewer sees an option clicked,
 *                      hold on the result
 *
 * Camera moves are layered after the fact by compose.mjs reading
 * timeline.json. ?hideBadge=1 keeps the synthetic-state pill off frame.
 */

import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const VIEWPORT = { width: 1920, height: 1080 };
const BASE_URL = process.env.DEMO_BASE_URL ?? "http://localhost:3000";
const OUT_DIR = path.resolve("scripts/demo/out/raw");

const wait = (ms) => new Promise((res) => setTimeout(res, ms));

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
    recordVideo: { dir: OUT_DIR, size: VIEWPORT },
    reducedMotion: "no-preference",
  });
  const page = await context.newPage();

  // ─── Act I — Opener typing (0–10s) ───
  const startUrl = `${BASE_URL}/?demo=741407&hideBadge=1`;
  console.log(`[record] navigating to ${startUrl}`);
  await page.goto(startUrl, { waitUntil: "load" });
  console.log("[record] Act I — opener typing");
  await wait(10_000);

  // ─── Act II — SDR pick the moment fork is ready, branched typing (10–22s) ───
  // Playwright's locator.click waits for the element to be visible +
  // actionable, so this fires the instant the fork halves are interactive
  // with no extra dwell.
  console.log("[record] Act II — picking SDR + branched scenes");
  await page.locator('button[data-role="sdr"]').click({ timeout: 8_000 });
  await wait(12_000);

  // ─── Act III — Dashboard with blur on non-lesson-3 cards (22–26s) ───
  console.log("[record] Act III — dashboard / journey with blur");
  await page.goto(`${BASE_URL}/dashboard?hideBadge=1`, { waitUntil: "load" });
  // Give the lesson list a beat to render before we inject the blur.
  await wait(700);
  await page.evaluate(() => {
    // Find every lesson card link, then walk up to a card-shaped
    // container, then blur it — except for the one pointing at lesson 3
    // (Surviving & Thriving), which we keep sharp.
    const links = document.querySelectorAll('a[href^="/course/"]');
    links.forEach((a) => {
      if (a.getAttribute("href") === "/course/3") return;
      let card = a;
      for (let i = 0; i < 6 && card.parentElement; i++) {
        card = card.parentElement;
        const r = card.getBoundingClientRect();
        if (r.height > 60 && r.height < 320) break;
      }
      card.style.filter = "blur(5px)";
      card.style.transition = "filter 0.4s";
    });
  });
  await wait(3_300);

  // ─── Act IV — Click Lesson 3, brief hold, Begin Lesson (26–32s) ───
  console.log("[record] Act IV — into Lesson 3");
  await page.locator('a[href="/course/3"]').first().click({ timeout: 5_000 });
  // Iframe needs ~2s to register and load screen 0
  await page.waitForSelector("iframe", { timeout: 10_000 });
  await wait(3_500);
  // Click Begin Lesson inside the iframe
  console.log("[record] Act IV — clicking Begin Lesson");
  const frame = page.frameLocator("iframe");
  await frame
    .locator('button:has-text("Begin Lesson")')
    .first()
    .click({ timeout: 8_000 });
  await wait(2_500);

  // ─── Act V — Jump to BANT interactive + click an option (32–90s) ───
  console.log("[record] Act V — BANT interactive");
  // Jump straight to screen 3 — the BANT qualification picker.
  await page.evaluate(() => {
    const iframe = document.querySelector("iframe");
    const win = iframe?.contentWindow;
    if (win && typeof win.go === "function") win.go(3);
  });
  await wait(5_000);
  // Click the first BANT option to demonstrate part of the exercise.
  try {
    await frame.locator(".bant-opt").first().click({ timeout: 4_000 });
  } catch (e) {
    console.log("[record] BANT option click skipped:", e.message);
  }
  await wait(4_000);
  // Click a second option for the next lead, if present
  try {
    await frame.locator(".bant-opt").nth(4).click({ timeout: 4_000 });
  } catch (e) {
    console.log("[record] second BANT click skipped:", e.message);
  }
  await wait(30_000);

  console.log("[record] capture complete, closing");
  await context.close();
  await browser.close();

  const webms = fs
    .readdirSync(OUT_DIR)
    .filter((f) => f.endsWith(".webm"))
    .map((f) => ({ f, m: fs.statSync(path.join(OUT_DIR, f)).mtimeMs }))
    .sort((a, b) => b.m - a.m);
  if (webms.length === 0) throw new Error("no webm written");
  const stable = path.join(OUT_DIR, "latest.webm");
  fs.copyFileSync(path.join(OUT_DIR, webms[0].f), stable);
  console.log(`[record] wrote ${stable}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
