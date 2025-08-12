import { supabase } from './supabase';

export interface VehicleLookupResult {
  vehicle: any;
  violations: any[];
  outstandingViolations: number;
}

export interface ViolationSubmission {
  plateNumber: string;
  violationType: string;
  violationDetails: string;
  location?: string;
  officerId?: string;
}

export const api = {
  // Vehicle lookup
  async lookupVehicle(plateNumber: string): Promise<VehicleLookupResult> {
    const { data, error } = await supabase.functions.invoke('vehicle-lookup', {
      body: { plateNumber }
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  // Submit violation
  async submitViolation(violation: ViolationSubmission) {
    const { data, error } = await supabase.functions.invoke('submit-violation', {
      body: violation
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  // Get violations
  async getViolations() {
    const { data, error } = await supabase
      .from('violations')
      .select(`
        *,
        vehicles (
          make,
          model,
          year,
          owner_name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  // Get vehicles
  async getVehicles() {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  // Record scan
  async recordScan(plateNumber: string, scanType: string = 'Manual', scanResult: any = {}, location?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('scans')
      .insert({
        officer_id: user?.id,
        plate_number: plateNumber,
        scan_type: scanType,
        scan_result: scanResult,
        location: location
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }
};