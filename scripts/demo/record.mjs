#!/usr/bin/env node
/**
 * Demo recorder — drives a 90s cinematic capture of the AESDR flow:
 *
 *   Act I    (0–12s)   landing opener typing animation
 *   Act II   (12–22s)  pick SDR; brief branched-scene confession
 *   Act III  (22–32s)  dashboard / journey page in view
 *   Act IV   (32–48s)  click into Lesson 6, iframe loads, "Begin Lesson" visible
 *   Act V    (48–90s)  begin clicked, jumped to the silo drag/drop matching
 *                      game on screen 2; viewer sees the interactive surface
 *
 * Camera moves are applied after the fact by compose.mjs reading
 * timeline.json. ?hideBadge=1 keeps the synthetic-state pill off camera.
 */

import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const VIEWPORT = { width: 1920, height: 1080 };
const BASE_URL = process.env.DEMO_BASE_URL ?? "http://localhost:3000";
const OUT_DIR = path.resolve("scripts/demo/out/raw");

const wait = (ms) => new Promise((res) => setTimeout(res, ms));

async function smoothScrollIframe(page, targetY, durationMs) {
  const steps = Math.max(20, Math.floor(durationMs / 50));
  const stepDelay = durationMs / steps;
  for (let i = 1; i <= steps; i++) {
    const y = (targetY * i) / steps;
    await page.evaluate((py) => {
      const iframe = document.querySelector("iframe");
      if (iframe?.contentWindow) iframe.contentWindow.scrollTo(0, py);
    }, y);
    await wait(stepDelay);
  }
}

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

  // ─── Act I — Landing opener (0–12s) ───
  const startUrl = `${BASE_URL}/?demo=741407&hideBadge=1`;
  console.log(`[record] navigating to ${startUrl}`);
  await page.goto(startUrl, { waitUntil: "load" });
  console.log("[record] Act I — opener typing");
  await wait(12_000);

  // ─── Act II — SDR pick + brief branched confession (12–22s) ───
  console.log("[record] Act II — picking SDR");
  await page.locator('button[data-role="sdr"]').click({ timeout: 5_000 });
  await wait(10_000);

  // ─── Act III — Journey / dashboard page (22–32s) ───
  console.log("[record] Act III — dashboard / journey");
  await page.goto(`${BASE_URL}/dashboard?hideBadge=1`, { waitUntil: "load" });
  await wait(10_000);

  // ─── Act IV — Open Lesson 6 (32–48s) ───
  console.log("[record] Act IV — opening Lesson 6");
  // Click the lesson title link directly. Demo session has lessons
  // 1–6 complete, so /course/6 is accessible.
  await page.locator('a[href="/course/6"]').first().click({ timeout: 5_000 });
  // Wait for the iframe to load the lesson's screen 0 (intro + Begin button).
  await page.waitForSelector("iframe", { timeout: 10_000 });
  await wait(12_000);

  // ─── Act V — Click "Begin Lesson", jump to drag/drop (48–90s) ───
  console.log("[record] Act V — Begin Lesson + matching game");
  const frame = page.frameLocator("iframe");
  // The lesson's intro screen has a button with text "Begin Lesson →".
  await frame
    .locator('button:has-text("Begin Lesson")')
    .first()
    .click({ timeout: 8_000 });
  await wait(4_000);
  // Jump directly to screen 2 — the 3-silo drag/drop matching surface.
  // The lesson HTML exposes `go(N)` on window for screen navigation.
  await page.evaluate(() => {
    const iframe = document.querySelector("iframe");
    const win = iframe?.contentWindow;
    if (win && typeof win.go === "function") win.go(2);
  });
  // Slow nudge-scroll to show the full silo layout, then hold.
  await wait(4_000);
  await smoothScrollIframe(page, 600, 14_000);
  await wait(20_000);

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
