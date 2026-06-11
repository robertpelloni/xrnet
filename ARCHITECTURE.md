# XRNet System Architecture

## Overview
XRNet is a decentralized spatial computing platform designed as a monorepo containing a high-performance Rust backend, a modern React/Three.js frontend, and a spatial AI layer. It operates on an autonomous mesh network using libp2p.

## 1. Monorepo Structure
- `backend/`: Rust source code for the P2P protocol, REST API, and static file server.
- `frontend/`: React + TypeScript source code for the dashboard and 3D spatial viewer.
- `spatial/`: Configuration and placeholders for AI Large World Models (LWM) and scanning techniques.
- `scripts/`: Utilities for synchronization, simulation, monitoring, and deployment.
- `tests/`: End-to-end integration and system validation suites.

## 2. Backend (The Everything Protocol)
The backend is built in Rust using the `tokio` asynchronous runtime and `libp2p` for networking.

### P2P Network Stack (libp2p Layers)
1. **Transport:** TCP/IP.
2. **Security:** Noise protocol for encrypted communications.
3. **Multiplexing:** Yamux for stream multiplexing.
4. **Discovery:** mDNS for local network peer discovery.
5. **Messaging:** Gossipsub for mesh-wide pub-sub (real-time chat).
6. **Data Storage:** Kademlia DHT for decentralized profile and marketplace record storage.
7. **Utility:** Ping (RTT) for high-precision latency monitoring and diagnostics.

### API & Services
- **Modular Networking Engine:** All libp2p swarm management and behavior definitions are encapsulated in `mesh.rs`, decoupled from the API logic.
- **Axum REST API:** Exposes endpoints for system status, peer data, DHT operations, and messaging.
- **Hardware Telemetry:** Integrated `sysinfo` layer that monitors real-time CPU and memory utilization, exposed via the API.
- **Static File Server:** In production, the backend serves the compiled frontend assets directly using `tower-http`.
- **Handshake Protocol:** A custom TCP handshake for integration with external system components.

## 3. Frontend (The User Interface)
Built with React 18.3 and Vite 6.
- **Dashboard:** Real-time monitoring of P2P node status, peers, and network metrics.
- **Communicate:** Interactive chat interface wired to Gossipsub.
- **Shop & Sell:** Advanced real-time service discovery with DHT filtering and marketplace search.
- **Manage & Be Managed:** Neutral reputation-weighted governance with automated peer ranking based on fairness and completion metrics.
- **Network Health:** Comprehensive telemetry dashboard displaying real-time bandwidth (kbps), E2E latency, and node health status.
- **Spatial Viewer:** Three.js integration for 3D Gaussian Splatting and digital twin visualization.

## 4. Governance & Fairness Engine
The system implements a proprietary neutrality algorithm that ranks peers for decentralized tasks:
- **Reputation (40%):** Derived from community participation (voting, proposing).
- **Fairness Score (30%):** Automated metric based on resource contribution and mesh reliability.
- **Completion Rate (30%):** Tracked success rate for assigned decentralized tasks.

## 5. Component Interaction
1. **Backend ↔ P2P:** The Swarm event loop handles all incoming network events and propagates them to internal state.
2. **Backend ↔ Frontend:** The Frontend polls the Backend API for real-time updates and pushes user actions (messages, listings) via POST requests.
3. **Coordinator (`main.py`) ↔ Backend:** Orchestrates startup, waits for the backend 'READY' signal via `status.json`, and triggers the Executive Autonomous Protocol.

## 6. Deployment Model
- **Debug:** Backend and Frontend run as separate processes (API on 8080, Vite on 5173).
- **Production (Single-Unit):** Optimized Rust binary serves both the API and the UI on a single port (8080 default).

## 7. Mesh-Wide Monitoring
The ecosystem includes a centralized monitoring layer for large-scale mesh deployments.
- **Central Control Server:** A Python-based collector (`mock_peer.py`) that aggregates telemetry from all nodes.
- **Mesh API:** Exposes aggregated health data for the entire mesh via JSON.
- **Real-Time Dashboard:** A high-performance HTML5 visualization tool for monitoring multi-node performance trends.
