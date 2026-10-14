#!/bin/sh
set -e

echo "[entrypoint] Waiting for database…"
# Simple wait loop using node
node -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function wait() {
  for (let i = 0; i < 30; i++) {
    try {
      await p.\$queryRaw\`SELECT 1\`;
      console.log('[entrypoint] Database ready');
      await p.\$disconnect();
      process.exit(0);
    } catch (e) {
      console.log('[entrypoint] DB not ready, retry', i + 1);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  console.error('[entrypoint] Database timeout');
  process.exit(1);
}
wait();
"

echo "[entrypoint] Running migrations…"
npx prisma migrate deploy || npx prisma db push --accept-data-loss

echo "[entrypoint] Seeding (idempotent)…"
npx tsx prisma/seed.ts || node -e "require('tsx/cjs'); require('./prisma/seed.ts')" 2>/dev/null || \
  npx tsx --tsconfig tsconfig.json prisma/seed.ts || true

echo "[entrypoint] Starting application…"
exec "$@"
