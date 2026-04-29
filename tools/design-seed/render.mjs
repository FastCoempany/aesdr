// AESDR — Design Seed Renderer
// ─────────────────────────────────────────────────────────────────
// Renders the source HTMLs in tools/design-seed/ to PDFs and PNGs
// in design-canon-seed/ for use as Claude Design onboarding inputs.
//
// Run from repo root:
//   node tools/design-seed/render.mjs
//
// Outputs (all written to ../../design-canon-seed/):
//   01-brand-canon.pdf
//   02-typography-specimen.pdf
//   03-color-palette.pdf
//   04-rendered-surfaces/{variant-a, mockup-09, mockup-14, mockup-21, mockup-25, mockup-26, mockup-27}.png
//   06-individual-assets/{wordmark-on-cream, iris-gradient-swatch}.png

import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs/promises";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const SEED_OUT = path.join(REPO_ROOT, "design-canon-seed");
const SURFACES_OUT = path.join(SEED_OUT, "04-rendered-surfaces");
const ASSETS_OUT = path.join(SEED_OUT, "06-individual-assets");

// ── INPUTS ──────────────────────────────────────────────────────

const PDF_JOBS = [
  {
    src: path.join(__dirname, "source-pdf-canon.html"),
    out: path.join(SEED_OUT, "01-brand-canon.pdf"),
    label: "01-brand-canon.pdf",
  },
  {
    src: path.join(__dirname, "source-pdf-typography.html"),
    out: path.join(SEED_OUT, "02-typography-specimen.pdf"),
    label: "02-typography-specimen.pdf",
  },
  {
    src: path.join(__dirname, "source-pdf-palette.html"),
    out: path.join(SEED_OUT, "03-color-palette.pdf"),
    label: "03-color-palette.pdf",
  },
];

const SURFACE_JOBS = [
  // The canonical editorial-split layout from production. Active palette.
  {
    src: path.join(REPO_ROOT, "variants/variant-a-editorial-split.html"),
    out: path.join(SURFACES_OUT, "variant-a-editorial-split.png"),
    label: "variant-a-editorial-split.png",
    waitForAnimation: true,
    viewportOnly: true, // page is 700vh scroll-space; only hero renders without JS scroll
  },

  // Five isolated single-pattern surfaces, each authored in tools/design-seed/
  // against the active editorial palette. NOTE: do NOT render the mockups in
  // public/mockups/01-27 — those use the retired dark palette (#020617 etc.)
  // codified as forbidden in AGENTS.md and AFFILIATE_BRAND_CANON.md §6.5.
  {
    src: path.join(__dirname, "surface-warning-box.html"),
    out: path.join(SURFACES_OUT, "pattern-editorial-split-hero.png"),
    label: "pattern-editorial-split-hero.png",
    viewportOnly: true,
    viewport: { width: 1440, height: 900 },
  },
  {
    src: path.join(__dirname, "surface-two-voices.html"),
    out: path.join(SURFACES_OUT, "pattern-two-voices.png"),
    label: "pattern-two-voices.png",
    viewportOnly: false,
    viewport: { width: 1440, height: 900 },
  },
  {
    src: path.join(__dirname, "surface-terminal-block.html"),
    out: path.join(SURFACES_OUT, "pattern-terminal-block.png"),
    label: "pattern-terminal-block.png",
    viewportOnly: true,
    viewport: { width: 1440, height: 900 },
  },
  {
    src: path.join(__dirname, "surface-classified-card.html"),
    out: path.join(SURFACES_OUT, "pattern-classified-card.png"),
    label: "pattern-classified-card.png",
    viewportOnly: false,
    viewport: { width: 1440, height: 900 },
  },
  {
    src: path.join(__dirname, "surface-deck-peel.html"),
    out: path.join(SURFACES_OUT, "pattern-deck-peel.png"),
    label: "pattern-deck-peel.png",
    viewportOnly: true,
    viewport: { width: 1440, height: 900 },
  },
];

const ASSET_JOBS = [
  {
    src: path.join(__dirname, "source-asset-wordmark.html"),
    out: path.join(ASSETS_OUT, "wordmark-on-cream.png"),
    label: "wordmark-on-cream.png",
    viewport: { width: 1600, height: 900 },
  },
  {
    src: path.join(__dirname, "source-asset-iris.html"),
    out: path.join(ASSETS_OUT, "iris-gradient-swatch.png"),
    label: "iris-gradient-swatch.png",
    viewport: { width: 1600, height: 900 },
  },
];

// ── HELPERS ─────────────────────────────────────────────────────

function fileUrl(p) {
  return "file://" + p;
}

async function ensureDirs() {
  await fs.mkdir(SEED_OUT, { recursive: true });
  await fs.mkdir(SURFACES_OUT, { recursive: true });
  await fs.mkdir(ASSETS_OUT, { recursive: true });
}

async function waitForFonts(page) {
  await page.evaluate(async () => {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
  });
  // Settle a tick for any layout-shifting webfont load.
  await page.waitForTimeout(500);
}

async function renderPdf(browser, job) {
  const page = await browser.newPage();
  try {
    await page.goto(fileUrl(job.src), { waitUntil: "networkidle" });
    await waitForFonts(page);
    await page.pdf({
      path: job.out,
      format: "Letter",
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      preferCSSPageSize: true,
    });
    console.log(`  ✓ ${job.label}`);
  } finally {
    await page.close();
  }
}

async function renderSurfacePng(browser, job) {
  const context = await browser.newContext({
    viewport: job.viewport ?? { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  try {
    await page.goto(fileUrl(job.src), { waitUntil: "networkidle" });
    await waitForFonts(page);
    if (job.waitForAnimation) {
      // Some variants animate in; settle 1s for first frame.
      await page.waitForTimeout(1000);
    }
    await page.screenshot({ path: job.out, fullPage: !job.viewportOnly, type: "png" });
    console.log(`  ✓ ${job.label}`);
  } finally {
    await context.close();
  }
}

async function renderAssetPng(browser, job) {
  const context = await browser.newContext({
    viewport: job.viewport ?? { width: 1600, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  try {
    await page.goto(fileUrl(job.src), { waitUntil: "networkidle" });
    await waitForFonts(page);
    await page.screenshot({ path: job.out, fullPage: false, type: "png" });
    console.log(`  ✓ ${job.label}`);
  } finally {
    await context.close();
  }
}

// ── MAIN ────────────────────────────────────────────────────────

async function main() {
  await ensureDirs();
  console.log("AESDR design-seed renderer");
  console.log("──────────────────────────");

  const browser = await chromium.launch();
  try {
    console.log("\n1/3  PDFs:");
    for (const job of PDF_JOBS) {
      await renderPdf(browser, job);
    }

    console.log("\n2/3  Rendered surfaces (full-page PNGs):");
    for (const job of SURFACE_JOBS) {
      await renderSurfacePng(browser, job);
    }

    console.log("\n3/3  Individual assets:");
    for (const job of ASSET_JOBS) {
      await renderAssetPng(browser, job);
    }
  } finally {
    await browser.close();
  }

  console.log("\nDone. Outputs in:");
  console.log("  " + path.relative(REPO_ROOT, SEED_OUT));
}

main().catch((err) => {
  console.error("Render failed:", err);
  process.exit(1);
});
