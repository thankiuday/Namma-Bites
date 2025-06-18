import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaHome, FaUsers, FaStore, FaUserPlus } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import logo from '../../public/logo.png';

const defaultStudentLinks = [
  { to: '/', label: 'Home', icon: 'home' },
  { to: '/user', label: 'User', icon: 'user' },
  { to: '/subscription', label: 'Subscription', icon: 'credit-card' },
  { to: '/cart', label: 'Cart', icon: 'shopping-cart' },
  { to: '/orders', label: 'Orders', icon: 'clipboard-list' },
];

const iconMap = {
  'home': (cls) => <FaHome className={cls} />,
  'users': (cls) => <FaUsers className={cls} />,
  'store': (cls) => <FaStore className={cls} />,
  'user-plus': (cls) => <FaUserPlus className={cls} />,
  'user': (cls) => <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A9 9 0 1112 21a9 9 0 01-6.879-3.196z" /></svg>,
  'credit-card': (cls) => <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2 7h20M2 11h20m-2 4h2a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v6a2 2 0 002 2h2m4 0h4" /></svg>,
  'shopping-cart': (cls) => <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A1 1 0 007 17h10a1 1 0 00.95-.68L21 13M7 13V6a1 1 0 011-1h5a1 1 0 011 1v7" /></svg>,
  'clipboard-list': (cls) => <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m-6 4h6a2 2 0 002-2V7a2 2 0 00-2-2h-1V4a2 2 0 10-4 0v1H7a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
};

const Navbar = ({ links = defaultStudentLinks, isAdmin = false }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    try {
      if (isAdmin) {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
      } else {
        await logout();
        navigate('/login');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Check if user is authenticated (either as admin or regular user)
  const isAuthenticated = isAdmin ? localStorage.getItem('adminToken') : user;

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to={isAdmin ? "/admin/dashboard" : "/"} className="flex-shrink-0 flex items-center">
              <img
                className="h-15 w-auto"
                src={logo}
                alt="Namma Bites"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4 text-lg">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-black hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2"
              >
                {iconMap[link.icon]?.('text-lg')}
                {link.label}
              </Link>
            ))}
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="text-black hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2"
              >
                <FaSignOutAlt className="text-lg" /> Logout
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-black hover:text-orange-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {/* Hamburger icon */}
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              {/* Close icon */}
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="block px-3 py-2 rounded-md text-base font-medium text-black hover:text-orange-600 hover:bg-gray-800 flex items-center gap-2"
            >
              {iconMap[link.icon]?.('text-lg')}
              {link.label}
            </Link>
          ))}
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-black hover:text-orange-600 hover:bg-gray-800 flex items-center gap-2"
            >
              <FaSignOutAlt className="text-lg" /> Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 