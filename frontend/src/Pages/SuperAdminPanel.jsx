import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaCheckCircle, FaTimesCircle, FaCrown, FaShieldAlt, FaArrowLeft, FaCalendarAlt, FaEnvelope, FaTrashAlt } from 'react-icons/fa';
import { useAdminAuth } from '../context/AdminAuthContext';
import adminApi from '../api/adminApi';

const SuperAdminPanel = () => {
  const navigate = useNavigate();
  const { admin } = useAdminAuth();
  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [allAdmins, setAllAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState('');
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    // Check if user is super admin
    if (admin && admin.role !== 'super-admin') {
      navigate('/admin/dashboard');
      return;
    }
    
    fetchData();
  }, [admin, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pendingRes, allRes] = await Promise.all([
        adminApi.get('/pending-admins'),
        adminApi.get('/all-admins')
      ]);
      
      if (pendingRes.data.success) {
        setPendingAdmins(pendingRes.data.data);
      }
      
      if (allRes.data.success) {
        setAllAdmins(allRes.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReject = async (adminId, action) => {
    setActionLoading(`${adminId}-${action}`);
    try {
      const res = await adminApi.post(`/admins/${adminId}/approve`, { action });
      
      if (res.data.success) {
        await fetchData(); // Refresh data
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process admin action');
    } finally {
      setActionLoading('');
    }
  };

  const handleDeleteAdmin = async (adminId, adminName) => {
    if (!window.confirm(`Are you sure you want to delete admin "${adminName}"? This action cannot be undone.`)) {
      return;
    }

    setActionLoading(`${adminId}-delete`);
    try {
      const res = await adminApi.delete(`/admins/${adminId}`);
      
      if (res.data.success) {
        await fetchData(); // Refresh data
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete admin');
    } finally {
      setActionLoading('');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200 border-t-orange-600 mx-auto mb-4"></div>
          <p className="text-orange-700 font-semibold">Loading super admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/admin/dashboard')}
              className="flex items-center gap-2 px-4 py-2 bg-white text-orange-700 rounded-lg hover:bg-orange-50 transition-colors duration-200 shadow-sm border border-orange-200"
            >
              <FaArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Dashboard</span>
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-orange-800 flex items-center gap-2">
              <FaCrown className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
              Super Admin Panel
            </h1>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
            <div className="flex items-center gap-4">
              <div className="bg-orange-100 p-3 rounded-lg">
                <FaUsers className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Total Admins</p>
                <p className="text-2xl font-bold text-gray-900">{allAdmins.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
            <div className="flex items-center gap-4">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <FaTimesCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Pending Approval</p>
                <p className="text-2xl font-bold text-gray-900">{pendingAdmins.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <FaCheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Approved Admins</p>
                <p className="text-2xl font-bold text-gray-900">{allAdmins.filter(a => a.isApproved).length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg border border-orange-100 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex-1 py-4 px-6 text-center font-semibold transition-colors duration-200 ${
                activeTab === 'pending'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              Pending Approvals ({pendingAdmins.length})
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-4 px-6 text-center font-semibold transition-colors duration-200 ${
                activeTab === 'all'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              All Admins ({allAdmins.length})
            </button>
          </div>

          <div className="p-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 font-medium">
                {error}
              </div>
            )}

            {/* Pending Admins Tab */}
            {activeTab === 'pending' && (
              <div>
                {pendingAdmins.length === 0 ? (
                  <div className="text-center py-12">
                    <FaCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">No pending admin approvals</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingAdmins.map((pendingAdmin) => (
                      <div key={pendingAdmin._id} className="bg-orange-50 rounded-lg p-6 border border-orange-200">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                              <FaShieldAlt className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{pendingAdmin.name}</h3>
                              <div className="flex items-center gap-2 text-gray-600 text-sm">
                                <FaEnvelope className="w-4 h-4" />
                                {pendingAdmin.email}
                              </div>
                              <div className="flex items-center gap-2 text-gray-600 text-sm mt-1">
                                <FaCalendarAlt className="w-4 h-4" />
                                Registered {new Date(pendingAdmin.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleApproveReject(pendingAdmin._id, 'approve')}
                              disabled={actionLoading === `${pendingAdmin._id}-approve`}
                              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 font-semibold disabled:opacity-50 flex items-center gap-2"
                            >
                              {actionLoading === `${pendingAdmin._id}-approve` ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                              ) : (
                                <FaCheckCircle className="w-4 h-4" />
                              )}
                              Approve
                            </button>
                            <button
                              onClick={() => handleApproveReject(pendingAdmin._id, 'reject')}
                              disabled={actionLoading === `${pendingAdmin._id}-reject`}
                              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 font-semibold disabled:opacity-50 flex items-center gap-2"
                            >
                              {actionLoading === `${pendingAdmin._id}-reject` ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                              ) : (
                                <FaTimesCircle className="w-4 h-4" />
                              )}
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* All Admins Tab */}
            {activeTab === 'all' && (
              <div>
                <div className="space-y-4">
                  {allAdmins.map((adminUser) => (
                    <div key={adminUser._id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          adminUser.role === 'super-admin' 
                            ? 'bg-purple-500' 
                            : adminUser.isApproved 
                              ? 'bg-green-500' 
                              : 'bg-yellow-500'
                        }`}>
                          {adminUser.role === 'super-admin' ? (
                            <FaCrown className="w-6 h-6 text-white" />
                          ) : (
                            <FaShieldAlt className="w-6 h-6 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{adminUser.name}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${
                              adminUser.role === 'super-admin'
                                ? 'bg-purple-100 text-purple-800 border-purple-200'
                                : adminUser.isApproved
                                  ? 'bg-green-100 text-green-800 border-green-200'
                                  : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                            }`}>
                              {adminUser.role === 'super-admin' ? 'Super Admin' : adminUser.isApproved ? 'Approved' : 'Pending'}
                            </span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-gray-600 text-sm">
                            <div className="flex items-center gap-2">
                              <FaEnvelope className="w-4 h-4" />
                              {adminUser.email}
                            </div>
                            <div className="flex items-center gap-2">
                              <FaCalendarAlt className="w-4 h-4" />
                              Joined {new Date(adminUser.createdAt).toLocaleDateString()}
                            </div>
                            {adminUser.approvedAt && (
                              <div className="flex items-center gap-2">
                                <FaCheckCircle className="w-4 h-4 text-green-500" />
                                Approved {new Date(adminUser.approvedAt).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Delete Button - Only show for regular admins and not self */}
                        {adminUser.role !== 'super-admin' && adminUser._id !== admin?._id && (
                          <div className="flex items-center">
                            <button
                              onClick={() => handleDeleteAdmin(adminUser._id, adminUser.name)}
                              disabled={actionLoading === `${adminUser._id}-delete`}
                              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 font-semibold disabled:opacity-50 flex items-center gap-2"
                              title={`Delete ${adminUser.name}`}
                            >
                              {actionLoading === `${adminUser._id}-delete` ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                              ) : (
                                <FaTrashAlt className="w-4 h-4" />
                              )}
                              <span className="hidden sm:inline">Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminPanel;
