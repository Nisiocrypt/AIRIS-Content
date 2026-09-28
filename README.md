# AIRIS Content

Estudio de contenido de AIRIS operado con Claude: edición de video, motion graphics y
visuales de nivel agencia.

- **Investigación del stack** → [`docs/research/2026-09-stack-video-motion.md`](docs/research/2026-09-stack-video-motion.md)
- **Análisis del reel de referencia** → [`docs/research/analisis-reel-airis-v1.md`](docs/research/analisis-reel-airis-v1.md)

## Skills (`.claude/skills/`)

| Skill | Para qué |
|---|---|
| `airis-motion-graphics` | Sistema visual y reglas de motion de la marca |
| `sound-design` | Voz en off, SFX por evento, música y mezcla |
| `edit-dropped-video` | Soltás un video crudo en `inbox/` y Claude lo edita completo |

## Cómo usarlo

1. `bash scripts/setup-video-stack.sh` (ffmpeg, WhisperX, auto-editor, Kinocut).
2. Dejá tu grabación en `inbox/` (o adjuntala en el chat) y pedí: "editá este video".
3. Los renders salen en `output/<slug>/` (no se versionan).
