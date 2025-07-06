import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import userApi from '../api/userApi';
import apiClient from '../api/apiClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const refreshToken = async () => {
    try {
      // Try to get refresh token from localStorage first
      let refreshToken = localStorage.getItem('refreshToken');

      // If not in localStorage, try to get from cookies
      if (!refreshToken) {
        refreshToken = document.cookie
          .split('; ')
          .find(row => row.startsWith('refreshToken='))
          ?.split('=')[1];
      }

      if (!refreshToken) {
        console.error('No refresh token found in localStorage or cookies');
        return false;
      }

      console.log('Attempting token refresh...');
      const response = await apiClient.post('/auth/refresh-token', {
        refreshToken: refreshToken
      });
      
      if (response.data.accessToken) {
        // Store the new refresh token in localStorage for future use
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }
        console.log('Token refreshed successfully');
        
        // Add a small delay to ensure cookies are processed
        await new Promise(resolve => setTimeout(resolve, 100));
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Clear invalid refresh token
      localStorage.removeItem('refreshToken');
      return false;
    }
  };

  const checkAuth = async () => {
    try {
      const response = await userApi.get('/me');
      if (response.data.success) {
        setUser(response.data.data);
      } else {
        setUser(null);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        // Try to refresh the token
        const refreshSuccess = await refreshToken();
        if (refreshSuccess) {
          // Retry the original request
          try {
            const retryResponse = await userApi.get('/me');
            if (retryResponse.data.success) {
              setUser(retryResponse.data.data);
            } else {
              setUser(null);
              navigate('/login');
            }
          } catch (retryError) {
            setUser(null);
            navigate('/login');
          }
        } else {
          setUser(null);
          navigate('/login');
        }
      } else {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAuthError = async (error) => {
    if (error.response?.status === 401) {
      const refreshSuccess = await refreshToken();
      if (refreshSuccess) {
        return true; // Token refreshed, retry the original request
      } else {
        setUser(null);
        navigate('/login');
        return false;
      }
    }
    return false;
  };

  const login = (userData) => {
    setUser(userData);
    // Store refresh token in localStorage for token refresh
    if (userData.refreshToken) {
      localStorage.setItem('refreshToken', userData.refreshToken);
    }
  };

  const logout = async () => {
    try {
      await userApi.post('/logout');
      navigate('/login');
    } catch (error) {
      // handle error
    } finally {
      setUser(null);
      // Clear refresh token from localStorage
      localStorage.removeItem('refreshToken');
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    checkAuth,
    handleAuthError
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