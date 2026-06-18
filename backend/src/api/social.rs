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
                let interests = payload["interests"].as_array().unwrap_or(&vec![]).iter()
                    .map(|v| v.as_str().unwrap_or("").to_string())
                    .collect::<Vec<String>>();

                let other_interests = payload["other_interests"].as_array().unwrap_or(&vec![]).iter()
                    .map(|v| v.as_str().unwrap_or("").to_string())
                    .collect::<Vec<String>>();

                let my_profile = InterestProfile { hashed_interests: interests.iter().map(|i| MatchmakingEngine::hash_interest(i)).collect() };
                let other_profile = InterestProfile { hashed_interests: other_interests.iter().map(|i| MatchmakingEngine::hash_interest(i)).collect() };

                let matches = MatchmakingEngine::find_matches(&my_profile, &other_profile);

                Json(json!({
                    "hashed_interests": my_profile.hashed_interests,
                    "matches": matches
                }))
            }
        }))
}
