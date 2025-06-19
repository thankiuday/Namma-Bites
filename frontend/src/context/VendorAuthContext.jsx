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
    const token = localStorage.getItem('vendorToken');
    if (!token) {
      setVendor(null);
      setLoading(false);
      return;
    }
    // No API call to /me; just trust the token exists for now
    setVendor(JSON.parse(localStorage.getItem('vendorData')) || null);
    setLoading(false);
  };

  const login = (vendorData, token) => {
    setVendor(vendorData);
    localStorage.setItem('vendorToken', token);
    localStorage.setItem('vendorData', JSON.stringify(vendorData));
  };

  const logout = async () => {
    try {
      await vendorApi.post('/logout');
      localStorage.removeItem('vendorToken');
      navigate('/vendor/login');
    } catch (error) {
      // handle error
    } finally {
      setVendor(null);
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