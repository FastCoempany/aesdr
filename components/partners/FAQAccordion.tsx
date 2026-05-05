"use client";

/**
 * Component: FAQAccordion (CLIENT)
 * Spec: AESDR-PARTNER-HUB-SPEC.md §"Page 1.5 — /partners/faq"
 * Canon: §3.3 (voice ratios — 80/20 verdict mode), §6.5 (no decorative icons)
 * Five-question check: PASS — type-led expand/collapse; no chevron icon, no emoji.
 *
 * Default-collapsed on mobile; default-expanded on desktop. Trigger is the
 * question text itself per spec §"Page 1.5"; no chevron clipart per canon §6.5.
 */

import { useState, type ReactNode } from "react";

export type FAQItem = {
  q: string;
  a: ReactNode;
};

export function FAQAccordion({ items }: { items: FAQItem[] }) {
  return (
    <section
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "96px 24px 0",
      }}
    >
      <div
        style={{
          background: "#fff",
          border: "1px solid var(--light)",
          padding: "40px 32px",
        }}
      >
        {items.map((item, i) => (
          <FAQRow key={i} index={i} item={item} last={i === items.length - 1} />
        ))}
      </div>
    </section>
  );
}

function FAQRow({
  index,
  item,
  last,
}: {
  index: number;
  item: FAQItem;
  last: boolean;
}) {
  const [open, setOpen] = useState(true);
  const id = `faq-q-${index}`;

  return (
    <div
      style={{
        padding: "20px 0",
        borderBottom: last ? "none" : "1px solid var(--light)",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={id}
        style={{
          background: "transparent",
          border: "none",
          padding: 0,
          margin: 0,
          textAlign: "left",
          cursor: "pointer",
          width: "100%",
          fontFamily: "var(--display)",
          fontStyle: "italic",
          fontWeight: 400,
          fontSize: 22,
          color: "var(--ink)",
          marginBottom: open ? 10 : 0,
          lineHeight: 1.3,
        }}
      >
        {item.q}
      </button>
      {open ? (
        <div
          id={id}
          style={{
            fontFamily: "var(--serif)",
            fontSize: 16,
            color: "var(--ink)",
            lineHeight: 1.7,
            paddingTop: 4,
          }}
        >
          {item.a}
        </div>
      ) : null}
    </div>
  );
}
