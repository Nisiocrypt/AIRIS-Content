# AIRIS Content

Estudio de contenido de AIRIS operado con Claude: edición de video, motion graphics y
visuales de nivel agencia.

- **Investigación del stack** → [`docs/research/2026-09-stack-video-motion.md`](docs/research/2026-09-stack-video-motion.md)
- **Análisis del reel de referencia** → [`docs/research/analisis-reel-airis-v1.md`](docs/research/analisis-reel-airis-v1.md)
- **Análisis de airisautomation.com** (filosofía, sistema visual, capturas) → [`docs/research/analisis-web-airisautomation.md`](docs/research/analisis-web-airisautomation.md)

## Skills (`.claude/skills/`)

| Skill | Para qué |
|---|---|
| `anti-slop` | Reglas obligatorias: lo que nunca aparece en un video (manda sobre todas) |
| `airis-design-philosophy` | Filosofía, voz y sistema visual de AIRIS (glass iOS en violetas) |
| `video-ideas-hooks` | Ideas, hooks, guiones y marketing aplicado |
| `airis-motion-graphics` | Cómo animar a nivel corporativo con Remotion: timing, cámara, movimientos firma |
| `sound-design` | Voz en off, SFX por evento, música y mezcla |
| `edit-dropped-video` | Soltás un video crudo en `inbox/` y Claude lo edita completo |
| `remotion-best-practices` | Skill oficial de Remotion (instalada con `npx skills add remotion-dev/skills`) |

## Cómo usarlo

1. `bash scripts/setup-video-stack.sh` (ffmpeg, WhisperX, auto-editor, Kinocut).
2. Dejá tu grabación en `inbox/` (o adjuntala en el chat) y pedí: "editá este video".
3. Los renders salen en `output/<slug>/` (no se versionan).
4. Antes de producir, `python3 scripts/anti_slop_check.py <guion o proyecto>`.

Assets de marca oficiales (logo, favicon, OG) en `assets/brand/`.
