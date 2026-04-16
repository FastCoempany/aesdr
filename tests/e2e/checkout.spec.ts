import { test, expect } from "@playwright/test";

test.describe("Checkout API", () => {
  test("POST /api/checkout requires email or auth", async ({ request }) => {
    const response = await request.post("/api/checkout", {
      data: { tier: "individual" },
    });
    expect([400, 401]).toContain(response.status());
  });

  test("POST /api/checkout rejects invalid tier", async ({ request }) => {
    const response = await request.post("/api/checkout", {
      data: { tier: "fake-tier", email: "test@example.com" },
    });
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test("success page loads", async ({ page }) => {
    const response = await page.goto("/success");
    expect(response?.status()).toBeLessThan(500);
  });

  test("cancel page loads", async ({ page }) => {
    const response = await page.goto("/purchase/cancel");
    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator("text=/cancel/i")).toBeVisible();
  });
});

test.describe("Purchase status API", () => {
  test("returns error without session_id", async ({ request }) => {
    const response = await request.get("/api/purchase-status");
    expect([400, 401]).toContain(response.status());
  });

  test("returns not found for fake session", async ({ request }) => {
    const response = await request.get(
      "/api/purchase-status?session_id=cs_test_fake_session_id_12345"
    );
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });
});
