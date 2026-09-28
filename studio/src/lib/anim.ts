import { interpolate } from "remotion";
import { noise2D } from "@remotion/noise";
import { EASE_IN, EASE_IN_OUT, EASE_OUT } from "../brand/tokens";

export const CLAMP = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

/** 0 → 1 entre `start` y `start + dur`, con la curva de entrada de la marca. */
export const enter = (frame: number, start: number, dur = 18) =>
  interpolate(frame, [start, start + dur], [0, 1], { ...CLAMP, easing: EASE_OUT });

/** 1 → 0 entre `start` y `start + dur`, con la curva de salida (más corta que la entrada). */
export const leave = (frame: number, start: number | undefined, dur = 12) =>
  start === undefined
    ? 1
    : interpolate(frame, [start, start + dur], [1, 0], { ...CLAMP, easing: EASE_IN });

/** 0 → 1 con curva simétrica, para movimientos de cámara y morphs. */
export const travel = (frame: number, start: number, dur: number) =>
  interpolate(frame, [start, start + dur], [0, 1], { ...CLAMP, easing: EASE_IN_OUT });

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Ruido suave y determinístico, en el rango -1..1. */
export const drift = (seed: string, frame: number, speed = 0.01) =>
  noise2D(seed, frame * speed, 0);

/**
 * Energía de una voz sintética: pulsos de sílabas dentro de los intervalos en que alguien
 * habla. Sirve para animar las hebras cuando no hay audio real de voz.
 */
export const speechEnergy = (
  frame: number,
  intervals: [number, number][],
  seed = "voz",
) => {
  for (const [a, b] of intervals) {
    if (frame >= a && frame <= b) {
      const edge = Math.min(1, (frame - a) / 6, (b - frame) / 6);
      const syllables = 0.55 + 0.45 * Math.abs(Math.sin(frame * 0.62 + noise2D(seed, frame * 0.05, 1) * 2));
      const phrase = 0.75 + 0.25 * noise2D(seed, frame * 0.02, 2);
      return Math.max(0, edge) * syllables * phrase;
    }
  }
  return 0;
};

/** Suaviza una función de energía promediando los últimos `n` frames. */
export const smoothed = (fn: (f: number) => number, frame: number, n = 4) => {
  let acc = 0;
  for (let i = 0; i < n; i++) acc += fn(frame - i);
  return acc / n;
};
