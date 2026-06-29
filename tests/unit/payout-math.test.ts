import { describe, it, expect } from "vitest";
import { applyClawbacks, proRataClawbackCents } from "@/lib/payout-math";

// The clawback netting is where the worst money bugs hide (adversarial review
// #1-#4). These lock the contract: oldest-first consumption, partial carry-
// forward, no null/zero rows, never negative.
describe("applyClawbacks", () => {
  it("no clawbacks → net equals gross", () => {
    const r = applyClawbacks(10000, []);
    expect(r.netCents).toBe(10000);
    expect(r.clawbackTotal).toBe(0);
    expect(r.applications).toEqual([]);
  });

  it("one clawback smaller than gross → fully applied, net reduced", () => {
    const r = applyClawbacks(10000, [{ id: "a", amount_cents: 3000 }]);
    expect(r.netCents).toBe(7000);
    expect(r.clawbackTotal).toBe(3000);
    expect(r.applications).toEqual([{ id: "a", full: true, remaining: 0, applied: 3000 }]);
  });

  it("clawback equal to gross → net 0, fully applied", () => {
    const r = applyClawbacks(5000, [{ id: "a", amount_cents: 5000 }]);
    expect(r.netCents).toBe(0);
    expect(r.applications[0]).toMatchObject({ full: true, remaining: 0 });
  });

  it("clawback larger than gross → partial, remainder carries forward", () => {
    const r = applyClawbacks(2000, [{ id: "a", amount_cents: 5000 }]);
    expect(r.netCents).toBe(0);
    expect(r.clawbackTotal).toBe(2000);
    expect(r.applications).toEqual([{ id: "a", full: false, remaining: 3000, applied: 2000 }]);
  });

  it("multiple clawbacks under gross → all fully applied in order", () => {
    const r = applyClawbacks(10000, [
      { id: "a", amount_cents: 3000 },
      { id: "b", amount_cents: 4000 },
    ]);
    expect(r.netCents).toBe(3000);
    expect(r.applications.map((a) => a.id)).toEqual(["a", "b"]);
    expect(r.applications.every((a) => a.full)).toBe(true);
  });

  it("multiple clawbacks exceeding gross → some full, one partial, rest untouched", () => {
    const r = applyClawbacks(5000, [
      { id: "a", amount_cents: 3000 },
      { id: "b", amount_cents: 4000 },
      { id: "c", amount_cents: 1000 },
    ]);
    expect(r.netCents).toBe(0);
    expect(r.clawbackTotal).toBe(5000);
    expect(r.applications).toEqual([
      { id: "a", full: true, remaining: 0, applied: 3000 },
      { id: "b", full: false, remaining: 2000, applied: 2000 },
    ]);
  });

  it("null/zero amounts are skipped (never writes amount_cents=0)", () => {
    const r = applyClawbacks(10000, [
      { id: "a", amount_cents: null },
      { id: "b", amount_cents: 0 },
      { id: "c", amount_cents: 2000 },
    ]);
    expect(r.netCents).toBe(8000);
    expect(r.applications).toEqual([{ id: "c", full: true, remaining: 0, applied: 2000 }]);
  });

  it("zero gross → net 0, nothing applied", () => {
    const r = applyClawbacks(0, [{ id: "a", amount_cents: 3000 }]);
    expect(r.netCents).toBe(0);
    expect(r.applications).toEqual([]);
  });

  it("never returns negative net", () => {
    const r = applyClawbacks(100, [{ id: "a", amount_cents: 999999 }]);
    expect(r.netCents).toBe(0);
    expect(r.netCents).toBeGreaterThanOrEqual(0);
  });
});

// R4-MON-4 / decision #28: a partial refund reduces commission pro-rata; a full
// refund claws back all of it. refundedCents is Stripe's CUMULATIVE
// amount_refunded, so the value is monotonic and the caller's GREATEST() makes
// redelivery and incremental refunds safe.
describe("proRataClawbackCents", () => {
  it("no refund → 0", () => {
    expect(proRataClawbackCents(7500, 0, 29900)).toBe(0);
  });

  it("full refund (refunded == captured) → whole commission", () => {
    expect(proRataClawbackCents(7500, 29900, 29900)).toBe(7500);
  });

  it("over-refund (refunded > captured) → clamped to commission", () => {
    expect(proRataClawbackCents(7500, 40000, 29900)).toBe(7500);
  });

  it("half refund → half commission", () => {
    expect(proRataClawbackCents(8000, 15000, 30000)).toBe(4000);
  });

  it("partial refund rounds to the nearest cent", () => {
    // 7500 * 1000 / 30000 = 250
    expect(proRataClawbackCents(7500, 1000, 30000)).toBe(250);
    // 7475 * 9973 / 29900 = 2493.4… → 2493
    expect(proRataClawbackCents(7475, 9973, 29900)).toBe(2493);
  });

  it("is monotonic across incremental cumulative refunds", () => {
    const a = proRataClawbackCents(9000, 6000, 30000); // 20% → 1800
    const b = proRataClawbackCents(9000, 12000, 30000); // cumulative 40% → 3600
    expect(b).toBeGreaterThan(a);
    expect(a).toBe(1800);
    expect(b).toBe(3600);
  });

  it("zero commission / zero captured / negatives → 0 (never negative)", () => {
    expect(proRataClawbackCents(0, 10000, 30000)).toBe(0);
    expect(proRataClawbackCents(7500, 10000, 0)).toBe(0);
    expect(proRataClawbackCents(-100, 10000, 30000)).toBe(0);
    expect(proRataClawbackCents(7500, -5, 30000)).toBe(0);
  });
});
