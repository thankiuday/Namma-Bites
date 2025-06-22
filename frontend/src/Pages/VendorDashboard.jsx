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
  const { vendor, logout, loading } = useVendorAuth();
  const [statusLoading, setStatusLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/vendor/login');
  };

  const handleStatusToggle = async () => {
    if (!vendor) return;
    setStatusLoading(true);
    setError('');
    try {
      const newStatus = vendor.status === 'Open' ? 'Closed' : 'Open';
      const res = await vendorApi.put(`/vendors/${vendor._id}`, { status: newStatus });
      if (res.data.success) {
        // The context should ideally update itself after a successful API call.
        // For now, a page refresh or re-fetch within the context would be needed to see the change.
        // Or we can manually update the context's state if a function is provided.
        // Since no such function is provided, we will rely on the user to refresh or the context to re-fetch.
      } else {
        setError('Failed to update status.');
      }
    } catch (err) {
      setError('Failed to update status.');
    } finally {
      setStatusLoading(false);
    }
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
                src={vendor.image || '/default-logo.png'}
                alt="Vendor Logo"
                className="w-32 h-32 rounded-full object-cover border-4 border-orange-200 mb-4"
              />
              <div className="text-xl font-semibold text-gray-900 mb-2">{vendor.name}</div>
              <div className="text-gray-700 mb-1">Phone: {vendor.phone}</div>
              <div className="text-gray-700 mb-4">Email: {vendor.email}</div>
              <button
                onClick={handleStatusToggle}
                disabled={statusLoading}
                className={`px-6 py-2 rounded-full font-bold text-white transition-colors duration-200 ${vendor.status === 'Open' ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500 hover:bg-gray-600'}`}
              >
                {statusLoading ? 'Updating...' : vendor.status === 'Open' ? 'Open' : 'Closed'}
              </button>
            </div>
          ) : (
            <div className="text-center text-gray-500">No vendor details found.</div>
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