import { Link } from 'react-router-dom';
import { FaHome, FaInfoCircle, FaEnvelope, FaPhone, FaMapMarkerAlt, FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-white shadow-lg mt-auto border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-black">Namma Bites</h3>
            <p className="text-gray-600 text-sm">
              Delivering delicious food right to your doorstep. Your favorite local flavors, now just a click away.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-black">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-orange-600 text-sm flex items-center gap-2">
                  <FaHome className="text-orange-600" /> Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-600 hover:text-orange-600 text-sm flex items-center gap-2">
                  <FaInfoCircle className="text-orange-600" /> About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 hover:text-orange-600 text-sm flex items-center gap-2">
                  <FaEnvelope className="text-orange-600" /> Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-black">Contact Us</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <FaEnvelope className="text-orange-600" /> info@nammabites.com
              </li>
              <li className="flex items-center gap-2">
                <FaPhone className="text-orange-600" /> +91 1234567890
              </li>
              <li className="flex items-center gap-2">
                <FaMapMarkerAlt className="text-orange-600" /> Bangalore, Karnataka
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-black">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-600 hover:text-orange-600">
                <FaFacebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-600 hover:text-orange-600">
                <FaInstagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-600 hover:text-orange-600">
                <FaTwitter className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200">
          <p className="text-center text-orange-600 text-xs sm:text-sm">
            © {new Date().getFullYear()} Namma Bites. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 