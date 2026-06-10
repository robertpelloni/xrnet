mod mesh;
mod social;
mod governance;

use std::fs;
use std::error::Error;
use std::time::Duration;
use tokio::net::TcpStream;
use tokio::io::{AsyncWriteExt, AsyncReadExt};
use libp2p::identity;
use serde_json::json;
use axum::{routing::{get, post}, Json, Router};
use std::net::SocketAddr;
use std::sync::{Arc, Mutex};
use reqwest::Client;
use tower_http::{cors::CorsLayer, services::ServeDir};
use sysinfo::{System, CpuRefreshKind, MemoryRefreshKind};
use serde::{Deserialize, Serialize};
use tokio::sync::mpsc;

pub enum Command {
    PutRecord { key: String, value: String },
    GetRecord { key: String },
    SendMessage { topic: String, message: String },
}

pub struct AppState {
    peer_id: String,
    peers: Mutex<usize>,
    network: Mutex<String>,
    command_tx: mpsc::Sender<Command>,
    profiles: Mutex<std::collections::HashMap<String, String>>,
    market_items: Mutex<std::collections::HashMap<String, String>>,
    messages: Mutex<Vec<ChatMessage>>,
    start_time: std::time::Instant,
    msg_sent_count: Mutex<usize>,
    msg_recv_count: Mutex<usize>,
    peer_latencies: Mutex<std::collections::HashMap<String, u64>>,
    bandwidth_in: Mutex<u64>,
    bandwidth_out: Mutex<u64>,
    social: social::SocialGraph,
    governance: governance::GovernanceEngine,
    sys: Mutex<System>,
}

impl AppState {
    fn new(peer_id: String, command_tx: mpsc::Sender<Command>) -> Self {
        let mut sys = System::new_all();
        sys.refresh_cpu_specifics(CpuRefreshKind::everything());
        sys.refresh_memory_specifics(MemoryRefreshKind::everything());

        Self {
            peer_id,
            peers: Mutex::new(0),
            network: Mutex::new("Standalone".to_string()),
            command_tx,
            profiles: Mutex::new(std::collections::HashMap::new()),
            market_items: Mutex::new(std::collections::HashMap::new()),
            messages: Mutex::new(Vec::new()),
            start_time: std::time::Instant::now(),
            msg_sent_count: Mutex::new(0),
            msg_recv_count: Mutex::new(0),
            peer_latencies: Mutex::new(std::collections::HashMap::new()),
            bandwidth_in: Mutex::new(0),
            bandwidth_out: Mutex::new(0),
            social: social::SocialGraph::new(),
            governance: governance::GovernanceEngine::new(),
            sys: Mutex::new(sys),
        }
    }

    fn increment_sent(&self) {
        let mut count = self.msg_sent_count.lock().unwrap();
        *count += 1;
    }

    fn increment_recv(&self) {
        let mut count = self.msg_recv_count.lock().unwrap();
        *count += 1;
    }

    fn add_message(&self, sender: String, content: String) {
        let mut m = self.messages.lock().unwrap();
        m.push(ChatMessage {
            sender,
            content,
            timestamp: std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_secs(),
        });
    }

    fn handle_dht_record(&self, key: String, value: String) {
        if key.starts_with("profile:") {
            let mut p = self.profiles.lock().unwrap();
            p.insert(key, value);
        } else if key.starts_with("market:") {
            let mut m = self.market_items.lock().unwrap();
            m.insert(key, value);
        } else if key.starts_with("learn:") {
            // Simulated learning hub uses profiles map for now
            let mut p = self.profiles.lock().unwrap();
            p.insert(key, value);
        } else if key.starts_with("gov:") {
            if let Ok(proposal) = serde_json::from_str::<governance::Proposal>(&value) {
                self.governance.import_proposal(proposal);
            }
        }
    }

    fn update_latency(&self, peer_id: String, rtt: u64) {
        let mut l = self.peer_latencies.lock().unwrap();
        l.insert(peer_id, rtt);
    }
}

#[derive(Serialize, Deserialize, Clone)]
struct ChatMessage {
    sender: String,
    content: String,
    timestamp: u64,
}

#[derive(Deserialize, Clone)]
struct DhtPutRequest {
    key: String,
    value: String,
}

#[derive(Serialize, Deserialize, Clone)]
struct UserProfile {
    peer_id: String,
    alias: String,
    status: String,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct DecentralizedIdentity {
    pub did: String,
    pub peer_id: String,
    pub public_key: String,
    pub reputation: i32,
    pub trust_level: f32, // 0.0 to 1.0
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
    let monitor_host = std::env::var("MONITOR_HOST").unwrap_or_else(|_| "127.0.0.1".to_string());
    let monitor_addr = format!("{}:9000", monitor_host);
    println!("[PROTOCOL] Attempting to connect to surrounding system ({}) status monitor...", monitor_addr);
    for _ in 0..5 {
        if let Ok(mut stream) = TcpStream::connect(&monitor_addr).await {
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

#[cfg(test)]
mod tests {
    use super::*;
    use tokio::sync::mpsc;

    #[test]
    fn test_app_state_metrics() {
        let (tx, _rx) = mpsc::channel(1);
        let state = AppState::new("test-peer".to_string(), tx);

        state.increment_sent();
        state.increment_sent();
        state.increment_recv();

        assert_eq!(*state.msg_sent_count.lock().unwrap(), 2);
        assert_eq!(*state.msg_recv_count.lock().unwrap(), 1);
    }

    #[test]
    fn test_app_state_messages() {
        let (tx, _rx) = mpsc::channel(1);
        let state = AppState::new("test-peer".to_string(), tx);

        state.add_message("sender-a".to_string(), "hello".to_string());
        let msgs = state.messages.lock().unwrap();

        assert_eq!(msgs.len(), 1);
        assert_eq!(msgs[0].sender, "sender-a");
        assert_eq!(msgs[0].content, "hello");
    }

    #[test]
    fn test_version_reading() {
        let version = get_version();
        assert!(!version.is_empty());
    }

    #[test]
    fn test_serialization_chat_message() {
        let msg = ChatMessage {
            sender: "test-peer".to_string(),
            content: "hello".to_string(),
            timestamp: 12345,
        };
        let serialized = serde_json::to_string(&msg).unwrap();
        let deserialized: ChatMessage = serde_json::from_str(&serialized).unwrap();
        assert_eq!(deserialized.content, "hello");
    }

    #[test]
    fn test_dht_record_handling() {
        let (tx, _rx) = mpsc::channel(1);
        let state = AppState::new("test-peer".to_string(), tx);

        state.handle_dht_record("profile:alice".to_string(), "AliceAlias".to_string());
        state.handle_dht_record("market:item1".to_string(), "Sword".to_string());
        state.handle_dht_record("other:key".to_string(), "ignore".to_string());

        assert_eq!(state.profiles.lock().unwrap().get("profile:alice").unwrap(), "AliceAlias");
        assert_eq!(state.market_items.lock().unwrap().get("market:item1").unwrap(), "Sword");
        assert_eq!(state.profiles.lock().unwrap().len(), 1);
        assert_eq!(state.market_items.lock().unwrap().len(), 1);
    }
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
    let state = Arc::new(AppState::new(peer_id_str.clone(), tx));

    // API Server
    let api_state = Arc::clone(&state);
    let http_client = Client::new();

    let app = Router::new()
        .route("/api/status", get({
            let s = Arc::clone(&api_state);
            move || async move {
                let peers = *s.peers.lock().unwrap();
                let network = s.network.lock().unwrap().clone();
                let uptime = s.start_time.elapsed().as_secs();
                let sent = *s.msg_sent_count.lock().unwrap();
                let recv = *s.msg_recv_count.lock().unwrap();
                let latencies = s.peer_latencies.lock().unwrap().clone();
                let trusted = s.social.list_trusted(&s.peer_id);
                let reputation = s.social.get_reputation(&s.peer_id);
                let dht_count = s.profiles.lock().unwrap().len() + s.market_items.lock().unwrap().len();

                let (cpu, mem) = {
                    let mut sys = s.sys.lock().unwrap();
                    sys.refresh_cpu_specifics(CpuRefreshKind::everything());
                    sys.refresh_memory_specifics(MemoryRefreshKind::everything());
                    (sys.global_cpu_info().cpu_usage(), sys.used_memory() as f64 / sys.total_memory() as f64 * 100.0)
                };

                Json(json!({
                    "peer_id": s.peer_id,
                    "peers": peers,
                    "network": network,
                    "version": get_version(),
                    "uptime_secs": uptime,
                    "messages_sent": sent,
                    "messages_received": recv,
                    "peer_latencies": latencies,
                    "trusted_peers": trusted,
                    "reputation": reputation,
                    "dht_records": dht_count,
                    "cpu_usage": cpu,
                    "memory_usage": mem,
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
        .route("/api/market/list", get({
            let s = Arc::clone(&api_state);
            move || async move {
                let items = s.market_items.lock().unwrap().clone();
                Json(items)
            }
        }))
        .route("/api/dht/get", get({
            let s = Arc::clone(&api_state);
            move |axum::extract::Query(params): axum::extract::Query<std::collections::HashMap<String, String>>| {
                let s = Arc::clone(&s);
                async move {
                    if let Some(key) = params.get("key") {
                        let _ = s.command_tx.send(Command::GetRecord { key: key.clone() }).await;
                        Json(json!({ "status": "query initiated" }))
                    } else {
                        Json(json!({ "status": "error", "message": "missing key" }))
                    }
                }
            }
        }))
        .route("/api/system/stats", get({
            let s = Arc::clone(&api_state);
            move || async move {
                let proposals = s.governance.list_proposals();
                let active_count = proposals.len();
                let total_votes = proposals.iter().map(|p| p.votes_for.len() + p.votes_against.len()).sum::<usize>();
                let total_weight = proposals.iter().map(|p| p.weight_for + p.weight_against).sum::<i32>();

                Json(json!({
                    "node_id": s.peer_id,
                    "reputation": s.social.get_reputation(&s.peer_id),
                    "governance": {
                        "active_proposals": active_count,
                        "total_votes": total_votes,
                        "total_weight": total_weight
                    },
                    "mesh": {
                        "peers": *s.peers.lock().unwrap(),
                        "messages_sent": *s.msg_sent_count.lock().unwrap(),
                        "messages_received": *s.msg_recv_count.lock().unwrap()
                    }
                }))
            }
        }))
        .route("/api/social/trust", post({
            let s = Arc::clone(&api_state);
            move |Json(payload): Json<serde_json::Value>| {
                let s = Arc::clone(&s);
                async move {
                    let target = payload["target"].as_str().unwrap_or("").to_string();
                    let action = payload["action"].as_str().unwrap_or("trust");

                    if action == "trust" {
                        s.social.trust_peer(s.peer_id.clone(), target);
                    } else {
                        s.social.untrust_peer(s.peer_id.clone(), target);
                    }

                    Json(json!({ "status": "success" }))
                }
            }
        }))
        .route("/api/messages/list", get({
            let s = Arc::clone(&api_state);
            move || async move {
                let messages = s.messages.lock().unwrap().clone();
                Json(messages)
            }
        }))
        .route("/api/messages/send", post({
            let s = Arc::clone(&api_state);
            move |Json(payload): Json<serde_json::Value>| {
                let s = Arc::clone(&s);
                async move {
                    let content = payload["content"].as_str().unwrap_or("").to_string();
                    println!("[API] Send Message: {}", content);

                    s.add_message(s.peer_id.clone(), content.clone());
                    s.increment_sent();

                    let _ = s.command_tx.send(Command::SendMessage {
                        topic: "xrnet-global".to_string(),
                        message: content,
                    }).await;
                    Json(json!({ "status": "sent" }))
                }
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
                    } else if payload.key.starts_with("market:") {
                        let mut m = s.market_items.lock().unwrap();
                        m.insert(payload.key, payload.value);
                    } else if payload.key.starts_with("learn:") {
                        let mut p = s.profiles.lock().unwrap(); // Reuse profiles map for simple simulated learning hub
                        p.insert(payload.key, payload.value);
                    }

                    Json(json!({ "status": "sent to protocol swarm" }))
                }
            }
        }))
        .route("/api/governance/propose", post({
            let s = Arc::clone(&api_state);
            move |Json(payload): Json<serde_json::Value>| {
                let s = Arc::clone(&s);
                async move {
                    let title = payload["title"].as_str().unwrap_or("").to_string();
                    let description = payload["description"].as_str().unwrap_or("").to_string();
                    let id = s.governance.create_proposal(s.peer_id.clone(), title, description);

                    // Reward proposer
                    s.social.add_reputation(&s.peer_id, 5);

                    if let Some(prop) = s.governance.get_proposal(&id) {
                        let value = serde_json::to_string(&prop).unwrap();
                        let _ = s.command_tx.send(Command::PutRecord {
                            key: format!("gov:{}", id),
                            value,
                        }).await;
                    }

                    Json(json!({ "status": "success", "id": id }))
                }
            }
        }))
        .route("/api/governance/vote", post({
            let s = Arc::clone(&api_state);
            move |Json(payload): Json<serde_json::Value>| {
                let s = Arc::clone(&s);
                async move {
                    let id = payload["id"].as_str().unwrap_or("").to_string();
                    let approve = payload["approve"].as_bool().unwrap_or(true);

                    let weight = s.social.get_reputation(&s.peer_id);
                    let success = s.governance.cast_vote(s.peer_id.clone(), id.clone(), approve, weight);

                    if success {
                        // Reward voter
                        s.social.add_reputation(&s.peer_id, 1);
                        if let Some(prop) = s.governance.get_proposal(&id) {
                            let value = serde_json::to_string(&prop).unwrap();
                            let _ = s.command_tx.send(Command::PutRecord {
                                key: format!("gov:{}", id),
                                value,
                            }).await;
                        }
                    }

                    Json(json!({ "status": if success { "success" } else { "not_found" } }))
                }
            }
        }))
        .route("/api/governance/list", get({
            let s = Arc::clone(&api_state);
            move || async move {
                let props = s.governance.list_proposals();
                Json(props)
            }
        }))
        .route("/api/bobcoin/balance/:account", get({
            let client = http_client.clone();
            move |axum::extract::Path(account): axum::extract::Path<String>| async move {
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
        .route("/api/bobcoin/frontier/:account", get({
            let client = http_client.clone();
            move |axum::extract::Path(account): axum::extract::Path<String>| async move {
                let url = format!("http://127.0.0.1:4000/frontier/{}", account);
                match client.get(url).send().await {
                    Ok(resp) => {
                        let json: serde_json::Value = resp.json().await.unwrap_or(json!({ "error": "failed to parse" }));
                        Json(json)
                    }
                    Err(e) => Json(json!({ "error": e.to_string() })),
                }
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
        .route("/api/system/protocol", post(|| async move {
            println!("[API] Executive Protocol requested.");

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

                    Json(json!({
                        "status": status,
                        "stdout": stdout,
                        "stderr": stderr,
                        "exit_code": out.status.code()
                    }))
                }
                Err(e) => {
                    Json(json!({
                        "status": "error",
                        "message": e.to_string()
                    }))
                }
            }
        }))
        .fallback_service(ServeDir::new("frontend/dist"))
        .layer(CorsLayer::permissive());

    // Central Telemetry Reporting Task
    let reporting_state = Arc::clone(&state);
    let monitor_host = std::env::var("MONITOR_HOST").unwrap_or_else(|_| "127.0.0.1".to_string());
    let api_port_str = std::env::var("API_PORT").unwrap_or_else(|_| "8080".to_string());
    let api_port = api_port_str.parse::<u16>().unwrap_or(8080);
    let reporting_api_port = api_port;

    tokio::spawn(async move {
        loop {
            tokio::time::sleep(std::time::Duration::from_secs(10)).await;

            let (cpu, mem, peers, peer_id, sent, recv, latencies, reputation, bw_in, bw_out) = {
                let mut sys = reporting_state.sys.lock().unwrap();
                sys.refresh_cpu_specifics(CpuRefreshKind::everything());
                sys.refresh_memory_specifics(MemoryRefreshKind::everything());
                (
                    sys.global_cpu_info().cpu_usage(),
                    sys.used_memory() as f64 / sys.total_memory() as f64 * 100.0,
                    *reporting_state.peers.lock().unwrap(),
                    reporting_state.peer_id.clone(),
                    *reporting_state.msg_sent_count.lock().unwrap(),
                    *reporting_state.msg_recv_count.lock().unwrap(),
                    reporting_state.peer_latencies.lock().unwrap().clone(),
                    reporting_state.social.get_reputation(&reporting_state.peer_id),
                    *reporting_state.bandwidth_in.lock().unwrap(),
                    *reporting_state.bandwidth_out.lock().unwrap(),
                )
            };

            let report = serde_json::json!({
                "type": "TELEMETRY",
                "peer_id": peer_id,
                "cpu": cpu,
                "memory": mem,
                "peers": peers,
                "api_port": reporting_api_port,
                "reputation": reputation,
                "bandwidth_in": bw_in,
                "bandwidth_out": bw_out,
                "uptime_secs": reporting_state.start_time.elapsed().as_secs(),
                "messages_sent": sent,
                "messages_received": recv,
                "peer_latencies": latencies,
                "timestamp": std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_secs()
            });

            let monitor_addr = format!("{}:9000", monitor_host);
            if let Ok(mut stream) = tokio::net::TcpStream::connect(&monitor_addr).await {
                let msg = format!("{}\n", report.to_string());
                let _ = stream.write_all(msg.as_bytes()).await;
            }
        }
    });


    let addr = SocketAddr::from(([0, 0, 0, 0], api_port));
    tokio::spawn(async move {
        println!("[API] Server listening on http://{}", addr);
        let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
        axum::serve(listener, app).await.unwrap();
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
