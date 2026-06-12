use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct NeutralityMetric {
    pub peer_id: String,
    pub score: f64, // 0.0 to 1.0
    pub completed_tasks: u32,
    pub disputed_tasks: u32,
    pub uptime_ratio: f64,
}

pub struct NeutralArbitrator {
    pub peers: Vec<NeutralityMetric>,
}

impl NeutralArbitrator {
    pub fn new() -> Self {
        Self { peers: Vec::new() }
    }

    pub fn calculate_score(metric: &NeutralityMetric) -> f64 {
        let completion_rate = if metric.completed_tasks == 0 {
            0.5
        } else {
            (metric.completed_tasks as f64) / ((metric.completed_tasks + metric.disputed_tasks) as f64)
        };
        (completion_rate * 0.7) + (metric.uptime_ratio * 0.3)
    }

    pub fn select_arbitrator(&self) -> Option<String> {
        self.peers.iter()
            .max_by(|a, b| Self::calculate_score(a).partial_cmp(&Self::calculate_score(b)).unwrap())
            .map(|m| m.peer_id.clone())
    }
}
