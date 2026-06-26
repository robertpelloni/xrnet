use axum::Router;
use std::sync::Arc;
use reqwest::Client;
use crate::AppState;

mod system;
mod dht;
mod jobs;
mod social;
mod escrow;
mod governance;
mod messages;
mod bobcoin;
mod spatial;
mod plugin;

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
        .merge(spatial::routes(Arc::clone(&state)))
        .merge(plugin::routes(Arc::clone(&state)))
}
