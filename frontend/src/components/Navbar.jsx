import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaUser, FaShoppingCart, FaClipboardList, FaCreditCard } from 'react-icons/fa';
import logo from '../../public/logo.png';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white shadow-lg ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <img
                className="h-15 w-auto"
                src={logo}
                alt="Namma Bites"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4 text-lg">
            <Link to="/" className="text-black hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2">
              <FaHome className="text-lg" /> Home
            </Link>
            <Link to="/user" className="text-black hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2">
              <FaUser className="text-lg" /> User
            </Link>
            <Link to="/subscription" className="text-black hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2">
              <FaCreditCard className="text-lg" /> Subscription
            </Link>
            <Link to="/cart" className="text-black hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2">
              <FaShoppingCart className="text-lg" /> Cart
            </Link>
            <Link to="/orders" className="text-black hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2">
              <FaClipboardList className="text-lg" /> Orders
            </Link>
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
          <Link
            to="/"
            className="block px-3 py-2 rounded-md text-base font-medium text-black hover:text-orange-600 hover:bg-gray-800 flex items-center gap-2"
          >
            <FaHome className="text-lg" /> Home
          </Link>
          <Link
            to="/user"
            className="block px-3 py-2 rounded-md text-base font-medium text-black hover:text-orange-600 hover:bg-gray-800 flex items-center gap-2"
          >
            <FaUser className="text-lg" /> User
          </Link>
          <Link
            to="/subscription"
            className="block px-3 py-2 rounded-md text-base font-medium text-black hover:text-orange-600 hover:bg-gray-800 flex items-center gap-2"
          >
            <FaCreditCard className="text-lg" /> Subscription
          </Link>
          <Link
            to="/cart"
            className="block px-3 py-2 rounded-md text-base font-medium text-black hover:text-orange-600 hover:bg-gray-800 flex items-center gap-2"
          >
            <FaShoppingCart className="text-lg" /> Cart
          </Link>
          <Link
            to="/orders"
            className="block px-3 py-2 rounded-md text-base font-medium text-black hover:text-orange-600 hover:bg-gray-800 flex items-center gap-2"
          >
            <FaClipboardList className="text-lg" /> Orders
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 