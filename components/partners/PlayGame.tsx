"use client";

/**
 * Component: PlayGame — "Signal or Noise" laser-zap game (CLIENT)
 * Spec: AESDR-PARTNER-HUB-SPEC.md (Phase 1, added per Q4 ratification 2026-05-04)
 * Canon: §1.5 (real operator, never guru), §1.6 (honesty), §3.1 (Rowan), §4.1 (banned vocab),
 *        §6.4 (iris reservation — none in game), §13 (honesty discipline)
 * Five-question check: PASS — type-led, cream + ink + crimson, no decorative icons,
 *                       no congratulatory overlays, voice-thumbnail passes.
 *
 * Mechanic per Q4: 60-second sales-judgment game. Statements appear in sequence.
 * Player aims a mono crosshair and clicks/taps to "zap" each statement they
 * judge as NOISE (LinkedIn-influencer fluff, banned vocab from canon §4.1).
 * Statements judged as SIGNAL (real operator-grade observations from canon
 * §3.1/§3.2 or production lessons) should be left alone — letting them pass
 * scores points; zapping them costs points.
 *
 * Brand-fit: the game teaches the canon by playing it. Per canon §1.5,
 * not engagement-farming — it's a 60-second taste of the operating-manual
 * register a partner-prospect either recognizes or doesn't.
 */

import { useEffect, useMemo, useRef, useState } from "react";

type Item = {
  id: number;
  text: string;
  // signal = real operator observation; noise = LinkedIn-influencer fluff
  kind: "signal" | "noise";
};

// Statements drawn from canon §3.1 (Rowan), §3.2 (Michael), §4.1 (banned),
// §5.3 (saas-norm cliches), and production-lesson register. No fabrication.
const STATEMENTS: Omit<Item, "id">[] = [
  // SIGNAL — real operator-grade observations
  { text: "Every month, they reset your number to zero.", kind: "signal" },
  { text: "Your onboarding was a crime scene.", kind: "signal" },
  { text: "You are not building a career. You are surviving one.", kind: "signal" },
  { text: "What's your actual close rate? Not the one you told your VP.", kind: "signal" },
  { text: "Can you survive three bad months in a row? Mentally? Financially?", kind: "signal" },
  { text: "I have a degree. From a university. With a campus.", kind: "signal" },
  { text: "If inbound dried up tomorrow, would you survive?", kind: "signal" },
  { text: "Your manager is already sorting the team into tiers.", kind: "signal" },
  { text: "We do not teach you to sell. We teach you to be the person who sells.", kind: "signal" },
  { text: "Are you getting better — or just getting by?", kind: "signal" },
  { text: "Borrowed trust is a merciless mirror.", kind: "signal" },
  { text: "The people advising you haven't carried a bag in a decade.", kind: "signal" },

  // NOISE — banned vocab from canon §4.1, plus saas-norm cliches per §5.3
  { text: "Crush your quota. Unleash your potential.", kind: "noise" },
  { text: "This is a complete game-changer for your career.", kind: "noise" },
  { text: "Unlock the mindset of a sales rockstar.", kind: "noise" },
  { text: "Rise and grind. Your hustle defines you.", kind: "noise" },
  { text: "Lead with value on every call.", kind: "noise" },
  { text: "Always be closing. The ABCs never change.", kind: "noise" },
  { text: "Be a thought leader in your space.", kind: "noise" },
  { text: "Leverage synergy across your buying committee.", kind: "noise" },
  { text: "Empower yourself to be a sales superstar.", kind: "noise" },
  { text: "Just add value and the deals will come.", kind: "noise" },
  { text: "Sales ninjas crush their numbers and never quit.", kind: "noise" },
  { text: "It's all about mindset. Believe and you'll achieve.", kind: "noise" },
];

const ROUND_DURATION_S = 60;
const SHOW_PER_ITEM_MS = 4000; // each statement visible 4s before timing out

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function PlayGame() {
  const [phase, setPhase] = useState<"idle" | "playing" | "done">("idle");
  const [score, setScore] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [letPass, setLetPass] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(ROUND_DURATION_S);
  const [activeIndex, setActiveIndex] = useState(0);
  const [items, setItems] = useState<Item[]>([]);
  const [zappedIds, setZappedIds] = useState<Set<number>>(new Set());
  const [crossHair, setCrossHair] = useState({ x: 0, y: 0 });
  const [zapEffect, setZapEffect] = useState<{ x: number; y: number; ok: boolean } | null>(null);
  const arenaRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function start() {
    const fresh: Item[] = shuffle(STATEMENTS).slice(0, 12).map((s, i) => ({ ...s, id: i }));
    setItems(fresh);
    setActiveIndex(0);
    setScore(0);
    setHits(0);
    setMisses(0);
    setLetPass(0);
    setZappedIds(new Set());
    setSecondsLeft(ROUND_DURATION_S);
    setPhase("playing");
  }

  // Timer
  useEffect(() => {
    if (phase !== "playing") return;
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setPhase("done");
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  // Auto-advance: each statement gets SHOW_PER_ITEM_MS to be zapped or pass.
  // Phase transitions live in the timer callback (or in zap()) — not in the
  // effect body — to satisfy react-hooks/set-state-in-effect.
  useEffect(() => {
    if (phase !== "playing") return;
    if (activeIndex >= items.length) return;
    const t = setTimeout(() => {
      const current = items[activeIndex];
      if (!zappedIds.has(current.id)) {
        // Item passed un-zapped
        if (current.kind === "signal") {
          setScore((s) => s + 10);
          setLetPass((p) => p + 1);
        } else {
          // Noise that passed un-zapped — neutral; you missed catching it
          setLetPass((p) => p + 1);
        }
      }
      const next = activeIndex + 1;
      setActiveIndex(next);
      if (next >= items.length) setPhase("done");
    }, SHOW_PER_ITEM_MS);
    return () => clearTimeout(t);
  }, [phase, activeIndex, items, zappedIds]);

  // Mouse tracking for crosshair
  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = arenaRef.current?.getBoundingClientRect();
    if (!rect) return;
    setCrossHair({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }

  function zap(item: Item, evt: React.MouseEvent<HTMLButtonElement>) {
    if (zappedIds.has(item.id)) return;
    const arenaRect = arenaRef.current?.getBoundingClientRect();
    if (arenaRect) {
      setZapEffect({
        x: evt.clientX - arenaRect.left,
        y: evt.clientY - arenaRect.top,
        ok: item.kind === "noise",
      });
      setTimeout(() => setZapEffect(null), 350);
    }
    setZappedIds((prev) => new Set(prev).add(item.id));

    if (item.kind === "noise") {
      // Correct zap
      setScore((s) => s + 10);
      setHits((h) => h + 1);
    } else {
      // Wrong zap (signal that should have passed)
      setScore((s) => Math.max(0, s - 10));
      setMisses((m) => m + 1);
    }
    const next = activeIndex + 1;
    setActiveIndex(next);
    if (next >= items.length) setPhase("done");
  }

  const verdict = useMemo(() => {
    if (phase !== "done") return null;
    if (score >= 80) return "Operator-grade. The catalog teaches the rest.";
    if (score >= 50) return "Mixed signal. The first three lessons exist for a reason.";
    if (score >= 20) return "You probably needed the curriculum. Apply.";
    return "If you got this score and you still want to be a partner — apply anyway. We part as adults.";
  }, [phase, score]);

  const current = items[activeIndex];

  return (
    <section
      style={{
        maxWidth: 960,
        margin: "0 auto",
        padding: "64px 24px 0",
      }}
    >
      <div
        style={{
          fontFamily: "var(--mono)",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          color: "var(--muted)",
          textAlign: "center",
          marginBottom: 16,
        }}
      >
        AESDR · 60-second judgment test
      </div>
      <h2
        style={{
          fontFamily: "var(--display)",
          fontStyle: "italic",
          fontWeight: 700,
          fontSize: "clamp(28px, 4vw, 40px)",
          color: "var(--ink)",
          textAlign: "center",
          marginBottom: 24,
          lineHeight: 1.2,
        }}
      >
        Can you tell signal from noise?
      </h2>
      <p
        style={{
          fontFamily: "var(--serif)",
          fontStyle: "italic",
          fontSize: 17,
          color: "var(--ink)",
          textAlign: "center",
          maxWidth: 640,
          margin: "0 auto 32px",
          lineHeight: 1.6,
        }}
      >
        Statements appear one at a time. Some are real operator-grade observations. Some are LinkedIn-influencer noise. <strong>Click to zap the noise. Let the signal pass.</strong> Wrong zap costs 10 points; correct zap earns 10. 60 seconds total.
      </p>

      <div
        ref={arenaRef}
        onMouseMove={phase === "playing" ? onMouseMove : undefined}
        style={{
          position: "relative",
          minHeight: 360,
          background: "#fff",
          border: "1px solid var(--light)",
          padding: 48,
          cursor: phase === "playing" ? "none" : "default",
          overflow: "hidden",
          textAlign: "center",
        }}
      >
        {/* HUD */}
        <div
          style={{
            position: "absolute",
            top: 16,
            left: 16,
            right: 16,
            display: "flex",
            justifyContent: "space-between",
            fontFamily: "var(--mono)",
            fontSize: 11,
            color: "var(--muted)",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}
        >
          <span>
            Score: <b style={{ color: "var(--ink)" }}>{score}</b>
          </span>
          <span>
            {phase === "playing"
              ? `${secondsLeft}s left`
              : phase === "done"
                ? "Round complete"
                : "Ready"}
          </span>
          <span>
            Zapped: <b style={{ color: "var(--ink)" }}>{hits + misses}</b>
          </span>
        </div>

        {/* Active statement */}
        {phase === "playing" && current ? (
          <button
            type="button"
            onClick={(e) => zap(current, e)}
            style={{
              fontFamily: "var(--display)",
              fontStyle: "italic",
              fontWeight: 700,
              fontSize: "clamp(20px, 2.6vw, 28px)",
              color: "var(--ink)",
              background: "transparent",
              border: "none",
              padding: "80px 24px 24px",
              maxWidth: 720,
              margin: "0 auto",
              cursor: "none",
              lineHeight: 1.4,
              textAlign: "center",
              display: "block",
              animation: "aesdr-fade-in 0.3s ease-out",
            }}
          >
            &ldquo;{current.text}&rdquo;
          </button>
        ) : null}

        {/* Idle / Done state */}
        {phase === "idle" ? (
          <div style={{ paddingTop: 100 }}>
            <button
              type="button"
              onClick={start}
              style={{
                fontFamily: "var(--cond)",
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "#fff",
                background: "var(--iris)",
                backgroundSize: "300% 100%",
                animation: "iris 4s linear infinite",
                padding: "18px 44px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Start →
            </button>
            <p
              style={{
                fontFamily: "var(--mono)",
                fontSize: 10,
                color: "var(--muted)",
                marginTop: 16,
                letterSpacing: "0.1em",
              }}
            >
              60 seconds · 12 statements · point and click
            </p>
          </div>
        ) : null}

        {phase === "done" ? (
          <div style={{ paddingTop: 80 }}>
            <div
              style={{
                fontFamily: "var(--display)",
                fontStyle: "italic",
                fontWeight: 700,
                fontSize: "clamp(36px, 5vw, 56px)",
                color: "var(--ink)",
                marginBottom: 16,
              }}
            >
              {score} points
            </div>
            <p
              style={{
                fontFamily: "var(--display)",
                fontStyle: "italic",
                fontSize: 22,
                color: "var(--crimson)",
                marginBottom: 32,
                lineHeight: 1.4,
              }}
            >
              {verdict}
            </p>
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: 11,
                color: "var(--muted)",
                marginBottom: 32,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              {hits} correct zaps · {misses} wrong zaps · {letPass} passed
            </div>
            <button
              type="button"
              onClick={start}
              style={{
                fontFamily: "var(--cond)",
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "var(--ink)",
                background: "transparent",
                border: "1.5px solid var(--ink)",
                padding: "14px 36px",
                cursor: "pointer",
                marginRight: 12,
              }}
            >
              Play again
            </button>
            <a
              href="/partners/apply"
              style={{
                display: "inline-block",
                fontFamily: "var(--cond)",
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "#fff",
                background: "var(--iris)",
                backgroundSize: "300% 100%",
                animation: "iris 4s linear infinite",
                padding: "14px 36px",
                textDecoration: "none",
              }}
            >
              Apply →
            </a>
          </div>
        ) : null}

        {/* Crosshair */}
        {phase === "playing" ? (
          <div
            aria-hidden
            style={{
              position: "absolute",
              left: crossHair.x - 12,
              top: crossHair.y - 12,
              width: 24,
              height: 24,
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                border: "1px solid var(--crimson)",
                borderRadius: "50%",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 11,
                left: -8,
                width: 40,
                height: 1,
                background: "var(--crimson)",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 11,
                top: -8,
                width: 1,
                height: 40,
                background: "var(--crimson)",
              }}
            />
          </div>
        ) : null}

        {/* Zap effect */}
        {zapEffect ? (
          <div
            aria-hidden
            style={{
              position: "absolute",
              left: zapEffect.x - 30,
              top: zapEffect.y - 30,
              width: 60,
              height: 60,
              border: `2px solid ${zapEffect.ok ? "var(--crimson)" : "var(--muted)"}`,
              borderRadius: "50%",
              pointerEvents: "none",
              animation: "aesdr-zap 0.35s ease-out forwards",
            }}
          />
        ) : null}
      </div>

      <style>{`
        @keyframes aesdr-fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes aesdr-zap {
          0% { transform: scale(0.6); opacity: 1; }
          100% { transform: scale(2.2); opacity: 0; }
        }
      `}</style>

      <p
        style={{
          fontFamily: "var(--serif)",
          fontStyle: "italic",
          fontSize: 14,
          color: "var(--muted)",
          textAlign: "center",
          marginTop: 24,
          maxWidth: 600,
          marginLeft: "auto",
          marginRight: "auto",
          lineHeight: 1.6,
        }}
      >
        Every statement here is either something AESDR actually says or something AESDR refuses to say. If you&rsquo;ve been around early-career SaaS sales for any length of time, you already know the difference. The game is just confirmation.
      </p>
    </section>
  );
}
