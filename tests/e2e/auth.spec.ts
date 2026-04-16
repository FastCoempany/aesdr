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
    await expect(page.locator("text=/purchase|access/i")).toBeVisible();
  });

  test("shows rate limit message", async ({ page }) => {
    await page.goto("/login?error=rate-limit");
    await expect(page.locator("text=/too many|rate limit/i")).toBeVisible();
  });

  test("has forgot password link", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("text=/forgot/i")).toBeVisible();
  });
});

test.describe("Auth gates — protected routes redirect unauthenticated users", () => {
  const protectedRoutes = ["/dashboard", "/course/1", "/account", "/team", "/admin"];

  for (const route of protectedRoutes) {
    test(`${route} redirects away`, async ({ page }) => {
      await page.goto(route);
      const url = page.url();
      expect(url).not.toContain(route);
    });
  }
});
