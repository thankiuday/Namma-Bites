import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVendorAuth } from '../context/VendorAuthContext';
import api from '../api/config';
import { FaUser, FaPhone, FaMapMarkerAlt, FaUtensils, FaCamera, FaQrcode, FaEdit, FaSave, FaTimes, FaArrowLeft, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { getVendorImageUrl } from '../utils/imageUtils';
import UploadProgress from '../components/UploadProgress';
import { validateImageFile, isNonEmpty, isStrongPassword } from '../utils/validation';

const VendorProfile = () => {
  const { vendor, checkVendorAuth } = useVendorAuth();
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(vendor?.name || '');
  const [phone, setPhone] = useState(vendor?.phone || '');
  const [address, setAddress] = useState(vendor?.address || '');
  const [cuisine, setCuisine] = useState(vendor?.cuisine || '');
  const [logo, setLogo] = useState(null);
  const [scanner, setScanner] = useState(null);
  const [email] = useState(vendor?.email || '');
  const [profileMsg, setProfileMsg] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Change password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Upload progress states (manual implementation since we're using PUT)
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Update form fields when vendor data changes
  useEffect(() => {
    if (vendor) {
      setName(vendor.name || '');
      setPhone(vendor.phone || '');
      setAddress(vendor.address || '');
      setCuisine(vendor.cuisine || '');
    }
  }, [vendor]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    // Clear previous messages
    setProfileMsg('');
    setUploadError('');

    // Basic input trims and checks
    const nameTrim = String(name || '').trim();
    const phoneTrim = String(phone || '').trim();
    const addressTrim = String(address || '').trim();
    const cuisineTrim = String(cuisine || '').trim();

    if (!nameTrim) {
      setProfileMsg('Name is required');
      return;
    }
    if (phoneTrim && !/^\d{10}$/.test(phoneTrim)) {
      setProfileMsg('Phone must be a 10-digit number');
      return;
    }

    if (logo) {
      const check = validateImageFile(logo, { maxMB: 5 });
      if (!check.ok) {
        setProfileMsg(check.message);
        return;
      }
    }
    if (scanner) {
      const check = validateImageFile(scanner, { maxMB: 5 });
      if (!check.ok) {
        setProfileMsg(check.message);
        return;
      }
    }
    
    const formData = new FormData();
    formData.append('name', nameTrim);
    formData.append('phone', phoneTrim);
    formData.append('address', addressTrim);
    formData.append('cuisine', cuisineTrim);
    if (logo) formData.append('image', logo);
    if (scanner) formData.append('scanner', scanner);

    // Only proceed if there is something to update
    if (!nameTrim && !phoneTrim && !addressTrim && !cuisineTrim && !logo && !scanner) {
      setProfileMsg('Please provide at least one field to update.');
      return;
    }

    // Set loading states
    setIsUpdating(true);
    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatus('Uploading...');

    try {
      const res = await api.put('/vendor/me', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
          if (progress < 100) {
            setUploadStatus(`Uploading... ${progress}%`);
          } else {
            setUploadStatus('Processing...');
          }
        }
      });
      
      if (res.data.success) {
        setUploadStatus('Upload successful!');
        setProfileMsg('Profile updated successfully!');
        setEditMode(false);
        setLogo(null);
        setScanner(null);
        await checkVendorAuth(); // Refresh vendor data to show new logo/name
      } else {
        setUploadError(res.data.message || 'Failed to update profile.');
        setUploadStatus('Upload failed');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error updating profile.';
      setUploadError(errorMsg);
      setUploadStatus('Upload failed');
      setProfileMsg(errorMsg);
    } finally {
      setIsUpdating(false);
      setIsUploading(false);
      // Reset progress after a delay
      setTimeout(() => {
        setUploadProgress(0);
        setUploadStatus('');
        setUploadError('');
      }, 3000);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMsg('');

    if (!isNonEmpty(oldPassword)) {
      setPasswordMsg('Current password is required');
      return;
    }
    if (!isStrongPassword(newPassword, { min: 6 })) {
      setPasswordMsg('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg('New passwords do not match.');
      return;
    }
    try {
      const res = await api.post('/vendor/change-password', {
        oldPassword,
        newPassword,
      });
      if (res.data.success) {
        setPasswordMsg('Password changed successfully!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordMsg(res.data.message || 'Failed to change password.');
      }
    } catch (err) {
      setPasswordMsg(err.response?.data?.message || 'Error changing password.');
    }
  };

  if (!vendor) return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200 border-t-orange-600 mx-auto mb-4"></div>
        <p className="text-orange-700 font-semibold">Loading vendor profile...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/vendor/dashboard')}
              className="flex items-center gap-2 px-4 py-2 bg-white text-orange-700 rounded-lg hover:bg-orange-50 transition-colors duration-200 shadow-sm border border-orange-200"
            >
              <FaArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Dashboard</span>
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-orange-800 flex items-center gap-2">
              <FaUser className="w-6 h-6 sm:w-8 sm:h-8" />
              Vendor Profile
            </h1>
          </div>
          {/* Edit Profile Button for sm and above */}
          {!editMode && (
            <button 
              onClick={() => setEditMode(true)} 
              className="hidden sm:flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 font-semibold shadow-lg"
            >
              <FaEdit className="w-4 h-4" />
              Edit Profile
            </button>
          )}
        </div>

        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-orange-100 p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <img
                src={getVendorImageUrl(vendor.image)}
                alt="Vendor Logo"
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-orange-200 shadow-lg"
              />
              <div className="absolute -bottom-2 -right-2 bg-orange-500 text-white rounded-full p-2 shadow-lg">
                <FaCamera className="w-4 h-4" />
              </div>
            </div>
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{vendor.name}</h2>
              <p className="text-gray-600 text-lg mb-3">{vendor.email}</p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm">
                {vendor.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <FaPhone className="w-4 h-4 text-orange-500" />
                    {vendor.phone}
                  </div>
                )}
                {vendor.cuisine && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <FaUtensils className="w-4 h-4 text-orange-500" />
                    {vendor.cuisine}
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                vendor.status === 'Open' 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}>
                {vendor.status}
              </span>
            </div>
          </div>
        </div>
      
        {/* Vendor Information Display */}
        {!editMode && (
          <div className="bg-white rounded-2xl shadow-xl border border-orange-100 p-6 sm:p-8 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FaUser className="w-5 h-5 text-orange-600" />
              Vendor Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                <div className="flex items-center gap-3 mb-2">
                  <FaPhone className="w-5 h-5 text-orange-600" />
                  <label className="text-sm font-semibold text-gray-700">Phone Number</label>
                </div>
                <p className="text-gray-900 font-medium">{vendor.phone || 'Not provided'}</p>
              </div>
              <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                <div className="flex items-center gap-3 mb-2">
                  <FaUtensils className="w-5 h-5 text-orange-600" />
                  <label className="text-sm font-semibold text-gray-700">Cuisine Type</label>
                </div>
                <p className="text-gray-900 font-medium">{vendor.cuisine || 'Not specified'}</p>
              </div>
              <div className="md:col-span-2 bg-orange-50 rounded-xl p-4 border border-orange-200">
                <div className="flex items-center gap-3 mb-2">
                  <FaMapMarkerAlt className="w-5 h-5 text-orange-600" />
                  <label className="text-sm font-semibold text-gray-700">Address</label>
                </div>
                <p className="text-gray-900 font-medium">{vendor.address || 'Not provided'}</p>
              </div>
              {vendor.scanner && (
                <div className="md:col-span-2 bg-orange-50 rounded-xl p-4 border border-orange-200">
                <div className="flex items-center gap-3 mb-3">
                  <FaQrcode className="w-5 h-5 text-orange-600" />
                  <label className="text-sm font-semibold text-gray-700">Payment Scanner QR Code</label>
                </div>
                <img 
                  src={getVendorImageUrl(vendor.scanner)} 
                  alt="Payment Scanner" 
                  className="block mx-auto md:mx-0 w-40 h-40 object-cover rounded-lg border-2 border-orange-200 shadow-sm"
                />
              </div>
              )}
              {/* Edit Profile Button for mobile */}
              {!editMode && (
                <div className="sm:hidden md:col-span-2 mt-4">
                  <button 
                    onClick={() => setEditMode(true)} 
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 font-semibold shadow-lg"
                  >
                    <FaEdit className="w-4 h-4" />
                    Edit Profile
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        {/* Edit Profile Form */}
        {editMode && (
          <div className="bg-white rounded-2xl shadow-xl border border-orange-100 p-6 sm:p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FaEdit className="w-5 h-5 text-orange-600" />
                Edit Profile Information
              </h3>
              <button 
                onClick={() => setEditMode(false)}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <FaTimes className="w-4 h-4" />
                <span className="hidden sm:inline">Cancel</span>
              </button>
            </div>
            
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FaUser className="w-4 h-4 text-orange-600" />
                    Vendor Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-500 text-gray-900 transition-colors duration-200"
                    required
                    placeholder="Enter vendor name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FaPhone className="w-4 h-4 text-orange-600" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-500 text-gray-900 transition-colors duration-200"
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FaUtensils className="w-4 h-4 text-orange-600" />
                    Cuisine Type
                  </label>
                  <input
                    type="text"
                    value={cuisine}
                    onChange={e => setCuisine(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-500 text-gray-900 transition-colors duration-200"
                    placeholder="e.g., Indian, Chinese, Italian"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FaCamera className="w-4 h-4 text-orange-600" />
                    Vendor Logo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => setLogo(e.target.files[0])}
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-500 text-gray-900 transition-colors duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <FaMapMarkerAlt className="w-4 h-4 text-orange-600" />
                  Address
                </label>
                <textarea
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-500 text-gray-900 transition-colors duration-200"
                  rows="3"
                  placeholder="Enter your complete address"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <FaQrcode className="w-4 h-4 text-orange-600" />
                  Payment Scanner QR Code
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setScanner(e.target.files[0])}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-500 text-gray-900 transition-colors duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                />
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <FaQrcode className="w-3 h-3" />
                  Upload your Google Pay/UPI QR code for payments
                </p>
              </div>
              
              {/* Upload Progress Indicator */}
              {isUploading && (
                <UploadProgress
                  progress={uploadProgress}
                  status={uploadStatus}
                  isVisible={isUploading}
                  error={uploadError}
                  className="mb-4"
                />
              )}

              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
                <button 
                  type="button" 
                  onClick={() => setEditMode(false)} 
                  disabled={isUpdating}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isUpdating}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 font-semibold shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <FaSave className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
              
              {profileMsg && (
                <div className={`mt-4 p-4 rounded-lg text-sm font-medium ${
                  profileMsg.includes('successfully') 
                    ? 'bg-green-50 text-green-800 border border-green-200' 
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {profileMsg}
                </div>
              )}
            </form>
          </div>
        )}

        {/* Change Password Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-orange-100 p-6 sm:p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <FaLock className="w-5 h-5 text-orange-600" />
            Change Password
          </h3>
          <form onSubmit={handlePasswordChange} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Current Password</label>
                <div className="relative">
                  <input
                    type={showOldPassword ? "text" : "password"}
                    value={oldPassword}
                    onChange={e => setOldPassword(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-500 text-gray-900 transition-colors duration-200"
                    required
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showOldPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-500 text-gray-900 transition-colors duration-200"
                    required
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showNewPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-500 text-gray-900 transition-colors duration-200"
                  required
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button 
                type="submit" 
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 font-semibold shadow-lg flex items-center gap-2"
              >
                <FaLock className="w-4 h-4" />
                Change Password
              </button>
            </div>
            {passwordMsg && (
              <div className={`mt-4 p-4 rounded-lg text-sm font-medium ${
                passwordMsg.includes('successfully') 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {passwordMsg}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default VendorProfile;