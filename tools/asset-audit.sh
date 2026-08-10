#!/usr/bin/env bash
set -Eeuo pipefail

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"

python3 - "$APP_DIR/package.json" <<'PY'
import json
import sys

with open(sys.argv[1], encoding="utf-8") as handle:
    package = json.load(handle)
runtime = set((package.get("dependencies") or {}).keys())
if runtime != {"three"}:
    raise SystemExit(f"runtime dependencies must be exactly ['three']; found {sorted(runtime)}")
PY

if grep -RInE --include='*.ts' --include='*.tsx' --include='*.js' --include='*.mjs' \
  --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=artifacts \
  '\b(fetch|XMLHttpRequest|EventSource|WebSocket)[[:space:]]*\(' "$APP_DIR/src"; then
  echo "Runtime network API detected in source" >&2
  exit 1
fi

if grep -RInE --include='*.ts' --include='*.tsx' --include='*.js' --include='*.mjs' \
  --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=artifacts \
  '\b(TextureLoader|CubeTextureLoader|ImageLoader|AudioLoader|FileLoader|GLTFLoader|FBXLoader|OBJLoader|FontLoader)\b' \
  "$APP_DIR/src"; then
  echo "Runtime asset loader detected in source" >&2
  exit 1
fi

disallowed='\.(png|jpe?g|webp|gif|svg|hdr|exr|glb|gltf|fbx|obj|dae|blend|mp3|wav|ogg|m4a|aac|woff2?|ttf|otf)$'
if find "$APP_DIR" -type f \
  ! -path '*/node_modules/*' ! -path '*/dist/*' ! -path '*/artifacts/*' \
  ! -path '*/test-results/*' ! -path '*/playwright-report/*' \
  | grep -Ei "$disallowed"; then
  echo "Disallowed runtime media, model, or font file detected" >&2
  exit 1
fi

echo "Runtime asset audit passed"
