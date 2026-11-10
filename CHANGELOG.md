# CHANGELOG: xrnet

## [0.1.142] - 2026-11-06
### Added
- Real-time Distance-Vector active route counting (`active_routes`), calculated transit jitter (`jitter_ms`), and packet loss percentage (`packet_loss_percent`) in `GET /api/telemetry`.
- Configurable polling intervals (1s, 3s, 10s, Paused) in `MonitoringDashboard.tsx`.
- Visual indicators for active routing table size alongside connected peers, dynamic transit jitter, and network packet loss metrics.

## [0.1.141] - 2026-11-06
### Added
- Privacy-preserving ZK matchmaking compatibility scoring (`compute_compatibility_score`) via Jaccard similarity coefficient across blinded salted interest hashes.
- Flexible multi-format payload handling (`my_interests`/`interests`, `peer_interests`/`other_interests`) in `POST /api/social/match`.
- Visual compatibility percentage score, Groth16/BLS12-381 ZK-SNARK verification badges, and blinded match count indicators in `SocialMatchPanel.tsx`.
- Refined TypeScript primitive types in `ProtocolPanel.tsx`.

## [0.1.140] - 2026-06-25
### Added
- Multi-Hop Distance-Vector routing inspection endpoint `GET /api/routing/routes` returning real-time non-stale mesh paths.
- Multi-Hop packet dispatch endpoint `POST /api/routing/dispatch` resolving routes via distance-vector and algorithmic neutrality scoring fallback.
- Interactive Distance-Vector routing table and packet dispatch UI within `ProtocolPanel.tsx`.
- Synchronized `DistanceVectorTable` and `RoutingEngine` inside Axum `AppState` and libp2p Gossipsub event loop in `mesh.rs`.

## [0.1.44] - 2026-06-18
### Changed
- Extracted monolithic backend API in `main.rs` into discrete route modules under `api/`.
- Modularized React `App.tsx` by extracting `StatusPanel`, `ProtocolPanel`, and `DiscoveryPanel` components.
- Removed unused dead code in routing methods.
## [0.1.0] - 2025-03-06
### Added
- Initial project documentation: `VISION.md`, `MEMORY.md`, `DEPLOY.md`, `IDEAS.md`, `VERSION.md`, `ROADMAP.md`, `TODO.md`.
- Established core vision and architectural concepts.
- Functional Rust backend with libp2p, mDNS, and status reporting.
- React/Vite frontend dashboard with status visualization and search simulation.
- Unified orchestration via `build.sh`, `start.sh`, and `pipeline.sh`.
- Comprehensive testing suite including E2E, mesh simulation, and integrity checks.

## [0.1.1] - 2025-06-07
### Added
- Real-time non-blocking TCP handshake in libp2p backend.
- Asynchronous status bridging between backend and coordinator.
- Deployment-ready multi-instance simulation suite.

## [0.1.2] - 2026-06-07
- Autonomous version bump via Executive Protocol.

## [0.1.3] - 2026-06-07
- Autonomous version bump via Executive Protocol.

## [0.1.4] - 2026-06-07
- Autonomous version bump via Executive Protocol.

## [0.1.5] - 2026-06-07
- Autonomous version bump via Executive Protocol.

## [0.1.6] - 2026-06-07
- Autonomous version bump via Executive Protocol.

## [0.1.7] - 2026-06-07
- Autonomous version bump via Executive Protocol.

## [0.1.8] - 2026-06-07
- Autonomous version bump via Executive Protocol.

## [0.1.2] - 2026-06-07
- Autonomous version bump via Executive Protocol.

## [0.1.3] - 2026-06-11
- Autonomous version bump via Executive Protocol.

## [0.1.4] - 2026-06-11
- Autonomous version bump via Executive Protocol.

## [0.1.5] - 2026-06-11
- Autonomous version bump via Executive Protocol.

## [0.1.6] - 2026-06-11
- Autonomous version bump via Executive Protocol.

## [0.1.7] - 2026-06-11
- Autonomous version bump via Executive Protocol.

## [0.1.8] - 2026-06-11
- Autonomous version bump via Executive Protocol.

## [0.1.9] - 2026-06-11
- Autonomous version bump via Executive Protocol.

## [0.1.10] - 2026-06-11
- Autonomous version bump via Executive Protocol.

## [0.1.11] - 2026-06-11
- Autonomous version bump via Executive Protocol.

## [0.1.12] - 2026-06-11
- Autonomous version bump via Executive Protocol.

## [0.1.13] - 2026-06-11
- Autonomous version bump via Executive Protocol.

## [0.1.14] - 2026-06-11
- Autonomous version bump via Executive Protocol.

## [0.1.15] - 2026-06-11
- Autonomous version bump via Executive Protocol.

## [0.1.16] - 2026-06-11
- Autonomous version bump via Executive Protocol.

## [0.1.17] - 2026-06-12
- Autonomous version bump via Executive Protocol.

## [0.1.18] - 2026-06-12
- Autonomous version bump via Executive Protocol.

## [0.1.19] - 2026-06-12
- Autonomous version bump via Executive Protocol.

## [0.1.20] - 2026-06-12
- Autonomous version bump via Executive Protocol.

## [0.1.21] - 2026-06-12
- Autonomous version bump via Executive Protocol.

## [0.1.22] - 2026-06-12
- Autonomous version bump via Executive Protocol.

## [0.1.23] - 2026-06-12
- Autonomous version bump via Executive Protocol.

## [0.1.24] - 2026-06-12
- Autonomous version bump via Executive Protocol.

## [0.1.25] - 2026-06-12
- Autonomous version bump via Executive Protocol.

## [0.1.26] - 2026-06-12
- Autonomous version bump via Executive Protocol.

## [0.1.27] - 2026-06-12
- Autonomous version bump via Executive Protocol.

## [0.1.28] - 2026-06-12
- Autonomous version bump via Executive Protocol.

## [0.1.29] - 2026-06-12
- Autonomous version bump via Executive Protocol.

## [0.1.30] - 2026-06-12
- Autonomous version bump via Executive Protocol.

## [0.1.31] - 2026-06-12
- Autonomous version bump via Executive Protocol.

## [0.1.32] - 2026-06-12
- Autonomous version bump via Executive Protocol.

## [0.1.33] - 2026-06-12
- Autonomous version bump via Executive Protocol.

## [0.1.34] - 2026-06-12
- Autonomous version bump via Executive Protocol.

## [0.1.35] - 2026-06-12
- Autonomous version bump via Executive Protocol.

## [0.1.36] - 2026-06-12
- Autonomous version bump via Executive Protocol.

## [0.1.37] - 2026-06-12
- Autonomous version bump via Executive Protocol.

## [0.1.38] - 2026-06-12
- Autonomous version bump via Executive Protocol.

## [0.1.39] - 2026-06-12
- Autonomous version bump via Executive Protocol.

## [0.1.37] - 2026-06-12
- Autonomous version bump via Executive Protocol.

## [0.1.38] - 2026-06-12
- Autonomous version bump via Executive Protocol.

## [0.1.39] - 2026-06-12
- Autonomous version bump via Executive Protocol.

## [0.1.40] - 2026-06-12
- Autonomous version bump via Executive Protocol.

## [0.1.41] - 2026-06-12
- Autonomous version bump via Executive Protocol.

## [0.1.43] - 2026-06-14
### Added
- Multi-hop distance-vector routing protocol (Bellman-Ford / RIP-style).
- `DistanceVectorTable` with sequence-numbered route advertisements.
- Periodic routing table exchange (30s interval) via `xrnet-route-update` Gossipsub topic.
- Stale route detection (3-minute timeout) and automatic invalidation.
- Neutrality-aware fallback routing when DV table has no specific route.
- `MeshPacket` enhancements: `packet_id` for dedup, `next_hop` targeting, `advance()` hop counter.
- Comprehensive unit test suite (20+ tests) for routing engine.
- Route advertisement `seq` for loop prevention and freshness ordering.
- Immediate re-advertisement on route table changes (triggered update propagation).
- `RoutingEngine::route_packet()` now consults distance-vector table first, then falls back to neutrality-based selection.

## [0.1.42] - 2026-06-12
- Autonomous version bump via Executive Protocol.

## [0.1.45] - 2026-06-19
- Autonomous version bump via Executive Protocol.

## [0.1.46] - 2026-06-19
- Autonomous version bump via Executive Protocol.

## [0.1.47] - 2026-06-19
- Autonomous version bump via Executive Protocol.

## [0.1.48] - 2026-06-19
- Autonomous version bump via Executive Protocol.

## [0.1.49] - 2026-06-19
- Autonomous version bump via Executive Protocol.

## [0.1.50] - 2026-06-19
- Autonomous version bump via Executive Protocol.

## [0.1.51] - 2026-06-19
- Autonomous version bump via Executive Protocol.

## [0.1.52] - 2026-06-19
- Autonomous version bump via Executive Protocol.

## [0.1.53] - 2026-06-19
- Autonomous version bump via Executive Protocol.

## [0.1.54] - 2026-06-19
- Autonomous version bump via Executive Protocol.

## [0.1.55] - 2026-06-19
- Autonomous version bump via Executive Protocol.

## [0.1.56] - 2026-06-19
- Autonomous version bump via Executive Protocol.

## [0.1.57] - 2026-06-19
- Autonomous version bump via Executive Protocol.

## [0.1.58] - 2026-06-19
- Autonomous version bump via Executive Protocol.

## [0.1.59] - 2026-06-19
- Autonomous version bump via Executive Protocol.

## [0.1.60] - 2026-06-19
- Autonomous version bump via Executive Protocol.

## [0.1.61] - 2026-06-19
- Autonomous version bump via Executive Protocol.

## [0.1.62] - 2026-06-19
- Autonomous version bump via Executive Protocol.

## [0.1.63] - 2026-06-19
- Autonomous version bump via Executive Protocol.

## [0.1.64] - 2026-06-19
- Autonomous version bump via Executive Protocol.

## [0.1.65] - 2026-06-19
- Autonomous version bump via Executive Protocol.

## [0.1.66] - 2026-06-20
- Autonomous version bump via Executive Protocol.

## [0.1.67] - 2026-06-20
- Autonomous version bump via Executive Protocol.

## [0.1.68] - 2026-06-20
- Autonomous version bump via Executive Protocol.

## [0.1.69] - 2026-06-23
- Autonomous version bump via Executive Protocol.

## [0.1.70] - 2026-06-23
- Autonomous version bump via Executive Protocol.

## [0.1.71] - 2026-06-23
- Autonomous version bump via Executive Protocol.

## [0.1.72] - 2026-06-23
- Autonomous version bump via Executive Protocol.

## [0.1.73] - 2026-06-23
- Autonomous version bump via Executive Protocol.

## [0.1.74] - 2026-06-23
- Autonomous version bump via Executive Protocol.

## [0.1.75] - 2026-06-25
- Autonomous version bump via Executive Protocol.

## [0.1.76] - 2026-06-25
- Autonomous version bump via Executive Protocol.

## [0.1.77] - 2026-06-25
- Autonomous version bump via Executive Protocol.

## [0.1.78] - 2026-06-25
- Autonomous version bump via Executive Protocol.

## [0.1.79] - 2026-06-25
- Autonomous version bump via Executive Protocol.

## [0.1.80] - 2026-06-25
- Autonomous version bump via Executive Protocol.

## [0.1.81] - 2026-06-25
- Autonomous version bump via Executive Protocol.

## [0.1.82] - 2026-06-25
- Autonomous version bump via Executive Protocol.

## [0.1.83] - 2026-06-25
- Autonomous version bump via Executive Protocol.

## [0.1.84] - 2026-06-25
- Autonomous version bump via Executive Protocol.

## [0.1.85] - 2026-06-25
- Autonomous version bump via Executive Protocol.

## [0.1.86] - 2026-06-25
- Autonomous version bump via Executive Protocol.

## [0.1.87] - 2026-06-25
- Autonomous version bump via Executive Protocol.

## [0.1.88] - 2026-06-25
- Autonomous version bump via Executive Protocol.

## [0.1.89] - 2026-06-25
- Autonomous version bump via Executive Protocol.

## [0.1.90] - 2026-06-25
- Autonomous version bump via Executive Protocol.

## [0.1.91] - 2026-06-25
- Autonomous version bump via Executive Protocol.

## [0.1.92] - 2026-06-25
- Autonomous version bump via Executive Protocol.

## [0.1.93] - 2026-06-25
- Autonomous version bump via Executive Protocol.

## [0.1.94] - 2026-06-25
- Autonomous version bump via Executive Protocol.

## [0.1.95] - 2026-06-25
- Autonomous version bump via Executive Protocol.

## [0.1.96] - 2026-06-25
- Autonomous version bump via Executive Protocol.

## [0.1.97] - 2026-11-04
- Autonomous version bump via Executive Protocol.

## [0.1.98] - 2026-11-04
- Autonomous version bump via Executive Protocol.

## [0.1.99] - 2026-11-04
- Autonomous version bump via Executive Protocol.

## [0.1.104] - 2026-11-04
- Autonomous version bump via Executive Protocol.

## [0.1.105] - 2026-11-04
- Autonomous version bump via Executive Protocol.

## [0.1.106] - 2026-11-04
- Autonomous version bump via Executive Protocol.

## [0.1.107] - 2026-11-04
- Autonomous version bump via Executive Protocol.

## [0.1.108] - 2026-11-04
- Autonomous version bump via Executive Protocol.

## [0.1.109] - 2026-11-04
- Autonomous version bump via Executive Protocol.

## [0.1.109] - 2026-11-04
### Added
- Integrated Swarm Gossipsub recent messages store and API endpoint GET /api/messages/recent with auto-broadcasting on POST /api/messages/send.
- Graceful shutdown endpoint POST /api/system/shutdown in backend system API.
- Dynamic version resolution from VERSION.md in api/system.rs.
- Systray background service manager script scripts/systray_manager.py with daemon start, stop/shutdown, status inspection, and live log tailing.
- New React frontend components: BobcoinPanel (balance inquiry, transactions), SwarmMessagePanel (real-time message feed, topic broadcasting), and GovernancePanel (neutrality metrics submission).
- Comprehensive tooltip markers and contextual operational guidance across all UI panels.
- Re-architected frontend dashboard into 4 consolidated high-value sections: P2P Swarm & Core Communications, Economic & Trust Layer, Spatial Operating System & AI, and Governance, Plugins & Fleet Telemetry.
- Standardized frontend backend API endpoint routing to port 3000 via config.ts.
### Changed
- Archived legacy root scripts patch_*.py into archive_patches/ nondestructively.
- Enhanced start.sh with automatic port 3000 hygiene and daemon coordination.
- Hardened scripts/sync_repo.sh with working directory preservation guards.

## [0.1.110] - 2026-11-04
- Autonomous version bump via Executive Protocol.

## [0.1.111] - 2026-11-04
- Autonomous version bump via Executive Protocol.

## [0.1.112] - 2026-11-04
- Autonomous version bump via Executive Protocol.

## [0.1.113] - 2026-11-06
- Autonomous version bump via Executive Protocol.

## [0.1.114] - 2026-11-06
- Autonomous version bump via Executive Protocol.

## [0.1.115] - 2026-11-06
- Autonomous version bump via Executive Protocol.

## [0.1.116] - 2026-11-06
- Autonomous version bump via Executive Protocol.

## [0.1.117] - 2026-11-06
- Autonomous version bump via Executive Protocol.

## [0.1.118] - 2026-11-06
- Autonomous version bump via Executive Protocol.

## [0.1.119] - 2026-11-06
- Autonomous version bump via Executive Protocol.

## [0.1.120] - 2026-11-06
- Autonomous version bump via Executive Protocol.

## [0.1.121] - 2026-11-06
- Autonomous version bump via Executive Protocol.

## [0.1.122] - 2026-11-06
- Autonomous version bump via Executive Protocol.

## [0.1.123] - 2026-11-06
- Autonomous version bump via Executive Protocol.

## [0.1.124] - 2026-11-06
- Autonomous version bump via Executive Protocol.

## [0.1.125] - 2026-11-06
### Added
- Real-time sparkline telemetry bar chart for mesh routing throughput metrics in MonitoringDashboard.
- Automated pulse telemetry simulations for local standalone observability.
- Fully synchronized upstream feature branches and resolved conflicts.

## [0.1.126] - 2026-11-06
- Autonomous version bump via Executive Protocol.

## [0.1.127] - 2026-11-06
- Autonomous version bump via Executive Protocol.

## [0.1.128] - 2026-11-06
- Autonomous version bump via Executive Protocol.

## [0.1.129] - 2026-11-06
- Autonomous version bump via Executive Protocol.

## [0.1.130] - 2026-11-06
- Autonomous version bump via Executive Protocol.

## [0.1.131] - 2026-11-06
- Autonomous version bump via Executive Protocol.
### Added
- Wasm plugin sandbox execution UI in PluginPanel with runtime execution trigger, JSON input payload passing, and output visualizer.

## [0.1.132] - 2026-11-06
- Autonomous version bump via Executive Protocol.

## [0.1.133] - 2026-11-06
- Autonomous version bump via Executive Protocol.

## [0.1.134] - 2026-11-06
- Autonomous version bump via Executive Protocol.

## [0.1.135] - 2026-11-06
- Autonomous version bump via Executive Protocol.

## [0.1.136] - 2026-11-06
- Autonomous version bump via Executive Protocol.

## [0.1.137] - 2026-11-06
- Autonomous version bump via Executive Protocol.

## [0.1.138] - 2026-11-06
### Added
- Added live fleet telemetry backend endpoint `GET /api/telemetry` in `backend/src/api/system.rs` reporting peers, packet rate, neutrality score, uptime, and peer RTT latencies.
- Upgraded `frontend/src/components/MonitoringDashboard.tsx` with dynamic polling of `/api/telemetry` every 3s, real-time throughput sparkline history, and dedicated peer latency list visualizer.

## [0.1.143] - 2026-11-07
- Autonomous version bump via Executive Protocol.

## [0.1.144] - 2026-11-07
- Autonomous version bump via Executive Protocol.

## [0.1.145] - 2026-11-07
### Added
- Upgraded `scripts/deploy_prod.sh` production rollout script to target port 3000 Axum health check and verify responsive JSON status.
- Added status synchronization writing `status.json` and `backend/status.json` on backend startup to coordinate with `main.py` and deployment scripts.
- Ignored runtime deployment smoke logs `prod_smoke.log` and generated systemd service files `xrnet.service` in `.gitignore`.

## [0.1.146] - 2026-11-07
- Autonomous version bump via Executive Protocol.

## [0.1.147] - 2026-11-07
- Autonomous version bump via Executive Protocol.

## [0.1.148] - 2026-11-07
- Autonomous version bump via Executive Protocol.

## [0.1.149] - 2026-11-07
- Autonomous version bump via Executive Protocol.

## [0.1.150] - 2026-11-07
- Autonomous version bump via Executive Protocol.

## [0.1.151] - 2026-11-07
- Autonomous version bump via Executive Protocol.

## [0.1.152] - 2026-11-08
- Autonomous version bump via Executive Protocol.

## [0.1.153] - 2026-11-08
- Autonomous version bump via Executive Protocol.

## [0.1.154] - 2026-11-08
- Autonomous version bump via Executive Protocol.

## [0.1.155] - 2026-11-08
- Autonomous version bump via Executive Protocol.

## [0.1.156] - 2026-11-10
- Autonomous version bump via Executive Protocol.

## [0.1.157] - 2026-11-10
- Autonomous version bump via Executive Protocol.

## [0.1.158] - 2026-11-10
- Autonomous version bump via Executive Protocol.

## [0.1.159] - 2026-11-10
- Autonomous version bump via Executive Protocol.

## [0.1.160] - 2026-11-10
- Autonomous version bump via Executive Protocol.

## [0.1.161] - 2026-11-10
- Autonomous version bump via Executive Protocol.

## [0.1.162] - 2026-11-10
- Autonomous version bump via Executive Protocol.

## [0.1.163] - 2026-11-10
- Autonomous version bump via Executive Protocol.

## [0.1.164] - 2026-11-10
- Autonomous version bump via Executive Protocol.
