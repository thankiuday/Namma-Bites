import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSignInAlt, FaUserPlus, FaEnvelope, FaLock, FaRedo, FaBars, FaTimes } from 'react-icons/fa';
import api, { adminAPI } from '../api/config';
import logo from '../../public/logo.png';
import { useAdminAuth } from '../context/AdminAuthContext';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAdminAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleResetRateLimit = async () => {
    try {
      await adminAPI.resetRateLimit();
      setIsRateLimited(false);
      setError('');
    } catch (err) {
      setError('Failed to reset rate limit. Please try again later.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/admin/login', formData);
      console.log('Admin login response:', response.data.data);
      const token = response.data.data.accessToken || response.data.data.token;
      if (response.data.success && token) {
        login(response.data.data.admin, token);
        navigate('/admin/dashboard');
      } else {
        setError(response.data.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      if (err.response?.status === 429) {
        setIsRateLimited(true);
        setError(err.response.data.message || 'Too many login attempts. Please try again later.');
      } else {
        setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Admin Navbar */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <Link to="/" className="flex items-center space-x-2 min-w-0">
              <img src={logo} alt="Namma Bites" className="h-8 w-auto max-w-[40px]" />
              <span className="text-xl font-bold text-gray-800 truncate">Admin Portal</span>
            </Link>
            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center space-x-6">
              <Link
                to="/admin/login"
                className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 transition-colors duration-200"
              >
                <FaSignInAlt className="w-5 h-5" />
                <span>Login</span>
              </Link>
              <Link
                to="/admin/register"
                className="flex items-center space-x-2 text-gray-600 hover:text-orange-600 transition-colors duration-200"
              >
                <FaUserPlus className="w-5 h-5" />
                <span>Register</span>
              </Link>
            </div>
            {/* Hamburger Button */}
            <button
              className="md:hidden p-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Open menu"
            >
              {isMenuOpen ? (
                <FaTimes className="w-6 h-6" />
              ) : (
                <FaBars className="w-6 h-6" />
              )}
            </button>
          </div>
          {/* Mobile Nav Links */}
          {isMenuOpen && (
            <div className="md:hidden flex flex-col space-y-2 py-2 animate-fade-in">
              <Link
                to="/admin/login"
                className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 px-2 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <FaSignInAlt className="w-5 h-5" />
                <span>Login</span>
              </Link>
              <Link
                to="/admin/register"
                className="flex items-center space-x-2 text-gray-600 hover:text-orange-600 px-2 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <FaUserPlus className="w-5 h-5" />
                <span>Register</span>
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800">Admin Login</h1>
            <p className="text-gray-600 mt-2">Sign in to access the admin dashboard</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 font-medium">
              <div className="flex justify-between items-center">
                <span>{error}</span>
                {isRateLimited && process.env.NODE_ENV === 'development' && (
                  <button
                    onClick={handleResetRateLimit}
                    className="text-red-600 hover:text-red-700 flex items-center space-x-1"
                  >
                    <FaRedo className="h-4 w-4" />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="block w-full pl-10 pr-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent text-gray-900"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="block w-full pl-10 pr-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent text-gray-900"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || isRateLimited}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 transition-colors duration-200"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an admin account?{' '}
              <Link to="/admin/register" className="font-medium text-orange-600 hover:text-orange-700">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white shadow-lg mt-auto">
        <div className="container mx-auto px-4 py-4">
          <p className="text-center text-gray-600 text-sm">
            © {new Date().getFullYear()} Namma Bites. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AdminLogin; 