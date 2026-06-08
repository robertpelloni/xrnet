# XRNet Maintenance Guide

This document outlines routine maintenance tasks for the XRNet mesh network ecosystem.

## 1. System Health Checks
- **API Status:** Verify the node is reporting correctly:
  ```bash
  curl -s http://localhost:8080/api/status | jq
  ```
- **Mesh Connectivity:** Ensure the peer count is > 0 (unless in standalone mode).
- **Log Monitoring:** Check for critical errors in `prod_runtime.log` (Production) or `app_output.log` (Debug).

## 2. Dependency Management
- **Rust Backend:** Periodically update crates to latest secure versions:
  ```bash
  cd backend && cargo update
  ```
- **React Frontend:** Update npm packages:
  ```bash
  cd frontend && npm update
  ```

## 3. Storage & Cleanup
- **DHT Records:** The current implementation uses an in-memory store. In future persistent versions, monitor disk usage in `~/.local/share/xrnet`.
- **Log Rotation:** Rotate logs if they exceed 100MB.
- **Cleaning Build Artifacts:** If you encounter build inconsistencies, perform a deep clean:
  ```bash
  rm -rf backend/target frontend/dist frontend/node_modules
  ./build.sh
  ```

## 4. Performance Benchmarking
Run the benchmarking suite monthly to ensure network stability as the mesh grows:
```bash
python3 scripts/benchmark_mesh.py --nodes 5 --duration 300
```

## 5. Versioning & Roadmaps
Updates to `VERSION.md` and `TODO.md` should be performed via the **Executive Protocol** to maintain monorepo integrity:
```bash
curl -X POST http://localhost:8080/api/system/protocol
```
