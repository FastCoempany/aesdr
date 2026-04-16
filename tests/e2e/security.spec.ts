import { test, expect } from "@playwright/test";

test.describe("XSS prevention", () => {
  test("signup page escapes script injection in email param", async ({ page }) => {
    await page.goto('/signup?email=<script>alert("xss")</script>');
    const content = await page.content();
    expect(content).not.toContain("<script>alert");
  });

  test("login page escapes injection in reason param", async ({ page }) => {
    await page.goto('/login?reason=<img+onerror=alert(1)+src=x>');
    const content = await page.content();
    expect(content).not.toContain("onerror=alert");
  });
});

test.describe("Security headers", () => {
  test("pages include security headers", async ({ request }) => {
    const res = await request.get("/");
    const headers = res.headers();
    const hasFrameProtection =
      headers["x-frame-options"] || headers["content-security-policy"];
    expect(hasFrameProtection).toBeTruthy();
  });
});

test.describe("API methods", () => {
  test("POST-only routes reject GET", async ({ request }) => {
    const routes = ["/api/checkout", "/api/admin/refund", "/api/team/invite"];
    for (const route of routes) {
      const res = await request.get(route);
      expect(res.status()).toBeGreaterThanOrEqual(400);
    }
  });
});
