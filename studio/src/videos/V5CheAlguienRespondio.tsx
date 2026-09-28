import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { fitText } from "@remotion/layout-utils";
import { COLORS, EASE_OUT, FONTS } from "../brand/tokens";
import { useFontsReady } from "../lib/useFontsReady";
import { CLAMP } from "../lib/anim";
import { Grain, NightBackground, VioletBackground, Vignette } from "../components/Backgrounds";
import { Camera } from "../components/Camera";
import { Headline } from "../components/Text";
import { ActionChip, Center, Notification } from "../components/Cards";
import { Bubble } from "../components/Chat";
import { EndCard } from "../components/EndCard";
import { LightStrands } from "../components/LightStrands";

export const V5_DURATION = 600;
/** 120 pulsos por minuto: un pulso cada 15 frames. */
export const BEAT = 15;

export const V5 = {
  chaos: 60,
  black: 165,
  calm: 180,
  client: 186,
  airis: 222,
  chip1: 262,
  chip2: 286,
  chip3: 310,
  calmOut: 322,
  nada: 330,
  vos: 408,
  end: 500,
};

/** Golpe de escala en cada corte, para que el corte se sienta en el pulso. */
const Punch: React.FC<{ at: number; children: React.ReactNode }> = ({ at, children }) => {
  const frame = useCurrentFrame();
  const s = interpolate(frame, [at, at + 7], [1.07, 1], { ...CLAMP, easing: EASE_OUT });
  return <AbsoluteFill style={{ scale: String(s) }}>{children}</AbsoluteFill>;
};

/** Palabra enorme, sola en pantalla, ajustada para no pasar los 880 px de ancho seguro. */
const Word: React.FC<{ text: string; italic?: boolean; size?: number }> = ({ text, italic, size = 190 }) => {
  const ready = useFontsReady();
  if (!ready) return null;
  let fs = size;
  for (const line of text.split("\n")) {
    try {
      fs = Math.min(fs, fitText({ text: line, withinWidth: italic ? 840 : 880, fontFamily: FONTS.display, fontWeight: 900, letterSpacing: "-0.03em", validateFontIsLoaded: true }).fontSize);
    } catch {
      // fuente todavía no disponible: queda el tamaño pedido
    }
  }
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ fontFamily: FONTS.display, fontWeight: 900, fontStyle: italic ? "italic" : "normal", fontSize: Math.floor(fs), color: "#FFFFFF", letterSpacing: "-0.03em", textAlign: "center", lineHeight: 1.02, whiteSpace: "pre" }}>
        {text}
      </div>
    </AbsoluteFill>
  );
};

type Shot = { from: number; to: number; bg: "violet" | "night"; node: React.ReactNode };

const SHOTS: Shot[] = [
  { from: 0, to: 15, bg: "violet", node: <Word text="¿Che," /> },
  { from: 15, to: 30, bg: "night", node: <Word text="alguien" size={170} /> },
  { from: 30, to: 60, bg: "violet", node: <Word text="respondió?" italic size={150} /> },
  {
    from: 60,
    to: 75,
    bg: "night",
    node: (
      <Center y={960}>
        <div style={{ scale: "1.3" }}><Notification title="WhatsApp del equipo" text="3 chats sin leer" start={46} when="hace 2 h" width={760} /></div>
      </Center>
    ),
  },
  { from: 75, to: 90, bg: "violet", node: <Center y={960}><div style={{ width: 900 }}><Bubble from="patient" text="¿Lo viste vos?" start={61} fontSize={64} maxWidth={900} center /></div></Center> },
  { from: 90, to: 105, bg: "night", node: <Center y={960}><div style={{ width: 900 }}><Bubble from="human" text="Pensé que lo tenías vos." start={76} fontSize={60} maxWidth={900} center /></div></Center> },
  { from: 105, to: 120, bg: "violet", node: <Center y={960}><div style={{ width: 900 }}><Bubble from="patient" text="¿Quién le pasó el precio?" start={91} fontSize={60} maxWidth={900} center /></div></Center> },
  { from: 120, to: 135, bg: "night", node: <Center y={960}><div style={{ width: 900 }}><Bubble from="patient" label="Cliente" text="Hola... ¿hay alguien?" start={106} fontSize={60} maxWidth={900} center /></div></Center> },
  { from: 135, to: 150, bg: "violet", node: <Word text="El cliente" size={150} /> },
  { from: 150, to: 165, bg: "night", node: <Word text={"se fue\ncon otro."} italic size={150} /> },
];

export const V5CheAlguienRespondio: React.FC = () => {
  const frame = useCurrentFrame();
  const shot = SHOTS.find((s) => frame >= s.from && frame < s.to);
  const calmStrands = interpolate(frame, [V5.calm, V5.calm + 30, V5.end - 10, V5.end + 10], [0, 0.35, 0.35, 0], CLAMP);

  return (
    <AbsoluteFill style={{ background: COLORS.night }}>
      {/* Caos: un plano por pulso, cortes secos */}
      {shot ? (
        <Punch at={shot.from}>
          {shot.bg === "violet" ? <VioletBackground /> : <NightBackground intensity={1.2} />}
          {shot.node}
        </Punch>
      ) : null}

      {/* Silencio en negro entre el caos y la calma */}
      {frame >= V5.black && frame < V5.calm ? <AbsoluteFill style={{ background: "#000" }} /> : null}

      {/* Calma: una consulta que AIRIS toma y ordena */}
      {frame >= V5.calm ? (
        <>
          <Camera dur={V5_DURATION - V5.calm} start={V5.calm} from={1.02} to={1.05} sway={6} seed="v5bg">
            {frame < V5.end ? <NightBackground /> : <VioletBackground />}
            <LightStrands opacity={calmStrands} centerY={0.84} energy={0.5} speed={0.6} />
          </Camera>
          <Camera dur={V5_DURATION - V5.calm} start={V5.calm} from={1} to={1.04} sway={4} seed="v5fg">
            <Center y={760} style={{ gap: 30, width: 900, left: 90 }}>
              <Bubble from="patient" label="Cliente" text="Hola, ¿me pasan precio y disponibilidad?" start={V5.client} exitAt={V5.calmOut} fontSize={38} />
              <Bubble from="airis" label="AIRIS" text="Hola, te paso precio y horarios disponibles." start={V5.airis} exitAt={V5.calmOut} fontSize={38} />
            </Center>
            <Center y={1230} style={{ gap: 22 }}>
              <ActionChip text="Consulta registrada" start={V5.chip1} exitAt={V5.calmOut} size={34} />
              <ActionChip text="Asignada a Martín · Ventas" start={V5.chip2} exitAt={V5.calmOut} size={34} />
              <ActionChip text="Seguimiento en 24 h" start={V5.chip3} exitAt={V5.calmOut} size={34} />
            </Center>
            <Headline lines={["Nada queda", { text: "sin respuesta.", italic: true }]} start={V5.nada} exitAt={V5.vos - 10} y={900} size={116} />
            <Headline lines={["Y vos sabés", { text: "quién respondió.", italic: true }]} start={V5.vos} exitAt={V5.end - 14} y={900} size={104} />
          </Camera>
        </>
      ) : null}

      <AbsoluteFill>
        {frame >= V5.end - 2 ? (
          <EndCard theme="violet" start={V5.end} tagline={["Que nada se pierda", { text: "entre chats.", italic: true }]} cta="Consultoría gratuita de 30 minutos" />
        ) : null}
      </AbsoluteFill>
      <Vignette strength={0.4} />
      <Grain opacity={0.08} />
      {/* Flash mínimo en cada corte del caos */}
      {frame < V5.black ? (
        <AbsoluteFill style={{ background: "#FFFFFF", mixBlendMode: "soft-light", opacity: interpolate(frame % BEAT, [0, 3], [0.25, 0], CLAMP) }} />
      ) : null}
    </AbsoluteFill>
  );
};
