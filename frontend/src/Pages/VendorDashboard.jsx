import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaUtensils, FaClipboardList, FaUserCircle, FaSignOutAlt, FaMoneyCheckAlt } from 'react-icons/fa';
import { useVendorAuth } from '../context/VendorAuthContext';
import api from '../api/config';
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
  const { setVendor } = useVendorAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [vendorData, setVendorData] = useState(null);

  useEffect(() => {
    const fetchVendor = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/vendors/self');
        if (res.data.success) {
          setVendorData(res.data.data);
          setVendor(res.data.data);
          localStorage.setItem('vendorData', JSON.stringify(res.data.data));
        } else {
          setError('Failed to fetch vendor details.');
        }
      } catch (err) {
        setError('Failed to fetch vendor details.');
      } finally {
        setLoading(false);
      }
    };
    fetchVendor();
    // eslint-disable-next-line
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('vendorToken');
    navigate('/vendor/login');
  };

  const handleStatusToggle = async () => {
    if (!vendorData) return;
    setStatusLoading(true);
    setError('');
    try {
      const newStatus = vendorData.status === 'Open' ? 'Closed' : 'Open';
      const res = await api.put(`/vendors/${vendorData._id}`, { status: newStatus });
      if (res.data.success) {
        const updated = { ...vendorData, status: newStatus };
        setVendorData(updated);
        setVendor(updated);
        localStorage.setItem('vendorData', JSON.stringify(updated));
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
          ) : vendorData ? (
            <div className="flex flex-col items-center">
              <img
                src={vendorData.image || '/default-logo.png'}
                alt="Vendor Logo"
                className="w-32 h-32 rounded-full object-cover border-4 border-orange-200 mb-4"
              />
              <div className="text-xl font-semibold text-gray-900 mb-2">{vendorData.name}</div>
              <div className="text-gray-700 mb-1">Phone: {vendorData.phone}</div>
              <div className="text-gray-700 mb-4">Email: {vendorData.email}</div>
              <button
                onClick={handleStatusToggle}
                disabled={statusLoading}
                className={`px-6 py-2 rounded-full font-bold text-white transition-colors duration-200 ${vendorData.status === 'Open' ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500 hover:bg-gray-600'}`}
              >
                {statusLoading ? 'Updating...' : vendorData.status === 'Open' ? 'Open' : 'Closed'}
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