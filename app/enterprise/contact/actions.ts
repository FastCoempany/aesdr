"use server";

import { headers } from "next/headers";
import { rateLimit } from "@/lib/rate-limit";
import { sendTeamsInquiryNotification } from "@/lib/email";
import { createHash } from "node:crypto";

/**
 * Server action for /enterprise/contact form submissions.
 *
 * Same proven pattern as the coming-soon bypass action — collapses
 * validation + side-effects into a single server response. No fetch/
 * cookie race conditions. Rate-limited per IP (5/hr).
 *
 * Returns a discriminated result the client uses to swap the form for
 * a success card (or display an inline error).
 */

const VALID_ROLES = new Set([
  "Sales leader",
  "Sales enablement / training",
  "RevOps / Sales Ops",
  "L&D / People Ops",
  "HR / Talent",
  "Fractional / agency",
  "Channel partner",
  "Other",
]);

const VALID_TEAM_SIZES = new Set([
  "1–9 AEs and SDRs",
  "10–24 AEs and SDRs",
  "25–49 AEs and SDRs",
  "50–99 AEs and SDRs",
  "100+ AEs and SDRs",
]);

const VALID_SOURCES = new Set([
  "hero",
  "hero-enterprise",
  "hero-whitelabel",
  "footer-cta",
  "nav",
  "partners",
  "pricing-custom",
  "pricing-wl",
  "direct",
]);

type Success = { ok: true };
type Failure = { ok: false; error: string };
export type TeamsInquiryResult = Success | Failure;

function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

export async function submitTeamsInquiry(formData: FormData): Promise<TeamsInquiryResult> {
  const headersList = await headers();
  const ipRaw =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    "unknown";
  const userAgent = headersList.get("user-agent") || "(unknown)";

  const rl = await rateLimit(`enterprise-inquiry:${ipRaw}`, {
    max: 5,
    windowMs: 60 * 60 * 1000,
  });
  if (!rl.success) {
    return { ok: false, error: "Too many submissions from this network. Try again in an hour." };
  }

  // Pull + trim every field
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const company = String(formData.get("company") || "").trim();
  const role = String(formData.get("role") || "").trim();
  const teamSize = String(formData.get("teamSize") || "").trim();
  const message = String(formData.get("message") || "").trim();
  const sourceRaw = String(formData.get("source") || "direct").trim();

  // Validation — explicit, not zod-heavy; messages stay friendly
  if (name.length < 2 || name.length > 120) {
    return { ok: false, error: "Please enter your name." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Please enter a valid work email." };
  }
  if (company.length < 2 || company.length > 200) {
    return { ok: false, error: "Please enter your company." };
  }
  if (!VALID_ROLES.has(role)) {
    return { ok: false, error: "Pick a role from the list." };
  }
  if (!VALID_TEAM_SIZES.has(teamSize)) {
    return { ok: false, error: "Pick a team size from the list." };
  }
  if (message.length > 2000) {
    return { ok: false, error: "Message is too long (2000 character max)." };
  }

  const source = VALID_SOURCES.has(sourceRaw) ? sourceRaw : "direct";

  const sent = await sendTeamsInquiryNotification({
    name,
    email,
    company,
    role,
    teamSize,
    message,
    source,
    ipHash: hashIp(ipRaw),
    userAgent,
    submittedAt: new Date().toISOString(),
  });

  if (!sent) {
    // Email infrastructure failed — still surface a friendly message
    // and log on the server side (sendTeamsInquiryNotification already
    // logs the underlying error).
    return {
      ok: false,
      error: "Couldn't send right now. Email hello@aesdr.com directly and we'll respond there.",
    };
  }

  return { ok: true };
}
