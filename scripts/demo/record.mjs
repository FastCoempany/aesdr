#!/usr/bin/env node
/**
 * Demo recorder — Playwright-driven flat capture of the AESDR landing
 * flow, written as a sequence of named "beats". Output is a raw WebM
 * with no zooms/cuts applied; the cinematic camera moves are layered
 * on after the fact by `compose.mjs` using `timeline.json`.
 *
 * Run via `pnpm demo:record` (see package.json). The target URL is
 * `DEMO_BASE_URL` (default localhost:3000). The script attaches both
 * the demo activation code AND `?hideBadge=1` so the synthetic-state
 * pill never appears on camera.
 *
 * Total duration is governed by the schedule below — currently a
 * 30-second cut: typing animation plays, SDR is picked, branched
 * scenes + hero reveal play, recording stops.
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

  const startUrl = `${BASE_URL}/?demo=741407&hideBadge=1`;
  console.log(`[record] navigating to ${startUrl}`);
  await page.goto(startUrl, { waitUntil: "load" });

  // ─── Act I — Hook (0–12s) ───
  // Typing animation runs autonomously. We just stare.
  console.log("[record] Act I — typing animation");
  await wait(12_000);

  // ─── Act II — Pick SDR (12–18s) ───
  console.log("[record] Act II — picking SDR");
  await page.locator('button[data-role="sdr"]').click({ timeout: 5_000 });
  await wait(6_000);

  // ─── Act III — Branched scenes + hero (18–30s) ───
  console.log("[record] Act III — branched scenes + hero");
  await wait(12_000);

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
