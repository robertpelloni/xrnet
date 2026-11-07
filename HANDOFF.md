# HANDOFF: xrnet System State & Context

## Target Version
`v0.1.141`

## Operational Summary
1. **Unified Dashboard Architecture**:
   - The single-page dashboard at `frontend/src/App.tsx` organizes the entire decentralized spatial mesh into four operational tiers:
     - **P2P Swarm & Core Communications**: System Status & Engine, Protocol & DHT (with live Distance-Vector routing table and multi-hop packet dispatch), Global Mesh Feed & Broadcast, and Peer Discovery & Profiles.
     - **Economic & Trust Layer**: Bobcoin Consensus & Micropayments, Escrow & Arbitration, and Social Matchmaking (ZK-Proofs).
     - **Spatial Operating System & AI**: Real-time 3D Gaussian Splatting point cloud visualization, LiDAR mapping, and decentralized spatial anchors.
     - **Governance, Plugins & Fleet Telemetry**: Algorithmic neutrality scoring, Mesh Job/Task Bounty board, sandboxed Wasm plugin ecosystem, and live Fleet Telemetry & Observability.
   - Every interactive control includes descriptive `title` tooltips, dynamic status indicators, and operational feedback.

2. **Backend Enhancements**:
   - **Privacy-Preserving ZK Matchmaking (`backend/src/social.rs`, `backend/src/api/social.rs`)**:
     - Calculates compatibility scores based on Jaccard similarity across salted, blinded interest hash sets.
     - Validates payload attributes seamlessly supporting both `{my_interests, peer_interests}` and `{interests, other_interests}`.
     - Verifies Groth16 / BLS12-381 zero-knowledge proofs and returns blinded matches, match count, and overall percentage compatibility.
   - **Multi-Hop Distance-Vector Routing (`backend/src/mesh.rs`, `backend/src/routing.rs`, `backend/src/api/routing.rs`)**:
     - Route querying (`GET /api/routing/routes`) and packet dispatching (`POST /api/routing/dispatch`) backed by shared `DistanceVectorTable`.
   - **System Telemetry & Lifecycle (`backend/src/api/system.rs`)**:
     - Telemetry reporting (`GET /api/telemetry`) and graceful daemon shutdown (`POST /api/system/shutdown`).

3. **Lifecycle & Service Management**:
   - `scripts/systray_manager.py` manages `xrnet-backend` and Vite services with `start`, `stop`, `status`, `tail`, and GUI tray icons via `pystray` (with automatic fallback to headless mode).
   - Port 3000 hygiene is automated via `./start.sh` and `systray_manager.py`.

## Verification Status
- Backend unit tests (`cargo test`): 17 passed, 0 failed.
- Frontend compilation (`npm run build`): Clean build, 0 errors.
- Visual Verification: Verified using Playwright headless test capturing `/home/jules/verification/social_zk_match.png`.
