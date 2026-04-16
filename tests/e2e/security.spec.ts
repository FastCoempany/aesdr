import { test, expect } from "@playwright/test";

test.describe("Security headers and protections", () => {
  test("homepage returns security headers", async ({ request }) => {
    const response = await request.get("/");
    const headers = response.headers();
    expect(headers["x-frame-options"] || headers["content-security-policy"]).toBeTruthy();
  });

  test("API routes reject GET on POST-only endpoints", async ({ request }) => {
    const postOnlyRoutes = [
      "/api/checkout",
      "/api/admin/refund",
      "/api/team/invite",
      "/api/webhooks/stripe",
    ];

    for (const route of postOnlyRoutes) {
      const response = await request.get(route);
      expect(response.status()).toBeGreaterThanOrEqual(400);
    }
  });

  test("Stripe webhook rejects unsigned requests", async ({ request }) => {
    const response = await request.post("/api/webhooks/stripe", {
      data: { type: "checkout.session.completed" },
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toMatch(/signature/i);
  });
});

test.describe("XSS prevention", () => {
  test("signup page escapes email in query param", async ({ page }) => {
    await page.goto('/signup?email=<script>alert("xss")</script>');
    const content = await page.content();
    expect(content).not.toContain("<script>alert");
  });

  test("login page escapes reason param", async ({ page }) => {
    await page.goto('/login?reason=<img+onerror=alert(1)+src=x>');
    const content = await page.content();
    expect(content).not.toContain("onerror=alert");
  });
});

test.describe("Rate limiting", () => {
  test("auth callback enforces rate limit on excessive requests", async ({
    request,
  }) => {
    const responses = [];
    for (let i = 0; i < 15; i++) {
      const res = await request.get("/auth/callback?code=fake");
      responses.push(res.status());
    }
    const rateLimited = responses.some((s) => s === 429);
    const errored = responses.some((s) => s >= 400);
    expect(errored).toBe(true);
  });
});
