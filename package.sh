#!/bin/bash
# package.sh - XRNet System Packaging Script

VERSION=$(cat VERSION.md)
PKG_NAME="xrnet-v$VERSION"
DIST_DIR="dist"

echo "--- [PKG] Starting XRNet System Packaging (v$VERSION) ---"

# 1. Workspace Cleanup
rm -rf "$DIST_DIR"
mkdir -p "$DIST_DIR/$PKG_NAME"

# 2. Collect Components
echo "[PKG] Collecting source components..."
cp -r backend "$DIST_DIR/$PKG_NAME/"
cp -r frontend "$DIST_DIR/$PKG_NAME/"
cp -r spatial "$DIST_DIR/$PKG_NAME/"
cp -r scripts "$DIST_DIR/$PKG_NAME/"
cp -r submodules "$DIST_DIR/$PKG_NAME/"
cp -r tests "$DIST_DIR/$PKG_NAME/"
cp main.py VERSION.md README.md VISION.md TODO.md ROADMAP.md ARCHITECTURE.md RELEASE_NOTES.md ".gitignore" "$DIST_DIR/$PKG_NAME/"

# 3. Clean Build Artifacts from Distribution
echo "[PKG] Cleaning build artifacts..."
find "$DIST_DIR/$PKG_NAME" -name "target" -type d -exec rm -rf {} +
find "$DIST_DIR/$PKG_NAME" -name "node_modules" -type d -exec rm -rf {} +
find "$DIST_DIR/$PKG_NAME" -name "*.log" -delete

# 4. Generate Manifest
echo "[PKG] Generating deployment manifest..."
cd "$DIST_DIR/$PKG_NAME"
find . -maxdepth 3 -not -path '*/.*' > DEPLOYMENT_PACKAGE_MANIFEST.md
cd ../..

# 5. Compress
echo "[PKG] Creating distribution tarball..."
tar -czf "$PKG_NAME.tar.gz" -C "$DIST_DIR" "$PKG_NAME"

echo "[PKG] Package created: $PKG_NAME.tar.gz"
echo "--- [PKG] Packaging Complete ---"
