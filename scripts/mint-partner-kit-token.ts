/**
 * Mint a partner-kit access token from the command line.
 *
 * Usage:
 *   npx tsx scripts/mint-partner-kit-token.ts \
 *     --slug acme-newsletter \
 *     --label "Acme Newsletter (Jordan Doe)" \
 *     --days 90 \
 *     --notes "Pilot kickoff 2026-05-12"
 *
 * Loads .env.local for KIT_TOKEN_SECRET + Supabase service role.
 * Prints the access URL to stdout — copy and DM to the partner.
 */

import "dotenv/config";
import { mintToken } from "../lib/partner-kit-tokens";

function arg(name: string, fallback?: string): string | undefined {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx >= 0 && idx + 1 < process.argv.length) {
    return process.argv[idx + 1];
  }
  return fallback;
}

async function main() {
  const slug = arg("slug");
  const label = arg("label");
  const notes = arg("notes");
  const daysRaw = arg("days", "90");

  if (!slug) {
    console.error("Error: --slug is required");
    console.error("Usage: --slug <partner-slug> [--label <text>] [--days <n>] [--notes <text>]");
    process.exit(1);
  }
  if (!/^[a-z0-9-]+$/.test(slug)) {
    console.error("Error: --slug must be lowercase letters, digits, and hyphens only");
    process.exit(1);
  }

  const days = Math.max(1, Math.min(365, Number(daysRaw)));
  if (Number.isNaN(days)) {
    console.error("Error: --days must be a number");
    process.exit(1);
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aesdr.com";
  const result = await mintToken({
    partnerSlug: slug,
    partnerLabel: label,
    notes,
    expiresInDays: days,
  });

  const url = `${baseUrl}/partners/kit-private?t=${result.signed}`;
  console.log("");
  console.log("Token minted:");
  console.log(`  partner_slug:  ${slug}`);
  if (label) console.log(`  partner_label: ${label}`);
  console.log(`  expires_at:    ${result.expiresAt.toISOString()}`);
  console.log(`  tid:           ${result.tid}`);
  console.log("");
  console.log("Access URL (DM to partner):");
  console.log(`  ${url}`);
  console.log("");
}

main().catch((err) => {
  console.error("Mint failed:", err);
  process.exit(1);
});
