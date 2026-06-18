use axum::{
    extract::Json,
    routing::post,
    Router,
};
use serde_json::json;
use std::sync::Arc;
use crate::{AppState, Command};

pub fn routes(state: Arc<AppState>) -> Router {
    Router::new()
        .route("/api/messages/send", post({
            let s = Arc::clone(&state);
            move |Json(payload): Json<serde_json::Value>| {
                let s = Arc::clone(&s);
                async move {
                    let content = payload["content"].as_str().unwrap_or("").to_string();
                    let _ = s.command_tx.send(Command::SendMessage {
                        topic: "xrnet-global".to_string(),
                        message: content,
                    }).await;
                    Json(json!({ "status": "sent" }))
                }
            }
        }))
}
