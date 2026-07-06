import { test, expect } from "@playwright/test";

test.describe("Signup page", () => {
  test("renders form fields", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test("pre-fills email from query param", async ({ page }) => {
    await page.goto("/signup?email=test%40example.com");
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toHaveValue("test@example.com");
  });
});

test.describe("Login page", () => {
  test("renders form fields", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test("shows no-purchase message when redirected", async ({ page }) => {
    await page.goto("/login?reason=no_purchase");
    await expect(
      page.getByRole("link", { name: /buy access/i })
    ).toBeVisible();
  });

  test("shows rate limit message", async ({ page }) => {
    await page.goto("/login?error=rate-limit");
    await expect(
      page.locator("text=/too many|rate limit/i").first()
    ).toBeVisible();
  });

  test("has password reset link", async ({ page }) => {
    await page.goto("/login");
    // Brand-voice copy: "what's my password?"
    await expect(
      page.locator("text=/what.s my password|forgot|reset/i").first()
    ).toBeVisible();
  });
});

test.describe("Auth gates — protected routes redirect unauthenticated users", () => {
  const protectedRoutes = ["/dashboard", "/course/1", "/account", "/team", "/admin"];

  for (const route of protectedRoutes) {
    test(`${route} redirects away`, async ({ page }) => {
      await page.goto(route);
      // Pages inside a streaming boundary emit an in-body NEXT_REDIRECT that
      // executes just after load — wait for the URL instead of reading it
      // synchronously.
      await page.waitForURL((u) => !u.pathname.startsWith(route), {
        timeout: 10_000,
        // "commit" — we only care that the browser left the protected URL,
        // not that the destination finished loading every subresource.
        waitUntil: "commit",
      });
      expect(page.url()).not.toContain(route);
    });
  }
});
