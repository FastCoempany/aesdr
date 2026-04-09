export default function CourseLoading() {
  return (
    <main
      className="flex min-h-screen items-center justify-center"
      style={{ background: "#fff" }}
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2"
          style={{
            borderColor: "var(--line)",
            borderTopColor: "var(--theme)",
          }}
        />
        <span
          style={{
            fontFamily: "var(--mono)",
            fontSize: "11px",
            letterSpacing: ".1em",
            textTransform: "uppercase",
            color: "var(--text-muted, #94A3B8)",
          }}
        >
          Loading lesson...
        </span>
      </div>
    </main>
  );
}
