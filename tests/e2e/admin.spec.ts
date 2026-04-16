import { test, expect } from "@playwright/test";

test.describe("Admin API", () => {
  test("refund API rejects unauthenticated requests", async ({ request }) => {
    const response = await request.post("/api/admin/refund", {
      data: { purchaseId: "fake-id" },
    });
    expect(response.status()).toBe(403);
  });

  test("refund API rejects missing purchaseId", async ({ request }) => {
    const response = await request.post("/api/admin/refund", {
      data: {},
    });
    expect([400, 403]).toContain(response.status());
  });
});

test.describe("Admin pages require auth", () => {
  test("admin dashboard redirects non-admin", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/(dashboard|login|$)/);
  });

  test("admin users page redirects non-admin", async ({ page }) => {
    await page.goto("/admin/users");
    await expect(page).toHaveURL(/\/(dashboard|login|$)/);
  });

  test("admin teams page redirects non-admin", async ({ page }) => {
    await page.goto("/admin/teams");
    await expect(page).toHaveURL(/\/(dashboard|login|$)/);
  });
});
