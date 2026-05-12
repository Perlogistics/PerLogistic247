// Core data types for the Supply Chain Protocol

export interface Shipment {
  id: string;
  tracking_number: string;
  origin: string;
  destination: string;
  carrier: string;
  status: ShipmentStatus;
  estimated_arrival?: string;
  created_at: string;
  updated_at: string;
}

export enum ShipmentStatus {
  Pending = 'pending',
  InTransit = 'in_transit',
  Cleared = 'cleared',
  Delivered = 'delivered',
  Exception = 'exception',
}

export interface Event {
  id: string;
  shipment_id: string;
  event_type: EventType;
  timestamp: string;
  location?: string;
  data: Record<string, any>;
  transaction_hash?: string;
  created_at: string;
}

export enum EventType {
  BillOfLadingIssued = 'bill_of_lading_issued',
  PortCleared = 'port_cleared',
  CustomsReleased = 'customs_released',
  InTransit = 'in_transit',
  DeliveryConfirmed = 'delivery_confirmed',
  Exception = 'exception',
}

export interface ZKAttestation {
  id: string;
  shipment_id: string;
  attestation_type: string;
  proof: string;
  public_inputs: Record<string, any>;
  verified: boolean;
  created_at: string;
}

export interface PaymentAgreement {
  id: string;
  payer_address: string;
  payee_address: string;
  amount: number;
  currency: string;
  shipment_id: string;
  conditions: PaymentCondition[];
  status: PaymentStatus;
  created_at: string;
  executed_at?: string;
}

export enum PaymentStatus {
  Pending = 'pending',
  Processing = 'processing',
  Completed = 'completed',
  Failed = 'failed',
}

export enum PaymentCondition {
  DeliveryConfirmed = 'delivery_confirmed',
  CustomsCleared = 'customs_cleared',
  QualityApproved = 'quality_approved',
  DocumentsComplete = 'documents_complete',
}

export interface PaymentExecution {
  agreement_id: string;
  transaction_hash: string;
  timestamp: string;
  amount: number;
  status: PaymentStatus;
}

export interface NetworkOverview {
  total_shipments: number;
  active_shipments: number;
  total_events: number;
  network_health: number;
  risk_indicators: {
    port_concentration: number;
    supplier_dependency: number;
    geographic_risk: number;
  };
}

export interface ResilienceMetrics {
  concentration_risks: Array<{
    type: string;
    entity: string;
    risk_score: number;
    affected_shipments: number;
  }>;
  dependency_analysis: {
    single_points_of_failure: number;
    critical_suppliers: number;
    diversification_score: number;
  };
  performance_metrics: {
    on_time_delivery_rate: number;
    average_transit_time: number;
    exception_rate: number;
  };
}

export interface ApiResponse<T = any> {
  data: T;
  status: 'success' | 'error';
  message?: string;
  timestamp: string;
}

export interface ApiError {
  error: string;
  status: number;
  timestamp: string;
}

export interface CreateShipmentRequest {
  tracking_number: string;
  origin: string;
  destination: string;
  carrier: string;
  estimated_arrival?: string;
}

export interface CreateEventRequest {
  shipment_id: string;
  event_type: EventType;
  location?: string;
  data: Record<string, any>;
}

export interface CreateAttestationRequest {
  shipment_id: string;
  attestation_type: string;
  proof: string;
  public_inputs: Record<string, any>;
  verifier: string;
}

export interface CreatePaymentAgreementRequest {
  payer_address: string;
  payee_address: string;
  amount: number;
  currency: string;
  shipment_id: string;
  conditions: PaymentCondition[];
}

export interface WebhookConfig {
  url: string;
  events: string[];
  secret: string;
}

export interface WebhookPayload {
  event: string;
  data: Record<string, any>;
  timestamp: string;
}

// Configuration types
export interface AppConfig {
  backendUrl: string;
  stellarNetwork: string;
  stellarRpcUrl: string;
  contracts: {
    visibility: string;
    attestation: string;
    settlement: string;
  };
}

// UI State types
export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface ErrorState {
  hasError: boolean;
  message?: string;
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
}

export interface FilterState {
  status?: ShipmentStatus;
  carrier?: string;
  origin?: string;
  destination?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

// Chart data types
export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }>;
}

export interface TimeSeriesData {
  timestamp: string;
  value: number;
  label?: string;
}

// Map types
export interface Location {
  lat: number;
  lng: number;
  name: string;
  address?: string;
}

export interface ShipmentRoute {
  origin: Location;
  destination: Location;
  current_location?: Location;
  waypoints?: Location[];
}
