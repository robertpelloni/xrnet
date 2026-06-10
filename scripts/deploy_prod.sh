#!/bin/bash
# scripts/deploy_prod.sh - Automated Production Rollout

set -e

echo "--- [DEPLOY] Starting production rollout ---"

# 1. Environment Validation
API_PORT=${API_PORT:-8080}
echo "[DEPLOY] Target API Port: $API_PORT"

# 2. Ensure latest state
echo "[DEPLOY] Skipping git pull for sandbox environment..."
# git pull origin main --rebase

# 3. Build in release mode
echo "[DEPLOY] Building optimized binaries and assets..."
./build.sh release

# 4. Clean up existing logs to avoid confusion
echo "[DEPLOY] Archiving previous session logs..."
mkdir -p logs/archive
mv *.log logs/archive/ 2>/dev/null || true

# 5. Launch in background
echo "[DEPLOY] Launching xrnet production unit..."
nohup ./start.sh release > prod_runtime.log 2>&1 &
DEPLOY_PID=$!

# 6. Automated Health Check
echo "[DEPLOY] Waiting for API to become ready (max 60s)..."
READY=false
for i in {1..60}; do
    if curl -s "http://localhost:$API_PORT/api/status" | grep -q "peer_id"; then
        READY=true
        break
    fi
    sleep 1
done

if [ "$READY" = true ]; then
    echo "[SUCCESS] Rollout complete. xrnet is live at http://localhost:$API_PORT"
    echo "[DEPLOY] Main Log: prod_runtime.log"

    # 7. Start Performance Monitoring
    echo "[DEPLOY] Starting performance monitoring in background..."
    nohup python3 scripts/monitor_performance.py --port $API_PORT --duration 3600 --interval 10 > monitor_runtime.log 2>&1 &
    echo "[DEPLOY] Monitoring Log: performance_$API_PORT.log"
else
    echo "[ERROR] Deployment failed: API did not become ready in time."
    kill $DEPLOY_PID 2>/dev/null || true
    exit 1
fi
