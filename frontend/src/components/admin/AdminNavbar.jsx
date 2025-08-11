import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHome, FaStore, FaUsers, FaUserCircle, FaSignOutAlt, FaBars, FaTimes, FaCog, FaFont } from 'react-icons/fa';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useFontSize } from '../../context/FontSizeContext';

const AdminNavbar = () => {
  const navigate = useNavigate();
  const { logout } = useAdminAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { increaseFontSize, decreaseFontSize, resetFontSize, getCurrentFontSize } = useFontSize();
  const settingsRef = useRef(null);

  // Close settings dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setIsSettingsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
  };

  const navLinks = [
    { name: 'Home', path: '/admin/dashboard', icon: <FaHome className="w-5 h-5" /> },
    { name: 'Create Vendor', path: '/admin/create-vendor', icon: <FaStore className="w-5 h-5" /> },
    { name: 'All Users', path: '/admin/users', icon: <FaUsers className="w-5 h-5" /> },
    { name: 'All Vendors', path: '/admin/vendor', icon: <FaStore className="w-5 h-5" /> },
  ];

  return (
    <nav className="bg-white text-gray-900 shadow-lg border-b border-orange-100">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <Link to="/admin/dashboard" className="flex items-center space-x-2">
            <img src="/logo.png" alt="Namma Bites" className="h-8 w-auto" />
            <span className="text-xl font-bold text-orange-600">Admin Portal</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="flex items-center space-x-2 text-gray-700 hover:text-orange-600 transition-colors duration-200"
              >
                {link.icon}
                <span>{link.name}</span>
              </Link>
            ))}
          </div>

          {/* Settings and Profile Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Settings Dropdown */}
            <div className="relative" ref={settingsRef}>
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className="flex items-center space-x-2 text-gray-700 hover:text-orange-600 transition-colors duration-200"
              >
                <FaCog className="w-5 h-5" />
                <span>Settings</span>
              </button>

              {/* Settings Dropdown Menu */}
              {isSettingsOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <FaFont className="w-4 h-4 text-orange-600" />
                      <span className="text-sm font-semibold text-gray-700">Font Size</span>
                    </div>
                    <div className="space-y-2">
                      <div className="text-xs text-gray-600 mb-2">
                        Current: {getCurrentFontSize().label}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={decreaseFontSize}
                          className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
                        >
                          A-
                        </button>
                        <button
                          onClick={resetFontSize}
                          className="flex-1 px-3 py-2 bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 transition-colors text-sm font-medium"
                        >
                          Reset
                        </button>
                        <button
                          onClick={increaseFontSize}
                          className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
                        >
                          A+
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Menu */}
            <div className="relative">
              <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-2 text-gray-700 hover:text-orange-600 transition-colors duration-200"
            >
              <FaUserCircle className="w-5 h-5" />
              <span>Profile</span>
            </button>

            {/* Profile Dropdown */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50 border border-orange-100">
                <Link
                  to="/admin/profile"
                  className="block px-4 py-2 text-gray-800 hover:bg-orange-50"
                >
                  View Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-orange-50 flex items-center space-x-2"
                >
                  <FaSignOutAlt />
                  <span>Logout</span>
                </button>
              </div>
            )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-700 hover:text-orange-600"
          >
            {isMenuOpen ? <FaTimes className="w-6 h-6" /> : <FaBars className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4 bg-white border-t border-orange-100">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="flex items-center space-x-2 text-gray-700 hover:text-orange-600 transition-colors duration-200 px-4 py-2 text-base"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.icon}
                <span>{link.name}</span>
              </Link>
            ))}
            {/* Settings section for mobile */}
            <div className="border-t border-orange-100 pt-3 mt-3">
              <div className="px-4 py-2">
                <div className="flex items-center gap-2 mb-3">
                  <FaCog className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-semibold text-gray-700">Settings</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <FaFont className="w-3 h-3 text-orange-600" />
                    <span className="text-xs text-gray-600">Font Size: {getCurrentFontSize().label}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={decreaseFontSize}
                      className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                      A-
                    </button>
                    <button
                      onClick={resetFontSize}
                      className="flex-1 px-3 py-2 bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 transition-colors text-sm font-medium"
                    >
                      Reset
                    </button>
                    <button
                      onClick={increaseFontSize}
                      className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                      A+
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-orange-100 pt-4 mt-4">
              <Link
                to="/admin/profile"
                className="flex items-center space-x-2 text-gray-700 hover:text-orange-600 transition-colors duration-200 px-4 py-2 text-base"
                onClick={() => setIsMenuOpen(false)}
              >
                <FaUserCircle className="w-5 h-5" />
                <span>Profile</span>
              </Link>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center space-x-2 text-red-500 hover:text-red-400 transition-colors duration-200 px-4 py-2 text-base"
              >
                <FaSignOutAlt className="w-5 h-5" />
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