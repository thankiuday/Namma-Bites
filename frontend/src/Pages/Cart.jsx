import React, { useEffect, useCallback, useState } from 'react';
import { FaTrash, FaMinus, FaPlus, FaArrowLeft } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getMenuItemImageUrl } from '../utils/imageUtils';
import LazyImage from '../components/LazyImage';
import Joyride from 'react-joyride';
import { motion } from 'framer-motion';


const Cart = () => {
  const { cart, updateQuantity, removeFromCart, clearCart, loading, fetchCart } = useCart();
  const { user, handleAuthError } = useAuth();
  const [clearing, setClearing] = useState(false);
  const navigate = useNavigate();
  const [runTour, setRunTour] = useState(false);

  React.useEffect(() => {
    if (!localStorage.getItem('onboardingCartTourCompleted')) {
      setRunTour(true);
    }
  }, []);

  const handleTourCallback = (data) => {
    if (data.status === 'finished' || data.status === 'skipped') {
      setRunTour(false);
      localStorage.setItem('onboardingCartTourCompleted', 'true');
    }
  };

  const tourSteps = [
    {
      target: '.onboard-cart-items',
      content: 'Here are the items you’ve added to your cart. Review them before checkout!',
      disableBeacon: true,
    },
    {
      target: '.onboard-cart-qty',
      content: 'Adjust the quantity of each item as needed.',
    },
    {
      target: '.onboard-cart-checkout',
      content: 'Ready to order? Click here to proceed to checkout!',
    },
  ];

  const handleFetchCart = useCallback(() => {
    if (user) {
      fetchCart();
    }
  }, [user, fetchCart]);

  useEffect(() => {
    handleFetchCart();
  }, [handleFetchCart]);

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart? This action cannot be undone.')) {
      try {
        setClearing(true);
        
        // Check if user is still authenticated
        if (!user) {
          alert('You are not logged in. Please log in again.');
          return;
        }
        
        console.log('Attempting to clear cart...');
        
        // Debug: Check cookies before request
        console.log('Cookies before request:', document.cookie);
        
        await clearCart();
        console.log('Cart cleared successfully');
      } catch (error) {
        console.error('Error clearing cart:', error);
        
        // Check if it's an authentication error
        if (error.response?.status === 401) {
          console.log('Authentication error detected, attempting token refresh...');
          try {
            // Try to handle authentication error (token refresh)
            const authHandled = await handleAuthError(error);
            console.log('Auth error handled:', authHandled);
            if (authHandled) {
              // Retry the clear cart operation
              console.log('Retrying clear cart after token refresh...');
              
              // Debug: Check cookies after token refresh
              console.log('Cookies after token refresh:', document.cookie);
              
              await clearCart();
              console.log('Cart cleared successfully after retry');
            } else {
              console.log('Token refresh failed, redirecting to login');
              alert('Your session has expired. Please log in again.');
            }
          } catch (authError) {
            console.error('Error during auth error handling:', authError);
            alert('Your session has expired. Please log in again.');
          }
        } else {
          alert('Failed to clear cart. Please try again.');
        }
      } finally {
        setClearing(false);
      }
    }
  };

  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const deliveryFee = cart.length > 0 ? 0 : 0;
  const total = subtotal + deliveryFee;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8">Your Cart</h1>
        <div className="text-center py-8 sm:py-12">
          <p className="text-gray-600 text-base sm:text-lg">Loading cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-4 px-4 py-2 bg-white text-orange-700 rounded-lg hover:bg-orange-50 transition-colors duration-200 shadow-sm border border-orange-200"
      >
        <FaArrowLeft className="w-4 h-4" />
        Back
      </button>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8">Your Cart</h1>
      <Joyride
        steps={tourSteps}
        run={runTour}
        continuous
        showSkipButton
        showProgress
        styles={{ options: { zIndex: 10000, primaryColor: '#ea580c' } }}
        callback={handleTourCallback}
      />
      {cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 sm:py-12">
         <motion.svg
  width="120"
  height="120"
  viewBox="0 0 120 120"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  className="mb-4"
  initial={{ y: 0, opacity: 0 }}
  animate={{ y: [0, -10, 0], opacity: 1 }}
  transition={{
    repeat: Infinity,
    duration: 4,
    ease: 'easeInOut',
  }}
>
  <rect x="20" y="50" width="80" height="40" rx="12" fill="#FFEDD5" />
  <rect x="35" y="65" width="50" height="15" rx="7" fill="#FDBA74" />
  <rect x="50" y="80" width="20" height="5" rx="2.5" fill="#F59E42" />
  <circle cx="60" cy="60" r="8" fill="#FDBA74" />
  <ellipse cx="60" cy="105" rx="30" ry="5" fill="#FDE68A" />
</motion.svg>


          <p className="text-gray-600 text-base sm:text-lg font-semibold mb-2">Your cart is empty</p>
          <p className="text-gray-400 text-sm">Looks like you haven't added anything yet. Explore our menu and add your favorite dishes!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-4 sm:p-6">
            {cart.map((item) => (
              <div key={item._id} className="flex flex-row items-center gap-3 sm:gap-4 py-4 border-b last:border-b-0 flex-wrap">
                <LazyImage
                  src={getMenuItemImageUrl(item.image)}
                  alt={item.name}
                  className="w-16 h-16 sm:w-20 sm:h-20"
                  imgClassName="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-md"
                />
                <div className="flex-grow min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 truncate">{item.name}</h3>
                  <p className="text-orange-600 font-semibold text-sm sm:text-base"> ₹{item.price}</p>
                </div>
                <div className="flex flex-col items-end gap-2 ml-auto">
                  <div className="flex items-center gap-2">
                    <button 
                      className="p-1 sm:p-2 text-gray-600 hover:text-orange-600 rounded-full hover:bg-gray-100" 
                      onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))}
                    >
                      <FaMinus className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                    <span className="w-6 sm:w-8 text-center text-black text-sm sm:text-base font-medium">{item.quantity}</span>
                    <button 
                      className="p-1 sm:p-2 text-gray-600 hover:text-orange-600 rounded-full hover:bg-gray-100" 
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    >
                      <FaPlus className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                    <button 
                      className="p-1 sm:p-2 text-red-600 hover:text-red-700 rounded-full hover:bg-red-50" 
                      onClick={() => removeFromCart(item._id)}
                    >
                      <FaTrash className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                  <button 
                    className="mt-2 text-xs sm:text-sm text-red-500 hover:underline disabled:opacity-50 disabled:cursor-not-allowed" 
                    onClick={handleClearCart}
                    disabled={clearing}
                  >
                    {clearing ? 'Clearing...' : 'Clear Cart'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 h-fit">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Order Summary</h2>
            <div className="space-y-3 sm:space-y-2 mb-4">
              <div className="flex justify-between text-sm sm:text-base text-gray-600">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-sm sm:text-base text-gray-600">
                <span>Delivery Fee</span>
                <span>₹{deliveryFee}</span>
              </div>
              <div className="flex justify-between text-base sm:text-lg font-bold text-gray-800 pt-2 border-t">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
            </div>
            <button
              className="w-full bg-orange-600 text-white py-2 sm:py-3 px-4 rounded-md hover:bg-orange-700 transition-colors text-sm sm:text-base font-medium disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={() => navigate('/checkout')}
              disabled={cart.length === 0}
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart; 