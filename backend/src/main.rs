use axum::Extension;
use std::sync::{Arc, Mutex};
use tokio::sync::mpsc;
use tower_http::cors::CorsLayer;

mod api;
mod mesh;
mod routing;
mod escrow;
mod social;
mod governance;
mod spatial;
mod plugin;

#[derive(Clone)]
pub struct AppState {
    pub peers: Arc<Mutex<usize>>,
    pub network_status: Arc<Mutex<String>>,
    pub profiles: Arc<Mutex<std::collections::HashMap<String, String>>>,
    pub jobs: Arc<Mutex<std::collections::HashMap<String, String>>>,
    pub command_tx: mpsc::Sender<Command>,
    pub escrow_manager: Arc<Mutex<escrow::EscrowManager>>,
    pub arbitrator: Arc<Mutex<governance::NeutralArbitrator>>,
    pub spatial_manager: Arc<Mutex<spatial::SpatialManager>>,
    pub plugin_manager: Arc<Mutex<plugin::PluginManager>>,
    pub routing_table: Arc<Mutex<routing::DistanceVectorTable>>,
    pub routing_engine: Arc<Mutex<routing::RoutingEngine>>,
}

#[derive(Debug, Clone)]
pub enum Command {
    PutRecord { key: String, value: String },
    SendMessage { topic: String, message: String },
    BroadcastSpatialUpdate { splat: spatial::GaussianSplat },
}

#[tokio::main]
async fn main() {
    let (tx, rx) = mpsc::channel(100);

    let state = Arc::new(AppState {
        peers: Arc::new(Mutex::new(0)),
        network_status: Arc::new(Mutex::new("Initializing".to_string())),
        profiles: Arc::new(Mutex::new(std::collections::HashMap::new())),
        jobs: Arc::new(Mutex::new(std::collections::HashMap::new())),
        command_tx: tx,
        escrow_manager: Arc::new(Mutex::new(escrow::EscrowManager::new())),
        arbitrator: Arc::new(Mutex::new(governance::NeutralArbitrator::new())),
        spatial_manager: Arc::new(Mutex::new(spatial::SpatialManager::new())),
        plugin_manager: Arc::new(Mutex::new(plugin::PluginManager::new())),
        routing_table: Arc::new(Mutex::new(routing::DistanceVectorTable::new())),
        routing_engine: Arc::new(Mutex::new(routing::RoutingEngine::new())),
    });

    let local_key = libp2p::identity::Keypair::generate_ed25519();
    let mesh_state = Arc::clone(&state);

    tokio::spawn(async move {
        if let Err(e) = mesh::run_mesh(local_key, mesh_state, rx).await {
            eprintln!("Mesh network error: {}", e);
        }
    });

    let app = api::api_router(Arc::clone(&state), reqwest::Client::new())
        .layer(CorsLayer::permissive())
        .layer(Extension(state))
        .into_make_service_with_connect_info::<std::net::SocketAddr>();

    println!("[API] Server listening on http://0.0.0.0:3000");
    // Write status.json for coordinator and health-check monitoring
    let status_payload = serde_json::json!({
        "status": "READY",
        "timestamp": std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap_or_default().as_secs(),
        "version": std::fs::read_to_string("VERSION.md").unwrap_or_else(|_| "0.1.142".to_string()).trim()
    });
    let _ = std::fs::write("status.json", status_payload.to_string());
    let _ = std::fs::write("backend/status.json", status_payload.to_string());

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
