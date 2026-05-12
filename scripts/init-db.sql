-- Supply Chain Protocol Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Shipment statuses
CREATE TYPE shipment_status AS ENUM (
    'pending',
    'in_transit',
    'cleared',
    'delivered',
    'exception'
);

-- Event types
CREATE TYPE event_type AS ENUM (
    'bill_of_lading_issued',
    'port_cleared',
    'customs_released',
    'in_transit',
    'delivery_confirmed',
    'exception'
);

-- Shipments table
CREATE TABLE shipments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tracking_number VARCHAR(255) UNIQUE NOT NULL,
    origin VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    carrier VARCHAR(255) NOT NULL,
    status shipment_status DEFAULT 'pending',
    estimated_arrival TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events table
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    event_type event_type NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    location VARCHAR(255),
    data JSONB,
    transaction_hash VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ZK Attestations table
CREATE TABLE zk_attestations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    attestation_type VARCHAR(255) NOT NULL,
    proof TEXT NOT NULL,
    public_inputs JSONB,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment Agreements table
CREATE TABLE payment_agreements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payer_address VARCHAR(255) NOT NULL,
    payee_address VARCHAR(255) NOT NULL,
    amount DECIMAL(20,8) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    conditions JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    executed_at TIMESTAMP
);

-- Payment Executions table
CREATE TABLE payment_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agreement_id UUID NOT NULL REFERENCES payment_agreements(id) ON DELETE CASCADE,
    transaction_hash VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    amount DECIMAL(20,8) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_shipments_tracking_number ON shipments(tracking_number);
CREATE INDEX idx_shipments_status ON shipments(status);
CREATE INDEX idx_events_shipment_id ON events(shipment_id);
CREATE INDEX idx_events_timestamp ON events(timestamp);
CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_attestations_shipment_id ON zk_attestations(shipment_id);
CREATE INDEX idx_attestations_type ON zk_attestations(attestation_type);
CREATE INDEX idx_agreements_shipment_id ON payment_agreements(shipment_id);
CREATE INDEX idx_agreements_status ON payment_agreements(status);
CREATE INDEX idx_executions_agreement_id ON payment_executions(agreement_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_shipments_updated_at 
    BEFORE UPDATE ON shipments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data for testing
INSERT INTO shipments (tracking_number, origin, destination, carrier, estimated_arrival) VALUES
('SC123456789', 'Shanghai, China', 'Los Angeles, USA', 'Maersk', CURRENT_TIMESTAMP + INTERVAL '15 days'),
('SC987654321', 'Hamburg, Germany', 'New York, USA', 'Hapag-Lloyd', CURRENT_TIMESTAMP + INTERVAL '12 days'),
('SC555666777', 'Singapore', 'Rotterdam, Netherlands', 'MSC', CURRENT_TIMESTAMP + INTERVAL '20 days');
