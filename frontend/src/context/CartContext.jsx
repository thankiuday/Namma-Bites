import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getCart as apiGetCart, addOrUpdateCartItem as apiAddOrUpdateCartItem, updateCartItemQuantity as apiUpdateCartItemQuantity, removeCartItem as apiRemoveCartItem, clearCart as apiClearCart } from '../api/userApi';
import { toast } from 'react-toastify';

const CartContext = createContext();

// Helper to flatten cart items
const flattenCart = (cartArr) =>
  (cartArr || []).map(({ item, quantity }) => ({ ...(item || {}), quantity }));

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch cart from backend
  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiGetCart();
      const flattenedCart = flattenCart(res.data.cart);
      setCart(flattenedCart);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setCart([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const addToCart = async (item, quantity = 1) => {
    // Enforce single-vendor cart
    if (cart.length > 0) {
      const currentVendor = cart[0].vendor?._id || cart[0].vendor;
      const newVendor = item.vendor?._id || item.vendor;
      if (currentVendor && newVendor && currentVendor !== newVendor) {
        const currentVendorName = cart[0].vendor?.name || 'Current Vendor';
        const newVendorName = item.vendor?.name || 'New Vendor';
        
        toast.warn(
          <div className="flex flex-col gap-2">
            <div className="font-semibold">Different Vendor Detected!</div>
            <div className="text-sm">
              Your cart contains items from <span className="font-medium">{currentVendorName}</span>.
              <br />
              This item is from <span className="font-medium">{newVendorName}</span>.
            </div>
            <div className="text-sm text-gray-600">
              You can only order from one vendor at a time.
            </div>
            <button 
              onClick={() => {
                clearCart();
                toast.dismiss();
              }}
              className="mt-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
            >
              Clear Cart & Add This Item
            </button>
          </div>,
          {
            position: 'top-center',
            autoClose: false,
            closeOnClick: false,
            draggable: false,
            closeButton: true,
            toastId: 'vendor-mismatch',
          }
        );
        return false;
      }
    }
    try {
      const res = await apiAddOrUpdateCartItem(item._id, quantity);
      setCart(flattenCart(res.data.cart));
      toast.success('Added to cart!', {
        position: 'top-right',
        autoClose: 1500,
      });
      return true;
    } catch (err) {
      console.error('Error adding to cart:', err);
      throw err; // Let the component handle the error
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const res = await apiUpdateCartItemQuantity(itemId, quantity);
      setCart(flattenCart(res.data.cart));
    } catch (err) {
      console.error('Error updating cart quantity:', err);
      throw err; // Let the component handle the error
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const res = await apiRemoveCartItem(itemId);
      setCart(flattenCart(res.data.cart));
    } catch (err) {
      console.error('Error removing from cart:', err);
      throw err; // Let the component handle the error
    }
  };

  const clearCart = async () => {
    try {
      console.log('Clearing cart...');
      const res = await apiClearCart();
      console.log('Clear cart response:', res.data);
      setCart(flattenCart(res.data.cart));
      console.log('Cart cleared successfully');
    } catch (err) {
      console.error('Error clearing cart:', err);
      console.error('Error details:', {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        config: err.config
      });
      throw err; // Let the component handle the error
    }
  };

  const value = { 
    cart, 
    addToCart, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    loading,
    fetchCart 
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext); 