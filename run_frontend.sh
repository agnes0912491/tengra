#!/usr/bin/env bash
set -euo pipefail
cd /srv/tengra/frontend

# build kilidi
exec 9>/tmp/frontend.build.lock
flock -n 9 || exec node node_modules/next/dist/bin/next start -p 3000

export NODE_ENV=production
export NODE_OPTIONS=--max-old-space-size=512

CUR=$(git rev-parse HEAD 2>/dev/null || echo "nogit")
LAST=$(cat .last_build 2>/dev/null || echo "none")

if [[ "$CUR" != "$LAST" || ! -f .next/BUILD_ID ]]; then
  # İlk kurulumda veya node_modules yoksa tam temiz kurulum yap
  if [[ ! -d node_modules ]]; then
    nice -n 10 ionice -c2 -n7 npm ci --no-audit --no-fund
  else
    # Mevcut modülleri silmeden sadece eksikleri / güncellemeleri al
    nice -n 10 ionice -c2 -n7 npm install --no-audit --no-fund
  fi
  nice -n 10 ionice -c2 -n7 npm run build -- --no-lint
  echo "$CUR" > .last_build
fi

exec node node_modules/next/dist/bin/next start -p 3000
