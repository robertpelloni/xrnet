#!/bin/bash
# scripts/deploy_prod.sh - XRNet Production Rollout Script (v0.1.33)

set -e

VERSION=$(cat VERSION.md)
echo "===================================================="
echo "      XRNet Production Rollout - v$VERSION          "
echo "===================================================="

# 1. Environment Verification
echo "[DEPLOY] Running pre-flight integrity checks..."
python3 scripts/validate_integrity.py

# 2. Submodule Synchronization
echo "[DEPLOY] Synchronizing decentralized dependencies..."
sh scripts/sync_repo.sh

# 3. Release Build
echo "[DEPLOY] Compiling release-optimized binaries..."
./build.sh release

# 4. Service Persistence (systemd)
echo "[DEPLOY] Configuring systemd service persistence..."
SERVICE_FILE="xrnet.service"
cat <<EOT > $SERVICE_FILE
[Unit]
Description=XRNet Autonomous Node (v$VERSION)
After=network.target

[Service]
ExecStart=$(pwd)/start.sh
WorkingDirectory=$(pwd)
Restart=always
RestartSec=10
User=$USER
Environment=MODE=production
StandardOutput=append:$(pwd)/prod_runtime.log
StandardError=append:$(pwd)/prod_runtime.log

[Install]
WantedBy=multi-user.target
EOT

echo "[DEPLOY] Service file generated: $SERVICE_FILE"
echo "[DEPLOY] To activate: sudo cp $SERVICE_FILE /etc/systemd/system/ && sudo systemctl daemon-reload && sudo systemctl enable --now xrnet"

# 5. Production Health Check
echo "[DEPLOY] Launching smoke test instance..."
rm -f status.json backend/status.json
./start.sh > prod_smoke.log 2>&1 &
PID=$!

# Wait for readiness signal and API to be responsive
echo "[DEPLOY] Waiting for Everything Protocol [READY]..."
COUNT=0
MAX=30
STATUS_RESP=""
until [ $COUNT -eq $MAX ]; do
    STATUS_RESP=$(curl -s http://127.0.0.1:3000/api/status 2>/dev/null || echo "")
    if [ -n "$STATUS_RESP" ] && echo "$STATUS_RESP" | grep -q "network"; then
        break
    fi
    sleep 1
    COUNT=$((COUNT+1))
done

if echo "$STATUS_RESP" | grep -q "network"; then
    echo "[DEPLOY] API Health Check..."
    CURRENT_VERSION=$(cat VERSION.md | tr -d '[:space:]')
    echo "[DEPLOY] SUCCESS: Production instance v$CURRENT_VERSION is operational. Response: $STATUS_RESP"
else
    echo "[DEPLOY] ERROR: System failed to reach READY state in $MAX seconds."
    kill $PID 2>/dev/null || true
    kill $(lsof -t -i :3000) 2>/dev/null || true
    exit 1
fi

kill $PID 2>/dev/null || true
kill $(lsof -t -i :3000) 2>/dev/null || true
echo "===================================================="
echo "      Rollout Verification Complete                 "
echo "===================================================="
