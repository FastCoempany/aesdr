# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: stripe-webhook.spec.ts >> Stripe webhook endpoint >> rejects requests with invalid signature
- Location: tests\e2e\stripe-webhook.spec.ts:17:7

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
  3  | test.describe("Stripe webhook endpoint", () => {
  4  |   test("rejects requests without signature header", async ({ request }) => {
  5  |     const response = await request.post("/api/webhooks/stripe", {
  6  |       headers: { "Content-Type": "application/json" },
  7  |       data: JSON.stringify({
  8  |         type: "checkout.session.completed",
  9  |         data: { object: {} },
  10 |       }),
  11 |     });
  12 |     expect(response.status()).toBe(400);
  13 |     const body = await response.json();
  14 |     expect(body.error).toMatch(/signature/i);
  15 |   });
  16 | 
  17 |   test("rejects requests with invalid signature", async ({ request }) => {
  18 |     const response = await request.post("/api/webhooks/stripe", {
  19 |       headers: {
  20 |         "Content-Type": "application/json",
  21 |         "stripe-signature": "t=1234,v1=fake_signature",
  22 |       },
  23 |       data: JSON.stringify({
  24 |         type: "checkout.session.completed",
  25 |         data: { object: {} },
  26 |       }),
  27 |     });
> 28 |     expect(response.status()).toBe(400);
     |                               ^ Error: expect(received).toBe(expected) // Object.is equality
  29 |   });
  30 | 
  31 |   test("rejects non-JSON body gracefully", async ({ request }) => {
  32 |     const response = await request.post("/api/webhooks/stripe", {
  33 |       headers: {
  34 |         "stripe-signature": "t=1234,v1=fake_signature",
  35 |       },
  36 |       data: "not-json-body",
  37 |     });
  38 |     expect(response.status()).toBeGreaterThanOrEqual(400);
  39 |     expect(response.status()).toBeLessThan(500);
  40 |   });
  41 | });
  42 | 
```