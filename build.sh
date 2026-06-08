#!/bin/bash
# build.sh - Build all xrnet components

VERSION=$(cat VERSION.md)
MODE=${1:-debug}
echo "--- Building xrnet v$VERSION ($MODE mode) ---"

echo "[1/3] Building Frontend (React/Vite)..."
(cd frontend && npm install && npm run build) || { echo "[ERROR] Frontend build failed"; exit 1; }

echo "[2/3] Building Backend (Rust)..."
if [ "$MODE" == "release" ]; then
    (cd backend && cargo build --release) || { echo "[ERROR] Backend build failed"; exit 1; }
else
    (cd backend && cargo build) || { echo "[ERROR] Backend build failed"; exit 1; }
fi

echo "[3/3] Building Spatial AI Components..."
# Placeholder for spatial build
echo "Spatial build skipped (placeholder)."

echo "--- Build Complete ---"
