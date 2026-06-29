import { describe, it, expect, afterEach } from "vitest";
import { hashIp } from "@/lib/hash-ip";

// R5-PI-8: required salt, deterministic, no guessable default.
describe("hashIp", () => {
  const orig = process.env.IP_HASH_SALT;
  afterEach(() => {
    if (orig === undefined) delete process.env.IP_HASH_SALT;
    else process.env.IP_HASH_SALT = orig;
  });

  it("returns null when the salt is unset (stores nothing, no guessable hash)", () => {
    delete process.env.IP_HASH_SALT;
    expect(hashIp("1.2.3.4")).toBeNull();
  });

  it("returns null for empty/nullish ip", () => {
    process.env.IP_HASH_SALT = "test-salt";
    expect(hashIp(null)).toBeNull();
    expect(hashIp(undefined)).toBeNull();
    expect(hashIp("")).toBeNull();
  });

  it("is deterministic and 32 hex chars", () => {
    process.env.IP_HASH_SALT = "test-salt";
    const a = hashIp("1.2.3.4");
    expect(a).toBe(hashIp("1.2.3.4"));
    expect(a).toMatch(/^[0-9a-f]{32}$/);
  });

  it("differs across ips and across salts", () => {
    process.env.IP_HASH_SALT = "salt-a";
    const a1 = hashIp("1.2.3.4");
    const a2 = hashIp("5.6.7.8");
    expect(a1).not.toBe(a2);
    process.env.IP_HASH_SALT = "salt-b";
    expect(hashIp("1.2.3.4")).not.toBe(a1);
  });
});
