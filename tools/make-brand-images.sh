#!/usr/bin/env bash
# Regenerates the Open Graph card and the square logo.
#   bash tools/make-brand-images.sh
#
# Chrome's headless layout viewport is (window height - 121) px, so each render
# asks for 121 extra rows and the surplus is cropped off the bottom. Pages are
# passed as absolute file:// URLs because the project path contains spaces.
set -euo pipefail
cd "$(dirname "$0")/.."
ROOT="$PWD"
CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
OFFSET=121

fileurl () { python3 -c 'import sys,pathlib;print(pathlib.Path(sys.argv[1]).resolve().as_uri())' "$1"; }

shot () { # <html> <css-w> <css-h> <out-png>
  local url; url="$(fileurl "$1")"
  rm -f /tmp/_shot.png
  "$CHROME" --headless --disable-gpu --hide-scrollbars --force-device-scale-factor=2 \
    --virtual-time-budget=3000 \
    --screenshot=/tmp/_shot.png --window-size="$2,$(( $3 + OFFSET ))" \
    --default-background-color=0a0908ff "$url" >/dev/null 2>&1 || true
  [ -f /tmp/_shot.png ] || { echo "chrome produced no screenshot for $1" >&2; exit 1; }
  python3 "$ROOT/tools/pngcrop.py" /tmp/_shot.png "$4" $(( $3 * 2 ))
}

mkdir -p images/og
shot tools/og-card.html 1200 630 /tmp/_og.png
sips -z 630 1200 /tmp/_og.png --out /tmp/_og1x.png >/dev/null
sips -s format jpeg -s formatOptions 86 /tmp/_og1x.png --out images/og/rabbitsfoot-og.jpg >/dev/null

shot tools/logo-card.html 512 512 /tmp/_logo.png
sips -z 512 512 /tmp/_logo.png --out images/og/rabbitsfoot-logo.png >/dev/null

echo "wrote images/og/rabbitsfoot-og.jpg and images/og/rabbitsfoot-logo.png"
