#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 0 ]]; then
  echo "Usage: $0" >&2
  exit 2
fi

if [[ ! -d /srv/tengra/apps/tengra ]]; then
  echo "Missing app directory: /srv/tengra/apps/tengra" >&2
  exit 1
fi

for cmd in node npm flock; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Missing required command: $cmd" >&2
    exit 1
  fi
done

cd /srv/tengra/apps/tengra

# build kilidi
exec 9>/tmp/frontend.build.lock
flock -n 9 || (export PORT=3000 HOSTNAME=127.0.0.1 && exec node .next/standalone/apps/tengra/server.js)

export NODE_ENV=production
export NODE_OPTIONS=--max-old-space-size=512

# Build only if .next/BUILD_ID doesn't exist (first run or after clean)
if [[ ! -f .next/BUILD_ID ]]; then
  # İlk kurulumda veya node_modules yoksa tam temiz kurulum yap
  if [[ ! -d node_modules ]]; then
    # Tailwind'in PostCSS eklentisi devDependency'de, üretimde de kurulsun diye production=false ile kurulum yap
    nice -n 10 ionice -c2 -n7 npm ci --no-audit --no-fund --production=false
  else
    # Mevcut modülleri silmeden sadece eksikleri / güncellemeleri al
    nice -n 10 ionice -c2 -n7 npm install --no-audit --no-fund --production=false
  fi
  nice -n 10 ionice -c2 -n7 npm run build
fi

# SECURITY: Bind to localhost only - Nginx/Cloudflare will proxy
# Standalone build requires static and public folders to be copied manually
# if they are not being served by Nginx directly from the source .next/static

# Ensure the target directories exist
mkdir -p .next/standalone/apps/tengra/.next
mkdir -p .next/standalone/apps/tengra/public

# Copy the static assets
cp -r .next/static .next/standalone/apps/tengra/.next/static
cp -r public/* .next/standalone/apps/tengra/public/

export PORT=3000
export HOSTNAME=127.0.0.1
exec node .next/standalone/apps/tengra/server.js
