/**
 * Tower loading state (R5-EE-8). The tower runs long live-research queries; a
 * frozen blank page read as broken. This gives an immediate editorial skeleton
 * while the server component resolves.
 */
export default function TowerLoading() {
  return (
    <div>
      <p
        style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 10,
          letterSpacing: ".3em",
          textTransform: "uppercase",
          color: "#8B1A1A",
          margin: "0 0 6px",
        }}
      >
        Control Tower · Partnerships · Live
      </p>
      <h1
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 32,
          fontStyle: "italic",
          fontWeight: 700,
          margin: "0 0 32px",
          color: "#6B6B6B",
        }}
      >
        Loading the board…
      </h1>
      <div style={{ display: "grid", gap: 12 }}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              height: 64,
              border: "1px solid #E8E4DF",
              background:
                "linear-gradient(90deg, #fff 0%, #FAF7F2 50%, #fff 100%)",
              backgroundSize: "200% 100%",
              animation: "iris 1.4s linear infinite",
              opacity: 0.7,
            }}
          />
        ))}
      </div>
    </div>
  );
}
