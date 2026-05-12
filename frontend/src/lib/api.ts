import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  ApiResponse, 
  ApiError, 
  Shipment, 
  Event, 
  ZKAttestation, 
  PaymentAgreement,
  NetworkOverview,
  ResilienceMetrics,
  CreateShipmentRequest,
  CreateEventRequest,
  CreateAttestationRequest,
  CreatePaymentAgreementRequest,
  PaginationState,
  FilterState
} from '@/types';

class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => response,
      (error) => {
        const apiError: ApiError = {
          error: error.response?.data?.error || 'An unexpected error occurred',
          status: error.response?.status || 500,
          timestamp: new Date().toISOString(),
        };
        return Promise.reject(apiError);
      }
    );
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string; version: string }>> {
    const response = await this.client.get('/health');
    return response.data;
  }

  // Shipments API
  async createShipment(data: CreateShipmentRequest): Promise<ApiResponse<Shipment>> {
    const response = await this.client.post('/api/v1/shipments', data);
    return response.data;
  }

  async getShipment(id: string): Promise<ApiResponse<Shipment>> {
    const response = await this.client.get(`/api/v1/shipments/${id}`);
    return response.data;
  }

  async listShipments(
    pagination?: Partial<PaginationState>,
    filters?: Partial<FilterState>
  ): Promise<ApiResponse<{ shipments: Shipment[]; total: number }>> {
    const params = new URLSearchParams();
    
    if (pagination?.page) params.append('page', pagination.page.toString());
    if (pagination?.limit) params.append('limit', pagination.limit.toString());
    if (filters?.status) params.append('status', filters.status);
    if (filters?.carrier) params.append('carrier', filters.carrier);
    if (filters?.origin) params.append('origin', filters.origin);
    if (filters?.destination) params.append('destination', filters.destination);

    const response = await this.client.get(`/api/v1/shipments?${params}`);
    return response.data;
  }

  // Events API
  async createEvent(data: CreateEventRequest): Promise<ApiResponse<Event>> {
    const response = await this.client.post('/api/v1/events', data);
    return response.data;
  }

  async getEvent(id: string): Promise<ApiResponse<Event>> {
    const response = await this.client.get(`/api/v1/events/${id}`);
    return response.data;
  }

  async getShipmentEvents(
    shipmentId: string,
    pagination?: Partial<PaginationState>
  ): Promise<ApiResponse<{ events: Event[]; total: number }>> {
    const params = new URLSearchParams();
    if (pagination?.page) params.append('page', pagination.page.toString());
    if (pagination?.limit) params.append('limit', pagination.limit.toString());

    const response = await this.client.get(`/api/v1/shipments/${shipmentId}/events?${params}`);
    return response.data;
  }

  // ZK Attestations API
  async createAttestation(data: CreateAttestationRequest): Promise<ApiResponse<ZKAttestation>> {
    const response = await this.client.post('/api/v1/attestations', data);
    return response.data;
  }

  async verifyAttestation(id: string): Promise<ApiResponse<{ verified: boolean; verification_timestamp: string }>> {
    const response = await this.client.post(`/api/v1/attestations/${id}/verify`);
    return response.data;
  }

  async getAttestation(id: string): Promise<ApiResponse<ZKAttestation>> {
    const response = await this.client.get(`/api/v1/attestations/${id}`);
    return response.data;
  }

  async getShipmentAttestations(
    shipmentId: string,
    pagination?: Partial<PaginationState>
  ): Promise<ApiResponse<{ attestations: ZKAttestation[]; total: number }>> {
    const params = new URLSearchParams();
    if (pagination?.page) params.append('page', pagination.page.toString());
    if (pagination?.limit) params.append('limit', pagination.limit.toString());

    const response = await this.client.get(`/api/v1/shipments/${shipmentId}/attestations?${params}`);
    return response.data;
  }

  // Payment Agreements API
  async createPaymentAgreement(data: CreatePaymentAgreementRequest): Promise<ApiResponse<PaymentAgreement>> {
    const response = await this.client.post('/api/v1/payment-agreements', data);
    return response.data;
  }

  async executePayment(agreementId: string): Promise<ApiResponse<{ 
    agreement_id: string; 
    transaction_hash: string; 
    amount: number; 
    currency: string; 
    status: string; 
    executed_at: string;
  }>> {
    const response = await this.client.post(`/api/v1/payments/execute/${agreementId}`);
    return response.data;
  }

  async getPaymentAgreement(id: string): Promise<ApiResponse<PaymentAgreement>> {
    const response = await this.client.get(`/api/v1/payment-agreements/${id}`);
    return response.data;
  }

  async listPaymentAgreements(
    pagination?: Partial<PaginationState>,
    filters?: { status?: string; currency?: string }
  ): Promise<ApiResponse<{ agreements: PaymentAgreement[]; total: number }>> {
    const params = new URLSearchParams();
    
    if (pagination?.page) params.append('page', pagination.page.toString());
    if (pagination?.limit) params.append('limit', pagination.limit.toString());
    if (filters?.status) params.append('status', filters.status);
    if (filters?.currency) params.append('currency', filters.currency);

    const response = await this.client.get(`/api/v1/payment-agreements?${params}`);
    return response.data;
  }

  // Network Analysis API
  async getNetworkOverview(): Promise<ApiResponse<NetworkOverview>> {
    const response = await this.client.get('/api/v1/network/overview');
    return response.data;
  }

  async getResilienceMetrics(timeframe: string = '30d'): Promise<ApiResponse<ResilienceMetrics>> {
    const response = await this.client.get(`/api/v1/network/resilience?timeframe=${timeframe}`);
    return response.data;
  }

  // Webhooks API
  async createWebhook(data: { url: string; events: string[]; secret: string }): Promise<ApiResponse<{ id: string }>> {
    const response = await this.client.post('/api/v1/webhooks', data);
    return response.data;
  }

  async deleteWebhook(id: string): Promise<ApiResponse<void>> {
    const response = await this.client.delete(`/api/v1/webhooks/${id}`);
    return response.data;
  }

  async listWebhooks(): Promise<ApiResponse<{ webhooks: Array<{ id: string; url: string; events: string[] }> }>> {
    const response = await this.client.get('/api/v1/webhooks');
    return response.data;
  }
}

// Create singleton instance
const apiClient = new ApiClient(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001');

export default apiClient;

// Export types for convenience
export type {
  ApiResponse,
  ApiError,
  Shipment,
  Event,
  ZKAttestation,
  PaymentAgreement,
  NetworkOverview,
  ResilienceMetrics,
  CreateShipmentRequest,
  CreateEventRequest,
  CreateAttestationRequest,
  CreatePaymentAgreementRequest,
};
