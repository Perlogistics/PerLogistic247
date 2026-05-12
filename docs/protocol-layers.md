# Supply Chain Protocol Layers

## Overview

The Supply Chain Protocol implements a 5-layer architecture that provides decentralized visibility and coordination for global supply chains.

## Layer 1: Visibility Layer

**Purpose**: Shared, append-only event log with cryptographic anchoring

**Components**:
- **Visibility Contract** (`contracts/src/visibility.rs`)
- Event recording and verification
- Cryptographic hashing for data integrity
- GS1-compatible event types

**Key Features**:
- Immutable event log on Soroban
- Event types: Bill of Lading, Port Clearance, Customs Release, In Transit, Delivery Confirmed
- Cryptographic proof of data integrity
- Timestamp anchoring

**API Endpoints**:
- `POST /api/v1/events` - Record new event
- `GET /api/v1/events/:id` - Get event details
- `GET /api/v1/shipments/:id/events` - Get all shipment events

## Layer 2: Interoperability Standard

**Purpose**: Canonical data schema with system adapters

**Components**:
- Canonical data models (`backend/src/models.rs`)
- Schema translation services
- ERP system adapters

**Key Features**:
- Standardized shipment and event data structures
- Multi-system compatibility (SAP, Oracle, custom systems)
- GS1 and EPCIS 2.0 compatibility
- Data type conversion and validation

**Data Models**:
```rust
pub struct Shipment {
    pub id: Uuid,
    pub tracking_number: String,
    pub origin: String,
    pub destination: String,
    pub carrier: String,
    pub status: ShipmentStatus,
    // ...
}

pub struct Event {
    pub id: Uuid,
    pub shipment_id: Uuid,
    pub event_type: EventType,
    pub timestamp: DateTime<Utc>,
    pub location: Option<String>,
    pub data: serde_json::Value,
    // ...
}
```

## Layer 3: ZK Attestations

**Purpose**: Privacy-preserving compliance proofs

**Components**:
- **Attestation Contract** (`contracts/src/attestation.rs`)
- Zero-knowledge proof verification
- Compliance attestation management

**Key Features**:
- Privacy-preserving compliance verification
- Support for ESG, Origin, Quality, Safety attestations
- ZK proof verification on-chain
- Selective disclosure capabilities

**Attestation Types**:
- ESG compliance verification
- Product origin verification
- Quality certification
- Safety compliance

**API Endpoints**:
- `POST /api/v1/attestations` - Submit ZK attestation
- `POST /api/v1/attestations/:id/verify` - Verify attestation
- `GET /api/v1/shipments/:id/attestations` - Get shipment attestations

## Layer 4: Programmable Settlement

**Purpose**: Automated payments on event verification

**Components**:
- **Settlement Contract** (`contracts/src/settlement.rs`)
- Payment agreement management
- Condition-based payment execution

**Key Features**:
- Automated payment triggers
- Multi-condition payment agreements
- Integration with payment rails
- Support for multiple currencies

**Payment Conditions**:
- Delivery confirmed
- Customs cleared
- Quality approved
- Documents complete

**API Endpoints**:
- `POST /api/v1/payment-agreements` - Create payment agreement
- `POST /api/v1/payments/execute/:id` - Execute payment
- `GET /api/v1/payments/:id` - Get payment details

## Layer 5: Resilience Graph

**Purpose**: Network risk analysis and concentration mapping

**Components**:
- Network analysis services
- Risk assessment algorithms
- Concentration risk detection

**Key Features**:
- Anonymized network mapping
- Concentration risk analysis
- Geographic risk overlay
- Supplier network visualization

**Risk Metrics**:
- Port concentration analysis
- Supplier dependency mapping
- Geographic risk assessment
- Financial health indicators

## Integration Points

### External Systems
- **ERP Systems**: SAP, Oracle, NetSuite adapters
- **Customs Systems**: Automated compliance reporting
- **Payment Rails**: Stellar, traditional banking integration
- **IoT Devices**: Real-time tracking data ingestion

### Standards Compliance
- **GS1 Standards**: Barcode and EDI compatibility
- **EPCIS 2.0**: Event standard for traceability
- **ISO 28000**: Supply chain security management
- **Regulatory Compliance**: EU CSRD, US UFLPA

## Security Considerations

### Data Privacy
- Zero-knowledge proofs for sensitive data
- Selective disclosure mechanisms
- Encrypted data storage
- Access control and permissions

### Data Integrity
- Cryptographic hashing for all events
- Immutable on-chain records
- Multi-party verification
- Audit trail maintenance

### Network Security
- TLS encryption for all communications
- API rate limiting and authentication
- DDoS protection
- Regular security audits

## Development Roadmap

### Phase 1: Core Infrastructure
- [ ] Basic visibility layer implementation
- [ ] Core data models and APIs
- [ ] Database schema and migrations
- [ ] Basic frontend interface

### Phase 2: Interoperability
- [ ] ERP system adapters
- [ ] Schema translation services
- [ ] GS1/EPCIS compliance
- [ ] Data validation and mapping

### Phase 3: Privacy & Compliance
- [ ] ZK attestation framework
- [ ] Compliance verification
- [ ] Privacy-preserving features
- [ ] Regulatory reporting

### Phase 4: Settlement & Finance
- [ ] Payment agreement system
- [ ] Condition-based payments
- [ ] Multi-currency support
- [ ] Banking integrations

### Phase 5: Analytics & Insights
- [ ] Network analysis tools
- [ ] Risk assessment algorithms
- [ ] Resilience metrics
- [ ] Visualization dashboard

## Technical Architecture

### Backend Stack
- **Language**: Rust
- **Framework**: Axum
- **Database**: PostgreSQL with SQLx
- **Cache**: Redis
- **Blockchain**: Stellar/Soroban

### Frontend Stack
- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Blockchain**: Soroban React

### Smart Contracts
- **Platform**: Soroban on Stellar
- **Language**: Rust
- **Features**: Visibility, Attestation, Settlement contracts
- **Testing**: Built-in Soroban test framework

### Infrastructure
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Database**: PostgreSQL 15
- **Blockchain**: Stellar Quickstart
- **Monitoring**: Tracing and logging
