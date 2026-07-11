use axum::{
    extract::{Json, Path},
    routing::{get, post, delete},
    Router,
};
use serde_json::json;
use std::sync::Arc;
use crate::{AppState, plugin::PluginManifest};

pub fn routes(state: Arc<AppState>) -> Router {
    Router::new()
        .route("/api/plugins", get({
            let s = Arc::clone(&state);
            move || async move {
                let pm = s.plugin_manager.lock().unwrap();
                Json(json!({ "plugins": pm.list_plugins() }))
            }
        }))
        .route("/api/plugins/register", post({
            let s = Arc::clone(&state);
            move |Json(manifest): Json<PluginManifest>| async move {
                let mut pm = s.plugin_manager.lock().unwrap();
                let success = pm.register_plugin(manifest);
                Json(json!({ "success": success }))
            }
        }))
        .route("/api/plugins/:id", delete({
            let s = Arc::clone(&state);
            move |Path(id): Path<String>| async move {
                let mut pm = s.plugin_manager.lock().unwrap();
                let success = pm.unregister_plugin(&id);
                Json(json!({ "success": success }))
            }
        }))
        .route("/api/plugins/:id/execute", post({
            let s = Arc::clone(&state);
            move |Path(id): Path<String>, Json(payload): Json<serde_json::Value>| async move {
                let pm = s.plugin_manager.lock().unwrap();
                match pm.execute_plugin(&id, &payload.to_string()) {
                    Ok(result) => Json(json!({ "success": true, "result": result })),
                    Err(e) => Json(json!({ "success": false, "error": e }))
                }
            }
        }))
}
