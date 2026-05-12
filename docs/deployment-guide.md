# Deployment Guide

## Overview

This guide covers deploying the Supply Chain Protocol to production environments.

## Prerequisites

### System Requirements

**Minimum:**
- CPU: 4 cores
- RAM: 8GB
- Storage: 100GB SSD
- Network: 100 Mbps

**Recommended:**
- CPU: 8 cores
- RAM: 16GB
- Storage: 500GB SSD
- Network: 1 Gbps

### Software Dependencies

- Docker 20.10+
- Docker Compose 2.0+
- Node.js 18+
- Rust 1.75+
- PostgreSQL 15+
- Redis 7+
- Soroban CLI

## Environment Setup

### 1. Clone Repository
```bash
git clone https://github.com/your-org/supply-chain-protocol.git
cd supply-chain-protocol
```

### 2. Environment Configuration
```bash
cp .env.example .env
# Edit .env with production values
```

### 3. Install Dependencies
```bash
# Frontend
cd frontend
npm install
npm run build

# Backend
cd ../backend
cargo build --release

# Contracts
cd ../contracts
cargo build --target wasm32-unknown-unknown --release
```

## Database Setup

### 1. PostgreSQL Installation
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# CentOS/RHEL
sudo yum install postgresql-server postgresql-contrib
sudo postgresql-setup initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Database Creation
```bash
sudo -u postgres psql
CREATE DATABASE supply_chain;
CREATE USER supply_chain_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE supply_chain TO supply_chain_user;
\q
```

### 3. Run Migrations
```bash
cd scripts
psql -h localhost -U supply_chain_user -d supply_chain -f init-db.sql
```

## Redis Setup

### 1. Redis Installation
```bash
# Ubuntu/Debian
sudo apt install redis-server

# CentOS/RHEL
sudo yum install redis
sudo systemctl start redis
sudo systemctl enable redis
```

### 2. Redis Configuration
```bash
sudo nano /etc/redis/redis.conf
# Set these values:
bind 127.0.0.1
port 6379
requirepass your_redis_password
```

## Stellar/Soroban Setup

### 1. Install Soroban CLI
```bash
# Install Rust if not already installed
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Soroban CLI
cargo install soroban-cli --version 0.9.2
```

### 2. Network Configuration
```bash
# For production, use public network
soroban config network --global futurenet

# For testing, use standalone
soroban config network --global standalone
```

### 3. Deploy Smart Contracts
```bash
cd contracts

# Deploy visibility contract
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/supply_chain_contracts.wasm \
  --source YOUR_SOURCE_ACCOUNT \
  --network futurenet

# Note the contract addresses and update .env file
```

## Application Deployment

### Option 1: Docker Compose (Recommended)

1. **Update docker-compose.yml for production:**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ${DATABASE_NAME}
      POSTGRES_USER: ${DATABASE_USER}
      POSTGRES_PASSWORD: ${DATABASE_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    restart: unless-stopped

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    environment:
      DATABASE_URL: postgres://${DATABASE_USER}:${DATABASE_PASSWORD}@postgres:5432/${DATABASE_NAME}
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
      STELLAR_NETWORK: futurenet
      RUST_LOG: info
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    environment:
      NEXT_PUBLIC_BACKEND_URL: https://api.your-domain.com
      NEXT_PUBLIC_STELLAR_NETWORK: futurenet
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl/certs
    depends_on:
      - frontend
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

2. **Deploy:**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Option 2: Kubernetes

1. **Create Kubernetes manifests:**
```yaml
# namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: supply-chain

---
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: supply-chain-config
  namespace: supply-chain
data:
  DATABASE_HOST: "postgres-service"
  REDIS_HOST: "redis-service"
  STELLAR_NETWORK: "futurenet"
```

2. **Deploy to cluster:**
```bash
kubectl apply -f k8s/
```

### Option 3: Manual Deployment

1. **Backend Service:**
```bash
cd backend
cargo build --release
./target/release/server &
```

2. **Frontend Service:**
```bash
cd frontend
npm run build
npm run start &
```

## SSL/TLS Configuration

### 1. Obtain SSL Certificate
```bash
# Using Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 2. Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Monitoring and Logging

### 1. Application Monitoring
```bash
# Install monitoring tools
docker run -d \
  --name prometheus \
  -p 9090:9090 \
  prom/prometheus

docker run -d \
  --name grafana \
  -p 3001:3000 \
  grafana/grafana
```

### 2. Log Aggregation
```yaml
# docker-compose.logging.yml
version: '3.8'

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.5.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    ports:
      - "9200:9200"

  kibana:
    image: docker.elastic.co/kibana/kibana:8.5.0
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch

  logstash:
    image: docker.elastic.co/logstash/logstash:8.5.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    depends_on:
      - elasticsearch
```

## Backup Strategy

### 1. Database Backups
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"

# Create database backup
pg_dump -h localhost -U supply_chain_user supply_chain > $BACKUP_DIR/db_backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/db_backup_$DATE.sql

# Remove old backups (keep 30 days)
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +30 -delete
```

2. **Automate with cron:**
```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /path/to/backup.sh
```

### 2. Application Backups
```bash
# Backup configuration files
tar -czf /backups/config_$(date +%Y%m%d).tar.gz .env nginx.conf

# Backup SSL certificates
tar -czf /backups/ssl_$(date +%Y%m%d).tar.gz /etc/letsencrypt
```

## Security Hardening

### 1. Firewall Configuration
```bash
# UFW setup
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw deny 5432  # PostgreSQL
sudo ufw deny 6379  # Redis
```

### 2. Database Security
```sql
-- Restrict database connections
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT CONNECT ON DATABASE supply_chain TO supply_chain_user;
GRANT USAGE ON SCHEMA public TO supply_chain_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO supply_chain_user;
```

### 3. Application Security
```rust
// Enable security headers in backend
use tower_http::cors::CorsLayer;
use tower_http::trace::TraceLayer;

let app = Router::new()
    .layer(
        CorsLayer::new()
            .allow_origin("https://your-domain.com".parse::<HeaderValue>().unwrap())
            .allow_methods([Method::GET, Method::POST])
            .allow_headers([AUTHORIZATION, ACCEPT, CONTENT_TYPE])
    )
    .layer(TraceLayer::new_for_http());
```

## Performance Optimization

### 1. Database Optimization
```sql
-- Create indexes for performance
CREATE INDEX CONCURRENTLY idx_shipments_tracking_number ON shipments(tracking_number);
CREATE INDEX CONCURRENTLY idx_events_shipment_timestamp ON events(shipment_id, timestamp);
CREATE INDEX CONCURRENTLY idx_events_type_timestamp ON events(event_type, timestamp);

-- Update statistics
ANALYZE;
```

### 2. Caching Strategy
```rust
// Redis caching in backend
use redis::Commands;

async fn get_shipment_with_cache(
    pool: &PgPool,
    redis: &redis::Client,
    id: Uuid,
) -> Result<Shipment, AppError> {
    let cache_key = format!("shipment:{}", id);
    
    // Try cache first
    let mut conn = redis.get_connection()?;
    let cached: Option<String> = conn.get(&cache_key)?;
    
    if let Some(data) = cached {
        return Ok(serde_json::from_str(&data)?);
    }
    
    // Fetch from database
    let shipment = fetch_shipment_from_db(pool, id).await?;
    
    // Cache for 1 hour
    let _: () = conn.set_ex(&cache_key, serde_json::to_string(&shipment)?, 3600)?;
    
    Ok(shipment)
}
```

### 3. Load Balancing
```nginx
upstream backend {
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
    server 127.0.0.1:3003;
}

server {
    location /api {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Testing the Deployment

### 1. Health Checks
```bash
# Check application health
curl https://api.your-domain.com/health

# Expected response
{
  "status": "healthy",
  "version": "0.1.0",
  "services": {
    "database": "healthy",
    "redis": "healthy",
    "blockchain": "healthy"
  }
}
```

### 2. Integration Tests
```bash
# Run API tests
cd backend
cargo test --release

# Run frontend tests
cd frontend
npm run test
```

### 3. Load Testing
```bash
# Install artillery
npm install -g artillery

# Run load test
artillery run load-test.yml
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connection
psql -h localhost -U supply_chain_user -d supply_chain
```

2. **Redis Connection Failed**
```bash
# Check Redis status
sudo systemctl status redis

# Test connection
redis-cli ping
```

3. **Contract Deployment Failed**
```bash
# Check Soroban CLI version
soroban --version

# Check network configuration
soroban config show
```

### Log Analysis
```bash
# View application logs
docker-compose logs -f backend

# View database logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log

# View system logs
sudo journalctl -f
```

## Maintenance

### Regular Tasks

1. **Weekly:**
   - Review system logs
   - Check disk space
   - Update security patches

2. **Monthly:**
   - Database maintenance
   - Performance tuning
   - Backup verification

3. **Quarterly:**
   - Security audit
   - Capacity planning
   - Disaster recovery testing

### Updates and Upgrades

```bash
# Update dependencies
cd frontend && npm update
cd backend && cargo update
cd contracts && cargo update

# Redeploy
docker-compose pull
docker-compose up -d
```

## Support

- **Documentation**: https://docs.supply-chain-protocol.com
- **Issues**: https://github.com/your-org/supply-chain-protocol/issues
- **Support**: support@supply-chain-protocol.com
- **Emergency**: emergency@supply-chain-protocol.com
