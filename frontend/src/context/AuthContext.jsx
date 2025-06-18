import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/config';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('accessToken');
    console.log('Checking auth - Token:', token ? 'exists' : 'missing');
    
    if (!token) {
      console.log('No token found in checkAuth');
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching admin profile...');
      const response = await api.get('/admin/profile');
      console.log('Profile response:', response.data);

      if (response.data.success) {
        setUser(response.data.data);
      } else {
        console.log('Profile fetch failed, attempting token refresh');
        await refreshToken();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      if (error.response?.status === 401) {
        console.log('401 error in checkAuth, attempting token refresh');
        await refreshToken();
      } else {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        console.log('No refresh token available');
        logout();
        return;
      }

      console.log('Attempting to refresh token...');
      const response = await api.post('/admin/refresh-token', {
        refreshToken
      });
      console.log('Refresh token response:', response.data);

      if (response.data.success) {
        const { accessToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);
        
        // Retry getting user data with new token
        const userResponse = await api.get('/admin/profile');
        if (userResponse.data.success) {
          setUser(userResponse.data.data);
        } else {
          throw new Error('Failed to get user data after token refresh');
        }
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
    }
  };

  const login = (userData, tokens) => {
    console.log('Login called with user data:', userData);
    console.log('Storing tokens...');
    setUser(userData);
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
  };

  const logout = async () => {
    console.log('Logout called');
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        await api.post('/admin/logout');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      navigate('/admin/login');
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    checkAuth,
    refreshToken
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 