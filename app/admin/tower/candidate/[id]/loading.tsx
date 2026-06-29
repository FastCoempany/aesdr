/**
 * Candidate-room loading state (R5-EE-8). Opening a room can run a live
 * research loop; without this the page sat frozen and blank. Editorial
 * skeleton so the navigation feels immediate.
 */
export default function CandidateRoomLoading() {
  return (
    <div>
      <p
        style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 11,
          color: "#6B6B6B",
          margin: "0 0 12px",
        }}
      >
        ← The board
      </p>
      <h1
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontStyle: "italic",
          fontWeight: 900,
          fontSize: "clamp(28px,4vw,40px)",
          lineHeight: 1.1,
          margin: "0 0 24px",
          color: "#6B6B6B",
        }}
      >
        Opening the room…
      </h1>
      <div style={{ display: "grid", gap: 12 }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              height: 88,
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
