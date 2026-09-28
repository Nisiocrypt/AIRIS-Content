import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { MessageCircle, Phone, PhoneForwarded, PhoneIncoming, PhoneOff, Voicemail } from "lucide-react";
import { COLORS, EASE_OUT, FONTS } from "../brand/tokens";
import { CLAMP, enter, leave } from "../lib/anim";
import { Glass, GlassVariant, ink } from "./Glass";
import { DrawCheck, IconDisc } from "./Icons";
import { LambdaAvatar } from "./Logo";
import { LightStrands } from "./LightStrands";

type Theme = "dark" | "light";

const appear = (frame: number, start: number, exitAt?: number, dur = 16) => {
  const p = enter(frame, start, dur);
  const q = leave(frame, exitAt, 10);
  return {
    opacity: p * q,
    translate: `0 ${(1 - p) * 34 - (1 - q) * 20}px`,
    scale: String(interpolate(p, [0, 1], [0.96, 1])),
  } as React.CSSProperties;
};

/** Tarjeta de resultado: check que se dibuja + título + detalle, centrados. */
export const ResultCard: React.FC<{
  title: string;
  subtitle?: string;
  start: number;
  exitAt?: number;
  theme?: Theme;
  width?: number;
  checkAt?: number;
  variant?: GlassVariant;
}> = ({ title, subtitle, start, exitAt, theme = "dark", width = 760, checkAt, variant }) => {
  const frame = useCurrentFrame();
  const t = ink(theme);
  return (
    <div style={{ width, ...appear(frame, start, exitAt) }}>
      <Glass
        variant={variant ?? (theme === "dark" ? "dark" : "light")}
        radius={36}
        style={{ padding: "44px 48px", display: "flex", flexDirection: "column", alignItems: "center", gap: 18, textAlign: "center" }}
      >
        <DrawCheck size={84} start={checkAt ?? start + 6} />
        <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 46, color: t.main, lineHeight: 1.1 }}>{title}</div>
        {subtitle ? (
          <div style={{ fontFamily: FONTS.body, fontWeight: 500, fontSize: 32, color: t.soft }}>{subtitle}</div>
        ) : null}
      </Glass>
    </div>
  );
};

export type ChipTone = "done" | "info" | "muted" | "alert" | "fail";

/** Tarjetita de acción (lo que el sistema va haciendo). */
export const ActionChip: React.FC<{
  text: string;
  start: number;
  exitAt?: number;
  tone?: ChipTone;
  theme?: Theme;
  size?: number;
}> = ({ text, start, exitAt, tone = "done", theme = "dark", size = 32 }) => {
  const frame = useCurrentFrame();
  const t = ink(theme);
  const icon =
    tone === "done" ? (
      <DrawCheck size={size * 1.35} start={start + 4} />
    ) : tone === "fail" ? (
      <IconDisc size={size * 1.35} bg="rgba(255,255,255,0.14)" glow={false}>
        <svg width={size * 0.7} height={size * 0.7} viewBox="0 0 24 24">
          <path d="M6 6 L18 18 M18 6 L6 18" stroke="rgba(255,255,255,0.75)" strokeWidth={3} strokeLinecap="round" />
        </svg>
      </IconDisc>
    ) : tone === "alert" ? (
      <IconDisc size={size * 1.35} bg="rgba(251,191,36,0.9)" glow={false}>
        <div style={{ fontFamily: FONTS.display, fontWeight: 900, fontSize: size * 0.8, color: "#3B2600" }}>!</div>
      </IconDisc>
    ) : (
      <IconDisc size={size * 1.35} bg={tone === "muted" ? "rgba(255,255,255,0.14)" : "rgba(124,58,237,0.9)"} glow={false}>
        <div style={{ width: size * 0.36, height: size * 0.36, borderRadius: 99, background: "#FFFFFF", opacity: 0.9 }} />
      </IconDisc>
    );
  const variant: GlassVariant = tone === "muted" || tone === "fail" ? "grey" : theme === "dark" ? "dark" : "light";
  return (
    <div style={{ display: "flex", justifyContent: "center", ...appear(frame, start, exitAt, 14) }}>
      <Glass variant={variant} radius={999} style={{ display: "inline-flex", alignItems: "center", gap: 18, padding: `${size * 0.42}px ${size * 0.95}px ${size * 0.42}px ${size * 0.45}px` }}>
        {icon}
        <div
          style={{
            fontFamily: FONTS.body,
            fontWeight: 600,
            fontSize: size,
            color: tone === "muted" || tone === "fail" ? "rgba(255,255,255,0.7)" : t.main,
            whiteSpace: "nowrap",
          }}
        >
          {text}
        </div>
      </Glass>
    </div>
  );
};

/** Anillos finos del timbre, sincronizados al sonido. */
const RingRings: React.FC<{ size: number; from: number; to: number; color?: string }> = ({ size, from, to, color = "167,139,250" }) => {
  const frame = useCurrentFrame();
  if (frame < from || frame > to) return null;
  const fade = Math.min(1, (to - frame) / 8);
  return (
    <>
      {[0, 0.5].map((k) => {
        const ph = (((frame - from) / 36 + k) % 1 + 1) % 1;
        const s = 1 + ph * 1.25;
        return (
          <div
            key={k}
            style={{
              position: "absolute",
              width: size,
              height: size,
              borderRadius: size,
              border: `2px solid rgba(${color},${(1 - ph) * 0.55 * fade})`,
              scale: String(s),
            }}
          />
        );
      })}
    </>
  );
};

export type CallStatus = "incoming" | "active" | "ended" | "transfer";

/**
 * Tarjeta de llamada propia de AIRIS (inspirada en iOS, no una copia). Todo centrado.
 */
export const CallCard: React.FC<{
  status: CallStatus;
  statusText: string;
  caller?: string;
  number?: string;
  start: number;
  exitAt?: number;
  ring?: [number, number];
  energy?: number;
  width?: number;
  footer?: string;
  theme?: Theme;
  variant?: GlassVariant;
  compact?: boolean;
}> = ({
  status,
  statusText,
  caller = "Paciente",
  number = "+54 9 11 •••• 4821",
  start,
  exitAt,
  ring,
  energy = 0,
  width = 760,
  footer,
  theme = "dark",
  variant,
  compact = false,
}) => {
  const frame = useCurrentFrame();
  const t = ink(theme);
  const icon =
    status === "incoming" ? (
      <PhoneIncoming size={40} color="#FFFFFF" strokeWidth={2} />
    ) : status === "ended" ? (
      <PhoneOff size={38} color="#FFFFFF" strokeWidth={2} />
    ) : status === "transfer" ? (
      <PhoneForwarded size={38} color="#FFFFFF" strokeWidth={2} />
    ) : (
      <Phone size={38} color="#FFFFFF" strokeWidth={2} />
    );
  const discBg =
    status === "ended" ? "rgba(255,255,255,0.16)" : "radial-gradient(circle at 30% 25%, #A78BFA 0%, #7C3AED 60%, #5B21B6 100%)";
  const strandsOn = status === "active" || status === "transfer";
  return (
    <div style={{ width, ...appear(frame, start, exitAt, 18) }}>
      <Glass
        variant={variant ?? (theme === "dark" ? "dark" : "light")}
        radius={44}
        style={{
          padding: compact ? "30px 36px" : "48px 44px 44px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: compact ? 10 : 16,
          textAlign: "center",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: 96, height: 96 }}>
          {ring ? <RingRings size={96} from={ring[0]} to={ring[1]} /> : null}
          <IconDisc size={compact ? 80 : 96} bg={discBg}>
            {icon}
          </IconDisc>
        </div>
        <div style={{ fontFamily: FONTS.body, fontWeight: 600, fontSize: 30, color: t.soft, marginTop: 6 }}>{statusText}</div>
        {!compact ? (
          <>
            <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 54, color: t.main, lineHeight: 1.05 }}>{caller}</div>
            <div style={{ fontFamily: FONTS.body, fontWeight: 500, fontSize: 28, color: t.faint, letterSpacing: "0.02em" }}>{number}</div>
          </>
        ) : null}
        {strandsOn ? (
          <div style={{ position: "relative", width: "100%", height: compact ? 120 : 170, marginTop: 8, borderRadius: 28, overflow: "hidden", background: "rgba(2,6,24,0.55)" }}>
            <LightStrands width={width - 88} height={compact ? 120 : 170} count={40} angle={0} spread={34 + energy * 40} energy={0.2 + energy * 1.4} speed={1.8} opacity={0.4 + energy * 0.8} thickness={1.1} ampScale={3.2 + energy * 3} />
          </div>
        ) : null}
        {footer ? (
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 10 }}>
            <LambdaAvatar size={44} />
            <div style={{ fontFamily: FONTS.body, fontWeight: 600, fontSize: 28, color: t.main }}>{footer}</div>
          </div>
        ) : null}
      </Glass>
    </div>
  );
};

/** Tarjeta del contestador (la forma vieja). */
export const VoicemailCard: React.FC<{ start: number; exitAt?: number; width?: number }> = ({ start, exitAt, width = 760 }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ width, ...appear(frame, start, exitAt, 18) }}>
      <Glass variant="grey" radius={40} style={{ padding: "44px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16, textAlign: "center" }}>
        <IconDisc size={96} bg="rgba(255,255,255,0.12)" glow={false}>
          <Voicemail size={44} color="rgba(255,255,255,0.8)" strokeWidth={2} />
        </IconDisc>
        <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 50, color: "rgba(255,255,255,0.86)" }}>Contestador</div>
        <div style={{ fontFamily: FONTS.body, fontWeight: 500, fontSize: 30, color: "rgba(255,255,255,0.55)" }}>
          Mensaje de 0:32 sin escuchar
        </div>
      </Glass>
    </div>
  );
};

/** Notificación de WhatsApp (el verde solo en el ícono). */
export const Notification: React.FC<{
  title: string;
  text: string;
  start: number;
  exitAt?: number;
  when?: string;
  theme?: Theme;
  width?: number;
}> = ({ title, text, start, exitAt, when = "ahora", theme = "dark", width = 860 }) => {
  const frame = useCurrentFrame();
  const t = ink(theme);
  const p = enter(frame, start, 18);
  const q = leave(frame, exitAt, 10);
  return (
    <div style={{ width, opacity: p * q, translate: `0 ${(1 - p) * -60}px`, scale: String(interpolate(p, [0, 1], [0.94, 1])) }}>
      <Glass variant={theme === "dark" ? "clear" : "light"} radius={40} style={{ padding: "28px 32px", display: "flex", gap: 22, alignItems: "flex-start" }}>
        <IconDisc size={72} bg={COLORS.whatsapp} glow={false}>
          <MessageCircle size={40} color="#FFFFFF" strokeWidth={2.2} />
        </IconDisc>
        <div style={{ flex: 1, fontFamily: FONTS.body }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, fontWeight: 500, color: t.faint }}>
            <span>WhatsApp</span>
            <span>{when}</span>
          </div>
          <div style={{ fontSize: 30, fontWeight: 600, color: t.main, marginTop: 4 }}>{title}</div>
          <div style={{ fontSize: 30, fontWeight: 500, color: t.soft, lineHeight: 1.3, marginTop: 4 }}>{text}</div>
        </div>
      </Glass>
    </div>
  );
};

/** Persona del equipo que recibe la derivación. */
export const PersonCard: React.FC<{
  name: string;
  role: string;
  lines: string[];
  start: number;
  exitAt?: number;
  width?: number;
  lineStagger?: number;
}> = ({ name, role, lines, start, exitAt, width = 760, lineStagger = 8 }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ width, ...appear(frame, start, exitAt, 18) }}>
      <Glass variant="dark" radius={40} style={{ padding: "40px 44px", display: "flex", flexDirection: "column", alignItems: "center", gap: 14, textAlign: "center" }}>
        <div
          style={{
            width: 104,
            height: 104,
            borderRadius: 104,
            background: "radial-gradient(circle at 30% 25%, #CFFAFE 0%, #67E8F9 45%, #0E7490 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: FONTS.display,
            fontWeight: 800,
            fontSize: 46,
            color: COLORS.cyanDeep,
            boxShadow: "0 10px 30px rgba(103,232,249,0.35)",
          }}
        >
          {name.slice(0, 1)}
        </div>
        <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 50, color: "#FFFFFF" }}>{name}</div>
        <div style={{ fontFamily: FONTS.body, fontWeight: 500, fontSize: 30, color: "rgba(255,255,255,0.65)" }}>{role}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 10, width: "100%" }}>
          {lines.map((l, i) => {
            const p = interpolate(frame, [start + 14 + i * lineStagger, start + 28 + i * lineStagger], [0, 1], { ...CLAMP, easing: EASE_OUT });
            return (
              <div
                key={l}
                style={{
                  fontFamily: FONTS.body,
                  fontWeight: 600,
                  fontSize: 30,
                  color: "#FFFFFF",
                  padding: "16px 22px",
                  borderRadius: 20,
                  background: "rgba(103,232,249,0.10)",
                  border: "1px solid rgba(103,232,249,0.22)",
                  opacity: p,
                  translate: `0 ${(1 - p) * 14}px`,
                }}
              >
                {l}
              </div>
            );
          })}
        </div>
      </Glass>
    </div>
  );
};

/** Contenedor centrado en X, posicionado por su centro vertical. */
export const Center: React.FC<{ y: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ y, children, style }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      top: y,
      transform: "translateY(-50%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      ...style,
    }}
  >
    {children}
  </div>
);
