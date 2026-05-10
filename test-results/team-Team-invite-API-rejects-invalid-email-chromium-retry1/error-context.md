# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: team.spec.ts >> Team invite API >> rejects invalid email
- Location: tests\e2e\team.spec.ts:11:7

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
  3  | test.describe("Team invite API", () => {
  4  |   test("rejects unauthenticated requests", async ({ request }) => {
  5  |     const response = await request.post("/api/team/invite", {
  6  |       data: { email: "test@example.com" },
  7  |     });
  8  |     expect(response.status()).toBe(401);
  9  |   });
  10 | 
  11 |   test("rejects invalid email", async ({ request }) => {
  12 |     const response = await request.post("/api/team/invite", {
  13 |       data: { email: "not-an-email" },
  14 |     });
> 15 |     expect([400, 401]).toContain(response.status());
     |                        ^ Error: expect(received).toContain(expected) // indexOf
  16 |   });
  17 | });
  18 | 
  19 | test.describe("Team accept page", () => {
  20 |   test("redirects without token", async ({ page }) => {
  21 |     await page.goto("/team/accept");
  22 |     await expect(page).toHaveURL(/\/login/);
  23 |   });
  24 | 
  25 |   test("shows invalid invite for bad token", async ({ page }) => {
  26 |     await page.goto("/team/accept?token=fake-token-12345");
  27 |     await expect(page.locator("text=/invalid/i")).toBeVisible();
  28 |   });
  29 | });
  30 | 
```