// Unified API configuration for all frontend apps
// Connects to the Python FastAPI backend

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user_role: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: string;
  badge_number?: string;
  rank?: string;
  department?: string;
  phone?: string;
}

export interface Vehicle {
  id: number;
  plate_number?: string;
  reg_number?: string;
  vin: string;
  make?: string;
  manufacturer?: string;
  model: string;
  year?: number;
  year_of_manufacture?: number;
  color: string;
  owner_name: string;
  owner_address?: string;
  registration_status?: string;
  registration_expiry?: string;
  insurance_status?: string;
  insurance_expiry?: string;
  status?: string;
}

export interface Violation {
  id: string;
  plate_number: string;
  vehicle_id?: string;
  officer_id?: string;
  violation_type: string;
  violation_details?: string;
  location?: string;
  status?: string;
  evidence_urls?: string[];
  fine_amount?: number;
  created_at?: string;
  updated_at?: string;
}

class UnifiedAPIClient {
  private token: string | null = null;
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
    this.token = localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Network error' }));
        return { error: errorData.detail || 'Request failed' };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      // If FastAPI backend is not available, fall back to mock responses for development
      if (error instanceof Error && error.message.includes('fetch')) {
        console.warn('FastAPI backend not available, using mock response for:', endpoint);
        return this.getMockResponse<T>(endpoint, options);
      }
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private getMockResponse<T>(endpoint: string, options: RequestInit = {}): ApiResponse<T> {
    // Mock responses for development when backend is not available
    if (endpoint.includes('/auth/login') || endpoint.includes('/dvla/auth/login')) {
      return {
        data: {
          access_token: 'mock-token-' + Date.now(),
          token_type: 'bearer',
          user_role: 'supervisor'
        } as T
      };
    }

    if (endpoint.includes('/violations') && options.method === 'GET') {
      // Return sample violations for supervisor review
      const mockViolations = [
        {
          id: 'mock-violation-1',
          plate_number: 'ABC123',
          vehicle_id: '1',
          officer_id: '1',
          violation_type: 'Speeding',
          violation_details: 'Exceeding speed limit by 15 mph',
          location: 'Main Street, London',
          status: 'pending',
          evidence_urls: ['https://example.com/evidence1.jpg'],
          fine_amount: 100,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'mock-violation-2', 
          plate_number: 'XYZ789',
          vehicle_id: '2',
          officer_id: '1',
          violation_type: 'Parking',
          violation_details: 'Parking in no parking zone',
          location: 'High Street, Manchester',
          status: 'pending',
          evidence_urls: ['https://example.com/evidence2.jpg'],
          fine_amount: 50,
          created_at: new Date(Date.now() - 86400000).toISOString(),
          updated_at: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: 'mock-violation-3',
          plate_number: 'DEF456',
          vehicle_id: '3',
          officer_id: '2',
          violation_type: 'Red Light',
          violation_details: 'Running red light at intersection',
          location: 'Oxford Street, Birmingham',
          status: 'approved',
          evidence_urls: ['https://example.com/evidence3.jpg'],
          fine_amount: 75,
          created_at: new Date(Date.now() - 172800000).toISOString(),
          updated_at: new Date(Date.now() - 86400000).toISOString()
        }
      ];
      
      return {
        data: mockViolations as T
      };
    }

    if (endpoint.includes('/violations') && (options.method === 'PUT')) {
      return {
        data: {
          success: true,
          message: 'Violation status updated successfully'
        } as T
      };
    }

    if (endpoint.includes('/vehicles/')) {
      return {
        data: {
          id: '1',
          plate_number: 'ABC123',
          vin: 'TEST123456789',
          make: 'Toyota',
          model: 'Corolla',
          year: 2023,
          color: 'Blue',
          owner_name: 'John Smith',
          owner_address: '123 Test Street',
          registration_status: 'Valid',
          registration_expiry: '2025-12-31',
          insurance_status: 'Valid',
          insurance_expiry: '2025-06-30',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as T
      };
    }

    // Default mock response
    return {
      data: { success: true } as T
    };
  }

  // Authentication
  async login(username: string, password: string, loginType: 'police' | 'dvla' | 'supervisor' = 'supervisor'): Promise<ApiResponse<AuthResponse>> {
    const endpoint = '/auth/login';
    const response = await this.request<AuthResponse>(endpoint, {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    if (response.data) {
      this.token = response.data.access_token;
      localStorage.setItem('auth_token', this.token);
      localStorage.setItem('user_role', response.data.user_role);
    }

    return response;
  }

  logout() {
    this.token = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
  }

  // Violation Management (Supervisor Functions)
  async getViolations(plateNumber?: string, status?: string): Promise<ApiResponse<Violation[]>> {
    const params = new URLSearchParams();
    if (plateNumber) params.append('plate_number', plateNumber);
    if (status) params.append('status', status);
    
    return this.request<Violation[]>(`/violations?${params.toString()}`);
  }

  async approveViolation(violationId: string): Promise<ApiResponse<any>> {
    return this.request(`/violations/${violationId}/approve`, {
      method: 'PUT',
    });
  }

  async rejectViolation(violationId: string, reason: string): Promise<ApiResponse<any>> {
    return this.request(`/violations/${violationId}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  }

  async getVehicleByPlate(plateNumber: string): Promise<ApiResponse<Vehicle>> {
    return this.request<Vehicle>(`/vehicles/${plateNumber}`);
  }

  // Analytics and Reports
  async getViolationStats(): Promise<ApiResponse<any>> {
    return this.request('/analytics/violations');
  }

  async getOfficerStats(): Promise<ApiResponse<any>> {
    return this.request('/analytics/officers');
  }
}

export const unifiedAPI = new UnifiedAPIClient();
export default unifiedAPI;
