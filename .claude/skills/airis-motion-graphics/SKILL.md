---
name: airis-motion-graphics
description: Sistema visual y reglas de motion de AIRIS para crear motion graphics, reels, anuncios o animaciones de marca (Remotion o HyperFrames). Usar siempre que se diseñe o anime un video, escena, lower third, stat card, mockup de chat o logo reveal para AIRIS.
---

# AIRIS — Motion Graphics

Referencia de calidad: `docs/research/analisis-reel-airis-v1.md` y las contact sheets en
`docs/reference/`. Todo video nuevo debe igualar o superar ese nivel.

## Herramienta

- **Producción**: Remotion (React). Componentes en `studio/src/components/` (crear si no
  existe). Audio en la misma composición.
- **Prototipo rápido**: HyperFrames (HTML + GSAP), render con `npx hyperframes render`.
- Render final: H.264, 30 fps (60 fps si hay mucho movimiento rápido), CRF 18, yuv420p,
  AAC 48 kHz 320 kbps.

## Tokens de marca (extraídos del reel v1)

- Fondo: violeta casi negro `#0D0718` → `#1A0B33`, glow radial `#5B2BB5` al 35% centrado
  arriba del foco.
- Acento primario: gradiente lavanda `#B9A6FF → #7C5CFF`. Acento WhatsApp: `#25D366`.
- Texto: blanco `#FFFFFF` titulares, `#C9C2DC` secundario. Eyebrows monoespaciados,
  tracking amplio, mayúsculas, precedidos de "—".
- Tarjetas: glass (`rgba(255,255,255,0.06)`, borde 1px `rgba(255,255,255,0.10)`, radio
  20–28 px, sombra suave violeta).
- Tipografía: display geométrica extra-bold (tipo Syne/Clash Display/Unbounded) para
  titulares; itálica para la palabra-remate ("*WhatsApp no.*", "*te lo pasa.*").

## Reglas de motion (no negociables)

1. Nunca easing lineal. Springs (`damping ~14–20, stiffness ~120–180`) o
   `cubic-bezier(0.22, 1, 0.36, 1)` para entradas; salidas 30% más rápidas que entradas.
2. Stagger 40–80 ms entre elementos hermanos; titulares palabra por palabra con
   blur 12px → 0 + y 20px → 0.
3. Cámara viva: push-in continuo 100% → 104% por escena y parallax entre capas.
4. Un cambio visual significativo cada 1.5–2.5 s. Gancho en el primer segundo.
5. Transiciones por *match cut* o morph de elementos compartidos; evitar fades genéricos.
6. Datos clave (porcentajes, tiempos) con contador animado + momento de énfasis (glow
   flash, micro-shake 2 px, partículas).
7. Zona segura 9:16: nada importante en el 10% superior ni en el 18% inferior; textos
   ≥ 28 px a 1080 de ancho.
8. Acabado: grano 2–3%, viñeta suave, motion blur en desplazamientos rápidos.
9. Cada evento visual tiene su sonido — coordinar con la skill `sound-design`.

## Flujo

1. Guion + beat sheet con tiempos (tabla escena/tiempo/texto/voz/SFX).
2. Boceto de frames clave (render de stills) → validar con el usuario.
3. Animar, renderizar, extraer contact sheet (`ffmpeg -vf fps=1,scale=270:-1,tile=5x2`)
   y revisar uno mismo cada frame antes de entregar.
4. Exportar 9:16, 4:5 y 16:9 si se pide distribución multiplataforma.
