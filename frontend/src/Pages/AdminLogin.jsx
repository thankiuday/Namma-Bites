import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import api from '../api/config';
import { useAuth } from '../context/AuthContext';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Attempting admin login...');
      const response = await api.post('/admin/login', formData);
      console.log('Admin login response:', response.data);
      
      if (response.data.success) {
        // Store admin token
        const adminToken = response.data.data.accessToken;
        localStorage.setItem('adminToken', adminToken);
        
        // Verify token was stored
        const storedToken = localStorage.getItem('adminToken');
        console.log('Stored admin token:', storedToken ? 'exists' : 'missing');
        
        navigate('/admin/dashboard');
      } else {
        setError(response.data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Admin login error:', err);
      setError(err.response?.data?.message || err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Navbar */}
      <nav className="bg-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <img src="/logo.png" alt="Namma Bites" className="h-8 w-auto" />
              <span className="text-xl font-bold text-gray-900">Admin Portal</span>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center space-x-6">
              <Link
                to="/admin/login"
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors duration-200"
              >
                <FaSignInAlt className="w-5 h-5" />
                <span>Login</span>
              </Link>
              <Link
                to="/admin/register"
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors duration-200"
              >
                <FaUserPlus className="w-5 h-5" />
                <span>Register</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-8">Admin Login</h1>

          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an admin account?{' '}
              <Link to="/admin/register" className="font-medium text-blue-600 hover:text-blue-500">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLogin; 