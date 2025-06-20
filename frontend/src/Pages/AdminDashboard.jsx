import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaStore, FaPlus, FaUserFriends, FaStoreAlt, FaCheckCircle, FaClock } from 'react-icons/fa';
import api from '../api/config';
import AdminLayout from '../components/admin/AdminLayout';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVendors: 0,
    activeVendors: 0,
    pendingApprovals: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');
      const [usersResponse, vendorsResponse] = await Promise.all([
        api.get('/users'),
        api.get('/vendors')
      ]);
      if (usersResponse.data.success && vendorsResponse.data.success) {
        const users = usersResponse.data.data;
        const vendors = vendorsResponse.data.data;
        setStats({
          totalUsers: users.length,
          totalVendors: vendors.length,
          activeVendors: vendors.filter(v => v.isApproved).length,
          pendingApprovals: vendors.filter(v => !v.isApproved).length
        });
      } else {
        setError('Failed to fetch dashboard data');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard data. Please try again.');
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
        <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome to your admin dashboard. Manage your users and vendors here.</p>
            </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 font-medium">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
        ) : (
          <>
            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <button
                onClick={() => navigate('/admin/users')}
                className="flex items-center p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-orange-600 hover:shadow-md transition-all duration-200"
          >
                <div className="p-3 bg-orange-100 rounded-lg mr-4">
                <FaUsers className="w-6 h-6 text-orange-600" />
              </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-gray-800">Manage Users</h3>
                  <p className="text-gray-600">View and manage user accounts</p>
                </div>
              </button>

              <button
                onClick={() => navigate('/admin/vendors')}
                className="flex items-center p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-orange-600 hover:shadow-md transition-all duration-200"
              >
                <div className="p-3 bg-orange-100 rounded-lg mr-4">
                  <FaStore className="w-6 h-6 text-orange-600" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-gray-800">Manage Vendors</h3>
                  <p className="text-gray-600">View and manage vendor accounts</p>
                </div>
              </button>

              <button
                onClick={() => navigate('/admin/create-vendor')}
                className="flex items-center p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-orange-600 hover:shadow-md transition-all duration-200"
              >
                <div className="p-3 bg-orange-100 rounded-lg mr-4">
                  <FaPlus className="w-6 h-6 text-orange-600" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-gray-800">Create Vendor</h3>
                  <p className="text-gray-600">Add a new vendor to the platform</p>
              </div>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{stats.totalUsers}</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <FaUserFriends className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between">
              <div>
                    <p className="text-sm font-medium text-gray-600">Total Vendors</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{stats.totalVendors}</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <FaStoreAlt className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Vendors</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{stats.activeVendors}</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <FaCheckCircle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
              </div>

              <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between">
              <div>
                    <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{stats.pendingApprovals}</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <FaClock className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        </div>
    </AdminLayout>
  );
};

export default AdminDashboard; 