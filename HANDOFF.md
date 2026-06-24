# HANDOFF: Session Persistence

## System State (v0.1.44)
- **Architecture:** Modular Rust backend (mesh, routing, governance, escrow, social) + React/Vite Frontend.
  - Extracted monolithic backend API in `main.rs` into discrete Axum route modules under `api/`.
  - Modularized React `App.tsx` by extracting `StatusPanel`, `ProtocolPanel`, and `DiscoveryPanel` components.
- **Routing Protocol:** Multi-hop distance-vector routing (Bellman–Ford / RIP-style) implemented:
  - `DistanceVectorTable` with sequence-numbered route advertisements
  - Periodic route exchange (30s interval) via `xrnet-route-update` Gossipsub topic
  - Stale route detection (180s timeout)
  - Neutrality-aware fallback when DV route unavailable
  - TTL enforcement with hop_count < max_hops
  - Immediate triggered re-advertisement on table changes
  - Comprehensive unit test suite (20+ tests)
  - Cleaned up unused methods.
- **Protocol Layers:** Gossipsub topics: `xrnet-global`, `xrnet-routing`, `xrnet-route-update`
- **Economic Layer:** Bobcoin consensus linked via backend proxy.
- **TODO Status:** Refactoring monolithic backend and modularizing React app marked [x] in TODO.md.

## Next Session Focus
- Scale testing the distance-vector routing across >10 simulated nodes.
- Implement ZK-Proof verification for social interest matchmaking.
- Connect Neutral Arbitration logic to Escrow dispute resolution flow.
- Expand spatial AI models to include semantic object persistent storage in the mesh.
