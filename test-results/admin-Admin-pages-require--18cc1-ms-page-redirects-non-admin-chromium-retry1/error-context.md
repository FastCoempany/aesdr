# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin.spec.ts >> Admin pages require auth >> admin teams page redirects non-admin
- Location: tests\e2e\admin.spec.ts:30:7

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/(dashboard|login|$)/
Received string:  "http://localhost:3000/admin/teams"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    9 × unexpected value "http://localhost:3000/admin/teams"

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
          - generic [ref=e25]:
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
            - generic [ref=e49]:
              - generic [ref=e50]:
                - paragraph [ref=e52]:
                  - img [ref=e54]
                  - generic [ref=e58]: proxy.ts (12:38) @ proxy
                  - button "Open in editor" [ref=e59] [cursor=pointer]:
                    - img [ref=e61]
                - generic [ref=e64]:
                  - generic [ref=e65]: "10 | let supabaseResponse = NextResponse.next({ request });"
                  - generic [ref=e66]: 11 |
                  - generic [ref=e67]: "> 12 | const supabase = createServerClient("
                  - generic [ref=e68]: "| ^"
                  - generic [ref=e69]: 13 | process.env.NEXT_PUBLIC_SUPABASE_URL!,
                  - generic [ref=e70]: 14 | process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                  - generic [ref=e71]: "15 | {"
              - generic [ref=e72]:
                - generic [ref=e73]:
                  - paragraph [ref=e74]:
                    - text: Call Stack
                    - generic [ref=e75]: "22"
                  - button "Show 21 ignore-listed frame(s)" [ref=e76] [cursor=pointer]:
                    - text: Show 21 ignore-listed frame(s)
                    - img [ref=e77]
                - generic [ref=e79]:
                  - generic [ref=e80]:
                    - text: proxy
                    - button "Open proxy in editor" [ref=e81] [cursor=pointer]:
                      - img [ref=e82]
                  - text: proxy.ts (12:38)
          - generic [ref=e84]: "1"
          - generic [ref=e85]: "2"
        - contentinfo [ref=e86]:
          - region "Error feedback" [ref=e87]:
            - paragraph [ref=e88]:
              - link "Was this helpful?" [ref=e89] [cursor=pointer]:
                - /url: https://nextjs.org/telemetry#error-feedback
            - button "Mark as helpful" [ref=e90] [cursor=pointer]:
              - img [ref=e91]
            - button "Mark as not helpful" [ref=e94] [cursor=pointer]:
              - img [ref=e95]
    - generic [ref=e101] [cursor=pointer]:
      - button "Open Next.js Dev Tools" [ref=e102]:
        - img [ref=e103]
      - generic [ref=e106]:
        - button "Open issues overlay" [ref=e107]:
          - generic [ref=e108]:
            - generic [ref=e109]: "0"
            - generic [ref=e110]: "1"
          - generic [ref=e111]: Issue
        - button "Collapse issues badge" [ref=e112]:
          - img [ref=e113]
  - alert [ref=e115]
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
  15 |     expect([400, 403]).toContain(response.status());
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
> 32 |     await expect(page).toHaveURL(/\/(dashboard|login|$)/);
     |                        ^ Error: expect(page).toHaveURL(expected) failed
  33 |   });
  34 | });
  35 | 
```