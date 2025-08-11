import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaUtensils, FaClipboardList, FaUserCircle, FaSignOutAlt, FaMoneyCheckAlt, FaQrcode, FaCog, FaFont } from 'react-icons/fa';
import { useFontSize } from '../../context/FontSizeContext';

const vendorLinks = [
  { name: 'Home', path: '/vendor/dashboard', icon: <FaHome className="w-5 h-5" /> },
  { name: 'Menu Entry', path: '/vendor/menu', icon: <FaUtensils className="w-5 h-5" /> },
  { name: 'Orders', path: '/vendor/orders', icon: <FaClipboardList className="w-5 h-5" /> },
  { name: 'Subscription', path: '/vendor/subscription', icon: <FaMoneyCheckAlt className="w-5 h-5" /> },
  { name: 'QR Scanner', path: '/vendor/qr-scanner', icon: <FaQrcode className="w-5 h-5" /> },
  { name: 'Profile', path: '/vendor/profile', icon: <FaUserCircle className="w-5 h-5" /> },
];

const VendorNavbar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
    localStorage.removeItem('vendorToken');
    navigate('/vendor/login');
  };

  return (
    <nav className="bg-white text-black shadow-lg">
      <div className="container mx-auto px-4 flex justify-between items-center h-16">
        <div className="flex items-center space-x-2">
          <img src="/logo.png" alt="Namma Bites" className="h-8 w-auto" />
          <span className="text-xl font-bold">Vendor Portal</span>
        </div>
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          {vendorLinks.map(link => (
            <button
              key={link.name}
              onClick={() => navigate(link.path)}
              className="flex items-center space-x-2 text-black hover:text-orange-600 transition-colors duration-200"
            >
              {link.icon}
              <span>{link.name}</span>
            </button>
          ))}
          {/* Settings Dropdown */}
          <div className="relative" ref={settingsRef}>
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="flex items-center space-x-2 text-black hover:text-green-600 transition-colors duration-200"
            >
              <FaCog className="w-5 h-5" />
              <span>Settings</span>
            </button>

            {/* Settings Dropdown Menu */}
            {isSettingsOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <FaFont className="w-4 h-4 text-green-600" />
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
                        className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors text-sm font-medium"
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

          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-red-400 hover:text-red-600 transition-colors duration-200 ml-4"
          >
            <FaSignOutAlt className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden text-gray-300 hover:text-white"
        >
          {isMenuOpen ? <FaSignOutAlt className="w-6 h-6" /> : <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>}
        </button>
      </div>
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden py-4 space-y-4 bg-white">
          {vendorLinks.map(link => (
            <button
              key={link.name}
              onClick={() => { setIsMenuOpen(false); navigate(link.path); }}
              className="flex items-center space-x-2 text-black hover:text-orange-600 transition-colors duration-200 px-4 py-2 text-base w-full text-left"
            >
              {link.icon}
              <span>{link.name}</span>
            </button>
          ))}
          {/* Settings section for mobile */}
          <div className="border-t border-gray-200 pt-3 mt-3">
            <div className="px-4 py-2">
              <div className="flex items-center gap-2 mb-3">
                <FaCog className="w-4 h-4 text-green-600" />
                <span className="text-sm font-semibold text-gray-700">Settings</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <FaFont className="w-3 h-3 text-green-600" />
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
                    className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors text-sm font-medium"
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

          <button
            onClick={() => { setIsMenuOpen(false); handleLogout(); }}
            className="w-full flex items-center space-x-2 text-red-400 hover:text-red-600 transition-colors duration-200 px-4 py-2 text-base"
          >
            <FaSignOutAlt className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </nav>
  );
};

export default VendorNavbar; 