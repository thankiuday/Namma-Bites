import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaUtensils, FaClipboardList, FaUserCircle, FaSignOutAlt, FaMoneyCheckAlt } from 'react-icons/fa';

const vendorLinks = [
  { name: 'Home', path: '/vendor/dashboard', icon: <FaHome className="w-5 h-5" /> },
  { name: 'Menu Entry', path: '/vendor/menu', icon: <FaUtensils className="w-5 h-5" /> },
  { name: 'Orders', path: '/vendor/orders', icon: <FaClipboardList className="w-5 h-5" /> },
  { name: 'Subscription', path: '/vendor/subscription', icon: <FaMoneyCheckAlt className="w-5 h-5" /> },
  { name: 'Profile', path: '/vendor/profile', icon: <FaUserCircle className="w-5 h-5" /> },
];

const VendorDashboard = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('vendorToken');
    navigate('/vendor/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-gray-900 text-white shadow-lg">
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
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-200"
              >
                {link.icon}
                <span>{link.name}</span>
              </button>
            ))}
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
          <div className="md:hidden py-4 space-y-4 bg-gray-900">
            {vendorLinks.map(link => (
              <button
                key={link.name}
                onClick={() => { setIsMenuOpen(false); navigate(link.path); }}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-200 px-4 py-2 text-base w-full text-left"
              >
                {link.icon}
                <span>{link.name}</span>
              </button>
            ))}
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
      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Vendor Dashboard</h1>
          <p className="text-gray-600 mb-6">Welcome to your vendor dashboard. Use the navigation above to manage your menu, orders, subscription, and profile.</p>
          {/* You can add vendor-specific stats or quick actions here */}
        </div>
      </main>
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-4 text-center">
        &copy; {new Date().getFullYear()} Namma Bites. All rights reserved.
      </footer>
    </div>
  );
};

export default VendorDashboard; 