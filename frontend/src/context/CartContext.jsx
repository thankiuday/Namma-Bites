import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getCart as apiGetCart, addOrUpdateCartItem as apiAddOrUpdateCartItem, updateCartItemQuantity as apiUpdateCartItemQuantity, removeCartItem as apiRemoveCartItem, clearCart as apiClearCart } from '../api/userApi';

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
      setCart(flattenCart(res.data.cart));
    } catch (err) {
      console.error('Error fetching cart:', err);
      setCart([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const addToCart = async (item, quantity = 1) => {
    try {
      const res = await apiAddOrUpdateCartItem(item._id, quantity);
      setCart(flattenCart(res.data.cart));
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