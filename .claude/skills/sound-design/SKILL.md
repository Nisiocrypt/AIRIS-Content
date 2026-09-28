---
name: sound-design
description: Diseño sonoro, voz en off, llamadas de demostración (recepcionista de voz con IA), música y mezcla para videos y motion graphics. Usar al agregar SFX, voiceover (ElevenLabs), diálogos de llamadas, música o al masterizar el audio de cualquier video del repo.
---

# Sound design

## Mapa evento visual → SFX

| Evento | SFX | Notas |
|---|---|---|
| Entrada de burbuja / tarjeta | pop suave, 60–120 ms | pitch +1 semitono por cada burbuja siguiente |
| Tipeo / "escribiendo…" | teclas suaves o blips | bajo en la mezcla |
| Transición de escena | whoosh (air, no metálico) | arrancar 3–5 frames antes del corte |
| Logo reveal | riser 1–2 s → impacto grave + cola reverb | silencio de 200–300 ms previo |
| Contador numérico | ticks que desaceleran con el número | último tick más fuerte |
| Check / confirmado | "ding" UI brillante | |
| Reloj / nocturno | tic-tac, ambiente de noche tenue | solo en el gancho |
| Texto que entra con blur | swish muy sutil o nada | no sonorizar todo: prioridad a lo importante |

Prohibido: los efectos de meme o de chiste de la librería `@remotion/sfx` y de cualquier
otra (vine boom, bruh, windows-xp-error, spongebob-fail, anime-wow, wilhelm scream,
etc.) y los sonidos de sistema de Apple o Windows. De esa librería solo sirven, y con
cuidado, `whoosh`, `switch`, `mouse-click` y `ding`; mejor generar SFX propios.

Generación: ElevenLabs Sound Effects (prompt en inglés, duración fija, `prompt_influence`
alto para UI). Guardar en `assets/sfx/<categoria>/` con un `LICENSE.md` de procedencia.

## Voz en off

- ElevenLabs **v3**, voz rioplatense (p. ej. "Malena") o voz clonada del usuario si la
  autoriza. Ritmo 2–2.5 palabras/seg en reels.
- Escribir el guion con pausas explícitas y etiquetas de emoción de v3 donde aporten.
- Generar por frase (un archivo por beat) para poder ajustar timing sin regenerar todo.
- Alinear con WhisperX para obtener timestamps por palabra → subtítulos y cortes.

## Llamadas de demostración (recepcionista de voz)

Contexto y reglas de marca en `docs/research/recepcionista-llamadas-ia.md`.

1. **Guion del diálogo**: frases cortas, naturales, sin guiones largos (el TTS los lee
   como pausas raras) y sin frases de IA. El asistente abre siempre identificándose:
   "Hola, te atiende el asistente virtual de [consultorio]. ¿En qué te ayudo?".
   Pasarlo por `scripts/anti_slop_check.py`.
2. **Generación**: ElevenLabs Eleven v3 con *Text to Dialogue* (cada turno con su
   `voice_id`). Asistente: voz rioplatense cálida y calma, siempre la misma en todos los
   videos (es "la voz de AIRIS"). Paciente: otra voz, con etiquetas de interpretación
   entre corchetes (`[duda]`, `[suspira]`, `[apurado]`) para que suene real.
   Alternativa superior: grabar una llamada real de prueba contra el agente de voz de
   AIRIS, con actores o el equipo y consentimiento.
3. **Tiempos honestos**: pausas realistas entre turnos (lo que tarde el sistema real).
   No recortar la latencia para que parezca más rápido de lo que es.
4. **Sonido de teléfono**: EQ suave para que se lea como llamada sin perder
   inteligibilidad, por ejemplo
   `highpass=f=200,lowpass=f=5000,acompressor=threshold=-18dB:ratio=3`.
   Nada de lo-fi extremo.
5. **SFX de llamada**: tono de llamada propio (generado, nunca el ringtone del iPhone),
   clic de atención, tono de transferencia suave y corte. Suenan en los mismos frames en
   que se ven en pantalla.
6. **Sincronía**: correr WhisperX sobre el audio del diálogo y usar los tiempos de cada
   frase para animar la transcripción y las tarjetas de acción en Remotion.
7. **Mezcla**: el diálogo es la voz principal (-16 LUFS); la música baja más que con
   un voiceover común (ducking de -12 a -15 dB) o directamente se corta durante la
   llamada para que se escuche como una llamada de verdad.

## Música

- Eleven Music API (uso comercial) o librería licenciada. Pedir duración exacta al frame.
- Arco: tensión en el gancho → entra el beat en el logo → corte a silencio antes del dato
  clave → resolución en el CTA.
- **Una cama sintetizada suave se escucha como efectos, no como música** (lo marcó el
  dueño). Por defecto usar un tema real de biblioteca: hoy Mixkit (anuncios online sí,
  sin atribución, no redistribuir los mp3). Ver `docs/research/musica-libre.md`.
- Tema por video en `studio/audio/tracks.json` (`file`, `start`, `gain_db`, `duck_db`,
  `mute` en frames). Elegir `start` para que el tema suba en el giro de la historia; en
  videos con arranque distinto a propósito (`ENTER` en `build.py`) el tema entra ahí.
  Registrar origen y licencia en `assets/music/LICENSE.md`; bajar con
  `studio/audio/fetch_music.sh`.

## Pipeline actual (sin claves de API)

`studio/audio/` sintetiza todo: `engine.py` (osciladores, filtros, reverb, limitador,
master), `sfx.py` (pop, whoosh, ding, confirmación, timbre propio, atención, corte,
transferencia, alerta, golpe, riser, brillo) y `build.py` (una partitura por video que lee
los tiempos de los `.tsx`). Reglas que salieron de la primera tanda:
- La cama sintetizada se normaliza a -17 LUFS y un tema de biblioteca a -15,5 LUFS antes
  de sumar efectos (el tema baja 4 a 5 dB cuando suena un efecto); el master final va a
  -14 LUFS y -1 dBTP.
- Siempre hay sonido en el frame 0 (golpe suave + aire).
- El timbre de teléfono es un tono sostenido: va 10 dB más bajo que un pop.
- Los efectos van 4 semitonos más graves y con los agudos recortados a 6,5 kHz
  (`SFX_SEMITONES` en `build.py`): al dueño los originales le resultaban molestos.
- Los silencios dramáticos se aplican después de la reverb, si no la cola los rellena.
- Validar sin escuchar con `audio/inspect_mix.py` (espectrograma + envolvente) y
  `audio/overview.py`; igual conviene que una persona lo escuche antes de publicar.

## Mezcla y master (FFmpeg)

- Voz ≈ -16 LUFS; master final -14 LUFS integrados, true peak ≤ -1 dBTP.
- Ducking de música bajo la voz (-8 a -12 dB) con `sidechaincompress`.
- Master: `loudnorm=I=-14:TP=-1:LRA=11` (dos pasadas para precisión).
- Verificar escuchando con y sin voz; exportar también una versión sin voz.
