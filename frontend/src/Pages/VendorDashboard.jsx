import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaUtensils, FaClipboardList, FaUserCircle, FaSignOutAlt, FaMoneyCheckAlt } from 'react-icons/fa';
import { useVendorAuth } from '../context/VendorAuthContext';
import vendorApi from '../api/vendorApi';
import VendorNavbar from '../components/vendor/VendorNavbar';

const vendorLinks = [
  { name: 'Home', path: '/vendor/dashboard', icon: <FaHome className="w-5 h-5" /> },
  { name: 'Menu Entry', path: '/vendor/menu', icon: <FaUtensils className="w-5 h-5" /> },
  { name: 'Orders', path: '/vendor/orders', icon: <FaClipboardList className="w-5 h-5" /> },
  { name: 'Subscription', path: '/vendor/subscription', icon: <FaMoneyCheckAlt className="w-5 h-5" /> },
  { name: 'Profile', path: '/vendor/profile', icon: <FaUserCircle className="w-5 h-5" /> },
];

const VendorDashboard = () => {
  const navigate = useNavigate();
  const { vendor, logout, loading, checkVendorAuth } = useVendorAuth();
  const [statusLoading, setStatusLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingStatus, setPendingStatus] = useState("");

  const handleLogout = () => {
    logout();
    navigate('/vendor/login');
  };

  const handleStatusButtonClick = () => {
    if (!vendor) return;
    // Show confirmation for both open and close
    if (vendor.status === 'Open') {
      setPendingStatus('Closed');
      setShowConfirm(true);
    } else {
      setPendingStatus('Open');
      setShowConfirm(true);
    }
  };

  const handleStatusToggle = async (newStatus) => {
    if (!vendor) return;
    setStatusLoading(true);
    setError('');
    try {
      const res = await vendorApi.put('/me/status', { status: newStatus });
      if (res.data.success) {
        await checkVendorAuth();
        // The context should ideally update itself after a successful API call.
      } else {
        setError('Failed to update status.');
      }
    } catch (err) {
      setError('Failed to update status.');
    } finally {
      setStatusLoading(false);
      setShowConfirm(false);
      setPendingStatus("");
    }
  };

  const handleConfirm = () => {
    handleStatusToggle(pendingStatus);
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setPendingStatus("");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <VendorNavbar />
      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-lg mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Vendor Details</h1>
          {error && <div className="text-red-600 mb-2">{error}</div>}
          {loading ? (
            <div className="text-center text-gray-500">Loading vendor details...</div>
          ) : vendor ? (
            <div className="flex flex-col items-center">
              <img
                src={vendor.image ? `http://localhost:5000${vendor.image}` : '/default-logo.png'}
                alt="Vendor Logo"
                className="w-32 h-32 rounded-full object-cover border-4 border-orange-200 mb-4"
              />
              <div className="text-xl font-semibold text-gray-900 mb-2">{vendor.name}</div>
              <div className="text-gray-700 mb-1">Phone: {vendor.phone}</div>
              <div className="text-gray-700 mb-4">Email: {vendor.email}</div>
              <button
                onClick={handleStatusButtonClick}
                disabled={statusLoading}
                className={`px-6 py-2 rounded-full font-bold text-white transition-colors duration-200 ${vendor.status === 'Open' ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500 hover:bg-gray-600'}`}
              >
                {statusLoading ? 'Updating...' : vendor.status === 'Open' ? 'Open' : 'Closed'}
              </button>
            </div>
          ) : (
            <div className="text-center text-gray-500">No vendor details found.</div>
          )}
          {showConfirm && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
                <h2 className="text-lg font-semibold mb-4">Confirm Action</h2>
                <p className="mb-6">
                  {pendingStatus === 'Closed'
                    ? 'Do you really want to close your shop?'
                    : 'Do you really want to open your shop?'}
                </p>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirm}
                    className={`px-4 py-2 rounded ${pendingStatus === 'Closed' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white font-bold`}
                  >
                    {pendingStatus === 'Closed' ? 'Yes, Close' : 'Yes, Open'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-4 text-center">
        &copy; {new Date().getFullYear()} Namma Bites. All rights reserved.
      </footer>
    </div>
  );
};

export default VendorDashboard; 