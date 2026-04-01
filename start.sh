#!/bin/bash

PORT=3000 pnpm --filter @workspace/api-server run dev &
BACKEND_PID=$!

sleep 2

PORT=5000 BASE_PATH=/ pnpm --filter @workspace/salon-billing run dev

kill $BACKEND_PID 2>/dev/null
