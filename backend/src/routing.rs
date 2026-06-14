use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::time::{Duration, Instant};

/// Represents a packet in the mesh network.
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MeshPacket {
    pub source: String,
    pub destination: String,
    pub next_hop: String,
    pub payload: Vec<u8>,
    pub hop_count: u32,
    pub max_hops: u32,
    pub neutrality_threshold: f64,
    pub packet_id: String,
}

impl MeshPacket {
    /// Create a new packet with a unique id (caller provides the id).
    pub fn new(
        source: String,
        destination: String,
        payload: Vec<u8>,
        max_hops: u32,
        neutrality_threshold: f64,
        packet_id: String,
    ) -> Self {
        Self {
            source,
            destination,
            next_hop: String::new(),
            payload,
            hop_count: 0,
            max_hops,
            neutrality_threshold,
            packet_id,
        }
    }

    /// Returns true if this packet has exceeded its hop limit.
    pub fn is_expired(&self) -> bool {
        self.hop_count >= self.max_hops
    }

    /// Advance the hop count and assign the next hop.
    pub fn advance(&mut self, next: String) {
        self.hop_count += 1;
        self.next_hop = next;
    }

    /// Returns true if this packet has reached its final destination.
    pub fn at_destination(&self, local_peer: &str) -> bool {
        self.destination == local_peer
    }
}

// ── Distance-Vector Routing Protocol ────────────────────────────────────────

/// A route update message exchanged between peers via Gossipsub.
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RouteUpdate {
    pub source_peer: String,
    pub sequence_number: u64,
    pub entries: Vec<RouteEntry>,
}

/// A single entry carried inside a route update.
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RouteEntry {
    pub destination: String,
    pub metric: u32,
    pub sequence_number: u64,
}

/// Internal representation of a known route.
#[derive(Debug, Clone)]
pub struct Route {
    pub destination: String,
    pub next_hop: String,
    pub metric: u32,
    pub sequence_number: u64,
    pub last_updated: Instant,
}

static STALE_AFTER: Duration = Duration::from_secs(180); // 3 minutes

impl Route {
    pub fn is_stale(&self) -> bool {
        self.last_updated.elapsed() > STALE_AFTER
    }
}

/// Distance-vector routing table (Bellman–Ford / RIP-style).
pub struct DistanceVectorTable {
    routes: HashMap<String, Route>,
    next_seq: u64,
}

impl DistanceVectorTable {
    pub fn new() -> Self {
        Self {
            routes: HashMap::new(),
            next_seq: 0,
        }
    }

    // ── Sequence numbers (per-node) ──────────────────────────────────────────

    pub fn next_sequence(&mut self) -> u64 {
        self.next_seq += 1;
        self.next_seq
    }

    // ── Processing incoming route updates ────────────────────────────────────

    /// Process a `RouteUpdate` received from `from_peer`.
    /// Returns `true` if the routing table changed (caller should re-advertise).
    pub fn process_update(&mut self, update: &RouteUpdate, from_peer: &str) -> bool {
        let mut changed = false;

        for entry in &update.entries {
            // Don't learn a route to ourselves through someone else
            if entry.destination == update.source_peer {
                continue;
            }

            let new_metric = entry.metric + 1;

            let should_update = match self.routes.get(&entry.destination) {
                None => true,
                Some(existing) => {
                    entry.sequence_number > existing.sequence_number
                        || (entry.sequence_number == existing.sequence_number
                            && new_metric < existing.metric)
                        || (entry.sequence_number == existing.sequence_number
                            && existing.next_hop == from_peer
                            && existing.metric != new_metric)
                }
            };

            if should_update {
                self.routes.insert(
                    entry.destination.clone(),
                    Route {
                        destination: entry.destination.clone(),
                        next_hop: from_peer.to_string(),
                        metric: new_metric,
                        sequence_number: entry.sequence_number,
                        last_updated: Instant::now(),
                    },
                );
                changed = true;
            }
        }

        changed
    }

    // ── Route lookups ────────────────────────────────────────────────────────

    /// Find the next hop for a destination packet.
    pub fn next_hop(&self, destination: &str) -> Option<String> {
        self.routes
            .get(destination)
            .filter(|r| !r.is_stale())
            .map(|r| r.next_hop.clone())
    }

    /// Get all non-stale entries for building an advertisement.
    pub fn advertisement_entries(&self) -> Vec<RouteEntry> {
        self.routes
            .values()
            .filter(|r| !r.is_stale())
            .map(|r| RouteEntry {
                destination: r.destination.clone(),
                metric: r.metric,
                sequence_number: r.sequence_number,
            })
            .collect()
    }

    // ── Maintenance ──────────────────────────────────────────────────────────

    /// Add / refresh a direct route to a directly-connected peer.
    pub fn add_direct_route(&mut self, peer_id: &str, metric: u32) {
        self.next_seq += 1;
        self.routes.insert(
            peer_id.to_string(),
            Route {
                destination: peer_id.to_string(),
                next_hop: peer_id.to_string(),
                metric,
                sequence_number: self.next_seq,
                last_updated: Instant::now(),
            },
        );
    }

    /// Remove every route whose next-hop is `peer_id` (neighbour went down).
    /// Returns the list of removed destination ids so the caller can log them.
    pub fn invalidate_neighbor(&mut self, peer_id: &str) -> Vec<String> {
        let mut invalidated = Vec::new();
        self.routes.retain(|dest, r| {
            if r.next_hop == peer_id && dest.as_str() != peer_id {
                invalidated.push(dest.clone());
                false
            } else {
                true
            }
        });
        invalidated
    }

    // ── Info ─────────────────────────────────────────────────────────────────

    /// Number of non-stale routes.
    pub fn route_count(&self) -> usize {
        self.routes.values().filter(|r| !r.is_stale()).count()
    }

    /// Return triples `(destination, next_hop, metric)` for status reporting.
    pub fn all_routes(&self) -> Vec<(String, String, u32)> {
        self.routes
            .values()
            .filter(|r| !r.is_stale())
            .map(|r| (r.destination.clone(), r.next_hop.clone(), r.metric))
            .collect()
    }
}

// ── Neutrality-Aware Routing Engine ──────────────────────────────────────────

/// Scores peers by neutrality and picks the best candidate for forwarding when
/// the distance-vector table has no specific route.
pub struct RoutingEngine {
    pub neutrality_map: HashMap<String, f64>,
}

impl RoutingEngine {
    pub fn new() -> Self {
        Self {
            neutrality_map: HashMap::new(),
        }
    }

    pub fn update_neutrality(&mut self, peer_id: String, score: f64) {
        self.neutrality_map.insert(peer_id, score);
    }

    /// Pick the peer with the highest neutrality score from a set of candidates.
    pub fn best_neutrality_peer(&self, mut candidates: Vec<String>) -> Option<String> {
        candidates.sort_by(|a, b| {
            let sa = self.neutrality_map.get(a).unwrap_or(&0.5);
            let sb = self.neutrality_map.get(b).unwrap_or(&0.5);
            sb.partial_cmp(sa).unwrap_or(std::cmp::Ordering::Equal)
        });
        candidates.into_iter().next()
    }

    /// Route a packet using distance-vector first, then fall back to
    /// neutrality-aware selection.
    pub fn route_packet(
        &self,
        packet: &MeshPacket,
        available_peers: Vec<String>,
        distance_vector: &DistanceVectorTable,
    ) -> Option<String> {
        if packet.is_expired() {
            return None;
        }

        // 1. Try distance-vector route for the exact destination.
        if let Some(nh) = distance_vector.next_hop(&packet.destination) {
            if available_peers.contains(&nh) {
                return Some(nh);
            }
        }

        // 2. Fallback: pick any available peer that meets the neutrality threshold.
        let candidates: Vec<String> = available_peers
            .into_iter()
            .filter(|p| {
                let score = self.neutrality_map.get(p).unwrap_or(&0.5);
                *score >= packet.neutrality_threshold
            })
            .collect();

        self.best_neutrality_peer(candidates)
    }
}

// ── Unit tests ───────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    // ── DistanceVectorTable ──────────────────────────────────────────────────

    #[test]
    fn test_add_direct_route() {
        let mut table = DistanceVectorTable::new();
        table.add_direct_route("peer-a", 0);
        assert_eq!(table.route_count(), 1);

        let next = table.next_hop("peer-a");
        assert_eq!(next, Some("peer-a".to_string()));
    }

    #[test]
    fn test_unknown_destination_returns_none() {
        let table = DistanceVectorTable::new();
        assert_eq!(table.next_hop("ghost"), None);
    }

    #[test]
    fn test_process_update_learns_new_route() {
        let mut table = DistanceVectorTable::new();

        let update = RouteUpdate {
            source_peer: "peer-b".to_string(),
            sequence_number: 1,
            entries: vec![RouteEntry {
                destination: "peer-c".to_string(),
                metric: 0,
                sequence_number: 1,
            }],
        };

        let changed = table.process_update(&update, "peer-b");
        assert!(changed);

        // Should give us a route to peer-c via peer-b with metric 1.
        let next = table.next_hop("peer-c");
        assert_eq!(next, Some("peer-b".to_string()));
    }

    #[test]
    fn test_process_update_prefers_higher_sequence_number() {
        let mut table = DistanceVectorTable::new();

        // First update: peer-c is 1 hop via peer-b (seq=1)
        let upd1 = RouteUpdate {
            source_peer: "peer-b".to_string(),
            sequence_number: 1,
            entries: vec![RouteEntry {
                destination: "peer-c".to_string(),
                metric: 0,
                sequence_number: 1,
            }],
        };
        table.process_update(&upd1, "peer-b");

        // Second update: peer-c is 5 hops via peer-d (seq=2, higher → wins)
        let upd2 = RouteUpdate {
            source_peer: "peer-d".to_string(),
            sequence_number: 1,
            entries: vec![RouteEntry {
                destination: "peer-c".to_string(),
                metric: 4,
                sequence_number: 2,
            }],
        };
        let changed = table.process_update(&upd2, "peer-d");
        assert!(changed);

        let next = table.next_hop("peer-c");
        assert_eq!(next, Some("peer-d".to_string()));
    }

    #[test]
    fn test_process_update_prefers_lower_metric_when_same_seq() {
        let mut table = DistanceVectorTable::new();

        // Bad route: peer-c is 10 hops via peer-b
        let upd1 = RouteUpdate {
            source_peer: "peer-b".to_string(),
            sequence_number: 1,
            entries: vec![RouteEntry {
                destination: "peer-c".to_string(),
                metric: 9,
                sequence_number: 1,
            }],
        };
        table.process_update(&upd1, "peer-b");

        // Better route: peer-c is 2 hops via peer-d (same seq, lower metric)
        let upd2 = RouteUpdate {
            source_peer: "peer-d".to_string(),
            sequence_number: 1,
            entries: vec![RouteEntry {
                destination: "peer-c".to_string(),
                metric: 1,
                sequence_number: 1,
            }],
        };
        let changed = table.process_update(&upd2, "peer-d");
        assert!(changed);

        let next = table.next_hop("peer-c");
        assert_eq!(next, Some("peer-d".to_string()));
    }

    #[test]
    fn test_process_update_same_metric_via_different_neighbor_no_change() {
        let mut table = DistanceVectorTable::new();

        let upd1 = RouteUpdate {
            source_peer: "peer-b".to_string(),
            sequence_number: 1,
            entries: vec![RouteEntry {
                destination: "peer-c".to_string(),
                metric: 2,
                sequence_number: 1,
            }],
        };
        table.process_update(&upd1, "peer-b");

        // Same metric, different neighbor, same seq → no change (keep first)
        let upd2 = RouteUpdate {
            source_peer: "peer-d".to_string(),
            sequence_number: 1,
            entries: vec![RouteEntry {
                destination: "peer-c".to_string(),
                metric: 2,
                sequence_number: 1,
            }],
        };
        let changed = table.process_update(&upd2, "peer-d");
        assert!(!changed);

        let next = table.next_hop("peer-c");
        assert_eq!(next, Some("peer-b".to_string()));
    }

    #[test]
    fn test_invalidate_neighbor_removes_dependent_routes() {
        let mut table = DistanceVectorTable::new();

        table.add_direct_route("peer-b", 0);
        let upd = RouteUpdate {
            source_peer: "peer-b".to_string(),
            sequence_number: 1,
            entries: vec![RouteEntry {
                destination: "peer-c".to_string(),
                metric: 1,
                sequence_number: 1,
            }],
        };
        table.process_update(&upd, "peer-b");

        assert_eq!(table.route_count(), 2);

        let removed = table.invalidate_neighbor("peer-b");
        assert!(removed.contains(&"peer-c".to_string()));
        assert_eq!(table.route_count(), 1); // only peer-b direct route remains
    }

    #[test]
    fn test_stale_route_not_returned() {
        let mut table = DistanceVectorTable::new();

        // Manually insert a route with a very old timestamp
        let old = Instant::now() - Duration::from_secs(300); // > 180s staleness
        table.routes.insert(
            "peer-z".to_string(),
            Route {
                destination: "peer-z".to_string(),
                next_hop: "peer-b".to_string(),
                metric: 1,
                sequence_number: 1,
                last_updated: old,
            },
        );

        assert_eq!(table.next_hop("peer-z"), None);
        assert_eq!(table.route_count(), 0);
    }

    #[test]
    fn test_advertisement_entries_only_non_stale() {
        let mut table = DistanceVectorTable::new();
        table.add_direct_route("peer-b", 0);

        let entries = table.advertisement_entries();
        assert!(!entries.is_empty());
        assert!(entries.iter().any(|e| e.destination == "peer-b"));
    }

    // ── MeshPacket ───────────────────────────────────────────────────────────

    #[test]
    fn test_packet_expiry() {
        let mut pkt = MeshPacket::new(
            "a".into(),
            "b".into(),
            vec![],
            5,
            0.5,
            "id-1".into(),
        );
        assert!(!pkt.is_expired());

        pkt.hop_count = 5;
        assert!(pkt.is_expired());
    }

    #[test]
    fn test_packet_at_destination() {
        let pkt = MeshPacket::new(
            "a".into(),
            "b".into(),
            vec![],
            5,
            0.5,
            "id-1".into(),
        );
        assert!(pkt.at_destination("b"));
        assert!(!pkt.at_destination("c"));
    }

    #[test]
    fn test_packet_advance() {
        let mut pkt = MeshPacket::new(
            "a".into(),
            "b".into(),
            vec![],
            5,
            0.5,
            "id-1".into(),
        );
        pkt.advance("c".into());
        assert_eq!(pkt.hop_count, 1);
        assert_eq!(pkt.next_hop, "c");
    }

    // ── RoutingEngine (neutrality-aware fallback) ────────────────────────────

    #[test]
    fn test_best_neutrality_peer() {
        let mut engine = RoutingEngine::new();
        engine.update_neutrality("peer-a".into(), 0.9);
        engine.update_neutrality("peer-b".into(), 0.3);
        engine.update_neutrality("peer-c".into(), 0.6);

        let best = engine.best_neutrality_peer(vec![
            "peer-a".into(),
            "peer-b".into(),
            "peer-c".into(),
        ]);
        assert_eq!(best, Some("peer-a".into()));
    }

    #[test]
    fn test_route_packet_falls_back_to_neutrality() {
        let engine = RoutingEngine::new();
        let dv = DistanceVectorTable::new();

        let pkt = MeshPacket::new("a".into(), "unknown".into(), vec![], 5, 0.0, "id-1".into());
        let peers = vec!["peer-a".into(), "peer-b".into()];

        // Distance-vector has no route, neutrality threshold is 0.0 so any peer works
        let next = engine.route_packet(&pkt, peers, &dv);
        assert!(next.is_some());
    }

    #[test]
    fn test_route_packet_expired_returns_none() {
        let engine = RoutingEngine::new();
        let dv = DistanceVectorTable::new();

        let mut pkt = MeshPacket::new("a".into(), "b".into(), vec![], 3, 0.5, "id-1".into());
        pkt.hop_count = 3; // expired

        let peers = vec!["peer-a".into()];
        assert_eq!(engine.route_packet(&pkt, peers, &dv), None);
    }

    #[test]
    fn test_route_packet_uses_dv_when_available() {
        let engine = RoutingEngine::new();
        let mut dv = DistanceVectorTable::new();
        dv.add_direct_route("peer-c".into(), 0);

        let pkt = MeshPacket::new("a".into(), "peer-c".into(), vec![], 5, 0.5, "id-1".into());
        let peers = vec!["peer-c".into(), "peer-b".into()];

        let next = engine.route_packet(&pkt, peers, &dv);
        assert_eq!(next, Some("peer-c".into()));
    }
}
