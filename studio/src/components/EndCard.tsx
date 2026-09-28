import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { COLORS, EASE_OUT, FONTS } from "../brand/tokens";
import { CLAMP, enter } from "../lib/anim";
import { Glass } from "./Glass";
import { Logo } from "./Logo";
import { Footnote, Headline, HeadlineLine } from "./Text";

/** Rayos radiales suaves centrados en (cx, cy). */
const Rays: React.FC<{ start: number; cx: number; cy: number; size?: number; color?: string; opacity?: number }> = ({
  start,
  cx,
  cy,
  size = 1500,
  color = "255,255,255",
  opacity = 0.14,
}) => {
  const frame = useCurrentFrame();
  const p = enter(frame, start, 40);
  const rot = (frame - start) * 0.06;
  const n = 40;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`${-size / 2} ${-size / 2} ${size} ${size}`}
      style={{ position: "absolute", left: cx - size / 2, top: cy - size / 2, rotate: `${rot}deg`, opacity: p * opacity, pointerEvents: "none" }}
    >
      <defs>
        <radialGradient id={`rays-${start}`} cx="0" cy="0" r={size / 2} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={`rgb(${color})`} stopOpacity={0} />
          <stop offset="0.16" stopColor={`rgb(${color})`} stopOpacity={0.9} />
          <stop offset="1" stopColor={`rgb(${color})`} stopOpacity={0} />
        </radialGradient>
      </defs>
      {Array.from({ length: n }).map((_, i) => {
        const ang = (i / n) * Math.PI * 2;
        const r = (size / 2) * (0.5 + 0.5 * p);
        return (
          <line
            key={i}
            x1={0}
            y1={0}
            x2={Math.cos(ang) * r}
            y2={Math.sin(ang) * r}
            stroke={`url(#rays-${start})`}
            strokeWidth={i % 4 === 0 ? 2.4 : 1.2}
          />
        );
      })}
    </svg>
  );
};

export type EndTheme = "dark" | "light" | "violet";

/**
 * Cierre de marca: logo que se dibuja, una línea, el llamado a la acción y la web.
 */
export const EndCard: React.FC<{
  theme?: EndTheme;
  tagline?: HeadlineLine[];
  cta?: string;
  url?: string;
  footnote?: string;
  start?: number;
  logoY?: number;
  compact?: boolean;
}> = ({ theme = "dark", tagline, cta, url = "airisautomation.com", footnote, start = 0, logoY = 660, compact = false }) => {
  const frame = useCurrentFrame();
  const main = theme === "light" ? COLORS.ink : COLORS.white;
  const soft = theme === "light" ? "rgba(23,18,35,0.62)" : "rgba(255,255,255,0.72)";
  const taglineY = logoY + (compact ? 250 : 270);
  const ctaY = tagline ? taglineY + 250 : logoY + 250;
  const pc = interpolate(frame, [start + 22, start + 40], [0, 1], { ...CLAMP, easing: EASE_OUT });
  const pu = enter(frame, start + 30, 16);
  return (
    <>
      {theme !== "light" ? <Rays start={start} cx={540} cy={logoY} opacity={theme === "violet" ? 0.2 : 0.14} /> : null}
      <div style={{ position: "absolute", left: 0, right: 0, top: logoY, transform: "translateY(-50%)", display: "flex", justifyContent: "center" }}>
        <Logo width={compact ? 520 : 600} start={start} color={main} glow={theme !== "light"} />
      </div>
      {tagline ? <Headline lines={tagline} start={start + 12} y={taglineY} size={66} color={main} weight={700} stagger={5} /> : null}
      {cta ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: ctaY,
            transform: "translateY(-50%)",
            display: "flex",
            justifyContent: "center",
            opacity: pc,
            translate: `0 ${(1 - pc) * 24}px`,
          }}
        >
          <Glass
            variant={theme === "light" ? "light" : theme === "violet" ? "clear" : "violet"}
            radius={999}
            style={{ padding: "26px 52px", fontFamily: FONTS.body, fontWeight: 600, fontSize: 34, color: main, whiteSpace: "nowrap" }}
          >
            {cta}
          </Glass>
        </div>
      ) : null}
      {url ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: (cta ? ctaY + 100 : ctaY) + (cta ? 0 : 0),
            transform: "translateY(-50%)",
            textAlign: "center",
            fontFamily: FONTS.body,
            fontWeight: 500,
            fontSize: cta ? 32 : 40,
            letterSpacing: "0.02em",
            color: soft,
            opacity: pu,
          }}
        >
          {url}
        </div>
      ) : null}
      {footnote ? <Footnote text={footnote} start={start + 30} color={main} /> : null}
    </>
  );
};
