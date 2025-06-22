import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import vendorApi from '../api/vendorApi';

const VendorAuthContext = createContext(null);

export const VendorAuthProvider = ({ children }) => {
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkVendorAuth();
  }, []);

  const checkVendorAuth = async () => {
    try {
      const response = await vendorApi.get('/self');
      if (response.data.success) {
        setVendor(response.data.vendor);
      } else {
        setVendor(null);
      }
    } catch (error) {
      setVendor(null);
    } finally {
      setLoading(false);
    }
  };

  const login = (vendorData) => {
    setVendor(vendorData);
    // No need to store token in local storage, it's an HttpOnly cookie
  };

  const logout = async () => {
    try {
      await vendorApi.post('/logout');
    } catch (error) {
      console.error('Logout failed', error);
      // Still proceed with client-side logout
    } finally {
      setVendor(null);
      navigate('/vendor/login');
    }
  };

  const value = {
    vendor,
    loading,
    login,
    logout,
    checkVendorAuth
  };

  return (
    <VendorAuthContext.Provider value={value}>
      {!loading && children}
    </VendorAuthContext.Provider>
  );
};

export const useVendorAuth = () => {
  const context = useContext(VendorAuthContext);
  if (!context) {
    throw new Error('useVendorAuth must be used within a VendorAuthProvider');
  }
  return context;
}; 