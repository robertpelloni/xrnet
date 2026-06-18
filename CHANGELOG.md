# CHANGELOG: xrnet


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
