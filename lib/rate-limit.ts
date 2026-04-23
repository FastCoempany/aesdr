/**
 * Distributed rate limiter using Upstash Redis when configured.
 * Falls back to per-instance in-memory sliding window when Upstash env vars
 * are missing (useful for local dev without Redis).
 *
 * Callers MUST `await` the result.
 */

import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

interface RateLimitConfig {
  /** Maximum requests allowed in the window */
  max: number;
  /** Window duration in milliseconds */
  windowMs: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetMs: number;
}

// ── Upstash client (singleton) ──────────────────────────────────────────────

let upstashRedis: Redis | null = null;
function getUpstash(): Redis | null {
  if (upstashRedis) return upstashRedis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  upstashRedis = new Redis({ url, token });
  return upstashRedis;
}

// Cache Ratelimit instances per (max, windowMs) — the SDK recommends reuse.
const limiterCache = new Map<string, Ratelimit>();
function getLimiter(redis: Redis, max: number, windowMs: number): Ratelimit {
  const cacheKey = `${max}:${windowMs}`;
  const existing = limiterCache.get(cacheKey);
  if (existing) return existing;
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(max, `${windowMs} ms`),
    analytics: false,
    prefix: "aesdr_rl",
  });
  limiterCache.set(cacheKey, limiter);
  return limiter;
}

// ── In-memory fallback ──────────────────────────────────────────────────────

interface RateLimitEntry {
  timestamps: number[];
}
const memStore = new Map<string, RateLimitEntry>();
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function memCleanup(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  const cutoff = now - windowMs;
  for (const [key, entry] of memStore) {
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
    if (entry.timestamps.length === 0) memStore.delete(key);
  }
}

function memRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const cutoff = now - config.windowMs;
  memCleanup(config.windowMs);

  let entry = memStore.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    memStore.set(key, entry);
  }
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

  if (entry.timestamps.length >= config.max) {
    const oldestInWindow = entry.timestamps[0];
    return {
      success: false,
      remaining: 0,
      resetMs: oldestInWindow + config.windowMs - now,
    };
  }
  entry.timestamps.push(now);
  return {
    success: true,
    remaining: config.max - entry.timestamps.length,
    resetMs: config.windowMs,
  };
}

// ── Public API ──────────────────────────────────────────────────────────────

export async function rateLimit(
  key: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const redis = getUpstash();
  if (!redis) {
    return memRateLimit(key, config);
  }

  try {
    const limiter = getLimiter(redis, config.max, config.windowMs);
    const res = await limiter.limit(key);
    return {
      success: res.success,
      remaining: res.remaining,
      resetMs: Math.max(0, res.reset - Date.now()),
    };
  } catch {
    // If Upstash fails (network, outage), fall back to in-memory to fail open
    // on process, but still rate-limited per instance.
    return memRateLimit(key, config);
  }
}

/**
 * Extract client IP from request headers (for rate limit keying).
 */
export function getClientIP(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}
