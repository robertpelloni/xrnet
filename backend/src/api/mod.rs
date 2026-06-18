pub mod system;
pub mod dht;
pub mod jobs;
pub mod social;
pub mod escrow;
pub mod governance;
pub mod messages;
pub mod bobcoin;

use axum::Router;
use std::sync::Arc;
use crate::AppState;
use reqwest::Client;

pub fn api_router(state: Arc<AppState>, http_client: Client) -> Router {
    Router::new()
        .merge(system::routes(Arc::clone(&state)))
        .merge(dht::routes(Arc::clone(&state)))
        .merge(jobs::routes(Arc::clone(&state)))
        .merge(social::routes(Arc::clone(&state)))
        .merge(escrow::routes(Arc::clone(&state)))
        .merge(governance::routes(Arc::clone(&state)))
        .merge(messages::routes(Arc::clone(&state)))
        .merge(bobcoin::routes(http_client))
}
