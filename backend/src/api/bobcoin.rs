use axum::{
    extract::{Json, Path},
    routing::{get, post},
    Router,
};
use serde_json::json;
use reqwest::Client;

pub fn routes(http_client: Client) -> Router {
    Router::new()
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
}
