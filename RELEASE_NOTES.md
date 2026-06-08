# Release Notes - XRNet v0.3.17

## Phase 3+: Real-time Monitoring & Visualization
This update enhances the XRNet monitoring ecosystem with integrated real-time visualization of mesh traffic and direct fleet-wide dashboard connectivity. v0.3.17 provides deep operational visibility for production-scale mesh networks.

### Key Advancements
- **Real-time Performance Telemetry:** Integrated the `sysinfo` crate in the Rust backend to poll live CPU and Memory usage metrics.
- **Network Health Dashboard:** A new frontend visualization panel using `recharts` to display resource utilization trends and mesh traffic statistics.
- **Enhanced API Telemetry:** The `/api/status` endpoint now provides comprehensive system and hardware state data.
- **Improved Version Governance:** Automated synchronization of version metadata across all monorepo components (Coordinator, Backend, Frontend).

### Technical Stack (v0.3.17)
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
