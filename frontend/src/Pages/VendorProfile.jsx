import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVendorAuth } from '../context/VendorAuthContext';
import api from '../api/config';

const VendorProfile = () => {
  const { vendor, checkVendorAuth } = useVendorAuth();
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(vendor?.name || '');
  const [logo, setLogo] = useState(null);
  const [email] = useState(vendor?.email || '');
  const [profileMsg, setProfileMsg] = useState('');

  // Change password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    if (logo) formData.append('logo', logo);

    // Only proceed if there is something to update
    if (!name && !logo) {
      setProfileMsg('Please provide a new name or logo to update.');
      return;
    }

    try {
      const res = await api.put('/vendor/me', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        setProfileMsg('Profile updated successfully!');
        setEditMode(false);
        await checkVendorAuth(); // Refresh vendor data to show new logo/name
      } else {
        setProfileMsg(res.data.message || 'Failed to update profile.');
      }
    } catch (err) {
      setProfileMsg(err.response?.data?.message || 'Error updating profile.');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
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

  if (!vendor) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-8 bg-gray-50 rounded-lg shadow-md mt-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Vendor Profile</h2>
        <button 
          onClick={() => navigate('/vendor/dashboard')}
          className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
        >
          &larr; Back to Dashboard
        </button>
      </div>
      <div className="flex items-center mb-6">
        <img
          src={vendor.image ? `http://localhost:5000${vendor.image}` : '/default-logo.png'}
          alt="Vendor Logo"
          className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 mr-6"
        />
        <div>
          <div className="font-bold text-2xl text-gray-900">{vendor.name}</div>
          <div className="text-gray-500 text-lg">{vendor.email}</div>
        </div>
      </div>
      {editMode ? (
        <form onSubmit={handleProfileUpdate} className="mb-6 space-y-4">
          <div>
            <label className="block mb-1 font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 px-3 py-2 text-gray-900"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700">Logo</label>
            <input
              type="file"
              accept="image/*"
              onChange={e => setLogo(e.target.files[0])}
              className="w-full text-gray-700"
            />
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={() => setEditMode(false)} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 mr-2">Cancel</button>
            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Save</button>
          </div>
          {profileMsg && <div className="mt-2 text-green-600">{profileMsg}</div>}
        </form>
      ) : (
        <button onClick={() => setEditMode(true)} className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mb-6">Edit Profile</button>
      )}

      <hr className="my-8" />

      <h3 className="text-2xl font-semibold mb-4 text-gray-800">Change Password</h3>
      <form onSubmit={handlePasswordChange} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium text-gray-700">Old Password</label>
          <input
            type="password"
            value={oldPassword}
            onChange={e => setOldPassword(e.target.value)}
            className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 px-3 py-2 text-gray-900"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium text-gray-700">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 px-3 py-2 text-gray-900"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium text-gray-700">Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 px-3 py-2 text-gray-900"
            required
          />
        </div>
        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Change Password</button>
        {passwordMsg && <div className="mt-2 text-red-600">{passwordMsg}</div>}
      </form>
    </div>
  );
};

export default VendorProfile; 