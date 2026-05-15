const TESTIMONIALS = [
  { quote: "I've been an SDR for 14 months and nobody taught me half of what's in Course 1. The manager archetypes alone changed how I handle my 1:1s.", name: "Jordan M.", role: "SDR, Series B SaaS" },
  { quote: "No motivational BS. No 'crush your quota' energy. Just practical frameworks I use every week. That's rare.", name: "Taylor H.", role: "BDR Lead" },
  { quote: "I used the AE/SDR Alignment Contract from Course 3 in my actual job. My AE and I went from passive-aggressive Slack messages to a real working relationship.", name: "Marcus T.", role: "SDR, recently promoted to AE" },
  { quote: "The 72-hour strike plan in Course 12 saved my quarter. I was spiraling after losing two big deals and this framework gave me a concrete plan instead of panic.", name: "David L.", role: "AE, Series C Startup" },
  { quote: "I bought the team license for my 6 SDRs. The interactive format actually kept them engaged — I've never seen my team finish a training program before.", name: "Sarah W.", role: "SDR Manager" },
];

export default function Testimonials() {
  if (TESTIMONIALS.length === 0) return null;
  return (
    <section style={{ position: "relative", zIndex: 3, padding: "48px 8%", background: "var(--cream)" }}>
      <p style={{ fontFamily: "var(--mono)", fontSize: "10px", letterSpacing: ".25em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "16px" }}>Already Changing Lives</p>
      <div style={{ width: "60px", height: "2px", background: "var(--iris)", backgroundSize: "300% 100%", marginBottom: "24px" }} />
      <div style={{ display: "flex", gap: "20px", overflowX: "auto", overflowY: "hidden", WebkitOverflowScrolling: "touch", scrollbarWidth: "none" as const, paddingBottom: "4px" }}>
        {TESTIMONIALS.map((t, i) => (
          <div key={i} style={{ flex: "0 0 280px", background: "#fff", border: "1px solid var(--light)", padding: "28px" }}>
            <p style={{ fontFamily: "var(--serif)", fontSize: "15px", lineHeight: "1.7", color: "var(--muted)", marginBottom: "12px", fontStyle: "italic" }}>&ldquo;{t.quote}&rdquo;</p>
            <p style={{ fontFamily: "var(--cond)", fontSize: "13px", fontWeight: 700, color: "var(--ink)" }}>{t.name}</p>
            <p style={{ fontFamily: "var(--mono)", fontSize: "9px", color: "var(--muted)" }}>{t.role}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
