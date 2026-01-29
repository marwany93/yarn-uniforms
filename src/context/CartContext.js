'use client';

import { createContext, useContext, useState, useEffect, useRef } from 'react';

const CartContext = createContext({
  cart: [],
  addToCart: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  getCartItemCount: () => 0, // Placeholder
  cartItems: []
});

const STORAGE_KEY = 'yarn_b2b_cart';

export function CartProvider({ children }) {
  // 1. Initialize Empty (Server-Safe)
  const [cart, setCart] = useState([]);
  const isLoaded = useRef(false);

  // 2. Load Data (Run ONCE on Mount)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setCart(parsed);
        } catch (e) {
          console.error('Error parsing cart', e);
        }
      }
      isLoaded.current = true;
    }
  }, []);

  // 3. Save Data (Run on Update, BUT ONLY after loading)
  useEffect(() => {
    if (isLoaded.current) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    }
  }, [cart]);

  // Actions
  const addToCart = (item) => {
    setCart((prev) => [...prev, item]);
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  // ✅ THIS WAS MISSING: Helper to count total items
  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + (item.quantity || 0), 0);
  };

  return (
    <CartContext.Provider value={{ 
      cart, 
      cartItems: cart, 
      addToCart, 
      removeFromCart, 
      clearCart,
      getCartItemCount // <--- Added back here
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);