#!/usr/bin/env node
/**
 * Demo recorder — Playwright-driven flat capture of the AESDR landing
 * flow + course entry. Three acts, ~90s total. Camera moves are applied
 * after the fact by compose.mjs reading timeline.json.
 *
 * Acts:
 *   I    (0–12s)    opener typing animation plays
 *   II   (12–30s)   SDR pick + branched scenes + terminal "scanning"
 *   III  (30–90s)   jump to /course/5; lesson header with Leponeus +
 *                   AESDR fills frame, then slow scroll through body
 *
 * Synthetic-state pill stays off camera via ?hideBadge=1.
 */

import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const VIEWPORT = { width: 1920, height: 1080 };
const BASE_URL = process.env.DEMO_BASE_URL ?? "http://localhost:3000";
const OUT_DIR = path.resolve("scripts/demo/out/raw");

const wait = (ms) => new Promise((res) => setTimeout(res, ms));

// Smooth-scroll helper for the lesson body. The course route renders
// the lesson inside an iframe, so we scroll inside the iframe's
// contentWindow when one is present, falling back to the top-level
// window otherwise.
async function smoothScroll(page, targetY, durationMs) {
  const steps = Math.max(20, Math.floor(durationMs / 50));
  const stepDelay = durationMs / steps;
  for (let i = 1; i <= steps; i++) {
    const y = (targetY * i) / steps;
    await page.evaluate((py) => {
      const iframe = document.querySelector("iframe");
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.scrollTo(0, py);
      } else {
        window.scrollTo(0, py);
      }
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

  const startUrl = `${BASE_URL}/?demo=741407&hideBadge=1`;
  console.log(`[record] navigating to ${startUrl}`);
  await page.goto(startUrl, { waitUntil: "load" });

  // ─── Act I — Opener typing (0–12s) ───
  console.log("[record] Act I — opener typing");
  await wait(12_000);

  // ─── Act II — Pick SDR + branched + terminal scenes (12–30s) ───
  console.log("[record] Act II — picking SDR + scanning lines");
  await page.locator('button[data-role="sdr"]').click({ timeout: 5_000 });
  await wait(18_000);

  // ─── Act III — Course entry; Leponeus + AESDR header (30–90s) ───
  console.log("[record] Act III — entering course");
  await page.goto(`${BASE_URL}/course/5?demo=741407&hideBadge=1`, {
    waitUntil: "load",
  });
  // Hold on the lesson header for a beat so the viewer registers
  // Leponeus + the iris-shimmer AESDR wordmark.
  await wait(7_000);
  // Slow scroll through the lesson body over 35s, ending ~2400px down.
  await smoothScroll(page, 2400, 35_000);
  // Hold the final frame so the timeline camera can settle.
  await wait(8_000);

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
