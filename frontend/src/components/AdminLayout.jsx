import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaStore, FaUsers, FaUserPlus, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);

  const handleLogout = () => {
    navigate('/admin/login');
  };

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: 'home' },
    { to: '/admin/users', label: 'Users', icon: 'users' },
    { to: '/admin/vendors', label: 'Vendors', icon: 'store' },
    { to: '/admin/create-vendor', label: 'Create Vendor', icon: 'user-plus' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar links={adminLinks} isAdmin />
      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
      <Footer />
    </div>
  );
};

export default AdminLayout; 