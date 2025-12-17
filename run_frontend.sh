#!/usr/bin/env bash
set -euo pipefail
cd /srv/tengra/apps/tengra

# build kilidi
exec 9>/tmp/frontend.build.lock
flock -n 9 || (export PORT=3000 HOSTNAME=127.0.0.1 && exec node .next/standalone/apps/tengra/server.js)

export NODE_ENV=production
export NODE_OPTIONS=--max-old-space-size=512

CUR=$(git rev-parse HEAD 2>/dev/null || echo "nogit")
LAST=$(cat .last_build 2>/dev/null || echo "none")

if [[ "$CUR" != "$LAST" || ! -f .next/BUILD_ID ]]; then
  # İlk kurulumda veya node_modules yoksa tam temiz kurulum yap
  if [[ ! -d node_modules ]]; then
    # Tailwind'in PostCSS eklentisi devDependency'de, üretimde de kurulsun diye production=false ile kurulum yap
    nice -n 10 ionice -c2 -n7 npm ci --no-audit --no-fund --production=false
  else
    # Mevcut modülleri silmeden sadece eksikleri / güncellemeleri al
    nice -n 10 ionice -c2 -n7 npm install --no-audit --no-fund --production=false
  fi
  nice -n 10 ionice -c2 -n7 npm run build
  echo "$CUR" > .last_build
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
