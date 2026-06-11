# XRNet Deployment & Packaging

## 🚀 One-Click Quick Start (End-Users)
For users who just want to get XRNet running immediately:
1. **Download the Release:** Get the latest `xrnet-v1.11.10.tar.gz`.
2. **Extract and Run:**
   ```bash
   tar -xzf xrnet-v1.11.10.tar.gz && cd xrnet-v1.11.10
   ./scripts/setup_production.sh
   ./scripts/deploy_prod.sh
   ```
3. **Access:** Open `http://localhost:8080` in your browser.

## Quick Start (Developers)
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
3. **Hardware Validation:** Run `python3 scripts/validate_hardware_compatibility.py` to ensure the system meets production requirements.
4. **Hardware Acceleration:** Ensure NVIDIA drivers or Mesa drivers are active for Spatial rendering.
5. **Network Configuration:** Open ports 8080 (API), 9000-9001 (Monitoring), and any dynamic P2P ports (typically 30000-65535).
6. **Autostart:** Generate and install the systemd service:
   ```bash
   python3 scripts/generate_systemd_service.py
   # Follow onscreen instructions to copy the .service file
   ```

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

## 🛠️ Troubleshooting & Common Issues

### 1. "Address Already in Use" (Port 8080/9000)
If XRNet fails to start because a port is occupied:
- **Solution:** Identify the process using `lsof -i :8080` and kill it, or change the port via `export API_PORT=8081`.

### 2. No Peers Discovered
If you are alone in the mesh:
- **Local Network:** Ensure all devices are on the same Wi-Fi/LAN for mDNS.
- **Firewall:** Open ports 8080, 9000, 9001 and the P2P range (30000-65535).
- **Manual Add:** Use the **Discovery Manager** in the dashboard to manually add a peer's Multiaddress.

### 3. Spatial Viewer is Blank
- **Solution:** Ensure your browser supports WebGL 2.0. Check for "Hardware Acceleration" in browser settings.

## 🚀 Staging-to-Production Migration
To move your data from a staging node to a production environment:
1. **Export Identity:** Copy your Peer ID from the dashboard.
2. **Backup DHT:** (Future) Copy `~/.local/share/xrnet/dht_cache`.
3. **Sync Version:** Ensure both environments are running v1.11.10.

## Advanced Monitoring
- **Node Monitoring:** `python3 scripts/monitor_performance.py`
- **Mesh Dashboard:** `python3 scripts/start_mesh_monitor.py` (Port 9001)

---
For routine operations, see [MAINTENANCE.md](MAINTENANCE.md).
