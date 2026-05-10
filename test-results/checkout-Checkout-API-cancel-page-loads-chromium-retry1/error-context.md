# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: checkout.spec.ts >> Checkout API >> cancel page loads
- Location: tests\e2e\checkout.spec.ts:23:7

# Error details

```
Error: expect(received).toBeLessThan(expected)

Expected: < 400
Received:   500
```

# Page snapshot

```yaml
- generic:
  - generic [active]:
    - generic [ref=e3]:
      - generic [ref=e4]:
        - generic [ref=e5]:
          - navigation [ref=e6]:
            - button "previous" [disabled] [ref=e7]:
              - img "previous" [ref=e8]
            - generic [ref=e10]:
              - generic [ref=e11]: 1/
              - text: "1"
            - button "next" [disabled] [ref=e12]:
              - img "next" [ref=e13]
          - img
        - generic [ref=e15]:
          - link "Next.js 16.2.1 (stale) Turbopack" [ref=e16] [cursor=pointer]:
            - /url: https://nextjs.org/docs/messages/version-staleness
            - img [ref=e17]
            - generic "There is a newer version (16.2.4) available, upgrade recommended!" [ref=e19]: Next.js 16.2.1 (stale)
            - generic [ref=e20]: Turbopack
          - img
      - generic [ref=e21]:
        - dialog "Runtime Error" [ref=e22]:
          - generic [ref=e26]:
            - generic [ref=e27]:
              - generic [ref=e29]: Runtime Error
              - generic [ref=e30]:
                - button "Copy Error Info" [ref=e31] [cursor=pointer]:
                  - img [ref=e32]
                - button "No related documentation found" [disabled] [ref=e34]:
                  - img [ref=e35]
                - button "Attach Node.js inspector" [ref=e37] [cursor=pointer]:
                  - img [ref=e38]
            - generic [ref=e47]:
              - text: Your project's URL and Key are required to create a Supabase client! Check your Supabase project's API settings to find these values
              - link "https://supabase.com/dashboard/project/_/settings/api" [ref=e48] [cursor=pointer]:
                - /url: https://supabase.com/dashboard/project/_/settings/api
          - generic [ref=e49]: "1"
          - generic [ref=e50]: "2"
        - contentinfo [ref=e51]:
          - region "Error feedback" [ref=e52]:
            - paragraph [ref=e53]:
              - link "Was this helpful?" [ref=e54] [cursor=pointer]:
                - /url: https://nextjs.org/telemetry#error-feedback
            - button "Mark as helpful" [ref=e55] [cursor=pointer]:
              - img [ref=e56]
            - button "Mark as not helpful" [ref=e59] [cursor=pointer]:
              - img [ref=e60]
    - generic [ref=e66] [cursor=pointer]:
      - button "Open Next.js Dev Tools" [ref=e67]:
        - img [ref=e68]
      - generic [ref=e71]:
        - button "Open issues overlay" [ref=e72]:
          - generic [ref=e73]:
            - generic [ref=e74]: "0"
            - generic [ref=e75]: "1"
          - generic [ref=e76]: Issue
        - button "Collapse issues badge" [ref=e77]:
          - img [ref=e78]
  - alert [ref=e80]
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
  8  |     expect([400, 401]).toContain(response.status());
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
> 25 |     expect(response?.status()).toBeLessThan(400);
     |                                ^ Error: expect(received).toBeLessThan(expected)
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