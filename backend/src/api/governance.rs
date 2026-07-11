use axum::{
    extract::Json,
    routing::post,
    Router,
};
use serde_json::json;
use std::sync::Arc;
use crate::AppState;
use crate::governance::{NeutralityMetric, NeutralArbitrator};

pub fn routes(state: Arc<AppState>) -> Router {
    Router::new()
        .route("/api/governance/register_metric", post({
            let s = Arc::clone(&state);
            move |Json(payload): Json<NeutralityMetric>| async move {
                let mut arbitrator = s.arbitrator.lock().unwrap();
                let score = NeutralArbitrator::calculate_score(&payload);
                println!("[GOV] Calculated neutrality score for {}: {}", payload.peer_id, score);
                arbitrator.peers.push(payload);
                Json(json!({ "score": score }))
            }
        }))
}
