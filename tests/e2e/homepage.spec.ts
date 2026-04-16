import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("loads and shows key elements", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/AESDR/);
    await expect(page.locator("text=Stop Surviving")).toBeVisible();
    await expect(page.locator("text=GET ACCESS")).toBeVisible();
    await expect(page.locator("text=SIGN IN")).toBeVisible();
  });

  test("pricing section shows both plans", async ({ page }) => {
    await page.goto("/#pricing");
    await expect(page.locator("text=Individual")).toBeVisible();
    await expect(page.locator("text=Team")).toBeVisible();
  });

  test("sign in link navigates to login", async ({ page }) => {
    await page.goto("/");
    await page.click("text=SIGN IN");
    await expect(page).toHaveURL(/\/login/);
  });
});
