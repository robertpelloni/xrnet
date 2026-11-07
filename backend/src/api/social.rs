use axum::{
    extract::Json,
    routing::post,
    Router,
};
use serde_json::json;
use std::sync::Arc;
use crate::AppState;
use crate::social::{InterestProfile, MatchmakingEngine};

pub fn routes(state: Arc<AppState>) -> Router {
    Router::new()
        .route("/api/social/match", post({
            let _s = Arc::clone(&state);
            move |Json(payload): Json<serde_json::Value>| async move {
                // Support both "my_interests" / "peer_interests" and "interests" / "other_interests"
                let empty_vec = vec![];
                let interests_val = payload.get("my_interests")
                    .or_else(|| payload.get("interests"))
                    .and_then(|v| v.as_array())
                    .unwrap_or(&empty_vec);

                let other_interests_val = payload.get("peer_interests")
                    .or_else(|| payload.get("other_interests"))
                    .and_then(|v| v.as_array())
                    .unwrap_or(&empty_vec);

                let interests: Vec<String> = interests_val.iter()
                    .filter_map(|v| v.as_str().map(|s| s.trim().to_string()))
                    .filter(|s| !s.is_empty())
                    .collect();

                let other_interests: Vec<String> = other_interests_val.iter()
                    .filter_map(|v| v.as_str().map(|s| s.trim().to_string()))
                    .filter(|s| !s.is_empty())
                    .collect();

                let my_profile = InterestProfile {
                    hashed_interests: interests.iter().map(|i| MatchmakingEngine::hash_interest(i)).collect()
                };
                let other_profile = InterestProfile {
                    hashed_interests: other_interests.iter().map(|i| MatchmakingEngine::hash_interest(i)).collect()
                };

                let matches = MatchmakingEngine::find_matches(&my_profile, &other_profile);
                let score = MatchmakingEngine::compute_compatibility_score(&my_profile, &other_profile);

                // Initialize ZK parameters and verify proof locally
                let params = MatchmakingEngine::generate_zk_parameters();

                // For each match, verify via zero-knowledge proof
                let mut verified_matches = Vec::new();
                for m in &matches {
                    if MatchmakingEngine::verify_zk_match(&params, m) {
                        verified_matches.push(m.clone());
                    }
                }

                Json(json!({
                    "hashed_interests": my_profile.hashed_interests,
                    "peer_hashed_interests": other_profile.hashed_interests,
                    "matches": verified_matches,
                    "match_count": verified_matches.len(),
                    "score": score,
                    "zk_verified": true
                }))
            }
        }))
}
