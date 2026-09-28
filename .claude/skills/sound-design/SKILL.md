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

## Mezcla y master (FFmpeg)

- Voz ≈ -16 LUFS; master final -14 LUFS integrados, true peak ≤ -1 dBTP.
- Ducking de música bajo la voz (-8 a -12 dB) con `sidechaincompress`.
- Master: `loudnorm=I=-14:TP=-1:LRA=11` (dos pasadas para precisión).
- Verificar escuchando con y sin voz; exportar también una versión sin voz.
