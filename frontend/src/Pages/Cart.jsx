import React, { useEffect, useCallback, useState } from 'react';
import { FaTrash, FaMinus, FaPlus } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, clearCart, loading, fetchCart } = useCart();
  const { user, handleAuthError } = useAuth();
  const [clearing, setClearing] = useState(false);

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
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Your Cart</h1>
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">Loading cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Your Cart</h1>
      {cart.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">Your cart is empty</p>
        </div>
      ) : (
        <>
          {/* Cart Items */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            {cart.map((item) => (
              <div key={item._id} className="flex items-center gap-4 py-4 border-b last:border-b-0">
                <img
                  src={item.image ? (item.image.startsWith('http') ? item.image : `http://localhost:5000${item.image}`) : '/default-food.png'}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-md"
                />
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                  <p className="text-orange-600 font-semibold">₹{item.price}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-600 hover:text-orange-600" onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))}>
                    <FaMinus />
                  </button>
                  <span className="w-8 text-center text-black">{item.quantity}</span>
                  <button className="p-2 text-gray-600 hover:text-orange-600" onClick={() => updateQuantity(item._id, item.quantity + 1)}>
                    <FaPlus />
                  </button>
                </div>
                <button className="p-2 text-red-600 hover:text-red-700" onClick={() => removeFromCart(item._id)}>
                  <FaTrash />
                </button>
              </div>
            ))}
            <button 
              className="mt-4 text-sm text-red-500 hover:underline disabled:opacity-50 disabled:cursor-not-allowed" 
              onClick={handleClearCart}
              disabled={clearing}
            >
              {clearing ? 'Clearing...' : 'Clear Cart'}
            </button>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span>₹{deliveryFee}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-800 pt-2 border-t">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
            </div>
            <button className="w-full bg-orange-600 text-white py-3 px-4 rounded-md hover:bg-orange-700 transition-colors">
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart; 