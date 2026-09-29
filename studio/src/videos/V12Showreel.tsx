import React, { useEffect, useMemo, useRef } from "react";
import { AbsoluteFill, interpolate, Sequence, spring, useCurrentFrame } from "remotion";
import { CameraMotionBlur } from "@remotion/motion-blur";
import { COLORS, EASE_IN_OUT, EASE_OUT, FONTS } from "../brand/tokens";
import { CLAMP } from "../lib/anim";
import { Grain } from "../components/Backgrounds";
import { LOGO_PATHS, LOGO_VIEWBOX } from "../brand/logoPaths";

/**
 * Showreel de marca (9:16, 24 fps, unos 19 s). Cortado golpe a golpe sobre Machine Drum
 * Vibes (146 BPM). Pieza de lucimiento: acá sí hay letras con física, bloques de color a
 * pantalla completa y cortes cada tiempo. Solo colores de marca.
 */
export const V12_FPS = 24;
export const V12_W = 1080;
export const V12_H = 1920;
export const V12_BPM = 146;
export const V12_BEAT = (24 * 60) / V12_BPM;
export const b = (k: number) => Math.round(k * V12_BEAT);
export const V12_DURATION = b(47);

const W = V12_W;
const H = V12_H;
const CX = W / 2;
const CY = H / 2;
const VIOLET = COLORS.violet;
const CYAN = "#67E8F9";
const NIGHT = "#05040F";
const CREAM = "#F4F1FA";
const DISPLAY = FONTS.display;
const BODY = FONTS.body;

const rng = (i: number, k: number) => {
  const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** Pulso que decae después de cada golpe (0..1). */
const beatPulse = (f: number, decay = 3) => {
  const since = f - b(Math.floor(f / V12_BEAT + 0.001));
  return Math.exp(-Math.max(0, since) / decay);
};

// ------------------------------------------------------------------ detalles de estudio

const Hud: React.FC<{ dark?: boolean }> = ({ dark = true }) => {
  const f = useCurrentFrame();
  const c = dark ? "rgba(255,255,255,0.45)" : "rgba(5,4,15,0.45)";
  const s = Math.floor(f / 24);
  const fr = f % 24;
  return (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, top: 120, textAlign: "center", fontFamily: BODY, fontSize: 20, letterSpacing: "0.3em", color: c }}>AIRIS · 2026</div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 120, textAlign: "center", fontFamily: BODY, fontSize: 20, letterSpacing: "0.2em", color: c }}>
        {`00:00:${String(s).padStart(2, "0")}:${String(fr).padStart(2, "0")}`}
      </div>
    </>
  );
};

// ------------------------------------------------------------------ 00 · el punto

const Intro: React.FC = () => {
  const f = useCurrentFrame();
  const p = beatPulse(f, 4);
  const grow = interpolate(f, [b(3.25), b(4)], [0, 1], { ...CLAMP, easing: (t) => t * t * t });
  const r = 10 + 8 * p + grow * 1600;
  return (
    <AbsoluteFill style={{ background: NIGHT }}>
      {[0, 1, 2, 3].map((k) => {
        const t = interpolate(f, [b(k), b(k) + 18], [0, 1], CLAMP);
        return t > 0 && t < 1 ? (
          <div key={k} style={{ position: "absolute", left: CX, top: CY, width: 40 + t * 420, height: 40 + t * 420, translate: "-50% -50%", borderRadius: 999, border: `1.5px solid rgba(255,255,255,${0.5 * (1 - t)})` }} />
        ) : null;
      })}
      <div style={{ position: "absolute", left: CX, top: CY, width: r * 2, height: r * 2, translate: "-50% -50%", borderRadius: 999, background: grow > 0.02 ? VIOLET : "#FFFFFF", boxShadow: `0 0 ${30 * p}px rgba(255,255,255,0.8)` }} />
      <Hud />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ letras con física

const Drop: React.FC<{ text: string; start: number; size: number; color: string; y: number; stagger?: number; italic?: boolean; font?: string; weight?: number }> = ({
  text,
  start,
  size,
  color,
  y,
  stagger = 0.4,
  italic,
  font = DISPLAY,
  weight = 900,
}) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y - size * 0.6, textAlign: "center", whiteSpace: "pre", fontFamily: font, fontWeight: weight, fontStyle: italic ? "italic" : "normal", fontSize: size, color, letterSpacing: "-0.03em", lineHeight: 1.1 }}>
      {text.split("").map((ch, i) => {
        const s = spring({ frame: f - start - i * stagger, fps: 24, config: { damping: 15, mass: 0.45, stiffness: 300 } });
        const rot = (1 - s) * (rng(i + text.length, 3) - 0.5) * 40;
        return (
          <span key={i} style={{ display: "inline-block", translate: `0 ${(1 - s) * -420}px`, rotate: `${rot}deg`, opacity: f >= start + i * stagger ? 1 : 0 }}>
            {ch}
          </span>
        );
      })}
    </div>
  );
};

/** Bloque de color a pantalla completa con una palabra que cae. */
const Slam: React.FC<{ word: string; bg: string; fg: string; sub?: string; size?: number }> = ({ word, bg, fg, sub, size: max = 190 }) => {
  const f = useCurrentFrame();
  // Unbounded es ancha: el tamaño se ajusta al largo para que entre en 900 px
  const size = Math.min(max, Math.floor(900 / (word.length * 0.66)));
  const punch = interpolate(f, [0, 6], [1.08, 1], { ...CLAMP, easing: EASE_OUT });
  return (
    <AbsoluteFill style={{ background: bg, scale: String(punch) }}>
      <Drop text={word} start={0} size={size} color={fg} y={CY} />
      {sub ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: CY + size * 0.55, textAlign: "center", fontFamily: BODY, fontWeight: 500, fontStyle: "italic", fontSize: 58, color: fg, opacity: interpolate(f, [3, 8], [0, 1], CLAMP) }}>{sub}</div>
      ) : null}
      <Hud dark={bg !== CREAM && bg !== "#FFFFFF" && bg !== CYAN} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ cuenta regresiva

const Count: React.FC<{ n: string; bg: string; fg: string }> = ({ n, bg, fg }) => {
  const f = useCurrentFrame();
  const s = spring({ frame: f, fps: 24, config: { damping: 14, stiffness: 180 } });
  return (
    <AbsoluteFill style={{ background: bg }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: CY - 380, textAlign: "center", fontFamily: BODY, fontWeight: 500, fontStyle: "italic", fontSize: 640, lineHeight: 1, color: fg, scale: String(0.7 + 0.3 * s), rotate: `${(1 - s) * -12}deg` }}>{n}</div>
      <Hud dark={bg === NIGHT || bg === VIOLET} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ grilla que muta

const GridScene: React.FC = () => {
  const f = useCurrentFrame();
  const cols = 9;
  const rows = 16;
  const cell = W / cols;
  const phase = Math.floor(f / V12_BEAT);
  const tIn = interpolate(f - b(phase), [0, 5], [0, 1], { ...CLAMP, easing: EASE_OUT });
  const palette = [VIOLET, CYAN, "#FFFFFF", "#A78BFA"];
  const shape = (p: number) => {
    // 0 círculo, 1 cuadrado, 2 rombo, 3 cápsula
    const k = ((p % 4) + 4) % 4;
    return k;
  };
  const cur = shape(phase);
  const prev = shape(phase - 1);
  const word = enter01(f, b(1) + 2, 8);
  return (
    <AbsoluteFill style={{ background: NIGHT }}>
      {Array.from({ length: cols * rows }).map((_, i) => {
        const c = i % cols;
        const r = Math.floor(i / cols);
        const x = c * cell + cell / 2;
        const y = r * cell + cell / 2 + (H - rows * cell) / 2;
        const wave = Math.sin(c * 0.7 + r * 0.45 - f * 0.25);
        const sz = cell * (0.42 + 0.14 * wave) * (0.92 + 0.12 * beatPulse(f, 3));
        const lerp = (a: number, bb: number) => a + (bb - a) * tIn;
        const radius = (k: number) => (k === 0 ? 50 : k === 3 ? 50 : 8);
        const rot = (k: number) => (k === 2 ? 45 : k === 3 ? 45 + wave * 20 : 0);
        const wMul = (k: number) => (k === 3 ? 0.45 : 1);
        const hMul = (k: number) => (k === 3 ? 1.5 : 1);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: sz * lerp(wMul(prev), wMul(cur)),
              height: sz * lerp(hMul(prev), hMul(cur)),
              translate: "-50% -50%",
              borderRadius: `${lerp(radius(prev), radius(cur))}%`,
              rotate: `${lerp(rot(prev), rot(cur))}deg`,
              background: palette[Math.floor(rng(i, 9) * 4 + phase) % 4],
            }}
          />
        );
      })}
      <div style={{ position: "absolute", left: 0, right: 0, top: CY - 150, textAlign: "center", opacity: word }}>
        <div style={{ display: "inline-block", background: NIGHT, padding: "40px 70px", borderRadius: 40 }}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 130, color: "#FFFFFF", letterSpacing: "-0.03em" }}>Todo</div>
          <div style={{ fontFamily: BODY, fontWeight: 500, fontStyle: "italic", fontSize: 64, color: "#FFFFFF", marginTop: -10 }}>conectado.</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
const enter01 = (f: number, s: number, d: number) => interpolate(f, [s, s + d], [0, 1], { ...CLAMP, easing: EASE_OUT });

// ------------------------------------------------------------------ partículas → logo

const N = 2600;

const useLogoTargets = () =>
  useMemo(() => {
    if (typeof document === "undefined") return [] as [number, number][];
    const cw = 900;
    const scale = cw / LOGO_VIEWBOX.w;
    const ch = Math.ceil(LOGO_VIEWBOX.h * scale);
    const cv = document.createElement("canvas");
    cv.width = cw;
    cv.height = ch;
    const ctx = cv.getContext("2d")!;
    ctx.fillStyle = "#fff";
    ctx.setTransform(scale, 0, 0, scale, -LOGO_VIEWBOX.x * scale, -LOGO_VIEWBOX.y * scale);
    for (const p of LOGO_PATHS) ctx.fill(new Path2D(p.d));
    const data = ctx.getImageData(0, 0, cw, ch).data;
    const pts: [number, number][] = [];
    for (let y = 0; y < ch; y += 2) for (let x = 0; x < cw; x += 2) if (data[(y * cw + x) * 4 + 3] > 128) pts.push([x - cw / 2, y - ch / 2]);
    const out: [number, number][] = [];
    for (let i = 0; i < N; i++) out.push(pts[Math.floor(rng(i, 77) * pts.length)] ?? [0, 0]);
    return out;
  }, []);

const Particles: React.FC = () => {
  const f = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const targets = useLogoTargets();
  const form = interpolate(f, [0, b(2)], [0, 1], { ...CLAMP, easing: EASE_OUT });
  const blast = interpolate(f, [b(4), b(4) + 6], [0, 1], { ...CLAMP, easing: EASE_OUT });
  const settle = interpolate(f, [b(4) + 4, b(6)], [0, 1], { ...CLAMP, easing: EASE_IN_OUT });
  useEffect(() => {
    const c = ref.current;
    if (!c || !targets.length) return;
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, W, H);
    const rot = f * 0.03;
    const pulse = beatPulse(f, 3);
    for (let i = 0; i < N; i++) {
      // esfera de Fibonacci
      const yy = 1 - (i / (N - 1)) * 2;
      const rr = Math.sqrt(1 - yy * yy);
      const th = i * 2.399963 + rot;
      const R = 330 * (1 + 0.05 * pulse);
      let x = Math.cos(th) * rr * R;
      let y = yy * R;
      const z = Math.sin(th) * rr;
      // entra desde el desorden
      const sx = (rng(i, 1) - 0.5) * 1600;
      const sy = (rng(i, 2) - 0.5) * 2400;
      x = sx + (x - sx) * form;
      y = sy + (y - sy) * form;
      // explota y se arma el logo
      const ex = x * (1 + 1.6 * blast) + (rng(i, 3) - 0.5) * 500 * blast;
      const ey = y * (1 + 1.6 * blast) + (rng(i, 4) - 0.5) * 700 * blast;
      const [tx, ty] = targets[i];
      const px = ex + (tx - ex) * settle;
      const py = ey + (ty - ey) * settle;
      const depth = settle > 0.5 ? 1 : 0.35 + 0.65 * (z + 1) / 2;
      const size = (settle > 0.5 ? 2.2 : 1.6 + 1.8 * depth) * (1 + 0.3 * pulse);
      ctx.fillStyle = i % 7 === 0 ? `rgba(103,232,249,${depth})` : i % 3 === 0 ? `rgba(167,139,250,${depth})` : `rgba(255,255,255,${depth * 0.9})`;
      ctx.fillRect(CX + px - size / 2, CY + py - size / 2, size, size);
    }
  }, [f, targets, form, blast, settle]);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 50%, #1A1040 0%, ${NIGHT} 65%)` }}>
      <canvas ref={ref} width={W} height={H} style={{ position: "absolute", inset: 0 }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: CY + 420, textAlign: "center", fontFamily: BODY, fontSize: 22, letterSpacing: "0.25em", color: "rgba(255,255,255,0.4)", opacity: settle }}>2.600 PUNTOS · UN SISTEMA</div>
      <Hud />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ profundidad

const Orb: React.FC<{ x: number; y: number; r: number; hue: number; blur?: number }> = ({ x, y, r, hue, blur = 0 }) => (
  <div
    style={{
      position: "absolute",
      left: x - r,
      top: y - r,
      width: r * 2,
      height: r * 2,
      borderRadius: "50%",
      filter: blur ? `blur(${blur}px)` : undefined,
      background: [
        "radial-gradient(circle at 32% 26%, rgba(255,255,255,0.95) 0 5%, rgba(255,255,255,0.35) 12%, rgba(255,255,255,0) 26%)",
        "radial-gradient(circle at 70% 78%, rgba(103,232,249,0.75) 0 8%, rgba(103,232,249,0) 36%)",
        "radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 52%, rgba(5,4,15,0.55) 72%, rgba(5,4,15,0.85) 100%)",
        `conic-gradient(from ${hue}deg at 50% 50%, #7C3AED, #22D3EE, #A78BFA, #F0ABFC, #7C3AED)`,
      ].join(","),
      boxShadow: `0 ${r * 0.25}px ${r * 0.6}px rgba(0,0,0,0.5)`,
    }}
  />
);

const Depth: React.FC = () => {
  const f = useCurrentFrame();
  const orbs = Array.from({ length: 6 }).map((_, i) => {
    const a = f * (0.03 + i * 0.004) + i * 1.05;
    const orbitR = 300 + i * 40;
    const x = CX + Math.cos(a) * orbitR;
    const y = CY + Math.sin(a * 1.3) * (360 + i * 60);
    const z = Math.sin(a);
    const r = (60 + i * 16) * (1 + 0.35 * z);
    return { x, y, z, r, hue: f * 3 + i * 60, i };
  });
  const s = spring({ frame: f, fps: 24, config: { damping: 14 } });
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, #1D1147 0%, ${NIGHT} 70%)` }}>
      {orbs.filter((o) => o.z < 0).map((o) => <Orb key={o.i} {...o} blur={2} />)}
      <div style={{ position: "absolute", left: 0, right: 0, top: CY - 150, textAlign: "center", fontFamily: DISPLAY, fontWeight: 900, fontSize: 230, color: "#FFFFFF", letterSpacing: "-0.04em", scale: String(0.85 + 0.15 * s) }}>Escala</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: CY + 110, textAlign: "center", fontFamily: BODY, fontWeight: 500, fontStyle: "italic", fontSize: 60, color: "#FFFFFF", opacity: enter01(f, 6, 8) }}>sin sumar gente.</div>
      {orbs.filter((o) => o.z >= 0).map((o) => <Orb key={o.i} {...o} />)}
      <Hud />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ tablero

const Dash: React.FC = () => {
  const f = useCurrentFrame();
  const count = Math.round(interpolate(f, [0, b(3)], [0, 1024], { ...CLAMP, easing: EASE_OUT }));
  const fmt = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const donut = interpolate(f, [2, b(3)], [0, 0.99], { ...CLAMP, easing: EASE_OUT });
  const on = f >= b(1);
  const knob = interpolate(f, [b(1), b(1) + 5], [0, 1], { ...CLAMP, easing: EASE_OUT });
  const pulse = beatPulse(f, 3);
  const card = (i: number) => {
    const s = spring({ frame: f - i * 2, fps: 24, config: { damping: 13, stiffness: 160 } });
    return { translate: `0 ${(1 - s) * 200}px`, opacity: Math.min(1, s * 1.5) };
  };
  return (
    <AbsoluteFill style={{ background: CREAM }}>
      <div style={{ position: "absolute", left: 80, top: 360, width: 920, display: "flex", flexDirection: "column", gap: 28, fontFamily: BODY }}>
        <div style={{ ...card(0), background: "#FFFFFF", borderRadius: 40, padding: "44px 50px", boxShadow: "0 30px 60px rgba(40,20,90,0.12)" }}>
          <div style={{ fontSize: 26, color: "rgba(5,4,15,0.5)" }}>Consultas respondidas</div>
          <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 170, color: NIGHT, lineHeight: 1.05, letterSpacing: "-0.03em" }}>{fmt(count)}</div>
          <svg width={820} height={120}>
            <polyline points={Array.from({ length: 20 }, (_, k) => `${k * 43},${110 - k * 4.5 - rng(k, 21) * 22}`).join(" ")} fill="none" stroke={VIOLET} strokeWidth={5} strokeDasharray={1200} strokeDashoffset={1200 * (1 - donut)} strokeLinecap="round" />
          </svg>
        </div>
        <div style={{ display: "flex", gap: 28 }}>
          <div style={{ ...card(1), flex: 1, background: VIOLET, borderRadius: 40, padding: 40, color: "#FFFFFF" }}>
            <div style={{ fontSize: 26, fontWeight: 600 }}>Atención automática</div>
            <div style={{ marginTop: 26, width: 150, height: 80, borderRadius: 99, background: on ? CYAN : "rgba(255,255,255,0.3)", position: "relative" }}>
              <div style={{ position: "absolute", top: 8, left: 8 + knob * 70, width: 64, height: 64, borderRadius: 99, background: "#FFFFFF" }} />
            </div>
          </div>
          <div style={{ ...card(2), flex: 1, background: NIGHT, borderRadius: 40, padding: 40, color: "#FFFFFF", display: "flex", alignItems: "center", gap: 24 }}>
            <svg width={150} height={150} viewBox="0 0 100 100">
              <circle cx={50} cy={50} r={40} stroke="rgba(255,255,255,0.15)" strokeWidth={12} fill="none" />
              <circle cx={50} cy={50} r={40} stroke={CYAN} strokeWidth={12} fill="none" strokeDasharray={251} strokeDashoffset={251 * (1 - donut)} transform="rotate(-90 50 50)" strokeLinecap="round" />
            </svg>
            <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 64 }}>{Math.round(donut * 100)}%</div>
          </div>
        </div>
        <div style={{ ...card(3), background: "#FFFFFF", borderRadius: 40, padding: "40px 50px", display: "flex", alignItems: "flex-end", gap: 22, height: 260, boxShadow: "0 30px 60px rgba(40,20,90,0.12)" }}>
          {Array.from({ length: 12 }).map((_, k) => (
            <div key={k} style={{ flex: 1, borderRadius: 10, background: k % 3 === 0 ? VIOLET : k % 3 === 1 ? "#A78BFA" : CYAN, height: `${(30 + rng(k, 40) * 60) * (0.8 + 0.25 * pulse * ((k + Math.floor(f / V12_BEAT)) % 2))}%` }} />
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1640, textAlign: "center", fontFamily: BODY, fontSize: 22, color: "rgba(5,4,15,0.45)" }}>Datos de ejemplo</div>
      <Hud dark={false} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ arte óptico

const Stripes: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: `repeating-linear-gradient(135deg, ${VIOLET} 0 70px, ${NIGHT} 70px 140px)`, backgroundPosition: `${f * 14}px 0` }}>
      <Drop text="Sin pausa." start={0} size={150} color="#FFFFFF" y={CY} stagger={0.4} />
    </AbsoluteFill>
  );
};

const Rings: React.FC = () => {
  const f = useCurrentFrame();
  const g = 70 + 12 * beatPulse(f, 3);
  return <AbsoluteFill style={{ background: `repeating-radial-gradient(circle at 50% 50%, ${CYAN} 0 ${g / 2}px, ${NIGHT} ${g / 2}px ${g}px)`, scale: String(1 + f * 0.01) }} />;
};

const Halftone: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: VIOLET }}>
      {Array.from({ length: 12 * 22 }).map((_, i) => {
        const c = i % 12;
        const r = Math.floor(i / 12);
        const x = c * 90 + 45;
        const y = r * 90 + 15;
        const d = Math.hypot(x - CX, y - CY);
        const s = 10 + 28 * (0.5 + 0.5 * Math.sin(d * 0.03 - f * 0.9));
        return <div key={i} style={{ position: "absolute", left: x - s / 2, top: y - s / 2, width: s, height: s, borderRadius: 99, background: "rgba(255,255,255,0.85)" }} />;
      })}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ redoble y final

const ROLL: [number, string][] = [
  [38, VIOLET],
  [38.5, "#FFFFFF"],
  [39, CYAN],
  [39.25, NIGHT],
  [39.5, VIOLET],
  [39.75, "#FFFFFF"],
];

const Finale: React.FC = () => {
  const f = useCurrentFrame();
  const letters = LOGO_PATHS;
  const lw = 880;
  const scale = lw / LOGO_VIEWBOX.w;
  const lh = LOGO_VIEWBOX.h * scale;
  const line = interpolate(f, [b(1), b(1.75)], [0, 1], { ...CLAMP, easing: EASE_OUT });
  const fade = interpolate(f, [b(6), b(7)], [1, 0], CLAMP);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, #1A0F3D 0%, ${NIGHT} 70%)`, opacity: fade }}>
      <svg width={lw} height={lh} viewBox={`${LOGO_VIEWBOX.x} ${LOGO_VIEWBOX.y} ${LOGO_VIEWBOX.w} ${LOGO_VIEWBOX.h}`} style={{ position: "absolute", left: CX - lw / 2, top: CY - 200 - lh / 2, overflow: "visible" }}>
        {letters.map((p, i) => {
          const s = spring({ frame: f - i * 2, fps: 24, config: { damping: 10, mass: 0.6, stiffness: 140 } });
          const [x0, y0, x1, y1] = p.box;
          const cx = (x0 + x1) / 2;
          const cy = (y0 + y1) / 2;
          const dy = (1 - s) * -2600;
          const rot = (1 - s) * (rng(i, 5) - 0.5) * 60;
          return (
            <g key={p.id} transform={`translate(0 ${dy}) rotate(${rot} ${cx} ${cy})`} opacity={f >= i * 2 ? 1 : 0}>
              <path d={p.d} fill="#FFFFFF" />
            </g>
          );
        })}
      </svg>
      <div style={{ position: "absolute", left: CX - 440 * line, top: CY - 200 + lh / 2 + 40, width: 880 * line, height: 4, borderRadius: 4, background: VIOLET, boxShadow: `0 0 16px ${VIOLET}` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: CY - 60 + lh / 2, textAlign: "center", fontFamily: BODY, fontWeight: 500, fontStyle: "italic", fontSize: 50, color: "#FFFFFF", opacity: enter01(f, b(1.5), 10) }}>
        Un mensaje entra.
        <br />
        La operación continúa.
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: CY + 150 + lh / 2, textAlign: "center", fontFamily: BODY, fontWeight: 600, fontSize: 34, letterSpacing: "0.04em", color: "rgba(255,255,255,0.85)", opacity: enter01(f, b(2.5), 10) }}>
        airisautomation.com
      </div>
      <Hud />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ montaje

const SLAMS: { k: number; word: string; bg: string; fg: string; sub?: string }[] = [
  { k: 8, word: "Responde.", bg: VIOLET, fg: "#FFFFFF" },
  { k: 9, word: "Agenda.", bg: "#FFFFFF", fg: NIGHT },
  { k: 10, word: "Cobra.", bg: CYAN, fg: NIGHT },
  { k: 11, word: "Avisa.", bg: NIGHT, fg: "#FFFFFF" },
  { k: 12, word: "Sigue.", bg: VIOLET, fg: "#FFFFFF" },
  { k: 13, word: "Ordena.", bg: "#FFFFFF", fg: NIGHT },
  { k: 14, word: "Resuelve.", bg: NIGHT, fg: "#FFFFFF", sub: "mientras vos trabajás." },
];

const Blur: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <CameraMotionBlur samples={6} shutterAngle={200}>
    {children}
  </CameraMotionBlur>
);

export const V12Showreel: React.FC = () => {
  const f = useCurrentFrame();
  const flash = [4, 8, 16, 20, 24, 28, 32, 36, 40].some((k) => f >= b(k) && f < b(k) + 2);
  return (
    <AbsoluteFill style={{ background: NIGHT }}>
      <Sequence from={0} durationInFrames={b(4)}>
        <Intro />
      </Sequence>
      <Sequence from={b(4)} durationInFrames={b(5) - b(4)}>
        <Count n="3" bg={VIOLET} fg="#FFFFFF" />
      </Sequence>
      <Sequence from={b(5)} durationInFrames={b(6) - b(5)}>
        <Count n="2" bg="#FFFFFF" fg={NIGHT} />
      </Sequence>
      <Sequence from={b(6)} durationInFrames={b(7) - b(6)}>
        <Count n="1" bg={NIGHT} fg="#FFFFFF" />
      </Sequence>
      <Sequence from={b(7)} durationInFrames={b(8) - b(7)}>
        <AbsoluteFill style={{ background: NIGHT }}>
          <Drop text="AIRIS" start={0} size={220} color="#FFFFFF" y={CY} stagger={0.5} />
        </AbsoluteFill>
      </Sequence>
      {SLAMS.map((s, i) => (
        <Sequence key={s.word} from={b(s.k)} durationInFrames={(i === SLAMS.length - 1 ? b(16) : b(s.k + 1)) - b(s.k)}>
          <Blur>
            <Slam word={s.word} bg={s.bg} fg={s.fg} sub={s.sub} />
          </Blur>
        </Sequence>
      ))}
      <Sequence from={b(16)} durationInFrames={b(20) - b(16)}>
        <GridScene />
      </Sequence>
      <Sequence from={b(20)} durationInFrames={b(28) - b(20)}>
        <Particles />
      </Sequence>
      <Sequence from={b(28)} durationInFrames={b(32) - b(28)}>
        <Depth />
      </Sequence>
      <Sequence from={b(32)} durationInFrames={b(36) - b(32)}>
        <Dash />
      </Sequence>
      <Sequence from={b(36)} durationInFrames={b(37) - b(36)}>
        <Blur>
          <Stripes />
        </Blur>
      </Sequence>
      <Sequence from={b(37)} durationInFrames={b(38) - b(37)}>
        <Rings />
      </Sequence>
      {ROLL.map(([k, bg], i) => (
        <Sequence key={k} from={b(k)} durationInFrames={(i === ROLL.length - 1 ? b(40) : b(ROLL[i + 1][0])) - b(k)}>
          {i === 2 ? <Halftone /> : <AbsoluteFill style={{ background: bg }} />}
        </Sequence>
      ))}
      <Sequence from={b(40)} durationInFrames={V12_DURATION - b(40)}>
        <Blur>
          <Finale />
        </Blur>
      </Sequence>
      {flash ? <AbsoluteFill style={{ background: "#FFFFFF", mixBlendMode: "soft-light", opacity: 0.35 }} /> : null}
      <Grain opacity={0.06} />
    </AbsoluteFill>
  );
};
