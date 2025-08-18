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
    // First, try to restore user from localStorage immediately for better UX
    const storedUser = localStorage.getItem('user');
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (storedUser && refreshToken) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData); // Set user immediately
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('user');
      }
    }
    
    // Then check authentication with the server
    checkAuth();
  }, []);

  // Set up automatic token refresh and visibility change handling
  useEffect(() => {
    if (user) {
      // Set up interval to refresh token every 14 minutes (before 15-minute expiry)
      const refreshInterval = setInterval(async () => {
        console.log('Auto-refreshing token...');
        const success = await refreshToken();
        if (!success) {
          console.log('Auto-refresh failed, logging out user');
          setUser(null);
          localStorage.removeItem('user');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('rememberMe');
          navigate('/login');
        }
      }, 14 * 60 * 1000); // 14 minutes

      // Set up visibility change listener to handle tab switches
      const handleVisibilityChange = async () => {
        if (!document.hidden && user) {
          console.log('User returned to tab, checking authentication...');
          // Don't immediately refresh token, just verify the session is still valid
          try {
            const response = await userApi.get('/me');
            if (!response.data.success) {
              // Session is invalid, try to refresh token
              const refreshSuccess = await refreshToken();
              if (!refreshSuccess) {
                console.log('Session invalid and refresh failed, logging out user');
                setUser(null);
                localStorage.removeItem('user');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('rememberMe');
                navigate('/login');
              }
            }
          } catch (error) {
            if (error.response?.status === 401) {
              // Token expired, try to refresh
              const refreshSuccess = await refreshToken();
              if (!refreshSuccess) {
                console.log('Token expired and refresh failed, logging out user');
                setUser(null);
                localStorage.removeItem('user');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('rememberMe');
                navigate('/login');
              }
            } else {
              // Network error, keep the current session
              console.log('Network error during visibility check, keeping current session');
            }
          }
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

      // Cleanup interval and event listener on unmount or when user changes
      return () => {
        clearInterval(refreshInterval);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [user, navigate]);

  const refreshToken = async () => {
    try {
      // Try to get refresh token from localStorage first
      let refreshToken = localStorage.getItem('refreshToken');

      // If not in localStorage, try to get from cookies
      if (!refreshToken) {
        const cookies = document.cookie.split('; ');
        const refreshTokenCookie = cookies.find(row => row.startsWith('refreshToken='));
        if (refreshTokenCookie) {
          refreshToken = refreshTokenCookie.split('=')[1];
          console.log('Found refresh token in cookies');
        }
      } else {
        console.log('Found refresh token in localStorage');
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
          // Preserve the rememberMe flag if it exists
          const rememberMe = localStorage.getItem('rememberMe');
          if (rememberMe) {
            localStorage.setItem('rememberMe', rememberMe);
          }
        }
        console.log('Token refreshed successfully');
        
        // Dispatch custom event for debugging
        window.dispatchEvent(new Event('tokenRefreshed'));
        
        // Add a small delay to ensure cookies are processed
        await new Promise(resolve => setTimeout(resolve, 100));
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      
      // If refresh token is expired or invalid, clear all auth data
      if (error.response?.status === 401) {
        console.log('Refresh token expired, clearing auth data');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('user');
        setUser(null);
      }
      
      return false;
    }
  };

  const checkAuth = async () => {
    try {
      console.log('🔍 Starting authentication check...');
      // First, check if we have user data in localStorage
      const storedUser = localStorage.getItem('user');
      const refreshToken = localStorage.getItem('refreshToken');
      
      console.log('📦 Stored user:', !!storedUser, 'Refresh token:', !!refreshToken);
      
      // If we have stored user data and refresh token, try to restore the session
      if (storedUser && refreshToken) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData); // Set user immediately for better UX
          
          // Then verify with the server
          const response = await userApi.get('/me');
          if (response.data.success) {
            const freshUserData = response.data.data;
            setUser(freshUserData);
            localStorage.setItem('user', JSON.stringify(freshUserData));
          } else {
            // Server says user is not valid, try token refresh
            const refreshSuccess = await refreshToken();
            if (!refreshSuccess) {
              setUser(null);
              localStorage.removeItem('user');
              localStorage.removeItem('refreshToken');
              localStorage.removeItem('rememberMe');
              navigate('/login');
            }
          }
        } catch (error) {
          if (error.response?.status === 401) {
            // Token might be expired, try to refresh
            const refreshSuccess = await refreshToken();
            if (refreshSuccess) {
              // Retry the original request
              try {
                const retryResponse = await userApi.get('/me');
                if (retryResponse.data.success) {
                  const userData = retryResponse.data.data;
                  setUser(userData);
                  localStorage.setItem('user', JSON.stringify(userData));
                } else {
                  setUser(null);
                  localStorage.removeItem('user');
                  localStorage.removeItem('refreshToken');
                  localStorage.removeItem('rememberMe');
                  navigate('/login');
                }
              } catch (retryError) {
                setUser(null);
                localStorage.removeItem('user');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('rememberMe');
                navigate('/login');
              }
            } else {
              setUser(null);
              localStorage.removeItem('user');
              localStorage.removeItem('refreshToken');
              localStorage.removeItem('rememberMe');
              navigate('/login');
            }
          } else {
            // Network error or other issue, keep the stored user data
            console.log('Network error during auth check, keeping stored user data');
          }
        }
      } else {
        // No stored data, try direct API call
        const response = await userApi.get('/me');
        if (response.data.success) {
          const userData = response.data.data;
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        } else {
          setUser(null);
          localStorage.removeItem('user');
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
      // Only clear user data if we're sure the session is invalid
      if (error.response?.status === 401) {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('rememberMe');
        navigate('/login');
      } else {
        // For network errors, keep the stored user data
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
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

  const login = (userData, rememberMe) => {
    console.log('AuthContext login called with rememberMe:', rememberMe);
    setUser(userData);
    
    // Store user data in localStorage for API client access
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Store refresh token in localStorage for token refresh
    // If rememberMe is true, store it for 30 days, otherwise store it for 7 days
    if (userData.refreshToken) {
      if (rememberMe) {
        localStorage.setItem('refreshToken', userData.refreshToken);
        // Also store a flag to indicate this is a "remember me" session
        localStorage.setItem('rememberMe', 'true');
        console.log('Stored refresh token with rememberMe flag');
      } else {
        localStorage.setItem('refreshToken', userData.refreshToken);
        localStorage.removeItem('rememberMe');
        console.log('Stored refresh token without rememberMe flag');
      }
    } else {
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('rememberMe');
      console.log('No refresh token provided, cleared localStorage');
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
      // Clear all auth data from localStorage
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('rememberMe');
      localStorage.removeItem('user');
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    checkAuth,
    handleAuthError,
    refreshToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
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