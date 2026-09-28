import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { COLORS, EASE_OUT, FONTS } from "../brand/tokens";
import { CLAMP, enter, leave } from "../lib/anim";
import { ink } from "./Glass";
import { LambdaAvatar } from "./Logo";

export type Speaker = "patient" | "airis" | "human" | "bot";
export type Theme = "dark" | "light";

type BubbleProps = {
  from: Speaker;
  text: string;
  label?: string;
  time?: string;
  theme?: Theme;
  start: number;
  exitAt?: number;
  maxWidth?: number;
  fontSize?: number;
  /** Si es true, la burbuja se ve apagada (lado "viejo" de una comparación). */
  muted?: boolean;
  avatar?: boolean;
  /** Centra la burbuja (para planos donde el mensaje es protagonista). */
  center?: boolean;
  /** Fuerza el lado (por defecto: AIRIS a la derecha, el resto a la izquierda). */
  side?: "left" | "right";
};

const bubbleStyle = (from: Speaker, theme: Theme, muted: boolean): React.CSSProperties => {
  if (muted) {
    return {
      background: from === "patient" ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.16)",
      color: "rgba(255,255,255,0.82)",
      border: "1px solid rgba(255,255,255,0.08)",
    };
  }
  if (from === "airis") {
    return {
      background: "linear-gradient(160deg, #8B5CF6 0%, #7C3AED 55%, #6D28D9 100%)",
      color: "#FFFFFF",
      boxShadow: "0 14px 34px rgba(76,29,149,0.40), inset 0 1px 0 rgba(255,255,255,0.25)",
    };
  }
  if (from === "human") {
    return {
      background: theme === "dark" ? "rgba(8,51,68,0.85)" : "rgba(207,250,254,0.9)",
      color: theme === "dark" ? "#FFFFFF" : COLORS.ink,
      border: "1px solid rgba(103,232,249,0.35)",
    };
  }
  return theme === "dark"
    ? {
        background: "rgba(255,255,255,0.11)",
        color: "#FFFFFF",
        border: "1px solid rgba(255,255,255,0.12)",
        backdropFilter: "blur(20px)",
      }
    : {
        background: "rgba(255,255,255,0.86)",
        color: COLORS.ink,
        border: "1px solid rgba(255,255,255,0.9)",
        boxShadow: "0 12px 30px rgba(76,29,149,0.10)",
      };
};

/**
 * Burbuja de conversación. AIRIS siempre a la derecha (violeta); la otra persona a la
 * izquierda. Entra completa (nunca letra por letra).
 */
export const Bubble: React.FC<BubbleProps> = ({
  from,
  text,
  label,
  time,
  theme = "dark",
  start,
  exitAt,
  maxWidth = 760,
  fontSize = 36,
  muted = false,
  avatar = false,
  center = false,
  side,
}) => {
  const frame = useCurrentFrame();
  const p = enter(frame, start, 14);
  const q = leave(frame, exitAt, 10);
  const right = side ? side === "right" : from === "airis";
  const st = bubbleStyle(from, theme, muted);
  const t = ink(theme);
  return (
    <div
      style={{
        display: "flex",
        justifyContent: center ? "center" : right ? "flex-end" : "flex-start",
        alignItems: "flex-end",
        gap: 14,
        width: "100%",
        opacity: p * q,
        translate: `0 ${(1 - p) * 26}px`,
        scale: String(interpolate(p, [0, 1], [0.94, 1])),
        transformOrigin: right ? "right bottom" : "left bottom",
      }}
    >
      {avatar && !right ? <LambdaAvatar size={52} tone="white" /> : null}
      <div
        style={{
          maxWidth,
          padding: `${fontSize * 0.55}px ${fontSize * 0.72}px`,
          borderRadius: 30,
          borderBottomRightRadius: right ? 10 : 30,
          borderBottomLeftRadius: right ? 30 : 10,
          fontFamily: FONTS.body,
          fontWeight: 500,
          fontSize,
          lineHeight: 1.3,
          ...st,
        }}
      >
        {label ? (
          <div style={{ fontSize: fontSize * 0.62, fontWeight: 600, opacity: 0.72, marginBottom: fontSize * 0.18 }}>
            {label}
          </div>
        ) : null}
        {text}
        {time ? (
          <div style={{ fontSize: fontSize * 0.55, opacity: 0.55, textAlign: "right", marginTop: fontSize * 0.2, color: st.color ?? t.soft }}>
            {time}
          </div>
        ) : null}
      </div>
      {avatar && right ? <LambdaAvatar size={52} /> : null}
    </div>
  );
};

/** Tres puntos de "escribiendo". */
export const Typing: React.FC<{ start: number; end: number; theme?: Theme; right?: boolean }> = ({
  start,
  end,
  theme = "dark",
  right = true,
}) => {
  const frame = useCurrentFrame();
  const p = enter(frame, start, 8) * leave(frame, end, 6);
  if (p <= 0) return null;
  return (
    <div style={{ display: "flex", justifyContent: right ? "flex-end" : "flex-start", width: "100%", opacity: p }}>
      <div
        style={{
          display: "flex",
          gap: 10,
          padding: "22px 28px",
          borderRadius: 30,
          background: right ? "rgba(124,58,237,0.85)" : theme === "dark" ? "rgba(255,255,255,0.11)" : "rgba(255,255,255,0.86)",
        }}
      >
        {[0, 1, 2].map((i) => {
          const b = Math.sin((frame - start) / 4 - i * 0.9);
          return (
            <div
              key={i}
              style={{
                width: 14,
                height: 14,
                borderRadius: 14,
                background: right || theme === "dark" ? "#FFFFFF" : COLORS.ink,
                opacity: 0.45 + 0.45 * Math.max(0, b),
                translate: `0 ${-Math.max(0, b) * 6}px`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

/** Encabezado de chat estilo WhatsApp con el avatar de AIRIS. */
export const ChatHeader: React.FC<{ title: string; status?: string; theme?: Theme; start?: number }> = ({
  title,
  status = "en línea",
  theme = "dark",
  start = 0,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [start, start + 14], [0, 1], { ...CLAMP, easing: EASE_OUT });
  const t = ink(theme);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18, opacity: p }}>
      <LambdaAvatar size={60} />
      <div style={{ fontFamily: FONTS.body }}>
        <div style={{ fontWeight: 600, fontSize: 30, color: t.main }}>{title}</div>
        <div style={{ fontWeight: 500, fontSize: 22, color: COLORS.whatsapp }}>● {status}</div>
      </div>
    </div>
  );
};
