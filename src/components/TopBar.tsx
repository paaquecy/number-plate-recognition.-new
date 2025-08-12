import React, { useState } from 'react';
import { Search, Bell, User } from 'lucide-react';
import NotificationsModal from './NotificationsModal';
import UserProfileModal from './UserProfileModal';

interface TopBarProps {
  title: string;
  onSearch: (query: string) => void;
  darkMode: boolean;
  onNavigate?: (page: string) => void;
}

const TopBar: React.FC<TopBarProps> = ({ title, onSearch, darkMode, onNavigate }) => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value);
  };

  const handleNotificationClick = () => {
    console.log('Notification bell clicked!');
    if (onNavigate) {
      console.log('Calling onNavigate with "notifications"');
      onNavigate('notifications');
    } else {
      console.log('No onNavigate prop, opening modal');
      setIsNotifOpen(true);
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate mr-4">{title}</h1>
        
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Search Bar */}
          <div className="relative hidden sm:block">
            <Search size={20} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
              darkMode ? 'text-gray-400' : 'text-gray-400'
            }`} />
            <input
              type="text"
              placeholder="Search..."
              onChange={handleSearchChange}
              className={`pl-10 pr-4 py-2 w-64 lg:w-80 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
          
          {/* Mobile Search Button */}
          <button className={`sm:hidden p-2 rounded-md transition-colors ${
            darkMode 
              ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
          }`}>
            <Search size={20} />
          </button>
          
          {/* Notification Icon */}
          <button className={`relative p-2 rounded-md transition-colors ${
            darkMode 
              ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
          }`} onClick={handleNotificationClick}>
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              3
            </span>
          </button>
          
          {/* User Profile */}
          <button className={`p-2 rounded-md transition-colors ${
            darkMode 
              ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
          }`} onClick={() => setIsProfileOpen(true)}>
            <User size={20} />
          </button>
        </div>
      </div>
      <NotificationsModal isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
      <UserProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </div>
  );
};

export default TopBar;