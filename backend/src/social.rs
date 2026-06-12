use serde::{Deserialize, Serialize};
use sha2::{Sha256, Digest};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct InterestProfile {
    pub hashed_interests: Vec<String>,
}

pub struct MatchmakingEngine;

impl MatchmakingEngine {
    pub fn hash_interest(interest: &str) -> String {
        let mut hasher = Sha256::new();
        hasher.update(interest.to_lowercase().trim());
        format!("{:x}", hasher.finalize())
    }

    pub fn find_matches(my_profile: &InterestProfile, other_profile: &InterestProfile) -> Vec<String> {
        my_profile.hashed_interests.iter()
            .filter(|i| other_profile.hashed_interests.contains(i))
            .cloned()
            .collect()
    }
}
