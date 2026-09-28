import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS, EASE_IN, EASE_OUT, FONTS } from "../brand/tokens";
import { CLAMP, enter, leave } from "../lib/anim";
import { Grain, NightBackground, Vignette } from "../components/Backgrounds";
import { Camera } from "../components/Camera";
import { Glass } from "../components/Glass";
import { Headline } from "../components/Text";
import { Center } from "../components/Cards";
import { DrawCheck } from "../components/Icons";
import { EndCard } from "../components/EndCard";
import { Logo } from "../components/Logo";
import { LightStrands } from "../components/LightStrands";

export const V8_DURATION = 450;

export const V8 = {
  pileStart: 100,
  pileStep: 16,
  logo: 236,
  suck: 246,
  claim: 282,
  vos: 326,
  end: 380,
};

const TASKS = [
  { text: "Responder WhatsApp", x: -40, y: -195 },
  { text: "Confirmar turnos", x: 50, y: -117 },
  { text: "Mover turnos", x: -60, y: -39 },
  { text: "Mandar recordatorios", x: 30, y: 39 },
  { text: "Perseguir pagos", x: -45, y: 117 },
  { text: "Atender llamadas", x: 55, y: 195 },
];

const CARD_Y = 1000;
const LOGO_Y = 380;

/** Tarjeta del título profesional (el título grande arriba, el detalle abajo). */
const DiplomaCard: React.FC<{ covered: number }> = ({ covered }) => {
  const frame = useCurrentFrame();
  const p = enter(frame, -8, 20);
  return (
    <div style={{ width: 820, opacity: p, translate: `0 ${(1 - p) * 40}px`, filter: `brightness(${1 - covered * 0.45})` }}>
      <Glass variant="clear" radius={48} style={{ padding: "70px 60px", display: "flex", flexDirection: "column", alignItems: "center", gap: 20, textAlign: "center" }}>
        <div style={{ width: 120, height: 3, borderRadius: 3, background: "linear-gradient(90deg, rgba(221,214,254,0), rgba(221,214,254,0.9), rgba(221,214,254,0))" }} />
        <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 96, color: "#FFFFFF", letterSpacing: "-0.02em" }}>Odontóloga</div>
        <div style={{ fontFamily: FONTS.body, fontWeight: 500, fontSize: 32, color: "rgba(255,255,255,0.65)" }}>Título profesional</div>
        <div style={{ width: 120, height: 3, borderRadius: 3, background: "linear-gradient(90deg, rgba(221,214,254,0), rgba(221,214,254,0.9), rgba(221,214,254,0))" }} />
      </Glass>
    </div>
  );
};

/** Tarea que cae sobre la tarjeta y después sube hasta el logo de AIRIS. */
const TaskChip: React.FC<{ text: string; x: number; y: number; i: number }> = ({ text, x, y, i }) => {
  const frame = useCurrentFrame();
  const inAt = V8.pileStart + i * V8.pileStep;
  const drop = interpolate(frame, [inAt, inAt + 12], [0, 1], { ...CLAMP, easing: EASE_OUT });
  const settle = interpolate(frame, [inAt + 8, inAt + 16], [1.04, 1], CLAMP);
  const outAt = V8.suck + i * 3;
  const fly = interpolate(frame, [outAt, outAt + 18], [0, 1], { ...CLAMP, easing: EASE_IN });
  if (drop <= 0) return null;
  const cx = 540 + x;
  const cy = CARD_Y + y;
  const px = cx + (540 - cx) * fly;
  const py = cy - (1 - drop) * 220 + (LOGO_Y - cy) * fly;
  return (
    <div
      style={{
        position: "absolute",
        left: px,
        top: py,
        transform: "translate(-50%, -50%)",
        opacity: drop * (1 - fly),
        scale: String((drop < 1 ? 0.9 + 0.1 * drop : settle) * (1 - fly * 0.8)),
      }}
    >
      <Glass variant="dark" radius={999} style={{ padding: "22px 40px", fontFamily: FONTS.body, fontWeight: 600, fontSize: 38, color: "#FFFFFF", whiteSpace: "nowrap", background: "rgba(24,16,48,0.88)" }}>
        {text}
      </Glass>
    </div>
  );
};

export const V8Titulo: React.FC = () => {
  const frame = useCurrentFrame();
  const piled = interpolate(frame, [V8.pileStart, V8.pileStart + TASKS.length * V8.pileStep], [0, 1], CLAMP);
  const cleared = interpolate(frame, [V8.suck + 6, V8.suck + 30], [0, 1], CLAMP);
  const covered = piled * (1 - cleared);
  const logoIn = enter(frame, V8.logo, 12) * leave(frame, V8.end - 10, 10);
  const glow = interpolate(frame, [V8.suck + 14, V8.suck + 24, V8.suck + 50], [0, 1, 0.3], CLAMP);
  return (
    <AbsoluteFill style={{ background: COLORS.night }}>
      <Camera dur={V8_DURATION} from={1.02} to={1.06} sway={8} seed="v8bg">
        <NightBackground intensity={1.2} glowY={0.45} />
        <LightStrands opacity={0.18 + glow * 0.5} energy={0.5 + glow} centerY={0.2} speed={0.7} />
      </Camera>
      <Camera dur={V8_DURATION} from={1} to={1.05} sway={4} seed="v8fg">
        <Headline lines={["Tu título no dice", { text: "«administrativa».", italic: true }]} start={-6} exitAt={V8.logo - 12} y={420} size={88} />
        <Center y={CARD_Y} style={{ opacity: leave(frame, V8.end - 10, 10) }}>
          <DiplomaCard covered={covered} />
        </Center>
        {TASKS.map((t, i) => (
          <TaskChip key={t.text} {...t} i={i} />
        ))}
        <div style={{ position: "absolute", left: 0, right: 0, top: LOGO_Y, transform: "translateY(-50%)", display: "flex", justifyContent: "center", opacity: logoIn, scale: String(1 + glow * 0.06) }}>
          {frame >= V8.logo ? <Logo width={420} start={V8.logo} /> : null}
        </div>
        {frame >= V8.suck + 24 && frame < V8.end ? (
          <Center y={CARD_Y + 230}>
            <DrawCheck size={76} start={V8.suck + 26} />
          </Center>
        ) : null}
        <Headline lines={["Eso lo hace AIRIS."]} start={V8.claim} exitAt={V8.vos - 8} y={1450} size={80} />
        <Headline lines={["Vos, lo que", { text: "estudiaste.", italic: true }]} start={V8.vos} exitAt={V8.end - 8} y={1450} size={88} />
      </Camera>
      <AbsoluteFill>
        {frame >= V8.end - 2 ? <EndCard theme="dark" start={V8.end} cta="Consultoría gratuita de 30 minutos" logoY={760} /> : null}
      </AbsoluteFill>
      <Vignette strength={0.5} />
      <Grain opacity={0.08} />
    </AbsoluteFill>
  );
};
