use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Represents a packet in the mesh network.
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MeshPacket {
    pub source: String,
    pub destination: String,
    pub payload: Vec<u8>,
    pub hop_count: u32,
    pub max_hops: u32,
    pub neutrality_threshold: f64,
}

/// Neutrality-Aware Routing Engine
/// Prioritizes peers with higher neutrality scores for packet forwarding.
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

    /// Determines the next hop for a packet based on neutrality scores.
    pub fn route_packet(&self, packet: &MeshPacket, available_peers: Vec<String>) -> Option<String> {
        if packet.hop_count >= packet.max_hops {
            return None; // TTL expired
        }

        // Filter peers that meet the neutrality threshold
        let candidates: Vec<String> = available_peers
            .into_iter()
            .filter(|p| {
                let score = self.neutrality_map.get(p).unwrap_or(&0.5);
                *score >= packet.neutrality_threshold
            })
            .collect();

        // Simple strategy: pick the one with the highest neutrality score
        candidates
            .into_iter()
            .max_by(|a, b| {
                let score_a = self.neutrality_map.get(a).unwrap_or(&0.5);
                let score_b = self.neutrality_map.get(b).unwrap_or(&0.5);
                score_a.partial_cmp(score_b).unwrap()
            })
    }
}
