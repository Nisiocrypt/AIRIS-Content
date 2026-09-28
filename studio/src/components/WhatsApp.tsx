import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { FONTS } from "../brand/tokens";
import { CLAMP, enter, leave } from "../lib/anim";

/**
 * Chat con el lenguaje visual de WhatsApp (modo oscuro), para que el dueño lo reconozca al
 * instante. Solo el estilo de la interfaz: nunca el logo ni el nombre de WhatsApp.
 */
export const WA = {
  wallpaper: "#0B141A",
  header: "#202C33",
  incoming: "#202C33",
  outgoing: "#005C4B",
  text: "#E9EDEF",
  meta: "rgba(233,237,239,0.6)",
  tick: "#53BDEB",
  unread: "#25D366",
};

/** Fondo del chat: base oscura con la textura de garabatos insinuada (puntos y trazos). */
export const waWallpaper: React.CSSProperties = {
  backgroundColor: WA.wallpaper,
  backgroundImage: [
    "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.035) 0 3px, transparent 4px)",
    "radial-gradient(circle at 70% 65%, rgba(255,255,255,0.03) 0 5px, transparent 6px)",
    "radial-gradient(circle at 45% 85%, rgba(255,255,255,0.03) 0 2px, transparent 3px)",
    "linear-gradient(35deg, transparent 46%, rgba(255,255,255,0.025) 47% 49%, transparent 50%)",
  ].join(","),
  backgroundSize: "140px 140px, 190px 190px, 110px 110px, 160px 160px",
};

/** Doble tilde azul (leído). */
export const Ticks: React.FC<{ size: number; color?: string }> = ({ size, color = WA.tick }) => (
  <svg width={size * 1.25} height={size * 0.8} viewBox="0 0 20 13" style={{ display: "inline-block", verticalAlign: "middle" }}>
    <path d="M1 7 L5 11 L13 2" stroke={color} strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7 10.5 L8 11 L18 2" stroke={color} strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const WABubble: React.FC<{
  text: string;
  out?: boolean;
  time?: string;
  start: number;
  exitAt?: number;
  fontSize?: number;
  maxWidth?: number;
}> = ({ text, out = false, time = "9:41", start, exitAt, fontSize = 40, maxWidth = 760 }) => {
  const frame = useCurrentFrame();
  const p = enter(frame, start, 12);
  const q = leave(frame, exitAt, 10);
  const bg = out ? WA.outgoing : WA.incoming;
  const tail = fontSize * 0.42;
  return (
    <div
      style={{
        display: "flex",
        justifyContent: out ? "flex-end" : "flex-start",
        width: "100%",
        opacity: p * q,
        translate: `0 ${(1 - p) * 20}px`,
        scale: String(interpolate(p, [0, 1], [0.95, 1])),
        transformOrigin: out ? "right top" : "left top",
      }}
    >
      <div style={{ position: "relative", maxWidth }}>
        {/* colita del globo, arriba del lado del que habla */}
        <div
          style={{
            position: "absolute",
            top: 0,
            [out ? "right" : "left"]: -tail * 0.7,
            width: 0,
            height: 0,
            borderTop: `${tail}px solid ${bg}`,
            [out ? "borderRight" : "borderLeft"]: `${tail}px solid transparent`,
          }}
        />
        <div
          style={{
            background: bg,
            color: WA.text,
            fontFamily: FONTS.body,
            fontWeight: 400,
            fontSize,
            lineHeight: 1.3,
            padding: `${fontSize * 0.28}px ${fontSize * 0.38}px ${fontSize * 0.22}px`,
            borderRadius: fontSize * 0.3,
            [out ? "borderTopRightRadius" : "borderTopLeftRadius"]: 0,
            boxShadow: "0 2px 3px rgba(0,0,0,0.25)",
          }}
        >
          {text}
          <span style={{ display: "inline-flex", alignItems: "center", gap: fontSize * 0.12, float: "right", marginLeft: fontSize * 0.4, marginTop: fontSize * 0.5, fontSize: fontSize * 0.46, color: WA.meta }}>
            {time}
            {out ? <Ticks size={fontSize * 0.5} /> : null}
          </span>
        </div>
      </div>
    </div>
  );
};

/** Barra superior del chat: flecha, foto, nombre y estado ("en línea" / "escribiendo…"). */
export const WAHeader: React.FC<{ name: string; status?: string; scale?: number; unread?: number; badge?: string }> = ({
  name,
  status = "en línea",
  scale = 1,
  unread = 0,
  badge = "1",
}) => (
  <div style={{ display: "flex", alignItems: "center", gap: 22 * scale, height: 130 * scale, padding: `0 ${28 * scale}px`, background: WA.header }}>
    <svg width={30 * scale} height={30 * scale} viewBox="0 0 24 24">
      <path d="M15 4 L7 12 L15 20" stroke={WA.text} strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <div
      style={{
        width: 84 * scale,
        height: 84 * scale,
        borderRadius: 99,
        background: "linear-gradient(160deg, #6B7C85, #3B4A54)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONTS.body,
        fontWeight: 600,
        fontSize: 38 * scale,
        color: "#FFFFFF",
        flexShrink: 0,
      }}
    >
      {name[0]}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontFamily: FONTS.body, fontWeight: 600, fontSize: 40 * scale, color: WA.text, lineHeight: 1.15 }}>{name}</div>
      <div style={{ fontFamily: FONTS.body, fontWeight: 400, fontSize: 28 * scale, color: status.startsWith("escrib") ? WA.unread : WA.meta }}>{status}</div>
    </div>
    <div
      style={{
        minWidth: 56 * scale,
        height: 56 * scale,
        borderRadius: 99,
        background: WA.unread,
        color: "#0B141A",
        fontFamily: FONTS.body,
        fontWeight: 700,
        fontSize: 30 * scale,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: unread,
        scale: String(0.6 + 0.4 * unread),
      }}
    >
      {badge}
    </div>
  </div>
);

/** Estado del encabezado según el momento: en línea → escribiendo… → en línea. */
export const waStatus = (frame: number, typingFrom: number, typingTo: number) =>
  frame >= typingFrom && frame < typingTo ? "escribiendo…" : "en línea";

export const useUnread = (at: number) => {
  const frame = useCurrentFrame();
  return interpolate(frame, [at - 4, at + 4], [1, 0], CLAMP);
};
