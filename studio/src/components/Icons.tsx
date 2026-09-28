import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { CLAMP } from "../lib/anim";
import { EASE_OUT } from "../brand/tokens";

/** Check que se dibuja (trazo animado) dentro de un círculo. */
export const DrawCheck: React.FC<{
  size?: number;
  start?: number;
  bg?: string;
  color?: string;
  dur?: number;
}> = ({ size = 64, start = 0, bg = "#67E8F9", color = "#083344", dur = 14 }) => {
  const frame = useCurrentFrame();
  const pop = interpolate(frame, [start, start + 10], [0.6, 1], { ...CLAMP, easing: EASE_OUT });
  const o = interpolate(frame, [start, start + 6], [0, 1], CLAMP);
  const draw = interpolate(frame, [start + 4, start + 4 + dur], [0, 1], { ...CLAMP, easing: EASE_OUT });
  const len = 30;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size,
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        scale: String(pop),
        opacity: o,
        flexShrink: 0,
        boxShadow: `0 8px 24px ${bg}55`,
      }}
    >
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24">
        <path
          d="M5 12.5 L10 17.5 L19.5 7"
          fill="none"
          stroke={color}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={len}
          strokeDashoffset={len * (1 - draw)}
        />
      </svg>
    </div>
  );
};

/** Círculo con un ícono adentro. */
export const IconDisc: React.FC<{ size?: number; bg: string; children: React.ReactNode; glow?: boolean }> = ({
  size = 64,
  bg,
  children,
  glow = true,
}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size,
      background: bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      boxShadow: glow ? "0 8px 24px rgba(76,29,149,0.35), inset 0 1px 0 rgba(255,255,255,0.3)" : undefined,
    }}
  >
    {children}
  </div>
);
