import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSignInAlt, FaUserPlus, FaBars, FaTimes } from 'react-icons/fa';
import axios from '../api/config';
import logo from '../../public/logo.png';
import { isNonEmpty, isValidEmail, isStrongPassword, trimObjectStrings } from '../utils/validation';

const AdminRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const data = trimObjectStrings(formData);

    if (!isNonEmpty(data.name)) {
      setError('Full name is required');
      return;
    }
    if (!isValidEmail(data.email)) {
      setError('Please enter a valid email');
      return;
    }
    if (!isStrongPassword(data.password, { min: 6 })) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (data.password !== data.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/admin/register', {
        name: data.name,
        email: data.email,
        password: data.password
      });

      if (response.data.success) {
        if (response.data.admin) {
          // Super admin registered - redirect to dashboard
          navigate('/admin/dashboard');
        } else {
          // Regular admin registered - show success message
          setSuccess(response.data.message);
          setFormData({
            name: '',
            email: '',
            password: '',
            confirmPassword: ''
          });
        }
      } else {
        setError(response.data.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800">Admin Registration</h1>
            <p className="text-gray-600 mt-2">Create your admin account to manage the platform</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 font-medium">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 text-green-600 p-4 rounded-lg mb-6 font-medium">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent text-gray-900"
                placeholder="Enter your full name"
              />
              <p className="mt-1 text-xs text-gray-500">Your real name as it will appear to other admins.</p>
            </div>

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
                className="mt-1 block w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent text-gray-900"
                placeholder="Enter your email"
              />
              <p className="mt-1 text-xs text-gray-500">Use a valid work email (e.g., name@example.com)</p>
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
                minLength="6"
                className="mt-1 block w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent text-gray-900"
                placeholder="Enter your password"
              />
              <p className="mt-1 text-xs text-gray-500">Minimum 6 characters. Use letters and numbers for better security.</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength="6"
                className="mt-1 block w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent text-gray-900"
                placeholder="Confirm your password"
              />
              <p className="mt-1 text-xs text-gray-500">Re-enter the same password to confirm.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 transition-colors duration-200"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Registering...
                </div>
              ) : (
                'Register'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an admin account?{' '}
              <Link to="/admin/login" className="font-medium text-orange-600 hover:text-orange-700">
                Login here
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

export default AdminRegister; 