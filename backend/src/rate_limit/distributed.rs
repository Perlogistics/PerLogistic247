use crate::rate_limit::config::RateLimitConfig;
use crate::rate_limit::in_memory::RateLimiter;
use async_trait::async_trait;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;

#[derive(Debug, Clone)]
pub struct DistributedRateLimiter {
    config: RateLimitConfig,
    nodes: Vec<String>,
    local_limiter: Arc<crate::rate_limit::in_memory::InMemoryRateLimiter>,
    node_states: Arc<RwLock<HashMap<String, NodeState>>>,
}

#[derive(Debug, Clone)]
struct NodeState {
    last_sync: std::time::Instant,
    request_count: u32,
}

impl DistributedRateLimiter {
    pub fn new(config: RateLimitConfig) -> Self {
        let nodes = config.distributed_nodes.clone();
        let local_limiter = Arc::new(crate::rate_limit::in_memory::InMemoryRateLimiter::new(
            config.clone(),
        ));

        Self {
            config,
            nodes,
            local_limiter,
            node_states: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    async fn sync_with_nodes(&self, _key: &str) -> Result<(), String> {
        if self.nodes.is_empty() {
            return Ok(());
        }

        let mut states = self.node_states.write().await;
        let now = std::time::Instant::now();

        for node in &self.nodes {
            let state = states.entry(node.clone()).or_insert_with(|| NodeState {
                last_sync: now,
                request_count: 0,
            });

            // Simulate syncing with other nodes
            // In a real implementation, this would make HTTP requests to other nodes
            if now.duration_since(state.last_sync) > std::time::Duration::from_secs(5) {
                state.last_sync = now;
                state.request_count = 0; // Reset after sync
            }
        }

        Ok(())
    }

    async fn get_total_request_count(&self) -> u32 {
        let states = self.node_states.read().await;
        let local_count = self.local_limiter.get_remaining_requests(&"local".to_string()).await.unwrap_or(0);
        
        let distributed_count: u32 = states.values().map(|s| s.request_count).sum();
        
        // Convert remaining to count (inverse)
        let local_requests = self.config.requests_per_minute.saturating_sub(local_count);
        local_requests + distributed_count
    }
}

#[async_trait]
impl RateLimiter for DistributedRateLimiter {
    async fn check_rate_limit(&self, key: &str) -> Result<bool, String> {
        // Sync with other nodes
        self.sync_with_nodes(key).await?;

        // Check local rate limit first
        let local_allowed = self.local_limiter.check_rate_limit(key).await?;

        if !local_allowed {
            return Ok(false);
        }

        // Check distributed limits
        let total_requests = self.get_total_request_count().await;

        if total_requests >= self.config.requests_per_minute {
            return Ok(false);
        }

        // Update local node state
        let mut states = self.node_states.write().await;
        if let Some(state) = states.get_mut(&"local".to_string()) {
            state.request_count += 1;
        }

        Ok(true)
    }

    async fn get_remaining_requests(&self, _key: &str) -> Result<u32, String> {
        let total_requests = self.get_total_request_count().await;
        let remaining = self.config.requests_per_minute.saturating_sub(total_requests);
        Ok(remaining)
    }
}
