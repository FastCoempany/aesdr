import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | AESDR",
  description: "Create your AESDR account to start the 12-course curriculum.",
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
