# Release Notes - XRNet v0.2.7

## Phase 2+: Performance Visibility & Visualization
This update introduces real-time hardware telemetry and a dedicated network health visualization layer to the XRNet dashboard. v0.2.7 bridges the gap between decentralized backend operations and user-facing performance insights.

### Key Advancements
- **Real-time Performance Telemetry:** Integrated the `sysinfo` crate in the Rust backend to poll live CPU and Memory usage metrics.
- **Network Health Dashboard:** A new frontend visualization panel using `recharts` to display resource utilization trends and mesh traffic statistics.
- **Enhanced API Telemetry:** The `/api/status` endpoint now provides comprehensive system and hardware state data.
- **Improved Version Governance:** Automated synchronization of version metadata across all monorepo components (Coordinator, Backend, Frontend).

### Technical Stack (v0.2.7)
- **Telemetry:** `sysinfo` 0.30 (Native Rust).
- **Visualization:** `recharts` 2.12 (React).
- **Networking:** libp2p 0.54 (TCP, Noise, Yamux, MDNS, Kad, Gossipsub).
- **Backend:** Rust 1.94, Axum 0.7, Tokio 1.37.
- **Frontend:** React 19, TypeScript 6, Three.js 0.184, Vite 8.

### Deployment & Verification
- **Frontend Verification:** Confirmed visualization rendering via Playwright screenshot automation.
- **Backend Verification:** API telemetry integrity verified via Python E2E suite.
- **Structural Validation:** 100% pass rate on system integrity and version consistency checks.

---
*XRNet: Merging spatial reality with a decentralized internet.*
