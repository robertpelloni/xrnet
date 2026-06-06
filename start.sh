#!/bin/bash
# start.sh - Start the xrnet application

echo "--- Starting xrnet v0.1.0 ---"

# In a real scenario, this might start multiple processes
# For now, we'll run our main entry point if it exists
if [ -f "main.py" ]; then
    python3 main.py
else
    echo "Entry point main.py not found. Starting backend smoke test instead."
    python3 backend/test_smoke.py
fi
