import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { EASE_OUT, FONTS } from "../brand/tokens";
import { CLAMP, enter } from "../lib/anim";
import { Grain, NightBackground, Vignette } from "../components/Backgrounds";
import { Camera } from "../components/Camera";
import { Body, Headline } from "../components/Text";
import { Center, ResultCard } from "../components/Cards";
import { Bubble } from "../components/Chat";
import { EndCard } from "../components/EndCard";
import { LightStrands } from "../components/LightStrands";
import { Glass } from "../components/Glass";

export const V9_DURATION = 600;

export const V9 = {
  bar: 4,
  promise: 50,
  weeks: 95,
  bot1: 135,
  patient1: 160,
  bot2: 185,
  anoto: 215,
  genial: 275,
  black: 297,
  turn: 305,
  patient2: 356,
  airis: 384,
  result: 412,
  armamos: 456,
  end: 512,
};

const DEADPAN = "#F4F4F5";

/** Golpe de escala en cada corte seco. */
const Snap: React.FC<{ at: number; children: React.ReactNode }> = ({ at, children }) => {
  const frame = useCurrentFrame();
  const s = interpolate(frame, [at, at + 6], [1.04, 1], { ...CLAMP, easing: EASE_OUT });
  return <AbsoluteFill style={{ scale: String(s) }}>{children}</AbsoluteFill>;
};

/** "Probé ▇▇▇▇▇." con el nombre tachado por una barra (el chiste: no importa cuál). */
const CensoredLine: React.FC = () => {
  const frame = useCurrentFrame();
  const bar = interpolate(frame, [V9.bar, V9.bar + 6], [0, 1], { ...CLAMP, easing: EASE_OUT });
  const size = 124;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 26, fontFamily: FONTS.display, fontWeight: 800, fontSize: size, color: DEADPAN, letterSpacing: "-0.02em" }}>
      <span>Probé</span>
      <span style={{ display: "inline-block", width: 330, height: size * 0.74, borderRadius: 10, background: DEADPAN, scale: `${bar} 1`, transformOrigin: "left center", marginTop: size * 0.06 }} />
      <span style={{ marginLeft: -18 }}>.</span>
    </div>
  );
};

/** Ícono genérico de app pixelado (no es el logo de nadie). */
const MosaicIcon: React.FC<{ size?: number }> = ({ size = 300 }) => {
  const n = 8;
  const cell = size / n;
  let seed = 7;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.22, overflow: "hidden", display: "grid", gridTemplateColumns: `repeat(${n}, ${cell}px)`, boxShadow: "0 30px 80px rgba(0,0,0,0.5)" }}>
      {Array.from({ length: n * n }).map((_, i) => {
        const x = i % n;
        const y = Math.floor(i / n);
        const d = Math.hypot(x - 3.5, y - 3.2) / 5;
        const l = 30 + 38 * (1 - d) + rnd() * 16;
        return <div key={i} style={{ width: cell, height: cell, background: `hsl(222, 10%, ${l}%)` }} />;
      })}
    </div>
  );
};

/** Botones del menú del bot (la respuesta de siempre). */
const OptionsRow: React.FC<{ start: number }> = ({ start }) => {
  const frame = useCurrentFrame();
  const p = enter(frame, start, 10);
  return (
    <div style={{ display: "flex", gap: 14, justifyContent: "flex-end", width: "100%", opacity: p, translate: `0 ${(1 - p) * 14}px` }}>
      {["1. Precios", "2. Horarios", "3. Ubicación"].map((o) => (
        <Glass key={o} variant="grey" radius={999} style={{ padding: "14px 24px", fontFamily: FONTS.body, fontWeight: 600, fontSize: 28, color: "rgba(255,255,255,0.7)" }}>
          {o}
        </Glass>
      ))}
    </div>
  );
};

type Shot = { from: number; to: number; node: React.ReactNode };

const SHOTS: Shot[] = [
  {
    from: 0,
    to: V9.promise,
    node: (
      <>
        <Center y={660}>
          <CensoredLine />
        </Center>
        <Center y={1090}>
          <MosaicIcon />
        </Center>
        <Body text="No importa cuál." y={1360} color={DEADPAN} size={40} opacity={0.7} start={-10} />
      </>
    ),
  },
  { from: V9.promise, to: V9.weeks, node: <Headline lines={["Me prometió", { text: "automatizar todo.", italic: true }]} start={V9.promise - 14} y={900} size={104} color={DEADPAN} inDur={12} /> },
  { from: V9.weeks, to: V9.bot1, node: <Headline lines={["Tres semanas", "configurándolo."]} start={V9.weeks - 14} y={900} size={104} color={DEADPAN} inDur={12} /> },
  {
    from: V9.bot1,
    to: V9.anoto,
    node: (
      <Center y={930} style={{ gap: 26, width: 900, left: 90 }}>
        <Bubble from="bot" label="Bot" text="No entendí tu mensaje. Elegí una opción:" start={V9.bot1 - 12} muted side="right" fontSize={40} />
        <OptionsRow start={V9.bot1 - 6} />
        <Bubble from="patient" label="Paciente" text="Quiero mover mi turno." start={V9.patient1} muted fontSize={40} />
        <Bubble from="bot" label="Bot" text="No entendí tu mensaje." start={V9.bot2} muted side="right" fontSize={40} />
      </Center>
    ),
  },
  { from: V9.anoto, to: V9.genial, node: <Headline lines={["Y los turnos", { text: "los seguía anotando yo.", italic: true }]} start={V9.anoto - 14} y={900} size={100} color={DEADPAN} inDur={12} /> },
  { from: V9.genial, to: V9.black, node: <Headline lines={["Genial."]} start={V9.genial - 14} y={900} size={150} color={DEADPAN} inDur={10} stagger={0} /> },
];

export const V9Probe: React.FC = () => {
  const frame = useCurrentFrame();
  const shot = SHOTS.find((s) => frame >= s.from && frame < s.to);
  const burst = interpolate(frame, [V9.turn, V9.turn + 8, V9.turn + 45], [1.8, 1.2, 0.7], { ...CLAMP, easing: EASE_OUT });
  return (
    <AbsoluteFill style={{ background: "#060607" }}>
      {/* Primera mitad: confesión cruda, cortes secos */}
      {shot ? (
        <Snap at={shot.from}>
          <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 60% at 50% 45%, #141417 0%, #060607 70%)" }} />
          {shot.node}
        </Snap>
      ) : null}

      {/* Segunda mitad: entra la marca */}
      {frame >= V9.turn ? (
        <>
          <Camera dur={V9_DURATION - V9.turn} start={V9.turn} from={1.04} to={1.07} sway={8} seed="v9bg">
            <NightBackground intensity={1.15} />
            <LightStrands opacity={interpolate(frame, [V9.turn, V9.turn + 6, V9.patient2, V9.end], [1, 0.9, 0.35, 0.3], CLAMP)} energy={burst} centerY={0.76} spread={320} speed={1.2} />
          </Camera>
          <Camera dur={V9_DURATION - V9.turn} start={V9.turn} from={1} to={1.04} sway={5} seed="v9fg">
            <Headline lines={["No necesitabas", { text: "otro bot.", italic: true }]} start={V9.turn} exitAt={V9.patient2 - 10} y={900} size={110} inDur={12} />
            <Center y={780} style={{ gap: 26, width: 900, left: 90 }}>
              <Bubble from="patient" label="Paciente" text="Quiero mover mi turno." start={V9.patient2} exitAt={V9.armamos - 10} fontSize={40} />
              <Bubble from="airis" label="AIRIS" text="Listo, te pasé al viernes 10:30." start={V9.airis} exitAt={V9.armamos - 10} fontSize={40} />
            </Center>
            <Center y={1220}>
              <ResultCard title="Turno reprogramado" subtitle="Viernes 10:30" start={V9.result} exitAt={V9.armamos - 10} />
            </Center>
            <Headline lines={["Lo armamos", { text: "y lo mantenemos nosotros.", italic: true }]} start={V9.armamos} exitAt={V9.end - 8} y={900} size={96} />
          </Camera>
        </>
      ) : null}

      <AbsoluteFill>
        {frame >= V9.end - 2 ? (
          <EndCard theme="dark" start={V9.end} tagline={["Menos bots.", { text: "Más turnos resueltos.", italic: true }]} cta="Hablá con un humano (por ahora)" />
        ) : null}
      </AbsoluteFill>
      <Vignette strength={frame < V9.turn ? 0.65 : 0.45} />
      <Grain opacity={frame < V9.turn ? 0.12 : 0.07} />
    </AbsoluteFill>
  );
};
