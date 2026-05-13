"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrthographicCamera } from "@react-three/drei";
import * as THREE from "three";

import { IntensityToggle, type Intensity } from "./IntensityToggle";

/**
 * HoleThreeLayer — Option C. Actual 3D rabbit holes via react-three-fiber.
 *
 * Each hole is a real 3D scene: a deep cylindrical pit cut into a flat
 * cream plane, surrounded by an instanced mesh of small irregular
 * "clod" spheres procedurally piled around the rim with asymmetric
 * bias. Real directional light + ambient + soft contact shadows.
 *
 * Cost: ~270kb gzipped runtime added (three + r3f + drei). Sandbox
 * branch only — would NOT ship as-is to production. This is the
 * comparison ceiling for "what 3D actually looks like."
 *
 * The Underland ink scaffolding (surface line, strata, tunnels, etc.)
 * is rendered as a normal SVG overlay UNDER the Canvas so we keep the
 * same architectural read of the page.
 */

const OP: Record<Intensity, number> = {
  off: 0,
  subtle: 0.50,
  standard: 0.82,
  heavy: 1.0,
};

const FALLBACK_HEIGHT = 5200;
const SURFACE_Y = 280;

function seededJitter(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const HAZARD_TAGS = [
  "FAULT · UNSTABLE",
  "WATER · LOW",
  "PREDATOR · KNOWN",
  "AIR · POOR",
  "CHAMBER · COLLAPSED",
];

type HoleData = { x: number; y: number; r: number; biasAngle: number; seed: number };

function ClodPile({ x, y, r, biasAngle, seed }: HoleData) {
  // Generate clod transforms once
  const clods = useMemo(() => {
    const rng = seededJitter(seed);
    const out: { pos: [number, number, number]; scale: number; color: THREE.Color }[] = [];
    const N = 220;
    const pile_x = Math.cos(biasAngle);
    const pile_y = Math.sin(biasAngle);
    for (let i = 0; i < N; i++) {
      const a = rng() * Math.PI * 2;
      const t = Math.pow(rng(), 0.7);
      const radius = r * (1.0 + t * 1.1);
      const bias = Math.cos(a) * pile_x + Math.sin(a) * pile_y;
      if (bias < 0 && rng() > 0.3 + (bias + 1) * 0.5) continue;
      const px = x + Math.cos(a) * radius + (rng() - 0.5) * r * 0.04;
      const py = y + Math.sin(a) * radius + (rng() - 0.5) * r * 0.04;
      const heightBoost = Math.max(0, bias) * r * 0.45;
      const sz = (0.04 + rng() * 0.10) * r * (1 + Math.max(0, bias) * 0.4);
      // Color: dark dirt → tan
      const shade = 0.3 + Math.max(0, Math.cos(a - biasAngle - Math.PI / 4)) * 0.7;
      const baseR = 58 + (186 - 58) * shade;
      const baseG = 40 + (148 - 40) * shade;
      const baseB = 26 + (98 - 26) * shade;
      const col = new THREE.Color(`rgb(${Math.round(baseR)}, ${Math.round(baseG)}, ${Math.round(baseB)})`);
      out.push({ pos: [px, py, sz * 0.7 + heightBoost], scale: sz, color: col });
    }
    return out;
  }, [x, y, r, biasAngle, seed]);

  return (
    <group>
      {clods.map((c, i) => (
        <mesh key={i} position={c.pos} castShadow receiveShadow>
          <icosahedronGeometry args={[c.scale, 0]} />
          <meshStandardMaterial color={c.color} roughness={0.92} metalness={0.05} />
        </mesh>
      ))}
    </group>
  );
}

function Hole({ x, y, r, biasAngle, seed }: HoleData) {
  return (
    <group>
      {/* The dark pit: a cylinder that punches DOWN below the ground plane */}
      <mesh position={[x, y, -r * 0.5]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <cylinderGeometry args={[r * 0.7, r * 0.55, r * 1.5, 32, 1, true]} />
        <meshStandardMaterial color={"#0a0604"} side={THREE.DoubleSide} roughness={1} />
      </mesh>
      {/* Cylinder bottom — very dark */}
      <mesh position={[x, y, -r * 1.25]}>
        <circleGeometry args={[r * 0.55, 32]} />
        <meshStandardMaterial color={"#000"} />
      </mesh>
      {/* Clod pile around rim */}
      <ClodPile x={x} y={y} r={r} biasAngle={biasAngle} seed={seed} />
    </group>
  );
}

function Scene({ holes, viewW, viewH }: { holes: HoleData[]; viewW: number; viewH: number }) {
  const camRef = useRef<THREE.OrthographicCamera>(null);
  useFrame(() => {
    // No animation needed; could add later
  });
  return (
    <>
      {/* Lights */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[-viewW * 0.3, -viewH * 0.3, viewW * 0.6]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-viewW}
        shadow-camera-right={viewW}
        shadow-camera-top={-viewH}
        shadow-camera-bottom={viewH}
        shadow-camera-near={0.1}
        shadow-camera-far={viewW * 3}
      />

      {/* Ground plane — cream colored, receives shadows */}
      <mesh position={[0, 0, -0.5]} receiveShadow>
        <planeGeometry args={[viewW * 2, viewH * 2]} />
        <meshStandardMaterial color={"#FAF7F2"} roughness={0.95} />
      </mesh>

      {/* Holes */}
      {holes.map((h, i) => (
        <Hole key={i} {...h} />
      ))}

      <OrthographicCamera
        ref={camRef}
        makeDefault
        position={[viewW / 2, viewH / 2, 800]}
        zoom={1}
        near={0.1}
        far={5000}
        left={-viewW / 2}
        right={viewW / 2}
        top={viewH / 2}
        bottom={-viewH / 2}
        rotation={[0, 0, 0]}
      />
    </>
  );
}

export function HoleThreeLayer() {
  const [intensity, setIntensity] = useState<Intensity>("standard");
  const [pageH, setPageH] = useState(FALLBACK_HEIGHT);

  useEffect(() => {
    function measure() {
      queueMicrotask(() => setPageH(Math.max(document.documentElement.scrollHeight, FALLBACK_HEIGHT)));
    }
    measure();
    window.addEventListener("resize", measure);
    const t = setInterval(measure, 800);
    return () => {
      window.removeEventListener("resize", measure);
      clearInterval(t);
    };
  }, []);

  const op = OP[intensity];

  const layout = useMemo(() => {
    const rng = seededJitter(3221);
    const strata = [
      { y: SURFACE_Y + 80, label: "TOPSOIL" },
      { y: SURFACE_Y + 260, label: "CLAY" },
      { y: SURFACE_Y + 540, label: "STONE" },
      { y: SURFACE_Y + 920, label: "WATER TABLE" },
      { y: SURFACE_Y + 1400, label: "BEDROCK" },
    ];
    type Chamber = { cx: number; cy: number; rx: number; ry: number; hasHazard: boolean };
    const chambers: Chamber[] = [];
    for (let i = 0; i < 9; i++) {
      const cy = SURFACE_Y + 140 + i * ((pageH - SURFACE_Y - 200) / 9);
      chambers.push({ cx: 200 + rng() * 1040, cy, rx: 32 + rng() * 22, ry: 18 + rng() * 12, hasHazard: i % 2 === 0 });
    }
    const tunnels: string[] = [];
    for (let i = 0; i < 5; i++) {
      const surfaceX = 200 + i * 260 + rng() * 60;
      const targetCh = chambers[i];
      if (!targetCh) continue;
      const cp1x = surfaceX + (rng() - 0.5) * 60;
      const cp1y = SURFACE_Y + (targetCh.cy - SURFACE_Y) * 0.4;
      const cp2x = targetCh.cx + (rng() - 0.5) * 40;
      const cp2y = targetCh.cy - 60;
      tunnels.push(`M ${surfaceX} ${SURFACE_Y} C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${targetCh.cx} ${targetCh.cy}`);
    }
    for (let i = 0; i < chambers.length - 1; i++) {
      const a = chambers[i];
      const b = chambers[i + 1];
      if (rng() > 0.4) {
        const cpx = (a.cx + b.cx) / 2 + (rng() - 0.5) * 100;
        const cpy = (a.cy + b.cy) / 2 + 30;
        tunnels.push(`M ${a.cx} ${a.cy} Q ${cpx} ${cpy} ${b.cx} ${b.cy}`);
      }
    }

    const holes: HoleData[] = [];
    for (let i = 0; i < 14; i++) {
      const yPos = SURFACE_Y + 120 + rng() * (pageH - SURFACE_Y - 240);
      // r3f uses 3D coords; we treat (x, -y) for proper top-down orient
      holes.push({
        x: 100 + rng() * 1240,
        y: -yPos, // negate so +Y is screen-up in our orthographic
        r: 32 + rng() * 30,
        biasAngle: rng() * Math.PI * 2,
        seed: Math.floor(rng() * 100000),
      });
    }

    const roots: string[] = [];
    for (let i = 0; i < 40; i++) {
      const x = 40 + rng() * 1360;
      const endY = SURFACE_Y + 40 + rng() * 360;
      const wob = (rng() - 0.5) * 12;
      roots.push(`M ${x} ${SURFACE_Y - 2} Q ${x + wob} ${SURFACE_Y + (endY - SURFACE_Y) * 0.5} ${x + wob * 1.4} ${endY}`);
    }
    type HareTrack = { x: number; y: number };
    const hareTracks: HareTrack[] = [];
    for (let i = 0; i < 32; i++) {
      hareTracks.push({ x: 30 + i * 44 + rng() * 8, y: SURFACE_Y - 18 - (i % 3) * 6 });
    }
    const grass: { x: number }[] = [];
    for (let i = 0; i < 28; i++) grass.push({ x: 40 + i * 52 + rng() * 18 });
    return { strata, chambers, tunnels, holes, roots, hareTracks, grass };
  }, [pageH]);

  // View dimensions for r3f scene
  const viewW = 1440;
  const viewH = pageH;

  return (
    <>
      <IntensityToggle label="Hole · 3D" value={intensity} onChange={setIntensity} />

      {/* Soil strata wash */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: SURFACE_Y,
          left: 0,
          width: "100%",
          height: pageH - SURFACE_Y,
          pointerEvents: "none",
          zIndex: 3,
          opacity: op * 0.45,
          mixBlendMode: "multiply",
          background: `linear-gradient(180deg,
            rgba(232,228,223,0.30) 0%,
            rgba(210,194,168,0.22) 14%,
            rgba(178,148,112,0.20) 30%,
            rgba(140,110,80,0.22) 52%,
            rgba(96,72,52,0.28) 72%,
            rgba(60,46,34,0.36) 92%,
            rgba(40,32,24,0.40) 100%
          )`,
          transition: "opacity 320ms",
        }}
      />

      {/* Ink scaffolding */}
      <svg
        aria-hidden="true"
        viewBox={`0 0 1440 ${pageH}`}
        preserveAspectRatio="xMidYMin slice"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: pageH,
          pointerEvents: "none",
          zIndex: 5,
          opacity: op,
          mixBlendMode: "multiply",
          transition: "opacity 320ms",
        }}
      >
        <line x1="0" y1={SURFACE_Y} x2="1440" y2={SURFACE_Y} stroke="#1A1A1A" strokeWidth="1" opacity="0.7" />
        <text x="40" y={SURFACE_Y - 14} fontFamily="'Space Mono', monospace" fontSize="9" letterSpacing="0.24em" fill="#6B6B6B">— SURFACE</text>
        <g stroke="#1A1A1A" strokeWidth="0.5" fill="none" opacity="0.7">
          {layout.grass.map((g, i) => (
            <g key={i} transform={`translate(${g.x} ${SURFACE_Y})`}>
              <path d="M 0 0 q -1 -10 -2 -16" />
              <path d="M 2 0 q 1 -8 2 -12" />
              <path d="M -2 0 q -1 -9 -3 -14" />
            </g>
          ))}
        </g>
        <g fill="#1A1A1A" opacity="0.75">
          {layout.hareTracks.map((p, i) => (
            <g key={i} transform={`translate(${p.x} ${p.y})`}>
              <ellipse cx="-3" cy="-2" rx="1.6" ry="3.4" />
              <ellipse cx="3" cy="-1" rx="1.6" ry="3.4" />
              <circle cx="-1" cy="4" r="1" />
              <circle cx="2" cy="5" r="1" />
            </g>
          ))}
        </g>
        <g opacity="0.55">
          {layout.strata.map((b, i) => (
            <g key={i}>
              <line x1="0" y1={b.y} x2="1440" y2={b.y} stroke="#1A1A1A" strokeWidth="0.4" strokeDasharray="3 6" opacity="0.7" />
              <text x="40" y={b.y - 6} fontFamily="'Space Mono', monospace" fontSize="8" letterSpacing="0.22em" fill="#1A1A1A" opacity="0.75">— {b.label}</text>
            </g>
          ))}
        </g>
        <g stroke="#1A1A1A" strokeWidth="0.45" fill="none" opacity="0.55">
          {layout.roots.map((d, i) => <path key={i} d={d} />)}
        </g>
        <g stroke="#1A1A1A" strokeWidth="1.1" fill="none" opacity="0.78" strokeLinecap="round">
          {layout.tunnels.map((d, i) => <path key={i} d={d} />)}
        </g>
        {layout.chambers.map((c, i) => (
          <g key={i}>
            <ellipse cx={c.cx} cy={c.cy} rx={c.rx} ry={c.ry} fill="#FAF7F2" stroke="#1A1A1A" strokeWidth="1" strokeOpacity="0.78" />
            <ellipse cx={c.cx} cy={c.cy} rx={c.rx * 0.7} ry={c.ry * 0.7} fill="none" stroke="#1A1A1A" strokeWidth="0.5" opacity="0.55" />
          </g>
        ))}
        <g transform="translate(72 124)" opacity="0.88">
          <text x="0" y="0" fontFamily="Playfair Display, Georgia, serif" fontWeight="700" fontStyle="italic" fontSize="22" fill="#1A1A1A">UNDERLAND · three</text>
          <text x="0" y="20" fontFamily="'Space Mono', monospace" fontSize="9" letterSpacing="0.26em" fill="#6B6B6B">
            OPTION C · react-three-fiber · ACTUAL 3D
          </text>
          <line x1="0" y1="30" x2="380" y2="30" stroke="#1A1A1A" strokeWidth="0.6" opacity="0.55" />
        </g>
      </svg>

      {/* 3D scene canvas */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: pageH,
          pointerEvents: "none",
          zIndex: 6,
          opacity: op,
        }}
      >
        <Canvas
          shadows
          orthographic
          style={{ width: "100%", height: "100%", background: "transparent" }}
          gl={{ alpha: true, antialias: true }}
        >
          <Scene holes={layout.holes} viewW={viewW} viewH={viewH} />
        </Canvas>
      </div>

      {/* Crimson hazard tags on top */}
      <svg
        aria-hidden="true"
        viewBox={`0 0 1440 ${pageH}`}
        preserveAspectRatio="xMidYMin slice"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: pageH,
          pointerEvents: "none",
          zIndex: 7,
          opacity: op * 0.95,
          transition: "opacity 320ms",
        }}
      >
        {layout.chambers.filter((c) => c.hasHazard).map((c, i) => (
          <g key={i} stroke="#8B1A1A" strokeWidth="0.6">
            <line x1={c.cx} y1={c.cy} x2={c.cx + (c.cx < 720 ? 90 : -90)} y2={c.cy + 30} />
            <circle cx={c.cx} cy={c.cy} r="3" fill="#8B1A1A" />
            <g transform={`translate(${c.cx + (c.cx < 720 ? 96 : -96)} ${c.cy + 30})`}>
              <rect x={c.cx < 720 ? 0 : -110} y="-9" width="110" height="18" fill="none" stroke="#8B1A1A" strokeWidth="0.9" />
              <text x={c.cx < 720 ? 6 : -106} y="4" fontFamily="'Space Mono', monospace" fontSize="9" letterSpacing="0.20em" fill="#8B1A1A" fontWeight="700" stroke="none">
                {HAZARD_TAGS[i % HAZARD_TAGS.length]}
              </text>
            </g>
          </g>
        ))}
      </svg>
    </>
  );
}
