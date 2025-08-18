import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../../public/logo.png';
import AnimatedButton from '../components/AnimatedButton';
import { isNonEmpty } from '../utils/validation';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Client-side validation
    const emailTrim = String(formData.email || '').trim();
    const passwordTrim = String(formData.password || '').trim();
    if (!isNonEmpty(emailTrim)) {
      setLoading(false);
      setError('Email is required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)) {
      setLoading(false);
      setError('Enter a valid email address');
      return;
    }
    if (!isNonEmpty(passwordTrim)) {
      setLoading(false);
      setError('Password is required');
      return;
    }

    try {
      console.log('Logging in with rememberMe:', formData.rememberMe);
      const response = await fetch((import.meta.env.VITE_API_URL || '/api') + '/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: emailTrim, password: passwordTrim, rememberMe: formData.rememberMe }),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle validation errors
        if (data.errors) {
          setError(data.errors[0].msg);
        } else {
          setError(data.error || 'Invalid credentials');
        }
        return;
      }

      console.log('Login successful, rememberMe:', formData.rememberMe);
      console.log('User data:', data.user);
      console.log('Refresh token present:', !!data.user.refreshToken);

      // Use the auth context to handle login
      login(data.user, formData.rememberMe);

      // Redirect to home page or dashboard
      navigate('/');
    } catch (err) {
      setError('Failed to connect to the server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8 bg-white p-6 sm:p-8 rounded-xl shadow-xl border border-orange-300">
        <div className="text-center">
          <img
            className="mx-auto h-16 sm:h-20 w-auto"
            src={logo}
            alt="Namma Bites"
          />
          <h2 className="mt-4 sm:mt-6 text-2xl sm:text-3xl font-bold text-gray-900">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-orange-600 hover:text-orange-500">
              Sign up
            </Link>
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form className="mt-6 sm:mt-8 space-y-4 sm:space-y-6 " onSubmit={handleSubmit}>
          <div className="space-y-3 sm:space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-black">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="mt-1 block w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-gray-900 text-base"
              />
              <p className="mt-1 text-xs text-gray-500">Use the email you registered with.</p>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-black">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="mt-1 block w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-gray-900 text-base"
              />
              <p className="mt-1 text-xs text-gray-500">Use a strong password. Minimum 6+ characters recommended.</p>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-black">
                Remember me
              </label>
            </div>
            
            {/* Debug info - only show in development */}
            {import.meta.env.DEV && (
              <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                <div>Remember Me: {formData.rememberMe ? 'Yes' : 'No'}</div>
                <div>LocalStorage refreshToken: {localStorage.getItem('refreshToken') ? 'Present' : 'Not present'}</div>
                <div>LocalStorage rememberMe: {localStorage.getItem('rememberMe') || 'Not set'}</div>
                <div>LocalStorage user: {localStorage.getItem('user') ? 'Present' : 'Not present'}</div>
              </div>
            )}
          </div>

          <div>
            <AnimatedButton
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 sm:py-3 px-4 shadow-sm text-sm sm:text-base font-medium"
              variant="primary"
              size="md"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </AnimatedButton>
          </div>

          {/* Forgot Password Link */}
          <div className="text-center">
            <Link to="/forgot-password" className="text-sm font-medium text-orange-600 hover:text-orange-500">
              Forgot your password?
            </Link>
          </div>
        </form>
        {/* Vendor Login Link */}
        <div className="text-center mt-4">
          <span className="text-sm text-gray-600">Are you a vendor?{' '}
            <Link to="/vendor/login" className="font-medium text-orange-600 hover:text-orange-500">
              Login here
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login; 