import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  dataStorage, 
  User, 
  ViolationRecord, 
  VehicleRecord, 
  DVLAFine, 
  Notification 
} from '../utils/dataStorage';

interface DataContextType {
  // Data state
  users: User[];
  violations: ViolationRecord[];
  vehicles: VehicleRecord[];
  fines: DVLAFine[];
  notifications: Notification[];
  
  // Loading states
  isLoading: boolean;
  
  // User management
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (user: User) => void;
  deleteUser: (userId: string) => void;
  getUserById: (userId: string) => User | undefined;
  getUserByUsername: (username: string) => User | undefined;
  
  // Vehicle management
  addVehicle: (vehicle: Omit<VehicleRecord, 'id'>) => void;
  updateVehicle: (vehicle: VehicleRecord) => void;
  getVehicleByPlate: (plateNumber: string) => VehicleRecord | undefined;
  
  // Violation management
  addViolation: (violation: Omit<ViolationRecord, 'id'>) => void;
  updateViolation: (violation: ViolationRecord) => void;
  getViolationsByOfficer: (officerId: string) => ViolationRecord[];
  getViolationsByPlate: (plateNumber: string) => ViolationRecord[];
  
  // Fine management
  addFine: (fine: Omit<DVLAFine, 'id'>) => void;
  updateFine: (fine: DVLAFine) => void;
  getFinesByPlate: (plateNumber: string) => DVLAFine[];
  
  // Notification management
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  markNotificationAsRead: (notificationId: string) => void;
  getUnreadNotifications: () => Notification[];
  
  // Authentication
  authenticateUser: (username: string, password: string) => User | null;
  
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
  const [users, setUsers] = useState<User[]>([]);
  const [violations, setViolations] = useState<ViolationRecord[]>([]);
  const [vehicles, setVehicles] = useState<VehicleRecord[]>([]);
  const [fines, setFines] = useState<DVLAFine[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    loadAllData();
    
    // Listen for storage updates from other tabs/components
    const handleStorageUpdate = (event: CustomEvent) => {
      const { dataType, data } = event.detail;
      
      switch (dataType) {
        case 'users':
          setUsers([...data]);
          break;
        case 'violations':
          setViolations([...data]);
          break;
        case 'vehicles':
          setVehicles([...data]);
          break;
        case 'fines':
          setFines([...data]);
          break;
        case 'notifications':
          setNotifications([...data]);
          break;
      }
    };

    window.addEventListener('dataStorageUpdate', handleStorageUpdate as EventListener);
    
    return () => {
      window.removeEventListener('dataStorageUpdate', handleStorageUpdate as EventListener);
    };
  }, []);

  const loadAllData = () => {
    setIsLoading(true);
    try {
      setUsers(dataStorage.getUsers());
      setViolations(dataStorage.getViolations());
      setVehicles(dataStorage.getVehicles());
      setFines(dataStorage.getFines());
      setNotifications(dataStorage.getNotifications());
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // User management functions
  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: dataStorage.generateId('USR')
    };
    dataStorage.addUser(newUser);
    setUsers(dataStorage.getUsers());
  };

  const updateUser = (user: User) => {
    dataStorage.updateUser(user);
    setUsers(dataStorage.getUsers());
  };

  const deleteUser = (userId: string) => {
    dataStorage.deleteUser(userId);
    setUsers(dataStorage.getUsers());
  };

  const getUserById = (userId: string) => {
    return users.find(user => user.id === userId);
  };

  const getUserByUsername = (username: string) => {
    return users.find(user => user.username === username);
  };

  // Vehicle management functions
  const addVehicle = (vehicleData: Omit<VehicleRecord, 'id'>) => {
    const newVehicle: VehicleRecord = {
      ...vehicleData,
      id: dataStorage.generateId('VEH')
    };
    dataStorage.addVehicle(newVehicle);
    setVehicles(dataStorage.getVehicles());
  };

  const updateVehicle = (vehicle: VehicleRecord) => {
    dataStorage.updateVehicle(vehicle);
    setVehicles(dataStorage.getVehicles());
  };

  const getVehicleByPlate = (plateNumber: string) => {
    return vehicles.find(vehicle => vehicle.plateNumber === plateNumber);
  };

  // Violation management functions
  const addViolation = (violationData: Omit<ViolationRecord, 'id'>) => {
    const newViolation: ViolationRecord = {
      ...violationData,
      id: dataStorage.generateId('VIO')
    };
    dataStorage.addViolation(newViolation);
    setViolations(dataStorage.getViolations());
    
    // Create notification for new violation
    const notificationData: Omit<Notification, 'id'> = {
      title: 'New Violation Reported',
      message: `Violation reported for plate ${violationData.plateNumber}`,
      type: 'info',
      timestamp: new Date().toISOString(),
      read: false,
      system: 'Police App'
    };
    addNotification(notificationData);
  };

  const updateViolation = (violation: ViolationRecord) => {
    dataStorage.updateViolation(violation);
    setViolations(dataStorage.getViolations());
  };

  const getViolationsByOfficer = (officerId: string) => {
    return violations.filter(violation => violation.officerId === officerId);
  };

  const getViolationsByPlate = (plateNumber: string) => {
    return violations.filter(violation => violation.plateNumber === plateNumber);
  };

  // Fine management functions
  const addFine = (fineData: Omit<DVLAFine, 'id'>) => {
    const newFine: DVLAFine = {
      ...fineData,
      id: dataStorage.generateId('FINE')
    };
    dataStorage.addFine(newFine);
    setFines(dataStorage.getFines());
    
    // Create notification for new fine
    const notificationData: Omit<Notification, 'id'> = {
      title: 'New Fine Issued',
      message: `Fine of GH₵${fineData.amount} issued for plate ${fineData.plateNumber}`,
      type: 'warning',
      timestamp: new Date().toISOString(),
      read: false,
      system: 'DVLA App'
    };
    addNotification(notificationData);
  };

  const updateFine = (fine: DVLAFine) => {
    dataStorage.updateFine(fine);
    setFines(dataStorage.getFines());
  };

  const getFinesByPlate = (plateNumber: string) => {
    return fines.filter(fine => fine.plateNumber === plateNumber);
  };

  // Notification management functions
  const addNotification = (notificationData: Omit<Notification, 'id'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: dataStorage.generateId('NOT')
    };
    dataStorage.addNotification(newNotification);
    setNotifications(dataStorage.getNotifications());
  };

  const markNotificationAsRead = (notificationId: string) => {
    const updatedNotifications = notifications.map(notification =>
      notification.id === notificationId
        ? { ...notification, read: true }
        : notification
    );
    dataStorage.saveNotifications(updatedNotifications);
    setNotifications(updatedNotifications);
  };

  const getUnreadNotifications = () => {
    return notifications.filter(notification => !notification.read);
  };

  // Authentication
  const authenticateUser = (username: string, password: string) => {
    const user = dataStorage.authenticateUser(username, password);
    if (user) {
      setUsers(dataStorage.getUsers()); // Refresh to get updated lastLogin
    }
    return user;
  };

  // Data management
  const refreshData = () => {
    loadAllData();
  };

  const exportAllData = () => {
    const data = dataStorage.exportData();
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
    dataStorage.clearAllData();
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
    
    // Violation management
    addViolation,
    updateViolation,
    getViolationsByOfficer,
    getViolationsByPlate,
    
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
