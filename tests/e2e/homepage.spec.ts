import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("loads with key content", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/AESDR/);
    // Hero tagline from the 2026-06 founder copy pass.
    await expect(
      page.locator("text=Become the same you").first()
    ).toBeVisible();
    await expect(page.locator("text=Get Access").first()).toBeVisible();
  });

  test("pricing section shows both plans", async ({ page }) => {
    await page.goto("/#pricing");
    await expect(page.locator("text=Individual").first()).toBeVisible();
    await expect(page.locator("text=Team").first()).toBeVisible();
  });

  test("sign in link navigates to login", async ({ page }) => {
    await page.goto("/");
    await page.click("text=SIGN IN");
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("Public pages load without auth", () => {
  const pages = [
    { path: "/", keyword: "AESDR" },
    { path: "/login", keyword: "Sign" },
    { path: "/signup", keyword: "Sign" },
    { path: "/terms", keyword: "Terms" },
    { path: "/privacy", keyword: "Privacy" },
    { path: "/refund-policy", keyword: "Refund" },
    { path: "/contact", keyword: "Contact" },
    { path: "/success", keyword: "AESDR" },
    { path: "/purchase/cancel", keyword: "cancel" },
  ];

  for (const { path, keyword } of pages) {
    test(`${path} loads`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBeLessThan(400);
      const content = await page.content();
      expect(content.toLowerCase()).toContain(keyword.toLowerCase());
    });
  }
});
