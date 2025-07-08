import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaUtensils, FaClipboardList, FaUserCircle, FaSignOutAlt, FaMoneyCheckAlt } from 'react-icons/fa';
import { useVendorAuth } from '../context/VendorAuthContext';
import vendorApi, { getPendingUserSubscriptions, approveUserSubscription, getApprovedUserSubscriptions } from '../api/vendorApi';
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
  const [pendingSubs, setPendingSubs] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingError, setPendingError] = useState('');
  const [approvedSubs, setApprovedSubs] = useState([]);
  const [approvedLoading, setApprovedLoading] = useState(false);
  const [approvedError, setApprovedError] = useState('');

  useEffect(() => {
    const fetchPendingSubs = async () => {
      setPendingLoading(true);
      setPendingError('');
      try {
        const res = await getPendingUserSubscriptions();
        setPendingSubs(res.data.data);
      } catch (err) {
        setPendingError('Failed to load pending subscriptions.');
      } finally {
        setPendingLoading(false);
      }
    };
    fetchPendingSubs();
  }, []);

  useEffect(() => {
    const fetchApprovedSubs = async () => {
      setApprovedLoading(true);
      setApprovedError('');
      try {
        const res = await getApprovedUserSubscriptions();
        setApprovedSubs(res.data.data);
      } catch (err) {
        setApprovedError('Failed to load approved subscriptions.');
      } finally {
        setApprovedLoading(false);
      }
    };
    fetchApprovedSubs();
  }, []);

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

  const handleApprove = async (id, action) => {
    try {
      await approveUserSubscription(id, action);
      setPendingSubs(pendingSubs.filter(sub => sub._id !== id));
    } catch (err) {
      alert('Failed to update subscription status.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <VendorNavbar />
      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-lg mx-auto mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Vendor Details</h1>
          {error && <div className="text-red-600 mb-2">{error}</div>}
          {loading ? (
            <div className="text-center text-gray-500">Loading vendor details...</div>
          ) : vendor ? (
            <div className="flex flex-col items-center">
              <div className="rainbow-border-container">
                <img
                  src={vendor.image ? `http://localhost:5000${vendor.image}` : '/default-logo.png'}
                  alt="Vendor Logo"
                  className="rainbow-border-img"
                />
              </div>
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
        {/* Pending User Subscriptions Section */}
        <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto mt-8">
          <h2 className="text-xl font-bold text-orange-800 mb-4 flex items-center">Pending User Subscriptions</h2>
          {pendingLoading ? (
            <div className="text-center text-gray-500">Loading pending subscriptions...</div>
          ) : pendingError ? (
            <div className="text-red-600 mb-2">{pendingError}</div>
          ) : pendingSubs.length === 0 ? (
            <div className="text-center text-gray-500">No pending user subscriptions.</div>
          ) : (
            <div className="space-y-6">
              {pendingSubs.map(sub => (
                <div key={sub._id} className="border rounded-lg p-4 flex flex-col md:flex-row gap-4 items-start md:items-center bg-orange-50">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800 mb-1">User: {sub.user?.name} ({sub.user?.email})</div>
                    <div className="text-gray-700 mb-1">Plan: {sub.subscriptionPlan?.planType} ({sub.subscriptionPlan?.duration} days, ₹{sub.subscriptionPlan?.price})</div>
                    <div className="text-gray-700 mb-1">Start Date: {new Date(sub.startDate).toLocaleDateString()}</div>
                    <div className="text-gray-700 mb-1">Duration: {sub.duration} days</div>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    {sub.paymentProof && (
                      <a href={`http://localhost:5000${sub.paymentProof}`} target="_blank" rel="noopener noreferrer">
                        <img src={`http://localhost:5000${sub.paymentProof}`} alt="Payment Proof" className="w-24 h-24 object-cover rounded border" />
                      </a>
                    )}
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleApprove(sub._id, 'approved')}
                        className="px-4 py-2 rounded bg-green-500 hover:bg-green-600 text-white font-bold"
                      >Approve</button>
                      <button
                        onClick={() => handleApprove(sub._id, 'rejected')}
                        className="px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white font-bold"
                      >Reject</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Approved User Subscriptions Section */}
        <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto mt-8">
          <h2 className="text-xl font-bold text-green-800 mb-4 flex items-center">Approved User Subscriptions</h2>
          {approvedLoading ? (
            <div className="text-center text-gray-500">Loading approved subscriptions...</div>
          ) : approvedError ? (
            <div className="text-red-600 mb-2">{approvedError}</div>
          ) : approvedSubs.length === 0 ? (
            <div className="text-center text-gray-500">No approved user subscriptions.</div>
          ) : (
            <div className="space-y-6">
              {approvedSubs.map(sub => (
                <div key={sub._id} className="border rounded-lg p-4 flex flex-col md:flex-row gap-4 items-start md:items-center bg-green-50">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800 mb-1">User: {sub.user?.name} ({sub.user?.email})</div>
                    <div className="text-gray-700 mb-1">Plan: {sub.subscriptionPlan?.planType} ({sub.subscriptionPlan?.duration} days, ₹{sub.subscriptionPlan?.price})</div>
                    <div className="text-gray-700 mb-1">Start Date: {new Date(sub.startDate).toLocaleDateString()}</div>
                    <div className="text-gray-700 mb-1">Duration: {sub.duration} days</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      {/* Footer */}
      <footer className="bg-white text-black py-4 text-center border-t border-gray-200">
        &copy; {new Date().getFullYear()} Namma Bites. All rights reserved.
      </footer>
    </div>
  );
};

export default VendorDashboard; 