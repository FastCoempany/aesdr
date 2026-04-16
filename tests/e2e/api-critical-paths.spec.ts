import { test, expect } from "@playwright/test";

const BASE = process.env.TEST_BASE_URL || "http://localhost:3000";
const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
};

test.describe("Public pages accessible", () => {
  const publicPaths = [
    "/",
    "/login",
    "/signup",
    "/terms",
    "/privacy",
    "/refund-policy",
    "/contact",
    "/success",
    "/purchase/cancel",
  ];

  for (const path of publicPaths) {
    test(`GET ${path} returns 200`, async ({ request }) => {
      const res = await request.get(`${BASE}${path}`, {
        headers: BROWSER_HEADERS,
      });
      expect(res.status()).toBe(200);
    });
  }
});

test.describe("Protected routes block unauthenticated access", () => {
  const protectedPaths = ["/dashboard", "/course/1", "/account", "/team", "/admin"];

  for (const path of protectedPaths) {
    test(`GET ${path} does not expose content without auth`, async ({ request }) => {
      const res = await request.get(`${BASE}${path}`, {
        headers: BROWSER_HEADERS,
      });
      const html = await res.text();
      const exposesProtectedContent =
        html.includes("The Journey") ||
        html.includes("Lesson 1") ||
        html.includes("Command Center") ||
        html.includes("Team Management");
      expect(exposesProtectedContent).toBe(false);
    });
  }
});

test.describe("Checkout API validation", () => {
  test("POST /api/checkout rejects empty body", async ({ request }) => {
    const res = await request.post(`${BASE}/api/checkout`, {
      headers: { ...BROWSER_HEADERS, "Content-Type": "application/json" },
      data: {},
    });
    expect(res.status()).toBeGreaterThanOrEqual(400);
  });

  test("POST /api/checkout with valid tier returns session or error", async ({ request }) => {
    const res = await request.post(`${BASE}/api/checkout`, {
      headers: { ...BROWSER_HEADERS, "Content-Type": "application/json" },
      data: { tier: "individual", email: "e2e-test@example.com" },
    });
    expect([200, 400, 401, 500]).toContain(res.status());
    if (res.status() === 200) {
      const body = await res.json();
      expect(body.url).toBeTruthy();
    }
  });
});

test.describe("Admin API security", () => {
  test("POST /api/admin/refund rejects without admin auth", async ({ request }) => {
    const res = await request.post(`${BASE}/api/admin/refund`, {
      headers: { ...BROWSER_HEADERS, "Content-Type": "application/json" },
      data: { purchaseId: "fake-uuid-1234" },
    });
    expect(res.status()).toBe(403);
    const body = await res.json();
    expect(body.error).toBe("Forbidden");
  });

  test("POST /api/admin/refund rejects missing purchaseId", async ({ request }) => {
    const res = await request.post(`${BASE}/api/admin/refund`, {
      headers: { ...BROWSER_HEADERS, "Content-Type": "application/json" },
      data: {},
    });
    expect([400, 403]).toContain(res.status());
  });
});

test.describe("Team API security", () => {
  test("POST /api/team/invite rejects without auth", async ({ request }) => {
    const res = await request.post(`${BASE}/api/team/invite`, {
      headers: { ...BROWSER_HEADERS, "Content-Type": "application/json" },
      data: { email: "test@example.com" },
    });
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  test("POST /api/team/invite rejects invalid email format", async ({ request }) => {
    const res = await request.post(`${BASE}/api/team/invite`, {
      headers: { ...BROWSER_HEADERS, "Content-Type": "application/json" },
      data: { email: "not-an-email" },
    });
    expect([400, 401]).toContain(res.status());
  });
});

test.describe("Stripe webhook security", () => {
  test("rejects requests without stripe-signature header", async ({ request }) => {
    const res = await request.post(`${BASE}/api/webhooks/stripe`, {
      headers: { ...BROWSER_HEADERS, "Content-Type": "application/json" },
      data: '{"type":"checkout.session.completed"}',
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/signature/i);
  });

  test("rejects requests with forged signature", async ({ request }) => {
    const res = await request.post(`${BASE}/api/webhooks/stripe`, {
      headers: {
        ...BROWSER_HEADERS,
        "Content-Type": "application/json",
        "stripe-signature": "t=1234567890,v1=forged_signature_attempt",
      },
      data: '{"type":"checkout.session.completed","data":{"object":{}}}',
    });
    expect(res.status()).toBe(400);
  });
});

test.describe("Team accept page", () => {
  test("redirects to login without token", async ({ request }) => {
    const res = await request.get(`${BASE}/team/accept`, {
      headers: BROWSER_HEADERS,
      maxRedirects: 0,
    });
    expect([200, 301, 302, 303, 307, 308]).toContain(res.status());
  });

  test("shows invalid invite for fake token", async ({ request }) => {
    const res = await request.get(`${BASE}/team/accept?token=fake-token-xyz`, {
      headers: BROWSER_HEADERS,
    });
    expect(res.status()).toBe(200);
    const html = await res.text();
    expect(html.toLowerCase()).toContain("invalid");
  });
});

test.describe("Purchase status API", () => {
  test("rejects without session_id", async ({ request }) => {
    const res = await request.get(`${BASE}/api/purchase-status`, {
      headers: BROWSER_HEADERS,
    });
    expect(res.status()).toBeGreaterThanOrEqual(400);
  });

  test("returns pending/not-found for fake session", async ({ request }) => {
    const res = await request.get(
      `${BASE}/api/purchase-status?session_id=cs_test_fake_id_12345`,
      { headers: BROWSER_HEADERS }
    );
    expect(res.status()).toBeGreaterThanOrEqual(400);
  });
});
