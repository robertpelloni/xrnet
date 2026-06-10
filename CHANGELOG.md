# CHANGELOG: xrnet

## [1.5.0] - 2026-06-09
### Added: Management & Scalability Milestone
- **Central Command-and-Control:** Enhanced the mesh monitor with an API and UI to remotely manage nodes (Sync, Reboot).
- **Advanced Benchmarking:** Upgraded `benchmark_mesh.py` with latency, throughput, and automated sequential scalability tests.
- **Scalability Validation:** Verified sub-5ms mesh propagation latency across configurations of 3, 5, and 8 nodes.
- **API Port Discovery:** Telemetry now includes node-specific API ports to enable precise remote management.
- **Management UI:** Added a control panel to the `mesh_dashboard.html` for real-time fleet operations.

## [1.4.0] - 2026-06-09
### Added: The "Everything App" Milestone
- **Decentralized Governance:** Implemented `governance.rs` for task proposals and reputation-weighted voting.
- **Learning Hub:** Created `LearningHub.tsx` for mesh-based educational content sharing via DHT.
- **Economic Integration:** Fully integrated Bobcoin payments for marketplace transactions.
- **Multi-Device Networking:** Enabled external mesh participation by binding to `0.0.0.0` and adding `MONITOR_HOST` support.
- **Real-time Analytics:** Added a performance analytics engine to `mock_peer.py` with high-resource usage alerts.
- **Enhanced Monitoring:** Redesigned the dashboard to visualize global mesh health, reputation, and alerts.
- **Autonomous Engine v2:** Optimized the Executive Protocol for repository synchronization, versioning, and atomic deployments.
- **Comprehensive Testing:** Hardened the system with E2E, monitoring, and routing integration tests.

## [1.0.0] - 2026-06-08
### Final Release: The Decentralized Spatial OS
- Established the production baseline for the XRNet ecosystem.
- Integrated Bobcoin as the native decentralized currency.
- Finalized Phase 3: Spatial Integration & Simulation (100% Complete).
- Optimized libp2p Gossipsub and Kademlia routing for high-performance mesh operations.
- Implemented a comprehensive monitoring and telemetry dashboard (local + fleet-wide).
- Achieved 100% test coverage for core routing and discovery modules.

## [0.6.0] - 2026-06-08
### Added
- Comprehensive Rust unit tests for AppState and protocol logic.
- Peer Connectivity visualization in Monitoring Dashboard.
- Enhanced DHT record handling with internal validation logic.

## [0.5.0] - 2026-06-08
### Added
- Bobcoin Economic Layer integration.
- Mesh routing optimizations (Gossipsub heartbeat tuning).
- Performance benchmarking suite.

## [0.2.0] - 2026-06-07
### Added
- Decentralized Messaging (Communicate) via libp2p Gossipsub.
- Decentralized Marketplace Discovery (Shop & Sell) via Kademlia DHT.
- Single-Unit Deployment: Backend now serves Frontend static files directly.
- UI panels for real-time mesh chat and marketplace listings.

## [0.1.0] - 2025-03-06
### Added
- Initial project documentation and architecture baseline.
- Functional Rust backend with libp2p and mDNS.
- React/Vite frontend dashboard.
