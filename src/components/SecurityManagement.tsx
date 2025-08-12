import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Plus, 
  Edit, 
  Trash2, 
  Clock, 
  User, 
  Settings,
  ChevronDown,
  Eye,
  EyeOff,
  Lock,
  Globe,
  Save,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { 
  getSecurityConfig, 
  saveSecurityConfig, 
  addSecurityConfigHistoryEntry,
  SecurityConfig 
} from '../utils/securityConfig';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string;
}

interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
}

const SecurityManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([
    {
      id: 'ROLE001',
      name: 'Administrator',
      description: 'Full system access',
      permissions: 'All'
    },
    {
      id: 'ROLE002',
      name: 'System Admin',
      description: 'Manage system settings, users',
      permissions: 'System, Users, Security'
    },
    {
      id: 'ROLE003',
      name: 'Data Entry',
      description: 'Add/edit vehicle records',
      permissions: 'Data Entry, View Reports'
    }
  ]);

  const [auditLogs] = useState<AuditLogEntry[]>([
    {
      id: 'LOG001',
      timestamp: '2024-04-23 10:30:15',
      user: 'Admin User',
      action: 'Login Success',
      details: 'IP: 192.168.1.100'
    },
    {
      id: 'LOG002',
      timestamp: '2024-04-23 10:28:01',
      user: 'System Admin',
      action: 'Updated User Role',
      details: 'User: John Doe, Role: Data Entry'
    },
    {
      id: 'LOG003',
      timestamp: '2024-04-23 09:45:22',
      user: 'Admin User',
      action: 'Generated Report',
      details: 'Report: Violation Summary'
    },
    {
      id: 'LOG004',
      timestamp: '2024-04-22 16:05:10',
      user: 'Data Entry',
      action: 'Added Vehicle Record',
      details: 'Plate: ABC-123'
    }
  ]);

  // Security Settings State
  const [securityConfig, setSecurityConfig] = useState<SecurityConfig>(getSecurityConfig());
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  // Load security configuration on component mount
  useEffect(() => {
    setSecurityConfig(getSecurityConfig());
  }, []);

  const handleAddNewRole = () => {
    console.log('Add New Role button clicked');
  };

  const handleEditRole = (role: Role) => {
    console.log(`Edit clicked for ${role.name}`);
  };

  const handleDeleteRole = (role: Role) => {
    if (window.confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
      setRoles(prev => prev.filter(r => r.id !== role.id));
      console.log(`Delete clicked for ${role.name}`);
    }
  };

  const handlePasswordPolicyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSecurityConfig(prev => ({
      ...prev,
      passwordPolicy: e.target.value as 'weak' | 'medium' | 'strong' | 'very-strong'
    }));
  };

  const handleSessionTimeoutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value >= 5 && value <= 480) {
      setSecurityConfig(prev => ({
        ...prev,
        sessionTimeout: value
      }));
    }
  };

  const handleTwoFactorToggle = () => {
    setSecurityConfig(prev => ({
      ...prev,
      twoFactorEnabled: !prev.twoFactorEnabled
    }));
  };

  const handleIpWhitelistToggle = () => {
    setSecurityConfig(prev => ({
      ...prev,
      ipWhitelistEnabled: !prev.ipWhitelistEnabled
    }));
  };

  const handleSaveSecuritySettings = async () => {
    setIsSaving(true);
    setSaveStatus({ type: null, message: '' });

    try {
      const success = saveSecurityConfig({
        passwordPolicy: securityConfig.passwordPolicy,
        sessionTimeout: securityConfig.sessionTimeout,
        twoFactorEnabled: securityConfig.twoFactorEnabled,
        ipWhitelistEnabled: securityConfig.ipWhitelistEnabled
      }, 'Admin User');

      if (success) {
        // Add to history
        addSecurityConfigHistoryEntry(
          'Security Settings Updated',
          `Password Policy: ${securityConfig.passwordPolicy}, Session Timeout: ${securityConfig.sessionTimeout} minutes, 2FA: ${securityConfig.twoFactorEnabled ? 'Enabled' : 'Disabled'}, IP Whitelist: ${securityConfig.ipWhitelistEnabled ? 'Enabled' : 'Disabled'}`,
          'Admin User'
        );

        setSaveStatus({
          type: 'success',
          message: 'Security settings saved successfully! Changes will apply to all applications.'
        });

        // Clear success message after 3 seconds
        setTimeout(() => {
          setSaveStatus({ type: null, message: '' });
        }, 3000);
      } else {
        setSaveStatus({
          type: 'error',
          message: 'Failed to save security settings. Please try again.'
        });
      }
    } catch (error) {
      setSaveStatus({
        type: 'error',
        message: 'An error occurred while saving security settings.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const ToggleSwitch: React.FC<{ enabled: boolean; onToggle: () => void }> = ({ enabled, onToggle }) => (
    <button
      onClick={onToggle}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${enabled ? 'bg-blue-600' : 'bg-gray-200'}
      `}
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white transition-transform
          ${enabled ? 'translate-x-6' : 'translate-x-1'}
        `}
      />
    </button>
  );

  return (
    <div className="p-6 space-y-8">
      {/* User Roles & Permissions Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            User Roles & Permissions
          </h2>
          <button
            onClick={handleAddNewRole}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center"
          >
            <Plus size={16} className="mr-2" />
            Add New Role
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ROLE NAME
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  DESCRIPTION
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PERMISSIONS
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {roles.map((role, index) => (
                <tr 
                  key={role.id}
                  className={`hover:bg-gray-50 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {role.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {role.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {role.permissions}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditRole(role)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors flex items-center"
                      >
                        <Edit size={14} className="mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteRole(role)}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors flex items-center"
                      >
                        <Trash2 size={14} className="mr-1" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Log Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <Clock className="w-5 h-5 mr-2 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Audit Log</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  TIMESTAMP
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  USER
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ACTION
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  DETAILS
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {auditLogs.map((log, index) => (
                <tr 
                  key={log.id}
                  className={`hover:bg-gray-50 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-mono">
                      {log.timestamp}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {log.user}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {log.action}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">
                      {log.details}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Settings Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <Settings className="w-5 h-5 mr-2 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Security Settings</h2>
        </div>

        <div className="space-y-6">
          {/* Status Message */}
          {saveStatus.type && (
            <div className={`p-4 rounded-md flex items-center ${
              saveStatus.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {saveStatus.type === 'success' ? (
                <CheckCircle size={20} className="mr-2" />
              ) : (
                <AlertCircle size={20} className="mr-2" />
              )}
              <span className="text-sm font-medium">{saveStatus.message}</span>
            </div>
          )}

          {/* Password Policy */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password Policy
            </label>
            <div className="relative">
              <select
                value={securityConfig.passwordPolicy}
                onChange={handlePasswordPolicyChange}
                className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 w-full max-w-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="weak">Weak (Min 6 chars)</option>
                <option value="medium">Medium (Min 8 chars, mixed case)</option>
                <option value="strong">Strong (Min 8 chars, mixed case, number, symbol)</option>
                <option value="very-strong">Very Strong (Min 12 chars, all requirements)</option>
              </select>
              <ChevronDown size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              This policy will apply to all user registrations and password changes across all applications.
            </p>
          </div>

          {/* Session Timeout */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Timeout (minutes)
            </label>
            <input
              type="number"
              value={securityConfig.sessionTimeout}
              onChange={handleSessionTimeoutChange}
              min="5"
              max="480"
              className="border border-gray-300 rounded-md px-4 py-2 w-32 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Users will be automatically logged out after this period of inactivity across all applications.
            </p>
          </div>

          {/* Two-Factor Authentication */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Lock className="w-5 h-5 mr-2 text-gray-500" />
              <label className="text-sm font-medium text-gray-700">
                Enable Two-Factor Authentication (2FA)
              </label>
            </div>
            <ToggleSwitch enabled={securityConfig.twoFactorEnabled} onToggle={handleTwoFactorToggle} />
          </div>

          {/* IP Whitelisting */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Globe className="w-5 h-5 mr-2 text-gray-500" />
              <label className="text-sm font-medium text-gray-700">
                Enable IP Whitelisting
              </label>
            </div>
            <ToggleSwitch enabled={securityConfig.ipWhitelistEnabled} onToggle={handleIpWhitelistToggle} />
          </div>

          {/* Configuration Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex items-start">
              <Shield size={20} className="text-blue-600 mr-2 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-900">Unified Security Configuration</h4>
                <p className="text-xs text-blue-700 mt-1">
                  These security settings will be applied across all applications (Main, DVLA, Police, Supervisor). 
                  Changes take effect immediately and affect all users.
                </p>
                <p className="text-xs text-blue-600 mt-2">
                  Last updated: {new Date(securityConfig.lastUpdated).toLocaleString()} by {securityConfig.updatedBy}
                </p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={handleSaveSecuritySettings}
              disabled={isSaving}
              className={`px-6 py-2 text-white rounded-md transition-colors font-medium flex items-center ${
                isSaving 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <Save size={16} className="mr-2" />
              {isSaving ? 'Saving...' : 'Save Security Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityManagement;