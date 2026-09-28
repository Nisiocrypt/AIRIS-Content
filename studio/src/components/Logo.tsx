import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { LOGO_PATHS, LOGO_VIEWBOX } from "../brand/logoPaths";
import { CLAMP, enter } from "../lib/anim";
import { EASE_OUT } from "../brand/tokens";

/**
 * Logo oficial de AIRIS dibujado letra por letra: cada letra se revela de izquierda a
 * derecha con una máscara, en cascada.
 */
export const Logo: React.FC<{
  width: number;
  start?: number;
  color?: string;
  stagger?: number;
  glow?: boolean;
  style?: React.CSSProperties;
}> = ({ width, start = 0, color = "#FFFFFF", stagger = 4, glow = true, style }) => {
  const frame = useCurrentFrame();
  const vb = LOGO_VIEWBOX;
  const pad = 40;
  const height = (width * (vb.h + pad * 2)) / (vb.w + pad * 2);
  return (
    <svg
      width={width}
      height={height}
      viewBox={`${vb.x - pad} ${vb.y - pad} ${vb.w + pad * 2} ${vb.h + pad * 2}`}
      style={{ overflow: "visible", filter: glow ? "drop-shadow(0 0 18px rgba(167,139,250,0.55))" : undefined, ...style }}
    >
      <defs>
        {LOGO_PATHS.map((p, i) => {
          const t = interpolate(frame, [start + i * stagger, start + i * stagger + 16], [0, 1], {
            ...CLAMP,
            easing: EASE_OUT,
          });
          const [x0, y0, x1, y1] = p.box;
          return (
            <clipPath id={`logo-clip-${p.id}-${start}`} key={p.id}>
              <rect x={x0 - 10} y={y0 - 10} width={(x1 - x0 + 20) * t} height={y1 - y0 + 20} />
            </clipPath>
          );
        })}
      </defs>
      {LOGO_PATHS.map((p, i) => {
        const o = enter(frame, start + i * stagger, 10);
        return (
          <path
            key={p.id}
            d={p.d}
            fill={color}
            opacity={o}
            clipPath={`url(#logo-clip-${p.id}-${start})`}
          />
        );
      })}
    </svg>
  );
};

/** La "A" del logo (Λ) dentro de un círculo: avatar de AIRIS en chats y llamadas. */
export const LambdaAvatar: React.FC<{ size?: number; tone?: "violet" | "white" }> = ({ size = 56, tone = "violet" }) => {
  const a = LOGO_PATHS[0];
  const [x0, y0, x1, y1] = a.box;
  const w = x1 - x0;
  const h = y1 - y0;
  const pad = w * 0.42;
  const bg =
    tone === "violet"
      ? "radial-gradient(circle at 30% 25%, #A78BFA 0%, #7C3AED 55%, #4C1D95 100%)"
      : "radial-gradient(circle at 30% 25%, #FFFFFF 0%, #EDE9FE 100%)";
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
        boxShadow: tone === "violet" ? "0 6px 18px rgba(76,29,149,0.45), inset 0 1px 0 rgba(255,255,255,0.35)" : "0 6px 18px rgba(0,0,0,0.15)",
        flexShrink: 0,
      }}
    >
      <svg width={size * 0.62} height={size * 0.62} viewBox={`${x0 - pad} ${y0 - pad * 0.9} ${w + pad * 2} ${h + pad * 1.8}`}>
        <path d={a.d} fill={tone === "violet" ? "#FFFFFF" : "#5B21B6"} />
      </svg>
    </div>
  );
};
