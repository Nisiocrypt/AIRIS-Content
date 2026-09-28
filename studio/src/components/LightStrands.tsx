import React, { useEffect, useRef } from "react";
import { useCurrentFrame } from "remotion";
import { HEIGHT, WIDTH } from "../brand/tokens";

type Palette = "brand" | "grey" | "cool";

const STOPS: Record<Palette, [string, string, string]> = {
  brand: ["#3B6BFF", "#8B5CF6", "#E879F9"],
  cool: ["#38BDF8", "#818CF8", "#C084FC"],
  grey: ["#6B7280", "#9CA3AF", "#6B7280"],
};

export type LightStrandsProps = {
  width?: number;
  height?: number;
  /** Cantidad de hebras. */
  count?: number;
  /** Ángulo de la cinta en grados (negativo = sube hacia la derecha). */
  angle?: number;
  /** Centro de la cinta, en fracción de la altura. */
  centerY?: number;
  /** Energía 0..2: amplitud y brillo (sirve para que la voz "mueva" las hebras). */
  energy?: number;
  /** Separación de la cinta en px. */
  spread?: number;
  /** Velocidad de fase. */
  speed?: number;
  /** 0..1: qué porción de la cinta está dibujada (para barridos de transición). */
  reveal?: number;
  opacity?: number;
  thickness?: number;
  palette?: Palette;
  seed?: number;
  /** Frame a usar en lugar del actual (para congelar o desfasar). */
  frameOverride?: number;
  /** Multiplica la amplitud de la onda (útil en canvases chicos). */
  ampScale?: number;
  style?: React.CSSProperties;
};

/**
 * Hebras de luz de la marca (inspiradas en el hero de airisautomation.com): una cinta de
 * líneas finas que se tuerce y se cruza, con brillo aditivo. Dibujada en canvas y 100%
 * determinística por frame.
 */
export const LightStrands: React.FC<LightStrandsProps> = ({
  width = WIDTH,
  height = HEIGHT,
  count = 64,
  angle = -24,
  centerY = 0.5,
  energy = 1,
  spread = 260,
  speed = 1,
  reveal = 1,
  opacity = 1,
  thickness = 1,
  palette = "brand",
  seed = 0,
  frameOverride,
  ampScale = 1,
  style,
}) => {
  const current = useCurrentFrame();
  const frame = frameOverride ?? current;
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    if (opacity <= 0.001 || reveal <= 0.001) return;

    const t = (frame / 30) * speed + seed * 10;
    const L = Math.hypot(width, height) * 1.25;
    const e = Math.max(0, energy);

    ctx.save();
    ctx.translate(width / 2, height * centerY);
    ctx.rotate((angle * Math.PI) / 180);
    ctx.globalCompositeOperation = "lighter";

    const [c0, c1, c2] = STOPS[palette];
    const grad = ctx.createLinearGradient(-L / 2, 0, L / 2, 0);
    grad.addColorStop(0, c0);
    grad.addColorStop(0.5, c1);
    grad.addColorStop(1, c2);
    ctx.strokeStyle = grad;
    ctx.lineCap = "round";

    const xEnd = -L / 2 + L * Math.min(1, reveal * 1.02);
    const step = 18;
    const amp = (70 + 60 * e) * (height / 1920) * ampScale;
    const sp = spread * (0.75 + 0.35 * e);

    const pass = (lineWidth: number, alpha: number) => {
      for (let i = 0; i < count; i++) {
        const u = i / (count - 1) - 0.5;
        const centerBoost = 1 - Math.abs(u) * 1.4;
        ctx.globalAlpha = Math.max(0, alpha * (0.35 + 0.65 * centerBoost) * opacity * (0.6 + 0.4 * Math.min(e, 1.5)));
        ctx.lineWidth = lineWidth * thickness * (0.7 + 0.5 * centerBoost);
        ctx.beginPath();
        let first = true;
        for (let x = -L / 2; x <= xEnd; x += step) {
          const twist = Math.cos(x * 0.0033 + t * 0.9 + seed);
          const y =
            amp * Math.sin(x * 0.0021 + t * 0.7 + u * 0.5) +
            amp * 0.45 * Math.sin(x * 0.0009 - t * 0.35 + seed * 2) +
            u * sp * twist +
            u * u * 40 * Math.sin(x * 0.006 + t);
          if (first) {
            ctx.moveTo(x, y);
            first = false;
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }
    };

    pass(9, 0.035);
    pass(3.2, 0.09);
    pass(1.15, 0.5);

    // Cabeza brillante del barrido, cuando la cinta se está dibujando.
    if (reveal < 1) {
      const g = ctx.createRadialGradient(xEnd, 0, 0, xEnd, 0, 220);
      g.addColorStop(0, "rgba(255,255,255,0.55)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.globalAlpha = opacity;
      ctx.fillStyle = g;
      ctx.fillRect(xEnd - 220, -220, 440, 440);
    }
    ctx.restore();
  }, [frame, width, height, count, angle, centerY, energy, spread, speed, reveal, opacity, thickness, palette, seed, ampScale]);

  return (
    <canvas
      ref={ref}
      width={width}
      height={height}
      style={{ position: "absolute", left: 0, top: 0, width, height, pointerEvents: "none", ...style }}
    />
  );
};
