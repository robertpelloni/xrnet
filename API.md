# XRNet API Reference (v0.2.16)

The XRNet backend exposes a REST API (default port 8080) to interact with the underlying P2P swarm and spatial layers.

## 1. System Status
### `GET /api/status`
Returns real-time telemetry and identity data for the node.
- **Response:**
  ```json
  {
    "peer_id": "12D3Koo...",
    "peers": 42,
    "network": "Standalone | Integrated",
    "version": "0.2.16",
    "uptime_secs": 3600,
    "messages_sent": 10,
    "messages_received": 15,
    "cpu_usage": 15.5,
    "memory_usage": 42.1
  }
  ```

## 2. Decentralized Discovery & Profile
### `GET /api/profile`
Lists all discovered user profiles stored in the local DHT cache.
### `POST /api/dht/put`
Publishes a record to the Kademlia DHT.
- **Request Body:**
  ```json
  { "key": "string", "value": "string" }
  ```
- **Conventions:**
  - `profile:{PEER_ID}`: User identity and alias.
  - `market:{PEER_ID}:{TIMESTAMP}`: Marketplace listings.
### `GET /api/dht/get?key={KEY}`
Initiates a query to find a specific record in the global DHT.

## 3. Mesh Messaging (Communicate)
### `GET /api/messages/list`
Retrieves the history of messages received on the global mesh topic.
### `POST /api/messages/send`
Publishes a message to the "xrnet-global" Gossipsub topic.
- **Request Body:**
  ```json
  { "content": "Hello mesh!" }
  ```

## 4. Marketplace (Shop & Sell)
### `GET /api/market/list`
Returns a list of all marketplace items discovered on the network.

## 5. Mesh-Wide Monitoring API (Central Control)
### `GET /api/mesh/status` (Port 9001)
Returns aggregated telemetry for all reporting peers in the mesh.
- **Response:**
  ```json
  {
    "PEER_ID": [
      { "cpu": 15.5, "memory": 42.1, "peers": 3, "timestamp": 123456789 },
      ...
    ]
  }
  ```

## 6. Executive Protocol
### `POST /api/system/protocol`
Triggers the Autonomous Executive Protocol engine for repository sync and codebase analysis.
- **Response:** Success/Error with stdout/stderr logs.
