#!/bin/bash
# Descarga los temas de Mixkit que usa tracks.json en assets/music/.
# No se suben al repositorio: la licencia de Mixkit no permite redistribuir los archivos sueltos.
set -euo pipefail
cd "$(dirname "$0")/../.."
mkdir -p assets/music
python3 - <<'EOF' | while read -r id file; do
import json
for cfg in json.load(open("studio/audio/tracks.json")).values():
    f = cfg["file"]
    print(f.split("-")[1], f)
EOF
  [ -s "assets/music/$file" ] && continue
  curl -sSfL -m 120 -o "assets/music/$file" "https://assets.mixkit.co/music/$id/$id.mp3"
  echo "bajado $file"
done

# Efectos de Mixkit (kit.json)
mkdir -p assets/sfx
python3 -c "import json; [print(v['id']) for v in json.load(open('studio/audio/kit.json')).values()]" | while read -r id; do
  f="assets/sfx/mixkit-sfx-$id.mp3"
  [ -s "$f" ] && continue
  curl -sSfL -m 60 -o "$f" "https://assets.mixkit.co/active_storage/sfx/$id/$id-preview.mp3"
  echo "bajado $f"
done
