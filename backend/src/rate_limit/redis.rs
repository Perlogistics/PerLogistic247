use crate::rate_limit::config::RateLimitConfig;
use crate::rate_limit::in_memory::RateLimiter;
use async_trait::async_trait;
use redis::AsyncCommands;

#[derive(Debug, Clone)]
pub struct RedisRateLimiter {
    config: RateLimitConfig,
    client: redis::Client,
}

impl RedisRateLimiter {
    pub async fn new(config: RateLimitConfig) -> Result<Self, String> {
        let redis_url = config.redis_url
            .as_ref()
            .ok_or_else(|| "Redis URL not configured".to_string())?;

        let client = redis::Client::open(redis_url.as_str())
            .map_err(|e| format!("Failed to create Redis client: {}", e))?;

        // Test connection
        let mut conn = client
            .get_async_connection()
            .await
            .map_err(|e| format!("Failed to connect to Redis: {}", e))?;

        // Verify connection by sending a command
        let _: String = redis::cmd("PING")
            .query_async(&mut conn)
            .await
            .map_err(|e| format!("Redis ping failed: {}", e))?;

        Ok(Self { config, client })
    }

    fn get_minute_key(&self, key: &str) -> String {
        format!("rate_limit:{}:minute", key)
    }

    fn get_hour_key(&self, key: &str) -> String {
        format!("rate_limit:{}:hour", key)
    }

    fn get_burst_key(&self, key: &str) -> String {
        format!("rate_limit:{}:burst", key)
    }
}

#[async_trait]
impl RateLimiter for RedisRateLimiter {
    async fn check_rate_limit(&self, key: &str) -> Result<bool, String> {
        let mut conn = self
            .client
            .get_async_connection()
            .await
            .map_err(|e| format!("Failed to get Redis connection: {}", e))?;

        let minute_key = self.get_minute_key(key);
        let hour_key = self.get_hour_key(key);
        let burst_key = self.get_burst_key(key);

        // Check minute limit
        let minute_count: usize = conn
            .get(&minute_key)
            .await
            .unwrap_or(0);

        if minute_count >= self.config.requests_per_minute as usize {
            return Ok(false);
        }

        // Check hour limit
        let hour_count: usize = conn
            .get(&hour_key)
            .await
            .unwrap_or(0);

        if hour_count >= self.config.requests_per_hour as usize {
            return Ok(false);
        }

        // Check burst limit
        let burst_count: usize = conn
            .get(&burst_key)
            .await
            .unwrap_or(0);

        if burst_count >= self.config.burst_size as usize {
            return Ok(false);
        }

        // Increment counters with expiration
        let _: () = conn
            .incr(&minute_key, 1)
            .await
            .map_err(|e| format!("Failed to increment minute counter: {}", e))?;

        let _: () = conn
            .expire(&minute_key, 60)
            .await
            .map_err(|e| format!("Failed to set minute expiration: {}", e))?;

        let _: () = conn
            .incr(&hour_key, 1)
            .await
            .map_err(|e| format!("Failed to increment hour counter: {}", e))?;

        let _: () = conn
            .expire(&hour_key, 3600)
            .await
            .map_err(|e| format!("Failed to set hour expiration: {}", e))?;

        let _: () = conn
            .incr(&burst_key, 1)
            .await
            .map_err(|e| format!("Failed to increment burst counter: {}", e))?;

        let _: () = conn
            .expire(&burst_key, 1)
            .await
            .map_err(|e| format!("Failed to set burst expiration: {}", e))?;

        Ok(true)
    }

    async fn get_remaining_requests(&self, key: &str) -> Result<u32, String> {
        let mut conn = self
            .client
            .get_async_connection()
            .await
            .map_err(|e| format!("Failed to get Redis connection: {}", e))?;

        let minute_key = self.get_minute_key(key);
        let minute_count: usize = conn
            .get(&minute_key)
            .await
            .unwrap_or(0);

        let remaining = self.config.requests_per_minute.saturating_sub(minute_count as u32);
        Ok(remaining)
    }
}
