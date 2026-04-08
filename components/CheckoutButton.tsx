"use client";

export default function CheckoutButton({
  tier,
  label,
  className,
}: {
  tier: "individual" | "team";
  label: string;
  className?: string;
}) {
  async function handleClick() {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tier }),
    });

    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    }
  }

  return (
    <button onClick={handleClick} className={className}>
      {label}
    </button>
  );
}
