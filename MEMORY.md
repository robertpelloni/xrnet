# MEMORY: xrnet Architectural Observations

## Initial State (v0.1.0)
- The repository started as a vision-only README.
- Architecture is conceptualized as a combination of a spatial scanning layer and a distributed application protocol layer.

## Design Preferences
- **Decentralization:** Strong preference for P2P and cryptographic protocols (Veilid, IPFS).
- **Photorealism:** Use of Gaussian Splatting for spatial mapping.
- **Privacy:** Emphasis on Zero-Knowledge Proofs and local data storage.

## Codebase Traits
- Currently in the documentation and structural initialization phase.
- Aiming for a monorepo-style structure to manage backend, frontend, and spatial components.

## Proposed Technical Architecture
- **Backend (The Everything Protocol):**
    - **Language:** Rust (for performance and safety).
    - **P2P Framework:** [Veilid](https://veilid.com/) or [libp2p](https://libp2p.io/).
    - **Storage:** IPFS for large assets, DHT for indexing.
    - **Security:** Zero-Knowledge Proofs for identity and privacy-preserving computation.
- **Frontend (The User Interface):**
    - **Platform:** React / React Native for cross-platform availability.
    - **3D Rendering:** Three.js or WebGPU for spatial data visualization in the browser.
- **Spatial (The Scanning Layer):**
    - **AI Models:** LWM (Large World Models) for object classification.
    - **Technique:** 3D Gaussian Splatting for photorealistic environmental mapping.
    - **Hardware Integration:** Support for Vision Pro, Meta Quest, and mobile LIDAR devices.
