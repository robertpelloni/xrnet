use std::collections::HashMap;
use std::sync::Mutex;
use serde::{Serialize, Deserialize};
use crate::DecentralizedIdentity;

pub struct SocialGraph {
    identities: Mutex<HashMap<String, DecentralizedIdentity>>,
    trust_graph: Mutex<HashMap<String, Vec<String>>>, // PeerID -> List of trusted PeerIDs
}

impl SocialGraph {
    pub fn new() -> Self {
        Self {
            identities: Mutex::new(HashMap::new()),
            trust_graph: Mutex::new(HashMap::new()),
        }
    }

    pub fn register_identity(&self, identity: DecentralizedIdentity) {
        let mut idents = self.identities.lock().unwrap();
        idents.insert(identity.peer_id.clone(), identity);
    }

    pub fn trust_peer(&self, source: String, target: String) {
        let mut graph = self.trust_graph.lock().unwrap();
        let trusted = graph.entry(source).or_insert(Vec::new());
        if !trusted.contains(&target) {
            trusted.push(target);
        }
    }

    pub fn untrust_peer(&self, source: String, target: String) {
        let mut graph = self.trust_graph.lock().unwrap();
        if let Some(trusted) = graph.get_mut(&source) {
            trusted.retain(|id| id != &target);
        }
    }

    pub fn is_trusted(&self, source: &str, target: &str) -> bool {
        let graph = self.trust_graph.lock().unwrap();
        if let Some(trusted) = graph.get(source) {
            trusted.contains(&target.to_string())
        } else {
            false
        }
    }

    pub fn get_identity(&self, peer_id: &str) -> Option<DecentralizedIdentity> {
        let idents = self.identities.lock().unwrap();
        idents.get(peer_id).cloned()
    }

    pub fn list_trusted(&self, source: &str) -> Vec<String> {
        let graph = self.trust_graph.lock().unwrap();
        graph.get(source).cloned().unwrap_or_default()
    }
}
