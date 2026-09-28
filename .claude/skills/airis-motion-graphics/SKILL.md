---
name: airis-motion-graphics
description: Cómo animar motion graphics de AIRIS a nivel corporativo experto con Remotion (o HyperFrames para prototipos) - timing, easing, cámara, transiciones propias, tipografía cinética centrada, render y QA. Usar siempre que se diseñe o anime un video, escena, stat card, mockup de chat, escena de llamada con IA o logo reveal para AIRIS.
---

# AIRIS: motion graphics nivel corporativo

Antes de animar, cargar:
- `airis-design-philosophy`: qué es la marca (tipos, colores, glass, componentes).
- `anti-slop`: lo prohibido. **Gana sobre esta skill si hay conflicto.**
- `remotion-best-practices`: API correcta de Remotion (instalada en `.claude/skills/`).

Referencias: reel v1 en `docs/reference/` (buen nivel, pero rompe reglas de anti-slop:
tiene etiquetas arriba de los títulos, palabras en color y títulos alineados a la
izquierda) y el sitio en `docs/reference/web/`.

## Herramienta

- **Producción**: Remotion en `studio/` (ya existe, ver `studio/README.md`). Antes de crear
  un componente nuevo, usar la librería de `studio/src/components/`: `Headline` (titular
  con máscara, se ajusta solo al ancho), `Body`, `Footnote`, `Glass`, `Bubble`, `Typing`,
  `CallCard`, `ResultCard`, `ActionChip`, `Notification`, `PersonCard`, `VoicemailCard`,
  `LightStrands`, fondos (`NightBackground`, `PastelBackground`, `VioletBackground`,
  `GreyBackground`, `DayCycleBackground`), `Camera`, `Grain`, `Vignette`, `Logo`,
  `LambdaAvatar`, `EndCard`, `FlowLine`, `LightSweep`, `LambdaWipe`. Los videos de la
  primera tanda (`studio/src/videos/`) sirven de ejemplo de cada estilo. Fuentes con `@remotion/google-fonts` (Unbounded, Poppins). Motion blur con
  `@remotion/motion-blur`. Transiciones con `@remotion/transitions` solo como base para
  transiciones propias.
- **Prototipo rápido**: HyperFrames (HTML + GSAP).
- Todas las animaciones con `useCurrentFrame()` + `interpolate()` + `Easing`. Nunca CSS
  `transition`/`animation`.
- Render: H.264, CRF 18, yuv420p, 30 fps (60 fps si hay mucho movimiento), AAC 48 kHz.

## Principios (lo que separa lo corporativo experto de lo amateur)

1. **Restricción.** Una idea por escena. Menos elementos, mejor ejecutados. Si una
   animación no ayuda a entender, se saca.
2. **Una sola familia de curvas** en todo el video:
   - Entradas: `Easing.bezier(0.16, 1, 0.3, 1)` (expo out).
   - Salidas: `Easing.bezier(0.7, 0, 0.84, 0)`, 30 a 40% más cortas que la entrada.
   - Empujes sin rebote: `Easing.spring({damping: 200})`.
   - Sin rebote ni overshoot en texto. Un overshoot mínimo (2 a 4%) solo en chips o checks.
3. **Duraciones a 30 fps**: micro UI 8 a 12 frames; entrada de titular 16 a 24; cambio
   de escena 12 a 18; logo reveal 36 a 54. Tiempo de lectura: palabras ÷ 3 + 0,6 s.
4. **Stagger con propósito**: 3 a 4 frames entre líneas; por palabra solo en el titular
   principal del hook. Nunca letra por letra.
5. **Cámara siempre viva**: push-in continuo 100% → 104% por escena, parallax de 3 capas
   (fondo, glass, texto) con distinta velocidad, leve desenfoque de profundidad en fondo.
6. **Física creíble**: anticipación breve antes de movimientos grandes, follow-through en
   elementos que frenan, overlap entre capas (no todo arranca en el mismo frame).
7. **Movimiento que explica**: la animación cuenta el proceso (mensaje → acción →
   resultado). Si se puede mostrar la operación en lugar de describirla, se muestra.
8. **Sonido en cada evento importante** (skill `sound-design`), sin sonorizar todo.

## Tipografía cinética (centrada, un color)

- Titulares Unbounded 800, centrados, un solo color, 88 a 128 px en 1080 de ancho,
  interlineado 1.05 a 1.12, máximo 3 líneas.
- Entrada firma: **reveal con máscara**. Cada línea sube 40 a 60 px desde detrás de una
  máscara invisible, con opacidad 0 → 1 y blur 8 → 0 px, stagger de 3 frames.
- Énfasis sin color: la línea en itálica entra 6 frames después con su propio golpe de
  sonido, o la palabra clave queda sola en pantalla, más grande, en su propia escena.
- Salida: las líneas se van hacia arriba con la máscara, más rápido que la entrada.
- Subtítulos (si hay voz): Poppins 600, 44 a 52 px, blanco, centrados, 2 líneas máximo,
  frase completa por bloque (no palabra por palabra, no karaoke).

## Movimientos firma de AIRIS (originales, reutilizables)

Construir cada uno como componente en `studio/src/signature/`:

1. **Hebras de luz**: las líneas azul → violeta → magenta del hero del sitio cruzan en
   diagonal; se usan para abrir el video y como barrido de transición.
2. **Lente de glass**: un panel de glass atraviesa la pantalla; lo que queda detrás del
   panel ya es la escena siguiente (refracción con blur + saturate).
3. **Mensaje → operación**: una burbuja de WhatsApp se transforma (shared element) en la
   tarjeta de resultado con check ("Turno confirmado").
4. **Línea de flujo**: un pulso de luz viaja por una línea que conecta Entrada → AIRIS →
   Resultado; cada nodo se enciende cuando el pulso llega.
5. **Barrido Λ**: la forma de la "A" del logo (sin barra) como máscara de transición.
6. **Contador con peso**: los números cuentan con easing que desacelera, la barra se
   vacía y un micro flash del glow marca el dato final.
7. **Logo reveal**: rayos radiales suaves + el trazo del logo dibujándose + un único
   impacto sonoro.
8. **Voz en hebras** (llamadas): las hebras de luz reaccionan a la voz del asistente.
   Con `@remotion/media-utils` (`useWindowedAudioData` + `visualizeAudio`, ver
   `remotion-best-practices/remotion-markup/audio-visualization.md`) se toma la energía
   de la voz frame a frame y se mapea a grosor, brillo y separación de las hebras,
   suavizada (promedio de 3 a 5 frames) para que respire y no tiemble. Cuando habla el
   paciente, las hebras se calman y baja su brillo.
9. **Llamada → turno**: la tarjeta de llamada entrante se transforma (shared element) en
   la tarjeta del turno reservado cuando la llamada termina.

Transiciones permitidas: las 9 de arriba, corte seco con match de forma o color, y cortes
al ritmo de la música. Nada de fades genéricos entre todas las escenas.

## Escenas de llamada (recepcionista de voz)

- Componentes de `airis-design-philosophy` (llamada entrante, transcripción, acciones,
  resumen, transferencia). Audio y diálogo según `sound-design`.
- Timeline guiada por el audio: los tiempos por frase de WhisperX definen cuándo aparece
  cada burbuja y cada tarjeta de acción. Nada aparece antes de que se diga.
- Transcripción: cada frase entra completa con el reveal con máscara y un leve slide
  desde su lado (asistente a la izquierda, paciente a la derecha); máximo 3 burbujas
  visibles, las viejas suben y se desvanecen.
- El timbre del teléfono se ve como dos anillos finos que se expanden desde el borde de
  la tarjeta, sincronizados al sonido. Sin ondas de dibujo animado.
- Al transferir, la línea de flujo lleva el resumen desde el asistente hasta la tarjeta
  de la persona.

## Zona segura 9:16 (1080 × 1920)

- Texto entre y = 190 y y = 1570 (evitar 10% superior y 18% inferior por la UI de
  Reels/TikTok) y con 90 px de margen lateral.
- Contenido principal centrado en el tercio medio.

## Recursos gráficos

- Logo y favicon oficiales en `assets/brand/`. No redibujar el logo.
- Íconos: Lucide (licencia ISC) en trazo 1.75 px, un solo estilo en todo el video.
- Texturas (grano, ruido, glow) generadas por código (SVG `feTurbulence`, canvas), no
  descargadas de stock.
- Imágenes de personas o producto solo si son reales (material del cliente o capturas
  propias). Nada de imágenes generadas por IA de personas.
- Para mockups de UI, reconstruirlos en código a partir de las capturas del sitio.

## Lecciones de la primera tanda

- Medir texto recién con las fuentes cargadas (`useFontsReady`): si se mide antes, el
  titular queda más grande que la pantalla y el error se cachea.
- Un titular nuevo entra recién cuando el anterior terminó de salir (dejar 12 a 14
  frames), si no las líneas se pisan.
- El primer frame ya muestra el gancho en movimiento (arrancar la entrada con `start`
  negativo).
- Unbounded es muy ancha: a 100 px entran unos 13 caracteres por línea en 900 px.
- Las hebras de fondo pasan por debajo del texto, nunca por encima.
- Revisar con `node scripts/stills.mjs` + `scripts/sheet.py` antes de renderizar todo, y
  después mirar la hoja de contactos del video final (`output/qa/`).

## Flujo de trabajo

1. Idea y guion con `video-ideas-hooks` (beat sheet con tiempos, texto, voz, SFX).
2. `python3 scripts/anti_slop_check.py` sobre el guion.
3. Stills de los frames clave (`npx remotion still`) y validación con el usuario.
4. Animación completa + audio (`sound-design`).
5. Render, hoja de contactos (`ffmpeg -i out.mp4 -vf fps=1,scale=270:-1,tile=5x2
   hoja_%02d.jpg`) y revisión de cada frame con el checklist de `anti-slop`.
6. Exportar 9:16, 4:5 y 16:9 si se pide distribución multiplataforma.
