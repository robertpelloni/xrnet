#!/bin/bash
# scripts/setup_production.sh - Production Environment Setup

set -e

echo "--- [PROD] Setting up production dependencies ---"

# 1. System Dependencies (Linux)
if command -v apt-get &> /dev/null; then
    echo "[PROD] Detected Debian/Ubuntu. Installing dependencies..."
    sudo apt-get update
    sudo apt-get install -y build-essential curl git python3 python3-pip nodejs npm
fi

# 2. Rust Toolchain
if ! command -v cargo &> /dev/null; then
    echo "[PROD] Installing Rust..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source $HOME/.cargo/env
else
    echo "[PROD] Rust already installed: $(cargo --version)"
fi

# 3. Python Dependencies
echo "[PROD] Installing Python telemetry and test requirements..."
pip3 install requests psutil --break-system-packages || pip3 install requests psutil

# 4. Repository Check
if [ ! -d ".git" ]; then
    echo "[ERROR] Run this script from the repository root."
    exit 1
fi

echo "[SUCCESS] Production environment setup complete."
