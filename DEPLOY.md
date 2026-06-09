# XRNet Deployment & Packaging

## Quick Start (Production)
For rapid deployment on a new system:
1. **Initialize Environment:**
   ```bash
   ./scripts/setup_production.sh
   ```
2. **Execute Rollout:**
   ```bash
   ./scripts/deploy_prod.sh
   ```

## Standard Setup (Source)
1. **Clone & Submodules:**
   ```bash
   git clone --recursive https://github.com/robertpelloni/xrnet && cd xrnet
   git submodule update --init --recursive
   ```
2. **Build All Components:**
   ```bash
   ./build.sh [release]
   ```
3. **Launch System:**
   ```bash
   ./start.sh [release]
   ```

## Packaging for Distribution
To create a versioned source bundle for release:
```bash
./package.sh
```
This generates `xrnet-v{VERSION}.tar.gz` excluding build artifacts.

## Automated Verification (CI/CD)
The v1.0.0 final release includes a unified automation pipeline. Every deployment should be preceded by a successful run of:
```bash
./pipeline.sh
```
This script automates:
1. **Sync:** Repository synchronization and submodule updates.
2. **Build:** Full system compilation (Backend + Frontend).
3. **Integrity:** Structural validation and version consistency checks.
4. **Tests:** Smoke tests, End-to-End full stack, Routing (Gossipsub/DHT), and Monitoring aggregation tests.

## Advanced Monitoring
- **Node Monitoring:** `python3 scripts/monitor_performance.py`
- **Mesh Dashboard:** `python3 scripts/start_mesh_monitor.py` (Port 9001)

---
For routine operations, see [MAINTENANCE.md](MAINTENANCE.md).
