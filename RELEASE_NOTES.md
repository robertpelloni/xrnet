# XRNet Release Notes - v0.1.2 "Foundation Alpha"

We are pleased to announce the completion of the XRNet Phase 1 & 2 foundations. This release establishes the autonomous mesh networking ecosystem.

## Key Features

- **Autonomous P2P Networking:** Fully integrated libp2p stack with mDNS discovery and Kademlia DHT.
- **Mesh Messaging:** Real-time communication via Gossipsub.
- **Economic Integration:** Proxy support for Bobcoin decentralized transactions.
- **Unified API:** RESTful interface for system monitoring and DHT interaction.
- **Executive Protocol:** Foundation for autonomous repository and system governance.

## Technical Improvements

- Modularized mesh networking logic into `backend/src/mesh.rs`.
- Implemented `main.py` coordinator for streamlined system orchestration.
- Verified sub-10ms API response latency on production-tier hardware.

## Hardware Compatibility

- **Target Platforms:** Raspberry Pi 5, Jetson Orin, x86_64 Desktop.
- **Minimum Requirements:** 4GB RAM, Quad-core CPU, Low-latency network.

## Roadmap Status

- **Phase 1 (Foundation):** 100% Complete.
- **Phase 2 (Everything Protocol):** 100% Complete.
- **Phase 3 (Spatial Layer):** Initialized.
