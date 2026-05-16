use crate::rate_limit::config::RateLimitConfig;
use async_trait::async_trait;
use dashmap::DashMap;
use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::time::sleep;

#[derive(Debug, Clone)]
struct RateLimitState {
    requests: Vec<Instant>,
}

#[derive(Debug, Clone)]
pub struct InMemoryRateLimiter {
    config: RateLimitConfig,
    state: Arc<DashMap<String, RateLimitState>>,
}

impl InMemoryRateLimiter {
    pub fn new(config: RateLimitConfig) -> Self {
        let limiter = Self {
            config,
            state: Arc::new(DashMap::new()),
        };

        // Start cleanup task
        let state_clone = limiter.state.clone();
        let cleanup_interval = limiter.config.cleanup_interval;
        tokio::spawn(async move {
            loop {
                sleep(cleanup_interval).await;
                let now = Instant::now();
                state_clone.retain(|_, state| {
                    state.requests.retain(|&timestamp| {
                        now.duration_since(timestamp) < Duration::from_secs(3600)
                    });
                    !state.requests.is_empty()
                });
            }
        });

        limiter
    }

    fn cleanup_old_requests(&self, _key: &str, state: &mut RateLimitState) {
        let now = Instant::now();
        state.requests.retain(|&timestamp| {
            now.duration_since(timestamp) < Duration::from_secs(3600)
        });
    }
}

#[async_trait]
pub trait RateLimiter: Send + Sync {
    async fn check_rate_limit(&self, key: &str) -> Result<bool, String>;
    async fn get_remaining_requests(&self, key: &str) -> Result<u32, String>;
}

#[async_trait]
impl RateLimiter for InMemoryRateLimiter {
    async fn check_rate_limit(&self, key: &str) -> Result<bool, String> {
        let now = Instant::now();
        let mut state = self.state.entry(key.to_string()).or_insert_with(|| {
            RateLimitState {
                requests: Vec::new(),
            }
        });

        // Clean up old requests
        self.cleanup_old_requests(key, &mut state);

        // Check minute limit
        let minute_ago = now - Duration::from_secs(60);
        let requests_last_minute = state.requests.iter()
            .filter(|&&timestamp| timestamp > minute_ago)
            .count();

        if requests_last_minute >= self.config.requests_per_minute as usize {
            return Ok(false);
        }

        // Check hour limit
        let hour_ago = now - Duration::from_secs(3600);
        let requests_last_hour = state.requests.iter()
            .filter(|&&timestamp| timestamp > hour_ago)
            .count();

        if requests_last_hour >= self.config.requests_per_hour as usize {
            return Ok(false);
        }

        // Check burst limit (max requests within a single second)
        let one_second_ago = now - Duration::from_secs(1);
        let requests_last_second = state.requests.iter()
            .filter(|&&timestamp| timestamp > one_second_ago)
            .count();

        if requests_last_second >= self.config.burst_size as usize {
            return Ok(false);
        }

        // Add current request
        state.requests.push(now);
        Ok(true)
    }

    async fn get_remaining_requests(&self, key: &str) -> Result<u32, String> {
        let now = Instant::now();
        let mut state = self.state.entry(key.to_string()).or_insert_with(|| {
            RateLimitState {
                requests: Vec::new(),
            }
        });

        self.cleanup_old_requests(key, &mut state);

        let minute_ago = now - Duration::from_secs(60);
        let requests_last_minute = state.requests.iter()
            .filter(|&&timestamp| timestamp > minute_ago)
            .count();

        let remaining = self.config.requests_per_minute.saturating_sub(requests_last_minute as u32);
        Ok(remaining)
    }
}
