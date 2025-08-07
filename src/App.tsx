import React, { useState } from 'react';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import FilterBar from './components/FilterBar';
import PendingApprovalsTable from './components/PendingApprovalsTable';
import ViolationFilterBar from './components/ViolationFilterBar';
import ViolationTable from './components/ViolationTable';
import Dashboard from './components/Dashboard';
import UserAccountManagement from './components/UserAccountManagement';
import VehicleRegistry from './components/VehicleRegistry';
import AnalyticsReporting from './components/AnalyticsReporting';
import SecurityManagement from './components/SecurityManagement';
import AdministrativeControls from './components/AdministrativeControls';
import SystemSettings from './components/SystemSettings';
import AddNewRole from './components/AddNewRole';
import NotificationsPage from './components/NotificationsPage';
import UserProfilePage from './components/UserProfilePage';
import { ThemeProvider as DvlaThemeProvider } from './dvla/contexts/ThemeContext';
import DvlaApp from './dvla/App';
import PoliceApp from './police/App';
import SupervisorApp from './supervisor/SupervisorApp';
import './dvla/index.css';
import './police/index.css';
import type { PendingApproval } from './components/PendingApprovalsTable';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [activeItem, setActiveItem] = useState('violation-management');
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterQuery, setFilterQuery] = useState('');
  
  // Pending approvals state
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([
    {
      id: '1',
      userName: 'John Doe',
      email: 'john.doe@example.com',
      role: 'Police Officer',
      requestDate: '2024-07-20',
      accountType: 'police',
      additionalInfo: {
        badgeNumber: 'P12345',
        rank: 'Sergeant',
        station: 'Central Station',
        idNumber: '',
        position: ''
      }
    },
    {
      id: '2',
      userName: 'Jane Smith',
      email: 'jane.smith@example.com',
      role: 'DVLA Officer',
      requestDate: '2024-07-19',
      accountType: 'dvla',
      additionalInfo: {
        badgeNumber: '',
        rank: '',
        station: '',
        idNumber: 'DVLA001',
        position: 'Registration Officer'
      }
    }
  ]);
  
  // Violation management specific filters
  const [plateNumberFilter, setPlateNumberFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [violationStatusFilter, setViolationStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  const handleDarkModeToggle = (enabled: boolean) => {
    setDarkMode(enabled);
    console.log('Dark mode toggled to:', enabled);
  };

  const handleItemClick = (item: string) => {
    setActiveItem(item);
    console.log(`Navigation clicked: ${item}`);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    console.log(`Search query: ${query}`);
  };

  const handleFilterChange = (filter: string) => {
    setFilterQuery(filter);
  };

  const handlePlateNumberChange = (plateNumber: string) => {
    setPlateNumberFilter(plateNumber);
  };

  const handleTypeChange = (type: string) => {
    setTypeFilter(type);
  };

  const handleViolationStatusChange = (status: string) => {
    setViolationStatusFilter(status);
  };

  const handleDateChange = (date: string) => {
    setDateFilter(date);
  };

  const handleLogin = (app: 'main' | 'dvla' | 'police' | 'supervisor' | null) => {
    if (app) {
      setIsLoggedIn(true);
      if (app === 'main') {
        setActiveItem('overview');
      } else {
        setActiveItem(app);
      }
    } else {
      alert('Invalid credentials. Please try again.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveItem('violation-management');
  };

  const handleShowRegister = () => {
    setShowRegister(true);
  };

  const handleBackToLogin = () => {
    setShowRegister(false);
  };

  const handleRegisterSuccess = () => {
    setShowRegister(false);
    alert('Registration successful! You can now login.');
  };

  const handleNewRegistration = (approval: PendingApproval) => {
    setPendingApprovals(prev => [...prev, approval]);
  };

  const handlePageNavigation = (page: string) => {
    setCurrentPage(page);
    if (page === 'dashboard') {
      setActiveItem('overview');
    } else if (page === 'user-accounts' || page === 'user-profile') {
      setCurrentPage('user-profile');
    }
  };

  const getPageTitle = () => {
    switch (activeItem) {
      case 'overview':
        return 'Overview Dashboard';
      case 'pending-approvals':
        return 'Pending Approvals';
      case 'violation-management':
        return 'Violation Management';
      case 'user-accounts':
        return 'User Account Management';
      case 'vehicle-registry':
        return 'Vehicle Registry';
      case 'analytics':
        return 'Analytics & Reporting';
      case 'security':
        return 'Security Management';
      case 'system-settings':
        return 'System Settings';
      case 'admin-controls':
        return 'Administrative Controls';
      case 'add-new-role':
        return 'Add New Role';
      default:
        return 'Plate Recognition System';
    }
  };

  // Render the correct app after login
  if (activeItem === 'dvla') {
    return (
      <DvlaThemeProvider>
        <DvlaApp onLogout={handleLogout} />
      </DvlaThemeProvider>
    );
  }
  if (activeItem === 'police') {
    return (
      <PoliceApp onLogout={handleLogout} />
    );
  }
  if (activeItem === 'supervisor') {
    return (
      <SupervisorApp onLogout={handleLogout} />
    );
  }

  // Render notifications page if currentPage is 'notifications'
  if (currentPage === 'notifications') {
    return (
      <NotificationsPage 
        onNavigate={handlePageNavigation} 
        currentPage={currentPage} 
      />
    );
  }

  // Render user profile page if currentPage is 'user-profile'
  if (currentPage === 'user-profile') {
    return (
      <UserProfilePage 
        onNavigate={handlePageNavigation} 
        currentPage={currentPage} 
      />
    );
  }

  const renderMainContent = () => {
    switch (activeItem) {
      case 'overview':
        return <Dashboard darkMode={darkMode} />;
      case 'pending-approvals':
        return (
          <>
            <FilterBar 
              onFilterChange={handleFilterChange}
            />
            
            <PendingApprovalsTable 
              searchQuery={searchQuery}
              filterQuery={filterQuery}
              approvals={pendingApprovals}
              setApprovals={setPendingApprovals}
            />
          </>
        );
      case 'violation-management':
        return (
          <>
            <ViolationFilterBar
              onPlateNumberChange={handlePlateNumberChange}
              onTypeChange={handleTypeChange}
              onStatusChange={handleViolationStatusChange}
              onDateChange={handleDateChange}
            />
            
            <ViolationTable
              searchQuery={searchQuery}
              plateNumberFilter={plateNumberFilter}
              typeFilter={typeFilter}
              statusFilter={violationStatusFilter}
              dateFilter={dateFilter}
            />
          </>
        );
      case 'user-accounts':
        return <UserAccountManagement searchQuery={searchQuery} />;
      case 'vehicle-registry':
        return <VehicleRegistry searchQuery={searchQuery} />;
      case 'analytics':
        return <AnalyticsReporting />;
      case 'security':
        return <SecurityManagement />;
      case 'system-settings':
        return <SystemSettings onDarkModeToggle={handleDarkModeToggle} darkMode={darkMode} />;
      case 'admin-controls':
        return <AdministrativeControls onNavigate={setActiveItem} />;
      case 'add-new-role':
        return <AddNewRole onNavigate={setActiveItem} />;
      default:
        return (
          <div className="p-6 text-center text-gray-500">
            Select a menu item to view content
          </div>
        );
    }
  };

  if (!isLoggedIn) {
    if (showRegister) {
      return (
        <RegisterPage
          onBackToLogin={handleBackToLogin}
          onRegisterSuccess={handleRegisterSuccess}
          onNewRegistration={handleNewRegistration}
        />
      );
    }
    return (
      <LoginPage
        onLogin={handleLogin}
        onRegister={handleShowRegister}
      />
    );
  }

  return (
    <div className={`min-h-screen font-['Inter'] flex ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <Sidebar 
        activeItem={activeItem} 
        onItemClick={handleItemClick} 
        onLogout={handleLogout} 
        darkMode={darkMode}
      />
      
      <div className="flex-1 lg:ml-0">
        <TopBar title={getPageTitle()} onSearch={handleSearch} darkMode={darkMode} onNavigate={handlePageNavigation} />
        
        <main className={`min-h-[calc(100vh-4rem)] ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
          {renderMainContent()}
        </main>
      </div>
    </div>
  );
}

export default App;