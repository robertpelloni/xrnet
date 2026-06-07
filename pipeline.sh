#!/bin/bash
# pipeline.sh - Integrated CI/CD Pipeline for xrnet

set -e

echo "========================================"
echo "      xrnet - INTEGRATED PIPELINE       "
echo "========================================"

echo "\n[STEP 1] Building all components..."
./build.sh

echo "\n[STEP 2] Running structural integrity validation..."
python3 scripts/validate_integrity.py

echo "\n[STEP 3] Running backend smoke tests..."
python3 backend/test_smoke.py

echo "\n[STEP 4] Running end-to-end integration tests..."
python3 tests/e2e_integration.py

echo "\n========================================"
echo "      PIPELINE SUCCESSFUL               "
echo "========================================"
