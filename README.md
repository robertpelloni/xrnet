# xrnet - Autonomous Mesh Network Ecosystem (v1.0.0)

XRNet is a decentralized spatial computing platform merging photorealistic 3D environments with a P2P internet operating system. It enables users to communicate, trade, and interact within a neutral, autonomous mesh network.

## 🚀 Quick Start (Debug Mode)
1. **Initialize Dependencies:**
   ```bash
   ./scripts/setup_production.sh
   ```
2. **Build the System:**
   ```bash
   ./build.sh
   ```
3. **Launch XRNet:**
   ```bash
   ./start.sh
   ```
   Access the dashboard at `http://localhost:5173`.

## 📦 Production Deployment (Single-Unit)
XRNet can be deployed as a single optimized binary that serves the UI and protocol API on a single port.
```bash
./scripts/deploy_prod.sh
```
Access the production instance at `http://localhost:8080`.

## ✨ Core Features (Phase 2)
- **Decentralized Messaging:** Real-time mesh chat using libp2p Gossipsub.
- **Distributed Marketplace:** DHT-based listing and discovery for goods/services.
- **Spatial Viewer:** Three.js-powered 3D visualization of spatial data.
- **Autonomous Telemetry:** Integrated performance monitoring (CPU/RAM/P2P throughput).
- **Executive Protocol:** Autonomous repository synchronization and self-governance engine.

## 🛠 Technical Implementation
- **Backend:** Rust, libp2p (Gossipsub, Kademlia, mDNS), Axum.
- **Frontend:** React 19, TypeScript, Three.js, Vite.
- **Infrastructure:** Monorepo with integrated CI/CD pipeline and multi-node benchmarking.

## 📖 Documentation
- [Architecture Details](ARCHITECTURE.md) - Deep dive into the P2P stack and component interaction.
- [API Reference](API.md) - Complete REST API documentation for node interaction.
- [Deployment Guide](DEPLOY.md) - Detailed production rollout and monitoring instructions.
- [Usage Manual](USAGE.md) - Step-by-step guide on using mesh features.
- [Project Vision](VISION.md) - The long-term roadmap for the Everything Protocol.
- [Release Notes](RELEASE_NOTES.md) - Summary of the v1.0.0 Ecosystem completion.

---

## The Vision
Merging **hyper-realistic spatial computing** with a **completely decentralized, all-in-one internet operating system**.

Let's break down how this architecture would actually look if you built it, combining the hardware/AI scanning piece with the distributed network layer.

### 1. The Hardware & AI Layer (Spatial Scanning & Cataloging)
Instead of just looking at flat screens, an advanced AR headset (the "Vision Pro on steroids") would utilize continuous, real-time spatial mapping.
* **Real-time Gaussian Splatting / NeRFs:** Current AR uses basic polygon meshes to understand walls. Your system would use advanced 3D Gaussian Splatting. As you walk around your house, the headset constantly radiates sub-millimeter scans, capturing not just geometry, but exact photorealistic lighting, reflections, and textures.
* **AI Object Recognition & Semantic Labeling:** An onboard Multimodal Large World Model (LWM) watches the data stream. It doesn't just see a "shape"; it identifies specific objects and their state.

### 2. The Distributed App Layer (The Everything Protocol)
Here is how that single network replaces the modern internet silos:

| Traditional Platform | Distributed Protocol Equivalent | How it Works in XRNet |
| --- | --- | --- |
| **Google** | Decentralized Indexing | Peer-to-peer nodes index web data and spatial maps locally, allowing zero-knowledge search across the network. |
| **Reddit / Telegram** | Cryptographic Pub-Sub | Real-time messaging and community channels via Gossipsub. |
| **YouTube / OnlyFans** | Distributed Streaming | Video split into encrypted chunks and seeded across the mesh. |
| **Xbox** | Edge Cloud Gaming | Utilizing local spatial compute and P2P mesh for low-latency gaming. |
| **Marketplace** | DHT discovery | Fair, middleman-free commerce using Kademlia records. |

---

It’s a sci-fi concept that elegantly bridges the physical world with a decentralized web, turning reality itself into an indexable database.
