#!/usr/bin/env bash
set -euo pipefail

PORT="${1:-4173}"
HOST="${2:-127.0.0.1}"

if command -v python3 >/dev/null 2>&1; then
  echo "Starting StorySub at http://${HOST}:${PORT}"
  exec python3 -m http.server "${PORT}" --bind "${HOST}"
elif command -v python >/dev/null 2>&1; then
  echo "Starting StorySub at http://${HOST}:${PORT}"
  exec python -m SimpleHTTPServer "${PORT}"
else
  echo "Python is required to run a local preview server."
  exit 1
fi
