import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { FaUser, FaEnvelope, FaShieldAlt, FaCalendarAlt, FaEdit, FaArrowLeft, FaCrown, FaKey, FaEye, FaEyeSlash, FaSave, FaTimes, FaUserCog, FaHistory, FaClock, FaLock } from 'react-icons/fa';
import { getGreeting } from '../utils/greetings';
import adminApi from '../api/adminApi';
import { isValidEmail, isNonEmpty, isStrongPassword } from '../utils/validation';

const AdminProfile = () => {
  const navigate = useNavigate();
  const { admin, loading: contextLoading, checkAdminAuth } = useAdminAuth();
  const [profile, setProfile] = useState(admin);
  const [loading, setLoading] = useState(contextLoading);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedEmail, setEditedEmail] = useState('');
  const [profileMsg, setProfileMsg] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Change password state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (!admin) {
      setLoading(true);
      adminApi.get('/profile')
        .then(res => {
          if (res.data.success) setProfile(res.data.data);
          else setError(res.data.message || 'Failed to fetch profile');
        })
        .catch(err => setError(err.response?.data?.message || 'Failed to fetch profile'))
        .finally(() => setLoading(false));
    } else {
      setProfile(admin);
      setLoading(false);
    }
  }, [admin]);

  // Update form fields when profile data changes
  useEffect(() => {
    if (profile) {
      setEditedName(profile.name || '');
      setEditedEmail(profile.email || '');
    }
  }, [profile]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileMsg('');
    setIsUpdating(true);

    const nameTrim = String(editedName || '').trim();
    const emailTrim = String(editedEmail || '').trim();

    if (!isNonEmpty(nameTrim)) {
      setIsUpdating(false);
      setProfileMsg('Name is required');
      return;
    }
    if (!isValidEmail(emailTrim)) {
      setIsUpdating(false);
      setProfileMsg('Please enter a valid email');
      return;
    }
    
    try {
      const res = await adminApi.put('/profile', {
        name: editedName,
        email: editedEmail
      });
      
      if (res.data.success) {
        setProfileMsg('Profile updated successfully!');
        setProfile(res.data.admin);
        setEditMode(false);
        await checkAdminAuth(); // Refresh admin data
      } else {
        setProfileMsg(res.data.message || 'Failed to update profile.');
      }
    } catch (err) {
      setProfileMsg(err.response?.data?.message || 'Error updating profile.');
    } finally {
      setIsUpdating(false);
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
    
    setIsChangingPassword(true);
    
    try {
      const res = await adminApi.post('/change-password', {
        oldPassword,
        newPassword,
      });
      
      if (res.data.success) {
        setPasswordMsg('Password changed successfully!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswordForm(false);
      } else {
        setPasswordMsg(res.data.message || 'Failed to change password.');
      }
    } catch (err) {
      setPasswordMsg(err.response?.data?.message || 'Error changing password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200 border-t-orange-600 mx-auto mb-4"></div>
          <p className="text-orange-700 font-semibold">Loading admin profile...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
        <div className="bg-red-50 text-red-600 p-6 rounded-xl text-center font-medium border border-red-200 shadow-lg max-w-md">
          {error}
        </div>
      </div>
    );
  }
  
  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
        <div className="text-center text-gray-500 bg-white p-6 rounded-xl shadow-lg">
          No profile data found.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header Section */}
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
              <FaUserCog className="w-6 h-6 sm:w-8 sm:h-8" />
              Admin Profile
            </h1>
          </div>
          {!editMode && (
            <button 
              onClick={() => setEditMode(true)} 
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 font-semibold shadow-lg"
            >
              <FaEdit className="w-4 h-4" />
              Edit Profile
            </button>
          )}
        </div>

        {/* Greeting */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-orange-700 text-center mb-2">
            {getGreeting(profile?.name || 'Admin')}
          </h2>
          <p className="text-gray-600 text-center">Welcome to your admin profile management</p>
        </div>

        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-orange-100 p-6 sm:p-8 mb-8">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Avatar Section */}
            <div className="relative">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-xl border-4 border-white">
                {profile.role === 'super-admin' ? (
                  <FaCrown className="w-16 h-16 sm:w-20 sm:h-20 text-white" />
                ) : (
                  <FaShieldAlt className="w-16 h-16 sm:w-20 sm:h-20 text-white" />
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full p-3 shadow-lg">
                <FaUser className="w-5 h-5" />
              </div>
            </div>

            {/* Profile Info */}
            <div className="text-center lg:text-left flex-1">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">{profile.name}</h2>
              <p className="text-gray-600 text-xl mb-4">{profile.email}</p>
              
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-6">
                <div className={`px-6 py-3 rounded-full text-base font-bold border-2 shadow-sm ${
                  profile.role === 'super-admin' 
                    ? 'bg-purple-100 text-purple-800 border-purple-200' 
                    : 'bg-orange-100 text-orange-800 border-orange-200'
                }`}>
                  {profile.role === 'super-admin' ? (
                    <><FaCrown className="inline w-4 h-4 mr-2" />Super Administrator</>
                  ) : (
                    <><FaShieldAlt className="inline w-4 h-4 mr-2" />Administrator</>
                  )}
                </div>
                
                <div className="flex items-center gap-2 text-gray-600 bg-gray-100 px-4 py-2 rounded-full">
                  <FaCalendarAlt className="w-4 h-4 text-orange-500" />
                  <span>Member since {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto lg:mx-0">
                <div className="bg-orange-50 rounded-lg p-4 text-center border border-orange-100">
                  <FaClock className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Last Login</p>
                  <p className="text-sm font-semibold text-gray-900">Today</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 text-center border border-orange-100">
                  <FaHistory className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Account Status</p>
                  <p className="text-sm font-semibold text-green-600">Active</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information Display */}
        {!editMode ? (
          <div className="bg-white rounded-2xl shadow-xl border border-orange-100 p-6 sm:p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <FaUser className="w-6 h-6 text-orange-600" />
              Profile Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
                  <div className="flex items-center gap-3 mb-3">
                    <FaUser className="w-5 h-5 text-orange-600" />
                    <label className="text-sm font-semibold text-gray-700">Full Name</label>
                  </div>
                  <p className="text-gray-900 font-medium text-lg">{profile.name}</p>
                </div>
                
                <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
                  <div className="flex items-center gap-3 mb-3">
                    <FaShieldAlt className="w-5 h-5 text-orange-600" />
                    <label className="text-sm font-semibold text-gray-700">Role & Permissions</label>
                  </div>
                  <p className="text-gray-900 font-medium text-lg capitalize">{profile.role}</p>
                  <p className="text-gray-600 text-sm mt-1">
                    {profile.role === 'super-admin' ? 'Full system access with admin management' : 'Standard admin access'}
                  </p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
                  <div className="flex items-center gap-3 mb-3">
                    <FaEnvelope className="w-5 h-5 text-orange-600" />
                    <label className="text-sm font-semibold text-gray-700">Email Address</label>
                  </div>
                  <p className="text-gray-900 font-medium text-lg">{profile.email}</p>
                </div>
                
                <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
                  <div className="flex items-center gap-3 mb-3">
                    <FaCalendarAlt className="w-5 h-5 text-orange-600" />
                    <label className="text-sm font-semibold text-gray-700">Account Information</label>
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-900 font-medium">
                      Created: {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                    <p className="text-gray-900 font-medium">
                      Updated: {profile.updatedAt ? new Date(profile.updatedAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Security Section */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaLock className="w-5 h-5 text-orange-600" />
                Security & Access
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                  className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 font-semibold shadow-lg"
                >
                  <FaKey className="w-5 h-5" />
                  {showPasswordForm ? 'Cancel Password Change' : 'Change Password'}
                </button>
                
                <div className="flex items-center gap-3 px-6 py-4 bg-green-50 text-green-800 rounded-lg border border-green-200">
                  <FaShieldAlt className="w-5 h-5" />
                  <span className="font-semibold">Account Secured</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Edit Profile Form */
          <div className="bg-white rounded-2xl shadow-xl border border-orange-100 p-6 sm:p-8 mb-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <FaEdit className="w-6 h-6 text-orange-600" />
                Edit Profile Information
              </h3>
              <button 
                onClick={() => setEditMode(false)}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <FaTimes className="w-4 h-4" />
                Cancel
              </button>
            </div>
            
            <form onSubmit={handleProfileUpdate} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FaUser className="w-4 h-4 text-orange-600" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editedName}
                    onChange={e => setEditedName(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-500 text-gray-900 transition-colors duration-200"
                    required
                    placeholder="Enter full name"
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FaEnvelope className="w-4 h-4 text-orange-600" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editedEmail}
                    onChange={e => setEditedEmail(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-500 text-gray-900 transition-colors duration-200"
                    required
                    placeholder="Enter email address"
                  />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-gray-200">
                <button 
                  type="button" 
                  onClick={() => setEditMode(false)} 
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-semibold"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isUpdating}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 font-semibold shadow-lg flex items-center gap-2 disabled:opacity-50"
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
                <div className={`mt-6 p-4 rounded-lg text-sm font-medium ${
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
        {showPasswordForm && (
          <div className="bg-white rounded-2xl shadow-xl border border-orange-100 p-6 sm:p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <FaKey className="w-6 h-6 text-orange-600" />
              Change Password
            </h3>
            <form onSubmit={handlePasswordChange} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
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
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-500 text-gray-900 transition-colors duration-200"
                      required
                      placeholder="Enter new password"
                      minLength="6"
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
              
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-500 text-gray-900 transition-colors duration-200"
                    required
                    placeholder="Confirm new password"
                    minLength="6"
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
              
              <div className="flex justify-end pt-6 border-t border-gray-200">
                <button 
                  type="submit" 
                  disabled={isChangingPassword}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 font-semibold shadow-lg flex items-center gap-2 disabled:opacity-50"
                >
                  {isChangingPassword ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Changing...
                    </>
                  ) : (
                    <>
                      <FaKey className="w-4 h-4" />
                      Change Password
                    </>
                  )}
                </button>
              </div>
              
              {passwordMsg && (
                <div className={`mt-6 p-4 rounded-lg text-sm font-medium ${
                  passwordMsg.includes('successfully') 
                    ? 'bg-green-50 text-green-800 border border-green-200' 
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {passwordMsg}
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProfile; 
