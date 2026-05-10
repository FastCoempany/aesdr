# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api-critical-paths.spec.ts >> Public pages accessible >> GET /success returns 200
- Location: tests\e2e\api-critical-paths.spec.ts:25:9

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 200
Received: 500
```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | 
  3   | const BASE = process.env.TEST_BASE_URL || "http://localhost:3000";
  4   | const BROWSER_HEADERS = {
  5   |   "User-Agent":
  6   |     "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
  7   |   Accept:
  8   |     "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  9   | };
  10  | 
  11  | test.describe("Public pages accessible", () => {
  12  |   const publicPaths = [
  13  |     "/",
  14  |     "/login",
  15  |     "/signup",
  16  |     "/terms",
  17  |     "/privacy",
  18  |     "/refund-policy",
  19  |     "/contact",
  20  |     "/success",
  21  |     "/purchase/cancel",
  22  |   ];
  23  | 
  24  |   for (const path of publicPaths) {
  25  |     test(`GET ${path} returns 200`, async ({ request }) => {
  26  |       const res = await request.get(`${BASE}${path}`, {
  27  |         headers: BROWSER_HEADERS,
  28  |       });
> 29  |       expect(res.status()).toBe(200);
      |                            ^ Error: expect(received).toBe(expected) // Object.is equality
  30  |     });
  31  |   }
  32  | });
  33  | 
  34  | test.describe("Protected routes block unauthenticated access", () => {
  35  |   const protectedPaths = ["/dashboard", "/course/1", "/account", "/team", "/admin"];
  36  | 
  37  |   for (const path of protectedPaths) {
  38  |     test(`GET ${path} does not expose content without auth`, async ({ request }) => {
  39  |       const res = await request.get(`${BASE}${path}`, {
  40  |         headers: BROWSER_HEADERS,
  41  |       });
  42  |       const html = await res.text();
  43  |       const exposesProtectedContent =
  44  |         html.includes("The Journey") ||
  45  |         html.includes("Lesson 1") ||
  46  |         html.includes("Command Center") ||
  47  |         html.includes("Team Management");
  48  |       expect(exposesProtectedContent).toBe(false);
  49  |     });
  50  |   }
  51  | });
  52  | 
  53  | test.describe("Checkout API validation", () => {
  54  |   test("POST /api/checkout rejects empty body", async ({ request }) => {
  55  |     const res = await request.post(`${BASE}/api/checkout`, {
  56  |       headers: { ...BROWSER_HEADERS, "Content-Type": "application/json" },
  57  |       data: {},
  58  |     });
  59  |     expect(res.status()).toBeGreaterThanOrEqual(400);
  60  |   });
  61  | 
  62  |   test("POST /api/checkout with valid tier returns session or error", async ({ request }) => {
  63  |     const res = await request.post(`${BASE}/api/checkout`, {
  64  |       headers: { ...BROWSER_HEADERS, "Content-Type": "application/json" },
  65  |       data: { tier: "individual", email: "e2e-test@example.com" },
  66  |     });
  67  |     expect([200, 400, 401, 500]).toContain(res.status());
  68  |     if (res.status() === 200) {
  69  |       const body = await res.json();
  70  |       expect(body.url).toBeTruthy();
  71  |     }
  72  |   });
  73  | });
  74  | 
  75  | test.describe("Admin API security", () => {
  76  |   test("POST /api/admin/refund rejects without admin auth", async ({ request }) => {
  77  |     const res = await request.post(`${BASE}/api/admin/refund`, {
  78  |       headers: { ...BROWSER_HEADERS, "Content-Type": "application/json" },
  79  |       data: { purchaseId: "fake-uuid-1234" },
  80  |     });
  81  |     expect(res.status()).toBe(403);
  82  |     const body = await res.json();
  83  |     expect(body.error).toBe("Forbidden");
  84  |   });
  85  | 
  86  |   test("POST /api/admin/refund rejects missing purchaseId", async ({ request }) => {
  87  |     const res = await request.post(`${BASE}/api/admin/refund`, {
  88  |       headers: { ...BROWSER_HEADERS, "Content-Type": "application/json" },
  89  |       data: {},
  90  |     });
  91  |     expect([400, 403]).toContain(res.status());
  92  |   });
  93  | });
  94  | 
  95  | test.describe("Team API security", () => {
  96  |   test("POST /api/team/invite rejects without auth", async ({ request }) => {
  97  |     const res = await request.post(`${BASE}/api/team/invite`, {
  98  |       headers: { ...BROWSER_HEADERS, "Content-Type": "application/json" },
  99  |       data: { email: "test@example.com" },
  100 |     });
  101 |     expect(res.status()).toBe(401);
  102 |     const body = await res.json();
  103 |     expect(body.error).toBe("Unauthorized");
  104 |   });
  105 | 
  106 |   test("POST /api/team/invite rejects invalid email format", async ({ request }) => {
  107 |     const res = await request.post(`${BASE}/api/team/invite`, {
  108 |       headers: { ...BROWSER_HEADERS, "Content-Type": "application/json" },
  109 |       data: { email: "not-an-email" },
  110 |     });
  111 |     expect([400, 401]).toContain(res.status());
  112 |   });
  113 | });
  114 | 
  115 | test.describe("Stripe webhook security", () => {
  116 |   test("rejects requests without stripe-signature header", async ({ request }) => {
  117 |     const res = await request.post(`${BASE}/api/webhooks/stripe`, {
  118 |       headers: { ...BROWSER_HEADERS, "Content-Type": "application/json" },
  119 |       data: '{"type":"checkout.session.completed"}',
  120 |     });
  121 |     expect(res.status()).toBe(400);
  122 |     const body = await res.json();
  123 |     expect(body.error).toMatch(/signature/i);
  124 |   });
  125 | 
  126 |   test("rejects requests with forged signature", async ({ request }) => {
  127 |     const res = await request.post(`${BASE}/api/webhooks/stripe`, {
  128 |       headers: {
  129 |         ...BROWSER_HEADERS,
```