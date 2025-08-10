import React, { useState, useEffect } from 'react';
import { useTheme } from './contexts/ThemeContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import StatusBar from './components/StatusBar';
import VehicleDataEntry from './components/VehicleDataEntry';
import OverviewDashboard from './components/OverviewDashboard';
import VehicleRecords from './components/VehicleRecords';
import RegistrationRenewal from './components/RegistrationRenewal';
import DataAnalysis from './components/DataAnalysis';
import ClearFines from './components/ClearFines';
import Settings from './components/Settings';
import { logAuth, logSystem } from '../utils/auditLog';
import { getAppNavigationState, saveAppNavigationState, updateActivity } from '../utils/sessionManager';
import SessionStatusIndicator from '../components/SessionStatusIndicator';

interface DvlaAppProps {
  onLogout?: () => void;
}

function App({ onLogout }: DvlaAppProps) {
  // Restore navigation state from session or use default
  const savedNavState = getAppNavigationState('dvla');
  const [activeMenuItem, setActiveMenuItem] = useState(savedNavState?.activeMenuItem || 'overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { darkMode } = useTheme();

  // Initialize audit logging for DVLA app
  useEffect(() => {
    logSystem('DVLA App Loaded', 'DVLA officer accessed DVLA dashboard', 'dvla');
  }, []);

  // Log navigation changes and save to session
  useEffect(() => {
    if (activeMenuItem !== 'overview') {
      logSystem('Navigation', `DVLA officer navigated to ${activeMenuItem}`, 'dvla');
    }

    // Save navigation state to session
    saveAppNavigationState('dvla', { activeMenuItem });
    updateActivity();
  }, [activeMenuItem]);

  const handleMenuItemClick = (item: string) => {
    setActiveMenuItem(item);
    setSidebarOpen(false); // Close sidebar on mobile after selection
  };

  const renderContent = () => {
    switch (activeMenuItem) {
      case 'entry':
        return <VehicleDataEntry />;
      case 'records':
        return <VehicleRecords />;
      case 'renewal':
        return <RegistrationRenewal />;
      case 'clearfines':
        return <ClearFines />;
      case 'analysis':
        return <DataAnalysis />;
      case 'settings':
        return <Settings />;
      case 'overview':
      default:
        return <OverviewDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-['Inter',sans-serif] relative">
      {/* Sidebar */}
      <Sidebar 
        activeItem={activeMenuItem} 
        onItemClick={handleMenuItemClick}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={() => {
          logAuth('User Logout', 'DVLA officer logged out of DVLA system', 'dvla', true);
          onLogout?.();
        }}
      />
      
      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-colors duration-200 lg:ml-64 ${
        darkMode ? 'bg-gray-900' : 'bg-white'
      }`}>
        {/* Header */}
        <Header onMenuClick={() => setSidebarOpen(true)} activeMenuItem={activeMenuItem} />
        
        {/* Dashboard Content */}
        <div className={`flex-1 overflow-auto transition-colors duration-200 ${
          darkMode ? 'bg-gray-900' : 'bg-gray-50'
        }`}>
          {renderContent()}
        </div>
        
        {/* Status Bar */}
        {activeMenuItem === 'overview' && <StatusBar />}
      </div>
      
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
