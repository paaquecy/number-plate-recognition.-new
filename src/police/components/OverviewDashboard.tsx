import React from 'react';
import { 
  Car, 
  AlertTriangle, 
  Users, 
  TrendingUp, 
  FileText, 
  CreditCard,
  Search,
  Flag
} from 'lucide-react';

interface OverviewDashboardProps {
  onNavigate?: (page: string) => void;
}

const OverviewDashboard: React.FC<OverviewDashboardProps> = ({ onNavigate }) => {
  const quickActions = [
    {
      title: 'Vehicle Plate Scanner',
      description: 'Scan and identify vehicle plates',
      icon: Car,
      color: 'bg-blue-500',
      onClick: () => onNavigate?.('plate-scanner')
    },
    {
      title: 'Violation Flagging',
      description: 'Flag and report violations',
      icon: Flag,
      color: 'bg-red-500',
      onClick: () => onNavigate?.('violation-flagging')
    },
    {
      title: 'Verify License',
      description: 'Verify driver license information',
      icon: CreditCard,
      color: 'bg-green-500',
      onClick: () => onNavigate?.('verify-license')
    },
    {
      title: 'Field Reporting',
      description: 'Create field reports',
      icon: FileText,
      color: 'bg-purple-500',
      onClick: () => onNavigate?.('field-reporting')
    }
  ];

  const stats = [
    {
      title: 'Total Scans',
      value: '1,234',
      change: '+12%',
      icon: Car,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Active Violations',
      value: '87',
      change: '+5%',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Officers Online',
      value: '24',
      change: '+2',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Reports Filed',
      value: '156',
      change: '+8%',
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'scan',
      description: 'Vehicle ABC-123 scanned',
      time: '2 minutes ago',
      icon: Car,
      color: 'text-blue-600'
    },
    {
      id: 2,
      type: 'violation',
      description: 'Violation flagged for XYZ-789',
      time: '5 minutes ago',
      icon: AlertTriangle,
      color: 'text-red-600'
    },
    {
      id: 3,
      type: 'report',
      description: 'Field report submitted',
      time: '10 minutes ago',
      icon: FileText,
      color: 'text-purple-600'
    },
    {
      id: 4,
      type: 'license',
      description: 'License DL123456 verified',
      time: '15 minutes ago',
      icon: CreditCard,
      color: 'text-green-600'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Good Morning, Officer!</h1>
        <p className="text-gray-600">Welcome to your Police Dashboard. Here's what's happening today.</p>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={action.onClick}
                className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors text-left group"
              >
                <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}>
                  <Icon size={24} className="text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-green-600">{stat.change}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                  <Icon size={24} className={stat.color} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {recentActivity.map((activity) => {
            const Icon = activity.icon;
            return (
              <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center`}>
                  <Icon size={16} className={activity.color} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OverviewDashboard;