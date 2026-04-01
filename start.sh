#!/bin/bash
set -e

echo "=== Cleaning up stale processes ==="
# Kill any processes on our ports
fuser -k 3000/tcp 2>/dev/null || true
fuser -k 5000/tcp 2>/dev/null || true
# Give the OS time to fully release the ports
sleep 2

echo "=== Installing dependencies ==="
pnpm install --frozen-lockfile

echo "=== Starting backend (port 3000) ==="
PORT=3000 pnpm --filter @workspace/api-server run dev &
BACKEND_PID=$!

echo "=== Waiting for backend ==="
for i in $(seq 1 30); do
  if curl -sf http://localhost:3000/api/healthz > /dev/null 2>&1; then
    echo "Backend ready after ${i}s"
    break
  fi
  sleep 1
done

echo "=== Starting frontend (port 5000) ==="
PORT=5000 BASE_PATH=/ pnpm --filter @workspace/salon-billing run dev

kill $BACKEND_PID 2>/dev/null
