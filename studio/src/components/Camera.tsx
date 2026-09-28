import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { CLAMP, drift } from "../lib/anim";
import { EASE_IN_OUT } from "../brand/tokens";

type CameraProps = {
  children: React.ReactNode;
  /** Duración del push-in en frames. */
  dur: number;
  start?: number;
  from?: number;
  to?: number;
  /** Deriva lateral en px (0 para cámara fija). */
  sway?: number;
  seed?: string;
  style?: React.CSSProperties;
};

/**
 * Cámara siempre viva: push-in lento y deriva mínima. Usar un Camera por capa con distintos
 * rangos para lograr parallax (fondo 1 → 1.02, contenido 1 → 1.05).
 */
export const Camera: React.FC<CameraProps> = ({
  children,
  dur,
  start = 0,
  from = 1,
  to = 1.04,
  sway = 6,
  seed = "cam",
  style,
}) => {
  const frame = useCurrentFrame();
  const s = interpolate(frame, [start, start + dur], [from, to], { ...CLAMP, easing: EASE_IN_OUT });
  const x = drift(seed + "x", frame, 0.008) * sway;
  const y = drift(seed + "y", frame, 0.008) * sway * 0.7;
  return (
    <AbsoluteFill style={{ scale: String(s), translate: `${x}px ${y}px`, ...style }}>
      {children}
    </AbsoluteFill>
  );
};
