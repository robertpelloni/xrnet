# XRNet System Architecture

XRNet is a decentralized spatial operating system built on a modular peer-to-peer (P2P) stack, merging photorealistic spatial computing with a P2P internet operating system.

## 1. Modular P2P Stack (Rust Backend)

The core of XRNet is a high-performance Rust node utilizing `libp2p` for autonomous networking. The backend is modularized into specialized domain engines:

### Connectivity & Discovery (`mesh.rs`)
- **mDNS:** Automatic local peer discovery.
- **Kademlia DHT:** Decentralized storage for peer profiles, marketplace records, and system feedback.
- **Gossipsub:** Real-time mesh messaging and event propagation.

### Neutrality-Aware Routing (`routing.rs`)
- **Engine:** Prioritizes packet forwarding through peers with high **Neutrality Index** scores.
- **Fairness:** Prevents data bottlenecks and ensures unbiased network transit.

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
