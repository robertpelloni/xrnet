# CHANGELOG: xrnet

## [1.11.10] - 2026-06-11
### Added: Production Readiness Milestone
- **System Architecture:** Finalized comprehensive `ARCHITECTURE.md` detailing Phase 4 advancements.
- **Rollout Automation:** Enhanced `deploy_prod.sh` with automated health checks and systemd service generation.
- **Fairness Engine:** Fully documented the reputation and neutrality-weighted task matching algorithm.
- **Operational Stability:** Verified full system deployment with persistent telemetry and dashboard integration.

## [1.10.9] - 2026-06-11
### Added: Performance & Analytics Milestone
- **E2E Latency Tracking:** Implemented structured `ProtocolMessage` with timestamps to calculate real-time propagation delay across the mesh.
- **Historical Persistence:** Added `mesh_history.json` to persist telemetry trends and health metrics across restarts.
- **Spatial Health Overlay:** Integrated AI model health and LIDAR status into the dashboard.
- **Advanced Discovery:** Refactored mesh discovery into a dedicated `DiscoveryManager` with static bootstrap support.
- **Fair Management:** Implemented "Fairness" and "Completion Rate" metrics for automated peer ranking.
- **Service Discovery:** Added `/api/market/search` for real-time DHT-backed filtering of goods and services.

## [1.9.0] - 2026-06-10
### Added: Hardware Integration & Performance Testing
- **Compatibility Validation:** Added `validate_hardware_compatibility.py` to verify target system specs (CPU, RAM, Disk).
- **API Performance Benchmarking:** Implemented `benchmark_hardware_performance.py` to certify sub-10ms response times.
- **Release Documentation:** Created `RELEASE_NOTES.md` with production certifications and hardware instructions.
- **Hardware Requirements:** Updated `DEPLOY.md` with precise quad-core and memory specifications.

## [1.8.0] - 2026-06-10
### Added: Deployment & Monitoring Milestone
- **Integrated Rollout:** Upgraded `deploy_prod.sh` to automatically initiate background performance monitoring.
- **Production Baseline:** Established a stable release-ready baseline for live environments.
- **Telemetry Persistence:** Performance logs (`performance_*.log`) are now archived and tracked for historical analysis.
- **Health Verification:** Verified system stability in full release mode with real-world resource monitoring.

## [1.7.0] - 2026-06-10
### Added: Network Health & Topology Milestone
- **Bandwidth Tracking:** Implemented real-time inbound and outbound bandwidth monitoring in the Rust backend.
- **Network Topology:** Developed a visual topology map in the dashboard showing peer connections.
- **Improved Telemetry:** Enhanced reporting to include total bytes, uptime, and reputation.
- **Health Analytics:** Added automated offline detection and alerts for mesh nodes.
- **Interactive Dashboards:** Upgraded the React and central monitors with bandwidth charts and reputation tracking.

## [1.6.0] - 2026-06-10
### Added: Governance Analytics Milestone
- **Reputation-Weighted Voting:** Updated the governance engine to weight votes based on individual peer reputation.
- **Reputation Rewards:** Proposers (+5) and voters (+1) now earn reputation for mesh participation.
- **Aggregated Stats API:** Added `/api/system/stats` for high-level governance and mesh health monitoring.

## [1.5.0] - 2026-06-09
### Added: Management & Scalability Milestone
- **Central Command-and-Control:** Enhanced the mesh monitor with an API and UI to remotely manage nodes (Sync, Reboot).
- **Advanced Benchmarking:** Upgraded `benchmark_mesh.py` with latency, throughput, and automated sequential scalability tests.

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
