#!/bin/bash
# Renderiza un solo video con su audio. Uso: scripts/render_one.sh V2-MenosAusencias 02-menos-ausencias v2
set -euo pipefail
cd "$(dirname "$0")/.."
FF=${FFMPEG:-/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2}
id=$1; slug=$2; audio=$3
OUT=../output/renders; DEL=../entregas/2026-09-28-tanda-1; QA=../output/qa
mkdir -p "$OUT" "$DEL" "$QA"
python3 audio/build.py "$audio"
npx remotion render "$id" "$OUT/$slug-silent.mp4" --muted --concurrency=4 --log=error < /dev/null
"$FF" -nostdin -y -v error -i "$OUT/$slug-silent.mp4" -i "../output/audio/$audio.wav" -map 0:v -map 1:a \
  -c:v copy -c:a aac -b:a 256k -ar 48000 -shortest -movflags +faststart "$OUT/$slug.mp4"
"$FF" -nostdin -y -v error -i "$OUT/$slug.mp4" -c:v libx264 -preset slow -crf 21 -pix_fmt yuv420p \
  -profile:v high -c:a copy -movflags +faststart "$DEL/$slug.tmp.mp4"
mv "$DEL/$slug.tmp.mp4" "$DEL/$slug.mp4"
"$FF" -nostdin -y -v error -i "$OUT/$slug.mp4" -vf "fps=2,scale=216:-1,tile=10x6" -frames:v 1 "$QA/$slug-sheet.jpg"
"$FF" -nostdin -y -v error -ss 0.6 -i "$OUT/$slug.mp4" -frames:v 1 -q:v 3 "$QA/$slug-poster.jpg"
echo "LISTO $slug"
