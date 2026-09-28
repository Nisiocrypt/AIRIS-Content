import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS, FONTS } from "../brand/tokens";
import { CLAMP, enter, leave, travel } from "../lib/anim";
import { Grain, NightBackground, Vignette } from "../components/Backgrounds";
import { Camera } from "../components/Camera";
import { Glass } from "../components/Glass";
import { Headline } from "../components/Text";
import { ActionChip, Center } from "../components/Cards";
import { Bubble, Typing } from "../components/Chat";
import { EndCard } from "../components/EndCard";
import { Logo } from "../components/Logo";
import { LightStrands } from "../components/LightStrands";

export const V3_DURATION = 900;

export const V3 = {
  msg: 20,
  split: 100,
  p1: 132,
  bot: 162,
  airisTyping: 148,
  airis1: 166,
  reply: 222,
  airis2: 256,
  chips1: 292,
  chips2: 336,
  collapse: 400,
  claim: 424,
  done: 500,
  row1: 540,
  row2: 572,
  row3: 604,
  nobody: 712,
  end: 804,
};

const PANEL_W = 488;
const PANEL_H = 1080;

const Panel: React.FC<{ side: "left" | "right"; children: React.ReactNode }> = ({ side, children }) => {
  const frame = useCurrentFrame();
  const open = travel(frame, V3.split, 26);
  const collapse = travel(frame, V3.collapse, 22);
  const x = side === "left" ? 540 - 8 - PANEL_W : 540 + 8;
  const slide = side === "left" ? -collapse * 700 : collapse * 700;
  const o = open * (1 - collapse);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: 420,
        width: PANEL_W,
        height: PANEL_H,
        opacity: o,
        translate: `${slide + (1 - open) * (side === "left" ? 120 : -120)}px 0`,
        scale: String(interpolate(open, [0, 1], [0.92, 1])),
        filter: side === "left" ? "saturate(0.2)" : undefined,
      }}
    >
      <Glass
        variant={side === "left" ? "grey" : "violet"}
        radius={44}
        style={{ width: "100%", height: "100%", padding: "40px 26px", display: "flex", flexDirection: "column", alignItems: "center", gap: 20, overflow: "hidden" }}
      >
        {children}
      </Glass>
    </div>
  );
};

const PanelTitle: React.FC<{ side: "left" | "right" }> = ({ side }) =>
  side === "left" ? (
    <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 44, color: "rgba(255,255,255,0.75)", height: 70, display: "flex", alignItems: "center" }}>
      Un chatbot
    </div>
  ) : (
    <div style={{ height: 70, display: "flex", alignItems: "center" }}>
      <Logo width={220} start={V3.split + 6} glow />
    </div>
  );

export const V3ContestarNoEsResolver: React.FC = () => {
  const frame = useCurrentFrame();
  const center = enter(frame, V3.msg, 16) * leave(frame, V3.split - 4, 12);
  const B = { fontSize: 27, maxWidth: 420 };
  return (
    <AbsoluteFill style={{ background: COLORS.night }}>
      <Camera dur={V3_DURATION} from={1.02} to={1.05} sway={8} seed="v3bg">
        <NightBackground glowY={0.42} intensity={0.9} />
        <LightStrands opacity={interpolate(frame, [0, 30, V3.split, V3.split + 30, V3.claim, V3.claim + 30], [0.2, 0.3, 0.3, 0.12, 0.12, 0.45], CLAMP)} centerY={0.72} energy={0.6} speed={0.7} />
      </Camera>
      <Camera dur={V3_DURATION} from={1} to={1.03} sway={4} seed="v3fg">
        {/* Gancho */}
        <Headline lines={["Mismo mensaje.", { text: "Dos respuestas.", italic: true }]} start={-8} exitAt={V3.collapse - 10} y={250} size={92} />
        <Center y={900} style={{ opacity: center, scale: String(interpolate(center, [0, 1], [0.94, 1])) }}>
          <div style={{ width: 820 }}>
            <Bubble from="patient" label="Paciente" text="No llego al turno del jueves. ¿Lo puedo mover?" start={V3.msg} fontSize={44} maxWidth={820} center />
          </div>
        </Center>

        {/* Pantalla dividida */}
        <Panel side="left">
          <PanelTitle side="left" />
          <Bubble from="patient" text="No llego al turno del jueves. ¿Lo puedo mover?" start={V3.p1} muted {...B} />
          <Bubble from="bot" text="Para reprogramar, comunicate de lunes a viernes de 9 a 18 h." start={V3.bot} muted {...B} />
          <Bubble from="patient" text="Ok, mañana llamo." start={V3.reply} muted {...B} />
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 16 }}>
            <ActionChip text="Turno sin mover" tone="fail" start={V3.chips1} size={25} />
            <ActionChip text="Hueco en la agenda" tone="fail" start={V3.chips2} size={25} />
          </div>
        </Panel>
        <Panel side="right">
          <PanelTitle side="right" />
          <Bubble from="patient" text="No llego al turno del jueves. ¿Lo puedo mover?" start={V3.p1} {...B} />
          <Typing start={V3.airisTyping} end={V3.airis1} />
          <Bubble from="airis" text="Sí. Tengo viernes 10:30 o lunes 16:00. ¿Cuál preferís?" start={V3.airis1} {...B} />
          <Bubble from="patient" text="Viernes 10:30." start={V3.reply} {...B} />
          <Bubble from="airis" text="Listo, te reprogramé. Te recuerdo el día anterior." start={V3.airis2} {...B} />
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 16 }}>
            <ActionChip text="Turno reprogramado" start={V3.chips1} size={25} />
            <ActionChip text="Recordatorio listo" start={V3.chips2} size={25} />
          </div>
        </Panel>

        {/* Remate */}
        <Headline lines={["Contestar", { text: "no es resolver.", italic: true }]} start={V3.claim} exitAt={V3.done - 10} y={900} size={116} />

        {/* Lo que quedó hecho */}
        <Headline lines={["Lo que quedó hecho:"]} start={V3.done + 4} exitAt={V3.nobody - 12} y={560} size={80} />
        <Center y={980} style={{ gap: 30 }}>
          <ActionChip text="Turno movido al viernes 10:30" start={V3.row1} exitAt={V3.nobody - 12} size={38} />
          <ActionChip text="Agenda actualizada" start={V3.row2} exitAt={V3.nobody - 12} size={38} />
          <ActionChip text="Recordatorio programado" start={V3.row3} exitAt={V3.nobody - 12} size={38} />
        </Center>

        <Headline lines={["Sin que nadie", { text: "levante el teléfono.", italic: true }]} start={V3.nobody} exitAt={V3.end - 14} y={900} size={100} />
      </Camera>

      <AbsoluteFill>
        {frame >= V3.end - 2 ? (
          <EndCard
            theme="dark"
            start={V3.end}
            tagline={["Un mensaje entra.", { text: "La operación continúa.", italic: true }]}
            cta="Consultoría gratuita de 30 minutos"
          />
        ) : null}
      </AbsoluteFill>
      <Vignette strength={0.5} />
      <Grain opacity={0.08} />
    </AbsoluteFill>
  );
};
