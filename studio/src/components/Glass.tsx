import React from "react";

export type GlassVariant = "dark" | "light" | "grey" | "violet" | "clear";

const VARIANTS: Record<GlassVariant, React.CSSProperties> = {
  dark: {
    background: "linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.035) 100%), rgba(12,12,32,0.55)",
    backdropFilter: "blur(24px) saturate(1.6)",
    border: "1px solid rgba(255,255,255,0.12)",
    boxShadow: "0 34px 90px rgba(10,5,35,0.45), inset 0 1px 0 rgba(255,255,255,0.14)",
  },
  light: {
    background: "linear-gradient(180deg, rgba(255,255,255,0.62) 0%, rgba(255,255,255,0.38) 100%)",
    backdropFilter: "blur(40px) saturate(2)",
    border: "1px solid rgba(255,255,255,0.7)",
    boxShadow: "0 24px 80px -20px rgba(139,92,246,0.30), inset 0 0 0 1px rgba(255,255,255,0.5)",
  },
  grey: {
    background: "rgba(255,255,255,0.06)",
    backdropFilter: "blur(18px)",
    border: "1px solid rgba(255,255,255,0.09)",
    boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
  },
  violet: {
    background: "linear-gradient(180deg, rgba(167,139,250,0.30) 0%, rgba(124,58,237,0.22) 100%)",
    backdropFilter: "blur(30px) saturate(1.8)",
    border: "1px solid rgba(221,214,254,0.28)",
    boxShadow: "0 30px 80px rgba(46,16,101,0.45), inset 0 1px 0 rgba(255,255,255,0.22)",
  },
  clear: {
    background: "rgba(255,255,255,0.12)",
    backdropFilter: "blur(30px) saturate(1.8)",
    border: "1px solid rgba(255,255,255,0.22)",
    boxShadow: "0 24px 70px rgba(30,10,70,0.30), inset 0 1px 0 rgba(255,255,255,0.25)",
  },
};

export const Glass: React.FC<{
  variant?: GlassVariant;
  radius?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({ variant = "dark", radius = 32, style, children }) => (
  <div style={{ borderRadius: radius, ...VARIANTS[variant], ...style }}>{children}</div>
);

/** Colores de texto según el fondo de la escena. */
export const ink = (theme: "dark" | "light") =>
  theme === "dark"
    ? { main: "#FFFFFF", soft: "rgba(255,255,255,0.72)", faint: "rgba(255,255,255,0.5)" }
    : { main: "#171223", soft: "rgba(23,18,35,0.68)", faint: "rgba(23,18,35,0.45)" };
