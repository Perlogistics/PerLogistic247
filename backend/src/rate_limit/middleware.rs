use crate::rate_limit::config::{RateLimitConfig, RateLimitStrategy};
use crate::rate_limit::in_memory::RateLimiter;
use axum::{
    extract::Request,
    http::{HeaderMap, StatusCode},
    middleware::Next,
    response::Response,
};
use std::sync::Arc;

#[derive(Clone)]
pub struct RateLimitMiddleware {
    limiter: Arc<dyn RateLimiter>,
    requests_per_minute: u32,
}

impl RateLimitMiddleware {
    pub async fn new(config: RateLimitConfig) -> Result<Self, String> {
        let requests_per_minute = config.requests_per_minute;
        let limiter: Arc<dyn RateLimiter> = match config.strategy {
            RateLimitStrategy::InMemory => {
                Arc::new(crate::rate_limit::in_memory::InMemoryRateLimiter::new(config))
            }
            RateLimitStrategy::Redis => {
                Arc::new(crate::rate_limit::redis::RedisRateLimiter::new(config).await?)
            }
            RateLimitStrategy::Distributed => {
                Arc::new(crate::rate_limit::distributed::DistributedRateLimiter::new(config))
            }
        };

        Ok(Self { limiter, requests_per_minute })
    }

    fn extract_client_key(&self, headers: &HeaderMap) -> String {
        // Try API key first
        if let Some(api_key) = headers.get("x-api-key") {
            if let Ok(key_str) = api_key.to_str() {
                return format!("api_key:{}", key_str);
            }
        }

        // Try X-Forwarded-For (first IP in chain is the real client)
        if let Some(forwarded_for) = headers.get("x-forwarded-for") {
            if let Ok(ip_str) = forwarded_for.to_str() {
                let ip = ip_str.split(',').next().unwrap_or("").trim();
                if !ip.is_empty() {
                    return format!("ip:{}", ip);
                }
            }
        }

        // Try X-Real-IP
        if let Some(real_ip) = headers.get("x-real-ip") {
            if let Ok(ip_str) = real_ip.to_str() {
                let ip = ip_str.trim();
                if !ip.is_empty() {
                    return format!("ip:{}", ip);
                }
            }
        }

        "default".to_string()
    }
}

pub async fn rate_limit_middleware(
    middleware: axum::extract::State<RateLimitMiddleware>,
    headers: HeaderMap,
    request: Request,
    next: Next,
) -> Result<Response, StatusCode> {
    let key = middleware.extract_client_key(&headers);

    match middleware.limiter.check_rate_limit(&key).await {
        Ok(true) => {
            let mut response = next.run(request).await;
            if let Ok(remaining) = middleware.limiter.get_remaining_requests(&key).await {
                let headers = response.headers_mut();
                headers.insert(
                    "x-ratelimit-remaining",
                    remaining.to_string().parse().unwrap(),
                );
                headers.insert(
                    "x-ratelimit-limit",
                    middleware.requests_per_minute.to_string().parse().unwrap(),
                );
            }
            Ok(response)
        }
        Ok(false) => {
            let mut response = Response::new(axum::body::Body::empty());
            *response.status_mut() = StatusCode::TOO_MANY_REQUESTS;
            response.headers_mut().insert(
                axum::http::header::RETRY_AFTER,
                "60".parse().unwrap(),
            );
            response.headers_mut().insert(
                "x-ratelimit-limit",
                middleware.requests_per_minute.to_string().parse().unwrap(),
            );
            response.headers_mut().insert("x-ratelimit-remaining", "0".parse().unwrap());
            Ok(response)
        }
        Err(e) => {
            tracing::error!("Rate limit error: {}", e);
            // On error, allow the request but log it
            Ok(next.run(request).await)
        }
    }
}
