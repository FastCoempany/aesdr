import { describe, it, expect } from "vitest";
import {
  computeCommissionCents,
  resolveCommissionRate,
  DEFAULT_COMMISSION_RATE,
} from "@/lib/commission";

describe("resolveCommissionRate", () => {
  it("normalizes a stored percent (30.00) to a fraction (0.30)", () => {
    expect(resolveCommissionRate(30)).toBeCloseTo(0.3);
    expect(resolveCommissionRate(40)).toBeCloseTo(0.4);
  });

  it("passes through an already-fractional value", () => {
    expect(resolveCommissionRate(0.3)).toBeCloseTo(0.3);
  });

  it("falls back to default on null / undefined / non-positive / NaN", () => {
    expect(resolveCommissionRate(null)).toBe(DEFAULT_COMMISSION_RATE);
    expect(resolveCommissionRate(undefined)).toBe(DEFAULT_COMMISSION_RATE);
    expect(resolveCommissionRate(0)).toBe(DEFAULT_COMMISSION_RATE);
    expect(resolveCommissionRate(-5)).toBe(DEFAULT_COMMISSION_RATE);
    expect(resolveCommissionRate(Number.NaN)).toBe(DEFAULT_COMMISSION_RATE);
  });

  it("rejects an absurd configured rate (>100%)", () => {
    expect(resolveCommissionRate(150)).toBe(DEFAULT_COMMISSION_RATE); // 1.5 → default
  });
});

describe("computeCommissionCents", () => {
  it("computes 30% of a base to the nearest cent", () => {
    expect(computeCommissionCents(24900, 0.3)).toBe(7470); // $249 → $74.70
    expect(computeCommissionCents(29900, 0.3)).toBe(8970); // $299 → $89.70
  });

  it("rounds half up", () => {
    expect(computeCommissionCents(2499, 0.3)).toBe(750); // 749.7 → 750
  });

  it("returns 0 (never negative) on bad input", () => {
    expect(computeCommissionCents(0, 0.3)).toBe(0);
    expect(computeCommissionCents(-100, 0.3)).toBe(0);
    expect(computeCommissionCents(100, 0)).toBe(0);
    expect(computeCommissionCents(Number.NaN, 0.3)).toBe(0);
  });
});
