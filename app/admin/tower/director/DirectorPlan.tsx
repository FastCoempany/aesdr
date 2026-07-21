"use client";

import { useEffect, useState, useCallback } from "react";

import styles from "./director.module.css";
import { PHASES, WEEKS, REFERENCE, MANUAL, type Tag, type Audit } from "./plan";
import { useConfirm } from "@/components/ConfirmDialog";

/**
 * Interactive renderer for the Director plan. Collapsible weeks + tasks,
 * checkboxes and open/closed state persisted to localStorage (founder-only,
 * single user — no DB needed). Task bodies are trusted authored HTML.
 */

const LS_KEY = "aesdr-director-v1";

type Persisted = {
  checked: Record<string, boolean>;
  openWeeks: Record<string, boolean>;
  openTasks: Record<string, boolean>;
};

const TAG_LABEL: Record<Tag, string> = {
  you: "YOU",
  tower: "TOWER",
  auto: "AUTO",
  done: "DONE",
};

function isInfo(tags: Tag[]): boolean {
  return tags.includes("done");
}

// All checkbox-bearing (actionable) task ids, for progress math.
const ACTIONABLE_IDS = WEEKS.flatMap((w) =>
  w.tasks.filter((t) => !isInfo(t.tags)).map((t) => t.id),
);
const TOTAL = ACTIONABLE_IDS.length;

// ── The audit (stamped 2026-07-21): what's actually done in the world/repo,
//    independent of the founder's own checkboxes. Rendered as a chip per line.
const AUDIT_CHIP: Record<Audit["state"], { glyph: string; label: string; cls: string }> = {
  done: { glyph: "✓", label: "done", cls: "auditDone" },
  partial: { glyph: "◐", label: "in part", cls: "auditPart" },
  open: { glyph: "○", label: "open", cls: "auditOpen" },
};

function AuditChip({ audit }: { audit: Audit }) {
  if (audit.state === "done") {
    return (
      <span className={styles.doneStamp} title="audited 2026-07-21 — done in the world">
        ✓ done
      </span>
    );
  }
  const c = AUDIT_CHIP[audit.state];
  return (
    <span className={`${styles.auditChip} ${styles[c.cls]}`} title="audited 2026-07-21">
      {c.glyph} {c.label}
    </span>
  );
}

/** Per-week audit counts, so done-ness reads with everything collapsed. */
function weekAudit(tasks: (typeof WEEKS)[number]["tasks"]) {
  return tasks.reduce(
    (acc, t) => {
      if (t.audit) acc[t.audit.state] += 1;
      return acc;
    },
    { done: 0, partial: 0, open: 0 } as Record<Audit["state"], number>,
  );
}

const AUDIT_TALLY = WEEKS.flatMap((w) => w.tasks).reduce(
  (acc, t) => {
    if (t.audit) acc[t.audit.state] += 1;
    return acc;
  },
  { done: 0, partial: 0, open: 0 } as Record<Audit["state"], number>,
);

export default function DirectorPlan() {
  const [state, setState] = useState<Persisted>({
    checked: {},
    openWeeks: {},
    openTasks: {},
  });
  const [loaded, setLoaded] = useState(false);

  // Load persisted state after mount. Reading localStorage in a lazy initial
  // state would desync SSR (no window) from the client and cause a hydration
  // mismatch, so this is the correct load-on-mount pattern despite the rule.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setState({ checked: {}, openWeeks: {}, openTasks: {}, ...JSON.parse(raw) });
    } catch {
      /* ignore corrupt storage */
    }
    setLoaded(true);
  }, []);

  const persist = useCallback((next: Persisted) => {
    setState(next);
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(next));
    } catch {
      /* ignore quota / private-mode errors */
    }
  }, []);

  const toggleCheck = (id: string) =>
    persist({ ...state, checked: { ...state.checked, [id]: !state.checked[id] } });
  const toggleWeek = (id: string) =>
    persist({ ...state, openWeeks: { ...state.openWeeks, [id]: !state.openWeeks[id] } });
  const openWeek = (id: string) =>
    persist({ ...state, openWeeks: { ...state.openWeeks, [id]: true } });
  const toggleTask = (id: string) =>
    persist({ ...state, openTasks: { ...state.openTasks, [id]: !state.openTasks[id] } });
  const openTask = (id: string) =>
    persist({ ...state, openTasks: { ...state.openTasks, [id]: true } });

  const [confirm, confirmModal] = useConfirm();
  const reset = async () => {
    if (await confirm("Reset all checkboxes and collapse everything?", { confirmLabel: "Reset" })) {
      persist({ checked: {}, openWeeks: {}, openTasks: {} });
    }
  };

  // Click-to-copy on any command block (.d-cmd) inside the injected HTML.
  // Strips the inline "// ..." annotations (.c) so you paste a clean command.
  const handleCopy = (e: React.MouseEvent<HTMLElement>) => {
    const el = (e.target as HTMLElement).closest?.(".d-cmd") as HTMLElement | null;
    if (!el) return;
    const clone = el.cloneNode(true) as HTMLElement;
    clone.querySelectorAll(".c").forEach((n) => n.remove());
    const text = (clone.textContent || "").trim();
    navigator.clipboard?.writeText(text).then(
      () => {
        el.classList.add("d-cmd--copied");
        setTimeout(() => el.classList.remove("d-cmd--copied"), 1400);
      },
      () => {},
    );
  };

  const doneCount = loaded
    ? ACTIONABLE_IDS.filter((id) => state.checked[id]).length
    : 0;
  const pct = TOTAL ? Math.round((doneCount / TOTAL) * 100) : 0;

  // Weeks grouped by phase, in order.
  const weeksByPhase = (phaseId: string) => WEEKS.filter((w) => w.phase === phaseId);

  return (
    <div className={styles.frame}>
      {confirmModal}
      {/* ─── Sidebar ─── */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHead}>
          <div className={styles.sidebarTag}>The First 90</div>
          <div className={styles.sidebarTitle}>Director</div>
        </div>

        <div className={styles.progressWrap}>
          <div className={styles.progressLabel}>
            <span>Progress</span>
            <span>{doneCount}/{TOTAL} · {pct}%</span>
          </div>
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: `${pct}%` }} />
          </div>
        </div>
        <button className={styles.resetBtn} onClick={reset} type="button">
          Reset progress
        </button>

        <div className={styles.auditTally}>
          audited 2026-07-21
          <br />
          <span className={styles.auditDone}>✓ {AUDIT_TALLY.done} done</span>
          {" · "}
          <span className={styles.auditPart}>◐ {AUDIT_TALLY.partial} in part</span>
          {" · "}
          <span className={styles.auditOpen}>○ {AUDIT_TALLY.open} open</span>
        </div>

        <div className={styles.navGroup}>The manual</div>
        {MANUAL.map((r) => (
          <a
            key={r.id}
            href={`#${r.id}`}
            className={styles.navItem}
            onClick={() => openTask(r.id)}
          >
            {r.title}
          </a>
        ))}

        <div className={styles.navGroup}>The 90 days</div>
        <a href="#overview" className={styles.navItem}>
          <span className={styles.navNum}>00</span>Overview
        </a>
        {PHASES.map((p) => (
          <div key={p.id}>
            <a href={`#${p.id}`} className={styles.navItem}>
              <span className={styles.navNum}>{p.id.toUpperCase()}</span>
              {p.title}
            </a>
            {weeksByPhase(p.id).map((w) => (
              <a
                key={w.id}
                href={`#${w.id}`}
                className={styles.navItem}
                style={{ paddingLeft: 30, fontSize: 12 }}
                onClick={() => openWeek(w.id)}
              >
                {w.tag.split(" · ")[0]}
              </a>
            ))}
          </div>
        ))}

        <div className={styles.navGroup}>The toolkit</div>
        {REFERENCE.map((r) => (
          <a
            key={r.id}
            href={`#${r.id}`}
            className={styles.navItem}
            onClick={() => openTask(r.id)}
          >
            {r.title}
          </a>
        ))}

        <div className={styles.navGroup}>The board</div>
        <a href="/admin/tower" className={styles.navItem}>
          <span className={styles.navNum}>↩</span>Control Tower
        </a>
        <a href="/partnerships-os" className={styles.navItem} target="_blank" rel="noopener">
          <span className={styles.navNum}>↗</span>Legacy OS doc
        </a>
      </aside>

      {/* ─── Main column ─── */}
      <main className={styles.main} onClick={handleCopy}>
        {/* Overview ribbon — collapsible like everything else */}
        <section id="overview" className={styles.section}>
          <div className={styles.weekAcc}>
            <div
              className={styles.weekBar}
              onClick={() => toggleTask("overview-arc")}
              role="button"
              tabIndex={0}
            >
              <span className={`${styles.weekCaret} ${state.openTasks["overview-arc"] ? styles.weekCaretOpen : ""}`}>▾</span>
              <span className={styles.weekBarTitle}>The arc — three phases, one running machine</span>
              <span className={styles.weekCount}>overview</span>
            </div>
            {state.openTasks["overview-arc"] && (
              <div className={styles.weekBody} style={{ paddingTop: 14 }}>
                <div className={styles.ribbon} style={{ margin: 0 }}>
                  {PHASES.map((p) => (
                    <div key={p.id} className={styles.ribCard}>
                      <div className={styles.ribNum}>{p.num}</div>
                      <div className={styles.ribTitle}>{p.title}</div>
                      <div className={styles.ribGoal}>{p.goal}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ─── The Manual (read-me-first: switch, agents, go-live) ─── */}
        <section id="manual">
          <div className={styles.phaseHead}>
            <p className={styles.secEyebrow}>The manual · read me first</p>
            <h2 className={styles.secTitle}>How it runs, and how to turn it on.</h2>
          </div>
          {MANUAL.map((r) => {
            const open = !!state.openTasks[r.id];
            return (
              <div key={r.id} id={r.id} className={styles.weekAcc}>
                <div className={styles.weekBar} onClick={() => toggleTask(r.id)} role="button" tabIndex={0}>
                  <span className={`${styles.weekCaret} ${open ? styles.weekCaretOpen : ""}`}>▾</span>
                  <span className={styles.weekBarTitle}>{r.title}</span>
                  {r.audit && <AuditChip audit={r.audit} />}
                  <span className={styles.weekCount}>{r.subtitle}</span>
                </div>
                {open && (
                  <div className={styles.weekBody} style={{ paddingTop: 14 }}>
                    {r.audit?.note && <p className={styles.auditNote}>{r.audit.note}</p>}
                    <div dangerouslySetInnerHTML={{ __html: r.bodyHtml }} />
                  </div>
                )}
              </div>
            );
          })}
        </section>

        {/* Phases → weeks → tasks */}
        {PHASES.map((p) => (
          <section key={p.id} id={p.id}>
            <div className={styles.phaseHead}>
              <p className={styles.secEyebrow}>{p.num}</p>
              <h2 className={styles.secTitle}>{p.title}</h2>
            </div>

            {weeksByPhase(p.id).map((w) => {
              const weekOpen = !!state.openWeeks[w.id];
              const weekActionable = w.tasks.filter((t) => !isInfo(t.tags));
              const weekDone = weekActionable.filter((t) => state.checked[t.id]).length;
              const wa = weekAudit(w.tasks);
              return (
                <div key={w.id} id={w.id} className={styles.weekAcc}>
                  <div
                    className={styles.weekBar}
                    onClick={() => toggleWeek(w.id)}
                    role="button"
                    tabIndex={0}
                  >
                    <span className={`${styles.weekCaret} ${weekOpen ? styles.weekCaretOpen : ""}`}>▾</span>
                    <span className={styles.weekBarTag}>{w.tag}</span>
                    <span className={styles.weekBarTitle}>{w.title}</span>
                    <span className={styles.weekCount}>
                      {wa.done > 0 && <span className={styles.wtDone}>✓{wa.done}</span>}
                      {wa.partial > 0 && <span className={styles.wtPart}> ◐{wa.partial}</span>}
                      {wa.open > 0 && <span className={styles.wtOpen}> ○{wa.open}</span>}
                      {weekActionable.length > 0 && ` · ${weekDone}/${weekActionable.length} ticked`}
                    </span>
                  </div>

                  {weekOpen && (
                    <div className={styles.weekBody}>
                      <p className={styles.weekIntroLine}>{w.intro}</p>
                      {w.tasks.map((t) => {
                        const info = isInfo(t.tags);
                        const checked = !!state.checked[t.id];
                        const taskOpen = !!state.openTasks[t.id];
                        return (
                          <div
                            key={t.id}
                            className={`${styles.taskAcc} ${checked ? styles.taskDone : ""} ${
                              t.audit?.state === "done" ? styles.rowDone : ""
                            }`}
                          >
                            <div className={styles.taskBar} onClick={() => toggleTask(t.id)}>
                              {!info && (
                                <span
                                  className={`${styles.checkbox} ${checked ? styles.checkboxOn : ""}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleCheck(t.id);
                                  }}
                                  role="checkbox"
                                  aria-checked={checked}
                                  tabIndex={0}
                                >
                                  {checked ? "✓" : ""}
                                </span>
                              )}
                              <div className={styles.taskBarMain}>
                                <div className={styles.taskBarTitle}>
                                  {t.title}
                                  {t.audit && <AuditChip audit={t.audit} />}
                                </div>
                                <div className={styles.taskBarTags}>
                                  {t.tags.map((tag) => (
                                    <span
                                      key={tag}
                                      className={`${styles.tag} ${
                                        tag === "you"
                                          ? styles.you
                                          : tag === "tower"
                                          ? styles.tower
                                          : tag === "auto"
                                          ? styles.auto
                                          : ""
                                      }`}
                                    >
                                      {TAG_LABEL[tag]}
                                    </span>
                                  ))}
                                  {t.automatable && (
                                    <span className={styles.autoChip}>Can be fully automated</span>
                                  )}
                                </div>
                              </div>
                              <span className={`${styles.taskCaret} ${taskOpen ? styles.taskCaretOpen : ""}`}>▾</span>
                            </div>
                            {taskOpen && (
                              <div className={styles.taskBody}>
                                {t.audit?.note && (
                                  <p className={styles.auditNote}>{t.audit.note}</p>
                                )}
                                <div dangerouslySetInnerHTML={{ __html: t.bodyHtml }} />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </section>
        ))}

        {/* ─── Toolkit (reference shelf) ─── */}
        <section id="toolkit">
          <div className={styles.phaseHead}>
            <p className={styles.secEyebrow}>The toolkit · reference shelf</p>
            <h2 className={styles.secTitle}>Everything the plan points at, in one place.</h2>
          </div>
          {REFERENCE.map((r) => {
            const open = !!state.openTasks[r.id];
            return (
              <div key={r.id} id={r.id} className={styles.weekAcc}>
                <div className={styles.weekBar} onClick={() => toggleTask(r.id)} role="button" tabIndex={0}>
                  <span className={`${styles.weekCaret} ${open ? styles.weekCaretOpen : ""}`}>▾</span>
                  <span className={styles.weekBarTitle}>{r.title}</span>
                  {r.audit && <AuditChip audit={r.audit} />}
                  <span className={styles.weekCount}>{r.subtitle}</span>
                </div>
                {open && (
                  <div className={styles.weekBody} style={{ paddingTop: 14 }}>
                    {r.audit?.note && <p className={styles.auditNote}>{r.audit.note}</p>}
                    <div dangerouslySetInnerHTML={{ __html: r.bodyHtml }} />
                  </div>
                )}
              </div>
            );
          })}
        </section>

        <div className={styles.irisBar} style={{ marginTop: 60 }} />
        <p
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 10,
            letterSpacing: ".24em",
            textTransform: "uppercase",
            color: "#6B6B6B",
            marginTop: 12,
            textAlign: "center",
          }}
        >
          Director · The First 90 · embedded in the AESDR Control Tower
        </p>
      </main>
    </div>
  );
}
