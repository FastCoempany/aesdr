import { hashIp } from "@/lib/hash-ip";

// Re-exported so existing `import { hashIp } from "@/lib/req-meta"` call sites
// keep working; the implementation now lives in one place (R5-PI-8).
export { hashIp };

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
