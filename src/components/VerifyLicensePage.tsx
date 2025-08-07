import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Scan, 
  Flag, 
  AlertTriangle, 
  Car, 
  FileText, 
  User, 
  UserCircle, 
  LogOut, 
  CreditCard, 
  ClipboardCheck 
} from 'lucide-react';

interface VerifyLicensePageProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

const VerifyLicensePage: React.FC<VerifyLicensePageProps> = ({ onNavigate, currentPage }) => {
  const [licenseNumber, setLicenseNumber] = useState('');
  const [verificationResult, setVerificationResult] = useState<any>(null);

  const handleVerifyLicense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseNumber.trim()) {
      alert('Please enter a license number');
      return;
    }
    
    // Mock verification result
    setVerificationResult({
      licenseNumber: licenseNumber,
      status: 'Valid',
      holderName: 'John Smith',
      expiryDate: '2025-12-31',
      licenseType: 'Class C',
      restrictions: 'None',
      verifiedAt: new Date().toLocaleString()
    });
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Overview Dashboard', icon: LayoutDashboard },
    { id: 'plate-scanner', label: 'Vehicle Plate Scanner', icon: Scan },
    { id: 'violation-flagging', label: 'Violation Flagging System', icon: Flag },
    { id: 'violations-management', label: 'Violations Management', icon: AlertTriangle },
    { id: 'vehicle-info', label: 'Vehicle Information Access', icon: Car },
    { id: 'field-reporting', label: 'Field Reporting', icon: FileText },
    { id: 'personal-settings', label: 'Personal Settings', icon: User },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex font-['Inter']">
      {/* Left Sidebar */}
      <div className="w-64 bg-white shadow-lg flex flex-col lg:sticky lg:top-0 lg:h-screen lg:z-10">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Police Dashboard</h1>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      currentPage === item.id
                        ? 'bg-blue-100 text-blue-700 font-semibold'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="text-sm">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile and Logout */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <UserCircle size={20} className="text-blue-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">Officer John Doe</div>
              <div className="text-xs text-gray-500">Patrol Officer</div>
            </div>
          </div>
          <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors">
            <LogOut size={20} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Verify License Content */}
        <main className="flex-1 p-6">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Verify License</h2>
              <p className="text-gray-600 mt-1">Enter a license number to verify its validity and details</p>
            </div>

            {/* Enter License Details Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <CreditCard size={22} className="text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Enter License Details</h3>
              </div>
              <form onSubmit={handleVerifyLicense} className="space-y-4">
                <div>
                  <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    License Number
                  </label>
                  <input
                    id="licenseNumber"
                    type="text"
                    placeholder="e.g., DL123456789"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  type="submit"
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                  <CreditCard size={16} />
                  <span>Verify License</span>
                </button>
              </form>
            </div>

            {/* Verification Results Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <ClipboardCheck size={22} className="text-green-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Verification Results</h3>
              </div>
              
              {!verificationResult ? (
                <div className="text-gray-500 text-center py-8">
                  Enter a license number and click 'Verify' to see results.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">License Number</label>
                      <p className="text-sm font-semibold text-gray-900">{verificationResult.licenseNumber}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Status</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        verificationResult.status === 'Valid' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {verificationResult.status}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Holder Name</label>
                      <p className="text-sm font-semibold text-gray-900">{verificationResult.holderName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Expiry Date</label>
                      <p className="text-sm font-semibold text-gray-900">{verificationResult.expiryDate}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">License Type</label>
                      <p className="text-sm font-semibold text-gray-900">{verificationResult.licenseType}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Restrictions</label>
                      <p className="text-sm font-semibold text-gray-900">{verificationResult.restrictions}</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <label className="block text-sm font-medium text-gray-500">Verified At</label>
                    <p className="text-sm text-gray-600">{verificationResult.verifiedAt}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default VerifyLicensePage; 
