/**
 * Typewriter primitives shared by every typed phase of the landing animation.
 *
 * `Seg` is an authored span (text + optional iris style); `Char` is a single
 * character with the same style metadata, used as the cursor walks the line.
 * `flattenSegs` explodes segments into per-character records; `buildHTML`
 * re-emits them as a single HTML string with iris spans grouped efficiently.
 */

import type { Seg } from "./copy";

export type Char = { ch: string; style: Seg["style"] };

export function flattenSegs(segs: Seg[]): Char[] {
  const out: Char[] = [];
  for (const seg of segs) {
    for (const ch of seg.text) out.push({ ch, style: seg.style });
  }
  return out;
}

export function buildHTML(arr: Char[], irisClass: string): string {
  let html = "";
  let cur: Seg["style"] | undefined = undefined;
  for (const { ch, style } of arr) {
    if (style !== cur) {
      if (cur) html += "</span>";
      if (style === "iris") html += `<span class="${irisClass}">`;
      cur = style;
    }
    html += ch;
  }
  if (cur) html += "</span>";
  return html;
}
