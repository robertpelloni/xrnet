# CHANGELOG: xrnet

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

## [0.2.0] - 2026-06-07
### Added
- Decentralized Messaging (Communicate) via libp2p Gossipsub.
- Decentralized Marketplace Discovery (Shop & Sell) via Kademlia DHT.
- Single-Unit Deployment: Backend now serves Frontend static files directly.
- Release Mode: Support for optimized production builds (`./build.sh release`).
- Multi-node mesh simulation and benchmarking infrastructure.
- System performance monitoring and telemetry reporting via `scripts/monitor_performance.py`.
- UI panels for real-time mesh chat and marketplace listings.
- Dynamic API port configuration via `API_PORT` environment variable.
- Extended DHT API for record retrieval (GET).
- Comprehensive System Architecture Documentation (`ARCHITECTURE.md`).
- API Reference Guide (`API.md`).
- User Manual and Step-by-Step Usage Guide (`USAGE.md`).
- Production Setup and Rollout Scripts (`scripts/setup_production.sh`, `scripts/deploy_prod.sh`).
- Enhanced Executive Protocol documentation and vision for the "Everything App".

## [0.2.7] - 2026-06-08
### Added
- Real-time Performance Telemetry: Integrated `sysinfo` in the Rust backend.
- Network Health Dashboard: Visualized CPU and Memory usage with `recharts` in the frontend.
- Enhanced API Telemetry: `/api/status` now includes live hardware metrics.
- Autonomous version bump via Executive Protocol.

## [0.2.2] - 2026-06-08
- Autonomous version bump via Executive Protocol.

## [0.2.3] - 2026-06-08
- Autonomous version bump via Executive Protocol.

## [0.2.4] - 2026-06-08
- Autonomous version bump via Executive Protocol.

## [0.2.5] - 2026-06-08
- Autonomous version bump via Executive Protocol.

## [0.2.6] - 2026-06-08
- Autonomous version bump via Executive Protocol.

## [0.2.7] - 2026-06-08
- Autonomous version bump via Executive Protocol.
