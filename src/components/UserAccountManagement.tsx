import React, { useState, useMemo } from 'react';
import { ChevronDown, Plus, Edit, UserCheck, UserX, UserPlus, X, Save } from 'lucide-react';

interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: 'Admin' | 'Police Officer' | 'DVLA Officer' | 'Supervisor' | 'Operator' | 'Viewer';
  system: 'Main App' | 'Police App' | 'DVLA App' | 'Supervisor App';
  status: 'active' | 'inactive' | 'pending';
  lastLogin: string | null;
}

interface UserAccountManagementProps {
  searchQuery: string;
}

const UserAccountManagement: React.FC<UserAccountManagementProps> = ({ searchQuery }) => {
  const [users, setUsers] = useState<User[]>([
    // Main App Admin Users
    {
      id: 'USR001',
      username: '4231220075',
      name: 'Obeng Addo Paa kwesi',
      email: 'admin@vpr.gov.gh',
      role: 'Admin',
      system: 'Main App',
      status: 'active',
      lastLogin: '2024-01-07 11:00 AM'
    },
    {
      id: 'USR002',
      username: '0203549815',
      name: 'Martin Mensah',
      email: 'supervisor@vpr.gov.gh',
      role: 'Supervisor',
      system: 'Main App',
      status: 'active',
      lastLogin: '2024-01-07 09:45 AM'
    },

    // Police App Users
    {
      id: 'USR003',
      username: '1234567890',
      name: 'Officer Michael Osei',
      email: 'michael.osei@police.gov.gh',
      role: 'Police Officer',
      system: 'Police App',
      status: 'active',
      lastLogin: '2024-01-07 08:30 AM'
    },

    // DVLA App Users
    {
      id: 'USR004',
      username: '0987654321',
      name: 'Kwame Asante',
      email: 'kwame.asante@dvla.gov.gh',
      role: 'DVLA Officer',
      system: 'DVLA App',
      status: 'active',
      lastLogin: '2024-01-07 10:15 AM'
    },
    {
      id: 'USR005',
      username: 'admin',
      name: 'DVLA Admin',
      email: 'admin@dvla.gov.gh',
      role: 'Admin',
      system: 'DVLA App',
      status: 'active',
      lastLogin: '2024-01-06 04:20 PM'
    },

    // Supervisor App Users
    {
      id: 'USR006',
      username: 'supervisor1',
      name: 'Martin Mensah',
      email: 'martinmen53@traffic.gov.gh',
      role: 'Supervisor',
      system: 'Supervisor App',
      status: 'active',
      lastLogin: '2024-01-07 02:30 PM'
    },

    // Additional system users
    {
      id: 'USR007',
      username: 'police001',
      name: 'Sarah Agyemang',
      email: 'sarah.agyemang@police.gov.gh',
      role: 'Police Officer',
      system: 'Police App',
      status: 'inactive',
      lastLogin: '2024-01-05 03:00 PM'
    },
    {
      id: 'USR008',
      username: 'dvla001',
      name: 'Joseph Nkrumah',
      email: 'joseph.nkrumah@dvla.gov.gh',
      role: 'DVLA Officer',
      system: 'DVLA App',
      status: 'pending',
      lastLogin: null
    },
    {
      id: 'USR009',
      username: 'operator001',
      name: 'Alice Boateng',
      email: 'alice.boateng@vpr.gov.gh',
      role: 'Operator',
      system: 'Main App',
      status: 'active',
      lastLogin: '2024-01-07 12:45 PM'
    },
    {
      id: 'USR010',
      username: 'viewer001',
      name: 'Robert Amankwah',
      email: 'robert.amankwah@vpr.gov.gh',
      role: 'Viewer',
      system: 'Main App',
      status: 'active',
      lastLogin: '2024-01-06 01:20 PM'
    }
  ]);

  const [nameEmailFilter, setNameEmailFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = searchQuery === '' || 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesNameEmail = nameEmailFilter === '' ||
        user.name.toLowerCase().includes(nameEmailFilter.toLowerCase()) ||
        user.email.toLowerCase().includes(nameEmailFilter.toLowerCase());
      
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      
      return matchesSearch && matchesNameEmail && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, nameEmailFilter, roleFilter, statusFilter]);

  const handleNameEmailFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNameEmailFilter(e.target.value);
    console.log('Name/Email filter:', e.target.value);
  };

  const handleRoleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRoleFilter(e.target.value);
    console.log('Role filter:', e.target.value);
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    console.log('Status filter:', e.target.value);
  };

  const handleAddNewUser = () => {
    console.log('Add New User button clicked');
  };

  const handleEdit = (user: User) => {
    console.log(`Edit clicked for ${user.id}`);
  };

  const handleDeactivate = (user: User) => {
    console.log(`Deactivate clicked for ${user.id}`);
    setUsers(prev => 
      prev.map(u => 
        u.id === user.id 
          ? { ...u, status: 'inactive' as const }
          : u
      )
    );
  };

  const handleActivate = (user: User) => {
    console.log(`Activate clicked for ${user.id}`);
    setUsers(prev => 
      prev.map(u => 
        u.id === user.id 
          ? { ...u, status: 'active' as const }
          : u
      )
    );
  };

  const handleApprove = (user: User) => {
    console.log(`Approve clicked for ${user.id}`);
    setUsers(prev => 
      prev.map(u => 
        u.id === user.id 
          ? { ...u, status: 'active' as const, lastLogin: new Date().toLocaleString() }
          : u
      )
    );
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex px-2 py-1 text-xs font-semibold rounded-full uppercase";
    
    switch (status) {
      case 'active':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'inactive':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getRoleBadge = (role: string) => {
    const baseClasses = "inline-flex px-2 py-1 text-xs font-semibold rounded-full";
    
    switch (role) {
      case 'Administrator':
        return `${baseClasses} bg-purple-100 text-purple-800`;
      case 'Operator':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'Viewer':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const renderActionButtons = (user: User) => {
    const baseButtonClasses = "px-3 py-1 text-sm rounded-md transition-colors font-medium";
    
    return (
      <div className="flex space-x-2">
        <button
          onClick={() => handleEdit(user)}
          className={`${baseButtonClasses} bg-blue-600 text-white hover:bg-blue-700 flex items-center`}
        >
          <Edit size={14} className="mr-1" />
          Edit
        </button>
        
        {user.status === 'active' && (
          <button
            onClick={() => handleDeactivate(user)}
            className={`${baseButtonClasses} bg-red-600 text-white hover:bg-red-700 flex items-center`}
          >
            <UserX size={14} className="mr-1" />
            Deactivate
          </button>
        )}
        
        {user.status === 'inactive' && (
          <button
            onClick={() => handleActivate(user)}
            className={`${baseButtonClasses} bg-green-600 text-white hover:bg-green-700 flex items-center`}
          >
            <UserCheck size={14} className="mr-1" />
            Activate
          </button>
        )}
        
        {user.status === 'pending' && (
          <button
            onClick={() => handleApprove(user)}
            className={`${baseButtonClasses} bg-green-600 text-white hover:bg-green-700 flex items-center`}
          >
            <UserPlus size={14} className="mr-1" />
            Approve
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white">
      {/* Filter Bar */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 flex-1">
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Filter by Name/Email..."
                value={nameEmailFilter}
                onChange={handleNameEmailFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="relative">
              <select
                value={roleFilter}
                onChange={handleRoleFilterChange}
                className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Roles</option>
                <option value="Administrator">Administrator</option>
                <option value="Operator">Operator</option>
                <option value="Viewer">Viewer</option>
              </select>
              <ChevronDown size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            
            <div className="relative">
              <select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
              <ChevronDown size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
          
          <button
            onClick={handleAddNewUser}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center"
          >
            <Plus size={16} className="mr-2" />
            Add New User
          </button>
        </div>
      </div>

      {/* User Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                USER ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                NAME
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                EMAIL
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ROLE
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                STATUS
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                LAST LOGIN
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ACTIONS
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user, index) => (
              <tr 
                key={user.id}
                className={`hover:bg-gray-50 transition-colors ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    #{user.id}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {user.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {user.email}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={getRoleBadge(user.role)}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={getStatusBadge(user.status)}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.lastLogin || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {renderActionButtons(user)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredUsers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No users found matching the current filters.
          </div>
        )}
      </div>
    </div>
  );
};

export default UserAccountManagement;
