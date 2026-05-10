# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: access-gates.spec.ts >> Public pages load without auth >> /privacy loads successfully
- Location: tests\e2e\access-gates.spec.ts:42:9

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
  3  | test.describe("Unauthenticated access gates", () => {
  4  |   test("dashboard redirects to login when not signed in", async ({ page }) => {
  5  |     await page.goto("/dashboard");
  6  |     await expect(page).toHaveURL(/\/(login|$)/);
  7  |   });
  8  | 
  9  |   test("course page redirects when not signed in", async ({ page }) => {
  10 |     await page.goto("/course/1");
  11 |     await expect(page).toHaveURL(/\/(login|$)/);
  12 |   });
  13 | 
  14 |   test("account page redirects when not signed in", async ({ page }) => {
  15 |     await page.goto("/account");
  16 |     await expect(page).toHaveURL(/\/(login|$)/);
  17 |   });
  18 | 
  19 |   test("team page redirects when not signed in", async ({ page }) => {
  20 |     await page.goto("/team");
  21 |     await expect(page).toHaveURL(/\/(login|$)/);
  22 |   });
  23 | 
  24 |   test("admin page redirects when not signed in", async ({ page }) => {
  25 |     await page.goto("/admin");
  26 |     await expect(page).toHaveURL(/\/(dashboard|login|$)/);
  27 |   });
  28 | });
  29 | 
  30 | test.describe("Public pages load without auth", () => {
  31 |   const publicPages = [
  32 |     { path: "/", title: /AESDR/ },
  33 |     { path: "/login", title: /AESDR/ },
  34 |     { path: "/signup", title: /AESDR/ },
  35 |     { path: "/terms", title: /Terms/i },
  36 |     { path: "/privacy", title: /Privacy/i },
  37 |     { path: "/refund-policy", title: /Refund/i },
  38 |     { path: "/contact", title: /Contact/i },
  39 |   ];
  40 | 
  41 |   for (const { path, title } of publicPages) {
  42 |     test(`${path} loads successfully`, async ({ page }) => {
  43 |       const response = await page.goto(path);
> 44 |       expect(response?.status()).toBeLessThan(400);
     |                                  ^ Error: expect(received).toBeLessThan(expected)
  45 |       await expect(page).toHaveTitle(title);
  46 |     });
  47 |   }
  48 | });
  49 | 
```