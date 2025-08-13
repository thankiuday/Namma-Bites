import React from 'react';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-white px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl border border-orange-100 p-8 text-center">
        <div className="text-4xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold text-orange-800 mb-2">Forgot Password</h1>
        <p className="text-gray-700 mb-6">This feature is coming soon.</p>
        <p className="text-gray-600 text-sm mb-8">We’re preparing a secure password reset experience. Please check back shortly.</p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold"
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;


