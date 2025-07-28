import React, { useEffect, useState } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import adminApi from '../api/adminApi';

const AdminProfile = () => {
  const { admin, loading: contextLoading, checkAdminAuth } = useAdminAuth();
  const [profile, setProfile] = useState(admin);
  const [loading, setLoading] = useState(contextLoading);
  const [error, setError] = useState('');

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

  if (loading) {
    return <div className="flex justify-center items-center min-h-[40vh] text-orange-600 font-semibold">Loading profile...</div>;
  }
  if (error) {
    return <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center font-medium">{error}</div>;
  }
  if (!profile) {
    return <div className="text-center text-gray-500">No profile data found.</div>;
  }

  return (
    <div className="max-w-xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-8 border border-orange-100">
      <h1 className="text-2xl font-bold text-orange-700 mb-6 text-center">Admin Profile</h1>
      <div className="flex flex-col gap-4 text-lg text-gray-800">
        <div><span className="font-semibold">Name:</span> {profile.name}</div>
        <div><span className="font-semibold">Email:</span> {profile.email}</div>
        <div><span className="font-semibold">Role:</span> {profile.role || 'Admin'}</div>
        <div><span className="font-semibold">Created At:</span> {profile.createdAt ? new Date(profile.createdAt).toLocaleString() : 'N/A'}</div>
        <div><span className="font-semibold">Updated At:</span> {profile.updatedAt ? new Date(profile.updatedAt).toLocaleString() : 'N/A'}</div>
      </div>
    </div>
  );
};

export default AdminProfile; 