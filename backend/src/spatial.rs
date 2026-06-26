use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GaussianSplat {
    pub id: String,
    pub position: [f32; 3],
    pub color: [u8; 4],
    pub scale: [f32; 3],
    pub rotation: [f32; 4], // Quaternion
    pub semantic_label: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SpatialUpdate {
    pub peer_id: String,
    pub timestamp: u64,
    pub splats: Vec<GaussianSplat>,
}

pub struct SpatialManager {
    pub local_splats: Vec<GaussianSplat>,
    pub network_splats: std::collections::HashMap<String, Vec<GaussianSplat>>, // PeerID -> Splats
}

impl SpatialManager {
    pub fn new() -> Self {
        Self {
            local_splats: Vec::new(),
            network_splats: std::collections::HashMap::new(),
        }
    }

    pub fn add_local_splat(&mut self, splat: GaussianSplat) {
        self.local_splats.push(splat);
    }

    pub fn receive_network_update(&mut self, update: SpatialUpdate) {
        self.network_splats.insert(update.peer_id, update.splats);
    }

    pub fn get_all_splats(&self) -> Vec<GaussianSplat> {
        let mut all_splats = self.local_splats.clone();
        for splats in self.network_splats.values() {
            all_splats.extend(splats.clone());
        }
        all_splats
    }
}
