use axum::{
    extract::{Json, Path},
    routing::post,
    Router,
};
use serde_json::json;
use std::sync::Arc;
use crate::AppState;

pub fn routes(state: Arc<AppState>) -> Router {
    Router::new()
        .route("/api/escrow/create", post({
            let s = Arc::clone(&state);
            move |Json(payload): Json<serde_json::Value>| async move {
                let payer = payload["payer"].as_str().unwrap_or("").to_string();
                let payee = payload["payee"].as_str().unwrap_or("").to_string();
                let amount = payload["amount"].as_f64().unwrap_or(0.0);

                let mut escrow = s.escrow_manager.lock().unwrap();
                let id = escrow.create_transaction(payer, payee, amount);
                Json(json!({ "escrow_id": id }))
            }
        }))
        .route("/api/escrow/release/:id", post({
            let s = Arc::clone(&state);
            move |Path(id): Path<String>| async move {
                let mut escrow = s.escrow_manager.lock().unwrap();
                let success = escrow.release(&id);
                Json(json!({ "success": success }))
            }
        }))
        .route("/api/escrow/fund/:id", post({
            let s = Arc::clone(&state);
            move |Path(id): Path<String>| async move {
                let mut escrow = s.escrow_manager.lock().unwrap();
                let success = escrow.fund(&id);
                Json(json!({ "success": success }))
            }
        }))
        .route("/api/escrow/dispute/:id", post({
            let s = Arc::clone(&state);
            move |Path(id): Path<String>| async move {
                let arbitrator_id = {
                    let arbitrator = s.arbitrator.lock().unwrap();
                    arbitrator.select_arbitrator()
                };

                if let Some(best_arbitrator) = arbitrator_id {
                    let mut escrow = s.escrow_manager.lock().unwrap();
                    let success = escrow.dispute(&id, best_arbitrator.clone());
                    Json(json!({ "success": success, "arbitrator": best_arbitrator }))
                } else {
                    Json(json!({ "success": false, "error": "No neutral arbitrator available" }))
                }
            }
        }))
}
