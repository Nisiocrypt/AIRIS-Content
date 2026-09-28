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
