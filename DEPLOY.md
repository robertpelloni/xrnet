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
   # Release build is recommended for production hardware
   ./build.sh release
   ```
3. **Launch System:**
   ```bash
   ./start.sh release
   ```

## Target Hardware Requirements
- **CPU:** Quad-core x86_64 or ARM64 (e.g., Raspberry Pi 5, Jetson Orin).
- **RAM:** 4GB minimum (8GB recommended for Spatial AI).
- **Network:** Low-latency Wi-Fi or Ethernet (for mesh stability).
- **Storage:** 1GB for core OS + additional space for IPFS/Spatial maps.

## Deployment Instructions (Hardware)
1. **Prepare OS:** Ensure Ubuntu 24.04 or similar Linux distribution is installed.
2. **Setup Dependencies:** Run `./scripts/setup_production.sh` to install Rust, Node.js, and system libraries.
3. **Hardware Acceleration:** Ensure NVIDIA drivers or Mesa drivers are active for Spatial rendering.
4. **Network Configuration:** Open ports 8080 (API), 9000-9001 (Monitoring), and any dynamic P2P ports (typically 30000-65535).
5. **Autostart:** Configure `systemd` or a similar supervisor to run `./start.sh release` on boot.

## Multi-Device Mesh Integration
To connect multiple physical devices into the same mesh:
1. **Seed Node:** Designate one device as the Monitoring/Seed node. Run `scripts/mock_peer.py` on it.
2. **Client Nodes:** On all other devices, export the IP of the Seed node:
   ```bash
   export MONITOR_HOST=192.168.1.50  # Use your seed node's actual IP
   ./start.sh release
   ```
3. **Discovery:** Nodes will automatically discover each other via mDNS (if on the same LAN) or via Kademlia DHT bootstrap.
4. **Verification:** Access the mesh dashboard from any device: `http://<seed-node-ip>:9001`

## Packaging for Distribution
To create a versioned source bundle for release:
```bash
./package.sh
```
This generates `xrnet-v{VERSION}.tar.gz` excluding build artifacts.

## Automated Verification (CI/CD)
The v1.9.0 release includes a unified hardware validation and performance benchmarking suite. Every deployment should be preceded by a successful run of:

### Hardware Validation
Verify target system compatibility (CPU, RAM, Disk):
```bash
python3 scripts/validate_hardware_compatibility.py
```

### Performance Certification
Verify API response times are within production specs:
```bash
python3 scripts/benchmark_hardware_performance.py
```

### Integrated Pipeline
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
