import React, { useState, useEffect } from 'react';
import { FaUser, FaShoppingCart, FaClipboardList, FaWallet, FaKey, FaHeadset, FaDownload, FaEdit } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import userApi from '../api/userApi';

const UserProfile = () => {
  const navigate = useNavigate();
  const { user, checkAuth } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Update editedUser when user data changes
  useEffect(() => {
    if (user) {
      setEditedUser(user);
    }
  }, [user]);

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

      let response = await userApi.put('/update-profile', editedUser);

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

  if (!user) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Hub Section */}
      <section className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FaUser className="text-orange-600" /> Profile Hub
          </h2>
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
            >
              <FaEdit /> Edit Profile
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={loading}
              className={`px-4 py-2 ${loading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'} text-white rounded-md transition-colors`}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            {isEditing ? (
              <input
                type="text"
                name="username"
                value={editedUser?.username || ''}
                onChange={handleInputChange}
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
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-gray-900"
              />
            ) : (
              <p className="mt-1 text-gray-900">{user.mobileNumber}</p>
            )}
          </div>
        </div>
      </section>

      {/* Quick Actions Section */}
      <section className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/orders')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
          >
            <FaClipboardList /> View Orders
          </button>
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
          >
            <FaShoppingCart /> Cart View
          </button>
          <button
            onClick={() => navigate('/wallet')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
          >
            <FaWallet /> My Wallet
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
          <button
            onClick={() => navigate('/contact')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
          >
            <FaHeadset /> Contact Support
          </button>
        </div>
      </section>

      {/* Subscription Details Section */}
      <section className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Subscription Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Current Plan</h3>
            <p className="text-gray-600">No active subscription</p>
            <button
              onClick={() => navigate('/subscription')}
              className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
            >
              View Plans
            </button>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Assigned Vendor</h3>
            <p className="text-gray-600">No vendor assigned</p>
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