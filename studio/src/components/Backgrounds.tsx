import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { COLORS } from "../brand/tokens";
import { drift, lerp } from "../lib/anim";

/** Noche azul casi negra con glow violeta que respira. */
export const NightBackground: React.FC<{
  glowX?: number;
  glowY?: number;
  intensity?: number;
  hue?: "violet" | "deep";
}> = ({ glowX = 0.5, glowY = 0.34, intensity = 1, hue = "violet" }) => {
  const frame = useCurrentFrame();
  const dx = drift("nx", frame, 0.006) * 0.04;
  const dy = drift("ny", frame, 0.006) * 0.03;
  const breathe = 0.9 + 0.1 * Math.sin(frame / 45);
  const c = hue === "violet" ? "91,33,182" : "76,29,149";
  return (
    <AbsoluteFill style={{ background: COLORS.night }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 70% 42% at ${(glowX + dx) * 100}% ${(glowY + dy) * 100}%, rgba(${c},${0.55 * intensity * breathe}) 0%, rgba(${c},${0.18 * intensity}) 45%, rgba(2,6,24,0) 75%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 60% 30% at 50% 108%, rgba(56,189,248,${0.10 * intensity}) 0%, rgba(2,6,24,0) 70%)`,
        }}
      />
    </AbsoluteFill>
  );
};

/** Degradé pastel tipo wallpaper de iOS: lavanda, cian y violeta muy difusos. */
export const PastelBackground: React.FC<{ tint?: number }> = ({ tint = 1 }) => {
  const frame = useCurrentFrame();
  const a = drift("pa", frame, 0.004);
  const b = drift("pb", frame, 0.004);
  return (
    <AbsoluteFill style={{ background: COLORS.paper, overflow: "hidden" }}>
      <Blob x={0.18 + a * 0.05} y={0.2 + b * 0.04} size={900} color={`rgba(196,181,253,${0.75 * tint})`} />
      <Blob x={0.86 - b * 0.05} y={0.42 + a * 0.05} size={820} color={`rgba(165,243,252,${0.7 * tint})`} />
      <Blob x={0.35 + b * 0.04} y={0.86 - a * 0.04} size={980} color={`rgba(221,214,254,${0.85 * tint})`} />
      <Blob x={0.8 + a * 0.03} y={0.95} size={700} color={`rgba(167,139,250,${0.35 * tint})`} />
    </AbsoluteFill>
  );
};

const Blob: React.FC<{ x: number; y: number; size: number; color: string }> = ({ x, y, size, color }) => (
  <div
    style={{
      position: "absolute",
      left: x * 1080 - size / 2,
      top: y * 1920 - size / 2,
      width: size,
      height: size,
      borderRadius: size,
      background: `radial-gradient(circle, ${color} 0%, rgba(255,255,255,0) 68%)`,
    }}
  />
);

/** Violeta de marca saturado (como el bloque final del sitio). */
export const VioletBackground: React.FC<{ depth?: number }> = ({ depth = 1 }) => {
  const frame = useCurrentFrame();
  const d = drift("vd", frame, 0.005);
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 90% 60% at ${50 + d * 8}% 30%, #8B4CF6 0%, ${COLORS.violet} 35%, ${COLORS.violetDeep} 70%, #2E1065 ${100 - 10 * depth}%)`,
      }}
    />
  );
};

/** Gris apagado para "la forma vieja" (contestador, chatbot). */
export const GreyBackground: React.FC = () => (
  <AbsoluteFill
    style={{
      background: "radial-gradient(ellipse 80% 55% at 50% 38%, #3A3D45 0%, #22242A 55%, #16171B 100%)",
    }}
  />
);

/**
 * Ciclo del día para la línea de tiempo: 0 = mañana pastel, 0.55 = mediodía,
 * 0.8 = atardecer violeta, 1 = noche.
 */
export const DayCycleBackground: React.FC<{ t: number }> = ({ t }) => {
  const night = Math.max(0, Math.min(1, (t - 0.62) / 0.3));
  const dusk = Math.max(0, 1 - Math.abs(t - 0.74) / 0.16);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: 1 - night }}>
        <PastelBackground tint={lerp(1, 0.6, dusk)} />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          opacity: dusk * 0.85,
          background: "linear-gradient(180deg, #3B0F8C 0%, #6D28D9 38%, #A855F7 72%, #E9D5FF 100%)",
        }}
      />
      <AbsoluteFill style={{ opacity: night }}>
        <NightBackground intensity={0.9} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Grano fino animado (texturas pre-generadas) para unificar el acabado. */
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.07 }) => {
  const frame = useCurrentFrame();
  const idx = frame % 6;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "overlay", opacity }}>
      <Img src={staticFile(`textures/grain_${idx}.jpg`)} style={{ width: "100%", height: "100%" }} />
    </AbsoluteFill>
  );
};

export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.5 }) => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background: `radial-gradient(ellipse 85% 70% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,${strength}) 100%)`,
    }}
  />
);
