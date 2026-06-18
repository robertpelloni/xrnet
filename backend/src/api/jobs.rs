use axum::{
    routing::get,
    Router,
    Json,
};
use std::sync::Arc;
use crate::AppState;

pub fn routes(state: Arc<AppState>) -> Router {
    Router::new()
        .route("/api/jobs", get({
            let s = Arc::clone(&state);
            move || async move {
                let jobs = s.jobs.lock().unwrap().clone();
                Json(jobs)
            }
        }))
}
