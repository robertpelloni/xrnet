# CHANGELOG: xrnet

## [0.1.71] - 2026-06-23
### Added
- Implemented ZK-Proof logic in `backend/src/social.rs` utilizing `bellman` and `bls12_381`.
- Mocked generation and verification of ZK proofs, and connected it to the `/api/social/match` endpoint in `backend/src/api/social.rs`.
- Integrated Neutral Arbitration with Escrow, adding a `/api/escrow/dispute/:id` endpoint in `backend/src/api/escrow.rs`.
- Created `EscrowPanel.tsx` and `SocialMatchPanel.tsx` in the frontend to interface with Escrow and Matchmaking features.

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
