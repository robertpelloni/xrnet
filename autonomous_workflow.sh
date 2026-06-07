#!/bin/bash
# autonomous_workflow.sh - Full XRNET Autonomous Execution Protocol

set -e

echo "========================================"
echo "      XRNET AUTONOMOUS WORKFLOW         "
echo "========================================"

echo "\n[1/5] REPOSITORY SYNCHRONIZATION"
./scripts/sync_repo.sh

echo "\n[2/5] INTEGRITY VALIDATION"
python3 scripts/validate_integrity.py

echo "\n[3/5] COMPONENT BUILDING"
./build.sh

echo "\n[4/5] BACKEND SMOKE TESTING"
python3 backend/test_smoke.py

echo "\n[5/5] END-TO-END INTEGRATION TESTING"
python3 tests/e2e_integration.py

echo "\n========================================"
echo "      WORKFLOW COMPLETED SUCCESSFULLY   "
echo "========================================"
