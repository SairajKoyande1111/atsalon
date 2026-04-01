#!/bin/bash
set -e

echo "=== Clearing stale processes on port 5000 ==="
fuser -k 5000/tcp 2>/dev/null || true
sleep 1

echo "=== Installing dependencies ==="
pnpm install --frozen-lockfile

echo "=== Starting unified server on port 5000 (API + frontend) ==="
PORT=5000 BASE_PATH=/ pnpm --filter @workspace/api-server run dev
