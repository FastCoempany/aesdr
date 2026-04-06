import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | AESDR",
  description: "Sign in to access your AESDR courses.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
