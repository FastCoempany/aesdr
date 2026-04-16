import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 120_000,
  retries: 0,
  use: {
    baseURL: process.env.TEST_BASE_URL || "https://aesdr.com",
    screenshot: "on",
    trace: "on-first-retry",
    video: "on",
  },
  outputDir: "./tests/e2e/results",
  reporter: [["html", { open: "never", outputFolder: "./tests/e2e/report" }]],
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium", viewport: { width: 1280, height: 800 } },
    },
  ],
});
