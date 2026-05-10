# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin.spec.ts >> Admin API >> refund API rejects missing purchaseId
- Location: tests\e2e\admin.spec.ts:11:7

# Error details

```
Error: expect(received).toContain(expected) // indexOf

Expected value: 500
Received array: [400, 403]
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | test.describe("Admin API", () => {
  4  |   test("refund API rejects unauthenticated requests", async ({ request }) => {
  5  |     const response = await request.post("/api/admin/refund", {
  6  |       data: { purchaseId: "fake-id" },
  7  |     });
  8  |     expect(response.status()).toBe(403);
  9  |   });
  10 | 
  11 |   test("refund API rejects missing purchaseId", async ({ request }) => {
  12 |     const response = await request.post("/api/admin/refund", {
  13 |       data: {},
  14 |     });
> 15 |     expect([400, 403]).toContain(response.status());
     |                        ^ Error: expect(received).toContain(expected) // indexOf
  16 |   });
  17 | });
  18 | 
  19 | test.describe("Admin pages require auth", () => {
  20 |   test("admin dashboard redirects non-admin", async ({ page }) => {
  21 |     await page.goto("/admin");
  22 |     await expect(page).toHaveURL(/\/(dashboard|login|$)/);
  23 |   });
  24 | 
  25 |   test("admin users page redirects non-admin", async ({ page }) => {
  26 |     await page.goto("/admin/users");
  27 |     await expect(page).toHaveURL(/\/(dashboard|login|$)/);
  28 |   });
  29 | 
  30 |   test("admin teams page redirects non-admin", async ({ page }) => {
  31 |     await page.goto("/admin/teams");
  32 |     await expect(page).toHaveURL(/\/(dashboard|login|$)/);
  33 |   });
  34 | });
  35 | 
```