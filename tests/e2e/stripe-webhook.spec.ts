import { test, expect } from "@playwright/test";

test.describe("Stripe webhook endpoint", () => {
  test("rejects requests without signature header", async ({ request }) => {
    const response = await request.post("/api/webhooks/stripe", {
      headers: { "Content-Type": "application/json" },
      data: JSON.stringify({
        type: "checkout.session.completed",
        data: { object: {} },
      }),
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toMatch(/signature/i);
  });

  test("rejects requests with invalid signature", async ({ request }) => {
    const response = await request.post("/api/webhooks/stripe", {
      headers: {
        "Content-Type": "application/json",
        "stripe-signature": "t=1234,v1=fake_signature",
      },
      data: JSON.stringify({
        type: "checkout.session.completed",
        data: { object: {} },
      }),
    });
    expect(response.status()).toBe(400);
  });

  test("rejects non-JSON body gracefully", async ({ request }) => {
    const response = await request.post("/api/webhooks/stripe", {
      headers: {
        "stripe-signature": "t=1234,v1=fake_signature",
      },
      data: "not-json-body",
    });
    expect(response.status()).toBeGreaterThanOrEqual(400);
    expect(response.status()).toBeLessThan(500);
  });
});
