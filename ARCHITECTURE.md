# XRNet System Architecture

XRNet is a decentralized spatial operating system built on a modular peer-to-peer (P2P) stack.

## 1. Modular P2P Stack (Rust Backend)

The core of XRNet is a Rust-based node utilizing the `libp2p` library for autonomous connectivity.

### Peer Discovery & Connectivity
- **mDNS:** Local peer discovery for automatic mesh formation on LANs.
- **Kademlia DHT:** Global decentralized discovery and storage for peer profiles and marketplace records.
- **TCP Swarm:** Reliable, multiplexed connections using Noise encryption and Yamux.

### Messaging & Event Propagation
- **Gossipsub:** Real-time mesh messaging for decentralized "Communicate" features.

## 2. API Gateway & Coordination (Axum + Python)

- **Axum (Rust):** Provides a high-performance REST API for the frontend and external control systems.
- **Python Coordinator:** Orchestrates component lifecycle, autonomous protocol execution, and system-level monitoring.

## 3. Economic Layer (Bobcoin Integration)

- **Bobcoin Proxy:** The Rust backend acts as a secure proxy to the Node.js Bobcoin consensus service, enabling decentralized transactions and balance management without direct frontend access to the consensus engine.

## 4. Spatial Layer (Three.js & AI)

- **Spatial Viewer:** A React/Three.js frontend component for visualizing 3D Gaussian Splatting data.
- **AI Models:** Onboard world models (LWM) for semantic labeling and spatial search (cataloged in `spatial/models/`).

## 5. Security & Governance

- **Cryptographic Identity:** Every node is identified by a unique public/private keypair.
- **Neutral Arbitration:** (Phase 4) Automated selection of neutral peers for dispute resolution.
