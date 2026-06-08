#!/bin/bash
# start.sh - Start the xrnet application

VERSION=$(cat VERSION.md)
MODE=${1:-debug}
echo "--- Starting xrnet v$VERSION ($MODE mode) ---"

BINARY="backend/target/debug/xrnet-backend"
if [ "$MODE" == "release" ]; then
    BINARY="backend/target/release/xrnet-backend"
fi

# Check if build artifacts exist
if [ ! -f "$BINARY" ]; then
    echo "[ERROR] Backend binary not found: $BINARY. Run ./build.sh $MODE first."
    exit 1
fi

echo "[INFO] Launching Bobcoin Economic Layer..."
(cd submodules/bobcoin/bobcoin-consensus && node server.js > ../../../bobcoin.log 2>&1) &
BOB_PID=$!

echo "[INFO] Launching Backend (integrated UI)..."
./$BINARY &
BACKEND_PID=$!

echo "[INFO] Launching Frontend Gateway..."
python3 main.py &
MAIN_PID=$!

echo "[INFO] xrnet processes started. PIDs: Bobcoin($BOB_PID), Backend($BACKEND_PID), Main($MAIN_PID)"

# Wait for Ctrl+C
trap "kill $BOB_PID $BACKEND_PID $MAIN_PID; exit" INT TERM
wait
