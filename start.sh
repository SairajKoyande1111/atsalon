#!/bin/bash
set -e

echo "Installing dependencies..."
pnpm install --frozen-lockfile

echo "Starting backend on port 3000..."
PORT=3000 pnpm --filter @workspace/api-server run dev &
BACKEND_PID=$!

echo "Waiting for backend to be ready..."
for i in $(seq 1 30); do
  if curl -sf http://localhost:3000/api/healthz > /dev/null 2>&1; then
    echo "Backend is ready."
    break
  fi
  sleep 1
done

echo "Starting frontend on port 5000..."
PORT=5000 BASE_PATH=/ pnpm --filter @workspace/salon-billing run dev

kill $BACKEND_PID 2>/dev/null
