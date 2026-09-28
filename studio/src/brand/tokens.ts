import { Easing } from "remotion";

// Tokens extraídos de airisautomation.com (ver docs/research/analisis-web-airisautomation.md).
export const COLORS = {
  violet: "#7C3AED",
  violetDeep: "#5B21B6",
  violetDarker: "#4C1D95",
  lavender: "#A78BFA",
  lavenderSoft: "#DDD6FE",
  lavenderMist: "#EDE9FE",
  cyan: "#67E8F9",
  cyanSoft: "#CFFAFE",
  cyanDeep: "#083344",
  night: "#020618",
  night2: "#0A0C1C",
  plum: "#171223",
  paper: "#F8FAFC",
  paperViolet: "#EEF2FF",
  ink: "#171223",
  inkSoft: "#4A4458",
  white: "#FFFFFF",
  whatsapp: "#25D366",
  grey: "#8A8F98",
} as const;

export const FONTS = {
  display: "Unbounded",
  body: "Poppins",
} as const;

// Una sola familia de curvas en todo el video (skill airis-motion-graphics).
export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN = Easing.bezier(0.7, 0, 0.84, 0);
export const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

// Zona segura 9:16: texto entre y=190 y y=1570, 90 px de margen lateral.
export const SAFE = { top: 190, bottom: 1570, side: 90 } as const;

export const sec = (s: number) => Math.round(s * FPS);
