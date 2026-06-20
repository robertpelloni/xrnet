mod api;
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
use std::net::SocketAddr;


use std::sync::{Arc, Mutex};
use reqwest::Client;
use tower_http::cors::CorsLayer;
use serde::Deserialize;
use tokio::sync::mpsc;
use std::collections::HashMap;

use governance::NeutralArbitrator;

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
            if stream.read_exact(&mut buffer).await.is_ok()
                && &buffer == b"XRNET_ACK" {
                    println!("[PROTOCOL] Handshake with external system successful.");
                    return true;
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
    let app = crate::api::api_router(Arc::clone(&api_state), http_client.clone())
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
