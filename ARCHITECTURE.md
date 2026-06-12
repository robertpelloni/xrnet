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

- **Axum (Rust):** Provides a high-performance REST API (detailed in \`API.md\`) for the frontend and external control systems.
- **Python Coordinator:** Orchestrates component lifecycle, autonomous protocol execution, and system-level monitoring. Verified via \`tests/e2e_integration.py\`.

## 3. Economic Layer (Bobcoin Integration)

- **Bobcoin Proxy:** The Rust backend acts as a secure proxy to the Node.js Bobcoin consensus service, enabling decentralized transactions and balance management without direct frontend access to the consensus engine.

## 4. Spatial Layer (Three.js & AI)

- **Spatial Viewer:** A React/Three.js frontend component for visualizing 3D Gaussian Splatting data.
- **AI Models:** Onboard world models (LWM) for semantic labeling and spatial search (cataloged in `spatial/models/`).

## 5. Security & Governance

- **Cryptographic Identity:** Every node is identified by a unique public/private keypair.
- **Neutral Arbitration:** Automated selection of neutral peers for dispute resolution via the **Neutrality Index**, which monitors and weights peer reputation for unbiased management.
- **ZK-Matchmaking:** Privacy-preserving discovery of peers and services using hashed interest vectors to ensure zero-knowledge matchmaking in social and professional contexts.

## 6. Functional Layer Mapping (User-Centric Requirements)

The XRNet mesh architecture is designed to fulfill the following core "App in a Mesh" requirements:

| Requirement | Implementation Component | Protocol Layer |
| :--- | :--- | :--- |
| **Communicate** | Gossipsub Messenger | Real-time P2P Mesh |
| **Learn** | Learning Hub | Distributed Storage / Reputation |
| **Shop / Sell** | Job Task Board & Marketplace | Kademlia DHT |
| **Find Goods** | ZK-Matchmaking / DHT Search | Discovery / Privacy |
| **Manage / Be Managed** | Neutral Arbitration / Escrow | Governance / Bobcoin |
