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

export const V10_DURATION = 1112;

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
  // mazo y mini CRM
  stack: 640,
  board: 676,
  deal: 700,
  dealStep: 7,
  zoomIn: 782,
  zoomInEnd: 808,
  cursorIn: 796,
  click1: 824,
  detail: 828,
  click2: 858,
  sent: 862,
  detailOut: 884,
  zoomOut: 888,
  zoomOutEnd: 914,
  boardOut: 922,
  claim: 934,
  end: 1016,
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
const STACK = { x: 540, y: 1510 };

const Tile: React.FC<{ col: number; row: number; frameOpacity: number; lit: number; stackIndex: number; children: React.ReactNode }> = ({ col, row, frameOpacity, lit, stackIndex, children }) => {
  const frame = useCurrentFrame();
  const cell = cellPos(col, row);
  // al terminar, cada chat vuela al mazo (de a uno, muy seguido)
  const f = interpolate(frame, [V10.stack + stackIndex * 1.2, V10.stack + stackIndex * 1.2 + 22], [0, 1], { ...CLAMP, easing: EASE_IN_OUT });
  const x = cell.x + (STACK.x - TW / 2 - cell.x) * f;
  const y = cell.y + (STACK.y - TH / 2 - cell.y) * f - Math.sin(Math.PI * f) * 90;
  const rot = f * (rng(stackIndex, 11) - 0.5) * 14;
  // las de arriba del mazo se van repartiendo al CRM
  const dealtAt = V10.deal + (19 - stackIndex) * V10.dealStep;
  if (stackIndex >= 10 && frame >= dealtAt) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        rotate: `${rot}deg`,
        scale: String(1 - 0.12 * f),
        zIndex: f > 0 ? 100 + stackIndex : 0,
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
  const out = leave(frame, V10.boardOut, 14);
  const frameOpacity = interpolate(z, [0, 0.6], [1, 0], CLAMP);
  return (
    <AbsoluteFill style={{ opacity: out, scale: String(1 - (1 - out) * 0.04) }}>
      <AbsoluteFill style={{ transformOrigin: `${cx}px ${cy}px`, translate: `${(540 - cx) * z}px ${(960 - cy) * z}px`, scale: String(scale) }}>
        <Tile col={HERO.col} row={HERO.row} frameOpacity={frameOpacity} lit={frameOpacity} stackIndex={19}>
          <HeroChat />
        </Tile>
        {frame >= V10.zoom
          ? OTHERS.map((c) => {
              const tReply = V10.solve + c.order * V10.solveStep;
              const tDone = tReply + 18;
              const lit = interpolate(frame, [tDone, tDone + 8], [0, 1], CLAMP);
              return (
                <Tile key={c.name} col={c.col} row={c.row} frameOpacity={frameOpacity} lit={lit} stackIndex={c.order}>
                  <MiniChat chat={c} tReply={tReply} tDone={tDone} appear={frameOpacity} />
                </Tile>
              );
            })
          : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ mini CRM

type Stage = 0 | 1 | 2;
const STAGES: { label: string; tag: string; dot: string; chip: string }[] = [
  { label: "Calificados", tag: "Calificado", dot: "#A78BFA", chip: "rgba(124,58,237,0.85)" },
  { label: "Para contactar", tag: "Para contactar", dot: "#67E8F9", chip: "rgba(8,145,178,0.75)" },
  { label: "Descartados", tag: "Descartado", dot: "rgba(255,255,255,0.45)", chip: "rgba(255,255,255,0.16)" },
];

/** Orden en que salen del mazo: Laura primero (es la carta de arriba). */
const LEADS: { name: string; detail: string; stage: Stage }[] = [
  { name: "Laura", detail: "Limpieza · jueves 11:00", stage: 0 },
  { name: "Pablo", detail: "Obra social · llamar", stage: 1 },
  { name: "Diego", detail: "Fuera de la zona", stage: 2 },
  { name: "Martín", detail: "Ortodoncia · presupuesto", stage: 0 },
  { name: "Julieta", detail: "Implante · consulta", stage: 1 },
  { name: "Carla", detail: "Solo quería horarios", stage: 2 },
  { name: "Valeria", detail: "Blanqueamiento", stage: 0 },
  { name: "Tomás", detail: "Pidió precios", stage: 1 },
  { name: "Ramiro", detail: "Número equivocado", stage: 2 },
  { name: "Lucía", detail: "Control · viernes 9:30", stage: 0 },
];

const BOARD = { x: 56, y: 250, w: 968, h: 1060 };
const COL_W = 294;
const CARD_H = 118;
const colX = (c: number) => 72 + c * 310;
const slotY = (s: number) => 470 + s * 132;
const slotOf = (i: number) => LEADS.slice(0, i).filter((l) => l.stage === LEADS[i].stage).length;
const LAURA = { x: colX(0) + COL_W / 2, y: slotY(0) + CARD_H / 2 };
const ZOOM = 2.3;
/** Donde queda la tarjeta de Laura en pantalla con el zoom puesto. */
const LAURA_SCREEN = { x: 540, y: 640 };

const Board: React.FC = () => {
  const frame = useCurrentFrame();
  const p = enter(frame, V10.board, 18) * leave(frame, V10.boardOut, 14);
  return (
    <div style={{ position: "absolute", left: BOARD.x, top: BOARD.y, width: BOARD.w, height: BOARD.h, opacity: p, translate: `0 ${(1 - p) * 40}px`, scale: String(0.97 + 0.03 * p) }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: 44, background: "rgba(14,12,34,0.78)", border: "1.5px solid rgba(255,255,255,0.12)", boxShadow: "0 40px 90px rgba(0,0,0,0.45)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 44, textAlign: "center", fontFamily: FONTS.display, fontWeight: 700, fontSize: 44, color: "#FFFFFF" }}>Contactos de hoy</div>
      {STAGES.map((s, c) => {
        const count = LEADS.filter((l, i) => l.stage === c && frame >= V10.deal + i * V10.dealStep + 16).length;
        return (
          <div key={s.label} style={{ position: "absolute", left: colX(c) - BOARD.x, top: 140, width: COL_W, display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
            <div style={{ width: 16, height: 16, borderRadius: 99, background: s.dot }} />
            <div style={{ fontFamily: FONTS.body, fontWeight: 600, fontSize: 27, color: "rgba(255,255,255,0.85)" }}>{s.label}</div>
            <div style={{ fontFamily: FONTS.body, fontWeight: 600, fontSize: 22, color: "rgba(255,255,255,0.7)", background: "rgba(255,255,255,0.1)", borderRadius: 99, padding: "2px 12px" }}>{count}</div>
          </div>
        );
      })}
      {[0, 1].map((k) => (
        <div key={k} style={{ position: "absolute", left: colX(k) - BOARD.x + COL_W + 7, top: 200, width: 2, height: BOARD.h - 240, background: "rgba(255,255,255,0.06)" }} />
      ))}
    </div>
  );
};

const CheckIcon: React.FC<{ size: number; color?: string }> = ({ size, color = "#FFFFFF" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M5 12.5 L10 17 L19 7" stroke={color} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const LeadCard: React.FC<{ i: number }> = ({ i }) => {
  const frame = useCurrentFrame();
  const lead = LEADS[i];
  const t0 = V10.deal + i * V10.dealStep;
  if (frame < t0) return null;
  const f = interpolate(frame, [t0, t0 + 16], [0, 1], { ...CLAMP, easing: EASE_IN_OUT });
  const tx = colX(lead.stage) + COL_W / 2;
  const ty = slotY(slotOf(i)) + CARD_H / 2;
  const x = STACK.x + (tx - STACK.x) * f;
  const y = STACK.y + (ty - STACK.y) * f - Math.sin(Math.PI * f) * 160;
  const rot = (1 - f) * (rng(i, 12) - 0.5) * 16;
  const out = leave(frame, V10.boardOut, 14);
  const isLaura = i === 0;
  const sent = isLaura && frame >= V10.sent;
  const ring = isLaura ? interpolate(frame, [V10.click1, V10.click1 + 4, V10.detailOut, V10.detailOut + 8], [0, 1, 1, 0], CLAMP) : 0;
  const st = STAGES[lead.stage];
  return (
    <div
      style={{
        position: "absolute",
        left: x - COL_W / 2,
        top: y - CARD_H / 2,
        width: COL_W,
        height: CARD_H,
        rotate: `${rot}deg`,
        scale: String((0.85 + 0.15 * f) * (isLaura ? 1 - 0.04 * interpolate(frame, [V10.click1, V10.click1 + 3, V10.click1 + 8], [0, 1, 0], CLAMP) : 1)),
        opacity: out,
        zIndex: 300 + i,
        borderRadius: 22,
        background: "rgba(32,30,58,0.97)",
        border: `1.5px solid ${ring > 0 ? `rgba(167,139,250,${0.3 + 0.7 * ring})` : "rgba(255,255,255,0.12)"}`,
        boxShadow: `0 ${8 + 20 * Math.sin(Math.PI * f)}px ${24 + 30 * Math.sin(Math.PI * f)}px rgba(0,0,0,0.45)${ring > 0 ? `, 0 0 ${30 * ring}px rgba(124,58,237,0.6)` : ""}`,
        padding: "16px 18px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 99, background: "linear-gradient(160deg, #6B7C85, #3B4A54)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONTS.body, fontWeight: 600, fontSize: 20, color: "#FFFFFF" }}>
          {lead.name[0]}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: FONTS.body, fontWeight: 600, fontSize: 24, color: "#FFFFFF", lineHeight: 1.1 }}>{lead.name}</div>
          <div style={{ fontFamily: FONTS.body, fontSize: 17, color: "rgba(255,255,255,0.6)", whiteSpace: "nowrap" }}>{lead.detail}</div>
        </div>
      </div>
      <div style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 6, fontFamily: FONTS.body, fontWeight: 600, fontSize: 16, color: "#FFFFFF", background: sent ? "rgba(124,58,237,0.95)" : st.chip, borderRadius: 99, padding: "4px 12px" }}>
        {sent ? <CheckIcon size={16} /> : null}
        {sent ? "Presupuesto enviado" : st.tag}
      </div>
    </div>
  );
};

/** Cámara del CRM: se acerca a la tarjeta de Laura y después vuelve. */
const CrmZoom: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const z =
    interpolate(frame, [V10.zoomIn, V10.zoomInEnd], [0, 1], { ...CLAMP, easing: EASE_IN_OUT }) *
    (1 - interpolate(frame, [V10.zoomOut, V10.zoomOutEnd], [0, 1], { ...CLAMP, easing: EASE_IN_OUT }));
  return (
    <AbsoluteFill style={{ transformOrigin: `${LAURA.x}px ${LAURA.y}px`, translate: `${(LAURA_SCREEN.x - LAURA.x) * z}px ${(LAURA_SCREEN.y - LAURA.y) * z}px`, scale: String(1 + (ZOOM - 1) * z) }}>
      {children}
    </AbsoluteFill>
  );
};

/** Ficha de Laura que se abre con el clic. */
const DetailSheet: React.FC = () => {
  const frame = useCurrentFrame();
  const p = enter(frame, V10.detail, 16) * leave(frame, V10.detailOut, 10);
  if (p <= 0) return null;
  const sent = frame >= V10.sent;
  const press = interpolate(frame, [V10.click2, V10.click2 + 3, V10.click2 + 8], [0, 1, 0], CLAMP);
  const row = (k: string, v: string) => (
    <div style={{ display: "flex", justifyContent: "space-between", fontFamily: FONTS.body, fontSize: 32, padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
      <span style={{ color: "rgba(255,255,255,0.55)" }}>{k}</span>
      <span style={{ color: "#FFFFFF", fontWeight: 500 }}>{v}</span>
    </div>
  );
  return (
    <div style={{ position: "absolute", left: 110, top: 900, width: 860, opacity: p, translate: `0 ${(1 - p) * 70}px` }}>
      <div style={{ borderRadius: 44, background: "rgba(22,20,44,0.96)", border: "1.5px solid rgba(255,255,255,0.14)", boxShadow: "0 40px 100px rgba(0,0,0,0.6)", padding: "40px 48px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 22, marginBottom: 16 }}>
          <div style={{ width: 80, height: 80, borderRadius: 99, background: "linear-gradient(160deg, #6B7C85, #3B4A54)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONTS.body, fontWeight: 600, fontSize: 36, color: "#FFFFFF" }}>L</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 42, color: "#FFFFFF" }}>Laura</div>
            <div style={{ fontFamily: FONTS.body, fontSize: 26, color: "rgba(255,255,255,0.55)" }}>Llegó por WhatsApp · 21:40</div>
          </div>
        </div>
        {row("Consultó por", "Limpieza dental")}
        {row("Turno", "Jueves 11:00")}
        {row("Estado", "Calificada")}
        <div style={{ display: "flex", gap: 20, marginTop: 34 }}>
          <div style={{ flex: 1, textAlign: "center", borderRadius: 999, padding: "24px 0", fontFamily: FONTS.body, fontWeight: 600, fontSize: 30, color: "rgba(255,255,255,0.85)", background: "rgba(255,255,255,0.1)" }}>Contactar</div>
          <div
            style={{
              flex: 1.35,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              borderRadius: 999,
              padding: "24px 0",
              fontFamily: FONTS.body,
              fontWeight: 600,
              fontSize: 30,
              color: "#FFFFFF",
              background: "linear-gradient(160deg, #8B5CF6 0%, #7C3AED 55%, #6D28D9 100%)",
              boxShadow: "0 14px 34px rgba(76,29,149,0.45)",
              scale: String(1 - 0.05 * press),
            }}
          >
            {sent ? <CheckIcon size={32} /> : null}
            {sent ? "Presupuesto enviado" : "Enviar presupuesto"}
          </div>
        </div>
      </div>
    </div>
  );
};

/** Cursor con clic: flecha blanca y onda en la punta. */
const CURSOR_KEYS: [number, number, number][] = [
  [V10.cursorIn, 1010, 1820],
  [V10.click1 - 6, 560, 668],
  [V10.click1 + 8, 560, 668],
  [V10.click2 - 8, 752, 1402],
  [V10.click2 + 10, 752, 1402],
  [V10.detailOut + 4, 1010, 1820],
];

const Cursor: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < V10.cursorIn || frame > V10.detailOut + 4) return null;
  let x = CURSOR_KEYS[0][1];
  let y = CURSOR_KEYS[0][2];
  for (let k = 0; k < CURSOR_KEYS.length - 1; k++) {
    const [f0, x0, y0] = CURSOR_KEYS[k];
    const [f1, x1, y1] = CURSOR_KEYS[k + 1];
    if (frame >= f0 && frame <= f1) {
      const e = interpolate(frame, [f0, f1], [0, 1], { ...CLAMP, easing: EASE_IN_OUT });
      x = x0 + (x1 - x0) * e;
      y = y0 + (y1 - y0) * e;
    }
  }
  const o = enter(frame, V10.cursorIn, 6) * leave(frame, V10.detailOut - 4, 8);
  const click = (at: number) => interpolate(frame, [at, at + 3, at + 8], [0, 1, 0], CLAMP);
  const press = Math.max(click(V10.click1), click(V10.click2));
  const ripple = (at: number) => {
    const r = interpolate(frame, [at, at + 16], [0, 1], { ...CLAMP, easing: EASE_OUT });
    return r > 0 && r < 1 ? <div key={at} style={{ position: "absolute", left: -60 * r, top: -60 * r, width: 120 * r, height: 120 * r, borderRadius: 999, border: `3px solid rgba(255,255,255,${0.8 * (1 - r)})` }} /> : null;
  };
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: o, zIndex: 1000 }}>
      {ripple(V10.click1)}
      {ripple(V10.click2)}
      <svg width={70} height={84} viewBox="0 0 20 24" style={{ position: "absolute", left: -6, top: -4, scale: String(1 - 0.15 * press), transformOrigin: "6px 4px", filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.5))" }}>
        <path d="M2 1 L2 19 L6.5 15 L9.5 22 L12.5 20.7 L9.6 14 L16 14 Z" fill="#FFFFFF" stroke="#111" strokeWidth={1.1} strokeLinejoin="round" />
      </svg>
    </div>
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
            <CrmZoom>
              {frame >= V10.board - 2 && frame < V10.boardOut + 16 ? <Board /> : null}
              {frame >= V10.ask - 2 && frame < V10.boardOut + 16 ? <ChatGrid /> : null}
              {frame >= V10.deal && frame < V10.boardOut + 16 ? LEADS.map((_, i) => <LeadCard key={i} i={i} />) : null}
            </CrmZoom>
            <Headline lines={["Todo en simultáneo."]} start={V10.gridTitle} exitAt={V10.stack - 4} y={280} size={80} />
            <AbsoluteFill style={{ background: "rgba(4,3,14,0.62)", opacity: enter(frame, V10.detail, 12) * leave(frame, V10.detailOut, 10) }} />
            <DetailSheet />
            <Cursor />

            <Headline lines={["Ninguna consulta", { text: "se pierde.", italic: true }]} start={V10.claim} exitAt={V10.end - 14} y={900} size={104} />
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
