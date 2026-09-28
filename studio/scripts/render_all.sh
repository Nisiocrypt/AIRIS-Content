#!/bin/bash
# Render final de la tanda: video sin audio (Remotion) + banda sonora (audio/build.py),
# mezcla, copia de entrega comprimida y hoja de contactos para control.
set -euo pipefail
cd "$(dirname "$0")/.."
FF=${FFMPEG:-/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2}
OUT=../output/renders
DEL=../entregas/2026-09-28-tanda-1
QA=../output/qa
mkdir -p "$OUT" "$DEL" "$QA"
python3 audio/build.py
while read -r id slug audio; do
  [ -z "$id" ] && continue
  echo "== $id"
  npx remotion render "$id" "$OUT/$slug-silent.mp4" --muted --concurrency=4 --log=error
  "$FF" -y -v error -i "$OUT/$slug-silent.mp4" -i "../output/audio/$audio.wav" -map 0:v -map 1:a \
    -c:v copy -c:a aac -b:a 256k -ar 48000 -shortest -movflags +faststart "$OUT/$slug.mp4"
  "$FF" -y -v error -i "$OUT/$slug.mp4" -c:v libx264 -preset slow -crf 21 -pix_fmt yuv420p \
    -profile:v high -c:a copy -movflags +faststart "$DEL/$slug.mp4"
  "$FF" -y -v error -i "$OUT/$slug.mp4" -vf "fps=2,scale=216:-1,tile=10x6" -frames:v 1 "$QA/$slug-sheet.jpg"
  "$FF" -y -v error -ss 0.6 -i "$OUT/$slug.mp4" -frames:v 1 -q:v 3 "$QA/$slug-poster.jpg"
done <<'LIST'
V1-ManosOcupadas 01-manos-ocupadas v1
V2-MenosAusencias 02-menos-ausencias v2
V3-ContestarNoEsResolver 03-contestar-no-es-resolver v3
V4-UnDia 04-un-dia v4
V5-CheAlguienRespondio 05-che-alguien-respondio v5
V6-Urgencia 06-urgencia v6
V7-Contestador 07-contestador v7
V8-Titulo 08-titulo v8
LIST
ls -la "$DEL"
echo "LISTO"
