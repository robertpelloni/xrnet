# XRNet Deployment & Rollout Guide

This guide provides definitive instructions for deploying XRNet v0.1.33+ across diverse hardware and mesh environments.

## 1. Production Requirements

### Hardware
- **Standard Node:** Quad-core x86_64 or ARM64 (Pi 5), 4GB RAM.
- **Spatial AI Node:** NVIDIA Jetson Orin or PC with 8GB+ VRAM (for Gaussian Splatting/LWM).
- **Storage:** 10GB+ free space for mesh logs and spatial caches.

### Software Toolchains
- **Rust:** 1.75+ (Stable)
- **Node.js:** 20.x+ (LTS)
- **Python:** 3.10+
- **OpenSSL:** 1.1 or 3.0 headers.

## 2. Production Rollout Sequence

Execute the unified deployment script to prepare the node:
```bash
sh scripts/deploy_prod.sh
```

This script will:
1. Validate local system integrity.
2. Synchronize all decentralized submodules.
3. Build release-optimized binaries.
4. Generate a `xrnet.service` for systemd.
5. Perform a localized API health check.

## 3. Persistence (Systemd)

To ensure the node restarts automatically:
```bash
sudo cp xrnet.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now xrnet
```

Monitor production logs:
```bash
tail -f prod_runtime.log
```

## 4. Multi-Node Mesh Configuration

### Discovery & Bootstrapping
- **LAN:** Discovery is automatic via mDNS.
- **WAN:** Configure a static bootstrap peer to bridge network segments.
  ```bash
  export BOOTSTRAP_PEER="/ip4/<remote-ip>/tcp/4001/p2p/<peer-id>"
  ./start.sh
  ```

### Neutrality-Aware Routing
Nodes with higher Neutrality Index scores (visible in the Mesh Dashboard) are prioritized for packet forwarding. Ensure high uptime and successful task completion to maintain a high index.

## 5. Hardware-Specific Optimizations

### Raspberry Pi 5
- Ensure adequate cooling for sustained mesh load.
- Use `arm64` specific builds: `cargo build --release --target aarch64-unknown-linux-gnu`.

### NVIDIA Jetson (Spatial Layer)
- Enable MAX-N mode for maximum AI throughput.
- Mount `spatial/models/` on high-speed NVMe storage.

## 6. Maintenance & Updates

Trigger the autonomous update protocol via the API or dashboard:
```bash
curl -X POST http://localhost:8080/api/system/protocol
```
This will pull the latest features, re-synchronize the mesh, and restart the node service.
