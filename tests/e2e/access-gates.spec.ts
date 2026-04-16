import { test, expect } from "@playwright/test";

test.describe("Unauthenticated access gates", () => {
  test("dashboard redirects to login when not signed in", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/(login|$)/);
  });

  test("course page redirects when not signed in", async ({ page }) => {
    await page.goto("/course/1");
    await expect(page).toHaveURL(/\/(login|$)/);
  });

  test("account page redirects when not signed in", async ({ page }) => {
    await page.goto("/account");
    await expect(page).toHaveURL(/\/(login|$)/);
  });

  test("team page redirects when not signed in", async ({ page }) => {
    await page.goto("/team");
    await expect(page).toHaveURL(/\/(login|$)/);
  });

  test("admin page redirects when not signed in", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/(dashboard|login|$)/);
  });
});

test.describe("Public pages load without auth", () => {
  const publicPages = [
    { path: "/", title: /AESDR/ },
    { path: "/login", title: /AESDR/ },
    { path: "/signup", title: /AESDR/ },
    { path: "/terms", title: /Terms/i },
    { path: "/privacy", title: /Privacy/i },
    { path: "/refund-policy", title: /Refund/i },
    { path: "/contact", title: /Contact/i },
  ];

  for (const { path, title } of publicPages) {
    test(`${path} loads successfully`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBeLessThan(400);
      await expect(page).toHaveTitle(title);
    });
  }
});
