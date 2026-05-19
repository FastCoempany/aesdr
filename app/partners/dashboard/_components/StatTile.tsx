/**
 * Single stat tile for the affiliate dashboard. Pure presentation.
 */

interface Props {
  label: string;
  value: string | number;
  sub?: string;
  emphasis?: boolean;
}

export default function StatTile({ label, value, sub, emphasis = false }: Props) {
  return (
    <div
      style={{
        background: "#fff",
        border: emphasis ? "2px solid var(--crimson)" : "1px solid var(--light)",
        padding: "20px 22px",
      }}
    >
      <p
        style={{
          margin: 0,
          fontFamily: "var(--mono)",
          fontSize: 10,
          letterSpacing: ".25em",
          textTransform: "uppercase",
          color: "var(--muted)",
          marginBottom: 8,
        }}
      >
        {label}
      </p>
      <p
        style={{
          margin: 0,
          fontFamily: "var(--display)",
          fontStyle: "italic",
          fontWeight: 900,
          fontSize: 36,
          lineHeight: 1,
          color: emphasis ? "var(--crimson)" : "var(--ink)",
        }}
      >
        {value}
      </p>
      {sub && (
        <p
          style={{
            margin: "8px 0 0",
            fontFamily: "var(--serif)",
            fontSize: 13,
            color: "var(--muted)",
            lineHeight: 1.5,
          }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}
