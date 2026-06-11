#!/bin/bash
# scripts/start_staging_mesh.sh - Launch persistent multi-node staging cluster

set -e

echo "--- [STAGING] Starting 3-node mesh cluster ---"

# 1. Build release binaries
./build.sh release

# 2. Launch Central Monitor (Mock Peer)
echo "[STAGING] Launching Central Monitor (Port 9000/9001)..."
nohup python3 scripts/mock_peer.py > logs/staging_monitor.log 2>&1 &
sleep 2

# 3. Launch Nodes
# Ensure pgrp handling for cleanup
export MONITOR_HOST=127.0.0.1

echo "[STAGING] Launching Node 1 (8080)..."
API_PORT=8080 nohup ./start.sh release > logs/node_8080.log 2>&1 &

echo "[STAGING] Launching Node 2 (8081)..."
API_PORT=8081 nohup ./start.sh release > logs/node_8081.log 2>&1 &

echo "[STAGING] Launching Node 3 (8082)..."
API_PORT=8082 nohup ./start.sh release > logs/node_8082.log 2>&1 &

echo "--- [STAGING] Deployment complete. Monitor at http://localhost:9001 ---"
echo "[STAGING] API Nodes at http://localhost:8080, 8081, 8082"
