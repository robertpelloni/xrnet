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
            status: "Active".to_string(),
            timestamp: std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_secs(),
        };
        let mut props = self.proposals.lock().unwrap();
        props.insert(id.clone(), proposal);
        id
    }

    pub fn cast_vote(&self, voter: String, proposal_id: String, approve: bool) -> bool {
        let mut props = self.proposals.lock().unwrap();
        if let Some(prop) = props.get_mut(&proposal_id) {
            if approve {
                if !prop.votes_for.contains(&voter) {
                    prop.votes_for.push(voter.clone());
                }
                prop.votes_against.retain(|v| v != &voter);
            } else {
                if !prop.votes_against.contains(&voter) {
                    prop.votes_against.push(voter.clone());
                }
                prop.votes_for.retain(|v| v != &voter);
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
        // Simple conflict resolution: keep the one with more votes or later status?
        // For now, just replace if it's new or has more total votes.
        let existing = props.get(&proposal.id);
        let should_update = match existing {
            None => true,
            Some(ex) => (proposal.votes_for.len() + proposal.votes_against.len()) >= (ex.votes_for.len() + ex.votes_against.len()),
        };

        if should_update {
            props.insert(proposal.id.clone(), proposal);
        }
    }
}
