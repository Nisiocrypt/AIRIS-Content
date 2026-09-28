import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS, EASE_OUT } from "../brand/tokens";
import { CLAMP, speechEnergy } from "../lib/anim";
import { Grain, GreyBackground, NightBackground, Vignette } from "../components/Backgrounds";
import { Camera } from "../components/Camera";
import { Headline } from "../components/Text";
import { CallCard, Center, Notification, ResultCard, VoicemailCard } from "../components/Cards";
import { EndCard } from "../components/EndCard";
import { LightStrands } from "../components/LightStrands";

export const V7_DURATION = 450;

export const V7 = {
  beep: 30,
  cut: 90,
  ring: 120,
  pickup: 174,
  result: 228,
  notif: 282,
  end: 336,
};

const ASSISTANT: [number, number][] = [[V7.pickup + 8, V7.pickup + 48]];

export const V7Contestador: React.FC = () => {
  const frame = useCurrentFrame();
  const grey = frame < V7.cut;
  const voice = speechEnergy(frame, ASSISTANT, "a7");
  const burst = interpolate(frame, [V7.cut, V7.cut + 8, V7.cut + 40], [1.8, 1.2, 0.7], { ...CLAMP, easing: EASE_OUT });
  return (
    <AbsoluteFill style={{ background: COLORS.night }}>
      {grey ? (
        <Camera dur={V7.cut} from={1} to={1.03} sway={2} seed="v7g">
          <GreyBackground />
          <Headline lines={["El contestador", { text: "no agenda turnos.", italic: true }]} start={-6} y={430} size={100} color="rgba(255,255,255,0.9)" />
          <Center y={1060}>
            <VoicemailCard start={-6} />
          </Center>
        </Camera>
      ) : (
        <>
          <Camera dur={V7_DURATION - V7.cut} start={V7.cut} from={1.04} to={1.07} sway={8} seed="v7bg">
            <NightBackground intensity={1.2} />
            <LightStrands opacity={interpolate(frame, [V7.cut, V7.cut + 6, V7.ring, V7.end], [1, 0.9, 0.35, 0.3], CLAMP)} energy={burst + voice} centerY={0.74} spread={320} speed={1.2} />
          </Camera>
          <Camera dur={V7_DURATION - V7.cut} start={V7.cut} from={1} to={1.04} sway={5} seed="v7fg">
            <Headline lines={["AIRIS, sí."]} start={V7.cut} exitAt={V7.ring - 6} y={900} size={170} inDur={10} stagger={0} />
            <Center y={880}>
              {frame < V7.pickup ? (
                <CallCard status="incoming" statusText="Llamada entrante · 21:40" start={V7.ring} exitAt={V7.pickup - 4} ring={[V7.ring + 2, V7.pickup - 6]} />
              ) : null}
            </Center>
            <Center y={880}>
              {frame >= V7.pickup - 2 ? (
                <CallCard status="active" statusText="En llamada" start={V7.pickup} exitAt={V7.result - 4} energy={voice} footer="Atiende el asistente virtual" />
              ) : null}
            </Center>
            <Center y={880}>
              <ResultCard title="Turno reservado" subtitle="Lunes 9:00" start={V7.result} exitAt={V7.end - 8} />
            </Center>
            <Center y={1240}>
              <Notification title="Consultorio" text="Tu turno quedó para el lunes 9:00." start={V7.notif} exitAt={V7.end - 8} />
            </Center>
          </Camera>
        </>
      )}
      <AbsoluteFill>
        {frame >= V7.end - 2 ? (
          <EndCard
            theme="dark"
            start={V7.end}
            tagline={["Tu consultorio atiende,", { text: "aunque esté cerrado.", italic: true }]}
            footnote="Llamada de ejemplo"
          />
        ) : null}
      </AbsoluteFill>
      <Vignette strength={grey ? 0.6 : 0.45} />
      <Grain opacity={grey ? 0.12 : 0.07} />
    </AbsoluteFill>
  );
};
