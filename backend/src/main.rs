mod mesh;
mod governance;
mod social;
mod escrow;
mod routing;

use std::fs;
use std::error::Error;
use std::time::Duration;
use tokio::net::TcpStream;
use tokio::io::{AsyncWriteExt, AsyncReadExt};
use libp2p::identity;
use serde_json::json;
use axum::{routing::{get, post}, Json, Router, extract::Path, extract::ConnectInfo};
use std::net::SocketAddr;
use std::sync::{Arc, Mutex};
use reqwest::Client;
use tower_http::cors::CorsLayer;
use serde::Deserialize;
use tokio::sync::mpsc;
use std::collections::HashMap;

use governance::{NeutralArbitrator, NeutralityMetric};
use social::{MatchmakingEngine, InterestProfile};
use escrow::EscrowManager;

pub enum Command {
    PutRecord { key: String, value: String },
    SendMessage { topic: String, message: String },
}

pub struct AppState {
    peer_id: String,
    peers: Mutex<usize>,
    network: Mutex<String>,
    command_tx: mpsc::Sender<Command>,
    profiles: Mutex<HashMap<String, String>>,
    jobs: Mutex<HashMap<String, String>>,
    neutrality_index: Mutex<f64>,
    arbitrator: Mutex<NeutralArbitrator>,
    escrow: Mutex<EscrowManager>,
}

#[derive(Deserialize, Clone)]
struct DhtPutRequest {
    key: String,
    value: String,
}

fn get_version() -> String {
    fs::read_to_string("VERSION.md")
        .or_else(|_| fs::read_to_string("../VERSION.md"))
        .map(|v| v.trim().to_string())
        .unwrap_or_else(|_| "unknown".to_string())
}

fn set_status(status: &str) {
    let status_data = json!({ "status": status });
    let _ = fs::write("status.json", status_data.to_string());
}

async fn connect_to_surrounding_system() -> bool {
    println!("[PROTOCOL] Attempting to connect to surrounding system (port 9000)...");
    for _ in 0..5 {
        if let Ok(mut stream) = TcpStream::connect("127.0.0.1:9000").await {
            println!("[PROTOCOL] Connected to external peer.");
            let _ = stream.write_all(b"XRNET_HANDSHAKE").await;
            let mut buffer = [0; 9];
            if let Ok(_) = stream.read_exact(&mut buffer).await {
                if &buffer == b"XRNET_ACK" {
                    println!("[PROTOCOL] Handshake with external system successful.");
                    return true;
                }
            }
        }
        tokio::time::sleep(Duration::from_millis(1000)).await;
    }
    println!("[PROTOCOL] Warning: Could not connect to surrounding system. Operating in standalone mode.");
    false
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    set_status("INITIALIZING");
    let version = get_version();
    println!("========================================");
    println!("      xrnet-backend v{}              ", version);
    println!("========================================");

    let local_key = identity::Keypair::generate_ed25519();
    let local_peer_id = libp2p::PeerId::from(local_key.public());
    let peer_id_str = local_peer_id.to_string();

    let (tx, rx) = mpsc::channel(32);

    let state = Arc::new(AppState {
        peer_id: peer_id_str.clone(),
        peers: Mutex::new(0),
        network: Mutex::new("Standalone".to_string()),
        command_tx: tx,
        profiles: Mutex::new(HashMap::new()),
        jobs: Mutex::new(HashMap::new()),
        neutrality_index: Mutex::new(1.0),
        arbitrator: Mutex::new(NeutralArbitrator::new()),
        escrow: Mutex::new(EscrowManager::new()),
    });

    // API Server
    let api_state = Arc::clone(&state);
    let http_client = Client::new();

    let app = Router::new()
        .route("/api/status", get({
            let s = Arc::clone(&api_state);
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
        .route("/api/profile", get({
            let s = Arc::clone(&api_state);
            move || async move {
                let profiles = s.profiles.lock().unwrap().clone();
                Json(profiles)
            }
        }))
        .route("/api/jobs", get({
            let s = Arc::clone(&api_state);
            move || async move {
                let jobs = s.jobs.lock().unwrap().clone();
                Json(jobs)
            }
        }))
        .route("/api/social/match", post({
            let _s = Arc::clone(&api_state);
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
        .route("/api/escrow/create", post({
            let s = Arc::clone(&api_state);
            move |Json(payload): Json<serde_json::Value>| async move {
                let payer = payload["payer"].as_str().unwrap_or("").to_string();
                let payee = payload["payee"].as_str().unwrap_or("").to_string();
                let amount = payload["amount"].as_f64().unwrap_or(0.0);

                let mut escrow = s.escrow.lock().unwrap();
                let id = escrow.create_transaction(payer, payee, amount);
                Json(json!({ "escrow_id": id }))
            }
        }))
        .route("/api/escrow/release/:id", post({
            let s = Arc::clone(&api_state);
            move |Path(id): Path<String>| async move {
                let mut escrow = s.escrow.lock().unwrap();
                let success = escrow.release(&id);
                Json(json!({ "success": success }))
            }
        }))
        .route("/api/governance/register_metric", post({
            let s = Arc::clone(&api_state);
            move |Json(payload): Json<NeutralityMetric>| async move {
                let mut arbitrator = s.arbitrator.lock().unwrap();
                let score = NeutralArbitrator::calculate_score(&payload);
                println!("[GOV] Calculated neutrality score for {}: {}", payload.peer_id, score);
                arbitrator.peers.push(payload);
                Json(json!({ "score": score }))
            }
        }))
        .route("/api/escrow/fund/:id", post({
            let s = Arc::clone(&api_state);
            move |Path(id): Path<String>| async move {
                let mut escrow = s.escrow.lock().unwrap();
                let success = escrow.fund(&id);
                Json(json!({ "success": success }))
            }
        }))
        .route("/api/dht/put", post({
            let s = Arc::clone(&api_state);
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
        .route("/api/messages/send", post({
            let s = Arc::clone(&api_state);
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
        .route("/api/bobcoin/balance/:account", get({
            let client = http_client.clone();
            move |Path(account): Path<String>| async move {
                let url = format!("http://127.0.0.1:4000/balance/{}", account);
                match client.get(url).send().await {
                    Ok(resp) => {
                        let json: serde_json::Value = resp.json().await.unwrap_or(json!({ "error": "failed to parse" }));
                        Json(json)
                    }
                    Err(e) => Json(json!({ "error": e.to_string() })),
                }
            }
        }))
        .route("/api/system/feedback", post({
            let s = Arc::clone(&api_state);
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
        .route("/api/bobcoin/process", post({
            let client = http_client.clone();
            move |Json(payload): Json<serde_json::Value>| async move {
                let url = "http://127.0.0.1:4000/process";
                match client.post(url).json(&payload).send().await {
                    Ok(resp) => {
                        let json: serde_json::Value = resp.json().await.unwrap_or(json!({ "error": "failed to parse" }));
                        Json(json)
                    }
                    Err(e) => Json(json!({ "error": e.to_string() })),
                }
            }
        }))
        .route("/api/system/protocol", post(|ConnectInfo(addr): ConnectInfo<SocketAddr>| async move {
            // SECURITY: Restrict Remote Code Execution to localhost only
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
                ("python3", ".") // Fallback
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
        .layer(CorsLayer::permissive());

    let addr = SocketAddr::from(([0, 0, 0, 0], 8080));
    tokio::spawn(async move {
        println!("[API] Server listening on http://{}", addr);
        let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
        // Use with_connect_info to get the remote address for security checks
        axum::serve(listener, app.into_make_service_with_connect_info::<SocketAddr>()).await.unwrap();
    });

    let integrated = connect_to_surrounding_system().await;
    if integrated {
        let mut n = api_state.network.lock().unwrap();
        *n = "Integrated".to_string();
    }

    println!("[INFO] Everything Protocol initialized successfully.");
    println!("[STATUS] READY");
    set_status("READY");

    // Start modular mesh network loop
    mesh::run_mesh(local_key, state, rx).await
}
