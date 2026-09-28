import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { getLength, getPointAtLength } from "@remotion/paths";
import { CLAMP, travel } from "../lib/anim";
import { EASE_IN_OUT } from "../brand/tokens";
import { LightStrands } from "./LightStrands";

/**
 * Barrido de hebras de luz: la cinta cruza la pantalla y tapa el corte entre dos escenas.
 * Poner el corte seco en el frame `start + dur / 2`.
 */
export const LightSweep: React.FC<{ start: number; dur?: number; angle?: number; palette?: "brand" | "cool" }> = ({
  start,
  dur = 24,
  angle = -28,
  palette = "brand",
}) => {
  const frame = useCurrentFrame();
  if (frame < start || frame > start + dur + 6) return null;
  const p = interpolate(frame, [start, start + dur], [0, 1], { ...CLAMP, easing: EASE_IN_OUT });
  const fade = interpolate(frame, [start + dur * 0.55, start + dur + 6], [1, 0], CLAMP);
  const flash = Math.max(0, 1 - Math.abs(p - 0.5) / 0.18) * 0.35;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <LightStrands reveal={p * 1.25} energy={1.6} opacity={fade} angle={angle} spread={380} speed={2} palette={palette} />
      <AbsoluteFill style={{ background: "white", opacity: flash, mixBlendMode: "soft-light" }} />
    </AbsoluteFill>
  );
};

/**
 * Máscara con la forma de la "A" del logo (Λ): la escena nueva aparece dentro de un
 * triángulo que crece desde el centro.
 */
export const LambdaWipe: React.FC<{ start: number; dur?: number; cy?: number; children: React.ReactNode }> = ({
  start,
  dur = 20,
  cy = 960,
  children,
}) => {
  const frame = useCurrentFrame();
  const p = travel(frame, start, dur);
  if (p <= 0) return null;
  const s = p * 2600;
  const apexY = cy - s * 1.1;
  const baseY = cy + s * 0.9;
  const clip = p >= 1 ? "none" : `polygon(540px ${apexY}px, ${540 + s}px ${baseY}px, ${540 - s}px ${baseY}px)`;
  return <AbsoluteFill style={{ clipPath: clip }}>{children}</AbsoluteFill>;
};

/**
 * Línea de flujo con un pulso de luz que viaja de A a B.
 */
export const FlowLine: React.FC<{
  from: [number, number];
  to: [number, number];
  start: number;
  dur?: number;
  bend?: number;
  color?: string;
  pulse?: boolean;
  exitAt?: number;
}> = ({ from, to, start, dur = 22, bend = 0, color = "167,139,250", pulse = true, exitAt }) => {
  const frame = useCurrentFrame();
  const [x1, y1] = from;
  const [x2, y2] = to;
  const mx = (x1 + x2) / 2 + bend;
  const my = (y1 + y2) / 2;
  const d = `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
  const len = getLength(d);
  const p = interpolate(frame, [start, start + dur], [0, 1], { ...CLAMP, easing: EASE_IN_OUT });
  const out = exitAt === undefined ? 1 : interpolate(frame, [exitAt, exitAt + 10], [1, 0], CLAMP);
  if (p <= 0) return null;
  const head = getPointAtLength(d, len * p) ?? { x: x2, y: y2 };
  const loopP = ((frame - start - dur) / 40) % 1;
  const loopPt = getPointAtLength(d, len * Math.max(0, loopP)) ?? { x: x2, y: y2 };
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none", opacity: out }}>
      <path d={d} fill="none" stroke={`rgba(${color},0.35)`} strokeWidth={3} strokeDasharray={len} strokeDashoffset={len * (1 - p)} strokeLinecap="round" />
      {pulse ? (
        <>
          <circle cx={head.x} cy={head.y} r={10} fill={`rgba(${color},0.95)`} opacity={p < 1 ? 1 : 0} />
          <circle cx={head.x} cy={head.y} r={26} fill={`rgba(${color},0.25)`} opacity={p < 1 ? 1 : 0} />
          {p >= 1 && frame - start - dur > 0 ? (
            <circle cx={loopPt.x} cy={loopPt.y} r={8} fill={`rgba(${color},0.8)`} />
          ) : null}
        </>
      ) : null}
    </svg>
  );
};
