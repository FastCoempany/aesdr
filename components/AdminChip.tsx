/**
 * AdminChip — top-center status pill that only renders for admin sessions.
 *
 * Purpose: when the founder is signed in as an admin (mrcoe7@gmail.com or
 * antaeus.coe@gmail.com per ADMIN_EMAILS), every gate in the app silently
 * lets them through (paywalls, partner-kit token gate, coming-soon, etc.).
 * That convenience comes with a risk: it's easy to forget you're seeing
 * the admin view of the site instead of what a normal user sees. The chip
 * is the constant reminder.
 *
 * Renders server-side only when isAdmin is true. Non-admin requests don't
 * ship any admin-related HTML or JS to the client.
 */

const STYLE: React.CSSProperties = {
  position: "fixed",
  top: 14,
  left: "50%",
  transform: "translateX(-50%)",
  zIndex: 500,
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "5px 12px",
  background: "var(--cream)",
  border: "1px solid var(--crimson)",
  fontFamily: "var(--mono)",
  fontSize: 10,
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  color: "var(--crimson)",
  pointerEvents: "none",
  userSelect: "none",
};

const DOT: React.CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: "50%",
  background: "var(--crimson)",
};

export default function AdminChip() {
  return (
    <div style={STYLE} aria-label="Admin mode" role="status">
      <span style={DOT} aria-hidden="true" />
      <span>Admin Mode</span>
    </div>
  );
}
