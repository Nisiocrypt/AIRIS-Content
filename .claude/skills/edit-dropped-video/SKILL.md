---
name: edit-dropped-video
description: Editar de punta a punta un video crudo que el usuario sube (talking head, B-roll, grabación de pantalla) - cortes, subtítulos, motion graphics, SFX, música y export para redes. Usar cuando el usuario adjunta o deja un video en `inbox/` y pide editarlo.
---

# Editar un video soltado por el usuario

Entrada: archivo en `inbox/` o adjunto en el chat. Salida: `output/<slug>/` con los
renders finales, el proyecto editable y un `EDIT_LOG.md`.

Requiere el stack de `scripts/setup-video-stack.sh` (ffmpeg, whisperx, auto-editor,
kinocut). Si falta algo, instalarlo con ese script antes de empezar.

## Pasos

1. **Ingesta y diagnóstico**
   - `ffprobe` (resolución, fps, duración, audio). Copiar el original a
     `output/<slug>/source/` sin tocarlo.
   - Contact sheet 1 fps para ver el material. Anotar tomas, encuadre, luz, ruido.
2. **Transcripción**: WhisperX en español con timestamps por palabra →
   `transcript.json` + `.srt`.
3. **Edición de contenido** (propuesta antes de renderizar)
   - Quitar silencios > 0.35 s, muletillas y tomas repetidas (quedarse con la última
     buena). Proponer un gancho fuerte en el primer segundo (reordenar si hace falta).
   - Mostrar al usuario el guion resultante y la duración estimada; esperar OK si cambia
     el sentido del contenido.
4. **Imagen**: jump cuts con zoom alterno (100% / 112%) para ritmo, corrección de color
   leve, reencuadre 9:16 siguiendo la cara.
5. **Motion graphics** según `airis-motion-graphics`: titulares clave, stat cards,
   mockups, lower third con nombre, CTA final. Subtítulos palabra por palabra con estilo
   de marca en zona segura.
6. **Audio** según `sound-design`: limpieza de voz (denoise, EQ, de-esser, compresión),
   SFX por evento, música con ducking, master -14 LUFS.
7. **Render y QA**: exportar 9:16 (y 4:5/16:9 si se pide). Revisar contact sheet del
   render, medir loudness (`ebur128`), verificar sincronía de subtítulos y zona segura.
8. **Entrega**: renders + `EDIT_LOG.md` (qué se cortó y por qué, assets usados y sus
   licencias, cómo regenerar).

## Reglas

- Nunca sobrescribir el original. Nunca inventar datos o testimonios en pantalla.
- Mantener la voz y el sentido del usuario; los cortes mejoran ritmo, no cambian el
  mensaje.
- Si el material tiene problemas que la edición no arregla (audio saturado, foco), decirlo
  y sugerir cómo grabar mejor la próxima.
