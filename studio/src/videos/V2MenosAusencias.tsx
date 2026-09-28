import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS, EASE_OUT, FONTS } from "../brand/tokens";
import { CLAMP, enter, leave } from "../lib/anim";
import { Grain, PastelBackground } from "../components/Backgrounds";
import { Camera } from "../components/Camera";
import { Glass } from "../components/Glass";
import { Body, Footnote, Headline } from "../components/Text";
import { ActionChip, Center } from "../components/Cards";
import { EndCard } from "../components/EndCard";

export const V2_DURATION = 900;

export const V2 = {
  count: 0,
  grid: 100,
  empties: 150,
  what: 232,
  chip1: 280,
  chip2: 316,
  chip3: 352,
  pause: 440,
  stat: 474,
  drop: 512,
  reprog: 600,
  measure: 710,
  end: 804,
};

const fmt = (v: number) => v.toFixed(1).replace(".", ",") + "%";

/** Número grande que cuenta con desaceleración. */
const Counter: React.FC<{ from: number; to: number; start: number; dur: number; size: number; color?: string }> = ({
  from,
  to,
  start,
  dur,
  size,
  color = COLORS.ink,
}) => {
  const frame = useCurrentFrame();
  const v = interpolate(frame, [start, start + dur], [from, to], { ...CLAMP, easing: EASE_OUT });
  return (
    <div style={{ fontFamily: FONTS.display, fontWeight: 900, fontSize: size, color, letterSpacing: "-0.03em", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
      {fmt(v)}
    </div>
  );
};

const EMPTY = new Set([2, 7, 9, 14, 17]);
const HOURS = ["9:00", "10:00", "11:00", "12:00", "14:00"];

/** Agenda de 20 turnos: se llena y después 5 quedan vacíos. */
const AgendaGrid: React.FC<{ start: number; emptyAt: number; exitAt: number }> = ({ start, emptyAt, exitAt }) => {
  const frame = useCurrentFrame();
  const p = enter(frame, start, 18) * leave(frame, exitAt, 12);
  let k = 0;
  return (
    <div style={{ opacity: p, translate: `0 ${(1 - enter(frame, start, 18)) * 30}px` }}>
      <Glass variant="light" radius={40} style={{ padding: 34, display: "grid", gridTemplateColumns: "repeat(4, 180px)", gap: 16 }}>
        {Array.from({ length: 20 }).map((_, i) => {
          const fill = enter(frame, start + 6 + i * 1.6, 12);
          const isEmpty = EMPTY.has(i);
          const e = isEmpty ? enter(frame, emptyAt + (k++) * 7, 12) : 0;
          return (
            <div
              key={i}
              style={{
                height: 96,
                borderRadius: 22,
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `2px dashed rgba(124,58,237,${0.45 * e})`,
                background: `rgba(124,58,237,${(0.1 + 0.8 * fill) * (1 - e)})`,
                boxShadow: e < 1 ? `0 8px 20px rgba(124,58,237,${0.25 * fill * (1 - e)})` : undefined,
                scale: String(interpolate(fill, [0, 1], [0.85, 1]) - 0.04 * Math.sin(Math.min(e, 1) * Math.PI)),
              }}
            >
              <div style={{ fontFamily: FONTS.body, fontWeight: 600, fontSize: 28, color: e > 0.5 ? "rgba(124,58,237,0.55)" : "#FFFFFF", opacity: Math.max(fill, 0.3) }}>
                {HOURS[Math.floor(i / 4)]}
              </div>
            </div>
          );
        })}
      </Glass>
    </div>
  );
};

/** Tarjeta antes y después, con denominadores visibles. */
const StatCard: React.FC<{ start: number; drop: number; exitAt: number }> = ({ start, drop, exitAt }) => {
  const frame = useCurrentFrame();
  const p = enter(frame, start, 20) * leave(frame, exitAt, 12);
  const bar1 = interpolate(frame, [start + 8, start + 30], [0, 0.244], { ...CLAMP, easing: EASE_OUT });
  const bar2 = interpolate(frame, [drop, drop + 46], [0.244, 0.026], { ...CLAMP, easing: EASE_OUT });
  const row2 = enter(frame, drop - 10, 16);
  const flash = interpolate(frame, [drop + 44, drop + 50, drop + 70], [0, 1, 0], CLAMP);
  const Bar: React.FC<{ v: number; color: string }> = ({ v, color }) => (
    <div style={{ width: 640, height: 22, borderRadius: 22, background: "rgba(124,58,237,0.10)", overflow: "hidden" }}>
      <div style={{ width: `${(v / 0.3) * 100}%`, height: "100%", borderRadius: 22, background: color }} />
    </div>
  );
  return (
    <div style={{ opacity: p, translate: `0 ${(1 - enter(frame, start, 20)) * 30}px` }}>
      <Glass variant="light" radius={48} style={{ width: 820, padding: "56px 60px", display: "flex", flexDirection: "column", alignItems: "center", gap: 18, textAlign: "center" }}>
        <div style={{ fontFamily: FONTS.display, fontWeight: 900, fontSize: 132, color: "rgba(23,18,35,0.45)", letterSpacing: "-0.03em", lineHeight: 1 }}>24,4%</div>
        <Bar v={bar1} color="rgba(23,18,35,0.28)" />
        <div style={{ fontFamily: FONTS.body, fontWeight: 500, fontSize: 30, color: "rgba(23,18,35,0.6)" }}>Antes · 52 de 213 turnos</div>
        <div style={{ height: 2, width: 640, background: "rgba(124,58,237,0.15)", margin: "22px 0" }} />
        <div style={{ opacity: row2, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
          <div style={{ position: "relative" }}>
            <div
              style={{
                position: "absolute",
                inset: -40,
                borderRadius: 200,
                background: "radial-gradient(circle, rgba(103,232,249,0.55) 0%, rgba(103,232,249,0) 70%)",
                opacity: flash,
              }}
            />
            <Counter from={24.4} to={2.6} start={drop} dur={46} size={176} />
          </div>
          <Bar v={bar2} color="linear-gradient(90deg, #67E8F9, #7C3AED)" />
          <div style={{ fontFamily: FONTS.body, fontWeight: 600, fontSize: 32, color: COLORS.ink }}>Con AIRIS · 12 de 462 turnos</div>
        </div>
      </Glass>
    </div>
  );
};

export const V2MenosAusencias: React.FC = () => {
  const frame = useCurrentFrame();
  const hook = enter(frame, V2.count - 8, 14) * leave(frame, 88, 12);
  return (
    <AbsoluteFill style={{ background: COLORS.paper }}>
      <Camera dur={V2_DURATION} from={1.02} to={1.06} sway={8} seed="v2bg">
        <PastelBackground />
      </Camera>
      <Camera dur={V2_DURATION} from={1} to={1.04} sway={4} seed="v2fg">
        {/* Gancho: el número */}
        <Center y={700} style={{ opacity: hook, translate: `0 ${(1 - enter(frame, V2.count - 8, 14)) * 40}px` }}>
          <Counter from={0} to={24.4} start={V2.count} dur={46} size={250} />
        </Center>
        <Headline lines={["de los turnos", { text: "eran ausencias.", italic: true }]} start={24} exitAt={86} y={990} size={96} color={COLORS.ink} />
        <Body text="Clínica odontológica · caso documentado" start={44} exitAt={86} y={1190} color={COLORS.ink} size={32} opacity={0.6} />

        {/* Sillón vacío */}
        <Center y={760}>
          <AgendaGrid start={V2.grid} emptyAt={V2.empties} exitAt={V2.what - 8} />
        </Center>
        <Headline lines={["Cada ausencia", { text: "es un sillón vacío.", italic: true }]} start={V2.empties + 4} exitAt={V2.what - 8} y={1300} size={88} color={COLORS.ink} />

        {/* Qué cambió */}
        <Headline lines={["AIRIS empezó a", { text: "confirmar cada turno.", italic: true }]} start={V2.what + 6} exitAt={V2.pause - 12} y={640} size={92} color={COLORS.ink} />
        <Center y={1110} style={{ gap: 30 }}>
          <ActionChip text="Recordatorio 48 h antes" start={V2.chip1} exitAt={V2.pause - 12} theme="light" size={40} tone="info" />
          <ActionChip text="Confirmación por WhatsApp" start={V2.chip2} exitAt={V2.pause - 12} theme="light" size={40} tone="info" />
          <ActionChip text="Reprogramación en el mismo chat" start={V2.chip3} exitAt={V2.pause - 12} theme="light" size={40} tone="info" />
        </Center>

        {/* Respiro */}
        <Headline lines={["Con AIRIS:"]} start={V2.pause} exitAt={V2.stat - 12} y={900} size={110} color={COLORS.ink} />

        {/* Dato */}
        <Center y={860}>
          <StatCard start={V2.stat} drop={V2.drop} exitAt={V2.measure - 8} />
        </Center>
        <Body text="7 de las 12 ausencias se reprogramaron." start={V2.reprog} exitAt={V2.measure - 8} y={1360} color={COLORS.ink} size={36} opacity={0.8} weight={600} />
        {frame >= V2.stat && frame < V2.measure ? <Footnote text="Caso individual documentado. No es una garantía." start={V2.stat + 20} color={COLORS.ink} /> : null}

        {/* Cierre de idea */}
        <Headline lines={["Medir antes.", { text: "Automatizar después.", italic: true }]} start={V2.measure + 6} exitAt={V2.end - 14} y={900} size={100} color={COLORS.ink} />
      </Camera>

      <AbsoluteFill>
        {frame >= V2.end - 2 ? (
          <EndCard
            theme="light"
            start={V2.end}
            tagline={["Tu agenda,", { text: "confirmada.", italic: true }]}
            cta="Hablá con un humano (por ahora)"
          />
        ) : null}
      </AbsoluteFill>
      <Grain opacity={0.05} />
    </AbsoluteFill>
  );
};
