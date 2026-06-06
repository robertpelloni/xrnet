#!/bin/bash
# start.sh - Start the xrnet application

echo "--- Starting xrnet v0.1.0 ---"

# Check if build artifacts exist
if [ ! -f "backend/target/debug/xrnet-backend" ]; then
    echo "[ERROR] Backend not built. Run ./build.sh first."
    exit 1
fi

echo "[INFO] Launching Backend..."
backend/target/debug/xrnet-backend &
BACKEND_PID=$!

echo "[INFO] Launching Frontend Gateway (Placeholder)..."
# In a real scenario, this might serve the frontend via a local server
# For now, we'll run main.py to coordinate
python3 main.py &
MAIN_PID=$!

echo "[INFO] xrnet processes started. PIDs: Backend($BACKEND_PID), Main($MAIN_PID)"

# Wait for Ctrl+C
trap "kill $BACKEND_PID $MAIN_PID; exit" INT TERM
wait
