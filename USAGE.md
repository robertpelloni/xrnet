# XRNet Usage Manual

This guide provides instructions for interacting with the XRNet mesh network ecosystem.

## 1. Accessing the Dashboard
Once XRNet is running (refer to [DEPLOY.md](DEPLOY.md) for startup instructions), access the dashboard via your web browser:
- **Debug Mode:** `http://localhost:5173`
- **Production Mode:** `http://localhost:8080` (or configured `API_PORT`)

## 2. Identity & Discovery
### Publishing Your Profile
To make yourself discoverable on the mesh network:
1. Locate the **System Status** panel.
2. Click **Publish My Profile**.
3. Enter a network alias (e.g., "Alice-Node-01").
4. Your alias is now published to the Kademlia DHT. Other nodes will see you in their **Network Discovery** panel.

## 3. Communication (Communicate)
The **Communicate** panel provides real-time chat across the entire mesh using Gossipsub.
- **Viewing Messages:** Incoming messages from all peers on the "xrnet-global" topic will appear automatically.
- **Sending Messages:** Type your message in the "Message mesh..." input field and press **Send**. The message is immediately propagated to all connected peers.

## 4. Commerce (Shop & Sell)
XRNet enables fair, decentralized commerce via the **Shop & Sell** panel.
### Listing an Item
1. Click **List Item for Sale**.
2. Enter the description of your good or service (e.g., "3D Scanning Services").
3. The listing is stored in the DHT with a unique identifier linked to your Peer ID.
### Browsing Marketplace
- Active listings from the network are displayed in the marketplace list.
- The list updates automatically as the mesh discovers new DHT records.

## 5. System Management
### Autonomous Executive Protocol
Users can trigger the **Executive Protocol** manually via the button in the **System Status** panel. This will:
- Synchronize the local repository with upstream changes.
- Perform a gap analysis of the codebase.
- Increment the internal versioning if required.
### Performance Monitoring
System administrators can monitor node health in real-time. Use the `scripts/monitor_performance.py` utility to capture detailed telemetry:
```bash
python3 scripts/monitor_performance.py --duration 600 --interval 5
```
Metrics include CPU/RAM usage, peer counts, and message throughput.

## 6. Spatial Layer
The **Spatial Layer** panel displays a real-time 3D visualization (Three.js) of your environment's digital twin. As spatial scanning modules are integrated, this view will reflect the live photorealistic Gaussian Splatting data.
