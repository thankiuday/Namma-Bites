import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaStore, FaPlus, FaUserFriends, FaStoreAlt, FaCheckCircle, FaClock, FaCrown } from 'react-icons/fa';
import api from '../api/config';
import AdminLayout from '../components/admin/AdminLayout';
import { useAdminAuth } from '../context/AdminAuthContext';
import AnimatedButton from '../components/AnimatedButton';
import { getGreeting } from '../utils/greetings';

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
  const { admin } = useAdminAuth();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');
      const [usersResponse, vendorsResponse] = await Promise.all([
        api.get('/users'),
        api.get('/vendor')
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
        {/* Personalized Greeting */}
        <div className="mb-6 animate-fade-in-down">
          <h2 className="text-2xl font-bold text-orange-700 drop-shadow-sm text-center">
            {getGreeting(admin?.name || admin?.username || 'Admin')}
          </h2>
        </div>
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
          <>
            {/* Quick Actions Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center p-6 bg-orange-50 border-2 border-gray-100 rounded-lg">
                  <div className="p-3 bg-orange-100 rounded-lg mr-4 w-12 h-12" />
                  <div className="flex-1">
                    <div className="h-5 w-32 bg-orange-200 rounded mb-2" />
                    <div className="h-4 w-24 bg-orange-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
            {/* Stats Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse bg-orange-50 border-2 border-gray-100 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="h-4 w-20 bg-orange-200 rounded mb-2" />
                      <div className="h-6 w-16 bg-orange-100 rounded" />
                    </div>
                    <div className="p-3 bg-orange-100 rounded-lg w-12 h-12" />
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Quick Actions */}
            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 ${admin?.role === 'super-admin' ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
              <AnimatedButton
                onClick={() => navigate('/admin/users')}
                className="flex items-center p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-orange-600 hover:shadow-md transition-all duration-200"
                variant="primary"
                size="lg"
              >
                <div className="p-3 bg-orange-100 rounded-lg mr-4">
                  <FaUsers className="w-6 h-6 text-orange-600" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-gray-800">Manage Users</h3>
                  <p className="text-gray-600">View and manage user accounts</p>
                </div>
              </AnimatedButton>

              <AnimatedButton
                onClick={() => navigate('/admin/vendor')}
                className="flex items-center p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-orange-600 hover:shadow-md transition-all duration-200"
                variant="primary"
                size="lg"
              >
                <div className="p-3 bg-orange-100 rounded-lg mr-4">
                  <FaStore className="w-6 h-6 text-orange-600" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-gray-800">Manage Vendors</h3>
                  <p className="text-gray-600">View and manage vendor accounts</p>
                </div>
              </AnimatedButton>

              <AnimatedButton
                onClick={() => navigate('/admin/create-vendor')}
                className="flex items-center p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-orange-600 hover:shadow-md transition-all duration-200"
                variant="primary"
                size="lg"
              >
                <div className="p-3 bg-orange-100 rounded-lg mr-4">
                  <FaPlus className="w-6 h-6 text-orange-600" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-gray-800">Create Vendor</h3>
                  <p className="text-gray-600">Add a new vendor to the platform</p>
                </div>
              </AnimatedButton>

              {/* Super Admin Panel - Only visible to Super Admins */}
              {admin?.role === 'super-admin' && (
                <AnimatedButton
                  onClick={() => navigate('/admin/super-panel')}
                  className="flex items-center p-6 bg-gradient-to-r from-purple-50 to-purple-100 border-2 border-purple-200 rounded-lg hover:border-purple-600 hover:shadow-md transition-all duration-200"
                  variant="primary"
                  size="lg"
                >
                  <div className="p-3 bg-purple-100 rounded-lg mr-4">
                    <FaCrown className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-gray-800">Super Admin Panel</h3>
                    <p className="text-gray-600">Manage admin approvals</p>
                  </div>
                </AnimatedButton>
              )}
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