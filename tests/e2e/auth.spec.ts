import { test, expect } from "@playwright/test";

test.describe("Signup page", () => {
  test("renders signup form", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test("shows validation on empty submit", async ({ page }) => {
    await page.goto("/signup");
    await page.click('button[type="submit"]');
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toHaveAttribute("required", "");
  });

  test("pre-fills email from query param", async ({ page }) => {
    await page.goto("/signup?email=test%40example.com");
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toHaveValue("test@example.com");
  });
});

test.describe("Login page", () => {
  test("renders login form", async ({ page }) => {
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

  test("forgot password link is present", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("text=/forgot/i")).toBeVisible();
  });
});
