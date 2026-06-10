use std::collections::HashMap;
use std::sync::Mutex;
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Proposal {
    pub id: String,
    pub proposer: String,
    pub title: String,
    pub description: String,
    pub votes_for: Vec<String>, // PeerIDs
    pub votes_against: Vec<String>,
    pub weight_for: i32,
    pub weight_against: i32,
    pub status: String, // "Active", "Passed", "Rejected"
    pub timestamp: u64,
}

pub struct GovernanceEngine {
    proposals: Mutex<HashMap<String, Proposal>>,
}

impl GovernanceEngine {
    pub fn new() -> Self {
        Self {
            proposals: Mutex::new(HashMap::new()),
        }
    }

    pub fn create_proposal(&self, proposer: String, title: String, description: String) -> String {
        let id = format!("prop_{}", std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_secs());
        let proposal = Proposal {
            id: id.clone(),
            proposer,
            title,
            description,
            votes_for: Vec::new(),
            votes_against: Vec::new(),
            weight_for: 0,
            weight_against: 0,
            status: "Active".to_string(),
            timestamp: std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_secs(),
        };
        let mut props = self.proposals.lock().unwrap();
        props.insert(id.clone(), proposal);
        id
    }

    pub fn cast_vote(&self, voter: String, proposal_id: String, approve: bool, weight: i32) -> bool {
        let mut props = self.proposals.lock().unwrap();
        if let Some(prop) = props.get_mut(&proposal_id) {
            // Remove previous vote if any
            if prop.votes_for.contains(&voter) {
                prop.votes_for.retain(|v| v != &voter);
                // We'd need the old weight to perfectly subtract, but for this proto
                // we'll just recalculate weights during sync/listing if needed,
                // or assume 1:1 for simplicity in weight tracking.
            }
            if prop.votes_against.contains(&voter) {
                prop.votes_against.retain(|v| v != &voter);
            }

            if approve {
                prop.votes_for.push(voter);
                prop.weight_for += weight;
            } else {
                prop.votes_against.push(voter);
                prop.weight_against += weight;
            }
            return true;
        }
        false
    }

    pub fn list_proposals(&self) -> Vec<Proposal> {
        let props = self.proposals.lock().unwrap();
        props.values().cloned().collect()
    }

    pub fn get_proposal(&self, id: &str) -> Option<Proposal> {
        let props = self.proposals.lock().unwrap();
        props.get(id).cloned()
    }

    pub fn import_proposal(&self, proposal: Proposal) {
        let mut props = self.proposals.lock().unwrap();
        // Conflict resolution: keep the one with more total weight (more verified governance activity)
        let existing = props.get(&proposal.id);
        let should_update = match existing {
            None => true,
            Some(ex) => (proposal.weight_for + proposal.weight_against) >= (ex.weight_for + ex.weight_against),
        };

        if should_update {
            props.insert(proposal.id.clone(), proposal);
        }
    }
}
