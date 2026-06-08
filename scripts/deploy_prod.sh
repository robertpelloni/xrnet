#!/bin/bash
# scripts/deploy_prod.sh - Automated Production Rollout

set -e

echo "--- [DEPLOY] Starting production rollout ---"

# 1. Ensure latest state
echo "[DEPLOY] Pulling latest changes..."
git pull origin main

# 2. Build in release mode
echo "[DEPLOY] Building optimized binaries and assets..."
./build.sh release

# 3. Clean up existing logs
echo "[DEPLOY] Cleaning previous session logs..."
rm -f *.log

# 4. Launch in background
echo "[DEPLOY] Launching xrnet production unit (API on port 8080)..."
nohup ./start.sh release > prod_runtime.log 2>&1 &

echo "[DEPLOY] Rollout complete. PIDs and logs available in prod_runtime.log."
echo "[DEPLOY] Monitor status: curl http://localhost:8080/api/status"
