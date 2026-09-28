import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { CalendarCheck, MessageCircle, Phone } from "lucide-react";
import { COLORS, EASE_IN_OUT, EASE_OUT, FONTS } from "../brand/tokens";
import { CLAMP, enter, leave } from "../lib/anim";
import { DayCycleBackground, Grain } from "../components/Backgrounds";
import { Camera } from "../components/Camera";
import { Glass } from "../components/Glass";
import { Headline } from "../components/Text";
import { Center } from "../components/Cards";
import { DrawCheck, IconDisc } from "../components/Icons";
import { EndCard } from "../components/EndCard";
import { LightStrands } from "../components/LightStrands";

export const V4_DURATION = 900;

type Stop = {
  time: string;
  day: number;
  source: "whatsapp" | "call" | "agenda";
  incoming: string;
  resolved: string;
};

const STOPS: Stop[] = [
  { time: "09:12", day: 0.1, source: "whatsapp", incoming: "¿Tienen turno para mañana?", resolved: "Turno ofrecido y reservado" },
  { time: "11:40", day: 0.26, source: "call", incoming: "Llamada entrante", resolved: "Atendida y agendada" },
  { time: "13:05", day: 0.38, source: "whatsapp", incoming: "No llego al turno del jueves.", resolved: "Reprogramado al viernes" },
  { time: "18:30", day: 0.74, source: "agenda", incoming: "Turnos de mañana", resolved: "Recordatorios enviados" },
  { time: "23:47", day: 1, source: "whatsapp", incoming: "¿Aceptan mi obra social?", resolved: "Respondido y anotado" },
];

export const V4 = {
  firstStop: 84,
  stopLen: 126,
  roll: 20,
  card: 18,
  resolve: 64,
  cardOut: 114,
  claim: 718,
  end: 804,
};

export const stopStart = (i: number) => V4.firstStop + i * V4.stopLen;

/** Reloj con dígitos que ruedan de un horario al siguiente. */
const RollingClock: React.FC<{ times: string[]; starts: number[]; roll: number; color: string; size: number }> = ({ times, starts, roll, color, size }) => {
  const frame = useCurrentFrame();
  const digits = (s: string) => s.replace(":", "").split("").map(Number);
  let from = digits("08:00");
  let to = from;
  let t = 1;
  for (let i = 0; i < times.length; i++) {
    if (frame >= starts[i]) {
      from = i === 0 ? digits("08:00") : digits(times[i - 1]);
      to = digits(times[i]);
      t = interpolate(frame, [starts[i], starts[i] + roll], [0, 1], { ...CLAMP, easing: EASE_IN_OUT });
    }
  }
  const h = size * 1.05;
  const col = (a: number, b: number, key: number) => {
    const steps = ((b - a + 10) % 10) + (key < 2 ? 0 : 10);
    const v = a + steps * t;
    const speed = Math.abs(steps) * (t > 0 && t < 1 ? 1 : 0);
    return (
      <div key={key} style={{ height: h, overflow: "hidden", width: size * 0.74, position: "relative" }}>
        <div style={{ translate: `0 ${-(v % 10) * h}px`, filter: `blur(${Math.min(6, speed * 0.25)}px)` }}>
          {Array.from({ length: 11 }).map((_, d) => (
            <div key={d} style={{ height: h, lineHeight: `${h}px`, textAlign: "center" }}>
              {d % 10}
            </div>
          ))}
        </div>
      </div>
    );
  };
  return (
    <div style={{ display: "flex", alignItems: "center", fontFamily: FONTS.display, fontWeight: 800, fontSize: size, color, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>
      {col(from[0], to[0], 0)}
      {col(from[1], to[1], 1)}
      <div style={{ width: size * 0.36, textAlign: "center", marginTop: -size * 0.08 }}>:</div>
      {col(from[2], to[2], 2)}
      {col(from[3], to[3], 3)}
    </div>
  );
};

const SourceIcon: React.FC<{ source: Stop["source"] }> = ({ source }) =>
  source === "whatsapp" ? (
    <IconDisc size={64} bg={COLORS.whatsapp} glow={false}>
      <MessageCircle size={34} color="#FFFFFF" strokeWidth={2.2} />
    </IconDisc>
  ) : source === "call" ? (
    <IconDisc size={64} bg="radial-gradient(circle at 30% 25%, #A78BFA 0%, #7C3AED 60%, #5B21B6 100%)">
      <Phone size={32} color="#FFFFFF" strokeWidth={2.2} />
    </IconDisc>
  ) : (
    <IconDisc size={64} bg="radial-gradient(circle at 30% 25%, #67E8F9 0%, #0891B2 100%)" glow={false}>
      <CalendarCheck size={32} color="#FFFFFF" strokeWidth={2.2} />
    </IconDisc>
  );

const SOURCE_LABEL: Record<Stop["source"], string> = { whatsapp: "WhatsApp", call: "Llamada", agenda: "Agenda" };

/** Evento del día: entra el pedido y queda resuelto. */
const EventCard: React.FC<{ stop: Stop; start: number; dark: boolean }> = ({ stop, start, dark }) => {
  const frame = useCurrentFrame();
  const p = enter(frame, start + V4.card, 18);
  const q = leave(frame, start + V4.cardOut, 10);
  const r = enter(frame, start + V4.resolve, 16);
  const main = dark ? "#FFFFFF" : COLORS.ink;
  const soft = dark ? "rgba(255,255,255,0.7)" : "rgba(23,18,35,0.62)";
  return (
    <div style={{ width: 880, opacity: p * q, translate: `0 ${(1 - p) * 40 - (1 - q) * 30}px`, scale: String(interpolate(p, [0, 1], [0.95, 1])) }}>
      <Glass variant={dark ? "dark" : "light"} radius={44} style={{ padding: "40px 44px", display: "flex", flexDirection: "column", alignItems: "center", gap: 18, textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <SourceIcon source={stop.source} />
          <div style={{ fontFamily: FONTS.body, fontWeight: 600, fontSize: 30, color: soft }}>{SOURCE_LABEL[stop.source]}</div>
        </div>
        <div style={{ fontFamily: FONTS.body, fontWeight: 500, fontSize: 48, color: main, lineHeight: 1.25 }}>{stop.incoming}</div>
        <div style={{ height: 2, width: interpolate(r, [0, 1], [0, 700]), background: dark ? "rgba(255,255,255,0.14)" : "rgba(124,58,237,0.18)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 18, opacity: r, translate: `0 ${(1 - r) * 16}px` }}>
          <DrawCheck size={60} start={start + V4.resolve} />
          <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 42, color: main }}>{stop.resolved}</div>
        </div>
      </Glass>
    </div>
  );
};

/** Línea del día con un punto que avanza. */
const DayLine: React.FC<{ t: number; dark: boolean; opacity: number }> = ({ t, dark, opacity }) => (
  <div style={{ position: "relative", width: 720, height: 30, opacity }}>
    <div style={{ position: "absolute", top: 14, left: 0, right: 0, height: 3, borderRadius: 3, background: dark ? "rgba(255,255,255,0.18)" : "rgba(23,18,35,0.14)" }} />
    <div style={{ position: "absolute", top: 14, left: 0, width: 720 * t, height: 3, borderRadius: 3, background: "linear-gradient(90deg, #67E8F9, #7C3AED)" }} />
    {STOPS.map((s) => (
      <div
        key={s.time}
        style={{
          position: "absolute",
          left: 720 * s.day - 6,
          top: 9,
          width: 13,
          height: 13,
          borderRadius: 13,
          background: t >= s.day - 0.001 ? "#7C3AED" : dark ? "rgba(255,255,255,0.3)" : "rgba(23,18,35,0.2)",
        }}
      />
    ))}
    <div style={{ position: "absolute", left: 720 * t - 12, top: 3, width: 25, height: 25, borderRadius: 25, background: "#FFFFFF", boxShadow: "0 0 18px rgba(124,58,237,0.8)" }} />
  </div>
);

export const V4UnDia: React.FC = () => {
  const frame = useCurrentFrame();
  const starts = STOPS.map((_, i) => stopStart(i));
  // Progreso del día: avanza mientras ruedan los dígitos.
  let day = 0;
  for (let i = 0; i < STOPS.length; i++) {
    if (frame >= starts[i]) {
      const prev = i === 0 ? 0 : STOPS[i - 1].day;
      day = interpolate(frame, [starts[i], starts[i] + V4.roll + 10], [prev, STOPS[i].day], { ...CLAMP, easing: EASE_OUT });
    }
  }
  const dark = day > 0.62;
  const clockColor = interpolate(day, [0.55, 0.72], [0, 1], CLAMP);
  const clockIn = enter(frame, -8, 18) * leave(frame, V4.claim - 12, 12);
  return (
    <AbsoluteFill>
      <Camera dur={V4_DURATION} from={1.02} to={1.05} sway={6} seed="v4bg">
        <DayCycleBackground t={day} />
        <LightStrands opacity={interpolate(day, [0.6, 1], [0, 0.35], CLAMP)} centerY={0.82} energy={0.5} speed={0.6} />
      </Camera>
      <Camera dur={V4_DURATION} from={1} to={1.04} sway={4} seed="v4fg">
        <Center y={470} style={{ opacity: clockIn, translate: `0 ${(1 - enter(frame, -8, 18)) * 30}px` }}>
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", inset: 0, opacity: 1 - clockColor }}>
              <RollingClock times={STOPS.map((s) => s.time)} starts={starts} roll={V4.roll} color={COLORS.ink} size={220} />
            </div>
            <div style={{ opacity: clockColor }}>
              <RollingClock times={STOPS.map((s) => s.time)} starts={starts} roll={V4.roll} color="#FFFFFF" size={220} />
            </div>
          </div>
          <div style={{ marginTop: 34 }}>
            <DayLine t={day} dark={dark} opacity={enter(frame, V4.firstStop - 10, 16)} />
          </div>
        </Center>

        <Headline lines={["Mientras atendés,", { text: "pasa esto.", italic: true }]} start={-4} exitAt={V4.firstStop - 12} y={1080} size={96} color={COLORS.ink} />

        {STOPS.map((s, i) => (
          <Center key={s.time} y={1170}>
            <EventCard stop={s} start={starts[i]} dark={s.day > 0.62} />
          </Center>
        ))}

        <Headline
          lines={["Vos atendiste", "pacientes.", { text: "AIRIS, todo lo demás.", italic: true }]}
          start={V4.claim}
          exitAt={V4.end - 8}
          y={920}
          size={100}
        />
      </Camera>
      <AbsoluteFill>
        {frame >= V4.end - 2 ? (
          <EndCard
            theme="dark"
            start={V4.end}
            tagline={["Tu consultorio en orden,", { text: "todo el día.", italic: true }]}
            cta="Escribinos por WhatsApp"
          />
        ) : null}
      </AbsoluteFill>
      <Grain opacity={0.06} />
    </AbsoluteFill>
  );
};
