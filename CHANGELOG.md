# CHANGELOG: xrnet

## [1.6.0] - 2026-06-10
### Added: Governance Analytics Milestone
- **Reputation-Weighted Voting:** Updated the governance engine to weight votes based on individual peer reputation.
- **Reputation Rewards:** Proposers (+5) and voters (+1) now earn reputation for mesh participation.
- **Aggregated Stats API:** Added `/api/system/stats` for high-level governance and mesh health monitoring.
- **Reputation Dashboard:** Integrated reputation visualization into both local and central mesh monitors.
- **Governance Health Metrics:** Visualized active proposals, total votes, and aggregate governance weight in the dashboard.

## [1.5.0] - 2026-06-09
### Added: Management & Scalability Milestone
- **Central Command-and-Control:** Enhanced the mesh monitor with an API and UI to remotely manage nodes (Sync, Reboot).
- **Advanced Benchmarking:** Upgraded `benchmark_mesh.py` with latency, throughput, and automated sequential scalability tests.
- **Scalability Validation:** Verified sub-5ms mesh propagation latency across configurations of 3, 5, and 8 nodes.

## [1.4.0] - 2026-06-09
### Added: The "Everything App" Milestone
- **Decentralized Governance:** Implemented `governance.rs` for task proposals and reputation-weighted voting.
- **Learning Hub:** Created `LearningHub.tsx` for mesh-based educational content sharing via DHT.
- **Economic Integration:** Fully integrated Bobcoin payments for marketplace transactions.
- **Multi-Device Networking:** Enabled external mesh participation by binding to `0.0.0.0` and adding `MONITOR_HOST` support.

## [1.0.0] - 2026-06-08
### Final Release: The Decentralized Spatial OS
- Established the production baseline for the XRNet ecosystem.
- Integrated Bobcoin as the native decentralized currency.
- Finalized Phase 3: Spatial Integration & Simulation (100% Complete).
