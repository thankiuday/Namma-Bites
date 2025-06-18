import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaStore, FaUsers, FaUserCircle, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <FaHome /> },
    { name: 'Create Vendor', path: '/admin/create-vendor', icon: <FaStore /> },
    { name: 'All Users', path: '/admin/users', icon: <FaUsers /> },
    { name: 'All Vendors', path: '/admin/vendors', icon: <FaStore /> },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Admin Navbar */}
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

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Namma Bites</h3>
              <p className="text-gray-400">
                Your trusted food delivery platform, connecting delicious meals with hungry customers.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/admin/dashboard" className="text-gray-400 hover:text-white transition-colors duration-200">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/admin/users" className="text-gray-400 hover:text-white transition-colors duration-200">
                    Users
                  </Link>
                </li>
                <li>
                  <Link to="/admin/vendors" className="text-gray-400 hover:text-white transition-colors duration-200">
                    Vendors
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/admin/help" className="text-gray-400 hover:text-white transition-colors duration-200">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link to="/admin/contact" className="text-gray-400 hover:text-white transition-colors duration-200">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/admin/privacy" className="text-gray-400 hover:text-white transition-colors duration-200">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/admin/terms" className="text-gray-400 hover:text-white transition-colors duration-200">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Namma Bites. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AdminLayout; 