import { describe, it, expect } from "vitest";
import { normalizeEmailForComparison } from "@/lib/affiliate";

// §8: an affiliate must not collect their own commission by buying through a
// gmail dot/plus alias of their own address. normalizeEmailForComparison is the
// pure core the isSelfReferral check compares on.
describe("normalizeEmailForComparison", () => {
  it("strips dots in the gmail local part", () => {
    expect(normalizeEmailForComparison("john.doe@gmail.com")).toBe("johndoe@gmail.com");
    expect(normalizeEmailForComparison("j.o.h.n@gmail.com")).toBe("john@gmail.com");
  });

  it("strips plus-addressing for gmail", () => {
    expect(normalizeEmailForComparison("johndoe+aesdr@gmail.com")).toBe("johndoe@gmail.com");
  });

  it("strips both dots and plus for gmail (the bypass)", () => {
    expect(normalizeEmailForComparison("john.doe+x@gmail.com")).toBe("johndoe@gmail.com");
  });

  it("treats googlemail.com like gmail", () => {
    expect(normalizeEmailForComparison("john.doe@googlemail.com")).toBe("johndoe@googlemail.com");
  });

  it("does NOT strip dots for non-gmail domains", () => {
    expect(normalizeEmailForComparison("john.doe@outlook.com")).toBe("john.doe@outlook.com");
    expect(normalizeEmailForComparison("john.doe@outlook.com")).not.toBe(
      normalizeEmailForComparison("johndoe@outlook.com"),
    );
  });

  it("strips plus-addressing for every domain", () => {
    expect(normalizeEmailForComparison("john+tag@outlook.com")).toBe("john@outlook.com");
    expect(normalizeEmailForComparison("a+b@company.io")).toBe("a@company.io");
  });

  it("lowercases and trims", () => {
    expect(normalizeEmailForComparison("  John.Doe@Gmail.com  ")).toBe("johndoe@gmail.com");
  });

  it("two aliases of the same gmail inbox collapse to one", () => {
    const a = normalizeEmailForComparison("John.Doe+promo@gmail.com");
    const b = normalizeEmailForComparison("johndoe@gmail.com");
    expect(a).toBe(b);
  });

  it("leaves a malformed (no-@) string lowercased, not crashing", () => {
    expect(normalizeEmailForComparison("not-an-email")).toBe("not-an-email");
  });
});
