import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";

export const metadata: Metadata = {
  title: "Admin | AESDR",
  robots: { index: false, follow: false },
};

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/teams", label: "Teams" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <main style={{ background: "#FAF7F2", color: "#1A1A1A", minHeight: "100vh" }}>
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          gap: "32px",
          padding: "16px 5%",
          borderBottom: "1px solid #E8E4DF",
          background: "rgba(250,247,242,0.95)",
          backdropFilter: "blur(10px)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <Link
          href="/admin"
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "18px",
            fontWeight: 900,
            fontStyle: "italic",
            letterSpacing: ".05em",
            textDecoration: "none",
            color: "#8B1A1A",
          }}
        >
          AESDR Admin
        </Link>
        <div style={{ display: "flex", gap: "24px" }}>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: "11px",
                letterSpacing: ".15em",
                textTransform: "uppercase",
                textDecoration: "none",
                color: "#6B6B6B",
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div style={{ marginLeft: "auto" }}>
          <Link
            href="/dashboard"
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: "11px",
              letterSpacing: ".1em",
              textTransform: "uppercase",
              textDecoration: "none",
              color: "#6B6B6B",
            }}
          >
            Back to Course
          </Link>
        </div>
      </nav>
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 5%" }}>
        {children}
      </div>
    </main>
  );
}
