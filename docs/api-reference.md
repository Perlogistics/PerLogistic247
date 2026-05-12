# API Reference

## Base URL
```
Development: http://localhost:3001
Production: https://api.supply-chain-protocol.com
```

## Authentication

All API requests require authentication using Bearer tokens:
```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow this structure:
```json
{
  "data": {...},
  "status": "success|error",
  "message": "Optional message",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Error Responses

Error responses include:
```json
{
  "error": "Error description",
  "status": 400,
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Shipments API

### Create Shipment
```http
POST /api/v1/shipments
Content-Type: application/json

{
  "tracking_number": "SC123456789",
  "origin": "Shanghai, China",
  "destination": "Los Angeles, USA",
  "carrier": "Maersk",
  "estimated_arrival": "2024-01-15T00:00:00Z"
}
```

**Response:**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "tracking_number": "SC123456789",
    "origin": "Shanghai, China",
    "destination": "Los Angeles, USA",
    "carrier": "Maersk",
    "status": "pending",
    "estimated_arrival": "2024-01-15T00:00:00Z",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  },
  "status": "success"
}
```

### Get Shipment
```http
GET /api/v1/shipments/{shipment_id}
```

**Response:**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "tracking_number": "SC123456789",
    "origin": "Shanghai, China",
    "destination": "Los Angeles, USA",
    "carrier": "Maersk",
    "status": "in_transit",
    "estimated_arrival": "2024-01-15T00:00:00Z",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-02T00:00:00Z"
  },
  "status": "success"
}
```

### List Shipments
```http
GET /api/v1/shipments?page=1&limit=20&status=in_transit
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `status` (optional): Filter by shipment status
- `carrier` (optional): Filter by carrier
- `origin` (optional): Filter by origin
- `destination` (optional): Filter by destination

## Events API

### Create Event
```http
POST /api/v1/events
Content-Type: application/json

{
  "shipment_id": "550e8400-e29b-41d4-a716-446655440000",
  "event_type": "port_cleared",
  "location": "Port of Shanghai",
  "data": {
    "port_code": "CNSHA",
    "vessel_name": "Maersk Emma",
    "voyage_number": "123E"
  }
}
```

**Response:**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "shipment_id": "550e8400-e29b-41d4-a716-446655440000",
    "event_type": "port_cleared",
    "timestamp": "2024-01-02T00:00:00Z",
    "location": "Port of Shanghai",
    "data": {
      "port_code": "CNSHA",
      "vessel_name": "Maersk Emma",
      "voyage_number": "123E"
    },
    "transaction_hash": "abc123...",
    "created_at": "2024-01-02T00:00:00Z"
  },
  "status": "success"
}
```

### Get Event
```http
GET /api/v1/events/{event_id}
```

### List Shipment Events
```http
GET /api/v1/shipments/{shipment_id}/events
```

**Event Types:**
- `bill_of_lading_issued`
- `port_cleared`
- `customs_released`
- `in_transit`
- `delivery_confirmed`
- `exception`

## ZK Attestations API

### Submit Attestation
```http
POST /api/v1/attestations
Content-Type: application/json

{
  "shipment_id": "550e8400-e29b-41d4-a716-446655440000",
  "attestation_type": "ESG",
  "proof": "base64_encoded_zk_proof",
  "public_inputs": "base64_encoded_public_inputs",
  "verifier": "GABC123..."
}
```

**Response:**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "shipment_id": "550e8400-e29b-41d4-a716-446655440000",
    "attestation_type": "ESG",
    "proof": "base64_encoded_zk_proof",
    "public_inputs": "base64_encoded_public_inputs",
    "verifier": "GABC123...",
    "verified": false,
    "created_at": "2024-01-02T00:00:00Z"
  },
  "status": "success"
}
```

### Verify Attestation
```http
POST /api/v1/attestations/{attestation_id}/verify
```

**Response:**
```json
{
  "data": {
    "verified": true,
    "verification_timestamp": "2024-01-02T00:05:00Z"
  },
  "status": "success"
}
```

### Get Attestation
```http
GET /api/v1/attestations/{attestation_id}
```

### List Shipment Attestations
```http
GET /api/v1/shipments/{shipment_id}/attestations
```

**Attestation Types:**
- `ESG`: Environmental, Social, Governance compliance
- `ORIGIN`: Product origin verification
- `QLT`: Quality certification
- `SAF`: Safety compliance

## Payment Agreements API

### Create Payment Agreement
```http
POST /api/v1/payment-agreements
Content-Type: application/json

{
  "payer_address": "GDEF123...",
  "payee_address": "GHI456...",
  "amount": 10000.00,
  "currency": "USD",
  "shipment_id": "550e8400-e29b-41d4-a716-446655440000",
  "conditions": ["delivery_confirmed", "customs_released"]
}
```

**Response:**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440003",
    "payer_address": "GDEF123...",
    "payee_address": "GHI456...",
    "amount": 10000.00,
    "currency": "USD",
    "shipment_id": "550e8400-e29b-41d4-a716-446655440000",
    "conditions": ["delivery_confirmed", "customs_released"],
    "status": "pending",
    "created_at": "2024-01-02T00:00:00Z"
  },
  "status": "success"
}
```

### Execute Payment
```http
POST /api/v1/payments/execute/{agreement_id}
```

**Response:**
```json
{
  "data": {
    "agreement_id": "550e8400-e29b-41d4-a716-446655440003",
    "transaction_hash": "xyz789...",
    "amount": 10000.00,
    "currency": "USD",
    "status": "completed",
    "executed_at": "2024-01-10T00:00:00Z"
  },
  "status": "success"
}
```

### Get Payment Agreement
```http
GET /api/v1/payment-agreements/{agreement_id}
```

### List Payment Agreements
```http
GET /api/v1/payment-agreements?status=pending&currency=USD
```

**Payment Conditions:**
- `delivery_confirmed`: Delivery must be confirmed
- `customs_released`: Customs must release the shipment
- `quality_approved`: Quality attestation must be verified
- `documents_complete`: All required documents must be present

## Network Analysis API

### Get Network Overview
```http
GET /api/v1/network/overview
```

**Response:**
```json
{
  "data": {
    "total_shipments": 1000,
    "active_shipments": 250,
    "total_events": 5000,
    "network_health": 0.95,
    "risk_indicators": {
      "port_concentration": 0.15,
      "supplier_dependency": 0.08,
      "geographic_risk": 0.12
    }
  },
  "status": "success"
}
```

### Get Resilience Metrics
```http
GET /api/v1/network/resilience?timeframe=30d
```

**Query Parameters:**
- `timeframe`: Time period (7d, 30d, 90d, 1y)

**Response:**
```json
{
  "data": {
    "concentration_risks": [
      {
        "type": "port",
        "entity": "Port of Shanghai",
        "risk_score": 0.25,
        "affected_shipments": 45
      }
    ],
    "dependency_analysis": {
      "single_points_of_failure": 3,
      "critical_suppliers": 12,
      "diversification_score": 0.78
    },
    "performance_metrics": {
      "on_time_delivery_rate": 0.92,
      "average_transit_time": 14.5,
      "exception_rate": 0.03
    }
  },
  "status": "success"
}
```

## Health Check

### System Health
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "version": "0.1.0",
  "timestamp": "2024-01-01T00:00:00Z",
  "services": {
    "database": "healthy",
    "redis": "healthy",
    "blockchain": "healthy"
  }
}
```

## Rate Limits

- **Standard endpoints**: 100 requests per minute
- **Upload endpoints**: 10 requests per minute
- **Analysis endpoints**: 20 requests per minute

Rate limit headers are included in all responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1640995200
```

## Webhooks

### Configure Webhook
```http
POST /api/v1/webhooks
Content-Type: application/json

{
  "url": "https://your-domain.com/webhook",
  "events": ["shipment.created", "event.recorded", "payment.executed"],
  "secret": "your-webhook-secret"
}
```

### Webhook Events

- `shipment.created`: New shipment created
- `shipment.updated`: Shipment status updated
- `event.recorded`: New event recorded
- `attestation.submitted`: New attestation submitted
- `attestation.verified`: Attestation verified
- `payment.executed`: Payment executed
- `network.alert`: Network risk alert

### Webhook Payload
```json
{
  "event": "event.recorded",
  "data": {
    "event_id": "550e8400-e29b-41d4-a716-446655440001",
    "shipment_id": "550e8400-e29b-41d4-a716-446655440000",
    "event_type": "port_cleared",
    "timestamp": "2024-01-02T00:00:00Z"
  },
  "timestamp": "2024-01-02T00:00:00Z"
}
```

## SDKs and Libraries

### JavaScript/TypeScript
```bash
npm install @supply-chain-protocol/sdk
```

### Rust
```toml
[dependencies]
supply-chain-sdk = "0.1.0"
```

### Python
```bash
pip install supply-chain-protocol
```

## Support

- **Documentation**: https://docs.supply-chain-protocol.com
- **API Status**: https://status.supply-chain-protocol.com
- **Support**: support@supply-chain-protocol.com
- **Community**: https://community.supply-chain-protocol.com
