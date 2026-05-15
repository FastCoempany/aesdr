"use client";

import { useState } from "react";

import { track } from "@/lib/analytics";

/**
 * Free / consumer email providers — used to enforce work-email entry on the
 * Team tier (since Team plans need an org-level email for invoicing + L&D
 * reimbursement). Individual tiers accept any email.
 */
const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.uk",
  "ymail.com",
  "hotmail.com",
  "hotmail.co.uk",
  "outlook.com",
  "live.com",
  "msn.com",
  "aol.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "protonmail.com",
  "proton.me",
  "pm.me",
  "gmx.com",
  "gmx.de",
  "gmx.net",
  "mail.com",
  "yandex.com",
  "yandex.ru",
  "zoho.com",
  "fastmail.com",
  "fastmail.fm",
  "tutanota.com",
  "tutanota.de",
  "qq.com",
  "163.com",
  "126.com",
  "yeah.net",
  "naver.com",
  "daum.net",
  "hanmail.net",
]);

function isWorkEmail(email: string): boolean {
  const at = email.lastIndexOf("@");
  if (at === -1) return false;
  const domain = email.slice(at + 1).toLowerCase().trim();
  if (!domain) return false;
  return !FREE_EMAIL_DOMAINS.has(domain);
}

export default function CheckoutButton({
  tier,
  label,
  className,
  selectedRole,
}: {
  tier: "sdr" | "ae" | "team";
  label: string;
  className?: string;
  selectedRole?: "ae" | "sdr";
}) {
  const [loading, setLoading] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const isTeam = tier === "team";
  const placeholder = isTeam ? "Your work email" : "Your email";

  function validate(value: string): string {
    if (!value || !value.includes("@")) return "Enter a valid email.";
    if (isTeam && !isWorkEmail(value)) {
      return "Team plans need a work email — Gmail/Yahoo/Outlook addresses can't manage seats. Use your company domain.";
    }
    return "";
  }

  async function handleCheckout() {
    const validationError = validate(email);
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    setError("");
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier, email }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await res.json().catch(() => ({}));
      const urlHost = data.url ? new URL(data.url).hostname : "";
      if (data.url && (urlHost === "stripe.com" || urlHost.endsWith(".stripe.com"))) {
        window.location.href = data.url;
      } else {
        setError("Something went wrong. Please try again or email hello@aesdr.com.");
        setLoading(false);
      }
    } catch {
      clearTimeout(timeoutId);
      setError("Connection error. Please check your internet and try again.");
      setLoading(false);
    }
  }

  if (showEmail) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(""); }}
          onKeyDown={(e) => e.key === "Enter" && handleCheckout()}
          placeholder={placeholder}
          aria-label="Email address"
          autoFocus
          style={{
            fontFamily: "var(--serif)",
            fontSize: "16px",
            padding: "14px 16px",
            background: "var(--cream, #FAF7F2)",
            border: `1px solid ${error ? "var(--crimson, #8B1A1A)" : "var(--light, #E8E4DF)"}`,
            color: "var(--ink, #1A1A1A)",
            width: "100%",
          }}
        />
        {error && (
          <p
            role="alert"
            style={{
              fontFamily: "var(--mono)",
              fontSize: "11px",
              color: "var(--crimson, #8B1A1A)",
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            {error}
          </p>
        )}
        <button
          onClick={handleCheckout}
          className={className}
          disabled={loading || !email.includes("@")}
          style={loading ? { opacity: 0.6, cursor: "wait" } : undefined}
        >
          {loading ? "Loading..." : "Continue to Payment"}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => {
        track("pricing_cta_clicked", { tier, role: selectedRole });
        setShowEmail(true);
      }}
      className={className}
      disabled={loading}
    >
      {label}
    </button>
  );
}
