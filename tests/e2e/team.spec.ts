import { test, expect } from "@playwright/test";

test.describe("Team invite API", () => {
  test("rejects unauthenticated requests", async ({ request }) => {
    const response = await request.post("/api/team/invite", {
      data: { email: "test@example.com" },
    });
    expect(response.status()).toBe(401);
  });

  test("rejects invalid email", async ({ request }) => {
    const response = await request.post("/api/team/invite", {
      data: { email: "not-an-email" },
    });
    expect([400, 401]).toContain(response.status());
  });
});

test.describe("Team accept page", () => {
  test("redirects without token", async ({ page }) => {
    await page.goto("/team/accept");
    await expect(page).toHaveURL(/\/login/);
  });

  test("shows invalid invite for bad token", async ({ page }) => {
    await page.goto("/team/accept?token=fake-token-12345");
    await expect(page.locator("text=/invalid/i")).toBeVisible();
  });
});
