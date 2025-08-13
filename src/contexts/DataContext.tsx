import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { unifiedAPI } from '../lib/unified-api';

export interface ViolationRecord {
  id: string;
  plateNumber: string;
  violationType: string;
  location: string;
  timestamp: string;
  officerId: string;
  officerName: string;
  status: 'pending' | 'approved' | 'rejected';
  evidence?: string;
  description?: string;
  fine?: number;
}

export interface VehicleRecord {
  id: string;
  plateNumber: string;
  make: string;
  model: string;
  year: number;
  owner: string;
  ownerContact: string;
  registrationDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'suspended';
}

export interface DVLAFine {
  id: string;
  plateNumber: string;
  vehicleId: string;
  amount: number;
  reason: string;
  issueDate: string;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  issuedBy: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: string;
  read: boolean;
  userId?: string;
  system: string;
}

interface DataContextType {
  // Data state
  users: any[];
  violations: ViolationRecord[];
  vehicles: VehicleRecord[];
  fines: DVLAFine[];
  notifications: Notification[];
  
  // Loading states
  isLoading: boolean;
  error: string | null;
  
  // User management
  addUser: (user: Omit<any, 'id'>) => void;
  updateUser: (user: any) => void;
  deleteUser: (userId: string) => void;
  getUserById: (userId: string) => any | undefined;
  getUserByUsername: (username: string) => any | undefined;
  
  // Vehicle management
  addVehicle: (vehicle: Omit<VehicleRecord, 'id'>) => void;
  updateVehicle: (vehicle: VehicleRecord) => void;
  getVehicleByPlate: (plateNumber: string) => VehicleRecord | undefined;
  lookupVehicle: (plateNumber: string) => Promise<any>;
  
  // Violation management
  addViolation: (violation: Omit<ViolationRecord, 'id'>) => void;
  updateViolation: (violation: ViolationRecord) => void;
  getViolationsByOfficer: (officerId: string) => ViolationRecord[];
  getViolationsByPlate: (plateNumber: string) => ViolationRecord[];
  submitViolation: (violation: any) => Promise<void>;
  
  // Fine management
  addFine: (fine: Omit<DVLAFine, 'id'>) => void;
  updateFine: (fine: DVLAFine) => void;
  getFinesByPlate: (plateNumber: string) => DVLAFine[];
  
  // Notification management
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  markNotificationAsRead: (notificationId: string) => void;
  getUnreadNotifications: () => Notification[];
  
  // Authentication
  authenticateUser: (username: string, password: string) => any | null;
  
  // Data management
  refreshData: () => void;
  exportAllData: () => void;
  clearAllData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [violations, setViolations] = useState<ViolationRecord[]>([]);
  const [vehicles, setVehicles] = useState<VehicleRecord[]>([]);
  const [fines, setFines] = useState<DVLAFine[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    loadAllData();
  }, []);

  // Auto-sync with backend on page visibility/focus/online and cross-tab changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadAllData();
      }
    };
    const handleWindowFocus = () => {
      loadAllData();
    };
    const handleOnline = () => {
      loadAllData();
    };
    const handleStorage = (e: StorageEvent) => {
      // If any known keys change in another tab, refresh
      const keysToWatch = new Set([
        'prs_users',
        'vpr_users',
        'vpr_violations',
        'vpr_vehicles',
        'vpr_fines',
        'vpr_notifications'
      ]);
      if (!e.key || keysToWatch.has(e.key)) {
        loadAllData();
      }
    };

    window.addEventListener('focus', handleWindowFocus, true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('storage', handleStorage);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleWindowFocus, true);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('storage', handleStorage);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Load vehicles from shared database
      const vehiclesResponse = await unifiedAPI.getVehicles();
      if (vehiclesResponse.data) {
        const convertedVehicles: VehicleRecord[] = vehiclesResponse.data.map((v: any) => ({
          id: v.id?.toString() || '',
          plateNumber: v.plate_number || v.reg_number || '',
          make: v.make || v.manufacturer || '',
          model: v.model || '',
          year: v.year || v.year_of_manufacture || 0,
          owner: v.owner_name || '',
          ownerContact: v.owner_phone || '',
          registrationDate: v.registration_date || v.date_of_entry || '',
          expiryDate: v.registration_expiry || '',
          status: v.status === 'active' ? 'active' : 'expired'
        }));
        setVehicles(convertedVehicles);
      } else {
        console.warn('Failed to load vehicles from database:', vehiclesResponse.error);
      }

      // Load violations from shared database
      const violationsResponse = await unifiedAPI.getViolations();
      if (violationsResponse.data) {
        const convertedViolations: ViolationRecord[] = violationsResponse.data.map((v: any) => ({
          id: v.id || '',
          plateNumber: v.plate_number || '',
          violationType: v.violation_type || '',
          location: v.location || '',
          timestamp: v.created_at || '',
          officerId: v.officer_id || '',
          officerName: v.officer_name || '',
          status: v.status === 'approved' ? 'approved' : v.status === 'rejected' ? 'rejected' : 'pending',
          evidence: v.evidence_urls?.[0] || '',
          description: v.violation_details || '',
          fine: v.fine_amount || 0
        }));
        setViolations(convertedViolations);
      } else {
        console.warn('Failed to load violations from database:', violationsResponse.error);
      }

      // Initialize empty arrays for other data types
      setUsers([]);
      setFines([]);
      setNotifications([]);
    } catch (error) {
      console.error('Error loading data from Supabase:', error);
      setError(error instanceof Error ? error.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  // User management functions
  const addUser = (userData: Omit<any, 'id'>) => {
    // For now, keep localStorage functionality for users
    // In a full implementation, this would use Supabase auth
    console.log('Add user:', userData);
  };

  const updateUser = (user: any) => {
    console.log('Update user:', user);
  };

  const deleteUser = (userId: string) => {
    console.log('Delete user:', userId);
  };

  const getUserById = (userId: string) => {
    return users.find(user => user.id === userId);
  };

  const getUserByUsername = (username: string) => {
    return users.find(user => user.username === username);
  };

  // Vehicle management functions
  const addVehicle = (vehicleData: Omit<VehicleRecord, 'id'>) => {
    console.log('Add vehicle:', vehicleData);
    // Would implement Supabase insert here
  };

  const updateVehicle = (vehicle: VehicleRecord) => {
    console.log('Update vehicle:', vehicle);
    // Would implement Supabase update here
  };

  const getVehicleByPlate = (plateNumber: string) => {
    return vehicles.find(vehicle => vehicle.plateNumber === plateNumber);
  };

  const lookupVehicle = async (plateNumber: string) => {
    try {
      const result = await unifiedAPI.lookupVehicle(plateNumber);
      if (result.data) {
        return result.data;
      } else {
        console.warn('Vehicle not found in database:', result.error);
        return null;
      }
    } catch (error) {
      console.error('Error looking up vehicle:', error);
      return null;
    }
  };
  // Violation management functions
  const addViolation = (violationData: Omit<ViolationRecord, 'id'>) => {
    console.log('Add violation:', violationData);
    // This will be handled by submitViolation
  };

  const updateViolation = (violation: ViolationRecord) => {
    console.log('Update violation:', violation);
    // Would implement Supabase update here
  };

  const submitViolation = async (violationData: any) => {
    try {
      const result = await unifiedAPI.submitViolation(violationData);
      if (result.data) {
        console.log('Violation submitted successfully:', result.data);
        // Refresh violations after submission
        await loadAllData();
      } else {
        console.error('Failed to submit violation:', result.error);
        throw new Error(result.error || 'Failed to submit violation');
      }
    } catch (error) {
      console.error('Error submitting violation:', error);
      throw error;
    }
  };
  const getViolationsByOfficer = (officerId: string) => {
    return violations.filter(violation => violation.officerId === officerId);
  };

  const getViolationsByPlate = (plateNumber: string) => {
    return violations.filter(violation => violation.plateNumber === plateNumber);
  };

  // Fine management functions
  const addFine = (fineData: Omit<DVLAFine, 'id'>) => {
    console.log('Add fine:', fineData);
    // Would implement Supabase insert here
  };

  const updateFine = (fine: DVLAFine) => {
    console.log('Update fine:', fine);
    // Would implement Supabase update here
  };

  const getFinesByPlate = (plateNumber: string) => {
    return fines.filter(fine => fine.plateNumber === plateNumber);
  };

  // Notification management functions
  const addNotification = (notificationData: Omit<Notification, 'id'>) => {
    console.log('Add notification:', notificationData);
    // For now, add to local state
    const newNotification: Notification = {
      ...notificationData,
      id: Date.now().toString(),
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markNotificationAsRead = (notificationId: string) => {
    const updatedNotifications = notifications.map(notification =>
      notification.id === notificationId
        ? { ...notification, read: true }
        : notification
    );
    setNotifications(updatedNotifications);
  };

  const getUnreadNotifications = () => {
    return notifications.filter(notification => !notification.read);
  };

  // Authentication
  const authenticateUser = (username: string, password: string) => {
    // This would use Supabase auth in a full implementation
    console.log('Authenticate user:', username);
    return null;
  };

  // Data management
  const refreshData = () => {
    loadAllData();
  };

  const exportAllData = () => {
    const data = {
      users,
      violations,
      vehicles,
      fines,
      notifications,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vpr_system_data_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearAllData = () => {
    console.log('Clear all data');
    loadAllData();
  };

  const contextValue: DataContextType = {
    // Data state
    users,
    violations,
    vehicles,
    fines,
    notifications,
    isLoading,
    error,
    
    // User management
    addUser,
    updateUser,
    deleteUser,
    getUserById,
    getUserByUsername,
    
    // Vehicle management
    addVehicle,
    updateVehicle,
    getVehicleByPlate,
    lookupVehicle,
    
    // Violation management
    addViolation,
    updateViolation,
    getViolationsByOfficer,
    getViolationsByPlate,
    submitViolation,
    
    // Fine management
    addFine,
    updateFine,
    getFinesByPlate,
    
    // Notification management
    addNotification,
    markNotificationAsRead,
    getUnreadNotifications,
    
    // Authentication
    authenticateUser,
    
    // Data management
    refreshData,
    exportAllData,
    clearAllData
  };

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export default DataContext;
