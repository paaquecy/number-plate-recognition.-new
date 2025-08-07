import React from 'react';
import { 
  BarChart3, 
  Car, 
  Flag, 
  AlertTriangle, 
  FileText, 
  Settings, 
  User, 
  LogOut,
  X
} from 'lucide-react';

interface SidebarProps {
  activeNav: string;
  setActiveNav: (nav: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  onLogout?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeNav,
  setActiveNav,
  sidebarOpen,
  setSidebarOpen,
  onLogout
}) => {
  const navigationItems = [
    { id: 'overview', label: 'Overview Dashboard', icon: BarChart3, active: true },
    { id: 'scanner', label: 'Vehicle Plate Scanner', icon: Car, active: false },
    { id: 'flagging', label: 'Violation Flagging System', icon: Flag, active: false },
    { id: 'violations', label: 'Violations Management', icon: AlertTriangle, active: false },
    { id: 'vehicle-info', label: 'Vehicle Information Access', icon: Car, active: false },
    { id: 'field-reporting', label: 'Field Reporting', icon: FileText, active: false },
    { id: 'settings', label: 'Personal Settings', icon: Settings, active: false },
  ];

  return (
    <div className={`w-64 bg-white shadow-lg flex flex-col min-h-screen h-full z-40 transform transition-transform duration-300 ease-in-out
      fixed lg:sticky lg:top-0 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      {/* Sidebar Header */}
      <div className="p-4 lg:p-6 border-b border-gray-200 flex items-center justify-between">
        <h1 className="text-lg lg:text-xl font-bold text-gray-800">Police Dashboard</h1>
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden p-2 rounded-md hover:bg-gray-100"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Navigation Items */}

      {/* User Profile Section */}
      <div className="p-3 lg:p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 lg:w-10 h-8 lg:h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-4 lg:w-6 h-4 lg:h-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs lg:text-sm font-semibold text-gray-800 truncate">Officer John Doe</p>
            <p className="text-xs text-gray-500 truncate">Patrol Officer</p>
          </div>
        </div>
        <button
          className="w-full flex items-center px-3 lg:px-4 py-2 text-xs lg:text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          onClick={onLogout}
        >
          <LogOut className="w-3 lg:w-4 h-3 lg:h-4 mr-2" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;