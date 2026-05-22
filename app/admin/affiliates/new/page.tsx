import Link from "next/link";

import { createAffiliate } from "@/app/actions/affiliate";

export const dynamic = "force-dynamic";

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "'Space Mono',monospace",
  fontSize: 10,
  letterSpacing: ".22em",
  textTransform: "uppercase",
  color: "#8B1A1A",
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  fontFamily: "Georgia,serif",
  fontSize: 14,
  padding: "8px 12px",
  background: "#fff",
  color: "#1A1A1A",
  border: "1px solid #B5B0A8",
  width: "100%",
};

export default function NewAffiliatePage() {
  return (
    <div style={{ maxWidth: 640 }}>
      <p style={{ marginBottom: 12 }}>
        <Link
          href="/admin/affiliates"
          style={{
            fontFamily: "'Space Mono',monospace",
            fontSize: 11,
            color: "#6B6B6B",
          }}
        >
          ← All affiliates
        </Link>
      </p>
      <h1
        style={{
          fontFamily: "'Playfair Display',Georgia,serif",
          fontStyle: "italic",
          fontWeight: 900,
          fontSize: "clamp(28px,4vw,36px)",
          lineHeight: 1.1,
          marginBottom: 8,
        }}
      >
        New affiliate.
      </h1>
      <p style={{ fontSize: 15, color: "#6B6B6B", marginBottom: 24, lineHeight: 1.65 }}>
        Lands in <code>vetting</code> status — they don&rsquo;t see anything
        in the dashboard until you set them <code>active</code>, which fires
        the onboarding email automatically.
      </p>

      <form
        action={createAffiliate}
        style={{
          background: "#fff",
          border: "1px solid #E8E4DF",
          padding: "24px 28px",
          display: "grid",
          gap: 18,
        }}
      >
        <div>
          <label htmlFor="slug" style={labelStyle}>
            Slug (URL-safe, lowercase)
          </label>
          <input
            id="slug"
            name="slug"
            type="text"
            required
            pattern="[a-z0-9-]{2,40}"
            placeholder="e.g. shawn-finder"
            style={inputStyle}
          />
        </div>

        <div>
          <label htmlFor="display_name" style={labelStyle}>
            Display name
          </label>
          <input
            id="display_name"
            name="display_name"
            type="text"
            required
            maxLength={120}
            style={inputStyle}
          />
        </div>

        <div>
          <label htmlFor="email" style={labelStyle}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            style={inputStyle}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label htmlFor="archetype" style={labelStyle}>
              Archetype
            </label>
            <select id="archetype" name="archetype" defaultValue="creator" style={inputStyle}>
              <option value="creator">creator</option>
              <option value="coach">coach</option>
              <option value="alumni">alumni</option>
              <option value="hybrid">hybrid</option>
              <option value="community">community</option>
            </select>
          </div>
          <div>
            <label htmlFor="sophistication_tier" style={labelStyle}>
              Sophistication tier
            </label>
            <select
              id="sophistication_tier"
              name="sophistication_tier"
              defaultValue="developing"
              style={inputStyle}
            >
              <option value="developing">developing (3-piece gate)</option>
              <option value="proven">proven (1-piece gate)</option>
            </select>
            <p style={{ margin: "6px 0 0", fontSize: 12, color: "#6B6B6B", lineHeight: 1.5 }}>
              Criteria in <code style={{ fontFamily: "'Space Mono',monospace", fontSize: 11 }}>docs/affiliate/tier-criteria.md</code>.
              Default to developing unless all three conditions clearly hold.
            </p>
          </div>
        </div>

        <div>
          <label htmlFor="application_id" style={labelStyle}>
            Application id (optional — links to affiliate_applications row)
          </label>
          <input
            id="application_id"
            name="application_id"
            type="text"
            placeholder="uuid"
            style={inputStyle}
          />
        </div>

        <button
          type="submit"
          style={{
            justifySelf: "start",
            fontFamily: "'Barlow Condensed',sans-serif",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: ".15em",
            textTransform: "uppercase",
            color: "#fff",
            background: "#8B1A1A",
            border: "none",
            padding: "12px 22px",
            cursor: "pointer",
          }}
        >
          Create affiliate
        </button>
      </form>
    </div>
  );
}
