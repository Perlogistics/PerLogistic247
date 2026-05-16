use serde::{Deserialize, Serialize};
use std::time::Duration;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RateLimitStrategy {
    InMemory,
    Redis,
    Distributed,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RateLimitConfig {
    pub strategy: RateLimitStrategy,
    pub requests_per_minute: u32,
    pub requests_per_hour: u32,
    pub burst_size: u32,
    pub cleanup_interval: Duration,
    pub redis_url: Option<String>,
    pub distributed_nodes: Vec<String>,
}

impl Default for RateLimitConfig {
    fn default() -> Self {
        Self {
            strategy: RateLimitStrategy::InMemory,
            requests_per_minute: 60,
            requests_per_hour: 1000,
            burst_size: 10,
            cleanup_interval: Duration::from_secs(60),
            redis_url: None,
            distributed_nodes: vec![],
        }
    }
}

impl RateLimitConfig {
    pub fn from_env() -> anyhow::Result<Self> {
        let strategy = std::env::var("RATE_LIMIT_STRATEGY")
            .unwrap_or_else(|_| "in_memory".to_string())
            .to_lowercase();

        let strategy = match strategy.as_str() {
            "redis" => RateLimitStrategy::Redis,
            "distributed" => RateLimitStrategy::Distributed,
            _ => RateLimitStrategy::InMemory,
        };

        let redis_url = std::env::var("REDIS_URL").ok();
        
        let distributed_nodes = std::env::var("DISTRIBUTED_NODES")
            .ok()
            .map(|nodes| nodes.split(',').map(|s| s.trim().to_string()).collect())
            .unwrap_or_default();

        Ok(Self {
            strategy,
            requests_per_minute: std::env::var("RATE_LIMIT_RPM")
                .ok()
                .and_then(|s| s.parse().ok())
                .unwrap_or(60),
            requests_per_hour: std::env::var("RATE_LIMIT_RPH")
                .ok()
                .and_then(|s| s.parse().ok())
                .unwrap_or(1000),
            burst_size: std::env::var("RATE_LIMIT_BURST")
                .ok()
                .and_then(|s| s.parse().ok())
                .unwrap_or(10),
            cleanup_interval: Duration::from_secs(
                std::env::var("RATE_LIMIT_CLEANUP_INTERVAL")
                    .ok()
                    .and_then(|s| s.parse().ok())
                    .unwrap_or(60)
            ),
            redis_url,
            distributed_nodes,
        })
    }
}
