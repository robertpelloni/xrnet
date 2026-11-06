use axum::{
    extract::Json,
    routing::{get, post},
    Router,
};
use serde_json::json;
use std::sync::Arc;
use crate::{AppState, Command};

// In-memory ring buffer for recent broadcast messages to provide feed for frontend
static RECENT_MESSAGES: std::sync::RwLock<Vec<serde_json::Value>> = std::sync::RwLock::new(Vec::new());

pub fn routes(state: Arc<AppState>) -> Router {
    Router::new()
        .route("/api/messages/send", post({
            let s = Arc::clone(&state);
            move |Json(payload): Json<serde_json::Value>| {
                let s = Arc::clone(&s);
                async move {
                    let content = payload["content"].as_str().unwrap_or("").to_string();
                    let topic = payload["topic"].as_str().unwrap_or("xrnet-global").to_string();
                    let sender = payload["sender"].as_str().unwrap_or("local").to_string();

                    // Record locally in recent messages
                    let msg_record = json!({
                        "id": format!("msg-{}", std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_millis()),
                        "sender": sender,
                        "content": content,
                        "topic": topic,
                        "timestamp": std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_secs(),
                    });

                    if let Ok(mut msgs) = RECENT_MESSAGES.write() {
                        msgs.push(msg_record);
                        if msgs.len() > 100 {
                            msgs.remove(0);
                        }
                    }

                    let _ = s.command_tx.send(Command::SendMessage {
                        topic,
                        message: content,
                    }).await;
                    Json(json!({ "status": "sent" }))
                }
            }
        }))
        .route("/api/messages/recent", get(|| async move {
            let msgs = if let Ok(m) = RECENT_MESSAGES.read() {
                m.clone()
            } else {
                Vec::new()
            };
            Json(json!({ "messages": msgs }))
        }))
}
