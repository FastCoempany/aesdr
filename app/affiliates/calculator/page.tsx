import type { Metadata } from "next";

import Calculator from "./Calculator";

export const metadata: Metadata = {
  title: "Affiliate earnings calculator | AESDR",
  description:
    "See what your audience could earn at 40% commission on a one-time $249/$299 course.",
};

export default function CalculatorPage() {
  return (
    <main style={{ background: "#FAF7F2", minHeight: "100vh" }}>
      <Calculator />
    </main>
  );
}
