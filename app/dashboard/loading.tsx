export default function DashboardLoading() {
  return (
    <main
      className="min-h-screen px-6 py-0"
      style={{ background: "var(--bg-main)" }}
    >
      <div
        className="sticky top-0 z-50 -mx-6 flex items-center justify-between border-b px-[5%] py-5"
        style={{
          borderColor: "var(--line)",
          background: "rgba(2,6,23,0.9)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div
          className="h-4 w-20 animate-pulse rounded"
          style={{ background: "var(--bg-card)" }}
        />
        <div
          className="h-4 w-16 animate-pulse rounded"
          style={{ background: "var(--bg-card)" }}
        />
      </div>

      <div className="mx-auto w-full max-w-5xl py-16">
        <div className="mb-14 space-y-5">
          <div
            className="h-4 w-36 animate-pulse rounded"
            style={{ background: "var(--bg-card)" }}
          />
          <div
            className="h-12 w-64 animate-pulse rounded"
            style={{ background: "var(--bg-card)" }}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col gap-4 p-6 animate-pulse"
              style={{
                background: "var(--bg-panel)",
                border: "1px solid var(--line)",
              }}
            >
              <div
                className="h-3 w-16 rounded"
                style={{ background: "var(--bg-card)" }}
              />
              <div
                className="h-5 w-full rounded"
                style={{ background: "var(--bg-card)" }}
              />
              <div
                className="h-4 w-3/4 rounded"
                style={{ background: "var(--bg-card)" }}
              />
              <div
                className="h-4 w-1/2 rounded"
                style={{ background: "var(--bg-card)" }}
              />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
