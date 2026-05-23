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
            borderColor: "var(--light)",
            borderTopColor: "var(--crimson)",
          }}
        />
        <span
          style={{
            fontFamily: "var(--mono)",
            fontSize: "11px",
            letterSpacing: ".1em",
            textTransform: "uppercase",
            color: "var(--muted)",
          }}
        >
          Loading lesson...
        </span>
      </div>
    </main>
  );
}
