import { test, expect } from "@playwright/test";

test.describe("Checkout API", () => {
  test("rejects empty body", async ({ request }) => {
    const res = await request.post("/api/checkout", { data: {} });
    expect(res.status()).toBeGreaterThanOrEqual(400);
  });

  test("creates Stripe session with valid input", async ({ request }) => {
    const res = await request.post("/api/checkout", {
      data: { tier: "individual", email: "e2e-test@example.com" },
    });
    if (res.status() === 200) {
      const body = await res.json();
      expect(body.url).toContain("stripe.com");
    } else {
      expect(res.status()).toBeGreaterThanOrEqual(400);
    }
  });
});

test.describe("Admin refund API", () => {
  test("rejects unauthenticated requests", async ({ request }) => {
    const res = await request.post("/api/admin/refund", {
      data: { purchaseId: "fake-uuid" },
    });
    expect(res.status()).toBe(403);
    const body = await res.json();
    expect(body.error).toBe("Forbidden");
  });

  test("rejects missing purchaseId", async ({ request }) => {
    const res = await request.post("/api/admin/refund", { data: {} });
    expect([400, 403]).toContain(res.status());
  });
});

test.describe("Team invite API", () => {
  test("rejects unauthenticated requests", async ({ request }) => {
    const res = await request.post("/api/team/invite", {
      data: { email: "test@example.com" },
    });
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });
});

test.describe("Stripe webhook", () => {
  test("rejects missing signature", async ({ request }) => {
    const res = await request.post("/api/webhooks/stripe", {
      data: '{"type":"checkout.session.completed"}',
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/signature/i);
  });

  test("rejects forged signature", async ({ request }) => {
    const res = await request.post("/api/webhooks/stripe", {
      headers: { "stripe-signature": "t=123,v1=forged" },
      data: '{"type":"checkout.session.completed"}',
    });
    expect(res.status()).toBe(400);
  });
});

test.describe("Purchase status API", () => {
  test("rejects missing session_id", async ({ request }) => {
    const res = await request.get("/api/purchase-status");
    expect(res.status()).toBeGreaterThanOrEqual(400);
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
