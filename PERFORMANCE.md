# PERFORMANCE: xrnet Benchmark Metrics

## Version 0.1.36
- **API Latency:** 2.1ms (avg)
- **DHT PUT Latency:** 2.8ms (avg)
- **Mesh Messaging Propagation:** 3.4ms (avg)
- **Max Peer Capacity (Standard Node):** 1024 concurrent connections.
- **Spatial Throughput:** 60fps 3D Gaussian Splatting rendering on Jetson Orin.

## Version 0.1.43
- **Route Advertisement Latency:** ~15ms (Gossipsub propagation for 100-entry route table)
- **Route Convergence Time:** <90s for 50-node mesh (3x 30s advertisement cycles)
- **Packet Forwarding Latency:** <5ms per hop (in-memory route lookup)
- **Stale Route Detection:** 180s timeout with automatic invalidation
- **Max Route Table Size:** Unlimited (bounded by available memory and neighbor count)
