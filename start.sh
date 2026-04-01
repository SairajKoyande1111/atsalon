#!/bin/bash
set -e

echo "=== Clearing stale processes ==="
fuser -k 5000/tcp 2>/dev/null || true
fuser -k 24678/tcp 2>/dev/null || true
pkill -f "tsx.*src/index.ts" 2>/dev/null || true
sleep 0.5

echo "=== Installing dependencies ==="
pnpm install --no-frozen-lockfile

echo "=== Starting server ==="
PORT=5000 BASE_PATH=/ pnpm --filter @workspace/api-server run dev
