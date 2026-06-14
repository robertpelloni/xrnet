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

## 5. Multi-Hop Routing
- **Endpoint:** `GET /api/status`
- **Description:** Extended with routing table size and neutrality index fields.
- **Extended Response:**
  ```json
  {
    "peer_id": "12D3KooW...",
    "peers": 42,
    "network": "Integrated",
    "neutrality": 1.0,
    "best_arbitrator": "12D3Koo...",
    "version": "0.1.43"
  }
  ```

### Route Update Protocol (Internal, Gossipsub `xrnet-route-update`)
- Peers exchange `RouteUpdate` messages containing route entries with destination, metric (hop count), and sequence number.
- Route advertisements are published automatically every 30 seconds.
- Changes to the routing table trigger immediate re-advertisement.
- Stale routes (no update in 3 minutes) are pruned.

### Packet Forwarding (Internal, Gossipsub `xrnet-routing`)
- Packets include `source`, `destination`, `next_hop`, `hop_count`, `max_hops`, `packet_id` fields.
- Intermediate peers forward packets by looking up the destination in the distance-vector table.
- If no specific route exists, the peer with the highest Neutrality Index score is selected as fallback.
- TTL enforcement: packets exceeding `max_hops` are dropped.

## 6. Autonomous Protocol
- **Endpoint:** `POST /api/system/protocol`
- **Description:** Triggers the execution of the Executive Autonomous Protocol (Repo sync, build, etc.).
- **Response:** Returns `stdout`, `stderr`, and `exit_code` of the protocol execution.
