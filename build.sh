#!/bin/bash
# build.sh - Build all xrnet components

echo "--- Building xrnet v0.1.0 ---"

echo "[1/3] Building Backend (Rust)..."
(cd backend && cargo build) || { echo "[ERROR] Backend build failed"; exit 1; }

echo "[2/3] Building Frontend (React/Vite)..."
(cd frontend && npm install && npm run build) || { echo "[ERROR] Frontend build failed"; exit 1; }

echo "[3/3] Building Spatial AI Components..."
# Placeholder for spatial build
echo "Spatial build skipped (placeholder)."

echo "--- Build Complete ---"
