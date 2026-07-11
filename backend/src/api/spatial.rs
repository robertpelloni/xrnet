use axum::{
    extract::Json,
    routing::{get, post},
    Router,
};
use serde_json::json;
use std::sync::Arc;
use crate::AppState;
use crate::spatial::GaussianSplat;

pub fn routes(state: Arc<AppState>) -> Router {
    Router::new()
        .route("/api/spatial/splats", get({
            let s = Arc::clone(&state);
            move || async move {
                let spatial_manager = s.spatial_manager.lock().unwrap();
                let splats = spatial_manager.get_all_splats();
                Json(json!({ "splats": splats }))
            }
        }))
        .route("/api/spatial/upload", post({
            let s = Arc::clone(&state);
            move |Json(payload): Json<GaussianSplat>| async move {
                let mut spatial_manager = s.spatial_manager.lock().unwrap();
                spatial_manager.add_local_splat(payload.clone());

                // Trigger a network broadcast of the new splat
                let _ = s.command_tx.try_send(crate::Command::BroadcastSpatialUpdate { splat: payload });

                Json(json!({ "status": "success" }))
            }
        }))
}
