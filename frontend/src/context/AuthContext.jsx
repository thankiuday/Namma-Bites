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
    const adminToken = localStorage.getItem('adminToken');
    const userToken = localStorage.getItem('accessToken');
    
    if (!adminToken && !userToken) {
      setLoading(false);
      return;
    }

    try {
      if (adminToken) {
        // Check admin authentication
        const response = await api.get('/admin/profile');
        if (response.data.success) {
          setUser({ ...response.data.data, isAdmin: true });
        } else {
          localStorage.removeItem('adminToken');
        }
      } else if (userToken) {
        // Check user authentication
        const response = await api.get('/users/profile');
        if (response.data.success) {
          setUser({ ...response.data.data, isAdmin: false });
        } else {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      if (error.response?.status === 401) {
        if (adminToken) {
          localStorage.removeItem('adminToken');
          navigate('/admin/login');
        } else {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          navigate('/login');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const login = (userData, tokens, isAdmin = false) => {
    setUser({ ...userData, isAdmin });
    if (isAdmin) {
      localStorage.setItem('adminToken', tokens.accessToken);
    } else {
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
    }
  };

  const logout = async () => {
    try {
      if (user?.isAdmin) {
        await api.post('/admin/logout');
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
      } else {
        await api.post('/auth/logout');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        navigate('/login');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    checkAuth
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