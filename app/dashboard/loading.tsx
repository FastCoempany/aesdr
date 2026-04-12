export default function DashboardLoading() {
  return (
    <main
      className="min-h-screen"
      style={{
        background: "var(--bg-main)",
        animation: "dashFadeIn 500ms ease-out forwards",
      }}
    >
      <style>{`@keyframes dashFadeIn{from{opacity:0}to{opacity:1}}`}</style>

      {/* Nav skeleton */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-[5%] py-5"
        style={{
          borderBottom: "1px solid var(--line)",
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
      </nav>

      <div className="mx-auto w-full max-w-3xl px-6 py-16">
        {/* Header skeleton */}
        <header className="mb-16">
          <div
            className="mb-4 h-3 w-24 animate-pulse rounded"
            style={{ background: "var(--bg-card)" }}
          />
          <div
            className="h-10 w-64 animate-pulse rounded"
            style={{ background: "var(--bg-card)" }}
          />
        </header>

        {/* Timeline skeleton */}
        <div className="flex flex-col" style={{ gap: "0" }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: "relative",
                paddingLeft: "48px",
                paddingBottom: "40px",
              }}
            >
              {/* Timeline line */}
              {i < 5 && (
                <div
                  style={{
                    position: "absolute",
                    left: "15px",
                    top: "32px",
                    bottom: "0",
                    width: "1px",
                    background: "var(--line)",
                  }}
                />
              )}

              {/* Node dot */}
              <div
                style={{
                  position: "absolute",
                  left: "8px",
                  top: "8px",
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  border: "1px solid var(--line)",
                }}
              />

              {/* Content */}
              <div className="animate-pulse" style={{ opacity: i > 2 ? 0.3 : 1 }}>
                <div
                  className="mb-2 h-2 w-16 rounded"
                  style={{ background: "var(--bg-card)" }}
                />
                <div
                  className="mb-3 h-5 rounded"
                  style={{ background: "var(--bg-card)", width: `${180 + (i * 17) % 80}px` }}
                />
                <div
                  className="h-4 rounded"
                  style={{ background: "var(--bg-card)", width: `${220 + (i * 31) % 120}px`, opacity: 0.6 }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
