# Investigación: stack para motion graphics y edición de video con Claude (sept. 2026)

Objetivo: que Claude produzca motion graphics y ediciones de nivel agencia, y que cuando
grabes contenido lo puedas soltar en el repo y Claude lo edite de punta a punta.

## TL;DR — la recomendación

| Capa | Herramienta elegida | Por qué |
|---|---|---|
| Motion graphics (código → video) | **Remotion** (principal) + **HyperFrames** (bocetos rápidos) | Remotion tiene Agent Skills oficiales, springs, `<Sequence>`, audio sincronizado a frame. HyperFrames es HTML+GSAP puro: ideal para iterar rápido. |
| Edición de material grabado | **Kinocut (mcp-video)** + FFmpeg | MCP local, Apache 2.0, sin API keys: trim, subtítulos, detección de escenas, separación de stems, reformateo a Reels/Shorts. |
| Editor con timeline visual | **OpenCut + opencut-mcp** (opcional) | Solo si querés abrir el proyecto y retocar a mano. Es un PoC: no depender de él para producción. |
| Transcripción / cortes | **WhisperX** (timestamps por palabra) + `auto-editor` | Subtítulos palabra-por-palabra, cortar silencios y tomas repetidas. |
| Voz en off | **ElevenLabs v3** (voz rioplatense, p. ej. "Malena") | Rango emocional alto, español AR, MCP oficial. |
| SFX | **ElevenLabs Sound Effects** (generados) + librería curada propia | Whooshes, pops de UI, risers e impactos a medida del corte. |
| Música | **Eleven Music API** (licenciada para uso comercial) | Cama musical a la duración exacta del video. |

## 1. Motion graphics: Remotion vs HyperFrames

**Remotion** (React → MP4). En enero 2026 Remotion publicó *Agent Skills* para Claude Code:
guías de buenas prácticas (API correcta, easing, composición, captions). Hay skills
comunitarias (`haidrrrry/claude-remotion-skill`) que añaden springs, coreografía escalonada,
grading, grano, Ken Burns, captions sincronizados y diseño sonoro, y MCPs como
`chuk-motion` (design tokens) y `clean-cut-mcp`.
- A favor: cada elemento es un componente reutilizable (nuestros "chat bubble", "stat card",
  "phone mockup" de AIRIS pasan a ser una librería). Audio en la misma línea de tiempo → SFX
  exactos al frame.
- En contra: requiere proyecto Node; licencia Remotion es gratuita para individuos/equipos
  chicos, paga para empresas más grandes — revisar antes de escalar.

**HyperFrames** (HeyGen, open source). HTML + CSS/GSAP/Lottie/Three.js, renderizado frame a
frame en Chrome headless y encodeado con FFmpeg. Determinista, sin build.
- A favor: el video de referencia ya parece hecho con este tipo de pipeline; iteración
  instantánea.
- En contra: menos ecosistema de componentes y de audio que Remotion.

**Decisión:** Remotion como sistema de producción (librería de componentes de marca +
audio), HyperFrames para exploración y prototipos. Kinocut sabe crear/postprocesar
proyectos HyperFrames, así que conviven.

## 2. Edición de lo que grabes (talking head, B-roll)

- **Kinocut / mcp-video** (`pip install kinocut`, `kino doctor`): ~200 herramientas MCP —
  trim, merge, crop/resize, overlays, subtítulos, transcripción, detección de escenas,
  upscaling, separación de stems, variantes por plataforma, "quality gates" y recibos de lo
  que hizo. Local y gratis. **Este es el MCP base.**
- **OpenCut**: editor open source estilo CapCut. `kenimo49/opencut-mcp` lo controla vía
  Playwright (`window.__editor`). Útil para revisión visual humana; frágil para automatizar.
- **WeftCut**: editor open source con MCP integrado (trim, split, keyframes, efectos,
  captions, export). Alternativa a OpenCut a evaluar.
- **Reap MCP / FFmpeg Micro**: servicios en la nube (clipping viral, doblaje 80+ idiomas).
  Útiles para repurposing masivo; son pagos y suben tu material a terceros.
- **WhisperX**: transcripción con VAD + alineación wav2vec2 → timestamps por palabra.
  Base para: subtítulos sincronizados por frase, cortes por silencio, detección de
  muletillas y tomas repetidas (quedarse con la última).

## 3. Audio — donde más se puede mejorar

Un buen motion sin sonido se siente "demo". La diferencia de nivel pro está en:

1. **Voz en off** (ElevenLabs v3, voz AR). Guion corto, 2–2.5 palabras/seg en reels.
   Etiquetas de emoción de v3 para matizar ("[susurra]", pausas). Grabar también la versión
   sin voz para quien mira sin sonido.
2. **SFX sincronizados a cada evento visual**: entrada de burbuja = *pop* suave, número que
   cuenta = *ticks* ascendentes, transición de escena = *whoosh*, logo = *impacto + cola
   reverberada*, check verde = *ding* UI. ElevenLabs genera cada uno por prompt con duración
   controlada.
3. **Música**: cama con build hacia el reveal del logo y un "drop" o corte a silencio antes
   del dato clave (efecto de contraste).
4. **Mezcla**: voz a ~-16 LUFS integrados para redes (-14 LUFS máximo), ducking de música
   -8 a -12 dB bajo la voz, SFX sin tapar la voz, true peak ≤ -1 dBTP. FFmpeg `loudnorm`
   + `sidechaincompress` lo resuelven sin DAW.

## 4. Visuales e imágenes

- Sistema de diseño fijo (tokens: colores, tipografías, radios, sombras, glow) — ver skill
  `airis-motion-graphics`.
- Principios de motion que suben el nivel: easing con springs (nunca lineal), stagger
  40–80 ms entre elementos, *motion blur* en movimientos rápidos, overshoot sutil, cámara
  virtual con leve parallax/zoom continuo (la pantalla nunca está 100% quieta), grano fino
  y viñeta para unificar.
- Retención en reels: gancho visual en <1 s, un cambio visual cada 1.5–2.5 s, texto legible
  en zona segura 9:16 (evitar ~15% inferior y ~10% superior por la UI de Instagram/TikTok).
- Imágenes/B-roll generado: usar solo como textura o fondo; los datos y la UI siempre
  vectoriales/código para nitidez.

## 5. Infraestructura propuesta en este repo

```
.claude/skills/
  airis-motion-graphics/   # sistema visual + reglas de motion de la marca
  sound-design/            # mapa evento → SFX, mezcla y loudness
  edit-dropped-video/      # pipeline: soltás un video crudo → edición completa
docs/research/             # este informe + análisis del reel de referencia
scripts/setup-video-stack.sh  # instala ffmpeg, whisperx, kinocut, auto-editor
```

Siguientes pasos (cuando quieras pasar a producción):
1. Correr `scripts/setup-video-stack.sh` y registrar Kinocut como MCP.
2. Crear `studio/` con un proyecto Remotion y portar los componentes del reel de referencia.
3. Cargar `ELEVENLABS_API_KEY` como secreto del entorno y conectar el MCP de ElevenLabs.
4. Armar una librería `assets/sfx/` curada (licencias claras) para no depender 100% de
   generación.

## 6. Buenas prácticas relevadas (segunda ronda)

- **Hooks**: los primeros 3 a 5 segundos definen la mayor parte de la retención. En B2B
  rinden mejor los hooks con prueba y datos en pantalla que la curiosidad vacía. Empezar
  a mitad de la acción, primer subtítulo de 7 palabras o menos, sin disolvencias en los
  primeros 5 s, testear 2 o 3 variantes de hook con el mismo cuerpo y medir a las 48 h.
- **Tipografía cinética corporativa** (referencia Apple): restricción, las palabras
  primero, movimiento que aclara el mensaje, paleta neutra con un acento estratégico.
- **Señales de "AI slop"** a evitar: morphing, iluminación plana o que cambia entre
  cortes, colores sobresaturados, movimiento matemáticamente perfecto sin peso, texto
  ilegible dentro de la escena, composiciones estáticas sin cámara ni profundidad.
- **Remotion Agent Skills oficiales** instaladas en `.claude/skills/remotion-best-practices`
  (versión 4.0.529, trazada en `skills-lock.json`): animar con `useCurrentFrame()` +
  `interpolate()` + `Easing.bezier/spring`, nunca con CSS transitions.

Todo esto quedó aplicado en las skills `anti-slop`, `video-ideas-hooks`,
`airis-design-philosophy` y `airis-motion-graphics`.

Fuentes adicionales:
- https://www.conbersa.ai/learn/best-youtube-shorts-hooks
- https://almcorp.com/blog/short-form-video-mastery-tiktok-reels-youtube-shorts-2026/
- https://www.oktopost.com/blog/b2b-short-form-video-engagement/
- https://motiongility.com/kinetic-typography/
- https://trydemotion.com/blog/apple-style-animation-guide
- https://www.opus.pro/blog/ai-slop-aesthetic-12-tells
- https://greenfroglabs.com/blog/ai-video-quality-avoid-slop-appearance
- https://github.com/remotion-dev/skills

## Nota sobre la skill `/last30days`

La skill `last30days:last30days` no está instalada en esta sesión, así que la búsqueda se
hizo con búsqueda web directa enfocada en lo más reciente de 2026. Si la instalás, se puede
re-correr este relevamiento para captar discusión de Reddit/X de las últimas semanas.

## Fuentes

- OpenCut MCP: https://github.com/kenimo49/opencut-mcp · https://kenimoto.dev/blog/opencut-classic-mcp-4-traps-editor-core-fork/
- Kinocut (mcp-video): https://github.com/KyaniteLabs/mcp-video
- WeftCut MCP: https://weftcut.com/mcp/
- Reap MCP: https://reap.video/mcp
- FFmpeg Micro + Claude: https://www.ffmpeg-micro.com/blog/build-ai-video-editing-agent-claude-mcp
- Remotion Agent Skills: https://robotostudio.com/blog/how-to-use-remotion-agent-skills-with-claude-code
- claude-remotion-skill: https://github.com/haidrrrry/claude-remotion-skill
- chuk-motion (Remotion MCP): https://glama.ai/mcp/servers/@chrishayuk/chuk-mcp-remotion
- HyperFrames: https://github.com/heygen-com/hyperframes
- ElevenLabs MCP: https://elevenlabs.io/blog/introducing-voice-music-image-and-video-generation-in-the-elevenlabs-mcp
- Eleven Music API: https://elevenlabs.io/blog/eleven-music-now-available-in-the-api
- Voces ES de ElevenLabs: https://json2video.com/ai-voices/elevenlabs/languages/spanish/
- WhisperX: https://www.forasoft.com/learn/ai-for-video-engineering/articles-ai/whisperx-diarization-word-level-timestamps
