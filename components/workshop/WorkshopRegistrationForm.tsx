"use client";

/**
 * Workshop registration form. Client component (form interactivity).
 *
 * Per D07 (registration-page spec), D12 + canon §10.5 (SMS opt-in
 * separate, unchecked-by-default consent), D08 audience (first two
 * years + refresher cohort).
 *
 * Posts to /api/workshop-register. Success state is inline (no redirect).
 * Confirmation email is queued server-side via Resend.
 */

import { useState, type FormEvent } from "react";

interface Props {
  affiliateSlug: string;
  smsEnabled: boolean;
}

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success"; firstName: string }
  | { kind: "error"; message: string };

export default function WorkshopRegistrationForm({
  affiliateSlug,
  smsEnabled,
}: Props) {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [smsOptedIn, setSmsOptedIn] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus({ kind: "submitting" });

    const form = e.currentTarget;
    const fd = new FormData(form);

    // Pull UTM from current URL (server captures and stores).
    const params = new URLSearchParams(window.location.search);

    const payload = {
      affiliate_slug: affiliateSlug,
      email: String(fd.get("email") || ""),
      first_name: String(fd.get("first_name") || ""),
      role: String(fd.get("role") || "") as "AE" | "SDR",
      tenure_months: fd.get("tenure_months")
        ? Number(fd.get("tenure_months"))
        : null,
      sms_opted_in: smsOptedIn,
      phone_e164: smsOptedIn ? String(fd.get("phone_e164") || "") : null,
      utm_source: params.get("utm_source"),
      utm_medium: params.get("utm_medium"),
      utm_campaign: params.get("utm_campaign"),
    };

    try {
      const res = await fetch("/api/workshop-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body.ok) {
        setStatus({
          kind: "error",
          message: body.error || "Something went wrong. Try again in a minute.",
        });
        return;
      }
      setStatus({ kind: "success", firstName: payload.first_name });
    } catch {
      setStatus({
        kind: "error",
        message: "Couldn't reach the server. Try again in a minute.",
      });
    }
  }

  if (status.kind === "success") {
    return (
      <div className="workshop-form-success">
        <p>
          You&rsquo;re registered, {status.firstName}. Confirmation on its way to
          your inbox &mdash; check spam if it doesn&rsquo;t land in five minutes.
        </p>
        <p>
          A reminder hits twenty-four hours before, and another at three. See you
          on live.
        </p>
      </div>
    );
  }

  return (
    <form className="workshop-form" onSubmit={handleSubmit}>
      <label className="workshop-form-field">
        <span>Your work email</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="you@work.com"
        />
      </label>

      <label className="workshop-form-field">
        <span>First name</span>
        <input
          type="text"
          name="first_name"
          required
          autoComplete="given-name"
        />
      </label>

      <fieldset className="workshop-form-field">
        <legend>Your role</legend>
        <label className="workshop-form-radio">
          <input type="radio" name="role" value="AE" required />
          <span>AE</span>
        </label>
        <label className="workshop-form-radio">
          <input type="radio" name="role" value="SDR" required />
          <span>SDR</span>
        </label>
      </fieldset>

      <label className="workshop-form-field">
        <span>Months in the role (optional)</span>
        <input
          type="number"
          name="tenure_months"
          min={0}
          max={600}
          placeholder="e.g. 14"
        />
      </label>

      {smsEnabled && (
        <fieldset className="workshop-form-field">
          <legend>Three-hour reminder</legend>
          <label className="workshop-form-checkbox">
            <input
              type="checkbox"
              name="sms_opt_in"
              checked={smsOptedIn}
              onChange={(e) => setSmsOptedIn(e.target.checked)}
            />
            <span>
              Text me a reminder three hours before. Standard rates apply.
              Reply STOP to opt out. Sender: AESDR.
            </span>
          </label>
          {smsOptedIn && (
            <label className="workshop-form-field workshop-form-field-indent">
              <span>Mobile number</span>
              <input
                type="tel"
                name="phone_e164"
                required
                autoComplete="tel"
                placeholder="+15555551234"
                pattern="^\+[1-9]\d{1,14}$"
              />
            </label>
          )}
        </fieldset>
      )}

      <button
        type="submit"
        className="workshop-form-submit"
        disabled={status.kind === "submitting"}
      >
        {status.kind === "submitting" ? "Registering…" : "Register for the workshop"}
      </button>

      {status.kind === "error" && (
        <p className="workshop-form-error" role="alert">
          {status.message}
        </p>
      )}
    </form>
  );
}
