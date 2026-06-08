# XRNet Deployment Package Manifest (v0.3.23)

## Package Overview
This manifest details the components included in the XRNet v0.3.23 "Ecosystem Complete" release.

## Core Components
- **Backend (`backend/`):**
  - Rust/libp2p Mesh Protocol Node.
  - Integrated REST API (Port 8080).
  - Production-ready static file server for UI assets.
- **Frontend (`frontend/`):**
  - React 19 / Vite 8 Dashboard.
  - Real-time Gossipsub Chat (Communicate).
  - DHT-based Marketplace (Shop & Sell).
  - Spatial AI 3D Viewer (Three.js).
- **Control Layer (`scripts/`):**
  - `mock_peer.py`: Central Control Server & Telemetry Aggregator (Port 9000/9001).
  - `mesh_dashboard.html`: Fleet-wide monitoring dashboard.
  - `benchmark_mesh.py`: Multi-node load testing suite.

## Tooling & Documentation
- **Deployment:** `DEPLOY.md`, `setup_production.sh`, `deploy_prod.sh`.
- **Maintenance:** `MAINTENANCE.md`, `package.sh`.
- **Verification:** `pipeline.sh`, `tests/e2e_integration.py`, `scripts/simulate_mesh.py`.
- **Architecture:** `ARCHITECTURE.md`, `API.md`, `VISION.md`.

## Integration Status
- **P2P Discovery:** mDNS / Kademlia DHT [Verified]
- **Mesh Messaging:** Gossipsub [Verified]
- **Telemetry Reporting:** Native Rust -> Central API [Verified]
- **Fleet Monitoring:** Central Dashboard [Verified]
- **Autonomous Governance:** Executive Protocol Engine [Verified]

---
*Certified for release v0.3.23*
