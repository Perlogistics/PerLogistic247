mod rate_limit;

use axum::{
    extract::{FromRef, State},
    response::Json,
    routing::{get, post},
    Router,
};
use rate_limit::{RateLimitConfig, RateLimitMiddleware};
use serde::{Deserialize, Serialize};
use std::net::SocketAddr;
use tower_http::cors::{Any, CorsLayer};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[derive(Clone)]
struct AppState {
    rate_limit_middleware: RateLimitMiddleware,
}

impl FromRef<AppState> for RateLimitMiddleware {
    fn from_ref(state: &AppState) -> Self {
        state.rate_limit_middleware.clone()
    }
}

#[derive(Serialize)]
struct HealthResponse {
    status: String,
    version: String,
}

#[derive(Deserialize)]
struct ApiRequest {
    message: String,
}

#[derive(Serialize)]
struct ApiResponse {
    success: bool,
    message: String,
    data: Option<serde_json::Value>,
}

async fn health_check() -> Json<HealthResponse> {
    Json(HealthResponse {
        status: "healthy".to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
    })
}

async fn api_endpoint(
    State(_state): State<AppState>,
    Json(payload): Json<ApiRequest>,
) -> Json<ApiResponse> {
    Json(ApiResponse {
        success: true,
        message: format!("Received: {}", payload.message),
        data: None,
    })
}

async fn rate_limited_endpoint(
    State(_state): State<AppState>,
) -> Json<ApiResponse> {
    Json(ApiResponse {
        success: true,
        message: "This endpoint is rate limited".to_string(),
        data: None,
    })
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Initialize tracing
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "supply_chain_backend=debug,tower_http=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    // Load rate limit configuration
    let rate_limit_config = RateLimitConfig::from_env()
        .unwrap_or_else(|_| {
            tracing::warn!("Failed to load rate limit config from env, using defaults");
            RateLimitConfig::default()
        });

    tracing::info!("Rate limit strategy: {:?}", rate_limit_config.strategy);
    tracing::info!("Rate limit RPM: {}", rate_limit_config.requests_per_minute);
    tracing::info!("Rate limit RPH: {}", rate_limit_config.requests_per_hour);

    // Initialize rate limit middleware
    let rate_limit_middleware = RateLimitMiddleware::new(rate_limit_config).await
        .map_err(|e| anyhow::anyhow!("Failed to initialize rate limit middleware: {}", e))?;

    // Create application state
    let app_state = AppState {
        rate_limit_middleware,
    };

    // Build our application with routes
    let api_routes = Router::new()
        .route("/api/echo", post(api_endpoint))
        .route("/api/rate-limited", get(rate_limited_endpoint))
        .layer(axum::middleware::from_fn_with_state(
            app_state.clone(),
            rate_limit::middleware::rate_limit_middleware,
        ));

    let app = Router::new()
        .route("/health", get(health_check))
        .merge(api_routes)
        .layer(
            CorsLayer::new()
                .allow_origin(Any)
                .allow_methods(Any)
                .allow_headers(Any),
        )
        .with_state(app_state);

    // Run the server
    let addr = SocketAddr::from(([0, 0, 0, 0], 3000));
    tracing::info!("Server listening on {}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}
