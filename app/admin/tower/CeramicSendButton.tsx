"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

import { ConfirmDialog } from "@/components/ConfirmDialog";

/**
 * The send button — founder-booked design (2026-07-15): a mother-of-pearl
 * plinth, a kiln-emerald cap, and the word raised out of the cap's own glaze
 * (bump-mapped height field — no painted edges; the letters are shaded by the
 * same lights as the ceramic). Live WebGL, self-contained, no libraries.
 *
 * It is a real submit button: place it inside a <form action={oneClickSend}>.
 * `label` is fired into the glaze — SEND at rest; the page re-renders it as
 * SENT ✓ / HELD / RETRY from the queue row's post-press status.
 */
export default function CeramicSendButton({
  label,
  confirmMessage,
  title,
}: {
  label: string;
  confirmMessage?: string;
  title?: string;
}) {
  const { pending } = useFormStatus();
  const [asking, setAsking] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const apiRef = useRef<{ setLabel: (l: string) => void } | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (!apiRef.current) {
      apiRef.current = initCeramic(canvasRef.current, label) ?? null;
    } else {
      apiRef.current.setLabel(label);
    }
  }, [label]);

  const canvas = (
    <canvas
      ref={canvasRef}
      width={560}
      height={520}
      style={{
        width: "185px",
        height: "172px",
        display: "block",
        transform: pending ? "translateY(3px) scale(0.985)" : undefined,
        filter: pending ? "brightness(0.94)" : undefined,
        transition: "transform 120ms ease, filter 120ms ease",
      }}
    />
  );

  const button = (type: "submit" | "button", onClick?: () => void) => (
    <button
      type={type}
      onClick={onClick}
      disabled={pending}
      aria-busy={pending}
      title={title}
      style={{ background: "none", border: "none", padding: 0, cursor: pending ? "wait" : "pointer" }}
    >
      {canvas}
    </button>
  );

  if (!confirmMessage) return button("submit");
  return (
    <>
      {button("button", () => setAsking(true))}
      {asking && (
        <ConfirmDialog
          message={confirmMessage}
          confirmLabel="Send it"
          confirmType="submit"
          onCancel={() => setAsking(false)}
        />
      )}
    </>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   The renderer. Lathe geometry (pearl plinth + emerald cap, true bevels),
   glaze lighting (key/fill, fresnel, studio reflection, baked AO in the cap
   seam), pearl iridescence by viewing angle, iris face texture, and the
   lettering as a bump-mapped height field in the cap's own material.
──────────────────────────────────────────────────────────────────────────── */

/* eslint-disable @typescript-eslint/no-explicit-any */

const IRIS = ["#FF006E", "#FF6B00", "#F59E0B", "#10B981", "#38BDF8", "#8B5CF6", "#FF006E"];
const B = 0.05, R = 1.0, H = 0.26, CR = 0.62, CH = 0.24, DOME = 0.028;

type ProfilePt = { r: number; z: number; face: number; region: number; crease: boolean };

function buildProfile(): ProfilePt[] {
  const p: ProfilePt[] = [];
  const pt = (r: number, z: number, face = 0, region = 0, crease = false) =>
    p.push({ r, z, face, region, crease });
  pt(R, 0.002, 0, 0, true);
  pt(R, H - B);
  for (let i = 1; i <= 6; i++) {
    const a = (i / 6) * (Math.PI / 2);
    pt(R - B + B * Math.cos(a), H - B + B * Math.sin(a), 0, i > 3 ? 1 : 0);
  }
  for (let j = 1; j <= 6; j++) {
    const r = R - B + (CR - (R - B)) * (j / 6);
    pt(r, H, 0, 1, j === 6);
  }
  pt(CR, H, 0, 2, true);
  pt(CR, H + CH - B, 0, 2);
  for (let k = 1; k <= 6; k++) {
    const a = (k / 6) * (Math.PI / 2);
    pt(CR - B + B * Math.cos(a), H + CH - B + B * Math.sin(a), k > 2 ? 1 : 0, 2);
  }
  for (let m = 1; m <= 10; m++) {
    const rr = (CR - B) * (1 - m / 10);
    pt(rr, H + CH + DOME * (1 - (rr / (CR - B)) ** 2), 1, 2);
  }
  return p;
}

function ao(p: ProfilePt): number {
  let v = 1.0;
  if (p.z <= H + 0.001 && p.r > CR - 0.001 && p.r < R - B + 0.001 && p.region === 1)
    v = Math.min(v, 0.42 + 0.58 * Math.min(1, (p.r - CR) / 0.26));
  if (Math.abs(p.r - CR) < 0.002 && p.z >= H - 0.001)
    v = Math.min(v, 0.42 + 0.58 * Math.min(1, (p.z - H) / (CH * 0.7)));
  if (p.z < 0.06) v = Math.min(v, 0.72 + (p.z / 0.06) * 0.28);
  return v;
}

function buildMesh() {
  const prof = buildProfile();
  const M = 96;
  const tang: [number, number][] = [];
  for (let i = 0; i < prof.length; i++) {
    let a = prof[Math.max(0, i - 1)], b = prof[Math.min(prof.length - 1, i + 1)];
    if (prof[i].crease && i + 1 < prof.length) { a = prof[i]; b = prof[i + 1]; }
    else if (prof[i].crease) { a = prof[i - 1]; b = prof[i]; }
    const dr = b.r - a.r, dz = b.z - a.z, len = Math.hypot(dr, dz) || 1;
    tang.push([dr / len, dz / len]);
  }
  const verts: number[] = [], idx: number[] = [];
  for (let s = 0; s <= M; s++) {
    const th = (s / M) * Math.PI * 2, c = Math.cos(th), sn = Math.sin(th);
    for (let q = 0; q < prof.length; q++) {
      const P = prof[q], t = tang[q];
      const nr = t[1], nz = -t[0];
      verts.push(
        P.r * c, P.z, P.r * sn,
        nr * c, nz, nr * sn,
        P.face, ao(P), P.region,
        ((P.r * c) / (CR - B)) * 0.5 + 0.5, ((P.r * sn) / (CR - B)) * 0.5 + 0.5,
      );
    }
  }
  const L = prof.length;
  for (let s = 0; s < M; s++)
    for (let q = 0; q < L - 1; q++) {
      const a0 = s * L + q, b0 = (s + 1) * L + q;
      idx.push(a0, b0, a0 + 1, a0 + 1, b0, b0 + 1);
    }
  return { v: new Float32Array(verts), i: new Uint32Array(idx) };
}

function persp(fov: number, asp: number, n: number, f: number) {
  const t = 1 / Math.tan(fov / 2);
  return [t / asp, 0, 0, 0, 0, t, 0, 0, 0, 0, (f + n) / (n - f), -1, 0, 0, (2 * f * n) / (n - f), 0];
}
function cross3(a: number[], b: number[]) {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}
function dot3(a: number[], b: number[]) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
function norm3(a: number[]) { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
function lookAt(e: number[], c: number[], u: number[]) {
  const z = norm3([e[0] - c[0], e[1] - c[1], e[2] - c[2]]);
  const x = norm3(cross3(u, z)), y = cross3(z, x);
  return [x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -dot3(x, e), -dot3(y, e), -dot3(z, e), 1];
}
function mul4(a: number[], b: number[]) {
  const o = new Array(16);
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 4; j++) {
      let v = 0;
      for (let k = 0; k < 4; k++) v += a[k * 4 + j] * b[i * 4 + k];
      o[i * 4 + j] = v;
    }
  return o;
}

/** Height field: white raised label on black; wide smooth ramp for tall slopes. */
function makeMask(w: number, label: string): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = c.height = w;
  const x = c.getContext("2d")!;
  x.fillStyle = "#000";
  x.fillRect(0, 0, w, w);
  x.translate(w / 2, w / 2);
  x.rotate(-0.782); // counter the model+camera azimuth so the word reads level
  x.scale(w / 512, w / 512);
  x.textAlign = "center";
  x.textBaseline = "middle";
  try { (x as any).letterSpacing = "10px"; } catch { /* older engines */ }
  x.font = "900 118px 'Arial Black', Arial, sans-serif";
  x.fillStyle = "#FFFFFF";
  const draw = () => x.fillText(label, 6, 0);
  try {
    x.filter = "blur(4.5px)"; draw();
    x.filter = "blur(2.2px)"; draw();
    x.filter = "blur(0.7px)"; draw();
    x.filter = "none";
  } catch { draw(); }
  return c;
}

const VS =
  "attribute vec3 aP; attribute vec3 aN; attribute float aF; attribute float aAO; attribute float aD; attribute vec2 aUV;" +
  "uniform mat4 uMVP; uniform mat4 uModel; varying vec3 vN; varying vec3 vP; varying float vF; varying float vAO; varying float vD; varying vec2 vUV;" +
  "void main(){ vN = mat3(uModel[0].xyz,uModel[1].xyz,uModel[2].xyz) * aN; vP = (uModel * vec4(aP,1.0)).xyz; vF = aF; vAO = aAO; vD = aD; vUV = aUV;" +
  " gl_Position = uMVP * vec4(aP,1.0); }";

const FS =
  "precision mediump float;" +
  "varying vec3 vN; varying vec3 vP; varying float vF; varying float vAO; varying float vD; varying vec2 vUV;" +
  "uniform vec3 uColor; uniform vec3 uEye; uniform sampler2D uTex; uniform sampler2D uMask; uniform float uGloss;" +
  "void main(){" +
  " vec3 Ng = normalize(vN); vec3 V = normalize(uEye - vP);" +
  " float m = 0.0; vec3 N = Ng; float slope = 0.0;" +
  " if (vF > 0.5) {" +
  "   m = texture2D(uMask, vUV).r;" +
  "   float e2 = 1.5/1024.0;" +
  "   float gx = texture2D(uMask, vUV + vec2(e2,0.0)).r - texture2D(uMask, vUV - vec2(e2,0.0)).r;" +
  "   float gy = texture2D(uMask, vUV + vec2(0.0,e2)).r - texture2D(uMask, vUV - vec2(0.0,e2)).r;" +
  "   N = normalize(Ng + vec3(-gx, 0.0, -gy) * 7.5);" +
  "   slope = clamp(length(vec2(gx, gy)) * 4.0, 0.0, 1.0);" +
  " }" +
  " vec3 body;" +
  " if (vD > 1.5) { body = uColor; }" +
  " else { float fr2 = pow(1.0 - max(dot(N,V),0.0), 1.15);" +
  "   float ph = fr2 * 5.6 + vP.x * 1.5 + vP.z * 1.1;" +
  "   vec3 irid = vec3(sin(ph), sin(ph + 2.094), sin(ph + 4.188)) * 0.5 + 0.5;" +
  "   body = vec3(0.935, 0.920, 0.900) + (irid - 0.5) * 0.17; }" +
  " vec3 tex = texture2D(uTex, vUV).rgb;" +
  " vec3 faceCol = mix(tex, uColor, smoothstep(0.42, 0.60, m));" +
  " vec3 base = mix(body, faceCol, clamp(vF,0.0,1.0));" +
  " vec3 L1 = normalize(vec3(-0.45, 0.9, 0.42)); vec3 L2 = normalize(vec3(0.75, 0.25, 0.55));" +
  " float wrap = pow(max(dot(N,L1),0.0) * 0.62 + 0.38, 1.25);" +
  " float d2 = max(dot(N,L2),0.0) * 0.22;" +
  " vec3 col = base * (0.30 + 0.78 * wrap + d2) * vAO;" +
  " vec3 refl = reflect(-V, N);" +
  " float envv = clamp(refl.y * 0.5 + 0.5, 0.0, 1.0);" +
  " vec3 env = mix(vec3(0.80,0.77,0.72), vec3(1.02,1.01,0.99), pow(envv,1.6));" +
  " float fres = pow(1.0 - max(dot(N,V),0.0), 3.2);" +
  " col += env * fres * 0.42 * vAO;" +
  " float s1 = pow(max(dot(reflect(-L1,N), V), 0.0), 140.0) * uGloss;" +
  " float s2 = pow(max(dot(reflect(-L2,N), V), 0.0), 34.0) * 0.30 * uGloss;" +
  " float s3 = pow(max(dot(reflect(-normalize(vec3(-0.1,0.95,-0.2)),N), V), 0.0), 420.0) * 0.9;" +
  " float calm = 1.0 - 0.75 * slope;" +
  " col += vec3(1.0,0.985,0.96) * ((s1 + s3) * calm + s2) * (0.55 + 0.45 * vAO);" +
  " col = pow(col, vec3(0.92));" +
  " gl_FragColor = vec4(col, 1.0); }";

function initCeramic(cv: HTMLCanvasElement, initialLabel: string) {
  const gl = cv.getContext("webgl", { antialias: true, alpha: true, premultipliedAlpha: true }) as WebGLRenderingContext | null;
  if (!gl) return null;
  const ext = gl.getExtension("OES_element_index_uint");
  const mesh = buildMesh();

  const sh = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  };
  const pr = gl.createProgram()!;
  gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS));
  gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(pr);
  gl.useProgram(pr);

  const vb = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vb);
  gl.bufferData(gl.ARRAY_BUFFER, mesh.v, gl.STATIC_DRAW);
  const ib = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.i, gl.STATIC_DRAW);
  const ST = 11 * 4;
  const attr = (name: string, size: number, off: number) => {
    const a = gl.getAttribLocation(pr, name);
    gl.enableVertexAttribArray(a);
    gl.vertexAttribPointer(a, size, gl.FLOAT, false, ST, off);
  };
  attr("aP", 3, 0); attr("aN", 3, 12); attr("aF", 1, 24); attr("aAO", 1, 28); attr("aD", 1, 32); attr("aUV", 2, 36);

  const texParams = () => {
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  };
  const tcv = document.createElement("canvas");
  tcv.width = tcv.height = 512;
  const tctx = tcv.getContext("2d")!;
  const tex = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex); texParams();
  const maskTex = gl.createTexture();
  const uploadMask = (label: string) => {
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, maskTex);
    texParams();
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, makeMask(1024, label));
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.activeTexture(gl.TEXTURE0);
  };
  uploadMask(initialLabel);
  gl.uniform1i(gl.getUniformLocation(pr, "uTex"), 0);
  gl.uniform1i(gl.getUniformLocation(pr, "uMask"), 1);

  const eye = [1.78, 2.42, 3.10], center = [0, 0.20, 0];
  const proj = persp(0.52, cv.width / cv.height, 0.1, 20);
  const view = lookAt(eye, center, [0, 1, 0]);
  const rotY = -0.26, cY = Math.cos(rotY), sY = Math.sin(rotY);
  const model = [cY, 0, -sY, 0, 0, 1, 0, 0, sY, 0, cY, 0, 0, 0, 0, 1];
  const mvp = mul4(proj, mul4(view, model));
  gl.uniformMatrix4fv(gl.getUniformLocation(pr, "uMVP"), false, new Float32Array(mvp));
  gl.uniformMatrix4fv(gl.getUniformLocation(pr, "uModel"), false, new Float32Array(model));
  gl.uniform3fv(gl.getUniformLocation(pr, "uColor"), [0.050, 0.400, 0.265]);
  gl.uniform3fv(gl.getUniformLocation(pr, "uEye"), eye as unknown as Float32List);
  gl.uniform1f(gl.getUniformLocation(pr, "uGloss"), 1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0, 0, 0, 0);
  const idxType = ext ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT;

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const drawIris = (t: number) => {
    const w = 512;
    const off = (t * 0.10) % 1;
    const g = tctx.createLinearGradient(-off * w * 2, 0, (2 - off * 2) * w, w * 0.6);
    for (let rep = 0; rep < 2; rep++)
      for (let i = 0; i < IRIS.length; i++)
        g.addColorStop(Math.min(1, (rep + i / (IRIS.length - 1)) / 2), IRIS[i]);
    tctx.fillStyle = g;
    tctx.fillRect(0, 0, w, w);
  };
  let raf = 0;
  const frame = (ms: number) => {
    drawIris(ms / 1000);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tcv);
    gl.viewport(0, 0, cv.width, cv.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, mesh.i.length, idxType, 0);
    if (!reduced) raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);

  return {
    setLabel(label: string) {
      uploadMask(label);
      if (reduced) requestAnimationFrame(frame); // one still frame with the new word
      void raf;
    },
  };
}
