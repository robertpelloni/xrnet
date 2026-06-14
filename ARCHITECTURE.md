# XRNet System Architecture

XRNet is a decentralized spatial operating system built on a modular peer-to-peer (P2P) stack, merging photorealistic spatial computing with a P2P internet operating system.

## 1. Modular P2P Stack (Rust Backend)

The core of XRNet is a high-performance Rust node utilizing `libp2p` for autonomous networking. The backend is modularized into specialized domain engines:

### Connectivity & Discovery (`mesh.rs`)
- **mDNS:** Automatic local peer discovery.
- **Kademlia DHT:** Decentralized storage for peer profiles, marketplace records, and system feedback.
- **Gossipsub:** Real-time mesh messaging and event propagation.

### Distance-Vector Routing (`routing.rs`)
- **Distance-Vector Protocol:** Implements a Bellman–Ford / RIP-style routing protocol where peers exchange route entries via the `xrnet-route-update` Gossipsub topic.
- **Route Table (`DistanceVectorTable`):** Maintains learned routes with destination, next-hop, hop-count metric, sequence number (for loop prevention / freshness), and last-updated timestamp.
- **Sequence-Numbered Advertisements:** Each peer generates monotonically increasing sequence numbers to prevent routing loops and ensure freshness.
- **Stale Route Detection:** Routes not refreshed within 3 minutes are automatically pruned.
- **Triggered Updates:** Changes to the routing table cause immediate re-advertisement to propagate topology changes rapidly.
- **Neutrality-Aware Fallback (`RoutingEngine`):** When the distance-vector table has no specific route, the engine falls back to selecting the peer with the highest **Neutrality Index**, ensuring unbiased forwarding even for unknown destinations.
- **TTL Enforcement:** Packets with `hop_count >= max_hops` are discarded, preventing infinite loops.

### Routing Protocol Flow
1. **Discovery:** mDNS discovers peers; direct routes are added immediately.
2. **Advertise:** Every 30s, each peer broadcasts its routing table via `xrnet-route-update`.
3. **Learn:** Incoming route updates are processed via the Bellman–Ford algorithm (prefer higher sequence numbers; tie-break with lower metric).
4. **Forward:** Data packets on `xrnet-routing` are forwarded hop-by-hop through intermediate peers using the routing table. Only the intended next-hop processes each packet.

### Neutral Governance (`governance.rs`)
- **Neutrality Index:** Tracks peer performance (uptime, task completion, dispute history).
- **Arbitration:** Automated selection of neutral third-party nodes to resolve economic or social disputes.

### Social Matchmaking (`social.rs`)
- **Blinded Discovery:** Uses SHA-256 hashed interest vectors for privacy-preserving discovery. Peers can identify mutual interests without exposing raw keywords to the DHT (Matchmaking Engine).
- **Learning Hub:** A decentralized knowledge exchange where reputation weights the value of shared information.

### Economic Escrow (`escrow.rs`)
- **Lifecycle:** Manages the state of marketplace transactions (Pending -> Funded -> Completed/Disputed).
- **Bobcoin Integration:** Links task completion to automated value transfer via the Bobcoin layer.

## 2. Distributed Economic Layer (Bobcoin)

XRNet integrates **Bobcoin** as its native decentralized currency.
- **Proxy Pattern:** The backend exposes REST endpoints (`/api/bobcoin/*`) that interface with the `bobcoin-consensus` service.
- **Security:** Simplifies frontend integration while keeping consensus logic isolated.

## 3. Spatial & AI Layer

- **Spatial Viewer:** React/Three.js component for real-time interaction with Gaussian Splatting/LIDAR data.
- **Spatial AI (LWM):** Large World Models stored in `spatial/models/` for semantic environment understanding.

## 4. User Interaction (React Frontend)

- **Mesh Dashboard:** Unified interface for network monitoring, marketplace interaction, and system evolution feedback.
- **Job Task Board:** Interactive marketplace for selling services and accepting mesh-assigned tasks.
- **Discovery Panel:** Live view of decentralized profiles retrieved from the DHT.

## 5. Functional Layer Mapping

| Requirement | Implementation Component | Protocol Layer |
| :--- | :--- | :--- |
| **Communicate** | Gossipsub / Mesh Router | libp2p Gossipsub |
| **Learn** | Learning Hub / Social Engine | Kademlia DHT |
| **Shop / Sell** | Job Board / Escrow Manager | DHT + Bobcoin |
| **Find Goods** | DHT Search / Mesh Packet | Kademlia / Routing |
| **Manage** | Neutrality Index / Arbitration | Governance Engine |
