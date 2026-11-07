use axum::{
    extract::State,
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use crate::{AppState, routing::MeshPacket};

#[derive(Serialize)]
pub struct RouteItem {
    pub destination: String,
    pub next_hop: String,
    pub metric: u32,
}

#[derive(Serialize)]
pub struct RoutesResponse {
    pub count: usize,
    pub routes: Vec<RouteItem>,
}

#[derive(Deserialize)]
pub struct DispatchRequest {
    pub destination: String,
    pub payload: String,
    pub max_hops: Option<u32>,
    pub neutrality_threshold: Option<f64>,
}

#[derive(Serialize)]
pub struct DispatchResponse {
    pub success: bool,
    pub message: String,
    pub packet: Option<MeshPacket>,
}

pub fn routes(state: Arc<AppState>) -> Router {
    Router::new()
        .route("/api/routing/routes", get(get_routes))
        .route("/api/routing/dispatch", post(dispatch_packet))
        .with_state(state)
}

/// GET /api/routing/routes - returns all active, non-stale distance-vector routes
async fn get_routes(State(state): State<Arc<AppState>>) -> impl IntoResponse {
    let table = state.routing_table.lock().unwrap();
    let entries = table.all_routes();
    let routes: Vec<RouteItem> = entries
        .into_iter()
        .map(|(destination, next_hop, metric)| RouteItem {
            destination,
            next_hop,
            metric,
        })
        .collect();

    let count = routes.len();
    Json(RoutesResponse { count, routes })
}

/// POST /api/routing/dispatch - calculates next hop and dispatches or tests packet routing
async fn dispatch_packet(
    State(state): State<Arc<AppState>>,
    Json(req): Json<DispatchRequest>,
) -> impl IntoResponse {
    if req.destination.trim().is_empty() {
        return (
            StatusCode::BAD_REQUEST,
            Json(DispatchResponse {
                success: false,
                message: "Destination cannot be empty".to_string(),
                packet: None,
            }),
        );
    }

    let max_hops = req.max_hops.unwrap_or(10);
    let neutrality_threshold = req.neutrality_threshold.unwrap_or(0.5);
    let packet_id = format!("pkt_{}", uuid::Uuid::new_v4());

    let mut packet = MeshPacket::new(
        "local_node".to_string(),
        req.destination.trim().to_string(),
        req.payload.into_bytes(),
        max_hops,
        neutrality_threshold,
        packet_id,
    );

    // Check routing table for direct or multi-hop path
    let next_hop = {
        let table = state.routing_table.lock().unwrap();
        table.next_hop(&packet.destination)
    };

    let next_hop = match next_hop {
        Some(nh) => nh,
        None => {
            // Neutrality-aware candidate fallback
            let eng = state.routing_engine.lock().unwrap();
            let candidates: Vec<String> = eng.neutrality_map.keys().cloned().collect();
            if candidates.is_empty() {
                // Standalone loopback fallback
                "local_mesh_loopback".to_string()
            } else {
                eng.best_neutrality_peer(candidates).unwrap_or_else(|| "local_mesh_loopback".to_string())
            }
        }
    };

    packet.advance(next_hop.clone());

    // Publish to xrnet-routing topic via command_tx
    if let Ok(serialized) = serde_json::to_string(&packet) {
        state
            .command_tx
            .try_send(crate::Command::SendMessage {
                topic: "xrnet-routing".to_string(),
                message: serialized,
            })
            .ok();
    }

    (
        StatusCode::OK,
        Json(DispatchResponse {
            success: true,
            message: format!("Packet dispatched successfully to next hop: {}", next_hop),
            packet: Some(packet),
        }),
    )
}
