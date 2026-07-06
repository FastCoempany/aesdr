import { defineConfig } from "@playwright/test";

// QA-run override of the repo config: same tests, but launch the
// environment's pre-installed Chromium (v1194) instead of the missing 1217.
export default defineConfig({
  testDir: "/home/user/aesdr/tests/e2e",
  timeout: 30_000,
  retries: 1,
  use: {
    baseURL: process.env.TEST_BASE_URL || "http://localhost:3000",
    screenshot: "only-on-failure",
    launchOptions: { executablePath: "/opt/pw-browsers/chromium" },
  },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
});
