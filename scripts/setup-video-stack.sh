#!/bin/bash
# Instala el stack de edición de video usado por las skills de este repo.
# Uso: bash scripts/setup-video-stack.sh   (idempotente; no se ejecuta automáticamente)
set -euo pipefail

log() { printf '[video-stack] %s\n' "$*" >&2; }

if ! command -v ffmpeg >/dev/null 2>&1; then
  log "instalando ffmpeg..."
  if command -v apt-get >/dev/null 2>&1; then
    apt-get update -qq && apt-get install -y -qq ffmpeg
  else
    pip install -q imageio-ffmpeg
    log "ffmpeg vía imageio-ffmpeg: $(python3 -c 'import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())')"
  fi
fi

log "instalando herramientas Python (kinocut, whisperx, auto-editor)..."
pip install -q kinocut whisperx auto-editor

if command -v kino >/dev/null 2>&1; then
  kino doctor || log "aviso: 'kino doctor' reportó problemas"
fi

log "listo. Para usar Kinocut como MCP en Claude Code, ver su README (github.com/KyaniteLabs/mcp-video)."
