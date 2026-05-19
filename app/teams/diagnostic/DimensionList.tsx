"use client";

import { useState } from "react";
import styles from "../teams.module.css";
import SpecSection from "../_components/SpecSection";

/**
 * Client component that renders the diagnostic dimensions with a
 * role-view toggle. Default view shows all 8 dimensions; SDR view
 * hides AE-only dimensions; AE view hides SDR-only dimensions.
 *
 * Receives the full dimensions array as a serialized prop from the
 * parent server component so all the dimension content stays
 * server-rendered for SEO + initial paint.
 */

export type Dimension = {
  number: string;
  name: string;
  role: "SDR" | "AE" | "Both";
  what: string;
  why: string;
  sampleItems: string[];
  typicalDelta: string;
};

type View = "All" | "SDR" | "AE";

export default function DimensionList({ dimensions }: { dimensions: Dimension[] }) {
  const [view, setView] = useState<View>("All");

  const filtered = dimensions.filter((d) => {
    if (view === "All") return true;
    return d.role === "Both" || d.role === view;
  });

  const VIEWS: View[] = ["All", "SDR", "AE"];

  return (
    <>
      <div className={styles.dimViewToggle}>
        <span className={styles.dimViewLabel}>View:</span>
        {VIEWS.map((v) => {
          const isActive = view === v;
          const hidden =
            v === "All" ? 0 : dimensions.filter((d) => d.role !== "Both" && d.role !== v).length;
          return (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              aria-pressed={isActive}
              className={`${styles.dimViewBtn} ${isActive ? styles.dimViewBtnActive : ""}`}
            >
              {v === "All" ? "All dimensions" : `${v} view`}
              {hidden > 0 && (
                <span className={styles.dimViewBadge}>−{hidden}</span>
              )}
            </button>
          );
        })}
      </div>

      {filtered.map((d) => (
        <SpecSection
          key={d.number}
          number={d.number}
          title={d.name}
          meta={[{ label: "Role", value: d.role }]}
        >
          <p className={styles.h4} style={{ marginTop: 8 }}>What it measures</p>
          <p className={styles.bodyDense} style={{ marginBottom: 16 }}>{d.what}</p>

          <p className={styles.h4} style={{ marginTop: 16 }}>Why it matters</p>
          <p className={styles.bodyDense} style={{ marginBottom: 16 }}>{d.why}</p>

          <p className={styles.h4} style={{ marginTop: 16 }}>Sample instrument items</p>
          <ul className={styles.specList}>
            {d.sampleItems.map((item) => (
              <li key={item}>
                <span style={{ fontFamily: "var(--mono)", fontSize: 14, color: "var(--ink)" }}>
                  {item}
                </span>
              </li>
            ))}
          </ul>

          <div className={styles.specCallout}>
            <strong style={{ fontStyle: "normal", color: "var(--ink)" }}>
              Typical delta over 6–8 weeks:{" "}
            </strong>
            {d.typicalDelta}
          </div>
        </SpecSection>
      ))}
    </>
  );
}
