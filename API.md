# XRNet REST API Reference

The XRNet backend provides a RESTful API for system monitoring, P2P interaction, and economic operations.

## 1. System Status
- **Endpoint:** `GET /api/status`
- **Description:** Returns the current node status, peer count, network state, and version.
- **Response Format:**
  ```json
  {
    "peer_id": "12D3KooW...",
    "peers": 42,
    "network": "Integrated",
    "version": "0.1.5"
  }
  ```

## 2. Peer Profiles (DHT)
- **Endpoint:** `GET /api/profile`
- **Description:** Lists all discovered peer profiles stored in the local DHT cache.
- **Endpoint:** `POST /api/dht/put`
- **Description:** Publishes a record to the Kademlia DHT.
- **Request Body:** `{"key": "profile:...", "value": "alias"}`

## 3. Mesh Messaging
- **Endpoint:** `POST /api/messages/send`
- **Description:** Publishes a message to the `xrnet-global` Gossipsub topic.
- **Request Body:** `{"content": "Hello mesh!"}`

## 4. Economic Layer (Bobcoin Proxy)
- **Endpoint:** `GET /api/bobcoin/balance/:account`
- **Description:** Proxies a balance check request to the Bobcoin consensus node.
- **Endpoint:** `POST /api/bobcoin/process`
- **Description:** Proxies a signed block submission to the Bobcoin consensus node.

## 5. Autonomous Protocol
- **Endpoint:** `POST /api/system/protocol`
- **Description:** Triggers the execution of the Executive Autonomous Protocol (Repo sync, build, etc.).
- **Response:** Returns `stdout`, `stderr`, and `exit_code` of the protocol execution.
