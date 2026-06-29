import { describe, it, expect } from "vitest";
import { hasFtcDisclosure } from "@/lib/ftc-disclosure";

describe("hasFtcDisclosure", () => {
  it("passes on the common disclosure markers", () => {
    expect(hasFtcDisclosure("Loved this course. #ad")).toBe(true);
    expect(
      hasFtcDisclosure("Grab it here (affiliate link) — best $249 I've spent.")
    ).toBe(true);
    expect(
      hasFtcDisclosure("Heads up: I earn a commission if you buy through me.")
    ).toBe(true);
    expect(hasFtcDisclosure("This is a #sponsored post.")).toBe(true);
    expect(hasFtcDisclosure("Paid partnership with AESDR.")).toBe(true);
    expect(
      hasFtcDisclosure("Disclosure of a material connection: I get paid.")
    ).toBe(true);
    expect(hasFtcDisclosure("As an affiliate I may earn a commission.")).toBe(
      true
    );
    expect(hasFtcDisclosure("#affiliate of AESDR")).toBe(true);
  });

  it("fails on plain promotional copy with no disclosure", () => {
    expect(
      hasFtcDisclosure(
        "AESDR turned me from a nervous cold-caller into an AE who books meetings every week. The lessons are tight and practical."
      )
    ).toBe(false);
    expect(hasFtcDisclosure("")).toBe(false);
    expect(hasFtcDisclosure("   ")).toBe(false);
  });

  it("is case-insensitive", () => {
    expect(hasFtcDisclosure("Sponsored content below.")).toBe(true);
    expect(hasFtcDisclosure("#AD")).toBe(true);
    expect(hasFtcDisclosure("Grab the AFFILIATE LINK here")).toBe(true);
    expect(hasFtcDisclosure("I EARN A COMMISSION on every sale.")).toBe(true);
  });

  it("tolerates punctuation and hashtag wrapping around markers", () => {
    expect(hasFtcDisclosure("...best deal ever (#ad)")).toBe(true);
    expect(hasFtcDisclosure("#ad!")).toBe(true);
    expect(hasFtcDisclosure("Use my affiliate-link below.")).toBe(true);
    expect(hasFtcDisclosure("sponsored.")).toBe(true);
  });

  it("does not trivially false-positive on unrelated word usage", () => {
    // "commission" used as a quota/earnings noun — NOT a disclosure of a
    // material connection — must not pass on its own.
    expect(
      hasFtcDisclosure(
        "This course taught me to close bigger deals and grow my sales commission as an SDR."
      )
    ).toBe(false);
    // Hashtag near-misses for "#ad" shouldn't match the bare "#ad" marker.
    expect(hasFtcDisclosure("Big #advance in my pipeline this quarter.")).toBe(
      false
    );
    expect(hasFtcDisclosure("Check out my new #ads dashboard.")).toBe(false);
  });
});
