"use client";

import { useState } from "react";

import {
  approveAffiliateCopy,
  declineAffiliateCopy,
  requestAffiliateCopyEdits,
} from "@/app/actions/affiliate";

type Mode = "approve" | "edits" | "decline";

const DECLINE_CATEGORIES = [
  { value: "ftc_disclosure_missing", label: "FTC disclosure missing" },
  { value: "misrepresentation", label: "Misrepresentation" },
  { value: "banned_phrasing", label: "Banned phrasing" },
  { value: "palette_or_visual_drift", label: "Palette / visual drift" },
  { value: "pricing_misstatement", label: "Pricing misstatement" },
  { value: "unverifiable_claim", label: "Unverifiable claim" },
  { value: "other", label: "Other" },
];

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "'Space Mono',monospace",
  fontSize: 10,
  letterSpacing: ".22em",
  textTransform: "uppercase",
  color: "#8B1A1A",
  marginBottom: 8,
};

const textareaStyle: React.CSSProperties = {
  width: "100%",
  fontFamily: "'Space Mono',monospace",
  fontSize: 14,
  lineHeight: 1.6,
  padding: "10px 14px",
  background: "#fff",
  color: "#1A1A1A",
  border: "1px solid #B5B0A8",
  minHeight: 120,
  resize: "vertical",
};

export default function ReviewActions({ submissionId }: { submissionId: string }) {
  const [mode, setMode] = useState<Mode>("approve");
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // R5-EE-11: confirm success so the reviewer doesn't re-submit (each submit
  // flips an affiliate's gate / strike count). Once an action lands we lock the
  // panel and show what happened instead of leaving live buttons.
  const [done, setDone] = useState<Mode | null>(null);

  if (done) {
    const doneCopy =
      done === "approve"
        ? "Approved — the affiliate has been notified."
        : done === "edits"
          ? "Edit requests sent — the affiliate has been notified."
          : "Declined — the affiliate has been notified.";
    return (
      <div
        role="status"
        style={{
          background: "#fff",
          border: "1px solid #E8E4DF",
          borderLeft: "3px solid #1A1A1A",
          padding: "20px 24px",
        }}
      >
        <p style={{ margin: 0, fontFamily: "'Space Mono',monospace", fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: "#8B1A1A", marginBottom: 8 }}>
          Done
        </p>
        <p style={{ margin: 0, fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 15, color: "#1A1A1A" }}>
          {doneCopy}
        </p>
      </div>
    );
  }

  return (
    <div style={{ background: "#fff", border: "1px solid #E8E4DF" }}>
      <div style={{ display: "flex", borderBottom: "1px solid #E8E4DF" }}>
        {(["approve", "edits", "decline"] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setError(null);
            }}
            style={{
              flex: 1,
              padding: "14px 18px",
              fontFamily: "'Barlow Condensed',sans-serif",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: ".15em",
              textTransform: "uppercase",
              background: mode === m ? "#1A1A1A" : "#FAF7F2",
              color: mode === m ? "#FAF7F2" : "#6B6B6B",
              border: "none",
              cursor: "pointer",
              borderRight: "1px solid #E8E4DF",
            }}
          >
            {m === "approve" ? "Approve" : m === "edits" ? "Request edits" : "Decline"}
          </button>
        ))}
      </div>

      <div style={{ padding: "20px 24px" }}>
        {mode === "approve" && (
          <form
            action={async (formData) => {
              setWorking(true);
              setError(null);
              try {
                formData.set("submissionId", submissionId);
                await approveAffiliateCopy(formData);
                setDone("approve");
              } catch (err) {
                setError(err instanceof Error ? err.message : "Failed.");
              } finally {
                setWorking(false);
              }
            }}
            style={{ display: "grid", gap: 16 }}
          >
            <div>
              <label htmlFor="reviewer_notes" style={labelStyle}>
                Notes for the affiliate (optional)
              </label>
              <textarea
                id="reviewer_notes"
                name="reviewer_notes"
                style={textareaStyle}
                placeholder="What worked, anything to keep in mind for next time…"
              />
            </div>
            {error && (
              <p role="alert" style={{ margin: 0, fontFamily: "'Space Mono',monospace", fontSize: 12, color: "#8B1A1A" }}>
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={working}
              style={{
                justifySelf: "start",
                fontFamily: "'Barlow Condensed',sans-serif",
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: ".15em",
                textTransform: "uppercase",
                color: "#fff",
                background: "#8B1A1A",
                border: "none",
                padding: "12px 24px",
                cursor: working ? "wait" : "pointer",
                opacity: working ? 0.7 : 1,
              }}
            >
              {working ? "Approving…" : "Approve & notify"}
            </button>
          </form>
        )}

        {mode === "edits" && (
          <form
            action={async (formData) => {
              setWorking(true);
              setError(null);
              try {
                formData.set("submissionId", submissionId);
                await requestAffiliateCopyEdits(formData);
                setDone("edits");
              } catch (err) {
                setError(err instanceof Error ? err.message : "Failed.");
              } finally {
                setWorking(false);
              }
            }}
            style={{ display: "grid", gap: 16 }}
          >
            <div>
              <label htmlFor="edit_requests" style={labelStyle}>
                What to change (required)
              </label>
              <textarea
                id="edit_requests"
                name="edit_requests"
                required
                style={textareaStyle}
                placeholder="Be specific — line edits, claim corrections, disclosure additions, palette swaps…"
              />
            </div>
            {error && (
              <p role="alert" style={{ margin: 0, fontFamily: "'Space Mono',monospace", fontSize: 12, color: "#8B1A1A" }}>
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={working}
              style={{
                justifySelf: "start",
                fontFamily: "'Barlow Condensed',sans-serif",
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: ".15em",
                textTransform: "uppercase",
                color: "#fff",
                background: "#1A1A1A",
                border: "none",
                padding: "12px 24px",
                cursor: working ? "wait" : "pointer",
                opacity: working ? 0.7 : 1,
              }}
            >
              {working ? "Sending…" : "Send edit requests"}
            </button>
          </form>
        )}

        {mode === "decline" && (
          <form
            action={async (formData) => {
              setWorking(true);
              setError(null);
              try {
                formData.set("submissionId", submissionId);
                await declineAffiliateCopy(formData);
                setDone("decline");
              } catch (err) {
                setError(err instanceof Error ? err.message : "Failed.");
              } finally {
                setWorking(false);
              }
            }}
            style={{ display: "grid", gap: 16 }}
          >
            <div>
              <label htmlFor="decline_category" style={labelStyle}>
                Category (counts toward three-strike)
              </label>
              <select
                id="decline_category"
                name="decline_category"
                required
                defaultValue=""
                style={{
                  fontFamily: "Georgia,serif",
                  fontSize: 14,
                  padding: "10px 14px",
                  background: "#fff",
                  color: "#1A1A1A",
                  border: "1px solid #B5B0A8",
                  width: "100%",
                }}
              >
                <option value="" disabled>Select a category…</option>
                {DECLINE_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="decline_reason" style={labelStyle}>
                Why (required)
              </label>
              <textarea
                id="decline_reason"
                name="decline_reason"
                required
                style={textareaStyle}
                placeholder="Specifics. The affiliate sees this exact text."
              />
            </div>
            {error && (
              <p role="alert" style={{ margin: 0, fontFamily: "'Space Mono',monospace", fontSize: 12, color: "#8B1A1A" }}>
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={working}
              style={{
                justifySelf: "start",
                fontFamily: "'Barlow Condensed',sans-serif",
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: ".15em",
                textTransform: "uppercase",
                color: "#fff",
                background: "#8B1A1A",
                border: "none",
                padding: "12px 24px",
                cursor: working ? "wait" : "pointer",
                opacity: working ? 0.7 : 1,
              }}
            >
              {working ? "Declining…" : "Decline & notify"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
