import { supabase } from './supabase';

export interface User {
  id: string;
  email: string;
  full_name: string;
  badge_number?: string;
  rank?: string;
  department?: string;
  role: 'admin' | 'police' | 'dvla' | 'supervisor';
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
  id: string;
  plate_number: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  color?: string;
  owner_name: string;
  owner_address?: string;
  registration_status?: string;
  registration_expiry?: string;
  insurance_status?: string;
  insurance_expiry?: string;
  created_at: string;
  updated_at: string;
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
  created_at: string;
  updated_at: string;
}

export interface ViolationSubmission {
  plateNumber: string;
  violationType: string;
  violationDetails: string;
  location?: string;
  fineAmount?: number;
  evidenceUrls?: string[];
}

export interface VehicleLookupResult {
  vehicle: Vehicle | null;
  violations: Violation[];
  outstandingViolations: number;
}

export interface AuthResponse {
  user: User;
  session: any;
}

class ApiClient {
  private currentUser: User | null = null;
  private currentSession: any = null;

  // Authentication
  async signIn(email: string, password: string): Promise<{ data: AuthResponse | null; error: any }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { data: null, error };
      }

      if (data.user) {
        // Get user profile from officers table
        const { data: officer, error: officerError } = await supabase
          .from('officers')
          .select('*')
          .eq('email', data.user.email)
          .single();

        if (officerError) {
          return { data: null, error: officerError };
        }

        const user: User = {
          id: officer.id,
          email: officer.email,
          full_name: officer.full_name,
          badge_number: officer.badge_number,
          rank: officer.rank,
          department: officer.department,
          role: 'police',
          created_at: officer.created_at,
          updated_at: officer.updated_at,
        };

        this.currentUser = user;
        this.currentSession = data.session;

        return { data: { user, session: data.session }, error: null };
      }

      return { data: null, error: new Error('No user data returned') };
    } catch (error) {
      return { data: null, error };
    }
  }

  async signUp(email: string, password: string, metadata: any): Promise<{ data: any; error: any }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) {
        return { data: null, error };
      }

      // Create officer profile
      if (data.user) {
        const { error: profileError } = await supabase
          .from('officers')
          .insert({
            id: data.user.id,
            email: data.user.email,
            full_name: metadata.full_name,
            badge_number: metadata.badge_number,
            rank: metadata.rank,
            department: metadata.department,
          });

        if (profileError) {
          return { data: null, error: profileError };
        }
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async signOut(): Promise<{ error: any }> {
    try {
      const { error } = await supabase.auth.signOut();
      this.currentUser = null;
      this.currentSession = null;
      return { error };
    } catch (error) {
      return { error };
    }
  }

  // Vehicle operations
  async lookupVehicle(plateNumber: string): Promise<VehicleLookupResult> {
    try {
      // Get vehicle information
      const { data: vehicle, error: vehicleError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('plate_number', plateNumber)
        .single();

      if (vehicleError && vehicleError.code !== 'PGRST116') {
        throw vehicleError;
      }

      // Get violations for this plate
      const { data: violations, error: violationsError } = await supabase
        .from('violations')
        .select('*')
        .eq('plate_number', plateNumber)
        .order('created_at', { ascending: false });

      if (violationsError) {
        throw violationsError;
      }

      const outstandingViolations = violations?.filter(v => v.status === 'Pending').length || 0;

      return {
        vehicle: vehicle || null,
        violations: violations || [],
        outstandingViolations,
      };
    } catch (error) {
      console.error('Vehicle lookup error:', error);
      throw error;
    }
  }

  async getVehicles(): Promise<Vehicle[]> {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Get vehicles error:', error);
      throw error;
    }
  }

  // Violation operations
  async submitViolation(violation: ViolationSubmission): Promise<Violation> {
    try {
      const { data, error } = await supabase
        .from('violations')
        .insert({
          plate_number: violation.plateNumber,
          violation_type: violation.violationType,
          violation_details: violation.violationDetails,
          location: violation.location,
          fine_amount: violation.fineAmount,
          evidence_urls: violation.evidenceUrls,
          officer_id: this.currentUser?.id,
          status: 'Pending',
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Submit violation error:', error);
      throw error;
    }
  }

  async getViolations(): Promise<Violation[]> {
    try {
      const { data, error } = await supabase
        .from('violations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Get violations error:', error);
      throw error;
    }
  }

  async updateViolationStatus(violationId: string, status: string, rejectionReason?: string): Promise<void> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (rejectionReason) {
        updateData.violation_details = rejectionReason;
      }

      const { error } = await supabase
        .from('violations')
        .update(updateData)
        .eq('id', violationId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Update violation status error:', error);
      throw error;
    }
  }

  // Scan operations
  async recordScan(plateNumber: string, scanType: string = 'Manual', scanResult: any = {}, location?: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('scans')
        .insert({
          officer_id: this.currentUser?.id,
          plate_number: plateNumber,
          scan_type: scanType,
          scan_result: scanResult,
          location: location,
        });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Record scan error:', error);
      throw error;
    }
  }

  // File upload
  async uploadFile(file: File, bucket: string = 'evidence'): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${bucket}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  }

  // Utility methods
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getCurrentSession(): any {
    return this.currentSession;
  }

  isAuthenticated(): boolean {
    return !!this.currentUser && !!this.currentSession;
  }
}

export const api = new ApiClient();