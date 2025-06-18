import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHome, FaStore, FaUsers, FaSignOutAlt, FaSearch, FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';
import axios from '../api/config';

const AdminVendors = () => {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingVendor, setEditingVendor] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    cuisine: '',
    isApproved: false
  });

  useEffect(() => {
    // Check if admin is logged in
    const token = localStorage.getItem('adminToken');
    console.log('AdminVendors mounted, token status:', token ? 'Token exists' : 'No token');
    
    if (!token) {
      console.log('No admin token found, redirecting to login');
      navigate('/admin/login');
      return;
    }
    fetchVendors();
  }, [navigate]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('adminToken');
      console.log('Fetching vendors with token:', token ? 'Token exists' : 'No token');
      
      if (!token) {
        console.log('No token found during fetch, redirecting to login');
        navigate('/admin/login');
        return;
      }

      console.log('Making API request to /vendors');
      const response = await axios.get('/vendors');
      console.log('API Response:', response.data);

      if (response.data.success) {
        setVendors(response.data.data);
      } else {
        console.error('API returned error:', response.data.message);
        setError(response.data.message || 'Failed to fetch vendors');
      }
    } catch (err) {
      console.error('Error in fetchVendors:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      
      setError(err.response?.data?.message || 'Failed to fetch vendors. Please try again.');
      if (err.response?.status === 401 || err.response?.status === 403) {
        console.log('Authentication error, removing token and redirecting to login');
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const handleEdit = (vendor) => {
    setEditingVendor(vendor);
    setEditForm({
      name: vendor.name || '',
      email: vendor.email || '',
      phone: vendor.phone || '',
      address: vendor.address || '',
      cuisine: vendor.cuisine || '',
      isApproved: vendor.isApproved || false
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.put(`/vendors/${editingVendor._id}`, editForm);
      if (response.data.success) {
        setVendors(vendors.map(vendor => 
          vendor._id === editingVendor._id ? { ...vendor, ...editForm } : vendor
        ));
        setEditingVendor(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update vendor');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (vendorId) => {
    if (!window.confirm('Are you sure you want to delete this vendor?')) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await axios.delete(`/vendors/${vendorId}`);
      if (response.data.success) {
        setVendors(vendors.filter(vendor => vendor._id !== vendorId));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete vendor');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (vendorId, currentStatus) => {
    try {
      setLoading(true);
      const response = await axios.put(`/vendors/${vendorId}/approve`, {
        isApproved: !currentStatus
      });
      if (response.data.success) {
        setVendors(vendors.map(vendor => 
          vendor._id === vendorId 
            ? { ...vendor, isApproved: !currentStatus }
            : vendor
        ));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update vendor approval status');
    } finally {
      setLoading(false);
    }
  };

  const filteredVendors = vendors.filter(vendor =>
    vendor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.phone?.includes(searchTerm) ||
    vendor.cuisine?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Navbar */}
      <nav className="bg-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/admin/dashboard" className="flex items-center space-x-2">
              <img src="/logo.png" alt="Namma Bites" className="h-8 w-auto" />
              <span className="text-xl font-bold text-gray-800">Admin Portal</span>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center space-x-6">
              <Link
                to="/admin/dashboard"
                className="flex items-center space-x-2 text-gray-800 hover:text-blue-600 transition-colors duration-200"
              >
                <FaHome className="w-5 h-5" />
                <span className="font-medium">Home</span>
              </Link>
              <Link
                to="/admin/create-vendor"
                className="flex items-center space-x-2 text-gray-800 hover:text-blue-600 transition-colors duration-200"
              >
                <FaStore className="w-5 h-5" />
                <span className="font-medium">Create Vendor</span>
              </Link>
              <Link
                to="/admin/users"
                className="flex items-center space-x-2 text-gray-800 hover:text-blue-600 transition-colors duration-200"
              >
                <FaUsers className="w-5 h-5" />
                <span className="font-medium">See Users</span>
              </Link>
              <Link
                to="/admin/vendors"
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors duration-200"
              >
                <FaStore className="w-5 h-5" />
                <span className="font-medium">See Vendors</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-red-600 hover:text-red-700 transition-colors duration-200"
              >
                <FaSignOutAlt className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Vendor Management</h1>
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Search vendors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 placeholder-gray-500"
              />
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            </div>
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            /* Vendors List */
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Vendor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Cuisine
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredVendors.map((vendor) => (
                    <tr key={vendor._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600 font-semibold">
                                {vendor.name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-800">{vendor.name}</div>
                            <div className="text-sm text-gray-600">{vendor.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-800">{vendor.phone}</div>
                        <div className="text-sm text-gray-600">{vendor.address}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-800">{vendor.cuisine}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          vendor.isApproved 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {vendor.isApproved ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => handleApprove(vendor._id, vendor.isApproved)}
                          className={`mr-4 transition-colors duration-200 ${
                            vendor.isApproved 
                              ? 'text-yellow-600 hover:text-yellow-800' 
                              : 'text-green-600 hover:text-green-800'
                          }`}
                        >
                          {vendor.isApproved ? <FaTimes className="w-5 h-5" /> : <FaCheck className="w-5 h-5" />}
                        </button>
                        <button 
                          onClick={() => handleEdit(vendor)}
                          className="text-blue-600 hover:text-blue-800 mr-4 transition-colors duration-200"
                        >
                          <FaEdit className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(vendor._id)}
                          className="text-red-600 hover:text-red-800 transition-colors duration-200"
                        >
                          <FaTrash className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Edit Modal */}
              {editingVendor && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-lg p-6 w-full max-w-md">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Edit Vendor</h2>
                    <form onSubmit={handleEditSubmit}>
                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
                        <input
                          type="tel"
                          value={editForm.phone}
                          onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Address</label>
                        <textarea
                          value={editForm.address}
                          onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows="3"
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Cuisine</label>
                        <input
                          type="text"
                          value={editForm.cuisine}
                          onChange={(e) => setEditForm({...editForm, cuisine: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div className="flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={() => setEditingVendor(null)}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors duration-200"
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* No Results */}
              {filteredVendors.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-600 font-medium">No vendors found.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminVendors; 