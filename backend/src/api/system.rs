use axum::{
    extract::{ConnectInfo, Json},
    routing::{get, post},
    Router,
};
use serde_json::json;
use std::net::SocketAddr;
use std::sync::Arc;
use crate::{AppState, Command, get_version};

pub fn routes(state: Arc<AppState>) -> Router {
    Router::new()
        .route("/api/status", get({
            let s = Arc::clone(&state);
            move || async move {
                let peers = *s.peers.lock().unwrap();
                let network = s.network.lock().unwrap().clone();
                let neutrality = *s.neutrality_index.lock().unwrap();
                let arbitrator = s.arbitrator.lock().unwrap();
                let best_arbitrator = arbitrator.select_arbitrator().unwrap_or_else(|| "None Available".to_string());

                Json(json!({
                    "peer_id": s.peer_id,
                    "peers": peers,
                    "network": network,
                    "neutrality": neutrality,
                    "best_arbitrator": best_arbitrator,
                    "version": get_version(),
                }))
            }
        }))
        .route("/api/system/feedback", post({
            let s = Arc::clone(&state);
            move |Json(payload): Json<serde_json::Value>| async move {
                let feedback = payload["feedback"].as_str().unwrap_or("").to_string();
                let peer_id = s.peer_id.clone();
                let key = format!("feedback:{}:{}", peer_id, std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_secs());

                println!("[API] Feedback received from {}: {}", peer_id, feedback);

                let _ = s.command_tx.send(Command::PutRecord {
                    key: key.clone(),
                    value: feedback.clone(),
                }).await;

                Json(json!({ "status": "feedback_stored_in_dht", "key": key }))
            }
        }))
        .route("/api/system/protocol", post(|ConnectInfo(addr): ConnectInfo<SocketAddr>| async move {
            if !addr.ip().is_loopback() {
                println!("[SECURITY] Blocked unauthorized remote protocol request from {}", addr);
                return (axum::http::StatusCode::FORBIDDEN, Json(json!({ "status": "error", "message": "Access restricted to localhost." })));
            }

            println!("[API] Executive Protocol requested by localhost.");

            let (script_path, working_dir) = if std::path::Path::new("./scripts/autonomous_protocol.py").exists() {
                ("python3", ".")
            } else if std::path::Path::new("../scripts/autonomous_protocol.py").exists() {
                ("python3", "..")
            } else {
                ("python3", ".")
            };

            let output = tokio::process::Command::new(script_path)
                .arg("./scripts/autonomous_protocol.py")
                .current_dir(working_dir)
                .output()
                .await;

            match output {
                Ok(out) => {
                    let stdout = String::from_utf8_lossy(&out.stdout).to_string();
                    let stderr = String::from_utf8_lossy(&out.stderr).to_string();
                    println!("[API] Protocol stdout: {}", stdout);
                    println!("[API] Protocol stderr: {}", stderr);

                    let status = if out.status.success() { "success" } else { "error" };

                    (axum::http::StatusCode::OK, Json(json!({
                        "status": status,
                        "stdout": stdout,
                        "stderr": stderr,
                        "exit_code": out.status.code()
                    })))
                }
                Err(e) => {
                    (axum::http::StatusCode::INTERNAL_SERVER_ERROR, Json(json!({
                        "status": "error",
                        "message": e.to_string()
                    })))
                }
            }
        }))
}
