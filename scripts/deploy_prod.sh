#!/bin/bash
# scripts/deploy_prod.sh - XRNet Production Rollout Script

VERSION=$(cat VERSION.md)
echo "--- [DEPLOY] Launching XRNet Production Rollout (v$VERSION) ---"

# 1. Environment Verification
echo "[DEPLOY] Verifying target environment..."
python3 scripts/validate_integrity.py || { echo "[ERROR] Integrity check failed"; exit 1; }

# 2. Build Release Binaries
echo "[DEPLOY] Building release-optimized components..."
./build.sh release || { echo "[ERROR] Build failed"; exit 1; }

# 3. Systemd Service Setup
echo "[DEPLOY] Configuring persistence layer (systemd)..."
SERVICE_FILE="xrnet.service"
if [ ! -f "$SERVICE_FILE" ]; then
    echo "[DEPLOY] Generating $SERVICE_FILE template..."
    cat <<EOT > $SERVICE_FILE
[Unit]
Description=XRNet Autonomous Node
After=network.target

[Service]
ExecStart=$(pwd)/start.sh
WorkingDirectory=$(pwd)
Restart=always
User=$USER
Environment=MODE=production
StandardOutput=append:$(pwd)/prod_runtime.log
StandardError=append:$(pwd)/prod_runtime.log

[Install]
WantedBy=multi-user.target
EOT
    echo "[DEPLOY] service template created. To install: sudo cp $SERVICE_FILE /etc/systemd/system/ && sudo systemctl enable --now xrnet"
fi

# 4. Final Smoke Test
echo "[DEPLOY] Executing final health check..."
./start.sh > prod_smoke_test.log 2>&1 &
PID=$!
sleep 15

if curl -s http://127.0.0.1:8080/api/status > /dev/null; then
    echo "[DEPLOY] SUCCESS: Production instance is operational."
else
    echo "[DEPLOY] ERROR: API health check failed."
    kill $PID
    exit 1
fi

kill $PID
echo "--- [DEPLOY] Rollout Ready. Version: v$VERSION ---"
