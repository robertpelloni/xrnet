# XRNet Deployment Guide

This guide provides instructions for deploying XRNet across multiple devices and production environments.

## 1. Environment Requirements

- **Operating System:** Ubuntu 22.04+ (Recommended), Debian 12, or macOS.
- **Hardware:**
  - **Minimal:** Raspberry Pi 4 (4GB RAM).
  - **Recommended:** Raspberry Pi 5 or NVIDIA Jetson Orin (8GB+ RAM for Spatial AI).
- **Toolchains:** Rust 1.75+, Node.js 18+, Python 3.10+.

## 2. Multi-Device Mesh Configuration

To form a wide-area mesh, nodes must be able to discover each other beyond the local network.

### Static Bootstrap Peers
If mDNS discovery is insufficient (e.g., across different subnets), configure bootstrap peers in the `main.py` coordinator or backend environment:
```bash
export BOOTSTRAP_PEERS="/ip4/1.2.3.4/tcp/4001/p2p/12D3KooW..."
./start.sh
```

## 3. Production Build

Generate optimized release binaries:
```bash
./build.sh release
```

## 4. Automatic Start (Systemd)

Create a service file `/etc/systemd/system/xrnet.service`:
```ini
[Unit]
Description=XRNet Autonomous Node
After=network.target

[Service]
ExecStart=/path/to/xrnet/start.sh
WorkingDirectory=/path/to/xrnet
Restart=always
User=xrnet-user

[Install]
WantedBy=multi-user.target
```

## 5. Monitoring & Maintenance

- **Mesh Dashboard:** Access the real-time telemetry at `http://<node-ip>:5173`.
- **Logs:** Monitor `node.log` and `app_output.log` for protocol events.
- **Auto-Update:** The Executive Protocol (`POST /api/system/protocol`) can be triggered via webhook to pull the latest changes and rebuild the node.
