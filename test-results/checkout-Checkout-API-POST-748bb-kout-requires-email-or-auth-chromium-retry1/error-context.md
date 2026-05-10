# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: checkout.spec.ts >> Checkout API >> POST /api/checkout requires email or auth
- Location: tests\e2e\checkout.spec.ts:4:7

# Error details

```
Error: expect(received).toContain(expected) // indexOf

Expected value: 500
Received array: [400, 401]
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | test.describe("Checkout API", () => {
  4  |   test("POST /api/checkout requires email or auth", async ({ request }) => {
  5  |     const response = await request.post("/api/checkout", {
  6  |       data: { tier: "individual" },
  7  |     });
> 8  |     expect([400, 401]).toContain(response.status());
     |                        ^ Error: expect(received).toContain(expected) // indexOf
  9  |   });
  10 | 
  11 |   test("POST /api/checkout rejects invalid tier", async ({ request }) => {
  12 |     const response = await request.post("/api/checkout", {
  13 |       data: { tier: "fake-tier", email: "test@example.com" },
  14 |     });
  15 |     expect(response.status()).toBeGreaterThanOrEqual(400);
  16 |   });
  17 | 
  18 |   test("success page loads", async ({ page }) => {
  19 |     const response = await page.goto("/success");
  20 |     expect(response?.status()).toBeLessThan(500);
  21 |   });
  22 | 
  23 |   test("cancel page loads", async ({ page }) => {
  24 |     const response = await page.goto("/purchase/cancel");
  25 |     expect(response?.status()).toBeLessThan(400);
  26 |     await expect(page.locator("text=/cancel/i")).toBeVisible();
  27 |   });
  28 | });
  29 | 
  30 | test.describe("Purchase status API", () => {
  31 |   test("returns error without session_id", async ({ request }) => {
  32 |     const response = await request.get("/api/purchase-status");
  33 |     expect([400, 401]).toContain(response.status());
  34 |   });
  35 | 
  36 |   test("returns not found for fake session", async ({ request }) => {
  37 |     const response = await request.get(
  38 |       "/api/purchase-status?session_id=cs_test_fake_session_id_12345"
  39 |     );
  40 |     expect(response.status()).toBeGreaterThanOrEqual(400);
  41 |   });
  42 | });
  43 | 
```