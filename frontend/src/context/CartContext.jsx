import React, { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const stored = localStorage.getItem('cart');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(i => i._id === item._id);
      if (existing) {
        return prev.map(i => i._id === item._id ? { ...i, quantity: i.quantity + quantity } : i);
      } else {
        return [...prev, { ...item, quantity }];
      }
    });
  };

  const updateQuantity = (itemId, quantity) => {
    setCart(prev => prev.map(i => i._id === itemId ? { ...i, quantity } : i));
  };

  const removeFromCart = (itemId) => {
    setCart(prev => prev.filter(i => i._id !== itemId));
  };

  const clearCart = () => setCart([]);

  const value = { cart, addToCart, updateQuantity, removeFromCart, clearCart };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext); 