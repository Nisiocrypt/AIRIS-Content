import React, { useMemo } from "react";
import { useCurrentFrame } from "remotion";
import { fitText } from "@remotion/layout-utils";
import { COLORS, FONTS, SAFE, WIDTH } from "../brand/tokens";
import { enter, leave } from "../lib/anim";
import { useFontsReady } from "../lib/useFontsReady";

export type HeadlineLine = string | { text: string; italic?: boolean };

const norm = (l: HeadlineLine) => (typeof l === "string" ? { text: l, italic: false } : { italic: false, ...l });

type HeadlineProps = {
  lines: HeadlineLine[];
  /** Frame (relativo a la secuencia) en que empieza la entrada. */
  start?: number;
  /** Frame en que empieza la salida. Sin valor, el titular queda en pantalla. */
  exitAt?: number;
  /** Tamaño máximo; se achica solo si una línea no entra en el ancho. */
  size?: number;
  color?: string;
  weight?: number;
  /** Centro vertical del bloque, en px. */
  y?: number;
  maxWidth?: number;
  stagger?: number;
  lineHeight?: number;
  /** Duración de la entrada de cada línea. */
  inDur?: number;
  style?: React.CSSProperties;
};

/**
 * Titular de marca: Unbounded, centrado, un solo color. Cada línea entra desde detrás de una
 * máscara (sube, gana opacidad y pierde blur) y sale hacia arriba, más rápido.
 */
export const Headline: React.FC<HeadlineProps> = ({
  lines,
  start = 0,
  exitAt,
  size = 104,
  color = COLORS.white,
  weight = 800,
  y = 960,
  maxWidth = WIDTH - SAFE.side * 2,
  stagger = 4,
  lineHeight = 1.08,
  inDur = 22,
  style,
}) => {
  const frame = useCurrentFrame();
  const ready = useFontsReady();
  const items = lines.map(norm);

  const fontSize = useMemo(() => {
    if (!ready) return 0;
    let s = size;
    for (const l of items) {
      try {
        const fit = fitText({
          text: l.text,
          withinWidth: maxWidth * (l.italic ? 0.96 : 1),
          fontFamily: FONTS.display,
          fontWeight: weight,
          letterSpacing: "-0.015em",
          validateFontIsLoaded: true,
        }).fontSize;
        s = Math.min(s, fit);
      } catch {
        // Si la fuente todavía no está, usamos el tamaño pedido.
      }
    }
    return Math.floor(s);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, size, maxWidth, weight, JSON.stringify(items)]);

  if (!ready || fontSize === 0) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: y,
        transform: "translateY(-50%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        ...style,
      }}
    >
      {items.map((l, i) => {
        const p = enter(frame, start + i * stagger, inDur);
        const q = leave(frame, exitAt === undefined ? undefined : exitAt + i * 2, 12);
        const offset = (1 - p) * 105 + (1 - q) * -105;
        return (
          <div key={i} style={{ overflow: "hidden", padding: "0.16em 0.12em", margin: "-0.16em 0" }}>
            <div
              style={{
                fontFamily: FONTS.display,
                fontWeight: weight,
                fontStyle: l.italic ? "italic" : "normal",
                fontSize,
                lineHeight,
                letterSpacing: "-0.015em",
                color,
                whiteSpace: "nowrap",
                translate: `0 ${offset}%`,
                opacity: Math.min(p * 1.6, 1) * q,
                filter: `blur(${(1 - p) * 8 + (1 - q) * 4}px)`,
              }}
            >
              {l.text}
            </div>
          </div>
        );
      })}
    </div>
  );
};

type BodyProps = {
  text: string;
  start?: number;
  exitAt?: number;
  y: number;
  size?: number;
  color?: string;
  weight?: number;
  opacity?: number;
  italic?: boolean;
  maxWidth?: number;
};

/** Texto de apoyo en Poppins, centrado, con entrada suave. */
export const Body: React.FC<BodyProps> = ({
  text,
  start = 0,
  exitAt,
  y,
  size = 38,
  color = COLORS.white,
  weight = 500,
  opacity = 0.78,
  italic = false,
  maxWidth = 860,
}) => {
  const frame = useCurrentFrame();
  const p = enter(frame, start, 18);
  const q = leave(frame, exitAt, 10);
  return (
    <div
      style={{
        position: "absolute",
        left: (WIDTH - maxWidth) / 2,
        width: maxWidth,
        top: y,
        transform: "translateY(-50%)",
        textAlign: "center",
        fontFamily: FONTS.body,
        fontWeight: weight,
        fontStyle: italic ? "italic" : "normal",
        fontSize: size,
        lineHeight: 1.32,
        color,
        opacity: opacity * p * q,
        translate: `0 ${(1 - p) * 18}px`,
      }}
    >
      {text}
    </div>
  );
};

/** Línea chica al pie (aclaraciones honestas). Nunca va arriba de un título. */
export const Footnote: React.FC<{ text: string; start?: number; color?: string; y?: number }> = ({
  text,
  start = 0,
  color = COLORS.white,
  y = 1528,
}) => {
  const frame = useCurrentFrame();
  const p = enter(frame, start, 16);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: y,
        textAlign: "center",
        fontFamily: FONTS.body,
        fontWeight: 400,
        fontSize: 24,
        letterSpacing: "0.01em",
        color,
        opacity: 0.5 * p,
      }}
    >
      {text}
    </div>
  );
};
