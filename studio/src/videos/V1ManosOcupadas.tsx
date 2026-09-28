import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS } from "../brand/tokens";
import { CLAMP, speechEnergy, travel } from "../lib/anim";
import { Grain, NightBackground, Vignette } from "../components/Backgrounds";
import { Camera } from "../components/Camera";
import { LightStrands } from "../components/LightStrands";
import { Headline } from "../components/Text";
import { ActionChip, CallCard, Center, Notification, ResultCard } from "../components/Cards";
import { Bubble } from "../components/Chat";
import { EndCard } from "../components/EndCard";

export const V1_DURATION = 900;

// Tiempos clave (frames a 30 fps). El audio usa los mismos valores (audio/cues.json).
export const V1 = {
  ringStart: 14,
  pickup: 100,
  compact: 150,
  b1: 158,
  b2: 222,
  pairOut: 292,
  b3: 304,
  chipAgenda: 332,
  b4: 360,
  chipTurno: 392,
  hangup: 432,
  result: 446,
  notif: 500,
  trust: 590,
  urgent: 668,
  payoff: 738,
  end: 812,
};

const ASSISTANT: [number, number][] = [
  [V1.b1 + 4, V1.b1 + 58],
  [V1.b3 + 4, V1.b3 + 50],
];
const PATIENT: [number, number][] = [
  [V1.b2 + 4, V1.b2 + 50],
  [V1.b4 + 4, V1.b4 + 24],
];

export const V1ManosOcupadas: React.FC = () => {
  const frame = useCurrentFrame();

  // Energía de la voz: el asistente mueve las hebras; el paciente, apenas.
  const voice = Math.max(speechEnergy(frame, ASSISTANT, "asistente"), speechEnergy(frame, PATIENT, "paciente") * 0.3);

  // La tarjeta de llamada sube y se compacta cuando empieza la conversación.
  const lift = travel(frame, V1.compact, 20);
  const back = travel(frame, V1.hangup - 4, 16);
  const cardY = interpolate(lift, [0, 1], [1080, 470]) + interpolate(back, [0, 1], [0, 430]);
  const cardScale = interpolate(lift, [0, 1], [1, 0.86]) + interpolate(back, [0, 1], [0, 0.14]);

  // Hebras de fondo: discretas al inicio, protagonistas en el tramo de confianza.
  const bgStrands = interpolate(frame, [0, 60, V1.trust - 20, V1.trust + 20, V1.end - 10, V1.end + 20], [0.25, 0.35, 0.3, 0.85, 0.85, 0.4], CLAMP);

  const status = frame < V1.pickup ? "incoming" : frame < V1.hangup ? "active" : "ended";

  return (
    <AbsoluteFill style={{ background: COLORS.night }}>
      <Camera dur={V1_DURATION} from={1.02} to={1.06} sway={10} seed="v1bg">
        <NightBackground glowY={0.36} />
        <LightStrands
          opacity={bgStrands}
          energy={0.5 + voice * 0.8 + (frame > V1.trust ? 0.5 : 0)}
          centerY={frame > V1.trust - 10 ? 0.68 : 0.7}
          angle={frame > V1.trust - 10 ? -16 : -24}
          spread={300}
          speed={0.8}
        />
      </Camera>

      <Camera dur={V1_DURATION} from={1} to={1.05} sway={6} seed="v1fg">
        {/* Gancho */}
        <Headline lines={["Estás con", "un paciente."]} start={-8} exitAt={44} y={400} size={108} />
        <Headline lines={["Suena el", { text: "teléfono.", italic: true }]} start={52} exitAt={V1.pickup - 6} y={400} size={108} />
        <Headline lines={["Esta vez", { text: "atiende AIRIS.", italic: true }]} start={V1.pickup + 10} exitAt={V1.compact - 6} y={400} size={100} />

        {/* Tarjeta de llamada: entrante, en curso y finalizada */}
        <div style={{ position: "absolute", left: 0, right: 0, top: cardY, transform: `translateY(-50%) scale(${cardScale})`, display: "flex", justifyContent: "center" }}>
          <div style={{ position: "relative", width: 760, display: "flex", justifyContent: "center" }}>
            {status === "incoming" ? (
              <CallCard status="incoming" statusText="Llamada entrante · 11:42" start={4} exitAt={V1.pickup - 2} ring={[V1.ringStart, V1.pickup - 4]} />
            ) : null}
            {status !== "incoming" ? (
              <CallCard
                status={status === "ended" ? "ended" : "active"}
                statusText={status === "ended" ? "Llamada finalizada" : "En llamada"}
                start={V1.pickup}
                exitAt={V1.result - 4}
                energy={voice}
                compact={frame >= V1.compact}
                footer={frame < V1.compact ? "Atiende el asistente virtual" : undefined}
              />
            ) : null}
          </div>
        </div>

        {/* Conversación, en dos tandas */}
        <Center y={1110} style={{ gap: 26, width: 900, left: 90 }}>
          <Bubble from="airis" label="Asistente virtual" text="Hola, te atiende el asistente virtual del consultorio. ¿En qué te ayudo?" start={V1.b1} exitAt={V1.pairOut} />
          <Bubble from="patient" label="Paciente" text="Quería un turno para una limpieza esta semana." start={V1.b2} exitAt={V1.pairOut} />
        </Center>
        <Center y={1150} style={{ gap: 24, width: 900, left: 90 }}>
          <Bubble from="airis" label="Asistente virtual" text="Tengo jueves 10:30 o viernes 16:00. ¿Cuál preferís?" start={V1.b3} exitAt={V1.hangup - 6} />
          <ActionChip text="Agenda consultada" tone="info" start={V1.chipAgenda} exitAt={V1.hangup - 6} size={31} />
          <Bubble from="patient" label="Paciente" text="Jueves 10:30." start={V1.b4} exitAt={V1.hangup - 6} />
          <ActionChip text="Turno reservado · Jue 10:30" start={V1.chipTurno} exitAt={V1.hangup - 6} size={31} />
        </Center>

        {/* Resultado */}
        <Headline lines={["El turno ya está", { text: "en tu agenda.", italic: true }]} start={V1.result + 6} exitAt={V1.trust - 14} y={390} size={92} maxWidth={860} />
        <Center y={900}>
          <ResultCard title="Turno reservado" subtitle="Jueves 10:30 · Limpieza" start={V1.result} exitAt={V1.trust - 12} />
        </Center>
        <Center y={1330}>
          <Notification title="Consultorio Dental" text="Tu turno quedó para el jueves 10:30. Te recordamos el día anterior." start={V1.notif} exitAt={V1.trust - 12} />
        </Center>

        {/* Confianza */}
        <Headline lines={["Se presenta como", "asistente virtual."]} start={V1.trust} exitAt={V1.urgent - 8} y={760} size={96} />
        <Headline lines={["Y si es urgente,", { text: "te pasa la llamada.", italic: true }]} start={V1.urgent} exitAt={V1.payoff - 8} y={760} size={96} />

        {/* Remate */}
        <Headline lines={["Vos seguís", { text: "con tu paciente.", italic: true }]} start={V1.payoff} exitAt={V1.end - 10} y={780} size={104} />
      </Camera>

      {/* Cierre */}
      <AbsoluteFill>
        {frame >= V1.end - 2 ? (
          <EndCard
            theme="dark"
            start={V1.end}
            tagline={["Una llamada entra.", { text: "La operación continúa.", italic: true }]}
            cta="Consultoría gratuita de 30 minutos"
            footnote="Llamada de ejemplo"
          />
        ) : null}
      </AbsoluteFill>

      <Vignette strength={0.55} />
      <Grain opacity={0.08} />
    </AbsoluteFill>
  );
};
