import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS } from "../brand/tokens";
import { CLAMP, speechEnergy, travel } from "../lib/anim";
import { Grain, NightBackground, Vignette } from "../components/Backgrounds";
import { Camera } from "../components/Camera";
import { Headline } from "../components/Text";
import { ActionChip, CallCard, Center, PersonCard } from "../components/Cards";
import { Bubble } from "../components/Chat";
import { EndCard } from "../components/EndCard";
import { FlowLine } from "../components/Transitions";

export const V6_DURATION = 600;

export const V6 = {
  call: 96,
  b1: 150,
  b2: 222,
  alert: 276,
  transfer: 318,
  person: 344,
  claim: 440,
  end: 516,
};

const ASSISTANT: [number, number][] = [[V6.b1 + 4, V6.b1 + 60]];
const PATIENT: [number, number][] = [[V6.b2 + 4, V6.b2 + 44]];

export const V6Urgencia: React.FC = () => {
  const frame = useCurrentFrame();
  const voice = Math.max(speechEnergy(frame, ASSISTANT, "a6"), speechEnergy(frame, PATIENT, "p6") * 0.3);
  // La tarjeta sube un poco para dejar lugar a la persona que recibe la llamada.
  const up = travel(frame, V6.transfer - 6, 20);
  const cardY = interpolate(up, [0, 1], [520, 440]);
  const status = frame < V6.transfer ? "active" : "transfer";
  return (
    <AbsoluteFill style={{ background: COLORS.night }}>
      <Camera dur={V6_DURATION} from={1.01} to={1.03} sway={4} seed="v6bg">
        <NightBackground intensity={interpolate(frame, [0, 90, 100, V6.claim, V6.claim + 20], [0.25, 0.3, 0.55, 0.55, 0.3], CLAMP)} glowY={0.3} hue="deep" />
      </Camera>
      <Camera dur={V6_DURATION} from={1} to={1.03} sway={3} seed="v6fg">
        {/* Gancho: la objeción, sola */}
        <Headline lines={["¿Y si la llamada", { text: "es una urgencia?", italic: true }]} start={-12} exitAt={V6.call - 10} y={900} size={96} inDur={30} stagger={8} />

        <Center y={cardY}>
          <CallCard
            status={status}
            statusText={status === "active" ? "En llamada" : "Pasando la llamada a Sofía"}
            start={V6.call}
            exitAt={V6.claim - 12}
            energy={voice}
            compact
          />
        </Center>

        <Center y={1120} style={{ gap: 26, width: 900, left: 90 }}>
          <Bubble from="airis" label="Asistente virtual" text="Hola, te atiende el asistente virtual del consultorio. ¿En qué te ayudo?" start={V6.b1} exitAt={V6.transfer - 6} />
          <Bubble from="patient" label="Paciente" text="Se me hinchó la cara y me duele mucho." start={V6.b2} exitAt={V6.transfer - 6} />
          <ActionChip text="Posible urgencia" tone="alert" start={V6.alert} exitAt={V6.transfer - 6} size={32} />
        </Center>

        <FlowLine from={[540, 600]} to={[540, 830]} start={V6.transfer + 4} dur={22} exitAt={V6.claim - 12} color="103,232,249" />
        <Center y={1170}>
          <PersonCard name="Sofía" role="Recepción" lines={["Dolor fuerte e hinchazón", "Desde anoche", "Prioridad alta"]} start={V6.person} exitAt={V6.claim - 12} />
        </Center>

        <Headline lines={["No diagnostica.", { text: "Te pasa la llamada.", italic: true }]} start={V6.claim} exitAt={V6.end - 8} y={900} size={100} />
      </Camera>
      <AbsoluteFill>
        {frame >= V6.end - 2 ? (
          <EndCard
            theme="dark"
            start={V6.end}
            tagline={["Sin perder", { text: "control humano.", italic: true }]}
            cta="Hablá con un humano (por ahora)"
            footnote="Llamada de ejemplo"
          />
        ) : null}
      </AbsoluteFill>
      <Vignette strength={0.6} />
      <Grain opacity={0.07} />
    </AbsoluteFill>
  );
};
