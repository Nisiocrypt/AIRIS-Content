import React, { createContext, useContext, useMemo } from "react";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from "remotion";
import { COLORS, EASE_IN, EASE_IN_OUT, EASE_OUT, FONTS } from "../brand/tokens";
import { CLAMP, enter, leave } from "../lib/anim";
import { Grain, NightBackground, Vignette } from "../components/Backgrounds";
import { Headline, HeadlineLine } from "../components/Text";
import { LightStrands } from "../components/LightStrands";
import { Logo } from "../components/Logo";
import { WABubble, WAHeader, waWallpaper } from "../components/WhatsApp";

/**
 * Brand film (24 fps). Caos → conexión → inteligencia → automatización → escala.
 * Dos armados con los mismos tiempos y el mismo sonido: horizontal 1920 × 1080 y
 * vertical 1080 × 1920 (cada escena se recompone, no se recorta).
 */
export const V11_FPS = 24;
export const V11_W = 1920;
export const V11_H = 1080;
export const V11_DURATION = 1080;

/** Inicio de cada escena (frames a 24 fps). */
export const V11 = {
  chaos: 0,
  signal: 96,
  system: 192,
  engine: 336,
  scale: 480,
  split: 630,
  agent: 750,
  finale: 900,
};

const VIOLET = COLORS.violet;
const AMBER = "#F5B544";
const CYAN = "#67E8F9";

type Layout = { v: boolean; W: number; H: number; CX: number; CY: number; maxW: number };
const L16: Layout = { v: false, W: 1920, H: 1080, CX: 960, CY: 540, maxW: 1500 };
const L9: Layout = { v: true, W: 1080, H: 1920, CX: 540, CY: 960, maxW: 900 };
const Ctx = createContext<Layout>(L16);
const useL = () => useContext(Ctx);

const rng = (i: number, k: number) => {
  const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// ------------------------------------------------------------------ utilidades

/** Recorrido de líneas rectas: largo total y punto a cierta distancia. */
const polyline = (pts: [number, number][]) => {
  const segs = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  const total = segs.reduce((a, b) => a + b, 0);
  const lenAt = (idx: number) => segs.slice(0, idx).reduce((a, b) => a + b, 0);
  const pointAt = (len: number): [number, number] => {
    let l = Math.max(0, len);
    for (let i = 0; i < segs.length; i++) {
      if (l <= segs[i]) {
        const a = pts[i];
        const b = pts[i + 1];
        const t = segs[i] ? l / segs[i] : 0;
        return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
      }
      l -= segs[i];
    }
    return pts[pts.length - 1];
  };
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0]},${p[1]}`).join(" ");
  return { total, lenAt, pointAt, d };
};

/** Une dos puntos con curvas de 90 grados (horizontal-vertical-horizontal o al revés). */
const elbow = (a: [number, number], b: [number, number], vertical: boolean): [number, number][] =>
  vertical
    ? [
        [a[0], (a[1] + b[1]) / 2],
        [b[0], (a[1] + b[1]) / 2],
        b,
      ]
    : [
        [(a[0] + b[0]) / 2, a[1]],
        [(a[0] + b[0]) / 2, b[1]],
        b,
      ];

const T: React.FC<{ children: React.ReactNode; size: number; y: number; opacity?: number; weight?: number; color?: string; font?: string }> = ({
  children,
  size,
  y,
  opacity = 1,
  weight = 500,
  color = "#FFFFFF",
  font = FONTS.body,
}) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: y, textAlign: "center", fontFamily: font, fontWeight: weight, fontSize: size, color, opacity }}>{children}</div>
);

/** Titular con su versión de líneas para cada formato. */
const Head: React.FC<{ h: HeadlineLine[]; v?: HeadlineLine[]; start: number; exitAt?: number; y: number; yv?: number; size: number; sizeV?: number; inDur?: number; stagger?: number; style?: React.CSSProperties }> = ({
  h,
  v,
  start,
  exitAt,
  y,
  yv,
  size,
  sizeV,
  inDur,
  stagger,
  style,
}) => {
  const L = useL();
  return (
    <Headline lines={L.v ? v ?? h : h} start={start} exitAt={exitAt} y={L.v ? yv ?? y : y} size={L.v ? sizeV ?? size : size} maxWidth={L.maxW} inDur={inDur} stagger={stagger} style={style} />
  );
};

const CheckIcon: React.FC<{ size: number; color?: string; progress?: number }> = ({ size, color = "#FFFFFF", progress = 1 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M5 12.5 L10 17 L19 7" stroke={color} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={24} strokeDashoffset={24 * (1 - progress)} />
  </svg>
);

const glass: React.CSSProperties = {
  background: "rgba(12,13,30,0.82)",
  border: "1px solid rgba(255,255,255,0.12)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), 0 20px 50px rgba(0,0,0,0.45)",
  borderRadius: 18,
};

const GridBg: React.FC<{ x?: number; y?: number; scale?: number; opacity?: number }> = ({ x = 0, y = 0, scale = 1, opacity = 0.5 }) => (
  <AbsoluteFill
    style={{
      opacity,
      backgroundImage: "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)",
      backgroundSize: `${64 * scale}px ${64 * scale}px`,
      backgroundPosition: `${x}px ${y}px`,
      maskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 100%)",
    }}
  />
);

// ================================================================== 01 · CAOS

type Frag = { x: number; y: number; z: number; kind: number; label: string; sub: string; warn?: boolean };

const LABELS: [string, string][] = [
  ["Hola, ¿tienen turno?", "09:14"],
  ["Llamada perdida", "10:02"],
  ["Turno 10:30", "Martes"],
  ["Factura 0192", "$ 48.500"],
  ["Pago recibido", "11:47"],
  ["Nueva consulta", "WhatsApp"],
  ["¿Me pasás precios?", "12:20"],
  ["Tarea: llamar a Pablo", "Hoy"],
  ["Correo nuevo", "Proveedor"],
  ["Presupuesto", "Pendiente"],
  ["Ficha de cliente", "Actualizar"],
  ["Recordatorio", "Mañana"],
];

const makeFrags = (v: boolean): Frag[] => {
  const sx = v ? 1500 : 2800;
  const sy = v ? 2700 : 1500;
  const out: Frag[] = [];
  for (let i = 0; i < 120; i++) {
    let x = (rng(i, 1) - 0.5) * sx;
    let y = (rng(i, 2) - 0.5) * sy;
    if (Math.abs(x) < 220 && Math.abs(y) < 180) {
      x += Math.sign(x || 1) * 280;
      y += Math.sign(y || 1) * 200;
    }
    const [label, sub] = LABELS[i % LABELS.length];
    out.push({ x, y, z: 300 + rng(i, 3) * 3200, kind: Math.floor(rng(i, 4) * 4), label, sub });
  }
  const wx = v ? 230 : 500;
  const wy = v ? 420 : 240;
  out.push({ x: -wx, y: -wy, z: 1500, kind: 9, label: "Seguimiento pendiente", sub: "Hace 2 días", warn: true });
  out.push({ x: wx, y: wy, z: 1820, kind: 9, label: "Consulta sin responder · 18 min", sub: "WhatsApp", warn: true });
  out.push({ x: -wx, y: wy, z: 2150, kind: 9, label: "Turno sin confirmar", sub: "Jueves 10:00", warn: true });
  out.push({ x: wx, y: -wy, z: 2480, kind: 9, label: "Factura pendiente", sub: "Vence hoy", warn: true });
  return out;
};

const FragCard: React.FC<{ f: Frag; camZ: number; i: number; frame: number }> = ({ f, camZ, i, frame }) => {
  const L = useL();
  const dz = f.z - camZ;
  if (dz < 40) return null;
  const p = 900 / dz;
  const x = L.CX + f.x * p;
  const y = L.CY + f.y * p;
  if (x < -400 || x > L.W + 400 || y < -300 || y > L.H + 300) return null;
  const fadeFar = interpolate(dz, [2400, 3400], [1, 0], CLAMP);
  const fadeNear = interpolate(dz, [40, 160], [0, 1], CLAMP);
  const appear = interpolate(frame, [34 + (i % 20), 44 + (i % 20)], [0, 1], CLAMP);
  const blink = f.warn ? 0.55 + 0.45 * Math.abs(Math.sin(frame * 0.35 + i)) : 0;
  return (
    <div style={{ position: "absolute", left: x, top: y, translate: "-50% -50%", scale: String(p), opacity: fadeFar * fadeNear * appear, zIndex: Math.round(10000 - dz) }}>
      <div style={{ ...glass, width: f.warn ? 360 : 250, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, fontFamily: FONTS.body }}>
        <div style={{ width: 10, height: 10, borderRadius: 99, flexShrink: 0, background: f.warn ? AMBER : f.kind === 1 ? "rgba(255,255,255,0.4)" : f.kind === 2 ? CYAN : "rgba(167,139,250,0.8)", opacity: f.warn ? blink : 1 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 19, fontWeight: 600, color: "#FFFFFF", whiteSpace: "nowrap" }}>{f.label}</div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>{f.sub}</div>
          {f.kind === 2 ? (
            <div style={{ marginTop: 8, height: 4, borderRadius: 4, background: "rgba(255,255,255,0.1)" }}>
              <div style={{ width: `${30 + rng(i, 7) * 60}%`, height: "100%", borderRadius: 4, background: CYAN }} />
            </div>
          ) : null}
          {f.kind === 3 ? (
            <svg width={200} height={26} style={{ marginTop: 6 }}>
              <polyline points={Array.from({ length: 12 }, (_, k) => `${k * 18},${22 - rng(i * 13 + k, 8) * 18}`).join(" ")} fill="none" stroke="rgba(167,139,250,0.9)" strokeWidth={1.5} />
            </svg>
          ) : null}
        </div>
      </div>
    </div>
  );
};

const Chaos: React.FC = () => {
  const f = useCurrentFrame();
  const L = useL();
  const frags = useMemo(() => makeFrags(L.v), [L.v]);
  const lineW = interpolate(f, [0, 10], [0, L.v ? 760 : 1100], { ...CLAMP, easing: EASE_OUT });
  const lineO = leave(f, 14, 8);
  const push = interpolate(f, [8, 26], [1, 1.06], CLAMP);
  const dive = interpolate(f, [26, 46], [1, 9], { ...CLAMP, easing: EASE_IN });
  const titleO = interpolate(f, [34, 46], [1, 0], CLAMP);
  const camZ = interpolate(f, [34, 90], [0, 2600], { ...CLAMP, easing: EASE_IN_OUT });
  const drift = f < 90 ? Math.sin(f * 0.21) * 10 : Math.sin(90 * 0.21) * 10;
  const scrim = enter(f, 62, 8);
  const spread = L.v ? 800 : 1100;
  return (
    <AbsoluteFill style={{ background: "#010104" }}>
      <div style={{ position: "absolute", left: L.CX - lineW / 2, top: L.CY + (L.v ? 150 : 70), width: lineW, height: 1, background: "rgba(255,255,255,0.7)", opacity: lineO }} />
      {f >= 20 && f < 50
        ? Array.from({ length: 48 }).map((_, i) => {
            const sx = L.CX + (rng(i, 20) - 0.5) * spread;
            const sy = L.CY + (rng(i, 21) - 0.5) * (L.v ? 200 : 70);
            const ang = Math.atan2(sy - L.CY, sx - L.CX) + (rng(i, 22) - 0.5) * 0.4;
            const len = interpolate(f, [20, 40], [0, 500 + rng(i, 23) * 700], { ...CLAMP, easing: EASE_IN });
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: sx,
                  top: sy,
                  width: len,
                  height: 1,
                  transformOrigin: "0 0",
                  rotate: `${ang}rad`,
                  background: "linear-gradient(90deg, rgba(255,255,255,0.7), rgba(255,255,255,0))",
                  opacity: interpolate(f, [40, 50], [1, 0], CLAMP),
                }}
              />
            );
          })
        : null}
      <AbsoluteFill style={{ translate: `${drift}px ${drift * 0.6}px` }}>{f >= 30 ? frags.map((fr, i) => <FragCard key={i} f={fr} camZ={camZ} i={i} frame={f} />) : null}</AbsoluteFill>
      <AbsoluteFill style={{ scale: String(push * dive), opacity: titleO }}>
        <Head h={["Tu negocio toma miles", "de decisiones por día."]} v={["Tu negocio", "toma miles", "de decisiones", "por día."]} start={6} y={540} yv={960} size={84} sizeV={104} inDur={16} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse ${L.v ? "70% 20%" : "50% 26%"} at 50% 50%, rgba(1,1,4,0.95) 0%, rgba(1,1,4,0.8) 60%, rgba(1,1,4,0) 100%)`, opacity: scrim, zIndex: 20000 }} />
      <AbsoluteFill style={{ zIndex: 20001 }}>
        <Head
          h={["La mayoría lo resuelve", { text: "a mano.", italic: true }]}
          v={["La mayoría", "lo resuelve", { text: "a mano.", italic: true }]}
          start={64}
          y={540}
          yv={960}
          size={84}
          sizeV={104}
          inDur={12}
          style={{ scale: String(interpolate(f, [82, 88], [1, 1.05], { ...CLAMP, easing: EASE_OUT })) }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ================================================================== 02 · LA SEÑAL

const BLOCKS = ["Mensaje", "Ficha del cliente", "Agenda", "Venta", "Factura"];

const Signal: React.FC = () => {
  const f = useCurrentFrame();
  const L = useL();
  const bpos = (i: number): [number, number] => (L.v ? [i % 2 === 0 ? 330 : 750, 330 + i * 250] : [330 + i * 315, i % 2 === 0 ? 390 : 610]);
  const path = useMemo(() => {
    const start: [number, number] = L.v ? [330, 90] : [60, 390];
    const pts: [number, number][] = [start, bpos(0)];
    const idx: number[] = [1];
    for (let i = 1; i < BLOCKS.length; i++) {
      pts.push(...elbow(bpos(i - 1), bpos(i), L.v));
      idx.push(pts.length - 1);
    }
    const last = bpos(BLOCKS.length - 1);
    pts.push(L.v ? [last[0], last[1] + 200] : [1860, last[1]]);
    return { ...polyline(pts), idx };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [L.v]);
  const dot = enter(f, 2, 8);
  const prog = interpolate(f, [8, 62], [0, path.total], { ...CLAMP, easing: EASE_IN_OUT });
  const [hx, hy] = path.pointAt(prog);
  const shake = interpolate(f, [0, 34], [1, 0], CLAMP);
  const camX = Math.sin(f * 0.37) * 9 * shake;
  const camY = Math.cos(f * 0.29) * 6 * shake;
  const out = leave(f, 88, 10);
  const headY = L.v ? 1650 : 870;
  return (
    <AbsoluteFill style={{ background: "#010104" }}>
      <GridBg opacity={interpolate(f, [20, 60], [0, 0.6], CLAMP) * out} />
      <AbsoluteFill style={{ translate: `${camX}px ${camY}px`, opacity: out }}>
        <svg width={L.W} height={L.H} style={{ position: "absolute", inset: 0 }}>
          <path d={path.d} fill="none" stroke={VIOLET} strokeWidth={2} strokeDasharray={path.total} strokeDashoffset={path.total - prog} style={{ filter: "drop-shadow(0 0 6px rgba(124,58,237,0.9))" }} />
        </svg>
        <div style={{ position: "absolute", left: hx - 7, top: hy - 7, width: 14, height: 14, borderRadius: 99, background: "#FFFFFF", boxShadow: `0 0 18px 6px ${VIOLET}`, opacity: dot * (prog < path.total - 2 ? 1 : 0) }} />
        {BLOCKS.map((b, i) => {
          const at = path.lenAt(path.idx[i]);
          const hit = prog >= at;
          const snapT = interpolate(prog, [at - 160, at], [0, 1], { ...CLAMP, easing: EASE_OUT });
          const ox = (1 - snapT) * (rng(i, 30) - 0.5) * 120;
          const oy = (1 - snapT) * (rng(i, 31) - 0.5) * 90;
          const rot = (1 - snapT) * (rng(i, 32) - 0.5) * 16;
          const lit = interpolate(prog, [at, at + 60], [0, 1], CLAMP);
          const [bx, by] = bpos(i);
          return (
            <div
              key={b}
              style={{
                position: "absolute",
                left: bx + ox,
                top: by + oy,
                translate: "-50% -50%",
                rotate: `${rot}deg`,
                ...glass,
                width: L.v ? 300 : 230,
                padding: "18px 20px",
                textAlign: "center",
                fontFamily: FONTS.body,
                fontWeight: 600,
                fontSize: L.v ? 30 : 24,
                color: hit ? "#FFFFFF" : "rgba(255,255,255,0.55)",
                border: `1px solid rgba(${hit ? "167,139,250" : "255,255,255"},${hit ? 0.3 + 0.5 * lit : 0.12})`,
                boxShadow: `0 0 ${30 * lit}px rgba(124,58,237,${0.5 * lit}), 0 20px 50px rgba(0,0,0,0.45)`,
                opacity: interpolate(f, [4 + i * 2, 14 + i * 2], [0, 1], CLAMP),
              }}
            >
              {b}
              <div style={{ fontSize: L.v ? 16 : 13, fontWeight: 400, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>{hit ? "conectado" : "sin conectar"}</div>
            </div>
          );
        })}
      </AbsoluteFill>
      <Head h={["¿Y si todo trabajara", { text: "junto?", italic: true }]} start={58} exitAt={92} y={headY} yv={headY} size={64} sizeV={84} inDur={14} />
      {f >= 86
        ? Array.from({ length: 7 }).map((_, i) => {
            const [tx, ty] = nodePos(L, i, 0);
            const t = interpolate(f, [86, 104], [0, 1], { ...CLAMP, easing: EASE_IN_OUT });
            return (
              <svg key={i} width={L.W} height={L.H} style={{ position: "absolute", inset: 0 }}>
                <line x1={L.CX} y1={headY} x2={L.CX + (tx - L.CX) * t} y2={headY + (ty - headY) * t} stroke={VIOLET} strokeWidth={1.5} opacity={0.8} />
              </svg>
            );
          })
        : null}
    </AbsoluteFill>
  );
};

// ================================================================== 03 · EL SISTEMA

const NODES = ["WhatsApp", "Llamadas", "Agenda", "Ventas", "Atención", "Operaciones", "Cobros"];
const NODE_META = ["12 chats activos", "3 en curso", "86% ocupada", "7 en seguimiento", "4 abiertas", "Al día", "2 pendientes"];

function nodePos(L: Layout, i: number, f: number): [number, number] {
  const a = (i / NODES.length) * Math.PI * 2 - Math.PI / 2 + f * 0.0016;
  const rx = L.v ? 340 : 640;
  const ry = L.v ? 640 : 330;
  return [L.CX + Math.cos(a) * rx, L.CY + Math.sin(a) * ry];
}

const STEPS = ["Reconoce al cliente", "Revisa la agenda", "Reserva el turno", "Actualiza la ficha", "Manda la confirmación"];

const SystemScene: React.FC = () => {
  const f = useCurrentFrame();
  const L = useL();
  const { CX, CY } = L;
  const draw = interpolate(f, [0, 24], [0, 1], { ...CLAMP, easing: EASE_OUT });
  const dim = interpolate(f, [54, 62, 104, 112], [1, 0.18, 0.18, 0], CLAMP);
  const coreO = interpolate(f, [104, 114], [1, 0], CLAMP);
  const msgT = interpolate(f, [40, 54], [0, 1], { ...CLAMP, easing: EASE_IN });
  const wa = nodePos(L, 0, f);
  const pulseCore = interpolate(f, [54, 58, 70], [0, 1, 0], CLAMP);
  const collapse = interpolate(f, [100, 110], [0, 1], { ...CLAMP, easing: EASE_IN });
  const five = enter(f, 130, 6);
  const through = interpolate(f, [136, 148], [1, 30], { ...CLAMP, easing: EASE_IN });
  const fiveSize = L.v ? 640 : 560;
  return (
    <AbsoluteFill style={{ background: "#010104" }}>
      <NightBackground intensity={0.7} glowY={0.5} />
      <GridBg opacity={0.5 * dim} />
      <AbsoluteFill style={{ opacity: dim }}>
        <svg width={L.W} height={L.H} style={{ position: "absolute", inset: 0 }}>
          {NODES.map((_, i) => {
            const [x, y] = nodePos(L, i, f);
            const d = `M${x},${y} L${CX},${y} L${CX},${CY}`;
            const len = Math.abs(CX - x) + Math.abs(CY - y);
            return (
              <g key={i}>
                <path d={d} fill="none" stroke="rgba(167,139,250,0.55)" strokeWidth={1.5} strokeDasharray={len} strokeDashoffset={len * (1 - draw)} />
                {[0, 0.5].map((off) => {
                  const t = ((f / 40 + off + i * 0.13) % 1) * len;
                  const px = t < Math.abs(CX - x) ? x + Math.sign(CX - x) * t : CX;
                  const py = t < Math.abs(CX - x) ? y : y + Math.sign(CY - y) * (t - Math.abs(CX - x));
                  return <circle key={off} cx={px} cy={py} r={3.5} fill="#FFFFFF" opacity={draw} style={{ filter: "drop-shadow(0 0 6px #7C3AED)" }} />;
                })}
              </g>
            );
          })}
        </svg>
        {NODES.map((n, i) => {
          const [x, y] = nodePos(L, i, f);
          const p = enter(f, 6 + i * 3, 12);
          return (
            <div key={n} style={{ position: "absolute", left: x, top: y, translate: "-50% -50%", scale: String((0.9 + 0.1 * p) * (L.v ? 1.15 : 1)), opacity: p, ...glass, borderRadius: 999, padding: "14px 28px", display: "flex", alignItems: "center", gap: 12, fontFamily: FONTS.body }}>
              <div style={{ width: 10, height: 10, borderRadius: 99, background: CYAN, opacity: 0.6 + 0.4 * Math.abs(Math.sin(f * 0.2 + i)) }} />
              <div>
                <div style={{ fontSize: 24, fontWeight: 600, color: "#FFFFFF" }}>{n}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>{NODE_META[i]}</div>
              </div>
            </div>
          );
        })}
      </AbsoluteFill>
      <div style={{ position: "absolute", left: CX, top: CY, translate: "-50% -50%", opacity: coreO * enter(f, 8, 12) }}>
        <div style={{ position: "absolute", left: "50%", top: "50%", width: 300, height: 300, translate: "-50% -50%", borderRadius: 999, background: `radial-gradient(circle, rgba(124,58,237,${0.35 + 0.4 * pulseCore}) 0%, rgba(124,58,237,0) 70%)` }} />
        <div style={{ ...glass, borderRadius: 999, width: 190, height: 190, display: "flex", alignItems: "center", justifyContent: "center", opacity: dim }}>
          <Logo width={150} start={10} glow />
        </div>
      </div>
      {f >= 26 && f < 56 ? (
        <div style={{ position: "absolute", left: wa[0] + (CX - wa[0]) * msgT, top: wa[1] + 110 + (CY - wa[1] - 110) * msgT, width: 520, translate: "-50% -50%", scale: String((1 - 0.8 * msgT) * (L.v ? 1.2 : 1)), opacity: enter(f, 26, 8) * (1 - msgT * 0.7) }}>
          <WABubble text="Hola, quiero sacar un turno." time="09:14" start={26} fontSize={30} maxWidth={520} />
        </div>
      ) : null}
      {f >= 54 && f < 112 ? (
        <div style={{ position: "absolute", left: CX, top: CY, translate: "-50% -50%", display: "flex", flexDirection: "column", gap: 14, scale: `${L.v ? 1.35 : 1} ${(1 - collapse) * (L.v ? 1.35 : 1)}`, opacity: 1 - collapse * 0.5 }}>
          {STEPS.map((s, i) => {
            const p = enter(f, 56 + i * 4, 10);
            const lit = interpolate(f, [64 + i * 8, 70 + i * 8], [0, 1], CLAMP);
            return (
              <div key={s} style={{ ...glass, width: 560, padding: "16px 24px", display: "flex", alignItems: "center", gap: 18, opacity: p, translate: `0 ${(1 - p) * 16}px`, border: `1px solid rgba(167,139,250,${0.12 + 0.6 * lit})`, boxShadow: `0 0 ${24 * lit}px rgba(124,58,237,${0.45 * lit})` }}>
                <div style={{ width: 36, height: 36, borderRadius: 99, background: lit > 0.5 ? VIOLET : "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONTS.body, fontWeight: 600, fontSize: 18, color: "#FFFFFF" }}>
                  {lit > 0.5 ? <CheckIcon size={22} progress={lit} /> : i + 1}
                </div>
                <div style={{ fontFamily: FONTS.body, fontWeight: 600, fontSize: 26, color: "#FFFFFF", flex: 1 }}>{s}</div>
                <div style={{ fontFamily: FONTS.body, fontSize: 14, color: "rgba(255,255,255,0.4)" }}>{lit > 0.5 ? `0,${3 + i} s` : ""}</div>
              </div>
            );
          })}
        </div>
      ) : null}
      {f >= 104 && f < 116 ? (
        <div style={{ position: "absolute", left: CX - 350 * (1 - interpolate(f, [108, 116], [0, 1], CLAMP)), top: CY, width: 700 * (1 - interpolate(f, [108, 116], [0, 1], CLAMP)), height: 2, background: VIOLET, boxShadow: `0 0 12px ${VIOLET}` }} />
      ) : null}
      <Head h={["Un mensaje."]} start={110} exitAt={118} y={540} yv={960} size={110} sizeV={120} inDur={10} stagger={0} />
      {f >= 130 ? (
        <AbsoluteFill style={{ opacity: five * interpolate(through, [8, 30], [1, 0], CLAMP), transformOrigin: `${CX + 10}px ${CY - 10}px`, scale: String(through) }}>
          <T size={fiveSize} y={CY - fiveSize * 0.78} weight={900} font={FONTS.display}>
            5
          </T>
        </AbsoluteFill>
      ) : null}
      {f >= 130 ? <Head h={["tareas resueltas."]} start={131} exitAt={137} y={930} yv={1400} size={56} sizeV={72} inDur={8} /> : null}
    </AbsoluteFill>
  );
};

// ================================================================== 04 · EL MOTOR

const FLOW: { name: string; busy: string; done: string }[] = [
  { name: "Nueva consulta", busy: "Mensaje de Laura", done: "Recibida" },
  { name: "Califica", busy: "Analizando", done: "Calificada" },
  { name: "Deriva", busy: "Buscando responsable", done: "Asignada a Martín" },
  { name: "Hace seguimiento", busy: "Programando", done: "Recordatorio en 24 h" },
  { name: "Agenda", busy: "Revisando agenda", done: "Jueves 16:30 · Reservado" },
  { name: "Actualiza la ficha", busy: "Completando", done: "Ficha al 100%" },
  { name: "Avisa al equipo", busy: "Enviando", done: "Equipo avisado" },
];
const HIT = (i: number) => 14 + i * 13;
const OFFS = [0, -1, 1, -1, 1, -1, 0];

const Engine: React.FC = () => {
  const f = useCurrentFrame();
  const L = useL();
  const npos = (i: number): [number, number] => (L.v ? [L.CX + OFFS[i] * 230, 360 + i * 560] : [360 + i * 560, 540 + OFFS[i] * 180]);
  const flow = useMemo(() => {
    const first = npos(0);
    const start: [number, number] = L.v ? [first[0], first[1] - 300] : [first[0] - 300, first[1]];
    const pts: [number, number][] = [start, first];
    const idx = [1];
    for (let i = 1; i < FLOW.length; i++) {
      pts.push(...elbow(npos(i - 1), npos(i), L.v));
      idx.push(pts.length - 1);
    }
    return { ...polyline(pts), idx };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [L.v]);
  // largo recorrido: llega a cada nodo en HIT(i)
  let len = interpolate(f, [0, 8], [0, flow.lenAt(1)], CLAMP);
  for (let i = 0; i < FLOW.length - 1; i++) {
    if (f >= HIT(i)) {
      const t = interpolate(f, [HIT(i) + 2, HIT(i + 1)], [0, 1], { ...CLAMP, easing: EASE_IN_OUT });
      len = flow.lenAt(flow.idx[i]) + (flow.lenAt(flow.idx[i + 1]) - flow.lenAt(flow.idx[i])) * t;
    }
  }
  const [px, py] = flow.pointAt(len);
  const s = interpolate(f, [0, 12, 40, 62, 86, 108, 112, 132], [L.v ? 0.36 : 0.42, 0.95, 1.35, 1.0, 1.4, 1.1, 1.1, 7], { ...CLAMP, easing: EASE_IN_OUT });
  const [lastX, lastY] = npos(6);
  const followX = f < 108 ? px : lastX;
  const followY = f < 108 ? py : lastY;
  const wide = interpolate(f, [0, 12], [1, 0], CLAMP);
  const mid = npos(3);
  const camX = followX * (1 - wide) + (L.v ? L.CX : mid[0]) * wide;
  const camY = followY * (1 - wide) + (L.v ? mid[1] : L.CY) * wide;
  const tx = L.CX - camX * s;
  const ty = L.CY - camY * s;
  const out = interpolate(f, [124, 134], [1, 0], CLAMP);
  return (
    <AbsoluteFill style={{ background: "#010104" }}>
      <NightBackground intensity={0.55} glowY={0.5} />
      <GridBg x={-camX * 0.3} y={-camY * 0.3} scale={Math.max(0.6, s * 0.7)} opacity={0.55 * out} />
      <AbsoluteFill style={{ opacity: out }}>
        <div style={{ position: "absolute", left: 0, top: 0, transformOrigin: "0 0", translate: `${tx}px ${ty}px`, scale: String(s) }}>
          <svg width={4400} height={4400} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
            <path d={flow.d} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={2} />
            <path d={flow.d} fill="none" stroke={VIOLET} strokeWidth={2.5} strokeDasharray={`${len + 260} 99999`} style={{ filter: "drop-shadow(0 0 5px rgba(124,58,237,0.9))" }} />
          </svg>
          <div style={{ position: "absolute", left: px - 9, top: py - 9, width: 18, height: 18, borderRadius: 99, background: "#FFFFFF", boxShadow: `0 0 22px 8px ${VIOLET}` }} />
          {FLOW.map((n, i) => {
            const [nx, ny] = npos(i);
            const near = interpolate(Math.hypot(px - nx, py - ny), [0, 320], [1, 0], CLAMP);
            const busy = f >= HIT(i) - 4;
            const done = f >= HIT(i) + 8;
            const prog = interpolate(f, [HIT(i) - 4, HIT(i) + 8], [0, 1], CLAMP);
            return (
              <div
                key={n.name}
                style={{
                  position: "absolute",
                  left: nx,
                  top: ny,
                  translate: "-50% -50%",
                  scale: String(1 + 0.12 * near),
                  ...glass,
                  width: 320,
                  padding: "20px 24px",
                  fontFamily: FONTS.body,
                  border: `1px solid rgba(${busy ? "167,139,250" : "255,255,255"},${busy ? 0.35 + 0.4 * prog : 0.12})`,
                  boxShadow: `0 0 ${36 * prog * near}px rgba(124,58,237,0.55), 0 20px 50px rgba(0,0,0,0.45)`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ fontSize: 26, fontWeight: 600, color: "#FFFFFF" }}>{n.name}</div>
                  <div style={{ width: 30, height: 30, borderRadius: 99, background: done ? VIOLET : "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {done ? <CheckIcon size={20} progress={interpolate(f, [HIT(i) + 8, HIT(i) + 14], [0, 1], CLAMP)} /> : null}
                  </div>
                </div>
                <div style={{ fontSize: 17, color: done ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.45)", marginTop: 8 }}>{done ? n.done : busy ? n.busy : "En espera"}</div>
                <div style={{ marginTop: 12, height: 4, borderRadius: 4, background: "rgba(255,255,255,0.08)" }}>
                  <div style={{ width: `${prog * 100}%`, height: "100%", borderRadius: 4, background: done ? VIOLET : CYAN }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                  <span>{`N${String(i + 1).padStart(2, "0")}`}</span>
                  <span>{`09:41:${String(7 + i * 3).padStart(2, "0")}`}</span>
                </div>
                {i === FLOW.length - 1 ? (
                  <svg width={272} height={40} style={{ marginTop: 6 }}>
                    <polyline points={Array.from({ length: 10 }, (_, k) => `${k * 30},${36 - k * 3 - rng(k, 40) * 8}`).join(" ")} fill="none" stroke={VIOLET} strokeWidth={1.5} />
                  </svg>
                ) : null}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      {f >= 120 ? <ChartBuild f={f - 120} /> : null}
    </AbsoluteFill>
  );
};

const ChartBuild: React.FC<{ f: number }> = ({ f }) => {
  const L = useL();
  const x0 = L.v ? 130 : 180;
  const x1 = L.v ? 960 : 1780;
  const yb = L.v ? 1400 : 880;
  const hgt = L.v ? 800 : 700;
  const n = 16;
  const pts = Array.from({ length: n }, (_, k) => [x0 + (k * (x1 - x0)) / (n - 1), yb - (hgt * 0.95 * (k * 30 + Math.sin(k * 1.3) * 60 + (k > 10 ? (k - 10) * 40 : 0))) / 700] as [number, number]);
  const o = interpolate(f, [0, 8], [0, 1], CLAMP);
  const axes = interpolate(f, [0, 8], [0, 1], { ...CLAMP, easing: EASE_OUT });
  const line = interpolate(f, [6, 30], [0, 1], { ...CLAMP, easing: EASE_IN_OUT });
  const upto = line * (n - 1);
  const i0 = Math.floor(upto);
  const frac = upto - i0;
  const a = pts[Math.min(i0, n - 1)];
  const b = pts[Math.min(i0 + 1, n - 1)];
  const tip = [a[0] + (b[0] - a[0]) * frac, a[1] + (b[1] - a[1]) * frac];
  const drawn = pts.slice(0, i0 + 1).map((p) => p.join(",")).join(" ");
  const camX = (tip[0] - L.CX) * 0.35;
  const camY = (tip[1] - L.CY) * 0.35;
  return (
    <AbsoluteFill style={{ opacity: o, background: "#02030A" }}>
      <GridBg opacity={0.4} />
      <AbsoluteFill style={{ translate: `${-camX}px ${-camY}px`, scale: String(1 + line * 0.25) }}>
        <svg width={L.W} height={L.H}>
          <line x1={x0} y1={yb} x2={x0 + (x1 - x0) * axes} y2={yb} stroke="rgba(255,255,255,0.35)" strokeWidth={1} />
          <line x1={x0} y1={yb} x2={x0} y2={yb - hgt * axes} stroke="rgba(255,255,255,0.35)" strokeWidth={1} />
          {[0, 1, 2, 3].map((k) => (
            <text key={k} x={x0 - 30} y={yb - (k * hgt) / 3.5} fill="rgba(255,255,255,0.4)" fontSize={16} fontFamily={FONTS.body} textAnchor="end" opacity={interpolate(f, [4 + k, 10 + k], [0, 1], CLAMP)}>
              {k * 250}
            </text>
          ))}
          <polyline points={`${drawn} ${tip[0]},${tip[1]}`} fill="none" stroke={VIOLET} strokeWidth={3} style={{ filter: "drop-shadow(0 0 8px rgba(124,58,237,0.9))" }} />
          {pts.slice(0, i0 + 1).map((p, k) => (
            <circle key={k} cx={p[0]} cy={p[1]} r={4} fill="#FFFFFF" />
          ))}
          <circle cx={tip[0]} cy={tip[1]} r={7} fill="#FFFFFF" style={{ filter: "drop-shadow(0 0 10px #7C3AED)" }} />
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ================================================================== 05 · ESCALA

const COUNT_KEYS: [number, number][] = [
  [8, 247],
  [18, 391],
  [28, 628],
  [38, 1024],
  [50, 2481],
];
const countAt = (f: number) => {
  if (f <= COUNT_KEYS[0][0]) return COUNT_KEYS[0][1];
  for (let k = 0; k < COUNT_KEYS.length - 1; k++) {
    const [f0, v0] = COUNT_KEYS[k];
    const [f1, v1] = COUNT_KEYS[k + 1];
    if (f <= f1) return Math.round(interpolate(f, [f0, f1], [v0, v1], { easing: EASE_OUT }));
  }
  return COUNT_KEYS[COUNT_KEYS.length - 1][1];
};
const fmt = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

const TILE_LABELS = ["Turnos", "Llamadas atendidas", "Contactos calificados", "Facturas", "Consultas", "Seguimientos", "Presupuestos", "Recordatorios"];

const Dashboard: React.FC<{ f: number; mini?: boolean; seed?: number }> = ({ f, mini, seed = 0 }) => {
  const border = interpolate(f, [0, 12], [0, 1], { ...CLAMP, easing: EASE_OUT });
  const per = 2 * (1100 + 620);
  return (
    <div style={{ position: "relative", width: 1100, height: 620 }}>
      <svg width={1100} height={620} style={{ position: "absolute", inset: 0 }}>
        <rect x={1} y={1} width={1098} height={618} rx={28} fill="rgba(12,13,30,0.85)" stroke={mini ? "rgba(255,255,255,0.15)" : VIOLET} strokeWidth={2} strokeDasharray={per} strokeDashoffset={per * (1 - (mini ? 1 : border))} />
      </svg>
      <div style={{ position: "absolute", inset: 0, padding: "46px 56px", fontFamily: FONTS.body, opacity: mini ? 1 : interpolate(f, [6, 14], [0, 1], CLAMP) }}>
        <div style={{ fontSize: 22, color: "rgba(255,255,255,0.5)" }}>{mini ? TILE_LABELS[seed % TILE_LABELS.length] : "Conversaciones atendidas"}</div>
        <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 150, color: "#FFFFFF", lineHeight: 1.1, marginTop: 8 }}>{mini ? fmt(40 + Math.floor(rng(seed, 50) * 900)) : fmt(countAt(f))}</div>
        <svg width={988} height={180} style={{ marginTop: 20 }}>
          <polyline
            points={Array.from({ length: 24 }, (_, k) => `${k * 43},${170 - (k * 5 + rng(k + seed * 7, 51) * 50)}`).join(" ")}
            fill="none"
            stroke={mini ? "rgba(167,139,250,0.7)" : VIOLET}
            strokeWidth={3}
            strokeDasharray={1400}
            strokeDashoffset={mini ? 0 : 1400 * (1 - interpolate(f, [8, 50], [0, 1], CLAMP))}
          />
        </svg>
        <div style={{ position: "absolute", right: 56, top: 50, display: "flex", alignItems: "center", gap: 10, fontSize: 18, color: "rgba(255,255,255,0.55)" }}>
          <div style={{ width: 10, height: 10, borderRadius: 99, background: CYAN, opacity: 0.5 + 0.5 * Math.abs(Math.sin((f + seed * 5) * 0.3)) }} />
          En vivo
        </div>
      </div>
    </div>
  );
};

const ScaleScene: React.FC = () => {
  const f = useCurrentFrame();
  const L = useL();
  const base = L.v ? 0.86 : 1;
  const mini = 0.155;
  const back = interpolate(f, [54, 86], [base, mini], { ...CLAMP, easing: EASE_IN_OUT });
  const others = interpolate(f, [60, 80], [0, 1], CLAMP);
  const dim = interpolate(f, [86, 94], [1, 0.22], CLAMP);
  const cols = L.v ? 5 : 9;
  const rows = L.v ? 15 : 7;
  const cc = Math.floor(cols / 2);
  const rc = Math.floor(rows / 2);
  const tw = 1100 * mini + 14;
  const th = 620 * mini + 14;
  const tangleIn = interpolate(f, [110, 120], [0, 1], CLAMP);
  const lx0 = L.v ? 90 : 200;
  const lx1 = L.v ? 990 : 1720;
  const sigX = interpolate(f, [122, 140], [lx0, lx1], { ...CLAMP, easing: EASE_IN_OUT });
  const ly = L.v ? 1180 : 700;
  return (
    <AbsoluteFill style={{ background: "#010104" }}>
      <NightBackground intensity={0.6} glowY={0.5} />
      <AbsoluteFill style={{ opacity: dim }}>
        {f >= 58
          ? Array.from({ length: cols * rows }).map((_, k) => {
              const c = k % cols;
              const r = Math.floor(k / cols);
              if (c === cc && r === rc) return null;
              const x = L.CX + (c - cc) * tw;
              const y = L.CY + (r - rc) * th;
              const d = Math.hypot(c - cc, r - rc);
              const o = others * interpolate(f, [60 + d * 3, 70 + d * 3], [0, 1], CLAMP);
              return (
                <div key={k} style={{ position: "absolute", left: x, top: y, translate: "-50% -50%", scale: String(mini), opacity: o }}>
                  <Dashboard f={f} mini seed={k} />
                </div>
              );
            })
          : null}
        <div style={{ position: "absolute", left: L.CX, top: L.CY, translate: "-50% -50%", scale: String(back) }}>
          <Dashboard f={f} />
        </div>
      </AbsoluteFill>
      {f < 60 ? (
        <T size={L.v ? 26 : 20} y={L.v ? 1320 : 1000} opacity={0.5}>
          Datos de ejemplo
        </T>
      ) : null}
      <Head h={["La automatización no reemplaza tu negocio."]} v={["La automatización", "no reemplaza", "tu negocio."]} start={86} exitAt={98} y={540} yv={960} size={68} sizeV={92} inDur={12} />
      <Head h={["Le saca lo que lo", { text: "frena.", italic: true }]} start={110} y={440} yv={760} size={80} sizeV={96} inDur={12} />
      {f >= 110 ? (
        <svg width={L.W} height={L.H} style={{ position: "absolute", inset: 0 }}>
          {Array.from({ length: 7 }).map((_, k) => {
            const y0 = ly + k * 26;
            const pts = Array.from({ length: 90 }, (_, j) => {
              const x = lx0 + (j * (lx1 - lx0)) / 89;
              const straight = x < sigX ? interpolate(sigX - x, [0, 120], [0, 1], CLAMP) : 0;
              const mess = Math.sin(j * 0.35 + k * 1.7) * 60 + Math.sin(j * 0.9 + k) * 30;
              return `${x},${y0 + mess * (1 - straight) * tangleIn}`;
            }).join(" ");
            return <polyline key={k} points={pts} fill="none" stroke={sigX > lx1 - 20 ? VIOLET : "rgba(255,255,255,0.55)"} strokeWidth={1.5} opacity={tangleIn} />;
          })}
          {f >= 122 && f < 142 ? <circle cx={sigX} cy={ly + 78} r={8} fill="#FFFFFF" style={{ filter: "drop-shadow(0 0 14px #7C3AED)" }} /> : null}
        </svg>
      ) : null}
    </AbsoluteFill>
  );
};

// ================================================================== 06 · ANTES Y DESPUÉS

const Morph: React.FC<{ from: string; to: string; at: number; y: number; size: number; show: number }> = ({ from, to, at, y, size, show }) => {
  const f = useCurrentFrame();
  const letters = (s: string, out: boolean) =>
    s.split("").map((ch, i) => {
      const s0 = at + i * 1.2 + (out ? 0 : 10);
      const t = interpolate(f, [s0, s0 + 8], [0, 1], { ...CLAMP, easing: EASE_IN_OUT });
      const vv = out ? 1 - t : t;
      return (
        <span key={i} style={{ display: "inline-block", opacity: vv, translate: `0 ${(out ? -t : 1 - t) * size * 0.35}px`, filter: `blur(${(1 - vv) * 8}px)`, whiteSpace: "pre" }}>
          {ch}
        </span>
      );
    });
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, height: size * 1.3, opacity: show, fontFamily: FONTS.display, fontWeight: 800, fontSize: size, color: "#FFFFFF" }}>
      <div style={{ position: "absolute", left: 0, right: 0, textAlign: "center" }}>{letters(from, true)}</div>
      <div style={{ position: "absolute", left: 0, right: 0, textAlign: "center" }}>{letters(to, false)}</div>
    </div>
  );
};

const Split: React.FC = () => {
  const f = useCurrentFrame();
  const L = useL();
  const v = L.v;
  // horizontal: la división avanza a la izquierda; vertical: sube
  const div = interpolate(f, [40, 96], [v ? L.CY : L.CX, 110], { ...CLAMP, easing: EASE_IN_OUT });
  const tools = v
    ? [
        { name: "WhatsApp", x: 290, y: 430, r: -4 },
        { name: "Planilla", x: 790, y: 400, r: 3 },
        { name: "Correo", x: 300, y: 780, r: 3 },
        { name: "Agenda", x: 780, y: 760, r: -3 },
      ]
    : [
        { name: "WhatsApp", x: 250, y: 330, r: -4 },
        { name: "Planilla", x: 620, y: 300, r: 3 },
        { name: "Correo", x: 300, y: 720, r: 3 },
        { name: "Agenda", x: 650, y: 700, r: -3 },
      ];
  const cursorPath: [number, number, number][] = [0, 14, 26, 38, 50, 62, 74, 86].map((fr, k) => {
    const tt = tools[[0, 1, 2, 3][k % 4]];
    return [fr, tt.x + 40, tt.y + 30];
  });
  const cur = (() => {
    for (let k = 0; k < cursorPath.length - 1; k++) {
      const [f0, x0, y0] = cursorPath[k];
      const [f1, x1, y1] = cursorPath[k + 1];
      if (f <= f1) {
        const t = interpolate(f, [f0, f1], [0, 1], { ...CLAMP, easing: EASE_IN_OUT });
        return [x0 + (x1 - x0) * t, y0 + (y1 - y0) * t];
      }
    }
    const last = cursorPath[cursorPath.length - 1];
    return [last[1], last[2]];
  })();
  const nodes: [number, number, string][] = v
    ? [
        [230, 1100, "WhatsApp"],
        [850, 1100, "Agenda"],
        [230, 1640, "Fichas"],
        [850, 1640, "Cobros"],
        [230, 560, "Llamadas"],
        [850, 560, "Ventas"],
        [540, 300, "Atención"],
      ]
    : [
        [1180, 320, "WhatsApp"],
        [1560, 320, "Agenda"],
        [1180, 760, "Fichas"],
        [1560, 760, "Cobros"],
        [760, 320, "Llamadas"],
        [760, 760, "Ventas"],
        [340, 540, "Atención"],
      ];
  const core: [number, number] = v ? [540, 1370] : [1370, 540];
  const out = leave(f, 108, 12);
  const manualClip = v ? `inset(0 0 ${L.H - div}px 0)` : `inset(0 ${L.W - div}px 0 0)`;
  const airisClip = v ? `inset(${div}px 0 0 0)` : `inset(0 0 0 ${div}px)`;
  return (
    <AbsoluteFill style={{ background: "#010104", opacity: out }}>
      <AbsoluteFill style={{ clipPath: manualClip, background: "#07080C" }}>
        <svg width={L.W} height={L.H} style={{ position: "absolute", inset: 0 }}>
          <line x1={tools[0].x} y1={tools[0].y} x2={tools[1].x} y2={tools[1].y} stroke="rgba(245,181,68,0.5)" strokeWidth={1.5} strokeDasharray="10 14" />
          <line x1={tools[2].x} y1={tools[2].y} x2={tools[3].x} y2={tools[3].y} stroke="rgba(245,181,68,0.5)" strokeWidth={1.5} strokeDasharray="10 14" />
          <line x1={tools[1].x} y1={tools[1].y} x2={tools[3].x} y2={tools[3].y} stroke="rgba(245,181,68,0.35)" strokeWidth={1.5} strokeDasharray="4 22" />
        </svg>
        {tools.map((t) => (
          <div key={t.name} style={{ position: "absolute", left: t.x, top: t.y, translate: "-50% -50%", rotate: `${t.r}deg`, ...glass, background: "rgba(30,31,40,0.95)", width: v ? 360 : 300, fontFamily: FONTS.body }}>
            <div style={{ display: "flex", gap: 6, padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              {[0, 1, 2].map((k) => (
                <div key={k} style={{ width: 9, height: 9, borderRadius: 9, background: "rgba(255,255,255,0.2)" }} />
              ))}
              <div style={{ marginLeft: 10, fontSize: v ? 20 : 15, color: "rgba(255,255,255,0.6)" }}>{t.name}</div>
            </div>
            <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
              {[0, 1, 2].map((k) => (
                <div key={k} style={{ height: 10, width: `${50 + rng(k + t.x, 60) * 45}%`, borderRadius: 5, background: "rgba(255,255,255,0.12)" }} />
              ))}
            </div>
          </div>
        ))}
        <svg width={40} height={48} viewBox="0 0 20 24" style={{ position: "absolute", left: cur[0], top: cur[1], filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.6))" }}>
          <path d="M2 1 L2 19 L6.5 15 L9.5 22 L12.5 20.7 L9.6 14 L16 14 Z" fill="#FFFFFF" stroke="#111" strokeWidth={1.1} strokeLinejoin="round" />
        </svg>
      </AbsoluteFill>
      <AbsoluteFill style={{ clipPath: airisClip }}>
        <NightBackground intensity={0.8} glowX={v ? 0.5 : 0.7} glowY={v ? 0.7 : 0.5} />
        <GridBg opacity={0.45} />
        <svg width={L.W} height={L.H} style={{ position: "absolute", inset: 0 }}>
          {nodes.map(([x, y], i) => {
            const d = `M${x},${y} L${core[0]},${y} L${core[0]},${core[1]}`;
            const len = Math.abs(core[0] - x) + Math.abs(core[1] - y);
            const t = ((f / 30 + i * 0.17) % 1) * len;
            const pxx = t < Math.abs(core[0] - x) ? x + Math.sign(core[0] - x) * t : core[0];
            const pyy = t < Math.abs(core[0] - x) ? y : y + Math.sign(core[1] - y) * (t - Math.abs(core[0] - x));
            return (
              <g key={i}>
                <path d={d} fill="none" stroke="rgba(167,139,250,0.6)" strokeWidth={1.5} />
                <circle cx={pxx} cy={pyy} r={3.5} fill="#FFFFFF" style={{ filter: "drop-shadow(0 0 6px #7C3AED)" }} />
              </g>
            );
          })}
        </svg>
        {nodes.map(([x, y, n]) => (
          <div key={n} style={{ position: "absolute", left: x, top: y, translate: "-50% -50%", ...glass, borderRadius: 999, padding: "12px 24px", fontFamily: FONTS.body, fontWeight: 600, fontSize: v ? 26 : 22, color: "#FFFFFF", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 9, height: 9, borderRadius: 9, background: CYAN }} />
            {n}
          </div>
        ))}
        <div style={{ position: "absolute", left: core[0], top: core[1], translate: "-50% -50%", ...glass, borderRadius: 999, width: 150, height: 150, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 60px rgba(124,58,237,0.6)" }}>
          <Logo width={115} start={-30} glow />
        </div>
      </AbsoluteFill>
      {v ? (
        <div style={{ position: "absolute", left: 0, top: div - 1, width: L.W, height: 2, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)" }} />
      ) : (
        <div style={{ position: "absolute", left: div - 1, top: 0, width: 2, height: L.H, background: "linear-gradient(transparent, rgba(255,255,255,0.8), transparent)" }} />
      )}
      <Morph from="A mano" to="Automático" at={44} y={v ? 150 : 80} size={v ? 88 : 72} show={enter(f, 6, 10)} />
      <Morph from="Por separado" to="Conectado" at={72} y={v ? 1740 : 900} size={v ? 88 : 72} show={enter(f, 12, 10)} />
    </AbsoluteFill>
  );
};

// ================================================================== 07 · EL AGENTE

const LAYERS = ["Cliente reconocido", "Turno actual encontrado", "Jueves a la tarde disponible", "Reglas del consultorio", "Ficha del cliente", "Agenda"];

const Agent: React.FC = () => {
  const f = useCurrentFrame();
  const L = useL();
  const v = L.v;
  const o = enter(f, 0, 10) * leave(f, 88, 10);
  const scan = interpolate(f, [46, 60], v ? [120, 1800] : [180, 1740], { ...CLAMP, easing: EASE_IN_OUT });
  const through = interpolate(f, [138, 150], [1, 14], { ...CLAMP, easing: EASE_IN });
  const chips = ["Agenda actualizada", "Ficha actualizada", "Confirmación enviada"];
  const panel = v ? { x: L.CX - 360, y: 560, w: 720, h: 800 } : { x: L.CX - 330, y: 170, w: 660, h: 720 };
  const target = (i: number): [number, number] => {
    if (v) {
      const spots: [number, number][] = [
        [290, 250],
        [790, 250],
        [540, 410],
        [290, 1510],
        [790, 1510],
        [540, 1670],
      ];
      return spots[i];
    }
    const side = i % 2 === 0 ? -1 : 1;
    const k = Math.floor(i / 2);
    return [L.CX + side * (470 + k * 150), 300 + k * 190];
  };
  return (
    <AbsoluteFill style={{ background: "#010104" }}>
      <NightBackground intensity={0.7} glowY={0.45} />
      <AbsoluteFill style={{ opacity: o }}>
        {LAYERS.map((l, i) => {
          const p = interpolate(f, [16 + i * 4, 30 + i * 4], [0, 1], { ...CLAMP, easing: EASE_OUT });
          const [tx, ty] = target(i);
          const x = L.CX + (tx - L.CX) * p;
          const y = L.CY + (ty - L.CY) * p;
          const scanned = v ? scan > y : scan > x;
          return (
            <div
              key={l}
              style={{
                position: "absolute",
                left: x,
                top: y,
                translate: "-50% -50%",
                opacity: p * 0.95,
                scale: String((0.8 + 0.2 * p) * (v ? 1.15 : 1)),
                ...glass,
                background: "rgba(255,255,255,0.05)",
                backdropFilter: "blur(12px)",
                width: 330,
                padding: "18px 22px",
                display: "flex",
                alignItems: "center",
                gap: 14,
                fontFamily: FONTS.body,
                fontSize: 21,
                fontWeight: 600,
                color: "#FFFFFF",
                border: `1px solid rgba(${scanned ? "167,139,250" : "255,255,255"},${scanned ? 0.7 : 0.14})`,
              }}
            >
              <div style={{ width: 28, height: 28, borderRadius: 99, flexShrink: 0, background: scanned ? VIOLET : "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {scanned ? <CheckIcon size={18} /> : null}
              </div>
              {l}
            </div>
          );
        })}
        {f >= 44 && f < 64 ? (
          v ? (
            <div style={{ position: "absolute", left: 60, top: scan - 1, width: L.W - 120, height: 2, background: VIOLET, boxShadow: `0 0 24px 6px rgba(124,58,237,0.7)` }} />
          ) : (
            <div style={{ position: "absolute", left: scan - 1, top: 120, width: 2, height: 840, background: VIOLET, boxShadow: `0 0 24px 6px rgba(124,58,237,0.7)` }} />
          )
        ) : null}
        <div style={{ position: "absolute", left: panel.x, top: panel.y, width: panel.w, height: panel.h, borderRadius: 36, overflow: "hidden", ...waWallpaper, boxShadow: "0 40px 100px rgba(0,0,0,0.6)", border: "1.5px solid rgba(255,255,255,0.1)" }}>
          <WAHeader name="Laura" status="en línea" scale={v ? 0.95 : 0.85} />
          <div style={{ padding: "26px 28px", display: "flex", flexDirection: "column", gap: 18 }}>
            <WABubble text="¿Puedo pasar mi turno al jueves a la tarde?" time="16:02" start={6} fontSize={v ? 34 : 30} maxWidth={v ? 540 : 480} />
            <WABubble text="Listo, te pasé al jueves a las 16:30. Te aviso el día anterior." time="16:02" out start={64} fontSize={v ? 34 : 30} maxWidth={v ? 540 : 480} />
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 34, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            {chips.map((c, i) => {
              const p = enter(f, 72 + i * 7, 10);
              return (
                <div key={c} style={{ opacity: p, translate: `0 ${(1 - p) * 12}px`, display: "flex", alignItems: "center", gap: 10, background: "rgba(124,58,237,0.9)", borderRadius: 999, padding: "10px 22px", fontFamily: FONTS.body, fontWeight: 600, fontSize: v ? 24 : 20, color: "#FFFFFF" }}>
                  <CheckIcon size={v ? 24 : 20} progress={interpolate(f, [76 + i * 7, 82 + i * 7], [0, 1], CLAMP)} />
                  {c}
                </div>
              );
            })}
          </div>
        </div>
      </AbsoluteFill>
      <Head h={["No es un chatbot."]} v={["No es", "un chatbot."]} start={92} exitAt={104} y={540} yv={960} size={96} sizeV={112} inDur={10} stagger={0} />
      <AbsoluteFill style={{ transformOrigin: `${L.CX + (v ? 60 : 170)}px ${L.CY + (v ? 120 : 60)}px`, scale: String(through), opacity: interpolate(through, [4, 14], [1, 0], CLAMP) }}>
        <Head h={["Es un sistema que", { text: "resuelve.", italic: true }]} v={["Es un sistema", "que", { text: "resuelve.", italic: true }]} start={114} y={540} yv={960} size={96} sizeV={112} inDur={10} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ================================================================== 08 · FINAL

const MODULES = ["Ventas", "Atención", "Operaciones", "Fichas de clientes", "WhatsApp", "Llamadas", "Turnos", "Cobros"];

const Finale: React.FC = () => {
  const f = useCurrentFrame();
  const L = useL();
  const { CX, CY } = L;
  const rx = L.v ? 360 : 700;
  const ry = L.v ? 680 : 360;
  const ui = interpolate(f, [36, 52], [1, 0], CLAMP);
  const conv = interpolate(f, [44, 70], [0, 1], { ...CLAMP, easing: EASE_IN_OUT });
  const hit = interpolate(f, [70, 74, 110], [0, 1, 0], CLAMP);
  const lines = interpolate(f, [66, 76], [1, 0], CLAMP);
  const fade = interpolate(f, [160, 178], [1, 0], CLAMP);
  const wide = interpolate(f, [0, 40], [1.12, 1], { ...CLAMP, easing: EASE_OUT });
  const logoW = L.v ? 640 : 620;
  return (
    <AbsoluteFill style={{ background: "#010104", opacity: fade }}>
      <NightBackground intensity={0.8 + 0.6 * hit} glowY={0.46} />
      <LightStrands width={L.W} height={L.H} opacity={0.15 + 0.5 * hit} energy={0.6 + hit} centerY={0.55} speed={0.6} />
      <AbsoluteFill style={{ scale: String(wide) }}>
        <svg width={L.W} height={L.H} style={{ position: "absolute", inset: 0, opacity: lines }}>
          {MODULES.map((_, i) => {
            const a = (i / MODULES.length) * Math.PI * 2 + f * 0.002;
            const x = CX + Math.cos(a) * rx * (1 - conv);
            const y = CY + Math.sin(a) * ry * (1 - conv);
            const a2 = ((i + 1) / MODULES.length) * Math.PI * 2 + f * 0.002;
            const x2 = CX + Math.cos(a2) * rx * (1 - conv);
            const y2 = CY + Math.sin(a2) * ry * (1 - conv);
            const tx = CX - 180 + (i / (MODULES.length - 1)) * 360;
            return (
              <g key={i}>
                <line x1={x} y1={y} x2={CX + (tx - CX) * conv} y2={CY} stroke="rgba(167,139,250,0.7)" strokeWidth={1.5} />
                <line x1={x} y1={y} x2={x2} y2={y2} stroke="rgba(167,139,250,0.35)" strokeWidth={1} />
                <circle cx={x + (CX - x) * ((f / 24 + i * 0.12) % 1)} cy={y + (CY - y) * ((f / 24 + i * 0.12) % 1)} r={3.5} fill="#FFFFFF" opacity={1 - conv} />
              </g>
            );
          })}
        </svg>
        {MODULES.map((m, i) => {
          const a = (i / MODULES.length) * Math.PI * 2 + f * 0.002;
          const x = CX + Math.cos(a) * rx;
          const y = CY + Math.sin(a) * ry;
          return (
            <div key={m} style={{ position: "absolute", left: x, top: y, translate: "-50% -50%", opacity: ui * enter(f, i * 2, 10), ...glass, borderRadius: 999, padding: "12px 24px", fontFamily: FONTS.body, fontWeight: 600, fontSize: L.v ? 26 : 22, color: "#FFFFFF", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 9, height: 9, borderRadius: 9, background: CYAN, opacity: 0.5 + 0.5 * Math.abs(Math.sin(f * 0.25 + i)) }} />
              {m}
            </div>
          );
        })}
      </AbsoluteFill>
      {f >= 64 ? (
        <div style={{ position: "absolute", left: CX, top: CY - (L.v ? 120 : 70), translate: "-50% -50%", scale: String(1 + 0.03 * hit) }}>
          <Logo width={logoW} start={66} stagger={3} glow />
        </div>
      ) : null}
      <Head h={["Un mensaje entra.", { text: "La operación continúa.", italic: true }]} start={86} y={710} yv={1130} size={46} sizeV={58} inDur={14} stagger={6} />
      <T size={L.v ? 32 : 26} y={L.v ? 1290 : 840} opacity={enter(f, 112, 14) * 0.8} weight={500}>
        Consultoría gratuita de 30 minutos
      </T>
      <T size={L.v ? 36 : 30} y={L.v ? 1345 : 886} opacity={enter(f, 118, 14)} weight={600}>
        airisautomation.com
      </T>
    </AbsoluteFill>
  );
};

// ================================================================== film

const SweepFlash: React.FC = () => {
  const f = useCurrentFrame();
  const at = [V11.system, V11.engine, V11.split, V11.finale];
  const v = Math.max(...at.map((a) => interpolate(f, [a - 2, a, a + 8], [0, 0.18, 0], CLAMP)));
  return <AbsoluteFill style={{ background: "#FFFFFF", mixBlendMode: "soft-light", opacity: v, pointerEvents: "none" }} />;
};

export const V11BrandFilm: React.FC<{ vertical?: boolean }> = ({ vertical = false }) => (
  <Ctx.Provider value={vertical ? L9 : L16}>
    <AbsoluteFill style={{ background: "#010104" }}>
      <Sequence from={V11.chaos} durationInFrames={V11.signal - V11.chaos}>
        <Chaos />
      </Sequence>
      <Sequence from={V11.signal} durationInFrames={V11.system - V11.signal + 4}>
        <Signal />
      </Sequence>
      <Sequence from={V11.system} durationInFrames={V11.engine - V11.system + 4}>
        <SystemScene />
      </Sequence>
      <Sequence from={V11.engine} durationInFrames={V11.scale - V11.engine}>
        <Engine />
      </Sequence>
      <Sequence from={V11.scale} durationInFrames={V11.split - V11.scale}>
        <ScaleScene />
      </Sequence>
      <Sequence from={V11.split} durationInFrames={V11.agent - V11.split}>
        <Split />
      </Sequence>
      <Sequence from={V11.agent} durationInFrames={V11.finale - V11.agent}>
        <Agent />
      </Sequence>
      <Sequence from={V11.finale} durationInFrames={V11_DURATION - V11.finale}>
        <Finale />
      </Sequence>
      <Vignette strength={0.45} />
      <Grain opacity={0.05} />
      <SweepFlash />
    </AbsoluteFill>
  </Ctx.Provider>
);
