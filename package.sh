#!/bin/bash
# package.sh - Bundle xrnet for distribution

VERSION=$(cat VERSION.md)
PKG_NAME="xrnet-v$VERSION"
PKG_DIR="/tmp/$PKG_NAME"

echo "--- [PACKAGE] Bundling xrnet v$VERSION ---"

# Clean up previous attempts
rm -rf "$PKG_DIR"
rm -f "$PKG_NAME.tar.gz"

# Create temporary staging directory
mkdir -p "$PKG_DIR"

# Copy source files, excluding build artifacts and git history
rsync -a . "$PKG_DIR" \
    --exclude "target" \
    --exclude "node_modules" \
    --exclude "dist" \
    --exclude ".git" \
    --exclude "*.log" \
    --exclude "status.json" \
    --exclude "backend/status.json" \
    --exclude "*.tar.gz"

# Create archive
tar -czf "$PKG_NAME.tar.gz" -C "/tmp" "$PKG_NAME"

echo "[SUCCESS] Packaged xrnet into $PKG_NAME.tar.gz"
rm -rf "$PKG_DIR"
