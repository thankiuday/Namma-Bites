import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminApi from '../api/adminApi';
import * as jwt_decode from "jwt-decode";

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("[AdminAuthContext] Render: loading =", loading, "admin =", admin);
  }, [loading, admin]);

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
    try {
      console.log("[AdminAuthContext] Fetching /api/admin/profile...");
      const response = await adminApi.get('/profile');
      console.log("[AdminAuthContext] Profile fetch result:", response.data);
      if (response.data.success) {
        setAdmin(response.data.data);
      }
    } catch (error) {
      console.log("[AdminAuthContext] Profile fetch error:", error);
      if (error.response?.status === 401) {
        if (window.location.pathname !== '/admin/login') {
          navigate('/admin/login');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const login = (adminData) => {
    setAdmin(adminData);
  };

  const logout = async () => {
    try {
      await adminApi.post('/logout');
      navigate('/admin/login');
    } catch (error) {
      // handle error
    } finally {
      setAdmin(null);
    }
  };

  const value = {
    admin,
    loading,
    login,
    logout,
    checkAdminAuth
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}; 