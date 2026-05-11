import crypto from "node:crypto";

export function hashIp(ip: string | null | undefined): string | null {
  if (!ip) return null;
  return crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

export function readRequestMeta(headers: Headers): {
  ipHash: string | null;
  userAgent: string | null;
  referrer: string | null;
} {
  const fwd = headers.get("x-forwarded-for");
  const ip = fwd ? fwd.split(",")[0]?.trim() : null;
  return {
    ipHash: hashIp(ip),
    userAgent: headers.get("user-agent"),
    referrer: headers.get("referer"),
  };
}
