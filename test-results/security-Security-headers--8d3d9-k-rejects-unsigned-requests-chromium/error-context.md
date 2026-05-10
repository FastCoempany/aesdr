# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: security.spec.ts >> Security headers and protections >> Stripe webhook rejects unsigned requests
- Location: tests\e2e\security.spec.ts:24:7

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 400
Received: 500
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | test.describe("Security headers and protections", () => {
  4  |   test("homepage returns security headers", async ({ request }) => {
  5  |     const response = await request.get("/");
  6  |     const headers = response.headers();
  7  |     expect(headers["x-frame-options"] || headers["content-security-policy"]).toBeTruthy();
  8  |   });
  9  | 
  10 |   test("API routes reject GET on POST-only endpoints", async ({ request }) => {
  11 |     const postOnlyRoutes = [
  12 |       "/api/checkout",
  13 |       "/api/admin/refund",
  14 |       "/api/team/invite",
  15 |       "/api/webhooks/stripe",
  16 |     ];
  17 | 
  18 |     for (const route of postOnlyRoutes) {
  19 |       const response = await request.get(route);
  20 |       expect(response.status()).toBeGreaterThanOrEqual(400);
  21 |     }
  22 |   });
  23 | 
  24 |   test("Stripe webhook rejects unsigned requests", async ({ request }) => {
  25 |     const response = await request.post("/api/webhooks/stripe", {
  26 |       data: { type: "checkout.session.completed" },
  27 |     });
> 28 |     expect(response.status()).toBe(400);
     |                               ^ Error: expect(received).toBe(expected) // Object.is equality
  29 |     const body = await response.json();
  30 |     expect(body.error).toMatch(/signature/i);
  31 |   });
  32 | });
  33 | 
  34 | test.describe("XSS prevention", () => {
  35 |   test("signup page escapes email in query param", async ({ page }) => {
  36 |     await page.goto('/signup?email=<script>alert("xss")</script>');
  37 |     const content = await page.content();
  38 |     expect(content).not.toContain("<script>alert");
  39 |   });
  40 | 
  41 |   test("login page escapes reason param", async ({ page }) => {
  42 |     await page.goto('/login?reason=<img+onerror=alert(1)+src=x>');
  43 |     const content = await page.content();
  44 |     expect(content).not.toContain("onerror=alert");
  45 |   });
  46 | });
  47 | 
  48 | test.describe("Rate limiting", () => {
  49 |   test("auth callback enforces rate limit on excessive requests", async ({
  50 |     request,
  51 |   }) => {
  52 |     const responses = [];
  53 |     for (let i = 0; i < 15; i++) {
  54 |       const res = await request.get("/auth/callback?code=fake");
  55 |       responses.push(res.status());
  56 |     }
  57 |     const rateLimited = responses.some((s) => s === 429);
  58 |     const errored = responses.some((s) => s >= 400);
  59 |     expect(errored).toBe(true);
  60 |   });
  61 | });
  62 | 
```