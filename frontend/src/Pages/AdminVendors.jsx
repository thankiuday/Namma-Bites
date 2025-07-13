import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';
import axios from '../api/config';
import AdminLayout from '../components/admin/AdminLayout';

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
    status: 'Closed',
    establishedDate: '',
    image: null,
    scanner: null,
    isApproved: false
  });

  useEffect(() => {
    fetchVendors();
  }, [navigate]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('/vendor');
      if (response.data.success) {
        setVendors(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch vendors');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch vendors. Please try again.');
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (vendor) => {
    setEditingVendor(vendor);
    setEditForm({
      name: vendor.name || '',
      email: vendor.email || '',
      phone: vendor.phone || '',
      address: vendor.address || '',
      cuisine: vendor.cuisine || '',
      status: vendor.status || 'Closed',
      establishedDate: vendor.establishedDate ? vendor.establishedDate.slice(0, 10) : '',
      image: null,
      scanner: null,
      isApproved: vendor.isApproved || false
    });
  };

  const handleEditFormChange = (e) => {
    const { name, value, files } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      let response;
      if (editForm.image || editForm.scanner) {
        const formDataToSend = new FormData();
        formDataToSend.append('name', editForm.name);
        formDataToSend.append('email', editForm.email);
        formDataToSend.append('phone', editForm.phone);
        formDataToSend.append('address', editForm.address);
        formDataToSend.append('cuisine', editForm.cuisine);
        formDataToSend.append('status', editForm.status);
        formDataToSend.append('establishedDate', editForm.establishedDate);
        formDataToSend.append('isApproved', Boolean(editForm.isApproved));
        if (editForm.image) {
          formDataToSend.append('image', editForm.image);
        } else if (editingVendor.image) {
          // Always include the existing image path if a new image is not uploaded
          formDataToSend.append('image', editingVendor.image);
        }
        if (editForm.scanner) formDataToSend.append('scanner', editForm.scanner);
        response = await axios.put(`/vendor/${editingVendor._id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        response = await axios.put(`/vendor/${editingVendor._id}`, {
          ...editForm,
          isApproved: Boolean(editForm.isApproved),
          image: editingVendor.image // Always include existing image path if not uploading new
        });
      }
      if (response.data.success) {
        await fetchVendors(); // Re-fetch the vendor list from backend
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
      const response = await axios.delete(`/vendor/${vendorId}`);
      if (response.data.success) {
        setVendors(vendors.filter(vendor => vendor._id !== vendorId));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete vendor');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (vendorId) => {
    // Only proceed if the vendor is not already approved
    const vendorToApprove = vendors.find(v => v._id === vendorId);
    if (vendorToApprove && vendorToApprove.isApproved) {
      // Optionally, you could add logic here to "unapprove" if needed
      // For now, we do nothing if they are already approved.
      return;
    }

    try {
      setLoading(true);
      const response = await axios.put(`/vendor/${vendorId}/approve`);
      if (response.data.success) {
        setVendors(vendors.map(vendor =>
          vendor._id === vendorId
            ? { ...vendor, isApproved: true }
            : vendor
        ));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve vendor');
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
    <AdminLayout>
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
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent text-gray-800 placeholder-gray-500"
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="min-w-full divide-y divide-gray-200 text-sm md:text-base">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cuisine</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredVendors.map((vendor) => (
                  <tr key={vendor._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{vendor.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vendor.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vendor.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vendor.cuisine}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${vendor.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {vendor.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(vendor)}
                        className="text-orange-600 hover:text-orange-900 mr-4"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(vendor._id)}
                        className="text-red-600 hover:text-red-900 mr-4"
                      >
                        <FaTrash />
                      </button>
                      {!vendor.isApproved && (
                        <button
                          onClick={() => handleApprove(vendor._id)}
                          className="text-green-600 hover:text-green-900"
                          title="Approve Vendor"
                        >
                          <FaCheck />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingVendor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-orange-200 p-2 sm:p-6 md:p-8 w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl mx-2 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-orange-800">Edit Vendor</h2>
              <button
                type="button"
                onClick={() => setEditingVendor(null)}
                className="text-orange-400 hover:text-orange-600 text-2xl font-bold p-2 hover:bg-orange-50 rounded-full transition-colors duration-200"
                aria-label="Close edit modal"
              >
                &larr;
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-orange-700 text-xs sm:text-sm font-bold mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditFormChange}
                  placeholder="Enter vendor name"
                  className="w-full px-2 py-2 sm:px-3 sm:py-2 border-2 border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 text-black bg-orange-50 placeholder-orange-400 text-xs sm:text-base"
                />
              </div>
              <div>
                <label className="block text-orange-700 text-xs sm:text-sm font-bold mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={editForm.email}
                  onChange={handleEditFormChange}
                  placeholder="Enter vendor email"
                  className="w-full px-2 py-2 sm:px-3 sm:py-2 border-2 border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 text-black bg-orange-50 placeholder-orange-400 text-xs sm:text-base"
                />
              </div>
              <div>
                <label className="block text-orange-700 text-xs sm:text-sm font-bold mb-2">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={editForm.phone}
                  onChange={handleEditFormChange}
                  placeholder="Enter phone number"
                  className="w-full px-2 py-2 sm:px-3 sm:py-2 border-2 border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 text-black bg-orange-50 placeholder-orange-400 text-xs sm:text-base"
                />
              </div>
              <div>
                <label className="block text-orange-700 text-xs sm:text-sm font-bold mb-2">Address</label>
                <input
                  type="text"
                  name="address"
                  value={editForm.address}
                  onChange={handleEditFormChange}
                  placeholder="Enter address"
                  className="w-full px-2 py-2 sm:px-3 sm:py-2 border-2 border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 text-black bg-orange-50 placeholder-orange-400 text-xs sm:text-base"
                />
              </div>
              <div>
                <label className="block text-orange-700 text-xs sm:text-sm font-bold mb-2">Cuisine</label>
                <input
                  type="text"
                  name="cuisine"
                  value={editForm.cuisine}
                  onChange={handleEditFormChange}
                  placeholder="Enter cuisine type"
                  className="w-full px-2 py-2 sm:px-3 sm:py-2 border-2 border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 text-black bg-orange-50 placeholder-orange-400 text-xs sm:text-base"
                />
              </div>
              <div>
                <label className="block text-orange-700 text-xs sm:text-sm font-bold mb-2">Status</label>
                <select
                  name="status"
                  value={editForm.status}
                  onChange={handleEditFormChange}
                  className="w-full px-2 py-2 sm:px-3 sm:py-2 border-2 border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 text-black bg-orange-50 text-xs sm:text-base"
                >
                  <option value="Open">Open</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              <div>
                <label className="block text-orange-700 text-xs sm:text-sm font-bold mb-2">Established Date</label>
                <input
                  type="date"
                  name="establishedDate"
                  value={editForm.establishedDate}
                  onChange={handleEditFormChange}
                  placeholder="Select established date"
                  className="w-full px-2 py-2 sm:px-3 sm:py-2 border-2 border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 text-black bg-orange-50 placeholder-orange-400 text-xs sm:text-base"
                />
              </div>
              <div>
                <label className="block text-orange-700 text-xs sm:text-sm font-bold mb-2">Vendor Image</label>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleEditFormChange}
                  className="w-full px-2 py-2 sm:px-3 sm:py-2 border-2 border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 text-black bg-orange-50 text-xs sm:text-base"
                />
              </div>
              <div>
                <label className="block text-orange-700 text-xs sm:text-sm font-bold mb-2">Google Pay Scanner</label>
                <input
                  type="file"
                  name="scanner"
                  accept="image/*"
                  onChange={handleEditFormChange}
                  className="w-full px-2 py-2 sm:px-3 sm:py-2 border-2 border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 text-black bg-orange-50 text-xs sm:text-base"
                />
              </div>
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editForm.isApproved}
                    onChange={(e) => setEditForm({ ...editForm, isApproved: e.target.checked })}
                    className="mr-2 accent-orange-600 h-4 w-4"
                  />
                  <span className="text-orange-700 text-xs sm:text-sm font-bold">Approved</span>
                </label>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 mt-4">
                <button
                  type="button"
                  onClick={() => setEditingVendor(null)}
                  className="px-3 py-2 sm:px-4 sm:py-2 text-orange-600 hover:text-orange-800 border border-orange-300 rounded-lg bg-orange-50 hover:bg-orange-100 font-semibold text-xs sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-2 sm:px-4 sm:py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold shadow-md text-xs sm:text-base"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminVendors; 