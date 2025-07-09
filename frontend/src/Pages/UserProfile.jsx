import React, { useState, useEffect } from 'react';
import { FaUser, FaShoppingCart, FaClipboardList, FaWallet, FaKey, FaHeadset, FaDownload, FaEdit } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import userApi, { getUserSubscriptions, deleteUserSubscription } from '../api/userApi';

const UserProfile = () => {
  const navigate = useNavigate();
  const { user, checkAuth } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscriptions, setSubscriptions] = useState([]);
  const [subsLoading, setSubsLoading] = useState(false);
  const [subsError, setSubsError] = useState('');

  // Update editedUser when user data changes
  useEffect(() => {
    if (user) {
      setEditedUser(user);
    }
  }, [user]);

  useEffect(() => {
    const fetchSubs = async () => {
      setSubsLoading(true);
      setSubsError('');
      try {
        const res = await getUserSubscriptions();
        setSubscriptions(res.data.data);
      } catch (err) {
        setSubsError('Failed to load subscriptions.');
      } finally {
        setSubsLoading(false);
      }
    };
    fetchSubs();
  }, []);

  const handleEdit = () => {
    setError('');
    setIsEditing(true);
  };

  const refreshToken = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: localStorage.getItem('refreshToken')
        })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('accessToken', data.accessToken);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');

      let response = await userApi.put('/profile', editedUser);

      if (response.data && response.data.success) {
        setEditedUser(response.data.data);
        setIsEditing(false);
        checkAuth();
      } else {
        setError(response.data?.error || 'Failed to update profile');
      }
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Failed to connect to the server');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDeleteSubscription = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expired subscription?')) return;
    try {
      await deleteUserSubscription(id);
      setSubscriptions(subscriptions.filter(sub => sub._id !== id));
    } catch (err) {
      alert('Failed to delete subscription.');
    }
  };

  if (!user) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Profile Hub Section */}
      <section className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FaUser className="text-orange-600 w-5 h-5 sm:w-6 sm:h-6" /> Profile Hub
          </h2>
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors text-sm sm:text-base"
            >
              <FaEdit className="w-4 h-4" /> Edit Profile
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={loading}
              className={`px-3 sm:px-4 py-2 text-sm sm:text-base ${loading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'} text-white rounded-md transition-colors`}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </div>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            {isEditing ? (
              <input
                type="text"
                name="username"
                value={editedUser?.username || ''}
                onChange={handleInputChange}
                placeholder="Enter your username"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-gray-900"
              />
            ) : (
              <p className="mt-1 text-gray-900">{user.username}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={editedUser?.email || ''}
                onChange={handleInputChange}
                placeholder="Enter your email address"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-gray-900"
              />
            ) : (
              <p className="mt-1 text-gray-900">{user.email}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={editedUser?.name || ''}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-gray-900"
              />
            ) : (
              <p className="mt-1 text-gray-900">{user.name}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
            {isEditing ? (
              <input
                type="tel"
                name="mobileNumber"
                value={editedUser?.mobileNumber || ''}
                onChange={handleInputChange}
                placeholder="Enter your mobile number"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-gray-900"
              />
            ) : (
              <p className="mt-1 text-gray-900">{user.mobileNumber}</p>
            )}
          </div>
        </div>
      </section>

      {/* User Subscriptions Section */}
      <section className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">My Subscriptions</h2>
        {subsLoading ? (
          <div className="text-center text-gray-500">Loading subscriptions...</div>
        ) : subsError ? (
          <div className="text-red-600 mb-2">{subsError}</div>
        ) : subscriptions.length === 0 ? (
          <div className="text-center text-gray-500">No subscriptions found.</div>
        ) : (
          <div className="space-y-4 overflow-y-auto max-h-[400px] md:max-h-[600px] pr-2">
            {subscriptions.map(sub => (
              <div key={sub._id} className="border rounded-lg p-4 flex flex-col md:flex-row gap-4 items-start md:items-center bg-orange-50">
                <div className="flex-1">
                  <div className="font-semibold text-gray-800 mb-1">Plan: {sub.subscriptionPlan?.planType} ({sub.subscriptionPlan?.duration} days, ₹{sub.subscriptionPlan?.price})</div>
                  <div className="text-gray-700 mb-1">Vendor: {sub.vendor?.name}</div>
                  <div className="text-gray-700 mb-1">Start Date: {new Date(sub.startDate).toLocaleDateString()}</div>
                  <div className="text-gray-700 mb-1">Duration: {sub.duration} days</div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    sub.paymentStatus === 'approved' ? 'bg-green-100 text-green-800 border border-green-200' :
                    sub.paymentStatus === 'pending' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                    sub.paymentStatus === 'rejected' ? 'bg-red-100 text-red-800 border border-red-200' :
                    sub.paymentStatus === 'expired' ? 'bg-gray-300 text-gray-700 border border-gray-400' :
                    'bg-gray-100 text-gray-800 border border-gray-200'
                  }`}>
                    {sub.paymentStatus.charAt(0).toUpperCase() + sub.paymentStatus.slice(1)}
                  </span>
                  {sub.paymentProof && (
                    <a href={`http://localhost:5000${sub.paymentProof}`} target="_blank" rel="noopener noreferrer" className="text-xs text-orange-600 underline">View Payment Proof</a>
                  )}
                  {sub.paymentStatus === 'expired' && (
                    <button
                      onClick={() => handleDeleteSubscription(sub._id)}
                      className="mt-2 px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-white text-xs font-bold"
                    >Delete</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Quick Actions Section */}
      <section className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <button
            onClick={() => navigate('/orders')}
            className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors text-sm sm:text-base"
          >
            <FaClipboardList className="w-4 h-4" /> View Orders
          </button>
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors text-sm sm:text-base"
          >
            <FaShoppingCart className="w-4 h-4" /> Cart View
          </button>
          <button
            onClick={() => navigate('/wallet')}
            className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors text-sm sm:text-base"
          >
            <FaWallet className="w-4 h-4" /> My Wallet
          </button>
        </div>
      </section>

      {/* Account Settings Section */}
      <section className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/change-password')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
          >
            <FaKey /> Change Password
          </button>
          <a
            href="mailto:contact_namma_bites@gmail.com"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaHeadset /> Contact Support
          </a>
        </div>
      </section>

      {/* Subscription Details Section */}
      <section className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Subscription Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Current Plan</h3>
            {(() => {
              const activeSubscription = subscriptions.find(sub => sub.paymentStatus === 'approved');
              if (activeSubscription) {
                return (
                  <div className="space-y-2">
                    <p className="text-gray-800 font-medium">
                      {activeSubscription.subscriptionPlan?.planType === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'} Plan
                    </p>
                    <p className="text-gray-600 text-sm">
                      Duration: {activeSubscription.duration} days
                    </p>
                    <p className="text-gray-600 text-sm">
                      Start Date: {new Date(activeSubscription.startDate).toLocaleDateString()}
                    </p>
                    <p className="text-gray-600 text-sm">
                      Price: ₹{activeSubscription.subscriptionPlan?.price}
                    </p>
                    <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">
                      Active
                    </span>
                  </div>
                );
              } else {
                return (
                  <>
                    <p className="text-gray-600">No active subscription</p>
                    <button
                      onClick={() => navigate('/subscription')}
                      className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors duration-200"
                    >
                      Browse Plans
                    </button>
                  </>
                );
              }
            })()}
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Assigned Vendor</h3>
            {(() => {
              const activeSubscription = subscriptions.find(sub => sub.paymentStatus === 'approved');
              if (activeSubscription && activeSubscription.vendor) {
                return (
                  <div className="space-y-2">
                    <p className="text-gray-800 font-medium">{activeSubscription.vendor.name}</p>
                    {activeSubscription.vendor.email && (
                      <p className="text-gray-600 text-sm">Email: {activeSubscription.vendor.email}</p>
                    )}
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">
                      Assigned
                    </span>
                  </div>
                );
              } else {
                return <p className="text-gray-600">No vendor assigned</p>;
              }
            })()}
          </div>
        </div>
      </section>

      {/* Install App Section */}
      <section className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Install App</h2>
        <button
          onClick={() => window.open('https://play.google.com/store', '_blank')}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors mx-auto"
        >
          <FaDownload /> Download App
        </button>
      </section>
    </div>
  );
};

export default UserProfile; 