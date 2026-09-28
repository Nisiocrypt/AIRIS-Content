import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS, EASE_IN, EASE_IN_OUT, EASE_OUT, FONTS } from "../brand/tokens";
import { CLAMP, enter, leave } from "../lib/anim";
import { Grain, NightBackground, Vignette } from "../components/Backgrounds";
import { Camera } from "../components/Camera";
import { Headline } from "../components/Text";
import { ActionChip, ResultCard } from "../components/Cards";
import { EndCard } from "../components/EndCard";
import { WA, WABubble, WAHeader, waStatus, waWallpaper } from "../components/WhatsApp";
import { LightStrands } from "../components/LightStrands";

export const V10_DURATION = 900;

export const V10 = {
  flood: 0,
  title: 96,
  peak: 184,
  black: 190,
  calm: 198,
  ask: 302,
  typing: 318,
  reply: 334,
  ok: 376,
  booked: 404,
  zoom: 440,
  zoomEnd: 484,
  gridTitle: 482,
  solve: 494,
  solveStep: 7,
  gridOut: 700,
  claim: 712,
  end: 804,
};

// ------------------------------------------------------------------ avalancha

/** Siempre las mismas preguntas: ese es el chiste y el dolor. */
const QUESTIONS = [
  "¿Precio?",
  "Hola, ¿tienen turno?",
  "¿Hasta qué hora atienden?",
  "¿Dónde están?",
  "Hola",
  "¿Hay alguien?",
  "¿Precio de la limpieza?",
  "¿Aceptan obra social?",
  "Hola??",
  "¿Me pasás info?",
  "¿Turno para mañana?",
  "¿Precio?",
];

const FLOOD_N = 175;
const FLOOD_END = V10.peak;

const rng = (i: number, k: number) => {
  const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** Cada burbuja: cuándo cae, dónde y cómo. Cae cada vez más seguido. */
const FLOOD = Array.from({ length: FLOOD_N }, (_, i) => {
  const t = i === 0 ? 0 : Math.round(FLOOD_END * Math.pow(i / FLOOD_N, 0.62));
  const first = i === 0;
  return {
    t,
    text: first ? "Hola, ¿precio?" : QUESTIONS[Math.floor(rng(i, 1) * QUESTIONS.length)],
    x: first ? 540 : 110 + rng(i, 2) * 860,
    y: first ? 960 : 170 + rng(i, 3) * 1580,
    rot: first ? 0 : (rng(i, 4) - 0.5) * 12,
    scale: first ? 1.5 : 0.9 + rng(i, 5) * 0.65,
    time: `9:${String(Math.floor(rng(i, 6) * 60)).padStart(2, "0")}`,
  };
});

const FloodBubble: React.FC<(typeof FLOOD)[number]> = ({ t, text, x, y, rot, scale, time }) => {
  const frame = useCurrentFrame();
  if (frame < t) return null;
  const p = interpolate(frame, [t, t + 7], [0, 1], { ...CLAMP, easing: EASE_OUT });
  const pop = interpolate(frame, [t, t + 4, t + 9], [0.55, 1.08, 1], CLAMP);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        translate: "-50% -50%",
        rotate: `${rot}deg`,
        scale: String(scale * pop),
        opacity: p,
      }}
    >
      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", top: 0, left: -10, borderTop: `16px solid ${WA.incoming}`, borderLeft: "16px solid transparent" }} />
        <div
          style={{
            padding: "12px 16px 8px",
            borderRadius: 14,
            borderTopLeftRadius: 0,
            background: WA.incoming,
            boxShadow: "0 10px 30px rgba(0,0,0,0.55)",
            fontFamily: FONTS.body,
            fontWeight: 400,
            fontSize: 36,
            color: WA.text,
            whiteSpace: "nowrap",
          }}
        >
          {text}
          <span style={{ fontSize: 17, color: WA.meta, marginLeft: 16, position: "relative", top: 8 }}>{time}</span>
        </div>
      </div>
    </div>
  );
};

/** Temblor que crece con la cantidad de mensajes. */
const Shake: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const amp = interpolate(frame, [50, FLOOD_END], [0, 30], { ...CLAMP, easing: EASE_IN });
  const x = (Math.sin(frame * 2.9) + Math.sin(frame * 5.3 + 1.7) * 0.6) * amp * 0.62;
  const y = (Math.cos(frame * 3.7 + 0.4) + Math.sin(frame * 6.1) * 0.5) * amp * 0.5;
  const r = Math.sin(frame * 4.3 + 2.1) * amp * 0.03;
  const zoom = interpolate(frame, [0, FLOOD_END], [1, 1.08], { ...CLAMP, easing: EASE_IN });
  return <AbsoluteFill style={{ translate: `${x}px ${y}px`, rotate: `${r}deg`, scale: String(zoom) }}>{children}</AbsoluteFill>;
};

// ------------------------------------------------------------------ grilla de 20 chats

/** Grilla 4 x 5. Cada cuadrito es un chat dibujado a tamaño real y achicado. */
const COLS = 4;
const ROWS = 5;
const TW = 210;
const TH = 220;
const GAP_X = 20;
const GAP_Y = 14;
const GRID_X = 90;
const GRID_Y = 400;
const NW = 900;
const K = TW / NW;
const NH = TH / K;
/** El chat de Laura: la cámara arranca metida en este cuadrito. */
const HERO = { col: 1, row: 2 };

const cellPos = (col: number, row: number) => ({ x: GRID_X + col * (TW + GAP_X), y: GRID_Y + row * (TH + GAP_Y) });

type Chat = { name: string; q: string; a: string; done: string };

const ANSWERS: Record<string, [string, string]> = {
  "¿Precio?": ["Te paso los precios. ¿Querés turno?", "Respondida"],
  "Hola, ¿tienen turno?": ["Sí: jueves 11:00 o viernes 16:30.", "Turno reservado"],
  "¿Hasta qué hora atienden?": ["Hasta las 20 h, de lunes a viernes.", "Respondida"],
  "¿Dónde están?": ["Te mando la ubicación.", "Ubicación enviada"],
  "¿Aceptan obra social?": ["Sí, te paso con cuáles trabajamos.", "Respondida"],
  "¿Me pasás info?": ["Claro, ¿qué tratamiento te interesa?", "Respondida"],
  "¿Turno para mañana?": ["Mañana 10:30 está libre. ¿Te lo reservo?", "Turno reservado"],
  "¿Hay alguien?": ["Hola, sí. ¿En qué te ayudo?", "Respondida"],
  "Llamada entrante · 21:40": ["Atendida por el asistente virtual.", "Llamada atendida"],
};
const NAMES = ["Martín", "Sofía", "Pablo", "Carla", "Diego", "Julieta", "Tomás", "Valeria", "Nicolás", "Lucía", "Andrés", "Camila", "Federico", "Paula", "Gonzalo", "Mariana", "Hernán", "Florencia", "Ramiro"];
const QS = Object.keys(ANSWERS);

const OTHERS: (Chat & { col: number; row: number; order: number })[] = (() => {
  const cells: { col: number; row: number }[] = [];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (!(c === HERO.col && r === HERO.row)) cells.push({ col: c, row: r });
  const order = cells.map((_, i) => i).sort((x, y) => rng(x, 9) - rng(y, 9));
  return cells.map((cell, i) => {
    const q = QS[(i * 5 + 2) % QS.length];
    return { ...cell, name: NAMES[i], q, a: ANSWERS[q][0], done: ANSWERS[q][1], order: order.indexOf(i) };
  });
})();

/** Marco del cuadrito: aparece al alejarse la cámara y se ilumina cuando el chat se resuelve. */
const Tile: React.FC<{ col: number; row: number; frameOpacity: number; lit: number; children: React.ReactNode }> = ({ col, row, frameOpacity, lit, children }) => {
  const { x, y } = cellPos(col, row);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: TW,
        height: TH,
        borderRadius: 22,
        overflow: "hidden",
        background: WA.wallpaper,
        opacity: 1,
        border: `1.5px solid rgba(${lit > 0.5 ? "167,139,250" : "255,255,255"},${(0.12 + 0.45 * lit) * frameOpacity})`,
        boxShadow: `0 0 ${28 * lit}px rgba(124,58,237,${0.55 * lit * frameOpacity})`,
      }}
    >
      <div style={{ position: "absolute", left: 0, top: 0, width: NW, height: NH, scale: String(K), transformOrigin: "0 0" }}>{children}</div>
    </div>
  );
};

const MiniChat: React.FC<{ chat: Chat; tReply: number; tDone: number; appear: number }> = ({ chat, tReply, tDone, appear }) => {
  const frame = useCurrentFrame();
  const unread = interpolate(frame, [tReply - 4, tReply + 4], [1, 0], CLAMP);
  return (
    <div style={{ position: "absolute", inset: 0, ...waWallpaper, opacity: appear }}>
      <WAHeader name={chat.name} status={waStatus(frame, tReply - 14, tReply)} scale={1.25} unread={unread} />
      <div style={{ padding: "40px 44px", display: "flex", flexDirection: "column", gap: 26 }}>
        <WABubble text={chat.q} time="9:12" start={-20} fontSize={54} maxWidth={780} />
        <WABubble text={chat.a} time="9:12" out start={tReply} fontSize={54} maxWidth={780} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 50 }}>
        <ActionChip text={chat.done} start={tDone} size={58} />
      </div>
    </div>
  );
};

/** Conversación de Laura a tamaño real (dentro del cuadrito que la cámara amplía). */
const HeroChat: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", inset: 0, ...waWallpaper }}>
      <WAHeader name="Laura" status={waStatus(frame, V10.typing, V10.reply)} />
      <div style={{ padding: "36px 40px", display: "flex", flexDirection: "column", gap: 22 }}>
        <WABubble text="Hola, ¿precio de la limpieza?" time="21:40" start={V10.ask} fontSize={42} />
        <WABubble text="¡Hola Laura! Te paso el precio y los turnos libres. ¿Jueves 11:00 te sirve?" time="21:40" out start={V10.reply} fontSize={42} />
        <WABubble text="Dale, perfecto." time="21:41" start={V10.ok} fontSize={42} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 40, display: "flex", justifyContent: "center" }}>
        <ResultCard title="Turno reservado" subtitle="Jueves 11:00" start={V10.booked} />
      </div>
    </div>
  );
};

const ChatGrid: React.FC = () => {
  const frame = useCurrentFrame();
  const z = 1 - interpolate(frame, [V10.zoom, V10.zoomEnd], [0, 1], { ...CLAMP, easing: EASE_IN_OUT });
  const S = NW / TW;
  const h = cellPos(HERO.col, HERO.row);
  const cx = h.x + TW / 2;
  const cy = h.y + TH / 2;
  const scale = 1 + (S - 1) * z;
  const out = leave(frame, V10.gridOut, 14);
  const frameOpacity = interpolate(z, [0, 0.6], [1, 0], CLAMP);
  return (
    <AbsoluteFill style={{ opacity: out, scale: String(1 - (1 - out) * 0.04) }}>
      <AbsoluteFill style={{ transformOrigin: `${cx}px ${cy}px`, translate: `${(540 - cx) * z}px ${(960 - cy) * z}px`, scale: String(scale) }}>
        <Tile col={HERO.col} row={HERO.row} frameOpacity={frameOpacity} lit={frameOpacity}>
          <HeroChat />
        </Tile>
        {frame >= V10.zoom
          ? OTHERS.map((c) => {
              const tReply = V10.solve + c.order * V10.solveStep;
              const tDone = tReply + 18;
              const lit = interpolate(frame, [tDone, tDone + 8], [0, 1], CLAMP);
              return (
                <Tile key={c.name} col={c.col} row={c.row} frameOpacity={frameOpacity} lit={lit}>
                  <MiniChat chat={c} tReply={tReply} tDone={tDone} appear={frameOpacity} />
                </Tile>
              );
            })
          : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ video

export const V10Avalancha: React.FC = () => {
  const frame = useCurrentFrame();
  const chaos = frame < V10.black;
  const scrim = enter(frame, V10.title - 6, 12);
  const strands = interpolate(frame, [V10.calm, V10.calm + 20, V10.ask, V10.end], [0, 0.9, 0.35, 0.3], CLAMP);
  const burst = interpolate(frame, [V10.calm, V10.calm + 10, V10.calm + 60], [1.6, 1.1, 0.6], { ...CLAMP, easing: EASE_OUT });

  return (
    <AbsoluteFill style={{ background: COLORS.night }}>
      {/* 1. Avalancha: la misma pregunta mil veces, la pantalla se llena y tiembla */}
      {chaos ? (
        <Shake>
          <AbsoluteFill style={waWallpaper} />
          {FLOOD.map((b, i) => (
            <FloodBubble key={i} {...b} />
          ))}
          <AbsoluteFill style={{ background: "radial-gradient(ellipse 75% 21% at 50% 50%, rgba(3,4,8,0.97) 0%, rgba(3,4,8,0.9) 55%, rgba(3,4,8,0) 100%)", opacity: scrim }} />
          <Headline lines={["Todos preguntan", { text: "lo mismo.", italic: true }]} start={V10.title} y={960} size={112} inDur={10} />
        </Shake>
      ) : null}
      {chaos ? (
        <AbsoluteFill style={{ background: "#FFFFFF", mixBlendMode: "soft-light", opacity: interpolate(frame, [V10.peak - 10, V10.peak], [0, 0.35], CLAMP) }} />
      ) : null}

      {/* 2. Corte a negro y calma: entra AIRIS */}
      {frame >= V10.calm ? (
        <>
          <Camera dur={V10_DURATION - V10.calm} start={V10.calm} from={1.04} to={1.07} sway={8} seed="v10bg">
            <NightBackground intensity={1.15} />
            <LightStrands opacity={strands} energy={burst} centerY={0.78} spread={320} speed={0.9} />
          </Camera>
          <Camera dur={V10_DURATION - V10.calm} start={V10.calm} from={1} to={1.04} sway={5} seed="v10fg">
            <Headline lines={["Con AIRIS,", { text: "todos tienen respuesta.", italic: true }]} start={V10.calm} exitAt={V10.ask - 14} y={900} size={110} inDur={14} />

            {/* Una de esas preguntas, resuelta; después la cámara se aleja: son 20 a la vez */}
            {frame >= V10.ask - 2 && frame < V10.gridOut + 16 ? <ChatGrid /> : null}
            <Headline lines={["Todo en simultáneo."]} start={V10.gridTitle} exitAt={V10.gridOut - 8} y={280} size={80} />

            <Headline lines={["Las mismas preguntas.", { text: "Ninguna sin respuesta.", italic: true }]} start={V10.claim} exitAt={V10.end - 14} y={900} size={96} />
          </Camera>
        </>
      ) : null}

      <AbsoluteFill>
        {frame >= V10.end - 2 ? (
          <EndCard theme="dark" start={V10.end} tagline={["Que ningún mensaje", { text: "quede sin respuesta.", italic: true }]} cta="Consultoría gratuita de 30 minutos" />
        ) : null}
      </AbsoluteFill>
      <Vignette strength={chaos ? 0.6 : 0.45} />
      <Grain opacity={chaos ? 0.1 : 0.07} />
    </AbsoluteFill>
  );
};
