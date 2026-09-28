import React from "react";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from "remotion";
import { COLORS, EASE_IN, EASE_IN_OUT, EASE_OUT, FONTS } from "../brand/tokens";
import { CLAMP, enter, leave } from "../lib/anim";
import { Grain, NightBackground, Vignette } from "../components/Backgrounds";
import { Headline } from "../components/Text";
import { LightStrands } from "../components/LightStrands";
import { Logo } from "../components/Logo";
import { WABubble, WAHeader, waWallpaper } from "../components/WhatsApp";

/**
 * Brand film horizontal (16:9, 24 fps). Caos → conexión → inteligencia → automatización →
 * escala. Se renderiza en 1920 × 1080 y se exporta en 4K con --scale=2.
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

const W = V11_W;
const H = V11_H;
const CX = W / 2;
const CY = H / 2;
const VIOLET = COLORS.violet;
const AMBER = "#F5B544";
const CYAN = "#67E8F9";

const rng = (i: number, k: number) => {
  const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

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

/** Grilla fina de fondo, con parallax. */
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

const FRAGS: Frag[] = (() => {
  const out: Frag[] = [];
  for (let i = 0; i < 120; i++) {
    let x = (rng(i, 1) - 0.5) * 2800;
    let y = (rng(i, 2) - 0.5) * 1500;
    if (Math.abs(x) < 260 && Math.abs(y) < 160) {
      x += Math.sign(x || 1) * 320;
      y += Math.sign(y || 1) * 180;
    }
    const [label, sub] = LABELS[i % LABELS.length];
    out.push({ x, y, z: 300 + rng(i, 3) * 3200, kind: Math.floor(rng(i, 4) * 4), label, sub });
  }
  // Las cuatro que se tienen que leer, cerca del recorrido de la cámara
  out.push({ x: -520, y: -250, z: 1500, kind: 9, label: "Seguimiento pendiente", sub: "Hace 2 días", warn: true });
  out.push({ x: 480, y: 210, z: 1820, kind: 9, label: "Consulta sin responder · 18 min", sub: "WhatsApp", warn: true });
  out.push({ x: -420, y: 260, z: 2150, kind: 9, label: "Turno sin confirmar", sub: "Jueves 10:00", warn: true });
  out.push({ x: 520, y: -230, z: 2480, kind: 9, label: "Factura pendiente", sub: "Vence hoy", warn: true });
  return out;
})();

const FragCard: React.FC<{ f: Frag; camZ: number; i: number; frame: number }> = ({ f, camZ, i, frame }) => {
  const dz = f.z - camZ;
  if (dz < 40) return null;
  const p = 900 / dz;
  const x = CX + f.x * p;
  const y = CY + f.y * p;
  if (x < -400 || x > W + 400 || y < -300 || y > H + 300) return null;
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
              <polyline
                points={Array.from({ length: 12 }, (_, k) => `${k * 18},${22 - rng(i * 13 + k, 8) * 18}`).join(" ")}
                fill="none"
                stroke="rgba(167,139,250,0.9)"
                strokeWidth={1.5}
              />
            </svg>
          ) : null}
        </div>
      </div>
    </div>
  );
};

const Chaos: React.FC = () => {
  const f = useCurrentFrame();
  const lineW = interpolate(f, [0, 10], [0, 1100], { ...CLAMP, easing: EASE_OUT });
  const lineO = leave(f, 14, 8);
  const push = interpolate(f, [8, 26], [1, 1.06], CLAMP);
  const dive = interpolate(f, [26, 46], [1, 9], { ...CLAMP, easing: EASE_IN });
  const titleO = interpolate(f, [34, 46], [1, 0], CLAMP);
  const camZ = interpolate(f, [34, 90], [0, 2600], { ...CLAMP, easing: EASE_IN_OUT });
  const drift = f < 90 ? Math.sin(f * 0.21) * 10 : Math.sin(90 * 0.21) * 10;
  const scrim = enter(f, 62, 8);
  return (
    <AbsoluteFill style={{ background: "#010104" }}>
      <div style={{ position: "absolute", left: CX - lineW / 2, top: CY + 70, width: lineW, height: 1, background: "rgba(255,255,255,0.7)", opacity: lineO }} />
      {/* líneas que salen de las letras */}
      {f >= 20 && f < 50
        ? Array.from({ length: 48 }).map((_, i) => {
            const sx = CX + (rng(i, 20) - 0.5) * 1100;
            const sy = CY + (rng(i, 21) - 0.5) * 70;
            const ang = Math.atan2(sy - CY, sx - CX) + (rng(i, 22) - 0.5) * 0.4;
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
      <AbsoluteFill style={{ translate: `${drift}px ${drift * 0.6}px` }}>
        {f >= 30 ? FRAGS.map((fr, i) => <FragCard key={i} f={fr} camZ={camZ} i={i} frame={f} />) : null}
      </AbsoluteFill>
      <AbsoluteFill style={{ scale: String(push * dive), opacity: titleO }}>
        <Headline lines={["Tu negocio toma miles", "de decisiones por día."]} start={6} y={CY} size={84} maxWidth={1500} inDur={16} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 50% 26% at 50% 50%, rgba(1,1,4,0.95) 0%, rgba(1,1,4,0.8) 60%, rgba(1,1,4,0) 100%)", opacity: scrim, zIndex: 20000 }} />
      <AbsoluteFill style={{ zIndex: 20001 }}>
        <Headline lines={["La mayoría lo resuelve", { text: "a mano.", italic: true }]} start={64} y={CY} size={84} maxWidth={1400} inDur={12} style={{ scale: String(interpolate(f, [82, 88], [1, 1.05], { ...CLAMP, easing: EASE_OUT })) }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ================================================================== 02 · LA SEÑAL

const BLOCKS = ["Mensaje", "Ficha del cliente", "Agenda", "Venta", "Factura"];
const BX = (i: number) => 330 + i * 315;
const BY = (i: number) => (i % 2 === 0 ? 390 : 610);

/** Recorrido con curvas de 90 grados que pasa por los cinco bloques. */
const SIGNAL_PTS: [number, number][] = (() => {
  const pts: [number, number][] = [[60, 390]];
  for (let i = 0; i < BLOCKS.length; i++) {
    pts.push([BX(i), BY(i)]);
    if (i < BLOCKS.length - 1) {
      const mx = (BX(i) + BX(i + 1)) / 2;
      pts.push([mx, BY(i)], [mx, BY(i + 1)]);
    }
  }
  pts.push([1860, BY(BLOCKS.length - 1)]);
  return pts;
})();

const segLens = SIGNAL_PTS.slice(1).map((p, i) => Math.hypot(p[0] - SIGNAL_PTS[i][0], p[1] - SIGNAL_PTS[i][1]));
const TOTAL = segLens.reduce((a, b) => a + b, 0);
const lenAtPoint = (idx: number) => segLens.slice(0, idx).reduce((a, b) => a + b, 0);
const pointAt = (len: number): [number, number] => {
  let l = len;
  for (let i = 0; i < segLens.length; i++) {
    if (l <= segLens[i]) {
      const a = SIGNAL_PTS[i];
      const b = SIGNAL_PTS[i + 1];
      const t = l / segLens[i];
      return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    }
    l -= segLens[i];
  }
  return SIGNAL_PTS[SIGNAL_PTS.length - 1];
};
const blockLen = (i: number) => lenAtPoint(1 + i * 3);

const Signal: React.FC = () => {
  const f = useCurrentFrame();
  const dot = enter(f, 2, 8);
  const prog = interpolate(f, [8, 62], [0, TOTAL], { ...CLAMP, easing: EASE_IN_OUT });
  const [hx, hy] = pointAt(prog);
  const shake = interpolate(f, [0, 34], [1, 0], CLAMP);
  const camX = Math.sin(f * 0.37) * 9 * shake;
  const camY = Math.cos(f * 0.29) * 6 * shake;
  const out = leave(f, 88, 10);
  const d = SIGNAL_PTS.map((p, i) => `${i ? "L" : "M"}${p[0]},${p[1]}`).join(" ");
  return (
    <AbsoluteFill style={{ background: "#010104" }}>
      <GridBg opacity={interpolate(f, [20, 60], [0, 0.6], CLAMP) * out} />
      <AbsoluteFill style={{ translate: `${camX}px ${camY}px`, opacity: out }}>
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          <path d={d} fill="none" stroke={VIOLET} strokeWidth={2} strokeDasharray={TOTAL} strokeDashoffset={TOTAL - prog} style={{ filter: "drop-shadow(0 0 6px rgba(124,58,237,0.9))" }} />
        </svg>
        {/* cabeza de la señal */}
        <div style={{ position: "absolute", left: hx - 7, top: hy - 7, width: 14, height: 14, borderRadius: 99, background: "#FFFFFF", boxShadow: `0 0 18px 6px ${VIOLET}`, opacity: dot * (prog < TOTAL - 2 ? 1 : 0) }} />
        {BLOCKS.map((b, i) => {
          const hit = prog >= blockLen(i);
          const snapT = interpolate(prog, [blockLen(i) - 160, blockLen(i)], [0, 1], { ...CLAMP, easing: EASE_OUT });
          const ox = (1 - snapT) * (rng(i, 30) - 0.5) * 120;
          const oy = (1 - snapT) * (rng(i, 31) - 0.5) * 90;
          const rot = (1 - snapT) * (rng(i, 32) - 0.5) * 16;
          const lit = interpolate(prog, [blockLen(i), blockLen(i) + 60], [0, 1], CLAMP);
          return (
            <div
              key={b}
              style={{
                position: "absolute",
                left: BX(i) + ox,
                top: BY(i) + oy,
                translate: "-50% -50%",
                rotate: `${rot}deg`,
                ...glass,
                width: 230,
                padding: "18px 20px",
                textAlign: "center",
                fontFamily: FONTS.body,
                fontWeight: 600,
                fontSize: 24,
                color: hit ? "#FFFFFF" : "rgba(255,255,255,0.55)",
                border: `1px solid rgba(${hit ? "167,139,250" : "255,255,255"},${hit ? 0.3 + 0.5 * lit : 0.12})`,
                boxShadow: `0 0 ${30 * lit}px rgba(124,58,237,${0.5 * lit}), 0 20px 50px rgba(0,0,0,0.45)`,
                opacity: interpolate(f, [4 + i * 2, 14 + i * 2], [0, 1], CLAMP),
              }}
            >
              {b}
              <div style={{ fontSize: 13, fontWeight: 400, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>{hit ? "conectado" : "sin conectar"}</div>
            </div>
          );
        })}
      </AbsoluteFill>
      <Headline lines={["¿Y si todo trabajara", { text: "junto?", italic: true }]} start={58} exitAt={92} y={870} size={64} maxWidth={1400} inDur={14} />
      {/* "junto?" suelta líneas que arman la red */}
      {f >= 86
        ? Array.from({ length: 7 }).map((_, i) => {
            const a = (i / 7) * Math.PI * 2 - Math.PI / 2;
            const tx = CX + Math.cos(a) * 640;
            const ty = CY + Math.sin(a) * 330;
            const t = interpolate(f, [86, 104], [0, 1], { ...CLAMP, easing: EASE_IN_OUT });
            const sx = CX;
            const sy = 900;
            return (
              <svg key={i} width={W} height={H} style={{ position: "absolute", inset: 0 }}>
                <line x1={sx} y1={sy} x2={sx + (tx - sx) * t} y2={sy + (ty - sy) * t} stroke={VIOLET} strokeWidth={1.5} opacity={0.8} />
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

const nodePos = (i: number, f: number) => {
  const a = (i / NODES.length) * Math.PI * 2 - Math.PI / 2 + f * 0.0016;
  return [CX + Math.cos(a) * 640, CY + Math.sin(a) * 330] as [number, number];
};

const STEPS = ["Reconoce al cliente", "Revisa la agenda", "Reserva el turno", "Actualiza la ficha", "Manda la confirmación"];

const SystemScene: React.FC = () => {
  const f = useCurrentFrame();
  const draw = interpolate(f, [0, 24], [0, 1], { ...CLAMP, easing: EASE_OUT });
  const dim = interpolate(f, [54, 62, 104, 112], [1, 0.18, 0.18, 0], CLAMP);
  const coreO = interpolate(f, [104, 114], [1, 0], CLAMP);
  const msgT = interpolate(f, [40, 54], [0, 1], { ...CLAMP, easing: EASE_IN });
  const wa = nodePos(0, f);
  const pulseCore = interpolate(f, [54, 58, 70], [0, 1, 0], CLAMP);
  const collapse = interpolate(f, [100, 110], [0, 1], { ...CLAMP, easing: EASE_IN });
  // el "5" gigante: la cámara lo atraviesa
  const five = enter(f, 126, 8);
  const through = interpolate(f, [134, 148], [1, 30], { ...CLAMP, easing: EASE_IN });
  return (
    <AbsoluteFill style={{ background: "#010104" }}>
      <NightBackground intensity={0.7} glowY={0.5} />
      <GridBg opacity={0.5 * dim} />
      <AbsoluteFill style={{ opacity: dim }}>
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          {NODES.map((_, i) => {
            const [x, y] = nodePos(i, f);
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
          const [x, y] = nodePos(i, f);
          const p = enter(f, 6 + i * 3, 12);
          return (
            <div key={n} style={{ position: "absolute", left: x, top: y, translate: "-50% -50%", scale: String(0.9 + 0.1 * p), opacity: p, ...glass, borderRadius: 999, padding: "14px 28px", display: "flex", alignItems: "center", gap: 12, fontFamily: FONTS.body }}>
              <div style={{ width: 10, height: 10, borderRadius: 99, background: CYAN, opacity: 0.6 + 0.4 * Math.abs(Math.sin(f * 0.2 + i)) }} />
              <div>
                <div style={{ fontSize: 24, fontWeight: 600, color: "#FFFFFF" }}>{n}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>{NODE_META[i]}</div>
              </div>
            </div>
          );
        })}
      </AbsoluteFill>
      {/* núcleo AIRIS */}
      <div style={{ position: "absolute", left: CX, top: CY, translate: "-50% -50%", opacity: coreO * enter(f, 8, 12) }}>
        <div style={{ position: "absolute", left: "50%", top: "50%", width: 300, height: 300, translate: "-50% -50%", borderRadius: 999, background: `radial-gradient(circle, rgba(124,58,237,${0.35 + 0.4 * pulseCore}) 0%, rgba(124,58,237,0) 70%)` }} />
        <div style={{ ...glass, borderRadius: 999, width: 190, height: 190, display: "flex", alignItems: "center", justifyContent: "center", opacity: dim }}>
          <Logo width={150} start={10} glow />
        </div>
      </div>
      {/* un mensaje entra al núcleo */}
      {f >= 26 && f < 56 ? (
        <div style={{ position: "absolute", left: wa[0] + (CX - wa[0]) * msgT, top: wa[1] + 90 + (CY - wa[1] - 90) * msgT, width: 520, translate: "-50% -50%", scale: String(1 - 0.8 * msgT), opacity: enter(f, 26, 8) * (1 - msgT * 0.7) }}>
          <WABubble text="Hola, quiero sacar un turno." time="09:14" start={26} fontSize={30} maxWidth={520} />
        </div>
      ) : null}
      {/* la secuencia que se despliega */}
      {f >= 54 && f < 112 ? (
        <div style={{ position: "absolute", left: CX, top: CY, translate: "-50% -50%", display: "flex", flexDirection: "column", gap: 14, scale: `1 ${1 - collapse}`, opacity: 1 - collapse * 0.5 }}>
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
      {f >= 104 && f < 116 ? <div style={{ position: "absolute", left: CX - 350 * (1 - interpolate(f, [108, 116], [0, 1], CLAMP)), top: CY, width: 700 * (1 - interpolate(f, [108, 116], [0, 1], CLAMP)), height: 2, background: VIOLET, boxShadow: `0 0 12px ${VIOLET}` }} /> : null}
      <Headline lines={["Un mensaje."]} start={112} exitAt={124} y={CY} size={110} maxWidth={1400} inDur={10} stagger={0} />
      {f >= 124 ? (
        <AbsoluteFill style={{ opacity: five * interpolate(through, [8, 30], [1, 0], CLAMP), transformOrigin: `${CX + 10}px ${CY - 10}px`, scale: String(through) }}>
          <T size={560} y={CY - 440} weight={900} font={FONTS.display}>
            5
          </T>
        </AbsoluteFill>
      ) : null}
      {f >= 124 ? <Headline lines={["tareas resueltas."]} start={128} exitAt={136} y={930} size={56} maxWidth={1200} inDur={8} /> : null}
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
const FX = (i: number) => 360 + i * 560;
const FY = (i: number) => [540, 360, 720, 360, 720, 360, 540][i];
const HIT = (i: number) => 14 + i * 13;

const Engine: React.FC = () => {
  const f = useCurrentFrame();
  // la señal viaja nodo a nodo
  let px = FX(0);
  let py = FY(0);
  for (let i = 0; i < FLOW.length - 1; i++) {
    if (f >= HIT(i)) {
      const t = interpolate(f, [HIT(i) + 2, HIT(i + 1)], [0, 1], { ...CLAMP, easing: EASE_IN_OUT });
      const mx = (FX(i) + FX(i + 1)) / 2;
      const l1 = mx - FX(i);
      const l2 = Math.abs(FY(i + 1) - FY(i));
      const l3 = FX(i + 1) - mx;
      const L = l1 + l2 + l3;
      const d = t * L;
      if (d < l1) {
        px = FX(i) + d;
        py = FY(i);
      } else if (d < l1 + l2) {
        px = mx;
        py = FY(i) + Math.sign(FY(i + 1) - FY(i)) * (d - l1);
      } else {
        px = mx + (d - l1 - l2);
        py = FY(i + 1);
      }
    }
  }
  if (f < 8) {
    px = FX(0) - interpolate(f, [0, 8], [300, 0], CLAMP);
  }
  const s = interpolate(f, [0, 12, 40, 62, 86, 108, 112, 132], [0.42, 0.95, 1.35, 1.0, 1.4, 1.1, 1.1, 7], { ...CLAMP, easing: EASE_IN_OUT });
  const lastX = FX(6);
  const lastY = FY(6);
  const followX = f < 108 ? px : lastX;
  const followY = f < 108 ? py : lastY;
  const wide = interpolate(f, [0, 12], [1, 0], CLAMP);
  const camX = followX * (1 - wide) + (FX(3)) * wide;
  const camY = followY * (1 - wide) + CY * wide;
  const tx = CX - camX * s;
  const ty = CY - camY * s;
  const out = interpolate(f, [124, 134], [1, 0], CLAMP);
  const lead = Math.max(0, px - FX(0)) + 260;
  const path = FLOW.map((_, i) => {
    if (i === 0) return `M${FX(0) - 300},${FY(0)} L${FX(0)},${FY(0)}`;
    const mx = (FX(i - 1) + FX(i)) / 2;
    return `L${mx},${FY(i - 1)} L${mx},${FY(i)} L${FX(i)},${FY(i)}`;
  }).join(" ");
  return (
    <AbsoluteFill style={{ background: "#010104" }}>
      <NightBackground intensity={0.55} glowY={0.5} />
      <GridBg x={-camX * 0.3} y={-camY * 0.3} scale={Math.max(0.6, s * 0.7)} opacity={0.55 * out} />
      <AbsoluteFill style={{ opacity: out }}>
        <div style={{ position: "absolute", left: 0, top: 0, transformOrigin: "0 0", translate: `${tx}px ${ty}px`, scale: String(s) }}>
          <svg width={4400} height={1100} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
            <path d={path} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={2} />
            <path d={path} fill="none" stroke={VIOLET} strokeWidth={2.5} strokeDasharray={`${lead * 1.35} 99999`} style={{ filter: "drop-shadow(0 0 5px rgba(124,58,237,0.9))" }} />
          </svg>
          <div style={{ position: "absolute", left: px - 9, top: py - 9, width: 18, height: 18, borderRadius: 99, background: "#FFFFFF", boxShadow: `0 0 22px 8px ${VIOLET}` }} />
          {FLOW.map((n, i) => {
            const near = interpolate(Math.abs(px - FX(i)), [0, 320], [1, 0], CLAMP);
            const busy = f >= HIT(i) - 4;
            const done = f >= HIT(i) + 8;
            const prog = interpolate(f, [HIT(i) - 4, HIT(i) + 8], [0, 1], CLAMP);
            return (
              <div
                key={n.name}
                style={{
                  position: "absolute",
                  left: FX(i),
                  top: FY(i),
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

/** El gráfico que vive dentro del último nodo: ejes, números, línea, y la cámara la sigue. */
const CHART_PTS = Array.from({ length: 16 }, (_, k) => [180 + k * 104, 860 - (k * 30 + Math.sin(k * 1.3) * 60 + (k > 10 ? (k - 10) * 40 : 0))] as [number, number]);

const ChartBuild: React.FC<{ f: number }> = ({ f }) => {
  const o = interpolate(f, [0, 8], [0, 1], CLAMP);
  const axes = interpolate(f, [0, 8], [0, 1], { ...CLAMP, easing: EASE_OUT });
  const line = interpolate(f, [6, 30], [0, 1], { ...CLAMP, easing: EASE_IN_OUT });
  const n = CHART_PTS.length;
  const upto = line * (n - 1);
  const pts = CHART_PTS.slice(0, Math.floor(upto) + 1).map((p) => p.join(",")).join(" ");
  const i0 = Math.floor(upto);
  const frac = upto - i0;
  const a = CHART_PTS[Math.min(i0, n - 1)];
  const b = CHART_PTS[Math.min(i0 + 1, n - 1)];
  const tip = [a[0] + (b[0] - a[0]) * frac, a[1] + (b[1] - a[1]) * frac];
  const camX = (tip[0] - CX) * 0.35;
  const camY = (tip[1] - CY) * 0.35;
  return (
    <AbsoluteFill style={{ opacity: o, background: "#02030A" }}>
      <GridBg opacity={0.4} />
      <AbsoluteFill style={{ translate: `${-camX}px ${-camY}px`, scale: String(1 + line * 0.25) }}>
        <svg width={W} height={H}>
          <line x1={180} y1={880} x2={180 + 1600 * axes} y2={880} stroke="rgba(255,255,255,0.35)" strokeWidth={1} />
          <line x1={180} y1={880} x2={180} y2={880 - 700 * axes} stroke="rgba(255,255,255,0.35)" strokeWidth={1} />
          {[0, 1, 2, 3].map((k) => (
            <text key={k} x={150} y={880 - k * 200} fill="rgba(255,255,255,0.4)" fontSize={16} fontFamily={FONTS.body} textAnchor="end" opacity={interpolate(f, [4 + k, 10 + k], [0, 1], CLAMP)}>
              {k * 250}
            </text>
          ))}
          <polyline points={`${pts} ${tip[0]},${tip[1]}`} fill="none" stroke={VIOLET} strokeWidth={3} style={{ filter: "drop-shadow(0 0 8px rgba(124,58,237,0.9))" }} />
          {CHART_PTS.slice(0, i0 + 1).map((p, k) => (
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
  const back = interpolate(f, [54, 86], [1, 0.155], { ...CLAMP, easing: EASE_IN_OUT });
  const others = interpolate(f, [60, 80], [0, 1], CLAMP);
  const dim = interpolate(f, [86, 94], [1, 0.22], CLAMP);
  const cols = 9;
  const rows = 7;
  const tw = 1100 * 0.155 + 14;
  const th = 620 * 0.155 + 14;
  // líneas enredadas que se enderezan
  const tangleIn = interpolate(f, [110, 120], [0, 1], CLAMP);
  const sigX = interpolate(f, [122, 140], [200, 1720], { ...CLAMP, easing: EASE_IN_OUT });
  return (
    <AbsoluteFill style={{ background: "#010104" }}>
      <NightBackground intensity={0.6} glowY={0.5} />
      <AbsoluteFill style={{ opacity: dim }}>
        {f >= 58
          ? Array.from({ length: cols * rows }).map((_, k) => {
              const c = k % cols;
              const r = Math.floor(k / cols);
              if (c === 4 && r === 3) return null;
              const x = CX + (c - 4) * tw;
              const y = CY + (r - 3) * th;
              const d = Math.hypot(c - 4, r - 3);
              const o = others * interpolate(f, [60 + d * 3, 70 + d * 3], [0, 1], CLAMP);
              return (
                <div key={k} style={{ position: "absolute", left: x, top: y, translate: "-50% -50%", scale: "0.155", opacity: o }}>
                  <Dashboard f={f} mini seed={k} />
                </div>
              );
            })
          : null}
        <div style={{ position: "absolute", left: CX, top: CY, translate: "-50% -50%", scale: String(back) }}>
          <Dashboard f={f} />
        </div>
      </AbsoluteFill>
      {f < 60 ? <T size={20} y={1000} opacity={0.5}>Datos de ejemplo</T> : null}
      <Headline lines={["La automatización no reemplaza tu negocio."]} start={86} exitAt={98} y={CY} size={68} maxWidth={1500} inDur={12} />
      <Headline lines={["Le saca lo que lo", { text: "frena.", italic: true }]} start={110} y={440} size={80} maxWidth={1400} inDur={12} />
      {f >= 110 ? (
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          {Array.from({ length: 7 }).map((_, k) => {
            const y0 = 700 + k * 26;
            const pts = Array.from({ length: 90 }, (_, j) => {
              const x = 200 + j * 17.3;
              const straight = x < sigX ? interpolate(sigX - x, [0, 120], [0, 1], CLAMP) : 0;
              const mess = Math.sin(j * 0.35 + k * 1.7) * 60 + Math.sin(j * 0.9 + k) * 30;
              return `${x},${y0 + mess * (1 - straight) * tangleIn}`;
            }).join(" ");
            return <polyline key={k} points={pts} fill="none" stroke={x2c(k, sigX)} strokeWidth={1.5} opacity={tangleIn} />;
          })}
          {f >= 122 && f < 142 ? <circle cx={sigX} cy={778} r={8} fill="#FFFFFF" style={{ filter: "drop-shadow(0 0 14px #7C3AED)" }} /> : null}
        </svg>
      ) : null}
    </AbsoluteFill>
  );
};
const x2c = (_k: number, sigX: number) => (sigX > 1700 ? VIOLET : "rgba(255,255,255,0.55)");

// ================================================================== 06 · ANTES Y DESPUÉS

const Morph: React.FC<{ from: string; to: string; at: number; y: number; size: number; show: number }> = ({ from, to, at, y, size, show }) => {
  const f = useCurrentFrame();
  const letters = (s: string, out: boolean) =>
    s.split("").map((ch, i) => {
      const t = interpolate(f, [at + i * 1.2, at + i * 1.2 + 8], [0, 1], { ...CLAMP, easing: EASE_IN_OUT });
      const v = out ? 1 - t : t;
      return (
        <span key={i} style={{ display: "inline-block", opacity: v, translate: `0 ${(out ? -t : 1 - t) * size * 0.35}px`, filter: `blur(${(1 - v) * 8}px)`, whiteSpace: "pre" }}>
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

const TOOLS = [
  { name: "WhatsApp", x: 250, y: 330, r: -4 },
  { name: "Planilla", x: 620, y: 300, r: 3 },
  { name: "Correo", x: 300, y: 720, r: 3 },
  { name: "Agenda", x: 650, y: 700, r: -3 },
];
const CURSOR_PATH: [number, number, number][] = [
  [0, 300, 360],
  [14, 640, 330],
  [26, 330, 750],
  [38, 670, 730],
  [50, 280, 360],
  [62, 640, 330],
  [74, 330, 750],
  [86, 670, 730],
];

const Split: React.FC = () => {
  const f = useCurrentFrame();
  const div = interpolate(f, [40, 96], [CX, 110], { ...CLAMP, easing: EASE_IN_OUT });
  const cur = (() => {
    for (let k = 0; k < CURSOR_PATH.length - 1; k++) {
      const [f0, x0, y0] = CURSOR_PATH[k];
      const [f1, x1, y1] = CURSOR_PATH[k + 1];
      if (f <= f1) {
        const t = interpolate(f, [f0, f1], [0, 1], { ...CLAMP, easing: EASE_IN_OUT });
        return [x0 + (x1 - x0) * t, y0 + (y1 - y0) * t];
      }
    }
    return [CURSOR_PATH[CURSOR_PATH.length - 1][1], CURSOR_PATH[CURSOR_PATH.length - 1][2]];
  })();
  const nodes: [number, number, string][] = [
    [1180, 320, "WhatsApp"],
    [1560, 320, "Agenda"],
    [1180, 760, "Fichas"],
    [1560, 760, "Cobros"],
    [760, 320, "Llamadas"],
    [760, 760, "Ventas"],
    [340, 540, "Atención"],
  ];
  const core: [number, number] = [1370, 540];
  const out = leave(f, 108, 12);
  return (
    <AbsoluteFill style={{ background: "#010104", opacity: out }}>
      {/* izquierda: herramientas sueltas */}
      <AbsoluteFill style={{ clipPath: `inset(0 ${W - div}px 0 0)`, background: "#07080C" }}>
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          <line x1={250} y1={330} x2={620} y2={300} stroke="rgba(245,181,68,0.5)" strokeWidth={1.5} strokeDasharray="10 14" />
          <line x1={300} y1={720} x2={650} y2={700} stroke="rgba(245,181,68,0.5)" strokeWidth={1.5} strokeDasharray="10 14" />
          <line x1={620} y1={300} x2={650} y2={700} stroke="rgba(245,181,68,0.35)" strokeWidth={1.5} strokeDasharray="4 22" />
        </svg>
        {TOOLS.map((t) => (
          <div key={t.name} style={{ position: "absolute", left: t.x, top: t.y, translate: "-50% -50%", rotate: `${t.r}deg`, ...glass, background: "rgba(30,31,40,0.95)", width: 300, fontFamily: FONTS.body }}>
            <div style={{ display: "flex", gap: 6, padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              {[0, 1, 2].map((k) => (
                <div key={k} style={{ width: 9, height: 9, borderRadius: 9, background: "rgba(255,255,255,0.2)" }} />
              ))}
              <div style={{ marginLeft: 10, fontSize: 15, color: "rgba(255,255,255,0.6)" }}>{t.name}</div>
            </div>
            <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
              {[0, 1, 2].map((k) => (
                <div key={k} style={{ height: 10, width: `${50 + rng(k + t.x, 60) * 45}%`, borderRadius: 5, background: "rgba(255,255,255,0.12)" }} />
              ))}
            </div>
          </div>
        ))}
        {/* cursor humano que salta de una a otra */}
        <svg width={40} height={48} viewBox="0 0 20 24" style={{ position: "absolute", left: cur[0], top: cur[1], filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.6))" }}>
          <path d="M2 1 L2 19 L6.5 15 L9.5 22 L12.5 20.7 L9.6 14 L16 14 Z" fill="#FFFFFF" stroke="#111" strokeWidth={1.1} strokeLinejoin="round" />
        </svg>
      </AbsoluteFill>
      {/* derecha: AIRIS conectado */}
      <AbsoluteFill style={{ clipPath: `inset(0 0 0 ${div}px)` }}>
        <NightBackground intensity={0.8} glowX={0.7} glowY={0.5} />
        <GridBg opacity={0.45} />
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
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
          <div key={n} style={{ position: "absolute", left: x, top: y, translate: "-50% -50%", ...glass, borderRadius: 999, padding: "12px 24px", fontFamily: FONTS.body, fontWeight: 600, fontSize: 22, color: "#FFFFFF", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 9, height: 9, borderRadius: 9, background: CYAN }} />
            {n}
          </div>
        ))}
        <div style={{ position: "absolute", left: core[0], top: core[1], translate: "-50% -50%", ...glass, borderRadius: 999, width: 150, height: 150, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 60px rgba(124,58,237,0.6)" }}>
          <Logo width={115} start={-30} glow />
        </div>
      </AbsoluteFill>
      <div style={{ position: "absolute", left: div - 1, top: 0, width: 2, height: H, background: "linear-gradient(transparent, rgba(255,255,255,0.8), transparent)" }} />
      <Morph from="A mano" to="Automático" at={44} y={80} size={72} show={enter(f, 6, 10)} />
      <Morph from="Por separado" to="Conectado" at={72} y={900} size={72} show={enter(f, 12, 10)} />
    </AbsoluteFill>
  );
};

// ================================================================== 07 · EL AGENTE

const LAYERS = ["Cliente reconocido", "Turno actual encontrado", "Jueves a la tarde disponible", "Reglas del consultorio", "Ficha del cliente", "Agenda"];

const Agent: React.FC = () => {
  const f = useCurrentFrame();
  const o = enter(f, 0, 10) * leave(f, 98, 10);
  const scanX = interpolate(f, [46, 60], [180, 1740], { ...CLAMP, easing: EASE_IN_OUT });
  const through = interpolate(f, [136, 152], [1, 14], { ...CLAMP, easing: EASE_IN });
  const chips = ["Agenda actualizada", "Ficha actualizada", "Confirmación enviada"];
  return (
    <AbsoluteFill style={{ background: "#010104" }}>
      <NightBackground intensity={0.7} glowY={0.45} />
      <AbsoluteFill style={{ opacity: o }}>
        {LAYERS.map((l, i) => {
          const side = i % 2 === 0 ? -1 : 1;
          const k = Math.floor(i / 2);
          const p = interpolate(f, [16 + i * 4, 30 + i * 4], [0, 1], { ...CLAMP, easing: EASE_OUT });
          const x = CX + side * (470 + k * 150) * p;
          const y = 300 + k * 190;
          const scanned = scanX > x;
          return (
            <div
              key={l}
              style={{
                position: "absolute",
                left: x,
                top: y,
                translate: "-50% -50%",
                opacity: p * 0.95,
                scale: String(0.8 + 0.2 * p),
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
        {f >= 44 && f < 64 ? <div style={{ position: "absolute", left: scanX - 1, top: 120, width: 2, height: 840, background: VIOLET, boxShadow: `0 0 24px 6px rgba(124,58,237,0.7)` }} /> : null}
        {/* el chat */}
        <div style={{ position: "absolute", left: CX - 330, top: 170, width: 660, height: 720, borderRadius: 36, overflow: "hidden", ...waWallpaper, boxShadow: "0 40px 100px rgba(0,0,0,0.6)", border: "1.5px solid rgba(255,255,255,0.1)" }}>
          <WAHeader name="Laura" status="en línea" scale={0.85} />
          <div style={{ padding: "26px 28px", display: "flex", flexDirection: "column", gap: 18 }}>
            <WABubble text="¿Puedo pasar mi turno al jueves a la tarde?" time="16:02" start={6} fontSize={30} maxWidth={480} />
            <WABubble text="Listo, te pasé al jueves a las 16:30. Te aviso el día anterior." time="16:02" out start={64} fontSize={30} maxWidth={480} />
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 34, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            {chips.map((c, i) => {
              const p = enter(f, 72 + i * 7, 10);
              return (
                <div key={c} style={{ opacity: p, translate: `0 ${(1 - p) * 12}px`, display: "flex", alignItems: "center", gap: 10, background: "rgba(124,58,237,0.9)", borderRadius: 999, padding: "10px 22px", fontFamily: FONTS.body, fontWeight: 600, fontSize: 20, color: "#FFFFFF" }}>
                  <CheckIcon size={20} progress={interpolate(f, [76 + i * 7, 82 + i * 7], [0, 1], CLAMP)} />
                  {c}
                </div>
              );
            })}
          </div>
        </div>
      </AbsoluteFill>
      <Headline lines={["No es un chatbot."]} start={104} exitAt={120} y={CY} size={96} maxWidth={1400} inDur={10} stagger={0} />
      <AbsoluteFill style={{ transformOrigin: `${CX + 170}px ${CY + 60}px`, scale: String(through), opacity: interpolate(through, [4, 14], [1, 0], CLAMP) }}>
        <Headline lines={["Es un sistema que", { text: "resuelve.", italic: true }]} start={122} y={CY} size={96} maxWidth={1400} inDur={10} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ================================================================== 08 · FINAL

const MODULES = ["Ventas", "Atención", "Operaciones", "Fichas de clientes", "WhatsApp", "Llamadas", "Turnos", "Cobros"];

const Finale: React.FC = () => {
  const f = useCurrentFrame();
  const ui = interpolate(f, [36, 52], [1, 0], CLAMP);
  const conv = interpolate(f, [44, 70], [0, 1], { ...CLAMP, easing: EASE_IN_OUT });
  const hit = interpolate(f, [70, 74, 110], [0, 1, 0], CLAMP);
  const lines = interpolate(f, [66, 76], [1, 0], CLAMP);
  const fade = interpolate(f, [160, 178], [1, 0], CLAMP);
  const wide = interpolate(f, [0, 40], [1.12, 1], { ...CLAMP, easing: EASE_OUT });
  return (
    <AbsoluteFill style={{ background: "#010104", opacity: fade }}>
      <NightBackground intensity={0.8 + 0.6 * hit} glowY={0.46} />
      <LightStrands width={W} height={H} opacity={0.15 + 0.5 * hit} energy={0.6 + hit} centerY={0.55} speed={0.6} />
      <AbsoluteFill style={{ scale: String(wide) }}>
        <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: lines }}>
          {MODULES.map((_, i) => {
            const a = (i / MODULES.length) * Math.PI * 2 + f * 0.002;
            const x = CX + Math.cos(a) * 700 * (1 - conv);
            const y = CY + Math.sin(a) * 360 * (1 - conv);
            const a2 = ((i + 1) / MODULES.length) * Math.PI * 2 + f * 0.002;
            const x2 = CX + Math.cos(a2) * 700 * (1 - conv);
            const y2 = CY + Math.sin(a2) * 360 * (1 - conv);
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
          const x = CX + Math.cos(a) * 700;
          const y = CY + Math.sin(a) * 360;
          return (
            <div key={m} style={{ position: "absolute", left: x, top: y, translate: "-50% -50%", opacity: ui * enter(f, i * 2, 10), ...glass, borderRadius: 999, padding: "12px 24px", fontFamily: FONTS.body, fontWeight: 600, fontSize: 22, color: "#FFFFFF", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 9, height: 9, borderRadius: 9, background: CYAN, opacity: 0.5 + 0.5 * Math.abs(Math.sin(f * 0.25 + i)) }} />
              {m}
            </div>
          );
        })}
      </AbsoluteFill>
      {f >= 64 ? (
        <div style={{ position: "absolute", left: CX, top: CY - 70, translate: "-50% -50%", scale: String(1 + 0.03 * hit) }}>
          <Logo width={620} start={66} stagger={3} glow />
        </div>
      ) : null}
      <Headline lines={["Un mensaje entra.", { text: "La operación continúa.", italic: true }]} start={86} y={CY + 170} size={46} maxWidth={1200} inDur={14} stagger={6} />
      <T size={26} y={CY + 300} opacity={enter(f, 112, 14) * 0.8} weight={500}>
        Consultoría gratuita de 30 minutos
      </T>
      <T size={30} y={CY + 346} opacity={enter(f, 118, 14)} weight={600}>
        airisautomation.com
      </T>
    </AbsoluteFill>
  );
};

// ================================================================== film

export const V11BrandFilm: React.FC = () => (
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
    {/* barrido de luz blanca en los cambios grandes */}
    <SweepFlash />
  </AbsoluteFill>
);

const SweepFlash: React.FC = () => {
  const f = useCurrentFrame();
  const at = [V11.system, V11.engine, V11.split, V11.finale];
  const v = Math.max(...at.map((a) => interpolate(f, [a - 2, a, a + 8], [0, 0.18, 0], CLAMP)));
  return <AbsoluteFill style={{ background: "#FFFFFF", mixBlendMode: "soft-light", opacity: v, pointerEvents: "none" }} />;
};
