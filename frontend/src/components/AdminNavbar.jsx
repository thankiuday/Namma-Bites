import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHome, FaStore, FaUsers, FaUserCircle, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';

const AdminNavbar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const navLinks = [
    { name: 'Home', path: '/admin/dashboard', icon: <FaHome /> },
    { name: 'Create Vendor', path: '/admin/create-vendor', icon: <FaStore /> },
    { name: 'All Users', path: '/admin/users', icon: <FaUsers /> },
    { name: 'All Vendors', path: '/admin/vendors', icon: <FaStore /> },
  ];

  return (
    <nav className="bg-gray-900 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <Link to="/admin/dashboard" className="flex items-center space-x-2">
            <img src="/logo.png" alt="Namma Bites" className="h-8 w-auto" />
            <span className="text-xl font-bold">Admin Portal</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-200"
              >
                {link.icon}
                <span>{link.name}</span>
              </Link>
            ))}
          </div>

          {/* Profile Menu */}
          <div className="hidden md:block relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-200"
            >
              <FaUserCircle className="w-6 h-6" />
              <span>Profile</span>
            </button>

            {/* Profile Dropdown */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50">
                <Link
                  to="/admin/profile"
                  className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                >
                  View Profile
                </Link>
                <Link
                  to="/admin/settings"
                  className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                >
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <FaSignOutAlt />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-300 hover:text-white"
          >
            {isMenuOpen ? <FaTimes className="w-6 h-6" /> : <FaBars className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-200 px-4 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.icon}
                <span>{link.name}</span>
              </Link>
            ))}
            <div className="border-t border-gray-700 pt-4 mt-4">
              <Link
                to="/admin/profile"
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-200 px-4 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <FaUserCircle />
                <span>Profile</span>
              </Link>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center space-x-2 text-red-500 hover:text-red-400 transition-colors duration-200 px-4 py-2"
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default AdminNavbar; 