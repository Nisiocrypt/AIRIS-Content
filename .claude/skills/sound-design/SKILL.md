---
name: sound-design
description: Diseño sonoro, voz en off, música y mezcla para videos y motion graphics. Usar al agregar SFX, voiceover (ElevenLabs), música o al masterizar el audio de cualquier video del repo.
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

Generación: ElevenLabs Sound Effects (prompt en inglés, duración fija, `prompt_influence`
alto para UI). Guardar en `assets/sfx/<categoria>/` con un `LICENSE.md` de procedencia.

## Voz en off

- ElevenLabs **v3**, voz rioplatense (p. ej. "Malena") o voz clonada del usuario si la
  autoriza. Ritmo 2–2.5 palabras/seg en reels.
- Escribir el guion con pausas explícitas y etiquetas de emoción de v3 donde aporten.
- Generar por frase (un archivo por beat) para poder ajustar timing sin regenerar todo.
- Alinear con WhisperX para obtener timestamps por palabra → subtítulos y cortes.

## Música

- Eleven Music API (uso comercial) o librería licenciada. Pedir duración exacta al frame.
- Arco: tensión en el gancho → entra el beat en el logo → corte a silencio antes del dato
  clave → resolución en el CTA.

## Mezcla y master (FFmpeg)

- Voz ≈ -16 LUFS; master final -14 LUFS integrados, true peak ≤ -1 dBTP.
- Ducking de música bajo la voz (-8 a -12 dB) con `sidechaincompress`.
- Master: `loudnorm=I=-14:TP=-1:LRA=11` (dos pasadas para precisión).
- Verificar escuchando con y sin voz; exportar también una versión sin voz.
