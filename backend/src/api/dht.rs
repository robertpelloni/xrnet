use axum::{
    extract::Json,
    routing::{get, post},
    Router,
};
use serde_json::json;
use std::sync::Arc;
use crate::{AppState, Command};

#[derive(serde::Deserialize)]
pub struct DhtPutRequest {
    pub key: String,
    pub value: String,
}

pub fn routes(state: Arc<AppState>) -> Router {
    Router::new()
        .route("/api/profile", get({
            let s = Arc::clone(&state);
            move || async move {
                let profiles = s.profiles.lock().unwrap().clone();
                Json(profiles)
            }
        }))
        .route("/api/dht/put", post({
            let s = Arc::clone(&state);
            move |Json(payload): Json<DhtPutRequest>| {
                let s = Arc::clone(&s);
                async move {
                    println!("[API] DHT PUT Request: {} = {}", payload.key, payload.value);
                    let _ = s.command_tx.send(Command::PutRecord {
                        key: payload.key.clone(),
                        value: payload.value.clone(),
                    }).await;

                    if payload.key.starts_with("profile:") {
                        let mut p = s.profiles.lock().unwrap();
                        p.insert(payload.key, payload.value);
                    } else if payload.key.starts_with("job:") {
                        let mut j = s.jobs.lock().unwrap();
                        j.insert(payload.key, payload.value);
                    }

                    Json(json!({ "status": "sent to protocol swarm" }))
                }
            }
        }))
}
