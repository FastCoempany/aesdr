#!/usr/bin/env node
/**
 * compose.mjs — turn the raw recording (scripts/demo/out/raw/latest.webm)
 * into a final MP4 with the camera moves described in timeline.json.
 *
 * The camera is implemented as a sequence of cues. Each cue says: at
 * timestamp `t`, the viewer should be centered on `focus` at `zoom`x.
 * Between cues we interpolate linearly with an easing function, then
 * emit a single ffmpeg `crop` filter expression whose x/y/w/h are
 * piecewise functions of `t`. Output: H.264 1080p MP4.
 *
 * Why a single crop expression and not N concat'd segments? A single
 * expression with `if(between(t,...))` branches keeps ffmpeg's PTS
 * intact and avoids the audio/video desync that segment-concat
 * introduces. Renders in one pass.
 */

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve("scripts/demo");
const RAW = path.join(ROOT, "out/raw/latest.webm");
const OUT = path.join(ROOT, "out/demo.mp4");
const TIMELINE = JSON.parse(fs.readFileSync(path.join(ROOT, "timeline.json"), "utf8"));

const W = 1920;
const H = 1080;

if (!fs.existsSync(RAW)) {
  console.error(`[compose] missing raw recording at ${RAW} — run pnpm demo:record first.`);
  process.exit(1);
}

// Build piecewise expressions for the four crop dimensions. We
// interpolate (zoom, focusX, focusY) between consecutive cues, then
// derive (cropW, cropH, cropX, cropY) from those. Easing happens in
// the cue blend coefficient.
//
// ffmpeg expression grammar: `if(between(t,T0,T1), value, fallback)`,
// nested. We always end with a fallback to the last cue's static
// frame so the tail of the recording (if any) still has a sensible
// crop.

function cueBlend(prev, next, t) {
  // returns an ffmpeg-expression string that evaluates the blended
  // value of property `p` at time `t`, from `prev` to `next`.
  // alpha = (t - prev.t) / (next.t - prev.t) with easing applied.
  const span = next.t - prev.t;
  let alpha = `((${t}-${prev.t})/${span})`;
  if (prev.ease === "easeIn") alpha = `(${alpha}*${alpha})`;
  else if (prev.ease === "easeOut") alpha = `(1-(1-${alpha})*(1-${alpha}))`;
  else if (prev.ease === "easeInOut") alpha = `(0.5-0.5*cos(PI*${alpha}))`;
  return alpha;
}

function valueAt(t, prop) {
  // For each pair of consecutive cues, emit an `if(between, blend, ...)`.
  // Final fallback: the last cue's static value.
  let expr = String(getProp(TIMELINE[TIMELINE.length - 1], prop));
  for (let i = TIMELINE.length - 2; i >= 0; i--) {
    const prev = TIMELINE[i];
    const next = TIMELINE[i + 1];
    const a = cueBlend(prev, next, t);
    const pv = getProp(prev, prop);
    const nv = getProp(next, prop);
    const blend = `(${pv}+(${nv}-${pv})*${a})`;
    expr = `if(between(${t},${prev.t},${next.t}),${blend},${expr})`;
  }
  // Before first cue: hold first cue's static value
  const first = TIMELINE[0];
  expr = `if(lt(${t},${first.t}),${getProp(first, prop)},${expr})`;
  return expr;
}

function getProp(cue, prop) {
  if (prop === "zoom") return cue.zoom;
  if (prop === "fx") return cue.focus[0];
  if (prop === "fy") return cue.focus[1];
  throw new Error(`unknown prop ${prop}`);
}

const t = "t";
const zoom = valueAt(t, "zoom");
const fx = valueAt(t, "fx");
const fy = valueAt(t, "fy");

// cropW = W / zoom, cropH = H / zoom
// cropX = fx - cropW/2, clamped to [0, W-cropW]
// cropY = fy - cropH/2, clamped to [0, H-cropH]
const cropW = `(${W}/(${zoom}))`;
const cropH = `(${H}/(${zoom}))`;
const cropX = `max(0,min(${W}-${cropW},(${fx})-(${cropW})/2))`;
const cropY = `max(0,min(${H}-${cropH},(${fy})-(${cropH})/2))`;

const filter = [
  `crop=w='${cropW}':h='${cropH}':x='${cropX}':y='${cropY}'`,
  `scale=${W}:${H}:flags=lanczos`,
  `setsar=1`,
].join(",");

console.log("[compose] running ffmpeg…");
execFileSync(
  "ffmpeg",
  [
    "-y",
    "-i", RAW,
    "-vf", filter,
    "-c:v", "libx264",
    "-crf", "20",
    "-preset", "medium",
    "-pix_fmt", "yuv420p",
    "-an",
    OUT,
  ],
  { stdio: "inherit" },
);
console.log(`[compose] wrote ${OUT}`);
