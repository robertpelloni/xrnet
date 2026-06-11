# XRNet System Usage Manual

Welcome to the autonomous spatial mesh. This manual explains how to interact with the XRNet ecosystem.

## 1. Accessing the Dashboard

Once the node is started (`./start.sh`), navigate to:
`http://localhost:5173`

The dashboard provides a real-time overview of:
- **System Status:** Node connectivity and version.
- **Mesh Health:** Resource usage of all connected peers.
- **Spatial Viewer:** 3D visualization of synchronized scans.

## 2. Decentralized Communication

Use the **Communicate** panel to send real-time messages to the mesh.
- Messages are propagated via Gossipsub.
- No central server logs or stores your chats.

## 3. Marketplace (Shop & Sell)

XRNet features a middleman-free marketplace backed by the Kademlia DHT.
- **List an Item:** Click "List Item for Sale" to publish an offer.
- **Discover:** Use the search bar to find goods and services offered by other peers.
- **Transactions:** Payments are processed via the integrated Bobcoin economic layer.

## 4. Spatial Intelligence

The **Spatial Layer** automatically synchronizes photorealistic 3D scans across the mesh.
- View the "Digital Twin" of your surroundings in the 3D viewer.
- AI models (LWM) automatically label objects for spatial search.

## 5. Network Discovery

Publish your presence to help other peers find you:
- Click **Publish My Profile** and enter an alias.
- Your identity is cryptographically tied to your PeerID.

## 6. Autonomous Protocol

For developers and advanced users:
- The **Run Autonomous Protocol** button triggers the node's self-update and synchronization engine.
- This ensures your node is always running the latest verified mesh logic.
