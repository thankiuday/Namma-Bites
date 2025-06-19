import React, { useState } from 'react';
import { useVendorAuth } from '../context/VendorAuthContext';
import api from '../api/config';

const VendorProfile = () => {
  const { vendor, checkVendorAuth } = useVendorAuth();
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
    // The /vendors/me endpoint is no longer available
    setProfileMsg('Profile update is currently unavailable.');
    return;
    // Old code:
    // const formData = new FormData();
    // formData.append('name', name);
    // if (logo) formData.append('logo', logo);
    // try {
    //   const res = await api.put('/vendors/me', formData, {
    //     headers: { 'Content-Type': 'multipart/form-data' },
    //   });
    //   if (res.data.success) {
    //     setProfileMsg('Profile updated successfully!');
    //     setEditMode(false);
    //     await checkVendorAuth(); // Refresh vendor data
    //   } else {
    //     setProfileMsg('Failed to update profile.');
    //   }
    // } catch (err) {
    //   setProfileMsg('Error updating profile.');
    // }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMsg('New passwords do not match.');
      return;
    }
    try {
      const res = await api.post('/vendors/change-password', {
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
      setPasswordMsg('Error changing password.');
    }
  };

  if (!vendor) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow mt-10">
      <h2 className="text-2xl font-bold mb-4">Vendor Profile</h2>
      <div className="flex items-center mb-6">
        <img
          src={vendor.logo ? vendor.logo : '/default-logo.png'}
          alt="Vendor Logo"
          className="w-24 h-24 rounded-full object-cover border mr-6"
        />
        <div>
          <div className="font-semibold text-lg">{vendor.name}</div>
          <div className="text-gray-600">{vendor.email}</div>
        </div>
      </div>
      {editMode ? (
        <form onSubmit={handleProfileUpdate} className="mb-6">
          <div className="mb-4">
            <label className="block mb-1 font-medium">Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Logo</label>
            <input
              type="file"
              accept="image/*"
              onChange={e => setLogo(e.target.files[0])}
              className="w-full"
            />
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded mr-2">Save</button>
          <button type="button" onClick={() => setEditMode(false)} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
          {profileMsg && <div className="mt-2 text-green-600">{profileMsg}</div>}
        </form>
      ) : (
        <button onClick={() => setEditMode(true)} className="bg-blue-600 text-white px-4 py-2 rounded mb-6">Edit Profile</button>
      )}

      <hr className="my-6" />

      <h3 className="text-xl font-semibold mb-2">Change Password</h3>
      <form onSubmit={handlePasswordChange}>
        <div className="mb-3">
          <label className="block mb-1">Old Password</label>
          <input
            type="password"
            value={oldPassword}
            onChange={e => setOldPassword(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div className="mb-3">
          <label className="block mb-1">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div className="mb-3">
          <label className="block mb-1">Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Change Password</button>
        {passwordMsg && <div className="mt-2 text-red-600">{passwordMsg}</div>}
      </form>
    </div>
  );
};

export default VendorProfile; 